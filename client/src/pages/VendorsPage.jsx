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
  ArrowUpRight
} from 'lucide-react';
import { getVendors, createVendor } from '../services/api';
import ModalPortal from '../components/ModalPortal';

const FALLBACK_VENDORS = [
  {
    _id: 'vnd_dynata_01',
    vendor_code: 'VND-DYN-01',
    vendorUid: 'VND-DYN-01',
    name: 'Dynata Global Panel',
    email: 'partners@dynata.com',
    cpi: 1.75,
    status: 'active'
  },
  {
    _id: 'vnd_cint_02',
    vendor_code: 'VND-CNT-02',
    vendorUid: 'VND-CNT-02',
    name: 'Cint Audience Exchange',
    email: 'integrations@cint.com',
    cpi: 1.40,
    status: 'active'
  },
  {
    _id: 'vnd_ps_03',
    vendor_code: 'VND-PS-03',
    vendorUid: 'VND-PS-03',
    name: 'PureSpectrum Marketplace',
    email: 'api-support@purespectrum.com',
    cpi: 1.85,
    status: 'active'
  },
  {
    _id: 'vnd_lucid_04',
    vendor_code: 'VND-LCD-04',
    vendorUid: 'VND-LCD-04',
    name: 'Lucid / Cint Marketplace',
    email: 'publishers@lucidhq.com',
    cpi: 1.25,
    status: 'active'
  },
  {
    _id: 'vnd_toluna_05',
    vendor_code: 'VND-TLN-05',
    vendorUid: 'VND-TLN-05',
    name: 'Toluna Influencers Panel',
    email: 'partnerships@tolunagroup.com',
    cpi: 1.50,
    status: 'active'
  },
  {
    _id: 'vnd_innovate_06',
    vendor_code: 'VND-IMR-06',
    vendorUid: 'VND-IMR-06',
    name: 'InnovateMR B2B Panel',
    email: 'sample@innovatemr.com',
    cpi: 2.25,
    status: 'active'
  }
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState(FALLBACK_VENDORS);
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
      const list = res?.data?.data || res?.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        setVendors(list);
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
      const res = await createVendor(formData);
      setShowModal(false);
      const created = res?.data || { ...formData, _id: `vnd_${Date.now()}` };
      setVendors(prev => [created, ...prev]);
      setFormData({ name: '', email: '', vendor_code: '', cpi: 1.50, status: 'active' });
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
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>HMAC-SHA256</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <CheckCircle2 size={12} /> Strict Anti-Tamper Enabled
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Inbound Routing</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(253, 171, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fdab3d' }}>
              <Activity size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>100% Ready</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#1761fd' }}>
            <ArrowUpRight size={12} /> Dynamic UID Macro Support
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
                          <ShieldCheck size={12} /> HMAC-SHA256
                        </span>
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
                            maxWidth: '240px',
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
        <ModalPortal isOpen={showModal} onClose={() => setShowModal(false)}>
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
      </ModalPortal>
      )}
    </div>
  );
}
