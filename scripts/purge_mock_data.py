with open('client/src/services/api.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace DEFAULT_CLIENTS with empty array
import re
text = re.sub(r'export const DEFAULT_CLIENTS = \[.*?\];', 'export const DEFAULT_CLIENTS = [];', text, flags=re.DOTALL)
text = re.sub(r'export const DEFAULT_PROJECTS = \[.*?\];', 'export const DEFAULT_PROJECTS = [];', text, flags=re.DOTALL)

# Update getClients to never fall back to dummy clients
old_get_clients = """export const getClients = async () => {
  try {
    const res = await api.get('/clients');
    const remote = res.data?.data;
    if (Array.isArray(remote) && remote.length > 0) {
      setLocalData('smr_custom_clients', remote);
      return remote;
    }
  } catch {}
  const local = getLocalData('smr_custom_clients', null);
  if (local && Array.isArray(local) && local.length > 0 && !local.some(c => c.client_name?.includes('Demand Network'))) {
    return local;
  }
  setLocalData('smr_custom_clients', DEFAULT_CLIENTS);
  return DEFAULT_CLIENTS;
};"""

new_get_clients = """export const getClients = async () => {
  try {
    const res = await api.get('/clients');
    if (Array.isArray(res.data?.data)) {
      return res.data.data;
    }
  } catch {}
  return [];
};"""

if old_get_clients in text:
    text = text.replace(old_get_clients, new_get_clients)
    print("SUCCESS: Replaced getClients function")
else:
    # Try flexible regex replace
    text = re.sub(
        r'export const getClients = async \(\) => \{.*?return DEFAULT_CLIENTS;\s*\};',
        new_get_clients,
        text,
        flags=re.DOTALL
    )
    print("SUCCESS: Replaced getClients function via regex")

# Also ensure getProjects returns empty if remote is empty
old_get_proj = """export const getProjects = async () => {
  try {
    const res = await api.get('/manage/projects');
    const remote = res.data?.data;
    if (Array.isArray(remote) && remote.length > 0) {
      setLocalData('smr_custom_projects', remote);
      return { success: true, data: remote };
    }
  } catch {}
  const local = getLocalData('smr_custom_projects', null);
  if (local && Array.isArray(local) && local.length > 0) {
    return { success: true, data: local };
  }
  return { success: true, data: DEFAULT_PROJECTS };
};"""

new_get_proj = """export const getProjects = async () => {
  try {
    const res = await api.get('/manage/projects');
    if (Array.isArray(res.data?.data)) {
      return { success: true, data: res.data.data };
    }
  } catch {}
  return { success: true, data: [] };
};"""

if old_get_proj in text:
    text = text.replace(old_get_proj, new_get_proj)
    print("SUCCESS: Replaced getProjects function")
else:
    text = re.sub(
        r'export const getProjects = async \(\) => \{.*?return \{ success: true, data: DEFAULT_PROJECTS \};\s*\};',
        new_get_proj,
        text,
        flags=re.DOTALL
    )
    print("SUCCESS: Replaced getProjects function via regex")

with open('client/src/services/api.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("api.js updated successfully.")

# Clear local storage on App.jsx mount
with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    app_text = f.read()

cleanup_code = """  useEffect(() => {
    localStorage.removeItem('smr_custom_clients');
    localStorage.removeItem('smr_custom_projects');
  }, []);
"""

if 'smr_custom_clients' not in app_text:
    app_text = app_text.replace(
        "function App() {",
        f"function App() {{\n{cleanup_code}"
    )
    with open('client/src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(app_text)
    print("App.jsx updated with localStorage purge.")
