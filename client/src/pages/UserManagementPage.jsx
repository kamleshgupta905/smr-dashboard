import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import { 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Shield, 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Key,
  ShieldAlert,
  Info
} from 'lucide-react';
import ModalPortal from '../components/ModalPortal';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('accounts'); // 'accounts' | 'privileges'
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    mobile_no: '', 
    email: '', 
    role: 'Admin',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const res = await getUsers();
      const list = res?.data || res || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) return;
    setSubmitting(true);
    try {
      await createUser(formData);
      setShowAddModal(false);
      setFormData({ name: '', username: '', mobile_no: '', email: '', role: 'Admin', status: 'active' });
      await loadData();
    } catch (err) {
      console.error('Failed to add user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      mobile_no: user.mobile_no || '',
      email: user.email || '',
      role: user.role_name || user.role || 'Admin',
      status: (user.is_active === 'N' || user.status === 'inactive') ? 'inactive' : 'active'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await updateUser(editingUser.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        mobile_no: formData.mobile_no,
        role: formData.role,
        role_name: formData.role,
        status: formData.status,
        is_active: formData.status === 'active' ? 'Y' : 'N'
      });
      setEditingUser(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isCurrentlyActive = (user.is_active !== 'N' && user.status !== 'inactive');
    const newStatus = isCurrentlyActive ? 'inactive' : 'active';
    try {
      await updateUser(user.id, {
        status: newStatus,
        is_active: newStatus === 'active' ? 'Y' : 'N'
      });
      setUsers(prev => prev.map(u => u.id === user.id ? { 
        ...u, 
        status: newStatus, 
        is_active: newStatus === 'active' ? 'Y' : 'N' 
      } : u));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff user account?')) return;
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const filtered = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || u.role_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const superAdmins = users.filter(u => (u.role || u.role_name) === 'Super Admin').length;
  const activeStaff = users.filter(u => u.is_active !== 'N' && u.status !== 'inactive').length;

  // RBAC Privileges Matrix Definition
  const permissionsMatrix = [
    {
      module: 'Zamplia Survey Marketplace',
      action: 'Sync Live Inventory, View Quotas & Demographics',
      superAdmin: true,
      admin: true,
      pm: true,
      traffic: true
    },
    {
      module: 'Supply Vendor Management',
      action: 'Add New Panels, Edit 4 Callback Redirect URLs & Hash Keys',
      superAdmin: true,
      admin: true,
      pm: false,
      traffic: false
    },
    {
      module: 'Demand Client S2S Integration',
      action: 'Create Clients, Sync Webhooks & Endpoints',
      superAdmin: true,
      admin: true,
      pm: false,
      traffic: false
    },
    {
      module: 'Security & Fraud Screening Engine',
      action: 'Modify Bot, VPN/Proxy, Speeder & Device Rules',
      superAdmin: true,
      admin: true,
      pm: false,
      traffic: false
    },
    {
      module: 'Pre-Screener Sandbox Gate',
      action: 'Execute Live Bot & Device Pre-Screener Tests',
      superAdmin: true,
      admin: true,
      pm: true,
      traffic: true
    },
    {
      module: 'User Management & Access Control',
      action: 'Create Staff Accounts, Assign Roles & Revoke Access',
      superAdmin: true,
      admin: false,
      pm: false,
      traffic: false
    },
    {
      module: 'Google Sheets Live Database Push',
      action: 'Direct Push, Sync All Tables & Access Credentials',
      superAdmin: true,
      admin: true,
      pm: false,
      traffic: false
    },
    {
      module: 'Audit & Reconciliation Logs',
      action: 'View Complete Transaction Logs & Financials',
      superAdmin: true,
      admin: true,
      pm: true,
      traffic: false
    }
  ];

  return (
    <div>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Administration</span>
            <span className="separator">/</span>
            <span className="current">Access Privileges</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              User Management & Access Privileges
            </h4>
            <span className="badge-soft-success" style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span className="pulse-dot" />
              {activeStaff} Active Staff Accounts
            </span>
          </div>
        </div>

        <div className="title-box-actions" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormData({ name: '', username: '', mobile_no: '', email: '', role: 'Admin', status: 'active' });
              setShowAddModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Add Staff User
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Total Staff Users</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{users.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <span className="pulse-dot" /> Verified Access Control
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Super Admins</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(3, 216, 127, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#03d87f' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{superAdmins}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#8997bd' }}>
            Root Platform Authority
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>RBAC Security Roles</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <Lock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>4 Tiers</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <CheckCircle2 size={12} /> Strict Privilege Isolation
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Google Sheet Sync</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(253, 171, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fdab3d' }}>
              <Key size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>Active</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#1761fd' }}>
            Users Tab Synced Live
          </div>
        </div>
      </div>

      {/* Sub Tabs: Staff Accounts vs RBAC Matrix */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('accounts')}
          style={{
            background: activeSubTab === 'accounts' ? '#1761fd' : 'transparent',
            color: activeSubTab === 'accounts' ? '#ffffff' : '#64748b',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Users size={14} /> Staff Accounts ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('privileges')}
          style={{
            background: activeSubTab === 'privileges' ? '#1761fd' : 'transparent',
            color: activeSubTab === 'privileges' ? '#ffffff' : '#64748b',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ShieldCheck size={14} /> Access Privileges & RBAC Matrix
        </button>
      </div>

      {/* TAB 1: USERS TABLE */}
      {activeSubTab === 'accounts' && (
        <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="report-card-header">
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
              <input 
                type="text" 
                placeholder="Search staff by name, username, email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '34px', width: '100%', height: '34px', fontSize: '12px' }}
              />
            </div>

            <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
              {filtered.length} Users Listed
            </span>
          </div>

          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead className="thead-light">
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Contact Email</th>
                  <th>Mobile</th>
                  <th style={{ textAlign: 'center' }}>Assigned Role</th>
                  <th style={{ textAlign: 'center' }}>Account Status</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#8997bd' }}>
                      <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                      Loading staff accounts...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#8997bd', fontSize: '13px' }}>
                      No staff users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, idx) => {
                    const isActive = (user.is_active !== 'N' && user.status !== 'inactive');
                    const role = user.role_name || user.role || 'Admin';
                    return (
                      <tr key={user.id || idx}>
                        <td style={{ textAlign: 'center', color: '#8997bd', fontSize: '12px', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13.5px' }}>{user.name}</td>
                        <td>
                          <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', fontSize: '11.5px' }}>
                            {user.username}
                          </span>
                        </td>
                        <td style={{ color: '#303e67', fontSize: '12.5px' }}>{user.email || 'N/A'}</td>
                        <td style={{ color: '#7081b9', fontSize: '12.5px' }}>{user.mobile_no || 'N/A'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: role === 'Super Admin' ? 'rgba(3, 216, 127, 0.12)' : 'rgba(23, 97, 253, 0.1)',
                            color: role === 'Super Admin' ? '#03d87f' : '#1761fd',
                            border: `1px solid ${role === 'Super Admin' ? 'rgba(3, 216, 127, 0.3)' : 'rgba(23, 97, 253, 0.3)'}`
                          }}>
                            {role}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            title="Click to toggle Active / Inactive status"
                          >
                            {isActive ? (
                              <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span className="pulse-dot" /> Active
                              </span>
                            ) : (
                              <span className="badge-soft-danger" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span className="pulse-dot pulse-danger" /> Inactive
                              </span>
                            )}
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              className="btn btn-soft-primary btn-sm"
                              onClick={() => handleOpenEdit(user)}
                              style={{ padding: '4px 7px', borderRadius: '4px' }}
                              title="Edit User & Roles"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => handleDelete(user.id)}
                              style={{ padding: '4px 7px', borderRadius: '4px' }}
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACCESS PRIVILEGES & RBAC PERMISSIONS MATRIX */}
      {activeSubTab === 'privileges' && (
        <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#1761fd" /> Role-Based Access Control (RBAC) Permissions Matrix
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Har staff account ke privilege levels unke assigned role ke hisaab se isolate rehte hain:
            </p>
          </div>

          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead className="thead-light">
                <tr>
                  <th>Platform Capability / Module</th>
                  <th>Permission Scope</th>
                  <th style={{ textAlign: 'center', width: '130px', color: '#16a34a' }}>Super Admin</th>
                  <th style={{ textAlign: 'center', width: '130px', color: '#1761fd' }}>Admin</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Project Mgr</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Traffic Lead</th>
                </tr>
              </thead>
              <tbody>
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13px' }}>{item.module}</td>
                    <td style={{ color: '#475569', fontSize: '12px' }}>{item.action}</td>
                    <td style={{ textAlign: 'center' }}>
                      {item.superAdmin ? (
                        <span className="badge-soft-success" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          <Check size={13} style={{ display: 'inline', marginRight: '2px' }} /> Granted
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '16px' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.admin ? (
                        <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          <Check size={13} style={{ display: 'inline', marginRight: '2px' }} /> Granted
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '16px' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.pm ? (
                        <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          <Check size={13} style={{ display: 'inline', marginRight: '2px' }} /> Granted
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '16px' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.traffic ? (
                        <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          <Check size={13} style={{ display: 'inline', marginRight: '2px' }} /> Granted
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '16px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Add Staff User</h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>Create a new team member and assign access privileges.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAdd}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Username *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. ramesh_k"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email</label>
                      <input 
                        type="email" 
                        placeholder="staff@vmhgroup.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mobile No.</label>
                      <input 
                        type="text" 
                        placeholder="+91 98765 43210"
                        value={formData.mobile_no}
                        onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Privilege Role *</label>
                      <select 
                        value={formData.role} 
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="input-field"
                        style={{ width: '100%' }}
                      >
                        <option value="Super Admin">Super Admin (Root Access)</option>
                        <option value="Admin">Admin (Operations Manager)</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Traffic Lead">Traffic Specialist</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Status</label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="input-field"
                        style={{ width: '100%' }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ fontWeight: 700 }}>
                      {submitting ? 'Creating...' : 'Save User Account'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <ModalPortal isOpen={!!editingUser} onClose={() => setEditingUser(null)}>
          <div className="modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Edit Staff Account</h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>Modify details and privilege roles for {editingUser.name}.</p>
                </div>
                <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Username *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mobile No.</label>
                      <input 
                        type="text" 
                        value={formData.mobile_no}
                        onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Privilege Role *</label>
                      <select 
                        value={formData.role} 
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="input-field"
                        style={{ width: '100%' }}
                      >
                        <option value="Super Admin">Super Admin (Root Access)</option>
                        <option value="Admin">Admin (Operations Manager)</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Traffic Lead">Traffic Specialist</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Status</label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="input-field"
                        style={{ width: '100%' }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ fontWeight: 700 }}>
                      {submitting ? 'Saving...' : 'Update User Account'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
