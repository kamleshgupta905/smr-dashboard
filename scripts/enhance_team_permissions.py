with open('client/src/pages/TeamPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
if 'getMenuPermissions' not in code:
    code = code.replace(
        "import { getTeamMembers, createTeamMember, updateTeamMemberStatus, deleteTeamMember, changePassword, getTeamActivity } from '../services/api';",
        "import { getTeamMembers, createTeamMember, updateTeamMemberStatus, deleteTeamMember, changePassword, getTeamActivity, getMenuPermissions, saveMenuPermissions } from '../services/api';"
    )

if 'Shield,' not in code:
    code = code.replace(
        "  Clock\n} from 'lucide-react';",
        "  Clock,\n  Shield,\n  CheckSquare,\n  Square\n} from 'lucide-react';"
    )

# 2. Add state & handlers
perm_state = """  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permUser, setPermUser] = useState(null);
  const [permMenus, setPermMenus] = useState([]);
  const [userPerms, setUserPerms] = useState({});
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);

  const handleOpenPermissions = async (member) => {
    setPermUser(member);
    setShowPermissionsModal(true);
    setLoadingPerms(true);
    try {
      const res = await getMenuPermissions(member.id);
      if (res && res.success) {
        setPermMenus(res.menus || []);
        const map = {};
        (res.permissions || []).forEach(p => {
          map[p.menu_id] = {
            view: true,
            add: Boolean(p.add),
            edit: Boolean(p.edit),
            delete: Boolean(p.delete)
          };
        });
        setUserPerms(map);
      }
    } catch (err) {
      console.error('Failed to load menu permissions:', err);
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleTogglePerm = (menuId, field) => {
    setUserPerms(prev => {
      const current = prev[menuId] || { view: false, add: false, edit: false, delete: false };
      const updated = { ...current, [field]: !current[field] };
      // If toggling off view, also toggle off add/edit/delete
      if (field === 'view' && !updated.view) {
        updated.add = false;
        updated.edit = false;
        updated.delete = false;
      }
      // If toggling on add/edit/delete, ensure view is true
      if (field !== 'view' && updated[field]) {
        updated.view = true;
      }
      return { ...prev, [menuId]: updated };
    });
  };

  const handleSavePermissions = async () => {
    if (!permUser) return;
    try {
      setSavingPerms(true);
      const permList = Object.entries(userPerms)
        .filter(([_, val]) => val.view)
        .map(([mId, val]) => ({
          menu_id: Number(mId),
          add: val.add ? 1 : 0,
          edit: val.edit ? 1 : 0,
          delete: val.delete ? 1 : 0,
          print: 1
        }));

      const res = await saveMenuPermissions({
        user_id: permUser.id,
        permissions: permList
      });

      if (res && res.success) {
        alert(res.message || 'Menu permissions saved successfully!');
        setShowPermissionsModal(false);
      } else {
        alert(res?.message || 'Failed to update permissions');
      }
    } catch (err) {
      alert('Error updating permissions');
    } finally {
      setSavingPerms(false);
    }
  };
"""

if 'handleOpenPermissions' not in code:
    code = code.replace(
        "  const [showPasswordModal, setShowPasswordModal] = useState(false);",
        perm_state + "\n  const [showPasswordModal, setShowPasswordModal] = useState(false);"
    )

# 3. Add Permissions button in row actions
perm_btn = """                          <button
                            onClick={() => handleOpenPermissions(m)}
                            className="btn btn-soft-warning btn-sm"
                            style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                            title="Manage Module Access & Permissions (ACL)"
                          >
                            <Shield size={12} /> Access
                          </button>"""

if 'handleOpenPermissions(m)' not in code:
    code = code.replace(
        """                          <button
                            onClick={() => handleOpenPasswordModal(m)}""",
        perm_btn + """\n                          <button
                            onClick={() => handleOpenPasswordModal(m)}"""
    )

# 4. Add Permissions ModalPortal
perm_modal = """
      {/* Modal: Staff Menu Permissions (ACL) */}
      {showPermissionsModal && permUser && (
        <ModalPortal isOpen={showPermissionsModal} onClose={() => setShowPermissionsModal(false)}>
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#fef3c7', padding: '6px', borderRadius: '6px', color: '#b45309' }}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Module Permissions (ACL)
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Access control for {permUser.name} (@{permUser.username}) • MySQL menu_permissions
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPermissionsModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '60vh' }}>
                {loadingPerms ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    <RefreshCw size={20} className="fa-spin" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                    Loading module permissions...
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Module / Screen</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>View Access</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Can Add</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Can Edit</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Can Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permMenus.map((menu) => {
                        const p = userPerms[menu.id] || { view: false, add: false, edit: false, delete: false };
                        return (
                          <tr key={menu.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{menu.name}</div>
                              <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Route: {menu.route}</div>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={Boolean(p.view)}
                                onChange={() => handleTogglePerm(menu.id, 'view')}
                                style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={Boolean(p.add)}
                                disabled={!p.view}
                                onChange={() => handleTogglePerm(menu.id, 'add')}
                                style={{ width: '15px', height: '15px', cursor: p.view ? 'pointer' : 'not-allowed' }}
                              />
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={Boolean(p.edit)}
                                disabled={!p.view}
                                onChange={() => handleTogglePerm(menu.id, 'edit')}
                                style={{ width: '15px', height: '15px', cursor: p.view ? 'pointer' : 'not-allowed' }}
                              />
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={Boolean(p.delete)}
                                disabled={!p.view}
                                onChange={() => handleTogglePerm(menu.id, 'delete')}
                                style={{ width: '15px', height: '15px', cursor: p.view ? 'pointer' : 'not-allowed' }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="btn btn-light"
                  style={{ fontSize: '12px', padding: '7px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPerms}
                  onClick={handleSavePermissions}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '7px 20px', borderRadius: '6px', fontWeight: 600, background: '#6366f1', borderColor: '#6366f1' }}
                >
                  {savingPerms ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
"""

if 'Modal: Staff Menu Permissions' not in code:
    code = code.replace(
        "    </div>\n  );\n}",
        perm_modal + "\n    </div>\n  );\n}"
    )

with open('client/src/pages/TeamPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("TeamPage successfully updated with Menu Permissions (ACL) Modal!")
