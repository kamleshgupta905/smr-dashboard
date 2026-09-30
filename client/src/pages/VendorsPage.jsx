import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Search,
  ShieldCheck,
  DollarSign,
  Activity,
  ArrowUpRight,
  Trash2,
  Link2,
  ExternalLink,
  Settings,
  Shield,
  Key,
  Info,
  CheckCheck
} from 'lucide-react';
import { getVendors, createVendor, updateVendor, deleteVendor, DEFAULT_VENDORS } from '../services/api';
import ModalPortal from '../components/ModalPortal';

export default function VendorsPage() {
  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');

  // Editing vendor redirects & security modal state
  const [editingVendor, setEditingVendor] = useState(null);
  const [redirectForm, setRedirectForm] = useState({
    redirect_complete: '',
    redirect_terminate: '',
    redirect_overquota: '',
    redirect_security: '',
    hash_algorithm: 'SHA3-256',
    secret_key: ''
  });
  const [testUid, setTestUid] = useState('TEST_RESP_7721');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingRedirects, setSavingRedirects] = useState(false);

  // Form State for Add Vendor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vendor_code: '',
    cpi: 1.50,
    status: 'active',
    redirect_complete: '',
    redirect_terminate: '',
    redirect_overquota: '',
    redirect_security: '',
    hash_algorithm: 'SHA3-256',
    secret_key: ''
  });
  const [showAddRedirectsTab, setShowAddRedirectsTab] = useState(false);

  const fetchVendorsList = async () => {
    setLoading(true);
    try {
      const res = await getVendors();
      const list = res?.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        setVendors(list);
      } else {
        setVendors(DEFAULT_VENDORS);
      }
    } catch (err) {
      console.error('Failed to load vendors from API, keeping fallbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://client-ten-lyart-71.vercel.app';
      const vidCode = formData.vendor_code || 'VND';
      const payload = {
        ...formData,
        redirect_complete: formData.redirect_complete || `${origin}/survey/callback?status=10&uid=[UID]&vid=${vidCode}&hash=[HASH]`,
        redirect_terminate: formData.redirect_terminate || `${origin}/survey/callback?status=20&uid=[UID]&vid=${vidCode}&hash=[HASH]`,
        redirect_overquota: formData.redirect_overquota || `${origin}/survey/callback?status=30&uid=[UID]&vid=${vidCode}&hash=[HASH]`,
        redirect_security: formData.redirect_security || `${origin}/survey/callback?status=40&uid=[UID]&vid=${vidCode}&hash=[HASH]`,
        hash_algorithm: formData.hash_algorithm || 'SHA3-256',
        secret_key: formData.secret_key || `${vidCode.toLowerCase()}_sec_2026`
      };
      const res = await createVendor(payload);
      setShowModal(false);
      const created = res?.data || { ...payload, _id: `vnd_${Date.now()}` };
      setVendors(prev => [created, ...prev]);
      setFormData({
        name: '',
        email: '',
        vendor_code: '',
        cpi: 1.50,
        status: 'active',
        redirect_complete: '',
        redirect_terminate: '',
        redirect_overquota: '',
        redirect_security: '',
        hash_algorithm: 'SHA3-256',
        secret_key: ''
      });
      setShowAddRedirectsTab(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error creating vendor');
    }
  };

  const handleOpenRedirects = (vendor) => {
    setEditingVendor(vendor);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://client-ten-lyart-71.vercel.app';
    const vidCode = vendor.vendor_code || vendor.vendorUid || 'VND';
    const isDummy = (url) => !url || url.includes('vnddyn01.com') || url.includes('supplier.com');
    setRedirectForm({
      redirect_complete: !isDummy(vendor.redirect_complete) ? vendor.redirect_complete : `${origin}/survey/callback?status=10&uid=[UID]&vid=${vidCode}&hash=[HASH]`,
      redirect_terminate: !isDummy(vendor.redirect_terminate) ? vendor.redirect_terminate : `${origin}/survey/callback?status=20&uid=[UID]&vid=${vidCode}&hash=[HASH]`,
      redirect_overquota: !isDummy(vendor.redirect_overquota) ? vendor.redirect_overquota : `${origin}/survey/callback?status=30&uid=[UID]&vid=${vidCode}&hash=[HASH]`,
      redirect_security: !isDummy(vendor.redirect_security) ? vendor.redirect_security : `${origin}/survey/callback?status=40&uid=[UID]&vid=${vidCode}&hash=[HASH]`,
      hash_algorithm: vendor.hash_algorithm || 'SHA3-256',
      secret_key: vendor.secret_key || `${vidCode.toLowerCase()}_sec_key_2026`
    });
    setSaveSuccess(false);
  };

  const handleSaveRedirects = async (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    setSavingRedirects(true);
    try {
      const vendorId = editingVendor._id || editingVendor.vendor_code;
      const updatedFields = {
        redirect_complete: redirectForm.redirect_complete,
        redirect_terminate: redirectForm.redirect_terminate,
        redirect_overquota: redirectForm.redirect_overquota,
        redirect_security: redirectForm.redirect_security,
        hash_algorithm: redirectForm.hash_algorithm,
        secret_key: redirectForm.secret_key
      };
      await updateVendor(vendorId, updatedFields);
      setVendors(prev => prev.map(v => (v._id === vendorId || v.vendor_code === vendorId) ? { ...v, ...updatedFields } : v));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingVendor(null);
      }, 1200);
    } catch (err) {
      alert(err.message || 'Error updating vendor redirects');
    } finally {
      setSavingRedirects(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vendor integration?')) return;
    try {
      await deleteVendor(id);
      setVendors(prev => prev.filter(v => (v._id !== id && v.vendor_code !== id)));
    } catch (err) {
      console.error('Failed to delete vendor:', err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSimulatedUrl = (template, uid) => {
    if (!template) return '';
    return template
      .replace(/\[UID\]/gi, uid)
      .replace(/\[RESPONDENT_ID\]/gi, uid)
      .replace(/\[RID\]/gi, uid)
      .replace(/\[TID\]/gi, uid);
  };

  const filtered = vendors.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.vendor_code && v.vendor_code.toLowerCase().includes(q)) ||
      (v.vendorUid && v.vendorUid.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q))
    );
  });

  const avgCpi = (vendors.reduce((sum, v) => sum + Number(v.cpi || 0), 0) / (vendors.length || 1)).toFixed(2);
  const activeCount = vendors.filter(v => v.status === 'active' || v.isActive !== false).length;

  return (
    <div>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Partners</span>
            <span className="separator">/</span>
            <span className="current">Supply Vendors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Vendor & Panel Management
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
              {filtered.length} Connected Panels
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            id="btn-add-vendor"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Add New Vendor
          </button>
        </div>
      </div>

      {/* 4 Dastone KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Connected Panels</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{vendors.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <span className="pulse-dot" /> {activeCount} Panels Active & Routing
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Average Panel CPI</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(3, 216, 127, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#03d87f' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>${avgCpi}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#8997bd' }}>
            Base supply cost across panels
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Security & Hash</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>SHA3-256 / HMAC</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <CheckCircle2 size={12} /> Strict Anti-Tamper Enabled
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Supply Redirects</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(253, 171, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fdab3d' }}>
              <Link2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>4 / 4 Callbacks</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#1761fd' }}>
            <ArrowUpRight size={12} /> Complete, Term, OQ, Security
          </div>
        </div>
      </div>

      {/* Vendors Table (Dastone Report Card) */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="report-card-header">
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
            <input 
              type="text" 
              className="input-control"
              placeholder="Search vendors by name, code, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', height: '34px', fontSize: '12px' }}
            />
          </div>

          <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
            {filtered.length} Registered Panels
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8997bd' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            Loading vendors...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8997bd', fontSize: '13px' }}>
            No vendors configured yet. Click "Add New Vendor" to connect your first sample supplier!
          </div>
        ) : (
          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead className="thead-light">
                <tr>
                  <th>Vendor Name / Code</th>
                  <th>Contact Email</th>
                  <th>Base CPI</th>
                  <th>Security Hash</th>
                  <th>Supply Callbacks (4)</th>
                  <th>Status</th>
                  <th>Sample Router Entry URL</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const sampleUrl = `${window.location.origin}/vendor/auth/${v.vendor_code || v._id}/project/:project_id?rid=[RESPONDENT_ID]`;
                  return (
                    <tr key={v._id || v.vendor_code}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13.5px' }}>{v.name}</div>
                        <span className="badge-soft-primary" style={{ fontFamily: 'monospace', marginTop: '4px', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px' }}>
                          {v.vendor_code || v._id}
                        </span>
                      </td>
                      <td style={{ color: '#303e67', fontSize: '12.5px' }}>
                        {v.email || 'N/A'}
                      </td>
                      <td style={{ fontWeight: 800, color: '#03d87f', fontSize: '14px' }}>
                        ${Number(v.cpi || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge-soft-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          <ShieldCheck size={12} /> {v.hash_algorithm || 'SHA3-256'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenRedirects(v)}
                          className="btn btn-soft-primary btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '4px 9px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Configure all 4 Supply Vendor Redirect Callbacks (Complete, Terminate, Overquota, Security)"
                        >
                          <Link2 size={13} />
                          <span>Configure Redirects (4)</span>
                        </button>
                        <div style={{ marginTop: '3px', fontSize: '10.5px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={11} /> 4 Callbacks Active
                        </div>
                      </td>
                      <td>
                        {v.status === 'active' ? (
                          <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span className="pulse-dot" /> Active
                          </span>
                        ) : (
                          <span className="badge-soft-danger" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span className="pulse-dot pulse-danger" /> Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ 
                            fontSize: '11px', 
                            background: '#f8fafc', 
                            border: '1px solid #e3ebf6',
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            color: '#1d2c48',
                            maxWidth: '220px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {sampleUrl}
                          </code>
                          <button 
                            className="btn btn-soft-secondary btn-sm"
                            onClick={() => copyToClipboard(sampleUrl, v._id)}
                            title="Copy Entry Format"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            {copiedId === v._id ? <Check size={12} color="#03d87f" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            className="btn btn-soft-primary btn-sm"
                            onClick={() => handleOpenRedirects(v)}
                            title="Configure Redirects & Security"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            <Settings size={13} />
                          </button>
                          <button
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => handleDelete(v._id || v.vendor_code)}
                            title="Remove Vendor"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEDICATED CONFIGURE VENDOR REDIRECTS MODAL */}
      {editingVendor && (
        <ModalPortal isOpen={!!editingVendor} onClose={() => setEditingVendor(null)}>
          <div className="modal-overlay" onClick={() => setEditingVendor(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
                      <Link2 size={16} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                      Configure Supply Vendor Redirects
                    </h3>
                  </div>
                  <p style={{ margin: '4px 0 0 36px', fontSize: '12px', color: '#64748b' }}>
                    Panel: <strong style={{ color: '#1d2c48' }}>{editingVendor.name}</strong> ({editingVendor.vendor_code || editingVendor._id})
                  </p>
                </div>
                <button 
                  onClick={() => setEditingVendor(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRedirects}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Informational Guidance Box */}
                  <div style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '8px', 
                    padding: '12px 14px', 
                    display: 'flex', 
                    gap: '10px' 
                  }}>
                    <Info size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px', color: '#15803d', lineHeight: 1.5 }}>
                      Jab bhi koi respondent survey session end karega, router unhe in 4 Callback Redirect URLs par return karega. Tag <code>[UID]</code> dynamically respondent ke real ID se replace ho jayega.
                    </div>
                  </div>

                  {/* 1. Complete Redirect */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        1. Complete / Success Callback URL
                      </label>
                      <span className="badge-soft-success" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Status 10 (Complete)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url"
                        required
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="https://supplier.com/survey/complete?uid=[UID]"
                        value={redirectForm.redirect_complete}
                        onChange={e => setRedirectForm({ ...redirectForm, redirect_complete: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(redirectForm.redirect_complete, 'rc')}
                        title="Copy Complete URL"
                        style={{ padding: '0 12px' }}
                      >
                        {copiedId === 'rc' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Survey successfully finish hone par respondent is URL par wapas jayega.
                    </span>
                  </div>

                  {/* 2. Terminate Redirect */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                        2. Terminate / Screenout Callback URL
                      </label>
                      <span className="badge-soft-danger" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Status 20 (Screenout)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url"
                        required
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="https://supplier.com/survey/terminate?uid=[UID]"
                        value={redirectForm.redirect_terminate}
                        onChange={e => setRedirectForm({ ...redirectForm, redirect_terminate: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(redirectForm.redirect_terminate, 'rt')}
                        title="Copy Terminate URL"
                        style={{ padding: '0 12px' }}
                      >
                        {copiedId === 'rt' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Demographics ya screener fail hone par respondent is URL par bhej diya jayega.
                    </span>
                  </div>

                  {/* 3. OverQuota Redirect */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                        3. OverQuota Callback URL
                      </label>
                      <span className="badge-soft-warning" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Status 30 (OverQuota)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url"
                        required
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="https://supplier.com/survey/overquota?uid=[UID]"
                        value={redirectForm.redirect_overquota}
                        onChange={e => setRedirectForm({ ...redirectForm, redirect_overquota: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(redirectForm.redirect_overquota, 'ro')}
                        title="Copy OverQuota URL"
                        style={{ padding: '0 12px' }}
                      >
                        {copiedId === 'ro' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Target quota full hone par respondent is URL par redirect hoga.
                    </span>
                  </div>

                  {/* 4. Security Redirect */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                        4. Security / Fraud Screenout Callback URL
                      </label>
                      <span className="badge-soft-primary" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Status 40 (Security Terminate)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url"
                        required
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="https://supplier.com/survey/security?uid=[UID]"
                        value={redirectForm.redirect_security}
                        onChange={e => setRedirectForm({ ...redirectForm, redirect_security: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(redirectForm.redirect_security, 'rs')}
                        title="Copy Security URL"
                        style={{ padding: '0 12px' }}
                      >
                        {copiedId === 'rs' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      VPN/Proxy, Bot, Speeding ya Fraud check trigger hone par respondent security URL par drop hoga.
                    </span>
                  </div>

                  {/* Security Hashing & Secret Key */}
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '14px', 
                    marginTop: '4px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Shield size={16} color="#1761fd" />
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1d2c48' }}>
                        Cryptographic Anti-Tamper Security & Signing
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                          Hash Algorithm
                        </label>
                        <select 
                          className="input-field"
                          style={{ width: '100%', fontSize: '12px' }}
                          value={redirectForm.hash_algorithm}
                          onChange={e => setRedirectForm({ ...redirectForm, hash_algorithm: e.target.value })}
                        >
                          <option value="SHA3-256">SHA3-256 (Market Xcel / SMR Enterprise)</option>
                          <option value="HMAC-SHA256">HMAC-SHA256 (Dynata / Cint Standard)</option>
                          <option value="MD5">MD5 (Legacy Panels)</option>
                          <option value="None">None (Unsigned Redirects)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                          Secret Key / Signing Salt
                        </label>
                        <input 
                          type="text"
                          className="input-field"
                          style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                          placeholder="e.g. dynata_sec_pass_2026"
                          value={redirectForm.secret_key}
                          onChange={e => setRedirectForm({ ...redirectForm, secret_key: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Runtime Simulator & Live UID Verification Box */}
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1px dashed #cbd5e1', 
                    borderRadius: '8px', 
                    padding: '14px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={15} color="#03d87f" />
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1d2c48' }}>
                          Live UID Substitution Preview & Link Tester
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Test UID:</span>
                        <input 
                          type="text"
                          value={testUid}
                          onChange={e => setTestUid(e.target.value)}
                          style={{ 
                            fontSize: '11px', 
                            padding: '2px 6px', 
                            border: '1px solid #cbd5e1', 
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            width: '140px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#16a34a', fontWeight: 700, marginBottom: '2px' }}>
                          <span>Complete Return:</span>
                          <a 
                            href={getSimulatedUrl(redirectForm.redirect_complete, testUid)} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ color: '#1761fd', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                          >
                            Test Open <ExternalLink size={11} />
                          </a>
                        </div>
                        <code style={{ fontSize: '11px', color: '#334155', wordBreak: 'break-all' }}>
                          {getSimulatedUrl(redirectForm.redirect_complete, testUid) || 'No complete URL configured'}
                        </code>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ef4444', fontWeight: 700, marginBottom: '2px' }}>
                          <span>Terminate Return:</span>
                          <a 
                            href={getSimulatedUrl(redirectForm.redirect_terminate, testUid)} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ color: '#1761fd', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                          >
                            Test Open <ExternalLink size={11} />
                          </a>
                        </div>
                        <code style={{ fontSize: '11px', color: '#334155', wordBreak: 'break-all' }}>
                          {getSimulatedUrl(redirectForm.redirect_terminate, testUid) || 'No terminate URL configured'}
                        </code>
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ 
                  borderTop: '1px solid #e2e8f0', 
                  padding: '14px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: '#f8fafc'
                }}>
                  <div>
                    {saveSuccess && (
                      <span className="badge-soft-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                        <CheckCheck size={14} /> Redirects & Security Saved Successfully!
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setEditingVendor(null)}
                      style={{ fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={savingRedirects}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
                    >
                      <CheckCircle2 size={14} /> 
                      {savingRedirects ? 'Saving...' : 'Save Redirects & Security'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Add Vendor Modal */}
      {showModal && (
        <ModalPortal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Add Supply Vendor Panel</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure supplier profile, entry routes, and 4 callback redirects.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Vendor / Panel Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="e.g. Dynata Panel, PureSpectrum, Lucid"
                      value={formData.name}
                      onChange={e => {
                        const name = e.target.value;
                        const code = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
                        setFormData({ 
                          ...formData, 
                          name,
                          vendor_code: formData.vendor_code || code
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Unique Vendor Code / Slug *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="e.g. VND-DYN-01, pure-spectrum"
                      value={formData.vendor_code}
                      onChange={e => setFormData({ ...formData, vendor_code: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Contact Email
                    </label>
                    <input 
                      type="email" 
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="partners@supplier.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                        Default CPI Payout ($)
                      </label>
                      <input 
                        type="number" 
                        step="0.10"
                        className="input-field" 
                        style={{ width: '100%' }}
                        value={formData.cpi}
                        onChange={e => setFormData({ ...formData, cpi: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                        Status
                      </label>
                      <select 
                        className="input-field"
                        style={{ width: '100%' }}
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle Callback Redirects Section */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddRedirectsTab(!showAddRedirectsTab)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#1761fd'
                      }}
                    >
                      <Link2 size={14} />
                      {showAddRedirectsTab ? 'Hide 4 Callback Redirects' : 'Configure 4 Callback Redirects Now (Optional - Defaults Provided)'}
                    </button>

                    {showAddRedirectsTab && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                          Use <code>[UID]</code> as respondent ID placeholder.
                        </p>

                        <div>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#16a34a', marginBottom: '3px' }}>
                            Complete Callback URL
                          </label>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                            placeholder={`https://${formData.vendor_code || 'partner'}.com/survey/complete?uid=[UID]`}
                            value={formData.redirect_complete}
                            onChange={e => setFormData({ ...formData, redirect_complete: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#ef4444', marginBottom: '3px' }}>
                            Terminate Callback URL
                          </label>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                            placeholder={`https://${formData.vendor_code || 'partner'}.com/survey/terminate?uid=[UID]`}
                            value={formData.redirect_terminate}
                            onChange={e => setFormData({ ...formData, redirect_terminate: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#f59e0b', marginBottom: '3px' }}>
                            OverQuota Callback URL
                          </label>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                            placeholder={`https://${formData.vendor_code || 'partner'}.com/survey/overquota?uid=[UID]`}
                            value={formData.redirect_overquota}
                            onChange={e => setFormData({ ...formData, redirect_overquota: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#6366f1', marginBottom: '3px' }}>
                            Security Screenout Callback URL
                          </label>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                            placeholder={`https://${formData.vendor_code || 'partner'}.com/survey/security?uid=[UID]`}
                            value={formData.redirect_security}
                            onChange={e => setFormData({ ...formData, redirect_security: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                              Hash Algorithm
                            </label>
                            <select 
                              className="input-field"
                              style={{ width: '100%', fontSize: '11.5px' }}
                              value={formData.hash_algorithm}
                              onChange={e => setFormData({ ...formData, hash_algorithm: e.target.value })}
                            >
                              <option value="SHA3-256">SHA3-256</option>
                              <option value="HMAC-SHA256">HMAC-SHA256</option>
                              <option value="MD5">MD5</option>
                              <option value="None">None</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                              Secret Key
                            </label>
                            <input 
                              type="text"
                              className="input-field"
                              style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                              placeholder="e.g. sec_pass_2026"
                              value={formData.secret_key}
                              onChange={e => setFormData({ ...formData, secret_key: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                      Save Vendor & Redirects
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
