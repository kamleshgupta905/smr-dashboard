import re

# 1. Update App.jsx
with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    app_code = f.read()

# Make sure imports are present
if 'BidsPage' not in app_code:
    app_code = app_code.replace(
        "import UserManagementPage from './pages/UserManagementPage';",
        "import UserManagementPage from './pages/UserManagementPage';\nimport BidsPage from './pages/BidsPage';\nimport PaymentsPage from './pages/PaymentsPage';\nimport TeamPage from './pages/TeamPage';"
    )

# Add rendering routes
if "{activeTab === 'bids' && <BidsPage />}" not in app_code:
    vendors_target = "{activeTab === 'vendors' && <VendorsPage onNavigate={handleTabChange} globalSearch={globalSearch} />}"
    replacement = vendors_target + """
          {activeTab === 'bids' && <BidsPage />}
          {activeTab === 'payments' && <PaymentsPage />}
          {activeTab === 'team' && <TeamPage />}"""
    app_code = app_code.replace(vendors_target, replacement)

with open('client/src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(app_code)

print("Updated App.jsx successfully!")

# 2. Update Sidebar.jsx
with open('client/src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar_code = f.read()

# Import Briefcase if not present
if 'Briefcase' not in sidebar_code:
    sidebar_code = sidebar_code.replace("BarChart3,", "BarChart3,\n  Briefcase,")

# State for opsOpen
if 'opsOpen' not in sidebar_code:
    sidebar_code = sidebar_code.replace(
        "const [developerOpen, setDeveloperOpen] = useState(true);",
        "const [developerOpen, setDeveloperOpen] = useState(true);\n  const [opsOpen, setOpsOpen] = useState(true);"
    )

# useEffect activeTab expansion
if "['bids', 'payments'].includes(activeTab)" not in sidebar_code:
    sidebar_code = sidebar_code.replace(
        "} else if (['developer-center', 'users'].includes(activeTab)) {",
        "} else if (['bids', 'payments'].includes(activeTab)) {\n      setOpsOpen(true);\n    } else if (['developer-center', 'users', 'team'].includes(activeTab)) {"
    )

# Add Team Directory in System & Team
if "handleNav('team')" not in sidebar_code:
    target_team = """                        <button
                          className={`submenu-item ${activeTab === 'users' ? 'active' : ''}`}
                          onClick={() => handleNav('users')}
                        >
                          <span className="bullet-circle" />
                          <span>User Management</span>
                        </button>"""
    replacement_team = target_team + """
                        <button
                          className={`submenu-item ${activeTab === 'team' ? 'active' : ''}`}
                          onClick={() => handleNav('team')}
                        >
                          <span className="bullet-circle" />
                          <span>Team Directory</span>
                        </button>"""
    # handle possible line endings in target
    if target_team in sidebar_code:
        sidebar_code = sidebar_code.replace(target_team, replacement_team)
    else:
        # regex replace
        pattern = r"(<button\s+className=\{`submenu-item\s+\$\{activeTab\s+===\s+'users'[^>]+>[\s\S]*?<span>User Management</span>\s*</button>)"
        sidebar_code = re.sub(pattern, r"\1\n                        <button\n                          className={`submenu-item ${activeTab === 'team' ? 'active' : ''}`}\n                          onClick={() => handleNav('team')}\n                        >\n                          <span className=\"bullet-circle\" />\n                          <span>Team Directory</span>\n                        </button>", sidebar_code)

# Add OPERATIONS section before REPORTS & ANALYTICS
ops_section = """          {/* Section: OPERATIONS */}
          <div className="sidebar-dotted-divider" />
          <div className="sidebar-section-title">OPERATIONS</div>

          <div className="sidebar-nav-group">
            <button 
              className={`sidebar-nav-heading ${['bids', 'payments'].includes(activeTab) ? 'active' : ''}`}
              onClick={() => setOpsOpen(prev => !prev)}
            >
              <div className="nav-heading-left">
                <Briefcase size={16} className="nav-icon" />
                <span>Operations</span>
              </div>
              <span className={`dropdown-chevron ${opsOpen ? 'rotated' : ''}`}>
                <ChevronRight size={14} />
              </span>
            </button>

            <div className={`sidebar-submenu-collapsible ${opsOpen ? 'open' : 'closed'}`}>
              <div className="sidebar-submenu-inner">
                <button
                  className={`submenu-item ${activeTab === 'bids' ? 'active' : ''}`}
                  onClick={() => handleNav('bids')}
                >
                  <span className="bullet-circle" />
                  <span>Bids & Feasibility</span>
                </button>
                <button
                  className={`submenu-item ${activeTab === 'payments' ? 'active' : ''}`}
                  onClick={() => handleNav('payments')}
                >
                  <span className="bullet-circle" />
                  <span>Vendor Payments</span>
                </button>
              </div>
            </div>
          </div>\n\n"""

if "Bids & Feasibility" not in sidebar_code:
    # insert before REPORTS & ANALYTICS
    reports_header = "{/* Dotted Divider & REPORTS & ANALYTICS */}"
    if reports_header in sidebar_code:
        sidebar_code = sidebar_code.replace(reports_header, ops_section + "          " + reports_header)
    else:
        print("Warning: reports_header not found in sidebar")

with open('client/src/components/Sidebar.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(sidebar_code)

print("Updated Sidebar.jsx successfully!")
