/**
 * End-to-end UI smoke test.
 * 1. Converts the production bundle (ESM) to an IIFE with esbuild.
 * 2. Boots it in jsdom (runScripts) against the REAL backend (port 5000)
 *    via an XMLHttpRequest shim backed by node fetch.
 * 3. Asserts: login page renders -> login succeeds -> dashboard renders with
 *    real data, status pill present, demo banner visible, real metrics shown.
 */
const path = require('path');
const { JSDOM } = require(path.join(__dirname, '../client/node_modules/jsdom'));
const { execSync } = require('child_process');
const fs = require('fs');

const API = 'http://127.0.0.1:5000';
const dist = path.resolve(__dirname, '../client/dist');
const assets = fs.readdirSync(path.join(dist, 'assets'));
const jsFile = assets.find(f => f.endsWith('.js'));
if (!jsFile) { console.error('No bundle in client/dist — run: npm run build --prefix client'); process.exit(1); }

execSync(`npx --yes esbuild "${path.join(dist, 'assets', jsFile)}" --format=iife --outfile=/tmp/app.iife.js --log-level=error`);
const bundle = fs.readFileSync('/tmp/app.iife.js', 'utf8');

// Minimal XHR shim over node fetch (axios uses XHR in browser envs)
const XHRShim = `
window.XMLHttpRequest = class {
  constructor() { this.headers = {}; this.readyState = 0; this.status = 0; this.responseText = ''; this.onload = null; this.onerror = null; }
  open(method, url) { this.method = method; this.url = url.startsWith('http') ? url : '__API__' + url; }
  setRequestHeader(k, v) { this.headers[k] = v; }
  send(body) {
    const self = this;
    fetch(this.url, { method: this.method, headers: this.headers, body: body || undefined })
      .then(async (res) => {
        self.status = res.status;
        self.responseText = await res.text();
        self.response = self.responseText;
        self.readyState = 4;
        self.onload && self.onload();
      })
      .catch((err) => { self.onerror && self.onerror(err); });
  }
};
window.matchMedia = window.matchMedia || function(){ return { matches:false, media:'', addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; } }; };
window.URL.createObjectURL = function(){ return 'blob:mock'; };
window.scrollTo = function(){};
`;

const dom = new JSDOM(
  `<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`,
  { url: 'http://localhost:3000/', runScripts: 'dangerously', pretendToBeVisual: true }
);
const { window } = dom;

// jsdom has no fetch — bridge to Node's built-in fetch, resolving relative
// URLs (as a real browser would resolve them against the page origin).
window.fetch = (url, opts) => {
  const abs = /^https?:/.test(url) ? url : API + url;
  return fetch(abs, opts);
};

const errors = [];
window.addEventListener('error', (e) => errors.push('window.onerror: ' + e.message));

// Inject shim first (defines XHR etc. before the app bundle runs)
window.eval(XHRShim.replace(/__API__/g, API));

// Now run the app bundle as a real script in the DOM
const script = window.document.createElement('script');
script.textContent = bundle;
window.document.body.appendChild(script);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const bodyText = () => window.document.body.textContent || '';
const results = {};

(async () => {
  await sleep(2000);
  results.loginPageRendered = bodyText().includes('VMH GROUP') && /sign in/i.test(bodyText());

  const userInput = window.document.querySelector('input[type="text"]');
  const passInput = window.document.querySelector('input[type="password"]');
  const form = window.document.querySelector('form');
  results.loginFormFound = { userInput: !!userInput, passInput: !!passInput, form: !!form };
  if (userInput && passInput && form) {
    const setVal = (el, v) => {
      const proto = Object.getPrototypeOf(el);
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      desc.set.call(el, v);
      el.dispatchEvent(new window.Event('input', { bubbles: true }));
    };
    setVal(userInput, 'vmhgroup');
    setVal(passInput, 'Jelly');
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  }

  let dashboardSeen = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const t = bodyText();
    if (t.includes('Top Yielding Survey Allocations')) { dashboardSeen = true; break; }
  }
  // --- Walk every sidebar page; assert each renders without runtime errors ---
  const tabLabels = ['Live Surveys', 'Top Picks', 'Demand Clients', 'Supply Vendors', 'Campaign Projects', 'Fraud Security', 'Reconciliation', 'Reference Catalogs', 'User Roles (RBAC)', 'API Sandbox', 'Analytics'];
  const tabResults = [];
  for (const label of tabLabels) {
    const items = [...window.document.querySelectorAll('.submenu-item')];
    const target = items.find(el => el.textContent.trim() === label);
    if (!target) { tabResults.push({ tab: label, found: false }); continue; }
    const before = errors.length;
    target.click();
    await sleep(1800);
    const crashed = errors.length > before;
    const text = bodyText();
    tabResults.push({
      tab: label,
      found: true,
      crashed,
      hasContent: text.length > 800,
      newErrors: crashed ? errors.slice(before, before + 2) : [],
    });
  }

  const t = bodyText();
  const storedToken = window.localStorage.getItem('smr_auth_token') || '';
  // 'eyJ...' prefix = real JWT minted by the backend login endpoint (proves the
  // login went through the API, not the offline fallback string).
  results.loginViaBackendJwt = storedToken.startsWith('eyJ');
  results.dashboardRendered = dashboardSeen;
  results.statusPillPresent = t.includes('DEMO DATA') || t.includes('LIVE DATA') || t.includes('CHECKING');
  results.demoBannerPresent = t.includes('Demo data mode');
  results.realMetricPresent = /completes open/i.test(t);
  results.channelMixPresent = t.includes('Channel Mix');
  results.countryTablePresent = t.includes('Country Distribution');
  results.topSurveyRowPresent = t.includes('Top Yielding Survey Allocations');
  results.tabWalk = tabResults;
  results.tabsRendered = tabResults.filter(x => x.found && !x.crashed && x.hasContent).length;
  results.tabsTotal = tabResults.length;
  results.runtimeErrors = errors.slice(0, 6);

  console.log(JSON.stringify(results, null, 2));
  const ok = results.loginPageRendered && results.loginViaBackendJwt && results.dashboardRendered &&
    results.statusPillPresent && results.demoBannerPresent &&
    results.realMetricPresent && results.channelMixPresent &&
    results.countryTablePresent &&
    results.tabsRendered === results.tabsTotal &&
    results.runtimeErrors.length === 0;
  console.log(ok ? '\n✅ E2E SMOKE TEST PASSED' : '\n❌ E2E SMOKE TEST FAILED');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(1); });
