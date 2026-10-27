import React, { useState, useEffect, useMemo } from 'react';
import { 
  getUsers, 
  getRoles, 
  getAuditLogs, 
  getUserPermissions, 
  saveUserAndPermissions, 
  deleteUser, 
  updateUser 
} from '../services/api';
import { 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Key, 
  Activity, 
  RefreshCw, 
  ChevronRight, 
  Code, 
  ArrowLeft, 
  Upload, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import ModalPortal from '../components/ModalPortal';

// 100% Comprehensive Menu Hierarchy matching the exact SMR Platform Sidebar sections & MySQL schema
// Official Complete Menu Tree matching all Sidebar sections and exact clean style
export const MENU_TREE = [
  // MAIN
  { id: 1, name: 'Overview', section: 'Main' },
  { id: 7, name: 'Surveys', section: 'Main' },
  // PARTNERS
  { id: 6, name: 'Clients', section: 'Partners' },
  { id: 8, name: 'Vendors', section: 'Partners' },
  // OPERATIONS
  { id: 10, name: 'Vendor Payments', section: 'Operations & Payouts' },
  { id: 9, name: 'Traffic Leads Stream', section: 'Operations & Payouts' },
  { id: 11, name: 'Security & Fraud Gate', section: 'Operations & Payouts' },
  // MANAGEMENT
  { 
    id: 2, 
    name: 'User Management',
    section: 'System & Team',
    children: [
      { id: 3, name: 'User' },
      { id: 4, name: 'Menu Permission' },
      { id: 5, name: 'Change Password' }
    ]
  },
  { id: 12, name: 'Team Directory', section: 'System & Team' },
  { id: 13, name: 'Reference Data', section: 'System & Team' }
];

export const ALL_MENU_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const MENU_NAMES = {
  1: 'Overview',
  2: 'User Management',
  3: 'User',
  4: 'Menu Permission',
  5: 'Change Password',
  6: 'Clients',
  7: 'Surveys',
  8: 'Vendors',
  9: 'Traffic Leads Stream',
  10: 'Vendor Payments',
  11: 'Security & Fraud Gate',
  12: 'Team Directory',
  13: 'Reference Data'
};

const DEFAULT_ROLES = [
  { id: 1, role: 'Developer' },
  { id: 2, role: 'Admin' },
  { id: 3, role: 'User' },
  { id: 4, role: 'Customer' }
];

export default function UserManagementPage({ currentUser, onImpersonateUser, onExitImpersonation }) {
  // Navigation & View State: 'list' | 'addEdit'
  const [viewMode, setViewMode] = useState('list');
  const [editingUserId, setEditingUserId] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('accounts'); // 'accounts' | 'privileges' | 'audit'
  
  // Real Roles from MySQL `roles` table
  const [dbRoles, setDbRoles] = useState(DEFAULT_ROLES);

  // Form State matching screenshot `admin/user/addedit`
  const initialForm = {
    id: null,
    name: '',
    mobile_no: '',
    email: '',
    employee_type: 3, // Default role_id: 3 (User)
    supplier_id: '',
    username: '',
    password: '',
    confirm_password: '',
    profile_image: '',
    status: 'active',
    menu_permissions: [1, 6, 7, 8, 9, 10]
  };

  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Audit Logs State (8,814+ MySQL records)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(8814);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTableFilter, setAuditTableFilter] = useState('ALL');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(25);
  const [selectedAuditPayload, setSelectedAuditPayload] = useState(null);

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

  const loadRolesData = async () => {
    try {
      const res = await getRoles();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setDbRoles(res.data);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadRolesData();
  }, []);

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await getAuditLogs({
        table: auditTableFilter !== 'ALL' ? auditTableFilter : undefined,
        action: auditActionFilter !== 'ALL' ? auditActionFilter : undefined,
        search: auditSearch || undefined,
        limit: auditLimit,
        offset: (auditPage - 1) * auditLimit
      });
      if (res?.success) {
        setAuditLogs(res.data || []);
        if (res.total) setAuditTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeSubTab, auditTableFilter, auditActionFilter, auditPage, auditLimit, auditSearch]);

  // Browser Back Button & History Synchronization for Add/Edit View
  useEffect(() => {
    const handlePopState = (e) => {
      if (viewMode === 'addEdit') {
        setViewMode('list');
        setEditingUserId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewMode]);

  // Open Add User Screen
  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormData({
      ...initialForm,
      menu_permissions: [1, 6, 7, 8, 9, 10]
    });
    setFormError('');
    setFormSuccess('');
    window.history.pushState({ view: 'addEdit' }, '');
    setViewMode('addEdit');
  };

  // Open Edit User Screen
  const handleOpenEdit = async (user) => {
    setEditingUserId(user.id);
    setFormError('');
    setFormSuccess('');

    let permissions = user.menu_permissions || [];
    try {
      const permRes = await getUserPermissions(user.id);
      if (permRes?.menu_ids && Array.isArray(permRes.menu_ids)) {
        permissions = permRes.menu_ids;
      }
    } catch (e) {
      console.warn('Live permissions fetch fallback:', e);
    }

    setFormData({
      id: user.id,
      name: user.name || '',
      mobile_no: user.mobile_no || '',
      email: user.email || '',
      employee_type: user.role_id || (user.role_name === 'Developer' ? 1 : user.role_name === 'Admin' ? 2 : 3),
      supplier_id: user.supplier_id || '',
      username: user.username || '',
      password: '',
      confirm_password: '',
      profile_image: user.profile_image || '',
      status: (user.is_active === 'N' || user.status === 'inactive') ? 'inactive' : 'active',
      menu_permissions: permissions
    });

    window.history.pushState({ view: 'addEdit', userId: user.id }, '');
    setViewMode('addEdit');
  };

  const handleCloseAddEdit = () => {
    setViewMode('list');
    setEditingUserId(null);
  };

  // Permission Checkbox Toggle Logic supporting all 13 sidebar modules
  const handleToggleMenu = (menuId) => {
    setFormData(prev => {
      const current = prev.menu_permissions || [];
      const idNum = Number(menuId);

      // Parent toggle: User Management (id: 2)
      if (idNum === 2) {
        const isParentChecked = current.includes(2);
        if (isParentChecked) {
          return {
            ...prev,
            menu_permissions: current.filter(id => ![2, 3, 4, 5].includes(id))
          };
        } else {
          const merged = Array.from(new Set([...current, 2, 3, 4, 5]));
          return {
            ...prev,
            menu_permissions: merged
          };
        }
      }

      // Child toggle: User Accounts (3), Role & Menu Privileges (4), Change Password (5)
      if ([3, 4, 5].includes(idNum)) {
        let updated;
        if (current.includes(idNum)) {
          updated = current.filter(id => id !== idNum);
          if (![3, 4, 5].some(c => updated.includes(c))) {
            updated = updated.filter(id => id !== 2);
          }
        } else {
          updated = Array.from(new Set([...current, idNum, 2]));
        }
        return { ...prev, menu_permissions: updated };
      }

      // All root platform modules (1, 6, 7, 8, 9, 10, 11, 12, 13)
      if (current.includes(idNum)) {
        return {
          ...prev,
          menu_permissions: current.filter(id => id !== idNum)
        };
      } else {
        return {
          ...prev,
          menu_permissions: [...current, idNum]
        };
      }
    });
  };

  const handleSelectAllMenus = () => {
    setFormData(prev => ({
      ...prev,
      menu_permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    }));
  };

  const handleDeselectAllMenus = () => {
    setFormData(prev => ({
      ...prev,
      menu_permissions: []
    }));
  };

  // Image Upload handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Image size should be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save / Update User and Menu Permissions
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!formData.username.trim()) {
      setFormError('Username is required.');
      return;
    }

    if (formData.password) {
      if (formData.password !== formData.confirm_password) {
        setFormError('Password and Confirm Password do not match.');
        return;
      }
    } else if (!formData.id) {
      setFormError('Password is required for creating a new user.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: formData.id,
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim() || null,
        mobile_no: formData.mobile_no.trim() || null,
        role_id: Number(formData.employee_type),
        employee_type: Number(formData.employee_type),
        supplier_id: formData.supplier_id.trim() || null,
        password: formData.password || undefined,
        profile_image: formData.profile_image || null,
        status: formData.status,
        is_active: formData.status === 'active' ? 'Y' : 'N',
        menu_permissions: formData.menu_permissions
      };

      const res = await saveUserAndPermissions(payload);
      if (res?.success) {
        setFormSuccess(res.message || 'User and menu permissions saved successfully!');
        await loadData();
        setTimeout(() => {
          setViewMode('list');
          setEditingUserId(null);
        }, 800);
      } else {
        setFormError(res?.message || 'Failed to save user. Please check your inputs.');
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setFormError('Failed to communicate with database server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle User Active / Inactive Status
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

  // Delete User
  const handleDelete = async (id) => {
    if (id === 1 || id === 18) {
      alert('Super Administrator accounts are protected and cannot be deleted.');
      return;
    }
    if (!window.confirm('Are you sure you want to permanently delete this user account and their menu permissions?')) return;
    try {
      const res = await deleteUser(id);
      if (res?.success) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert(res?.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const filtered = useMemo(() => {
    const term = (search || '').toLowerCase().trim();
    if (!term) return users;
    return users.filter(u => 
      (u.name || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.role_name || u.role || '').toLowerCase().includes(term)
    );
  }, [users, search]);

  const superAdmins = users.filter(u => (u.role_name || u.role) === 'Developer' || (u.role_name || u.role) === 'Super Admin' || u.id === 1).length;
  const activeStaff = users.filter(u => u.is_active !== 'N' && u.status !== 'inactive').length;

  // RBAC Matrix Reference
  const permissionsMatrix = [
    { module: 'Overview (Dashboard)', action: 'View executive metrics, live quota telemetry & capacity histogram', dev: true, admin: true, user: true, cust: true },
    { module: 'Surveys & Inventory', action: 'Launch inventory, quotas, qualifications, clones & survey links', dev: true, admin: true, user: true, cust: true },
    { module: 'Clients Hub', action: 'Direct S2S Demand API, Client Secret Keys, security toggles & specs', dev: true, admin: true, user: false, cust: false },
    { module: 'Vendors Hub', action: 'Supply partner redirects, traffic hash formula & revenue share', dev: true, admin: true, user: false, cust: false },
    { module: 'Vendor Payments', action: 'Vendor invoices, net balances, payment reconciliation & settlement', dev: true, admin: true, user: false, cust: false },
    { module: 'Traffic Leads Stream', action: 'Real-time clicks, completes, IP fraud scoring & conversion logs', dev: true, admin: true, user: true, cust: false },
    { module: 'Security & Fraud Gate', action: 'VPN/proxy firewall, demographic pre-screener rules & IP blacklists', dev: true, admin: true, user: false, cust: false },
    { module: 'User Management', action: 'Staff user accounts, employee permissions & platform security access', dev: true, admin: true, user: false, cust: false },
    { module: 'Team Directory', action: 'Organizational staff directory, contact roster & departments', dev: true, admin: true, user: true, cust: false },
    { module: 'Reference Data', action: 'Platform lookup tables, questions, countries & global mappings', dev: true, admin: true, user: false, cust: false }
  ];

  // =========================================================================
  // VIEW: CREATE / EDIT USER (Matching screenshot addedit)
  // =========================================================================
  const isAdminOrDev = !currentUser || 
    currentUser.role_id === 1 || 
    currentUser.role_name === 'Developer' || 
    currentUser.role === 'Developer' || 
    currentUser.role_name === 'Admin' || 
    currentUser.username === 'admin' || 
    currentUser.username === 'vmhgroup';

  if (!isAdminOrDev) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', margin: '24px auto', maxWidth: '640px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldCheck size={32} color="#D97706" />
        </div>
        <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          Super Administrator Privilege Required
        </h3>
        <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.6', marginBottom: '22px' }}>
          You are currently viewing this session as <strong>{currentUser?.name || currentUser?.username}</strong> ({currentUser?.role_name || currentUser?.role || 'Staff'}). User management, account creation and privilege matrix allocation are restricted to Super Administrators.
        </p>
        {onExitImpersonation && (
          <button
            type="button"
            onClick={onExitImpersonation}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: '0 2px 8px rgba(15,23,42,0.15)'
            }}
          >
            Exit Preview & Return to Super Admin
          </button>
        )}
      </div>
    );
  }

  if (viewMode === 'addEdit') {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* Breadcrumb Trail */}
        <div className="breadcrumb-trail" style={{ marginBottom: '14px' }}>
          <span className="link" onClick={handleCloseAddEdit} style={{ cursor: 'pointer' }}>VMH</span>
          <span className="separator">/</span>
          <span className="link" onClick={handleCloseAddEdit} style={{ cursor: 'pointer' }}>User Management</span>
          <span className="separator">/</span>
          <span className="current">{editingUserId ? 'Edit User' : 'Create User'}</span>
        </div>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button" 
              onClick={handleCloseAddEdit}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px' }}
              title="Return to User List"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
              {editingUserId ? 'Edit User' : 'Create User'}
            </h3>
          </div>

          <span className="badge-soft-primary" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
            MySQL Real-time Sync Active
          </span>
        </div>

        {/* Feedback Alerts */}
        {formError && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#059669', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <CheckCircle2 size={16} />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSaveUser}>
          {/* Card: Basic Information */}
          <div className="card report-card" style={{ padding: '24px', marginBottom: '22px', borderRadius: '6px' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                Basic Information
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Enter user details and system credentials.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-control"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              {/* Mobile No */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Mobile No
                </label>
                <input 
                  type="text" 
                  placeholder="Enter mobile number"
                  value={formData.mobile_no}
                  onChange={e => setFormData({ ...formData, mobile_no: e.target.value })}
                  className="input-control"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Email
                </label>
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-control"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              {/* Employee Type (Roles dropdown from MySQL `roles`) */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Employee Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select 
                  value={formData.employee_type} 
                  onChange={e => {
                    const newType = Number(e.target.value);
                    let perms = formData.menu_permissions;
                    if (!formData.id) {
                      if (newType === 1 || newType === 2) {
                        perms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
                      } else if (newType === 8) {
                        perms = [1, 7, 9, 10];
                      } else {
                        perms = [1, 6, 7, 8, 9, 10];
                      }
                    }
                    setFormData({ ...formData, employee_type: newType, menu_permissions: perms });
                  }}
                  className="input-control"
                  style={{ width: '100%', height: '38px', fontSize: '13px', background: '#ffffff' }}
                >
                  {dbRoles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier Id */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Supplier Id
                </label>
                <input 
                  type="text" 
                  placeholder="Enter Supplier ID (e.g. VND-001)"
                  value={formData.supplier_id}
                  onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="input-control"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Username <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="input-control"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Password {editingUserId ? '(Leave blank to keep unchanged)' : <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="input-control"
                    style={{ width: '100%', height: '38px', fontSize: '13px', paddingRight: '38px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8997bd', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="Confirm password"
                    value={formData.confirm_password}
                    onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="input-control"
                    style={{ width: '100%', height: '38px', fontSize: '13px', paddingRight: '38px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8997bd', cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Profile Picture */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Profile Picture
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {formData.profile_image ? (
                    <img 
                      src={formData.profile_image} 
                      alt="Profile Preview" 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0F172A' }} 
                    />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <Users size={22} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input-control"
                    style={{ maxWidth: '320px', height: '38px', fontSize: '12px', padding: '5px' }}
                  />
                  {formData.profile_image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, profile_image: '' })}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Assign Menu Permissions (Clean unified tree matching original design + all sidebar items) */}
          <div className="card report-card" style={{ padding: '24px', marginBottom: '22px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                  Assign Menu Permissions
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Configure hierarchical menu permissions for this user account.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSelectAllMenus}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11.5px', padding: '4px 10px', fontWeight: 600 }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllMenus}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11.5px', padding: '4px 10px', fontWeight: 600 }}
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Dotted Tree Hierarchy */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '18px 24px'
            }}>
              {MENU_TREE.map((node, idx) => {
                const isChecked = (formData.menu_permissions || []).includes(node.id);
                const hasChildren = node.children && node.children.length > 0;
                const prevNode = idx > 0 ? MENU_TREE[idx - 1] : null;
                const isNewSection = !prevNode || prevNode.section !== node.section;

                return (
                  <React.Fragment key={node.id}>
                    {isNewSection && (
                      <div style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: '#64748b',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                        margin: idx === 0 ? '0 0 8px 0' : '16px 0 8px 0',
                        paddingTop: idx === 0 ? 0 : '12px',
                        borderTop: idx === 0 ? 'none' : '1px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#94a3b8' }} />
                        <span>{node.section}</span>
                      </div>
                    )}

                    <div style={{ marginBottom: hasChildren ? '10px' : '8px' }}>
                      {/* Node Row */}
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: isChecked ? '#0F172A' : '#1e293b',
                        padding: '4px 0'
                      }}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMenu(node.id)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#0F172A'
                          }}
                        />
                        <span>{node.name}</span>
                      </label>

                      {/* Dotted Nested Children (Tree branch lines) */}
                      {hasChildren && (
                        <div style={{
                          marginLeft: '26px',
                          paddingLeft: '18px',
                          borderLeft: '1.5px dashed #cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          marginTop: '4px',
                          marginBottom: '8px'
                        }}>
                          {node.children.map(child => {
                            const childChecked = (formData.menu_permissions || []).includes(child.id);
                            return (
                              <div key={child.id} style={{ position: 'relative' }}>
                                {/* Horizontal dotted connector branch */}
                                <span style={{
                                  position: 'absolute',
                                  left: '-18px',
                                  top: '50%',
                                  width: '12px',
                                  borderTop: '1.5px dashed #cbd5e1'
                                }} />
                                
                                <label style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  fontSize: '13px',
                                  color: childChecked ? '#0F172A' : '#334155',
                                  padding: '3px 0'
                                }}>
                                  <input 
                                    type="checkbox"
                                    checked={childChecked}
                                    onChange={() => handleToggleMenu(child.id)}
                                    style={{
                                      width: '15px',
                                      height: '15px',
                                      cursor: 'pointer',
                                      accentColor: '#0F172A'
                                    }}
                                  />
                                  <span>{child.name}</span>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="submit" 
              disabled={submitting}
              className="btn btn-primary"
              style={{
                padding: '9px 24px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '4px',
                background: '#0F172A',
                borderColor: '#0F172A'
              }}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Saving...
                </>
              ) : (
                <>Submit</>
              )}
            </button>

            <button 
              type="button"
              onClick={handleCloseAddEdit}
              className="btn btn-secondary"
              style={{
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '4px'
              }}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW: LIST OF USERS (Default table view)
  // =========================================================================
  return (
    <div>
      {/* Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Administration</span>
            <span className="separator">/</span>
            <span className="current">Team & Users</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">Team & Users</h4>
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
              {activeStaff} Active Accounts
            </span>
          </div>
        </div>

        <div className="title-box-actions" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Add User
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Total Users</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{users.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <span className="pulse-dot" /> Verified MySQL Accounts
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
            Full Authority Access
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Employee Roles</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <Lock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{dbRoles.length} Tiers</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <CheckCircle2 size={12} /> Granular Menu Allocation
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Database Sync</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(253, 171, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fdab3d' }}>
              <Key size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>Active</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#0F172A' }}>
            MySQL Live Tables Connected
          </div>
        </div>
      </div>

      {/* Sub Tabs: Staff Accounts vs RBAC Matrix vs Audit Trail */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('accounts')}
          style={{
            background: activeSubTab === 'accounts' ? '#0F172A' : 'transparent',
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
          <Users size={14} /> User Accounts ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('privileges')}
          style={{
            background: activeSubTab === 'privileges' ? '#0F172A' : 'transparent',
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
          <ShieldCheck size={14} /> Permissions Matrix
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('audit')}
          style={{
            background: activeSubTab === 'audit' ? '#0F172A' : 'transparent',
            color: activeSubTab === 'audit' ? '#ffffff' : '#64748b',
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
          <Activity size={14} /> Audit Trail ({auditTotal.toLocaleString()} Logs)
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
                placeholder="Search by name, username, email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '38px', width: '100%', height: '34px', fontSize: '12px' }}
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
                  <th style={{ textAlign: 'center' }}>Employee Type</th>
                  <th>Assigned Menus</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#8997bd' }}>
                      <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                      Loading staff accounts from MySQL...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#8997bd', fontSize: '13px' }}>
                      No staff users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, idx) => {
                    const isActive = (user.is_active !== 'N' && user.status !== 'inactive');
                    const role = user.role_name || user.role || 'User';
                    const perms = Array.isArray(user.menu_permissions) ? user.menu_permissions : [];

                    return (
                      <tr key={user.id || idx}>
                        <td style={{ textAlign: 'center', color: '#8997bd', fontSize: '12px', fontWeight: 600 }}>{user.id || idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {user.profile_image ? (
                              <img src={user.profile_image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                {(user.name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13px' }}>{user.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', fontSize: '11.5px' }}>
                            {user.username}
                          </span>
                        </td>
                        <td style={{ color: '#303e67', fontSize: '12.5px' }}>{user.email || '—'}</td>
                        <td style={{ color: '#7081b9', fontSize: '12.5px' }}>{user.mobile_no || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: role === 'Developer' ? 'rgba(3, 216, 127, 0.12)' : 'rgba(15, 23, 42, 0.1)',
                            color: role === 'Developer' ? '#03d87f' : '#0F172A',
                            border: `1px solid ${role === 'Developer' ? 'rgba(3, 216, 127, 0.3)' : 'rgba(15, 23, 42, 0.3)'}`
                          }}>
                            {role}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '320px' }}>
                            {role === 'Developer' || user.id === 1 ? (
                              <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                                All Menus (Super Admin)
                              </span>
                            ) : perms.length > 0 ? (
                              perms.slice(0, 4).map(mId => (
                                <span key={mId} style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                  {MENU_NAMES[mId] || `Menu #${mId}`}
                                </span>
                              )).concat(perms.length > 4 ? [
                                <span key="more" style={{ fontSize: '10px', background: '#e2e8f0', color: '#64748b', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                  +{perms.length - 4} more
                                </span>
                              ] : [])
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>None</span>
                            )}
                          </div>
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
                              className="btn btn-soft-success btn-sm"
                              onClick={() => onImpersonateUser && onImpersonateUser(user)}
                              style={{ padding: '4px 7px', borderRadius: '4px', color: '#16A34A', background: '#DCFCE7', border: '1px solid #BBF7D0' }}
                              title="View this User's Dashboard (Live Impersonation)"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              className="btn btn-soft-primary btn-sm"
                              onClick={() => handleOpenEdit(user)}
                              style={{ padding: '4px 7px', borderRadius: '4px' }}
                              title="Edit User & Permissions"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => handleDelete(user.id)}
                              style={{ padding: '4px 7px', borderRadius: '4px' }}
                              title="Delete User"
                              disabled={user.id === 1 || user.id === 18}
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
              <ShieldCheck size={18} color="#0F172A" /> Role-Based Access Control (RBAC) Permissions Matrix
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Access privileges are isolated per role and customizable via Menu Permissions:
            </p>
          </div>

          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead className="thead-light">
                <tr>
                  <th>Platform Capability / Module</th>
                  <th>Permission Scope</th>
                  <th style={{ textAlign: 'center', width: '120px', color: '#16a34a' }}>Developer</th>
                  <th style={{ textAlign: 'center', width: '120px', color: '#0F172A' }}>Admin</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>User</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Customer</th>
                </tr>
              </thead>
              <tbody>
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13px' }}>{item.module}</td>
                    <td style={{ color: '#475569', fontSize: '12px' }}>{item.action}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-soft-success" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                        <Check size={13} style={{ display: 'inline', marginRight: '2px' }} /> Granted
                      </span>
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
                      {item.user ? (
                        <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          <Check size={13} style={{ display: 'inline', marginRight: '2px' }} /> Granted
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '16px' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.cust ? (
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

      {/* TAB 3: TEAM ACTIVITY AUDIT TRAIL (Real MySQL `log_table` - 8,814+ Logs) */}
      {activeSubTab === 'audit' && (
        <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header & Filter Bar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#0F172A" /> Live Team Activity Audit Trail & Change Log
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Total <strong>{auditTotal.toLocaleString()}</strong> immutable audit logs registered in MySQL database.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
                <input
                  type="text"
                  placeholder="Search logs, IP, ID..."
                  value={auditSearch}
                  onChange={e => { setAuditSearch(e.target.value); setAuditPage(1); }}
                  className="input-control"
                  style={{ paddingLeft: '34px', height: '32px', fontSize: '11.5px', width: '180px' }}
                />
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadAuditLogs}
                title="Refresh Audit Logs"
                style={{ padding: '5px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} className={auditLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Subfilter chips */}
          <div style={{ padding: '10px 20px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Target Table:</span>
              {['ALL', 'projects', 'payments', 'vendor', 'client', 'users'].map(tbl => (
                <button
                  key={tbl}
                  type="button"
                  className={`btn btn-sm ${auditTableFilter === tbl ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setAuditTableFilter(tbl); setAuditPage(1); }}
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  {tbl}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Action:</span>
              {['ALL', 'Insert', 'Update', 'Duplicate', 'Delete'].map(act => (
                <button
                  key={act}
                  type="button"
                  className={`btn btn-sm ${auditActionFilter === act ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setAuditActionFilter(act); setAuditPage(1); }}
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead className="thead-light">
                <tr>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                  <th>Target Entity</th>
                  <th>Record ID</th>
                  <th>User / Operator</th>
                  <th>Client IP Address</th>
                  <th>Browser & Platform</th>
                  <th style={{ textAlign: 'center' }}>Data Payload</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                      <div className="spinner" style={{ margin: '0 auto 12px' }} />
                      Streaming audit trail logs from MySQL `log_table`...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8997bd' }}>
                      No audit records found matching current filters.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => {
                    const actColor = log.action === 'Insert' ? '#10b981' :
                                     log.action === 'Update' ? '#0F172A' :
                                     log.action === 'Duplicate' ? '#9333ea' : '#ef4444';
                    const actBg = log.action === 'Insert' ? 'rgba(16, 185, 129, 0.12)' :
                                  log.action === 'Update' ? 'rgba(15, 23, 42, 0.12)' :
                                  log.action === 'Duplicate' ? 'rgba(147, 51, 234, 0.12)' : 'rgba(239, 68, 68, 0.12)';
                    return (
                      <tr key={log.id}>
                        <td>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                            {log.log_date}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: actBg,
                            color: actColor
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#334155', fontSize: '12.5px' }}>{log.table_name}</td>
                        <td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '12px' }}>#{log.row_id}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b', fontSize: '12.5px' }}>{log.user_name || 'System / Admin'}</td>
                        <td style={{ fontFamily: 'monospace', color: '#475569', fontSize: '11.5px' }}>{log.ip_address}</td>
                        <td style={{ color: '#64748b', fontSize: '11.5px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.user_browser}>
                          {log.user_browser}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedAuditPayload(log)}
                            style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Inspect diff payload"
                          >
                            <Code size={11} /> View Diff
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing Page {auditPage} of {Math.ceil(auditTotal / auditLimit)} ({auditTotal.toLocaleString()} total logs)
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={auditPage <= 1 || auditLoading}
                onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                style={{ fontSize: '11.5px', padding: '5px 10px' }}
              >
                Previous
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={auditPage * auditLimit >= auditTotal || auditLoading}
                onClick={() => setAuditPage(p => p + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 10px' }}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG PAYLOAD INSPECTION MODAL */}
      {selectedAuditPayload && (
        <ModalPortal isOpen={Boolean(selectedAuditPayload)} onClose={() => setSelectedAuditPayload(null)}>
          <div className="modal-overlay" onClick={() => setSelectedAuditPayload(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '92%' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={16} color="#0F172A" /> Audit Log #{selectedAuditPayload.id} Details
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Action: <strong>{selectedAuditPayload.action}</strong> on <strong>{selectedAuditPayload.table_name}</strong> (Row #{selectedAuditPayload.row_id})
                  </p>
                </div>
                <button onClick={() => setSelectedAuditPayload(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Timestamp: </span>
                    <strong>{selectedAuditPayload.log_date}</strong>
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>User / Actor: </span>
                    <strong>{selectedAuditPayload.user_name}</strong>
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>IP Address: </span>
                    <strong style={{ fontFamily: 'monospace' }}>{selectedAuditPayload.ip_address}</strong>
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Device / Browser: </span>
                    <strong>{selectedAuditPayload.user_browser}</strong>
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  State Diff / Data Payload:
                </label>
                <pre style={{
                  background: '#0f172a',
                  color: '#94A3B8',
                  padding: '14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  margin: 0
                }}>
                  {JSON.stringify(selectedAuditPayload.parsed_data || selectedAuditPayload.data_array, null, 2)}
                </pre>
              </div>

              <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAuditPayload(null)}
                  style={{ padding: '6px 16px', fontSize: '12px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
