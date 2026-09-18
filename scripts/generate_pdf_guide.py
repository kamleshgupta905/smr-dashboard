import os
import sys
from playwright.sync_api import sync_playwright

html_content = """<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap');
  
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-center {
      content: "Page " counter(page);
      font-size: 9pt;
      color: #8997bd;
    }
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 10pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  h1, h2, h3, h4 {
    font-family: 'Poppins', sans-serif;
    color: #0c213a;
    margin-top: 0;
  }

  /* Cover Page Styling */
  .cover-page {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justifyContent: space-between;
    min-height: 90vh;
    padding: 30px 10px;
    border-bottom: 4px solid #1761fd;
  }

  .cover-header {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .logo-box {
    background: #0c213a;
    color: #ffffff;
    padding: 10px 18px;
    border-radius: 6px;
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: 16pt;
    letter-spacing: -0.5px;
  }

  .cover-title-section {
    margin-top: 80px;
  }

  .badge-tag {
    display: inline-block;
    background: #eef4ff;
    color: #1761fd;
    font-weight: 700;
    font-size: 9pt;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 18px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid #c7d8fe;
  }

  .cover-title {
    font-size: 26pt;
    line-height: 1.25;
    font-weight: 800;
    color: #0c213a;
    margin-bottom: 14px;
  }

  .cover-subtitle {
    font-size: 12pt;
    color: #475569;
    max-width: 580px;
    margin-bottom: 30px;
    line-height: 1.6;
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    margin-top: 40px;
  }

  .meta-item {
    font-size: 9pt;
  }

  .meta-label {
    color: #64748b;
    font-weight: 500;
    display: block;
    margin-bottom: 4px;
    text-transform: uppercase;
    font-size: 7.5pt;
    letter-spacing: 0.5px;
  }

  .meta-value {
    color: #0f172a;
    font-weight: 700;
    font-size: 10pt;
  }

  .section-title {
    font-size: 15pt;
    font-weight: 700;
    color: #0c213a;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
    margin-top: 24px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 18px;
    background: #1761fd;
    border-radius: 2px;
  }

  .page-break {
    page-break-before: always;
  }

  /* Cards & Callouts */
  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 14px;
  }

  .card-highlight {
    background: #f8fafd;
    border-left: 4px solid #1761fd;
  }

  .card-success {
    background: #f0fdf4;
    border-left: 4px solid #22c55e;
  }

  .card-warning {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 8.5pt;
  }

  th {
    background: #0c213a;
    color: #ffffff;
    text-align: left;
    padding: 8px 10px;
    font-weight: 600;
    font-size: 8pt;
  }

  td {
    padding: 7px 10px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  /* Step Badge */
  .step-row {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
    align-items: flex-start;
  }

  .step-num {
    background: #1761fd;
    color: #ffffff;
    font-weight: 700;
    font-size: 9pt;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .step-content {
    flex: 1;
  }

  .step-title {
    font-weight: 700;
    color: #0c213a;
    font-size: 10pt;
    margin-bottom: 2px;
  }

  .code-block {
    background: #0f172a;
    color: #38bdf8;
    padding: 8px 12px;
    border-radius: 5px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 8pt;
    margin: 8px 0;
    word-break: break-all;
  }

  .pill-badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 10px;
    font-size: 7pt;
    font-weight: 700;
  }
  .pill-green { background: #dcfce7; color: #15803d; }
  .pill-blue { background: #dbeafe; color: #1d4ed8; }
  .pill-amber { background: #fef3c7; color: #b45309; }

  ul {
    margin: 6px 0 10px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div class="cover-header">
    <div class="logo-box">VMH GROUP</div>
    <div>
      <div style="font-weight: 800; font-size: 11pt; color: #0c213a;">SURVEY MARKETPLACE & TRAFFIC ROUTER</div>
      <div style="font-size: 8pt; color: #64748b;">Enterprise Multi-Client API Gateway • Version 3.4 Production</div>
    </div>
  </div>

  <div class="cover-title-section">
    <span class="badge-tag">Official Admin Operating Manual (SOP)</span>
    <h1 class="cover-title">VMH SMR Platform<br>Complete Admin Guide</h1>
    <p class="cover-subtitle">
      Ye handbook VMH Admin aur Operations team ke liye banayi gayi hai. Isme login, daily routine, high-yield surveys, supply vendors ko link dena, S2S tracking aur fraud security ka poora process simple Hinglish me step-by-step explain kiya gaya hai.
    </p>
  </div>

  <div class="cover-meta-grid">
    <div class="meta-item">
      <span class="meta-label">Live Platform URL</span>
      <span class="meta-value">client-ten-lyart-71.vercel.app</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Default Super Admin</span>
      <span class="meta-value">Vmhgroup / Jelly</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Primary Datacenter</span>
      <span class="meta-value">Hostinger Mumbai (31.97.2.35)</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Integrated Core APIs</span>
      <span class="meta-value">Zamplia Supply & Demand, Market Xcel, Google Sheets</span>
    </div>
  </div>
</div>

<!-- PAGE 2: ARCHITECTURE & LOGIN -->
<div class="page-break"></div>

<h2 class="section-title">1. Platform Architecture & Business Model</h2>
<p>VMH SMR ek automated marketplace aur traffic router hai jo market research buyers aur respondents ke beech kaam karta hai:</p>

<div class="card card-highlight">
  <strong>💡 Business Revenue Flow (Paise Kaise Bante Hain):</strong>
  <ul>
    <li><strong>Demand Side (Clients):</strong> Zamplia, Market Xcel, Dynata, Cint jaise bade buyers surveys provide karte hain (e.g. CPI <strong>$3.00</strong>).</li>
    <li><strong>Supply Side (Vendors):</strong> Panel partners aur traffic networks respondents deliver karte hain (e.g. Vendor Payout <strong>$1.80</strong>).</li>
    <li><strong>VMH SMR Margin:</strong> Har successful complete par VMH ka net profit hota hai (e.g. <strong>$1.20</strong> per interview).</li>
    <li><strong>Smart Router:</strong> Respondent jab link par click karta hai, router uski profile scan karke sabse high-paying survey me automatically bhejta hai taaki screenout rate minimum ho.</li>
  </ul>
</div>

<h2 class="section-title">2. Admin Login & Authentication Security</h2>
<p>Platform enterprise-grade RBAC (Role Based Access Control) se secured hai:</p>

<table>
  <thead>
    <tr>
      <th>Portal URL</th>
      <th>Username</th>
      <th>Password</th>
      <th>Role</th>
      <th>Database Audit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Live Vercel / Hostinger</strong></td>
      <td><code>Vmhgroup</code></td>
      <td><code>Jelly</code></td>
      <td><span class="pill-badge pill-green">Super Admin</span></td>
      <td>Auto-logged in Google Sheet (<code>Admins</code> tab) with timestamp</td>
    </tr>
  </tbody>
</table>

<div class="card card-warning">
  <strong>⚠️ Security Note for Admin:</strong>
  <ul>
    <li>Sirf authorized <strong>Admin</strong> accounts hi dashboard access kar sakte hain. General users ya unauthorized logins automatically block ho jaate hain.</li>
    <li>Login credentials badalna ho to Google Sheet ke <code>Admins</code> tab me jakar update kiya ja sakta hai.</li>
  </ul>
</div>

<h2 class="section-title">3. Daily 5-Minute Morning SOP (Subah Ka Kaam)</h2>
<p>Har subah dashboard open karte hi Admin ko bas ye 3 quick steps lene hote hain:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Step 1: KPI Cards Check Karein</div>
    <div>Dashboard par <strong>Sessions</strong>, <strong>Goal Completions</strong>, aur <strong>Bounce Rate (Avg CPI)</strong> dekhein ki raat bhar me kitna traffic deliver hua.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Step 2: "Sync Zamplia" Button Dabayein</div>
    <div>Top navigation bar me neela <strong>"Sync Zamplia"</strong> button click karein. Ye 1 second me Zamplia Supply API se nayi inventory, live quotas aur updated CPI sync kar leta hai.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">Step 3: Top Picks Se High-Yield Links Nikalein</div>
    <div>Sidebar me <strong>Top Picks</strong> tab kholein. Rank 1 se 5 wale surveys ka CPI sabse high ($4.50 - $11.50) hota hai. Inke links copy karke apne top vendors ko share karein.</div>
  </div>
</div>

<!-- PAGE 3: SURVEYS & TOP PICKS -->
<div class="page-break"></div>

<h2 class="section-title">4. Allocated Surveys & Metrics Samajhna</h2>
<p>Sidebar me <strong>"Live Surveys"</strong> kholein. Yaha 626+ live surveys ki inventory dikhti hai. Har row me 5 important columns hote hain:</p>

<table>
  <thead>
    <tr>
      <th>Field Name</th>
      <th>Meaning (Hinglish)</th>
      <th>Ideal Range</th>
      <th>Admin Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Survey ID</strong></td>
      <td>Zamplia / MX ka unique tracking number</td>
      <td>e.g. <code>90142</code></td>
      <td>Vendor link banane aur dispute audit me use karein.</td>
    </tr>
    <tr>
      <td><strong>CPI ($)</strong></td>
      <td>Cost Per Interview (Client kitna pay karega)</td>
      <td>$1.50 — $12.00+</td>
      <td>High CPI surveys ko priority dein.</td>
    </tr>
    <tr>
      <td><strong>LOI (Min)</strong></td>
      <td>Length of Interview (Survey kitna lamba hai)</td>
      <td>8 — 18 Min</td>
      <td>Chhota LOI (&lt; 15 min) respondents jaldi complete karte hain.</td>
    </tr>
    <tr>
      <td><strong>IR (%)</strong></td>
      <td>Incidence Rate (100 me se kitne pass honge)</td>
      <td>50% — 90%</td>
      <td>High IR wale surveys me drop-off kam hota hai.</td>
    </tr>
    <tr>
      <td><strong>Capacity</strong></td>
      <td>Total Needed vs Completes Left</td>
      <td>e.g. <code>600 / 340</code></td>
      <td>Capacity full hote hi routing automatically pause ho jaati hai.</td>
    </tr>
  </tbody>
</table>

<div class="card card-highlight">
  <strong>🔘 Survey Table Ke 3 Main Action Buttons:</strong>
  <ul>
    <li><strong>Quotas Modal:</strong> Ispe click karke dekhein ki survey me kaunsa quota baaki hai (jaise Age 25-34 full hai ya khali, Gender Female open hai ya nahi).</li>
    <li><strong>Quals Modal:</strong> Pre-screening requirements dikhata hai (jaise Job Title = IT Manager, Household Income &gt; $50k).</li>
    <li><strong>Assign Vendor:</strong> Modal khul kar kisi specific vendor ke liye instant direct tracking link generate karta hai.</li>
  </ul>
</div>

<h2 class="section-title">5. Top Picks (Algorithm-Ranked Surveys)</h2>
<p>Sidebar me <strong>"Top Picks"</strong> tab VMH ke custom yield algorithm dwara rank kiya jata hai:</p>
<ul>
  <li><strong>Rank 1 to 5:</strong> Sabse high priority — Maximum CPI + High IR + Short LOI.</li>
  <li><strong>Priority Score (e.g. 98.4%):</strong> Higher score = Highest probability of quick money & maximum conversion.</li>
  <li><strong>Strategy:</strong> Jab bhi kisi vendor ka naya sample batch aaye, hamesha Top Picks se shuru karein.</li>
</ul>

<!-- PAGE 4: VENDORS & CLIENTS -->
<div class="page-break"></div>

<h2 class="section-title">6. Supply Vendors & Entry Link Generator</h2>
<p>Sidebar ➔ <strong>"Supply Vendors"</strong> me traffic partners (Dynata, PureSpectrum, Cint, VMH Panel) manage kiye jaate hain.</p>

<div class="step-row">
  <div class="step-num">A</div>
  <div class="step-content">
    <div class="step-title">Naya Vendor Add Karna:</div>
    <div>"Add Vendor" par click karke Vendor Name, Vendor Code (e.g. <code>VND_DYNATA</code>) aur payout share set karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">B</div>
  <div class="step-content">
    <div class="step-title">Vendor Entry Link Ka Structure:</div>
    <div>System automatic dynamic URL produce karta hai jo vendor ko diya jata hai:</div>
    <div class="code-block">
https://api.vmhgroupsmr.com/router/entry?v=VND_01&sid=90142&rid=[VENDOR_RESPONDENT_ID]
    </div>
    <div style="font-size: 8.5pt; color: #475569;">
      * <code>v</code> = Vendor Code<br>
      * <code>sid</code> = Survey ID (optional - agar specific survey me direct inject karna ho)<br>
      * <code>rid</code> = Vendor ka placeholder (Vendor apne system se respondent ID pass karega)
    </div>
  </div>
</div>

<h2 class="section-title">7. Demand Clients & S2S Postbacks (Status Codes)</h2>
<p>Sidebar ➔ <strong>"Demand Clients"</strong> me survey buyers configure hote hain. Har interview ke end me client 4 status signals bhejta hai:</p>

<table>
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Client Callback Type</th>
      <th>Outcome (Nateeja)</th>
      <th>Vendor Postback Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>status=1</strong></td>
      <td><strong>Complete</strong></td>
      <td>Survey successfully pura hua ✅</td>
      <td>Vendor ko payout credit hota hai. VMH revenue confirm.</td>
    </tr>
    <tr>
      <td><strong>status=2</strong></td>
      <td><strong>Terminate</strong></td>
      <td>Profile qualify nahi hui (Screenout) ❌</td>
      <td>Vendor ko return bhej diya jata hai. Koi penalty nahi.</td>
    </tr>
    <tr>
      <td><strong>status=3</strong></td>
      <td><strong>Overquota</strong></td>
      <td>Target slots pehle hi bhar chuke the ⚠️</td>
      <td>Router respondent ko doosre matching survey me bhej deta hai.</td>
    </tr>
    <tr>
      <td><strong>status=4</strong></td>
      <td><strong>Security Block</strong></td>
      <td>Fraud, VPN, Bot ya duplicate pakda gaya 🚫</td>
      <td>IP blacklisted. 0 payout.</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 5: SECURITY & RECONCILIATION -->
<div class="page-break"></div>

<h2 class="section-title">8. Multi-Layer Fraud Prevention Engine</h2>
<p>Sidebar ➔ <strong>"Fraud Security"</strong> tab. VMH SMR client rejections ko zero karne ke liye 4 security shields use karta hai:</p>

<div class="card card-highlight">
  <strong>🛡️ 4 Active Security Layers:</strong>
  <ul>
    <li><strong>1. IP Quality Score & VPN Shield:</strong> Datacenter IPs, NordVPN, ExpressVPN, Proxy aur Tor nodes ko entry point par hi drop kar deta hai.</li>
    <li><strong>2. Device Fingerprinting:</strong> Browser Canvas, WebGL aur screen hash scan karta hai taaki ek hi respondent bar-bar alag naam se survey na kare.</li>
    <li><strong>3. Speeder Detection Engine:</strong> Agar 14 minute ka survey kisi respondent ne 2 minute me submit kiya, to system use instantly terminate kar deta hai.</li>
    <li><strong>4. Honeypot Trap Questions:</strong> Bot spiders ko identify karke auto-ban karta hai.</li>
  </ul>
</div>

<h2 class="section-title">9. Zamplia Reconciliation & Monthly Invoicing</h2>
<p>Sidebar ➔ <strong>"Reconciliation"</strong> tab. Month-end me accounting aur billing ke liye:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Date Range Select Karein:</div>
    <div>Current month ki Start Date (e.g. 1st) aur End Date (e.g. 30th) select karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">"Fetch Reconciliation" Click Karein:</div>
    <div>System Zamplia server se verified completes fetch karega aur table me display karega.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">1-Click Export CSV:</div>
    <div>"Export CSV" button dabayein — aapki team ke liye verified payout invoice sheet download ho jayegi.</div>
  </div>
</div>

<h2 class="section-title">10. Golden Rules & Troubleshooting FAQ</h2>
<div class="card card-success">
  <strong>🌟 3 Golden Rules For 100% Success:</strong>
  <ul>
    <li><strong>Rule 1:</strong> Hamesha subah <strong>Sync Zamplia</strong> karein taaki fresh high-budget surveys active ho jayein.</li>
    <li><strong>Rule 2:</strong> Kisi survey ka quota agar 90% se jyada ho, to traffic thoda slow karein taaki overquota screenouts na aayein.</li>
    <li><strong>Rule 3:</strong> Weekly reconciliation check karein taaki month-end par koi mismatch ya payment dispute na ho.</li>
  </ul>
</div>

<div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 8pt; color: #64748b;">
  <strong>VMH GROUP'S SMR PLATFORM</strong> • Proprietary Traffic Router & Marketplace • Confidential
</div>

</body>
</html>
"""

pdf_paths = [
    r"c:\Users\shri hari computer\Downloads\VMH_SMR_Admin_Guide_Hinglish.pdf",
    r"c:\Users\shri hari computer\Downloads\smr1\client\public\VMH_SMR_Admin_Guide_Hinglish.pdf",
    r"c:\Users\shri hari computer\Downloads\smr1\VMH_SMR_Admin_Guide_Hinglish.pdf"
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_content(html_content, wait_until="networkidle")
    
    for path in pdf_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        page.pdf(
            path=path,
            format="A4",
            print_background=True,
            margin={"top": "10mm", "bottom": "10mm", "left": "10mm", "right": "10mm"}
        )
        print(f"Generated: {path} (Size: {os.path.getsize(path)} bytes)")
        
    browser.close()
print("All PDFs created successfully!")
