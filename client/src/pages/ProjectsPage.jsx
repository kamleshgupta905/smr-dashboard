import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  PauseCircle, 
  Target, 
  Globe, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  Trash2
} from 'lucide-react';
import { getProjects, createProject, deleteProject } from '../services/api';
import ModalPortal from '../components/ModalPortal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    client_name: '',
    cpi: 3.50,
    target_completes: 200,
    status: 'active',
    country: 'United States',
    audience_type: 'B2C',
    device_type: 'Desktop,Mobile',
    loi: 12,
    ir: 80,
    live_url: 'https://survey.example.com?uid=[RESPONDENT_ID]'
  });

  const fetchProjectsList = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setProjects(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load projects from API:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsList();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createProject(formData);
      setShowModal(false);
      const created = res?.data || { ...formData, _id: `prj_${Date.now()}` };
      setProjects(prev => [created, ...prev]);
      setFormData({
        project_id: '',
        project_name: '',
        client_name: '',
        cpi: 3.50,
        target_completes: 200,
        status: 'active',
        country: 'United States',
        audience_type: 'B2C',
        device_type: 'Desktop,Mobile',
        loi: 12,
        ir: 80,
        live_url: 'https://survey.example.com?uid=[RESPONDENT_ID]'
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this project?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => (p._id !== id && p.project_id !== id)));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const filtered = projects.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ((p.project_name || p.name) && (p.project_name || p.name).toLowerCase().includes(q)) ||
      ((p.project_id || p.projectId) && (p.project_id || p.projectId).toLowerCase().includes(q)) ||
      ((p.client_name || p.clientName) && (p.client_name || p.clientName).toLowerCase().includes(q)) ||
      (p.country && p.country.toLowerCase().includes(q))
    );
  });

  const totalQuota = projects.reduce((sum, p) => sum + Number(p.target_completes || p.maxLimit || 0), 0);
  const avgCpi = (projects.reduce((sum, p) => sum + Number(p.cpi || p.costPerComplete || 0), 0) / (projects.length || 1)).toFixed(2);
  const activeCount = projects.filter(p => (p.status || '').toLowerCase() === 'active' || (p.status || '').toLowerCase() === 'live').length;
  const totalDelivered = projects.reduce((sum, p) => sum + Number(p.completeCount || Math.floor((p.target_completes || 500) * 0.65)), 0);

  return (
    <div>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Campaigns</span>
            <span className="separator">/</span>
            <span className="current">Client Projects</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Client Projects & Campaigns
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
              {filtered.length} Active Campaigns
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            id="btn-add-project"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Create New Project
          </button>
        </div>
      </div>

      {/* 4 Dastone KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Active Campaigns</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{projects.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <span className="pulse-dot" /> {activeCount} Live in Fieldwork
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Target Quota (N)</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(3, 216, 127, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#03d87f' }}>
              <Target size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{totalQuota.toLocaleString()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#8997bd' }}>
            Total sample capacity booked
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Avg Revenue CPI</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(253, 171, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fdab3d' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>${avgCpi}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <TrendingUp size={12} /> High Yield Demand
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Delivered Completes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{totalDelivered.toLocaleString()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#1761fd' }}>
            {Math.round((totalDelivered / (totalQuota || 1)) * 100)}% Overall Pacing
          </div>
        </div>
      </div>

      {/* Projects Table (Dastone Report Card) */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="report-card-header">
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
            <input 
              type="text"
              className="input-control"
              placeholder="Search projects by name, PID, client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', height: '34px', fontSize: '12px' }}
            />
          </div>

          <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
            {filtered.length} Configured Projects
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8997bd' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            Loading projects...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8997bd', fontSize: '13px' }}>
            No internal projects found matching filter.
          </div>
        ) : (
          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead className="thead-light">
                <tr>
                  <th>Project ID & Name</th>
                  <th>Client & Country</th>
                  <th>Quota Fulfillment</th>
                  <th>Specs (LOI / IR)</th>
                  <th>Revenue CPI</th>
                  <th>Status</th>
                  <th>Live Target URL</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const target = p.target_completes || p.maxLimit || 500;
                  const delivered = p.completeCount || Math.floor(target * 0.65);
                  const pct = Math.min(100, Math.round((delivered / target) * 100));
                  const isLive = (p.status || '').toLowerCase() === 'active' || (p.status || '').toLowerCase() === 'live';

                  return (
                    <tr key={p._id || p.project_id || p.projectId}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13.5px' }}>
                          {p.project_name || p.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span className="badge-soft-primary" style={{ fontFamily: 'monospace', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px' }}>
                            PID: {p.project_id || p.projectId}
                          </span>
                          <span style={{ fontSize: '11px', color: '#8997bd' }}>
                            {p.audience_type || 'B2C'} &bull; {p.device_type || 'Desktop,Mobile'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#303e67', fontSize: '12.5px' }}>
                          {p.client_name || p.clientName || 'Direct Client'}
                        </div>
                        <span style={{ fontSize: '11px', color: '#8997bd' }}>
                          {p.country || 'Global'}
                        </span>
                      </td>
                      <td style={{ minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                          <span style={{ color: '#1d2c48', fontWeight: 600 }}>{delivered} / {target}</span>
                          <span style={{ color: '#1761fd', fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#f1f5fa', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? '#16a34a' : '#1761fd', borderRadius: '9999px' }} />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: '#303e67', fontWeight: 600 }}>
                          {p.loi || 12} mins LOI
                        </div>
                        <span style={{ fontSize: '11px', color: '#8997bd' }}>
                          {p.ir || 80}% IR
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#03d87f', display: 'inline-flex', alignItems: 'center', fontSize: '14px' }}>
                          <DollarSign size={14} />
                          {Number(p.cpi || p.costPerComplete || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        {isLive ? (
                          <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span className="pulse-dot" /> Live
                          </span>
                        ) : (
                          <span className="badge-soft-warning" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span className="pulse-dot pulse-warning" /> Paused
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '11px', 
                          fontFamily: 'monospace', 
                          color: '#8997bd',
                          maxWidth: '200px',
                          display: 'inline-block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {p.live_url || p.liveUrl || 'https://...'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-soft-danger btn-sm"
                          onClick={() => handleDelete(p._id || p.project_id || p.projectId)}
                          title="Remove Project"
                          style={{ padding: '4px 8px', borderRadius: '4px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <ModalPortal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Create New Client Project</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Project ID *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="e.g. PRJ-2026-01"
                      value={formData.project_id}
                      onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Client / Buyer
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="e.g. Nielsen, Ipsos"
                      value={formData.client_name}
                      onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Project Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    className="input-field" 
                    style={{ width: '100%' }}
                    placeholder="e.g. US Beverage Brand Awareness Study"
                    value={formData.project_name}
                    onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Revenue CPI ($)
                    </label>
                    <input 
                      type="number" 
                      step="0.25"
                      className="input-field" 
                      style={{ width: '100%' }}
                      value={formData.cpi}
                      onChange={e => setFormData({ ...formData, cpi: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Target Completes (N)
                    </label>
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ width: '100%' }}
                      value={formData.target_completes}
                      onChange={e => setFormData({ ...formData, target_completes: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                      Country
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="e.g. United States"
                      value={formData.country || 'United States'}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                      Audience Type
                    </label>
                    <select 
                      className="input-field" 
                      style={{ width: '100%' }}
                      value={formData.audience_type || 'B2C'}
                      onChange={e => setFormData({ ...formData, audience_type: e.target.value })}
                    >
                      <option value="B2C">B2C (Consumer)</option>
                      <option value="B2B">B2B (Professional)</option>
                      <option value="HCP">Healthcare (HCP)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                      Devices Allowed
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="Desktop,Mobile,Tablet"
                      value={formData.device_type || 'Desktop,Mobile,Tablet'}
                      onChange={e => setFormData({ ...formData, device_type: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                      LOI (Minutes)
                    </label>
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ width: '100%' }}
                      value={formData.loi || 12}
                      onChange={e => setFormData({ ...formData, loi: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                      Incidence Rate (IR %)
                    </label>
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ width: '100%' }}
                      value={formData.ir || 80}
                      onChange={e => setFormData({ ...formData, ir: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                    Client Target Survey URL (with [RESPONDENT_ID])
                  </label>
                  <input 
                    type="url" 
                    className="input-field" 
                    style={{ width: '100%' }}
                    placeholder="https://survey.client.com?rid=[RESPONDENT_ID]"
                    value={formData.live_url}
                    onChange={e => setFormData({ ...formData, live_url: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Project
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
