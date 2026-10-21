import re

# 1. Clean Sidebar.jsx
with open('client/src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Remove BarChart3 import
sidebar = sidebar.replace("BarChart3,\n", "")
sidebar = sidebar.replace("BarChart3,", "")

# Remove reportsOpen state
sidebar = sidebar.replace("  const [reportsOpen, setReportsOpen] = useState(true);\n", "")

# Remove reconciliation from useEffect
sidebar = sidebar.replace("} else if (activeTab === 'reconciliation') {\n      setReportsOpen(true);\n    ", "")

# Remove REPORTS & ANALYTICS block
reports_block = """          {/* Dotted Divider & REPORTS & ANALYTICS */}
          {(isPermitted(9) || isPermitted(10)) && (
            <>
              <div className="sidebar-dotted-divider" />
              <div className="sidebar-section-title">REPORTS & ANALYTICS</div>

              {/* Direct Nav: Reports Hub */}
              <div className="sidebar-nav-group">
                <button 
                  className={`sidebar-nav-heading ${activeTab === 'reconciliation' ? 'active' : ''}`}
                  onClick={() => handleNav('reconciliation')}
                >
                  <div className="nav-heading-left">
                    <BarChart3 size={16} className="nav-icon" />
                    <span>Reports Hub</span>
                  </div>
                </button>
              </div>
            </>
          )}"""

if reports_block in sidebar:
    sidebar = sidebar.replace(reports_block, "")
else:
    # regex pattern
    pattern = r"\{/\*\s*Dotted Divider & REPORTS & ANALYTICS\s*\*/\}[\s\S]*?\{\/\* Section: MANAGEMENT"
    sidebar = re.sub(pattern, "{/* Section: MANAGEMENT", sidebar)

with open('client/src/components/Sidebar.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(sidebar)

print("Updated Sidebar.jsx: Removed Reports Hub completely.")

# 2. Clean App.jsx
with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Remove import
app = re.sub(r"import ReconciliationPage from '\./pages/ReconciliationPage';\r?\n?", "", app)

# Remove reconciliation state and routing
app = re.sub(r"const \[reconciliationTab, setReconciliationTab\] = useState\(initialRoute\.subTab\);\r?\n?", "", app)

# Clean parseHashRoute
old_parse = """const parseHashRoute = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) {
    const saved = localStorage.getItem('smr_active_tab') || 'dashboard';
    const savedSub = localStorage.getItem('smr_recon_tab') || 'clients';
    return { tab: saved, subTab: savedSub };
  }
  const [tabPart, queryPart] = hash.split('?');
  const params = new URLSearchParams(queryPart || '');
  const tab = tabPart || 'dashboard';
  const subTab = params.get('tab') || 'clients';
  return { tab, subTab };
};"""

new_parse = """const parseHashRoute = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) {
    const saved = localStorage.getItem('smr_active_tab') || 'dashboard';
    return { tab: saved };
  }
  const [tabPart] = hash.split('?');
  const tab = tabPart || 'dashboard';
  return { tab };
};"""

app = app.replace(old_parse, new_parse)

# Clean handleTabChange
old_handle_tab = """  const handleTabChange = (tab, subTab, pushHistory = true) => {
    setActiveTab(tab);
    localStorage.setItem('smr_active_tab', tab);
    let hashStr = `#/${tab}`;
    if (tab === 'reconciliation') {
      const targetSub = subTab || reconciliationTab || 'clients';
      setReconciliationTab(targetSub);
      localStorage.setItem('smr_recon_tab', targetSub);
      hashStr += `?tab=${targetSub}`;
    }
    if (pushHistory && window.location.hash !== hashStr) {
      window.history.pushState({ tab, subTab: subTab || reconciliationTab }, '', hashStr);
    }
  };"""

new_handle_tab = """  const handleTabChange = (tab, pushHistory = true) => {
    setActiveTab(tab);
    localStorage.setItem('smr_active_tab', tab);
    const hashStr = `#/${tab}`;
    if (pushHistory && window.location.hash !== hashStr) {
      window.history.pushState({ tab }, '', hashStr);
    }
  };"""

app = app.replace(old_handle_tab, new_handle_tab)

# Clean initialHash sync
old_init_hash = """    if (!window.location.hash) {
      const initialHash = activeTab === 'reconciliation' ? `#/reconciliation?tab=${reconciliationTab}` : `#/${activeTab}`;
      window.history.replaceState({ tab: activeTab, subTab: reconciliationTab }, '', initialHash);
    }"""

new_init_hash = """    if (!window.location.hash) {
      const initialHash = `#/${activeTab}`;
      window.history.replaceState({ tab: activeTab }, '', initialHash);
    }"""

app = app.replace(old_init_hash, new_init_hash)

# Clean popstate listener
old_pop = """      // 2. Otherwise navigate to the URL hash route
      const { tab, subTab } = parseHashRoute();
      setActiveTab(tab);
      if (subTab) setReconciliationTab(subTab);"""

new_pop = """      // 2. Otherwise navigate to the URL hash route
      const { tab } = parseHashRoute();
      setActiveTab(tab);"""

app = app.replace(old_pop, new_pop)

# Remove reconciliation from PAGE_TITLES
app = app.replace("reconciliation: 'Reports & Reconciliation',\n", "")
app = app.replace("reconciliation: 'Reports & Reconciliation',", "")

# Remove currentReportSubTab prop passed to Sidebar
app = re.sub(r"\s*currentReportSubTab=\{reconciliationTab\}", "", app)

# Remove activeTab === 'reconciliation' JSX render
app = re.sub(r"\s*\{activeTab === 'reconciliation' && <ReconciliationPage initialTab=\{reconciliationTab\} />\}", "", app)

with open('client/src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(app)

print("Updated App.jsx: Removed ReconciliationPage routing and state completely.")
