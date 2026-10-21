path = r'c:\Users\shri hari computer\Downloads\smr1\client\src\App.jsx'
with open(path, 'r', encoding='utf8') as f:
    c = f.read()

# 1. Add import
imp_target = "import SurveysPage from './pages/SurveysPage';"
imp_replacement = "import SurveysPage from './pages/SurveysPage';\nimport ProjectsPage from './pages/ProjectsPage';"
c = c.replace(imp_target, imp_replacement, 1)

# 2. Add page title
title_target = "surveys: 'Surveys',"
title_replacement = "surveys: 'Surveys',\n    projects: 'Projects',"
c = c.replace(title_target, title_replacement, 1)

# 3. Add activeTab render
tab_target = "{activeTab === 'users' && <UserManagementPage currentUser={currentUser} />}"
tab_replacement = "{activeTab === 'projects' && <ProjectsPage />}\n          {activeTab === 'users' && <UserManagementPage currentUser={currentUser} />}"
c = c.replace(tab_target, tab_replacement, 1)

with open(path, 'w', encoding='utf8') as f:
    f.write(c)
print("Updated App.jsx successfully!")
