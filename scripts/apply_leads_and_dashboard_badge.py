# 1. Update App.jsx
with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Add LeadsPage import
if 'LeadsPage' not in app:
    app = app.replace(
        "import BidsPage from './pages/BidsPage';",
        "import BidsPage from './pages/BidsPage';\nimport LeadsPage from './pages/LeadsPage';"
    )

# Add leads rendering
if "{activeTab === 'leads' && <LeadsPage />}" not in app:
    app = app.replace(
        "{activeTab === 'team' && <TeamPage />}",
        "{activeTab === 'team' && <TeamPage />}\n          {activeTab === 'leads' && <LeadsPage />}"
    )

# Add page title
if "leads: " not in app:
    app = app.replace(
        "dashboard: 'Dashboard',",
        "dashboard: 'Dashboard',\n    leads: 'Traffic Leads Stream',"
    )

with open('client/src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(app)

print("Updated App.jsx with LeadsPage routing!")

# 2. Update Sidebar.jsx
with open('client/src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Update opsOpen useEffect check
sidebar = sidebar.replace(
    "['bids', 'payments'].includes(activeTab)",
    "['bids', 'payments', 'leads'].includes(activeTab)"
)

# Add Traffic Leads Stream button under Operations
traffic_btn = """                    <button
                      className={`submenu-item ${activeTab === 'leads' ? 'active' : ''}`}
                      onClick={() => handleNav('leads')}
                    >
                      <span className="bullet-circle" />
                      <span>Traffic Leads Stream</span>
                    </button>"""

if "Traffic Leads Stream" not in sidebar:
    sidebar = sidebar.replace(
        """                    <button
                      className={`submenu-item ${activeTab === 'payments' ? 'active' : ''}`}
                      onClick={() => handleNav('payments')}
                    >
                      <span className="bullet-circle" />
                      <span>Vendor Payments</span>
                    </button>""",
        """                    <button
                      className={`submenu-item ${activeTab === 'payments' ? 'active' : ''}`}
                      onClick={() => handleNav('payments')}
                    >
                      <span className="bullet-circle" />
                      <span>Vendor Payments</span>
                    </button>\n""" + traffic_btn
    )

with open('client/src/components/Sidebar.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(sidebar)

print("Updated Sidebar.jsx with Traffic Leads Stream navigation!")

# 3. Update DashboardPage.jsx with live sync badge
with open('client/src/pages/DashboardPage.jsx', 'r', encoding='utf-8') as f:
    dash = f.read()

old_bread = """          <ol className="breadcrumb">
            <li><span className="breadcrumb-item-link">VMH</span></li>
            <li className="separator">/</li>
            <li className="active">Overview</li>
          </ol>"""

new_bread = """          <ol className="breadcrumb">
            <li><span className="breadcrumb-item-link">VMH</span></li>
            <li className="separator">/</li>
            <li className="active">Overview</li>
          </ol>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              background: '#dcfce7',
              color: '#15803d',
              padding: '3px 10px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%', display: 'inline-block' }} />
              Live Sync Active • Zamplia Supply Engine ({normalized.length} Studies Connected)
            </span>
          </div>"""

if "Live Sync Active" not in dash:
    dash = dash.replace(old_bread, new_bread)
    with open('client/src/pages/DashboardPage.jsx', 'w', encoding='utf-8', newline='') as f:
        f.write(dash)
    print("Updated DashboardPage.jsx with Live Sync badge!")
