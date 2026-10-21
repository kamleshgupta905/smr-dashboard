import re

# 1. Update ClientsPage.jsx
with open('client/src/pages/ClientsPage.jsx', 'r', encoding='utf-8') as f:
    client_code = f.read()

# Add expandedUrls state if not present
if 'expandedUrls' not in client_code:
    client_code = client_code.replace(
        "const [testResult, setTestResult] = useState(null);",
        "const [testResult, setTestResult] = useState(null);\n  const [expandedUrls, setExpandedUrls] = useState({});"
    )

# Clean up header badges and info
old_header_block = """                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1d2c48', margin: 0 }}>
                      {client.client_name}
                    </h2>
                    <span className="badge-soft-primary" style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      Code: {clientCode}
                    </span>
                    <span className="badge-soft-success" style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {client.country} ({client.currency})
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#7081b9' }}>
                    <span>API Standard: <strong style={{ color: '#1d2c48' }}>{client.apiType?.toUpperCase()}</strong></span>
                    <span>Hashing Spec: <strong style={{ color: '#1761fd' }}>{client.hashAlgorithm?.toUpperCase()}</strong></span>
                    <span>S2S Callback: <strong style={{ color: '#03d87f' }}>Active (updateRespondentStatus)</strong></span>
                  </div>"""

new_header_block = """                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1d2c48', margin: 0 }}>
                      {client.client_name}
                    </h2>
                    <span className="badge-soft-primary" style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      Code: {clientCode}
                    </span>
                    {client.country && (
                      <span className="badge-soft-success" style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {client.country} {client.currency ? `(${client.currency})` : ''}
                      </span>
                    )}
                    <span className="badge-soft-success" style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {client.status || 'Active'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#7081b9', flexWrap: 'wrap' }}>
                    {client.email && <span>Email: <strong style={{ color: '#1d2c48' }}>{client.email}</strong></span>}
                    {client.phone && <span>Phone: <strong style={{ color: '#1d2c48' }}>{client.phone}</strong></span>}
                    <span>Traffic Router: <strong style={{ color: '#1761fd' }}>S2S Active</strong></span>
                  </div>"""

if old_header_block in client_code:
    client_code = client_code.replace(old_header_block, new_header_block)
    print("SUCCESS: Updated client card header block")
else:
    print("WARNING: old_header_block not found in ClientsPage.jsx")

# Remove Sync Projects button and add Toggle Redirect URLs button
old_buttons_block = """                {/* Top Action Buttons (Frame 004 & Frame 006) */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-soft-secondary btn-sm"
                    onClick={() => handleSync(clientCode)}
                    disabled={syncingId === clientCode}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', borderRadius: '4px' }}
                  >
                    <RefreshCw size={12} className={syncingId === clientCode ? 'spinner' : ''} />
                    Sync Projects
                  </button>"""

new_buttons_block = """                {/* Top Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className={`btn ${expandedUrls[clientCode] ? 'btn-primary' : 'btn-soft-primary'} btn-sm`}
                    onClick={() => setExpandedUrls(prev => ({ ...prev, [clientCode]: !prev[clientCode] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', borderRadius: '4px', fontWeight: 600 }}
                  >
                    <Copy size={12} />
                    {expandedUrls[clientCode] ? 'Hide Redirect URLs' : '📋 View Redirect URLs'}
                  </button>"""

if old_buttons_block in client_code:
    client_code = client_code.replace(old_buttons_block, new_buttons_block)
    print("SUCCESS: Replaced Sync Projects with View Redirect URLs toggle")
else:
    print("WARNING: old_buttons_block not found in ClientsPage.jsx")

# Wrap the Platform Redirect URLs block inside conditional expandedUrls[clientCode]
old_redirect_start = """              {/* Platform Redirect URLs Handover Block (Frame 004) */}
              <div style={{
                marginTop: '16px',"""

new_redirect_start = """              {/* Platform Redirect URLs Handover Block (Frame 004) */}
              {expandedUrls[clientCode] && (
              <div style={{
                marginTop: '16px',"""

old_redirect_end = """                      {qualityRedirect}
                    </div>
                  </div>
                </div>
              </div>
            </div>"""

new_redirect_end = """                      {qualityRedirect}
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>"""

if old_redirect_start in client_code:
    client_code = client_code.replace(old_redirect_start, new_redirect_start)
    print("SUCCESS: Added start conditional for redirect URLs")
else:
    print("WARNING: old_redirect_start not found")

if old_redirect_end in client_code:
    client_code = client_code.replace(old_redirect_end, new_redirect_end)
    print("SUCCESS: Added end conditional for redirect URLs")
else:
    print("WARNING: old_redirect_end not found")

with open('client/src/pages/ClientsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(client_code)
print("ClientsPage.jsx saved successfully.")

# 2. Update Sidebar.jsx (Remove Categories & Reference Data)
with open('client/src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar_code = f.read()

sidebar_code = sidebar_code.replace("['security', 'reference'].includes(activeTab)", "['security'].includes(activeTab)")
sidebar_code = sidebar_code.replace("<span>Security & Reference</span>", "<span>Security & Fraud Controls</span>")

# Remove Categories & Reference Data button from sidebar
ref_btn = """                      <button
                        className={`submenu-item ${activeTab === 'reference' ? 'active' : ''}`}
                        onClick={() => handleNav('reference')}
                      >
                        <span className="bullet-circle" />
                        <span>Categories & Reference Data</span>
                      </button>"""

if ref_btn in sidebar_code:
    sidebar_code = sidebar_code.replace(ref_btn, "")
    print("SUCCESS: Removed Categories & Reference Data button from Sidebar")
else:
    ref_btn_crlf = ref_btn.replace('\n', '\r\n')
    if ref_btn_crlf in sidebar_code:
        sidebar_code = sidebar_code.replace(ref_btn_crlf, "")
        print("SUCCESS: Removed Categories & Reference Data button (CRLF) from Sidebar")
    else:
        print("WARNING: ref_btn not found in Sidebar.jsx")

with open('client/src/components/Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar_code)
print("Sidebar.jsx saved successfully.")

# 3. Update App.jsx (Remove CategoriesPage)
with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    app_code = f.read()

app_code = app_code.replace("import CategoriesPage from './pages/CategoriesPage';", "")
app_code = app_code.replace("reference: 'Categories & Reference Data',", "")
app_code = re.sub(r'\{activeTab\s*===\s*[\'"]reference[\'"].*?\}', '', app_code)

with open('client/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_code)
print("App.jsx saved successfully.")
