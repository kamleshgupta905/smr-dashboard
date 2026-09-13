import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Search,
  ShieldCheck
} from 'lucide-react';
import { getVendors, createVendor } from '../services/api';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vendor_code: '',
    cpi: 1.50,
    status: 'active'
  });

  const fetchVendorsList = async () => {
    setLoading(true);
    try {
      const res = await getVendors();
      if (res && res.data) {
        setVendors(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load vendors', err);
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
      await createVendor(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', vendor_code: '', cpi: 1.50, status: 'active' });
      fetchVendorsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating vendor');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = vendors.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.vendor_code && v.vendor_code.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A' }}>
            <Users size={22} color="#00C851" /> Vendor & Panel Management
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage sample providers, suppliers, HMAC secret credentials, and tracking callbacks.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          id="btn-add-vendor"
        >
          <Plus size={15} /> Add New Vendor
        </button>
      </div>

      {/* Vendors Table */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="input-field"
              placeholder="Search vendors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <span className="badge badge-info">
            {filtered.length} Vendors Registered
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            Loading vendors...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            No vendors configured yet. Click "Add New Vendor" to connect your first sample supplier!
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vendor Name / Code</th>
                  <th>Contact Email</th>
                  <th>Base CPI Payout</th>
                  <th>HMAC Security</th>
                  <th>Status</th>
                  <th>Sample Router Entry URL</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const sampleUrl = `${window.location.origin}/vendor/auth/${v.vendor_code || v._id}/project/:project_id?rid=[RESPONDENT_ID]`;
                  return (
                    <tr key={v._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{v.name}</div>
                        <span className="badge badge-purple" style={{ fontFamily: 'monospace', marginTop: '4px' }}>
                          {v.vendor_code || v._id}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-body)' }}>
                        {v.email || 'N/A'}
                      </td>
                      <td style={{ fontWeight: 800, color: '#00C851' }}>
                        ${Number(v.cpi || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={12} /> HMAC-SHA256
                        </span>
                      </td>
                      <td>
                        {v.status === 'active' ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} style={{ marginRight: '3px' }} /> Active
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <XCircle size={12} style={{ marginRight: '3px' }} /> Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ 
                            fontSize: '11px', 
                            background: '#F1F5F9', 
                            border: '1px solid var(--border-color)',
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            color: '#0F172A',
                            maxWidth: '240px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {sampleUrl}
                          </code>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => copyToClipboard(sampleUrl, v._id)}
                            title="Copy Entry Format"
                          >
                            {copiedId === v._id ? <Check size={14} color="#00C851" /> : <Copy size={14} />}
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

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Add Sample Vendor</h3>
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
                    placeholder="e.g. Dynata Panel, PureSpectrum"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                    placeholder="e.g. VND01, dynata-us"
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
                    placeholder="partner@supplier.com"
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Vendor
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
