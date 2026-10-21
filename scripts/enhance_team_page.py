import re

with open('client/src/pages/TeamPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
if 'getTeamActivity' not in code:
    code = code.replace(
        "import { getTeamMembers, createTeamMember, updateTeamMemberStatus, deleteTeamMember } from '../services/api';",
        "import { getTeamMembers, createTeamMember, updateTeamMemberStatus, deleteTeamMember, changePassword, getTeamActivity } from '../services/api';"
    )

if 'History,' not in code:
    code = code.replace(
        "  KeyRound\n} from 'lucide-react';",
        "  KeyRound,\n  History,\n  Lock,\n  Laptop,\n  Globe,\n  Clock\n} from 'lucide-react';"
    )

# 2. Add state and handlers
state_code = """  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ new_password: '', confirm_password: '' });
  const [changingPass, setChangingPass] = useState(false);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const handleOpenPasswordModal = (member) => {
    setPasswordUser(member);
    setPasswordForm({ new_password: '', confirm_password: '' });
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.new_password || passwordForm.new_password.length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Passwords do not match.');
      return;
    }
    try {
      setChangingPass(true);
      const res = await changePassword({
        user_id: passwordUser.id,
        new_password: passwordForm.new_password
      });
      if (res && res.success) {
        alert(res.message || 'Password updated successfully!');
        setShowPasswordModal(false);
      } else {
        alert(res?.message || 'Failed to update password');
      }
    } catch (err) {
      alert('Error updating password: ' + (err.message || 'Server error'));
    } finally {
      setChangingPass(false);
    }
  };

  const handleOpenActivity = async () => {
    setShowActivityModal(true);
    setLoadingActivity(true);
    try {
      const res = await getTeamActivity();
      if (res && res.success) {
        setActivityLogs(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load team activity:', err);
    } finally {
      setLoadingActivity(false);
    }
  };
"""

if 'handleOpenPasswordModal' not in code:
    code = code.replace(
        "  const [form, setForm] = useState({",
        state_code + "\n  const [form, setForm] = useState({"
    )

# 3. Add Login Audit button in header
header_btn = """          <button
            onClick={handleOpenActivity}
            className="btn btn-outline-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155' }}
            title="View Staff Login Activity Trail (user_account_activitys)"
          >
            <History size={14} />
            Login Audit
          </button>"""

if 'Login Audit' not in code:
    code = code.replace(
        """          <button
            onClick={() => setShowAddModal(true)}""",
        header_btn + """\n          <button
            onClick={() => setShowAddModal(true)}"""
    )

# 4. Add Password button in table row actions
old_actions = """                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {Number(m.role_id) === 1 && members.length === 1 ? (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Protected</span>
                        ) : (
                          <button
                            onClick={() => handleDelete(m.id, m.name)}
                            className="btn btn-soft-danger btn-sm"
                            style={{ padding: '4px 8px', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', border: 'none' }}
                            title="Remove Member"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>"""

new_actions = """                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenPasswordModal(m)}
                            className="btn btn-soft-primary btn-sm"
                            style={{ padding: '4px 8px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                            title="Reset / Change Password"
                          >
                            <KeyRound size={12} /> Password
                          </button>
                          {Number(m.role_id) === 1 && members.length === 1 ? (
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Protected</span>
                          ) : (
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              className="btn btn-soft-danger btn-sm"
                              style={{ padding: '4px 8px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none' }}
                              title="Remove Member"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>"""

if new_actions not in code and old_actions in code:
    code = code.replace(old_actions, new_actions)

# 5. Modals for Password Reset and Login Activity Audit
modals_code = """
      {/* Modal: Change Password */}
      {showPasswordModal && passwordUser && (
        <ModalPortal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
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
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden'
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
                  <div style={{ background: '#e0e7ff', padding: '6px', borderRadius: '6px', color: '#4f46e5' }}>
                    <Lock size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Change Password</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Reset credentials for {passwordUser.name} (@{passwordUser.username})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleChangePassword} style={{ padding: '20px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min. 4 chars)"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="btn btn-light"
                    style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPass}
                    className="btn btn-primary"
                    style={{ 
                      fontSize: '13px', 
                      padding: '8px 20px', 
                      borderRadius: '8px', 
                      background: '#6366f1', 
                      borderColor: '#6366f1',
                      fontWeight: 600 
                    }}
                  >
                    {changingPass ? 'Saving...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal: Staff Login Activity Audit Trail */}
      {showActivityModal && (
        <ModalPortal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)}>
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
              maxWidth: '850px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              maxHeight: '85vh',
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
                  <div style={{ background: '#e0e7ff', padding: '6px', borderRadius: '6px', color: '#4f46e5' }}>
                    <History size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Staff Login Activity Audit Trail</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Real-time audit log of staff logins (user_account_activitys table)</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={handleOpenActivity}
                    className="btn btn-outline-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px' }}
                  >
                    <RefreshCw size={12} className={loadingActivity ? 'fa-spin' : ''} /> Refresh
                  </button>
                  <button 
                    onClick={() => setShowActivityModal(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#64748b' }}>Staff / User</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#64748b' }}>IP Address</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#64748b' }}>Browser / Client</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#64748b' }}>Platform</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#64748b' }}>Login Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingActivity ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                          <RefreshCw size={20} className="fa-spin" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                          Fetching audit log...
                        </td>
                      </tr>
                    ) : activityLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                          No staff login events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      activityLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>
                            {log.user_name || 'Staff User'}
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 400 }}>@{log.username || 'user'}</div>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#475569', fontFamily: 'monospace', fontSize: '11px' }}>
                            {log.ip_address || '127.0.0.1'}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#475569', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.user_browser}>
                            {log.user_browser || 'Chrome / Web'}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#475569' }}>
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                              {log.user_platform || 'Windows / Web'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '11px' }}>
                            {log.login_time || log.created_at || 'Recently'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
"""

if 'Modal: Staff Login Activity' not in code:
    code = code.replace(
        "    </div>\n  );\n}",
        modals_code + "\n    </div>\n  );\n}"
    )

with open('client/src/pages/TeamPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("TeamPage successfully enhanced with Password and Login Activity Audit!")
