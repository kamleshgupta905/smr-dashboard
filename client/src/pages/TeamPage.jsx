import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  X, 
  RefreshCw,
  UserCheck,
  Briefcase,
  KeyRound,
  History,
  Lock,
  Laptop,
  Globe,
  Clock,
  Shield,
  CheckSquare,
  Square
} from 'lucide-react';
import { getTeamMembers, createTeamMember, updateTeamMemberStatus, deleteTeamMember, changePassword, getTeamActivity, getMenuPermissions, saveMenuPermissions } from '../services/api';
import ModalPortal from '../components/ModalPortal';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
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

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    mobile_no: '',
    role_id: 2,
    status: 'Y'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getTeamMembers();
      if (res && res.success) {
        setMembers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNameChange = (name) => {
    const suggestedUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    setForm(prev => ({
      ...prev,
      name,
      username: prev.username ? prev.username : suggestedUsername
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      alert('Please fill in Name and Email.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createTeamMember({
        name: form.name.trim(),
        username: form.username.trim() || form.name.toLowerCase().replace(/\s+/g, ''),
        email: form.email.trim(),
        mobile_no: form.mobile_no.trim(),
        role_id: Number(form.role_id),
        status: form.status
      });

      if (res && res.success) {
        setShowAddModal(false);
        setForm({
          name: '',
          username: '',
          email: '',
          mobile_no: '',
          role_id: 2,
          status: 'Y'
        });
        await loadData();
      } else {
        alert(res?.message || 'Failed to add team member.');
      }
    } catch (err) {
      console.error('Failed to add team member:', err);
      alert('Error creating team member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === 'Y' ? 'N' : 'Y';
    try {
      await updateTeamMemberStatus(member.id, nextStatus);
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: nextStatus } : m));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name || 'this team member'} from the team directory?`)) {
      return;
    }
    try {
      await deleteTeamMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete team member:', err);
      alert('Failed to remove member.');
    }
  };

  const filtered = members.filter((m) => {
    const matchesSearch = 
      (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.role_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || String(m.role_id) === String(roleFilter);
    return matchesSearch && matchesRole;
  });

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Y').length;
  const adminCount = members.filter(m => Number(m.role_id) === 1).length;
  const pmCount = members.filter(m => Number(m.role_id) === 2 || Number(m.role_id) === 3).length;

  return (
    <div className="container-fluid" style={{ padding: '24px 28px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              color: '#fff', 
              padding: '10px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
                Team & Staff Directory
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                Employee directory (admin/team/list), user credentials, role-based access, and operational status
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={loadData} 
            className="btn btn-outline-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? 'fa-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleOpenActivity}
            className="btn btn-outline-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155' }}
            title="View Staff Login Activity Trail (user_account_activitys)"
          >
            <History size={14} />
            Login Audit
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '13px', 
              fontWeight: 600, 
              padding: '8px 18px', 
              borderRadius: '8px', 
              background: '#6366f1', 
              borderColor: '#6366f1',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <UserPlus size={16} />
            Add Team Member
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Members */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Staff</span>
              <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '8px', color: '#6366f1' }}>
                <Users size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {totalMembers}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Registered employees & staff
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Accounts</span>
              <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                <UserCheck size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
              {activeMembers}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Enabled for system access
            </div>
          </div>
        </div>

        {/* Super Admins */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Super Admins</span>
              <div style={{ background: '#f3e8ff', padding: '8px', borderRadius: '8px', color: '#7c3aed' }}>
                <ShieldCheck size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed' }}>
              {adminCount}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Full administrative privileges
            </div>
          </div>
        </div>

        {/* Project Managers & Ops */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Managers & Ops</span>
              <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '8px', color: '#0284c7' }}>
                <Briefcase size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7' }}>
              {pmCount}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Operations & delivery team
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Filter Controls */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Roles' },
              { id: '1', label: 'Super Admin' },
              { id: '2', label: 'Project Manager' },
              { id: '3', label: 'Bidding / Sales' },
              { id: '4', label: 'Operations Staff' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRoleFilter(r.id)}
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: roleFilter === r.id ? '#0f172a' : '#f8fafc',
                  color: roleFilter === r.id ? '#ffffff' : '#64748b',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                fontSize: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff Member</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role / Designation</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile No</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    <RefreshCw size={24} className="fa-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    Loading team members from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '50px 20px', textAlign: 'center' }}>
                    <Users size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>No team members found</div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px 0' }}>Click "Add Team Member" above to add staff to the directory.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isActive = m.status === 'Y';
                  const initials = (m.name || 'User')
                    .split(' ')
                    .map(w => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  let roleBadgeBg = '#f1f5f9';
                  let roleBadgeColor = '#475569';
                  if (Number(m.role_id) === 1) {
                    roleBadgeBg = '#f3e8ff';
                    roleBadgeColor = '#7c3aed';
                  } else if (Number(m.role_id) === 2) {
                    roleBadgeBg = '#e0f2fe';
                    roleBadgeColor = '#0284c7';
                  } else if (Number(m.role_id) === 3) {
                    roleBadgeBg = '#fef3c7';
                    roleBadgeColor = '#b45309';
                  }

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                              {m.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              @{m.username || 'user'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: roleBadgeBg,
                          color: roleBadgeColor,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {Number(m.role_id) === 1 && <ShieldCheck size={12} />}
                          {m.role_name || (Number(m.role_id) === 1 ? 'Super Admin' : 'Staff')}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={13} color="#94a3b8" />
                          <a href={`mailto:${m.email}`} style={{ color: '#4338ca', textDecoration: 'none' }}>
                            {m.email}
                          </a>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b' }}>
                        {m.mobile_no ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={13} color="#94a3b8" />
                            {m.mobile_no}
                          </div>
                        ) : '—'}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleToggleStatus(m)}
                          style={{
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '11px',
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#15803d' : '#b91c1c',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Click to toggle active status"
                        >
                          {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b' }}>
                        {m.createdAt ? m.createdAt.substring(0, 10) : 'N/A'}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenPermissions(m)}
                            className="btn btn-soft-warning btn-sm"
                            style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                            title="Manage Module Access & Permissions (ACL)"
                          >
                            <Shield size={12} /> Access
                          </button>
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Team Member */}
      {showAddModal && (
        <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
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
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#e0e7ff', padding: '6px', borderRadius: '6px', color: '#4f46e5' }}>
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Add Team Member</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Create staff profile and assign administrative role</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
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

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={form.mobile_no}
                      onChange={(e) => setForm({ ...form, mobile_no: e.target.value })}
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
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@vmhgroupsmr.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Role / Privilege Level
                    </label>
                    <select
                      value={form.role_id}
                      onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '13px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    >
                      <option value={1}>Super Admin</option>
                      <option value={2}>Project Manager</option>
                      <option value={3}>Bidding / Sales</option>
                      <option value={4}>Operations Staff</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Initial Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '13px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    >
                      <option value="Y">Active (Enabled)</option>
                      <option value="N">Inactive (Disabled)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-light"
                    style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
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
                    {submitting ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

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

    </div>
  );
}
