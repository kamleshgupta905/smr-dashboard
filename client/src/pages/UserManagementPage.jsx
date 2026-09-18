import React, { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../services/api';
import { Users as UsersIcon, Plus, Search, CheckCircle2, XCircle, Trash2, Shield, Circle, X } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', mobile_no: '', email: '', role: 'Admin' });
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
      setFormData({ name: '', username: '', mobile_no: '', email: '', role: 'Admin' });
      await loadData();
    } catch (err) {
      console.error('Failed to add user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
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
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Settings</span>
            <span className="separator">/</span>
            <span className="current">User Accounts</span>
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
              {filtered.length} Staff Accounts Active
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Add User
          </button>
        </div>
      </div>

      {/* Table (Dastone Report Card) */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="report-card-header">
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
            <input 
              type="text" 
              placeholder="Search name, username or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '34px', width: '100%', height: '34px', fontSize: '12px' }}
            />
          </div>

          <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
            {filtered.length} Total Users
          </span>
        </div>

        <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead className="thead-light">
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                <th>Name</th>
                <th>User Name</th>
                <th>Mobile No.</th>
                <th>Email</th>
                <th style={{ textAlign: 'center' }}>Role</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Login</th>
                <th style={{ textAlign: 'center', width: '90px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#8997bd' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#8997bd', fontSize: '13px' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user, idx) => (
                  <tr key={user.id || idx}>
                    <td style={{ textAlign: 'center', color: '#8997bd', fontSize: '12px', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13.5px' }}>{user.name}</td>
                    <td>
                      <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', fontSize: '11.5px' }}>
                        {user.username}
                      </span>
                    </td>
                    <td style={{ color: '#7081b9', fontSize: '12.5px' }}>{user.mobile_no || 'N/A'}</td>
                    <td style={{ color: '#303e67', fontSize: '12.5px' }}>{user.email || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-soft-primary" style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {user.role_name || user.role || 'Admin'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {user.is_active === 'Y' ? (
                        <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span className="pulse-dot" /> Active
                        </span>
                      ) : (
                        <span className="badge-soft-danger" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span className="pulse-dot pulse-danger" /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {user.is_online === 'Y' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#03d87f', fontSize: '11.5px', fontWeight: 700 }}>
                          <span className="pulse-dot" />
                          Online
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#8997bd', fontSize: '11.5px', fontWeight: 600 }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }}></span>
                          Offline
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-soft-danger btn-sm"
                        onClick={() => handleDelete(user.id)}
                        style={{ padding: '4px 8px', borderRadius: '4px' }}
                        title="Delete User"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Add New User</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', height: '38px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Username *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. jdoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', height: '38px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Mobile No.</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 9876543210"
                  value={formData.mobile_no}
                  onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', height: '38px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. jdoe@vmhgroupsmr.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', height: '38px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
