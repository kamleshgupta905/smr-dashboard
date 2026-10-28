import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Download, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldAlert, 
  Users, 
  Plus, 
  X,
  Target,
  ExternalLink,
  Percent
} from 'lucide-react';
import { getLeads, createLead, getVendors, getProjects } from '../services/api';
import ModalPortal from '../components/ModalPortal';

export default function LeadsPage({ currentUser, showToast }) {
  const isVendor = currentUser?.role_name === "Vendor" || currentUser?.role === "Vendor";
  const vendorId = currentUser?.vendor_id || currentUser?.username;
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({
    total_clicks: 0,
    total_completes: 0,
    total_terminates: 0,
    total_overquota: 0,
    conversion_rate: 0.0
  });
  const [vendors, setVendors] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedUid, setCopiedUid] = useState(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [simForm, setSimForm] = useState({
    project_id: 'PRJ-2026-001',
    vendor_id: '1',
    username: '',
    status: 'Complete'
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setSyncing(true);
      const [leadsRes, venRes, projRes] = await Promise.all([
        getLeads({ search, status: statusFilter !== 'ALL' ? statusFilter : '' }),
        getVendors(),
        getProjects().catch(() => ({ data: [] }))
      ]);

      const pList = projRes?.data || (Array.isArray(projRes) ? projRes : []);
      if (Array.isArray(pList) && pList.length > 0) {
        setProjectsList(pList);
        if (simForm.project_id === 'PRJ-2026-001') {
          setSimForm(prev => ({ ...prev, project_id: String(pList[0].project_id || pList[0].id || 'PRJ-2026-001') }));
        }
      }

      if (leadsRes && leadsRes.success) {
        setLeads(leadsRes.data || []);
        if (leadsRes.summary) setSummary(leadsRes.summary);
      }
      const vList = Array.isArray(venRes) ? venRes : (venRes?.data || []);
      if (Array.isArray(vList) && vList.length > 0) {
        setVendors(vList);
        if (!simForm.vendor_id) {
          setSimForm(prev => ({ ...prev, vendor_id: String(vList[0].id || vList[0].vendor_id) }));
        }
      }
    } catch (err) {
      console.error('Failed to load traffic leads:', err);
    } finally {
      if (!silent) setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, [statusFilter]);

  // Enterprise Real-Time Stream Pulse: 10s auto-sync
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoSync, statusFilter, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(false);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedUid(id);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const generatedUid = simForm.username.trim() || `RESP_${Date.now().toString().slice(-6)}`;
      await createLead({
        project_id: simForm.project_id.trim() || 'PRJ-2026-001',
        vendor_id: simForm.vendor_id,
        username: generatedUid,
        status: simForm.status
      });
      setShowSimModal(false);
      setSimForm({
        project_id: 'PRJ-2026-001',
        vendor_id: vendors[0]?.id ? String(vendors[0].id) : '1',
        username: '',
        status: 'Complete'
      });
      if (showToast) {
        showToast('✓ Traffic lead registered in real-time audit journal!');
      }
      await loadData(false);
    } catch (err) {
      console.error('Simulation error:', err);
      if (showToast) {
        showToast('Failed to register simulated traffic entry.', 'error');
      } else {
        alert('Failed to register simulated traffic entry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Lead ID', 'Respondent UID', 'Project ID', 'Vendor ID', 'Status', 'IP Address', 'Date & Time'];
    const rows = leads.map(l => [
      l.id,
      `"${l.uid || l.username || ''}"`,
      `"${l.project_id || ''}"`,
      `"${l.vendor_id || ''}"`,
      `"${l.status || ''}"`,
      `"${l.ip_address || ''}"`,
      `"${l.created_at || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `smr_traffic_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'complete' || s === 'completed') {
      return {
        bg: '#dcfce7',
        color: '#15803d',
        label: 'Verified Complete',
        icon: CheckCircle2
      };
    }
    if (s === 'quota full' || s === 'quotafull' || s === 'overquota') {
      return {
        bg: '#f3e8ff',
        color: '#7e22ce',
        label: 'Quota Full',
        icon: Users
      };
    }
    if (s.includes('security') || s.includes('quality') || s.includes('fraud')) {
      return {
        bg: '#fee2e2',
        color: '#b91c1c',
        label: 'Security Terminate',
        icon: ShieldAlert
      };
    }
    return {
      bg: '#fef3c7',
      color: '#b45309',
      label: 'Terminated / Screenout',
      icon: XCircle
    };
  };

  return (
    <div className="container-fluid" style={{ padding: '24px 28px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: '#2a2d8c', 
              color: '#fff', 
              padding: '10px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(42, 45, 140, 0.25)'
            }}>
              <Activity size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1d2c48', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Live Traffic & Leads Stream
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                Respondent audit trail (LeadsController), live incoming vendor clicks, S2S conversion statuses & IP trace
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Live Auto-Pulse Indicator & Toggle */}
          <button
            type="button"
            onClick={() => setAutoSync(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '12px',
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: '20px',
              background: autoSync ? '#ecfdf5' : '#f1f5f9',
              color: autoSync ? '#059669' : '#64748b',
              border: `1px solid ${autoSync ? '#a7f3d0' : '#cbd5e1'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={autoSync ? "Live 10-second polling active. Click to pause." : "Live polling paused. Click to enable 10-second auto sync."}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: autoSync ? '#10b981' : '#94a3b8',
              boxShadow: autoSync ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none'
            }} />
            <span>{autoSync ? (syncing ? 'Syncing...' : 'Live Stream: 10s') : 'Live Stream: Paused'}</span>
          </button>

          <button 
            onClick={() => loadData(false)} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '13px', 
              fontWeight: 600,
              padding: '7px 16px', 
              borderRadius: '20px', 
              background: '#ffffff',
              color: '#2a2d8c',
              border: '1px solid #d5d9ea',
              boxShadow: '0 1px 3px rgba(42, 45, 140, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Refresh Stream"
          >
            <RefreshCw size={13} className={loading || syncing ? 'fa-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={exportCSV} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '13px', 
              fontWeight: 600,
              padding: '7px 16px', 
              borderRadius: '20px', 
              background: '#ffffff',
              color: '#2a2d8c',
              border: '1px solid #d5d9ea',
              boxShadow: '0 1px 3px rgba(42, 45, 140, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Export CSV"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={() => setShowSimModal(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '13px', 
              fontWeight: 700, 
              padding: '7px 20px', 
              borderRadius: '20px', 
              background: '#2a2d8c', 
              border: 'none',
              color: '#ffffff',
              boxShadow: '0 3px 10px rgba(42, 45, 140, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={15} />
            + Simulate Entry
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Clicks */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inbound Clicks</span>
              <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '8px', color: '#0F172A' }}>
                <Activity size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {Number(summary.total_clicks || leads.length).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Respondent entries logged
            </div>
          </div>
        </div>

        {/* Verified Completes */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Completes</span>
              <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
              {Number(summary.total_completes || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Successful respondent surveys
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversion Rate (IR)</span>
              <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '8px', color: '#6366f1' }}>
                <Percent size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#4f46e5' }}>
              {summary.conversion_rate || 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Complete-to-click yield
            </div>
          </div>
        </div>

        {/* Terminates & Overquota */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Terminates / Overquota</span>
              <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px', color: '#d97706' }}>
                <XCircle size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>
              {(Number(summary.total_terminates || 0) + Number(summary.total_overquota || 0)).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Screened out or quotas filled
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Filter Controls */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['ALL', 'Complete', 'Terminates', 'Quota Full', 'Security Terminate'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: statusFilter === st ? '#2a2d8c' : '#f1f4fb',
                  color: statusFilter === st ? '#ffffff' : '#475569',
                  boxShadow: statusFilter === st ? '0 2px 6px rgba(42, 45, 140, 0.25)' : 'none'
                }}
              >
                {st === 'ALL' ? 'All Traffic' : st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '280px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search UID, project, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 38px', paddingLeft: '38px',
                fontSize: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </form>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#e9ebf8', borderBottom: '1px solid #d6d9ef' }}>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Respondent UID</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project / Study</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vendor Partner</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Session Outcome</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>IP Address</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    <RefreshCw size={24} className="fa-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    Streaming real-time leads from database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '50px 20px', textAlign: 'center' }}>
                    <Activity size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>No traffic session records yet</div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px 0' }}>When vendors send respondents to survey links, incoming clicks appear here in real time.</p>
                  </td>
                </tr>
              ) : (
                leads.map((l) => {
                  const badge = getStatusBadge(l.status);
                  const Icon = badge.icon;
                  const uid = l.uid || l.username || `LEAD-${l.id}`;

                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                            {uid}
                          </span>
                          <button
                            onClick={() => handleCopy(uid, l.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedUid === l.id ? '#10b981' : '#94a3b8' }}
                            title="Copy UID"
                          >
                            {copiedUid === l.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                        {l.project_id || 'Study #1'}
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={13} color="#94a3b8" />
                          <span>{l.vendor_name || `Vendor #${l.vendor_id}`}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <Icon size={12} />
                          {badge.label}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>
                        {l.ip_address || '127.0.0.1'}
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b' }}>
                        {l.created_at ? l.created_at.substring(0, 16) : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Simulate / Register Traffic Entry */}
      {showSimModal && (
        <ModalPortal isOpen={showSimModal} onClose={() => setShowSimModal(false)}>
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
              maxWidth: '460px',
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
                  <div style={{ background: '#F8FAFC', padding: '6px', borderRadius: '6px', color: '#0F172A' }}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Simulate Traffic Session</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Register a real test lead into MySQL leads table</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSimModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSimulate} style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Study / Project Code *
                  </label>
                  <input
                    type="text"
                    required
                    list="leads-projects-datalist"
                    placeholder="Select or enter study code..."
                    value={simForm.project_id}
                    onChange={(e) => setSimForm({ ...simForm, project_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  />
                  <datalist id="leads-projects-datalist">
                    {projectsList.map((p, idx) => (
                      <option key={idx} value={p.project_id || p.id}>
                        {p.project_name || p.name || p.project_id}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Vendor Partner *
                  </label>
                  <select
                    value={simForm.vendor_id}
                    onChange={(e) => setSimForm({ ...simForm, vendor_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                    {vendors.length === 0 && <option value="1">Primary Supply Vendor</option>}
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Respondent UID (Optional — Auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RESP_TEST_9981"
                    value={simForm.username}
                    onChange={(e) => setSimForm({ ...simForm, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Session Outcome *
                  </label>
                  <select
                    value={simForm.status}
                    onChange={(e) => setSimForm({ ...simForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Complete">Verified Complete</option>
                    <option value="Terminates">Terminated / Screenout</option>
                    <option value="Quota Full">Quota Full</option>
                    <option value="Security Terminate">Security Terminate</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSimModal(false)}
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
                      background: '#0F172A', 
                      borderColor: '#0F172A',
                      fontWeight: 600 
                    }}
                  >
                    {submitting ? 'Registering...' : 'Register Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
