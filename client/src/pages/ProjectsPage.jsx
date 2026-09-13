import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  PauseCircle, 
  Target 
} from 'lucide-react';
import { getProjects, createProject } from '../services/api';

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
    live_url: 'https://survey.example.com?uid=[RESPONDENT_ID]'
  });

  const fetchProjectsList = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      if (res && res.data) {
        setProjects(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
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
      await createProject(formData);
      setShowModal(false);
      setFormData({
        project_id: '',
        project_name: '',
        client_name: '',
        cpi: 3.50,
        target_completes: 200,
        status: 'active',
        live_url: ''
      });
      fetchProjectsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  const filtered = projects.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.project_name && p.project_name.toLowerCase().includes(q)) ||
      (p.project_id && p.project_id.toLowerCase().includes(q)) ||
      (p.client_name && p.client_name.toLowerCase().includes(q))
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
            <Briefcase size={22} color="#00C851" /> Client Projects & Campaigns
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Configure internal market research projects, client quotas, and tracking parameters.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          id="btn-add-project"
        >
          <Plus size={15} /> Create New Project
        </button>
      </div>

      {/* Projects Table */}
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
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <span className="badge badge-info">
            {filtered.length} Projects Configured
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            Loading projects...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            No internal projects created yet. Click "Create New Project" to add your client study!
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Project ID & Name</th>
                  <th>Client Name</th>
                  <th>Quota Target (N)</th>
                  <th>Revenue CPI</th>
                  <th>Status</th>
                  <th>Live URL</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id || p.project_id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.project_name}</div>
                      <span className="badge badge-purple" style={{ fontFamily: 'monospace', marginTop: '4px' }}>
                        PID: {p.project_id}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-body)' }}>
                      {p.client_name || 'Direct Client'}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0F172A', fontWeight: 600 }}>
                        <Target size={14} color="#00C851" />
                        {p.target_completes || 500}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#00C851', display: 'inline-flex', alignItems: 'center' }}>
                        <DollarSign size={14} />
                        {Number(p.cpi || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      {p.status === 'active' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} style={{ marginRight: '3px' }} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <PauseCircle size={12} style={{ marginRight: '3px' }} /> Paused
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '11px', 
                        fontFamily: 'monospace', 
                        color: 'var(--text-muted)',
                        maxWidth: '200px',
                        display: 'inline-block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {p.live_url || 'https://...'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showModal && (
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
      )}
    </div>
  );
}
