import os

path = r'c:\Users\shri hari computer\Downloads\smr1\client\src\components\Sidebar.jsx'
with open(path, 'r', encoding='utf8') as f:
    content = f.read()

target = """                    {isPermitted(7) && (
                      <button
                        className={`submenu-item ${activeTab === 'surveys' ? 'active' : ''}"""

replacement = """                    {isPermitted(7) && (
                      <button
                        className={`submenu-item ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => handleNav('projects')}
                      >
                        <span className="bullet-circle" />
                        <span>Projects</span>
                      </button>
                    )}
                    {isPermitted(7) && (
                      <button
                        className={`submenu-item ${activeTab === 'surveys' ? 'active' : ''}"""

if target in content:
    content = content.replace(target, replacement, 1)
    print("Replaced LF")
elif target.replace('\n', '\r\n') in content:
    content = content.replace(target.replace('\n', '\r\n'), replacement.replace('\n', '\r\n'), 1)
    print("Replaced CRLF")
else:
    print("Not found")

with open(path, 'w', encoding='utf8') as f:
    f.write(content)
