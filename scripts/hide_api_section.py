with open('client/src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# 1. Remove developer-center button
old_button = """                      {(!currentUser || currentUser.role_id === 1 || isPermitted(4)) && (
                        <button
                          className={`submenu-item ${activeTab === 'developer-center' ? 'active' : ''}`}
                          onClick={() => handleNav('developer-center')}
                        >
                          <span className="bullet-circle" />
                          <span>API & Integrations</span>
                        </button>
                      )}"""

if old_button in sidebar:
    sidebar = sidebar.replace(old_button, "")
    print("Removed API & Integrations button from Sidebar!")

# 2. Update heading active check
sidebar = sidebar.replace(
    "['developer-center', 'users', 'team', 'reference'].includes(activeTab)",
    "['users', 'team', 'reference'].includes(activeTab)"
)

with open('client/src/components/Sidebar.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(sidebar)

# 3. Update App.jsx to prevent access to developer-center
with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

app = app.replace(
    "{activeTab === 'developer-center' && <ApiDeveloperCenterPage />}",
    "{activeTab === 'developer-center' && <DashboardPage />}"
)

with open('client/src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(app)

print("Updated Sidebar.jsx and App.jsx to hide and protect API section from frontend!")
