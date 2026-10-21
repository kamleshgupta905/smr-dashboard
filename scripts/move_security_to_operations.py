with open('client/src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# 1. Update opsOpen useEffect check
sidebar = sidebar.replace(
    "} else if (['security'].includes(activeTab)) {\n      setSecurityOpen(true);\n    } else if (['bids', 'payments', 'leads'].includes(activeTab)) {\n      setOpsOpen(true);",
    "} else if (['bids', 'payments', 'leads', 'security'].includes(activeTab)) {\n      setOpsOpen(true);"
)

# 2. Update heading active check for Operations
sidebar = sidebar.replace(
    "['bids', 'payments', 'leads'].includes(activeTab)",
    "['bids', 'payments', 'leads', 'security'].includes(activeTab)"
)

# 3. Add Security & Fraud Gate button to Operations & Payouts submenu
old_leads_btn = """                    <button
                      className={`submenu-item ${activeTab === 'leads' ? 'active' : ''}`}
                      onClick={() => handleNav('leads')}
                    >
                      <span className="bullet-circle" />
                      <span>Traffic Leads Stream</span>
                    </button>"""

new_leads_and_security = """                    <button
                      className={`submenu-item ${activeTab === 'leads' ? 'active' : ''}`}
                      onClick={() => handleNav('leads')}
                    >
                      <span className="bullet-circle" />
                      <span>Traffic Leads Stream</span>
                    </button>
                    <button
                      className={`submenu-item ${activeTab === 'security' ? 'active' : ''}`}
                      onClick={() => handleNav('security')}
                    >
                      <span className="bullet-circle" />
                      <span>Security & Fraud Gate</span>
                    </button>"""

if '<span>Security & Fraud Gate</span>' in sidebar and old_leads_btn in sidebar:
    sidebar = sidebar.replace(old_leads_btn, new_leads_and_security)

# 4. Remove the separate Security & Fraud Controls dropdown group
old_security_group = """              {/* Dropdown: Security & Quality Controls */}
              {(!currentUser || currentUser.role_id === 1 || isPermitted(4)) && (
                <div className="sidebar-nav-group">
                  <button 
                    className={`sidebar-nav-heading ${['security'].includes(activeTab) ? 'active' : ''}`}
                    onClick={() => setSecurityOpen(prev => !prev)}
                  >
                    <div className="nav-heading-left">
                      <ShieldCheck size={16} className="nav-icon" />
                      <span>Security & Fraud Controls</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`dropdown-chevron ${securityOpen ? 'rotated' : ''}`}>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </button>

                  <div className={`sidebar-submenu-collapsible ${securityOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-submenu-inner">
                      <button
                        className={`submenu-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => handleNav('security')}
                      >
                        <span className="bullet-circle" />
                        <span>Security & Fraud Gate</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}"""

if old_security_group in sidebar:
    sidebar = sidebar.replace(old_security_group, "")
    print("Successfully removed separate Security dropdown group!")

with open('client/src/components/Sidebar.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(sidebar)

print("Sidebar successfully updated to group Security & Fraud Gate into Operations & Payouts!")
