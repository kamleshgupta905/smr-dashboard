with open('client/src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("['dashboard', 'surveys', 'projects'].includes(activeTab)", "['dashboard', 'surveys'].includes(activeTab)")

import re
# Remove projects button
text = re.sub(
    r'\{isPermitted\(7\)\s*&&\s*\(\s*<button[^>]*activeTab\s*===\s*[\'"]projects[\'"].*?<\/button>\s*\)\}',
    '',
    text,
    flags=re.DOTALL
)

with open('client/src/components/Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Sidebar.jsx updated.")

with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    app_text = f.read()

app_text = app_text.replace("import ProjectsPage from './pages/ProjectsPage';", "")
app_text = app_text.replace("projects: 'Projects',", "")
app_text = re.sub(r'\{activeTab\s*===\s*[\'"]projects[\'"].*?\}', '', app_text)

with open('client/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_text)
print("App.jsx updated.")
