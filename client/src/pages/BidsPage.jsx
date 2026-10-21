import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2,
  Rocket, 
  Briefcase, 
  TrendingUp, 
  X, 
  Check, 
  Building2,
  Users,
  Layers,
  ListPlus,
  UserCheck,
  MailCheck,
  Cpu
} from 'lucide-react';
import { getBids, createBid, updateBidStatus, deleteBid, getClients, convertBidToProject, getBidOptions, addBidOption, deleteBidOption, sendBidBookingNotification, getTeamMembers } from '../services/api';
import ModalPortal from '../components/ModalPortal';

export default function BidsPage() {
  const [bids, setBids] = useState([]);
  const [summary, setSummary] = useState({ totalBids: 0, wonBids: 0, pendingBids: 0, pipelineValue: 0 });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [teamMembers, setTeamMembers] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingBid, setBookingBid] = useState(null);
  const [bookingPm, setBookingPm] = useState(1);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [converting, setConverting] = useState(false);

  // Structured Tier Form State
  const [tierForm, setTierForm] = useState({
    name: '',
    n: 500,
    loi: 15,
    ir: 80,
    device: 'All Devices',
    client_cpi: 2.50,
    vendor_cpi: 1.75,
    threat_check: true
  });

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedBidForOptions, setSelectedBidForOptions] = useState(null);
  const [bidOptions, setBidOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [addingOption, setAddingOption] = useState(false);

  const handleOpenOptions = async (bid) => {
    setSelectedBidForOptions(bid);
    setShowOptionsModal(true);
    setLoadingOptions(true);
    try {
      const res = await getBidOptions(bid.id);
      if (res && res.success) {
        setBidOptions(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load bid options:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!tierForm.name.trim()) return;
    try {
      setAddingOption(true);
      const specString = `N=${tierForm.n} • LOI=${tierForm.loi}m • IR=${tierForm.ir}% • ${tierForm.device} • Client $${tierForm.client_cpi} / Vendor $${tierForm.vendor_cpi}${tierForm.threat_check ? ' • RelevantID Active' : ''}`;
      const res = await addBidOption({
        bid_id: selectedBidForOptions.id,
        option_name: tierForm.name.trim(),
        value: specString
      });
      if (res && res.success) {
        setTierForm({
          name: '',
          n: 500,
          loi: 15,
          ir: 80,
          device: 'All Devices',
          client_cpi: 2.50,
          vendor_cpi: 1.75,
          threat_check: true
        });
        const refreshed = await getBidOptions(selectedBidForOptions.id);
        if (refreshed && refreshed.success) {
          setBidOptions(refreshed.data || []);
        }
      }
    } catch (err) {
      alert('Failed to add option');
    } finally {
      setAddingOption(false);
    }
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await deleteBidOption(optionId);
      setBidOptions(prev => prev.filter(o => o.id !== optionId));
    } catch (err) {
      alert('Failed to delete option');
    }
  };

  const [form, setForm] = useState({
    name: '',
    client_id: 1,
    cpi: 1.50,
    sample_size: 500,
    specifications: '',
    status: 'Pending',
    created_by: 'VMH Admin'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bidsRes, clientsRes, teamRes] = await Promise.all([
        getBids(),
        getClients(),
        getTeamMembers()
      ]);
      if (teamRes && teamRes.success) setTeamMembers(teamRes.data || []);
        
      if (bidsRes && bidsRes.success) {
        setBids(bidsRes.data || []);
        if (bidsRes.summary) setSummary(bidsRes.summary);
      }
      if (Array.isArray(clientsRes)) {
        setClients(clientsRes);
        if (clientsRes.length > 0 && !form.client_id) {
          setForm(prev => ({ ...prev, client_id: clientsRes[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load bids:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await createBid(form);
      setShowModal(false);
      setForm({
        name: '',
        client_id: clients[0]?.id || 1,
        cpi: 1.50,
        sample_size: 500,
        specifications: '',
        status: 'Pending',
        created_by: 'VMH Admin'
      });
      await loadData();
    } catch (err) {
      console.error('Failed to create bid:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBidStatus(id, newStatus);
      setBids(prev => prev.map(b => (b.id === id ? { ...b, status: newStatus } : b)));
      loadData();
    } catch (err) {
      console.error('Failed to update bid status:', err);
    }
  };

  const handleConvertToProject = (b) => {
    setBookingBid(b);
    setBookingPm(teamMembers[0]?.id || 1);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingBid) return;
    try {
      setConverting(true);
      const res = await convertBidToProject(bookingBid.id);
      if (res && res.success) {
        if (sendEmailNotification) {
          try {
            await sendBidBookingNotification({
              bid_id: bookingBid.id,
              pm_user: Number(bookingPm)
            });
          } catch (me) {}
        }
        alert(res.message || 'Bid successfully booked and converted into a live Study!');
        setShowBookingModal(false);
        await loadData();
      } else {
        alert(res?.message || 'Failed to convert bid');
      }
    } catch (err) {
      alert('Error booking project: ' + (err.message || 'Server error'));
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bid proposal?')) return;
    try {
      await deleteBid(id);
      setBids(prev => prev.filter(b => b.id !== id));
      loadData();
    } catch (err) {
      console.error('Failed to delete bid:', err);
    }
  };

  const filtered = bids.filter(b => {
    const matchesSearch = 
      (b.bid_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.client_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.bid_id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (b.status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1d2c48', margin: '0 0 4px 0' }}>
            Bids & Quotation Pipeline
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Real-time survey feasibility inquiries, pricing proposals, and client RFQs.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, borderRadius: '6px' }}
        >
          <Plus size={16} /> New Bid Proposal
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="report-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Bids</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1d2c48' }}>{summary.totalBids || bids.length}</div>
          </div>
        </div>

        <div className="report-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(3, 216, 127, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#03d87f' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Won Proposals</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#03d87f' }}>{summary.wonBids || 0}</div>
          </div>
        </div>

        <div className="report-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(255, 184, 34, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffb822' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffb822' }}>{summary.pendingBids || 0}</div>
          </div>
        </div>

        <div className="report-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pipeline Volume</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1d2c48' }}>${(summary.pipelineValue || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="report-card" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#8997bd" />
          <input
            type="text"
            className="input-control"
            style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
            placeholder="Search proposals by title, client name, or bid code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['ALL', 'PENDING', 'WON', 'LOST'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-light'}`}
              style={{ fontSize: '11.5px', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bids Table */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>BID ID</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>PROPOSAL NAME</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>CLIENT</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>CPI ($)</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>SAMPLE SIZE</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>EST. VALUE</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>STATUS</th>
                <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#8997bd' }}>
                    Loading bids pipeline...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '50px 20px', textAlign: 'center' }}>
                    <FileText size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d2c48' }}>No bids proposals found</div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px 0' }}>Click "New Bid Proposal" above to create your first client feasibility inquiry.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const estValue = ((Number(b.cpi) || 0) * (Number(b.sample_size) || 0));
                  const isWon = (b.status || '').toLowerCase() === 'won';
                  const isLost = (b.status || '').toLowerCase() === 'lost';
                  const isPending = !isWon && !isLost;

                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1761fd' }}>
                        {b.bid_id || `BID-#${b.id}`}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d2c48' }}>{b.bid_name}</div>
                        {b.specifications && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{b.specifications}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                        {b.client_name}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 700, color: '#03d87f' }}>
                        ${Number(b.cpi).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1d2c48' }}>
                        {Number(b.sample_size).toLocaleString()} completes
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 700, color: '#1d2c48' }}>
                        ${estValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <select
                          value={b.status || 'Pending'}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className={`badge ${isWon ? 'badge-soft-success' : isLost ? 'badge-soft-danger' : 'badge-soft-warning'}`}
                          style={{ border: 'none', outline: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                          <option value="Under Review">Under Review</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => handleConvertToProject(b)}
                            style={{ 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              cursor: 'pointer'
                            }}
                            title="Convert Bid to Project / Study (Laravel replicate)"
                          >
                            <Rocket size={12} />
                            <span>Convert to Project</span>
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="btn btn-soft-danger btn-sm"
                            style={{ padding: '4px 8px', borderRadius: '4px' }}
                            title="Delete Bid"
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

      {/* Modal: New Bid */}
      {showModal && (
        <ModalPortal isOpen={showModal} onClose={() => setShowModal(false)}>
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
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#1761fd" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1d2c48' }}>New Bid Proposal</h3>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Proposal / Study Name *
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. US Healthcare Physicians Study Q4"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Client
                      </label>
                      <select
                        className="input-control"
                        value={form.client_id}
                        onChange={e => setForm({ ...form, client_id: Number(e.target.value) })}
                      >
                        {clients.length > 0 ? (
                          clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)
                        ) : (
                          <option value="1">Market Xcel</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Proposed CPI ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-control"
                        value={form.cpi}
                        onChange={e => setForm({ ...form, cpi: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Target Completes
                      </label>
                      <input
                        type="number"
                        className="input-control"
                        value={form.sample_size}
                        onChange={e => setForm({ ...form, sample_size: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Status
                      </label>
                      <select
                        className="input-control"
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Feasibility / Target Specifications
                    </label>
                    <textarea
                      rows="3"
                      className="input-control"
                      placeholder="Target IR, LOI, quotas, device requirements, screening notes..."
                      value={form.specifications}
                      onChange={e => setForm({ ...form, specifications: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-light" style={{ fontSize: '12px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ fontSize: '12px' }}>
                    {submitting ? 'Creating...' : 'Create Proposal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal: Bid Options & Pricing Tiers */}
      {showOptionsModal && selectedBidForOptions && (
        <ModalPortal isOpen={showOptionsModal} onClose={() => setShowOptionsModal(false)}>
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
              maxWidth: '560px',
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
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Pricing Tiers & Options
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Bid: {selectedBidForOptions.bid_name || selectedBidForOptions.name} (MySQL bid_options)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOptionsModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Add new tier option form */}
                <form onSubmit={handleAddOption} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14} color="#6366f1" /> Create Quota & Pricing Tier Option
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      required
                      placeholder="Tier Name (e.g. Tier 1 - General Population US)"
                      value={tierForm.name}
                      onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                    <input
                      type="number"
                      placeholder="Sample N"
                      value={tierForm.n}
                      onChange={(e) => setTierForm({ ...tierForm, n: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Sample Target N"
                    />
                    <select
                      value={tierForm.device}
                      onChange={(e) => setTierForm({ ...tierForm, device: e.target.value })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                    >
                      <option value="All Devices">All Devices</option>
                      <option value="Desktop Only">Desktop Only</option>
                      <option value="Mobile Only">Mobile Only</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="LOI (mins)"
                      value={tierForm.loi}
                      onChange={(e) => setTierForm({ ...tierForm, loi: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Length of Interview (mins)"
                    />
                    <input
                      type="number"
                      placeholder="IR (%)"
                      value={tierForm.ir}
                      onChange={(e) => setTierForm({ ...tierForm, ir: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Incidence Rate (%)"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Client CPI ($)"
                      value={tierForm.client_cpi}
                      onChange={(e) => setTierForm({ ...tierForm, client_cpi: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Client Price ($)"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Vendor CPI ($)"
                      value={tierForm.vendor_cpi}
                      onChange={(e) => setTierForm({ ...tierForm, vendor_cpi: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Vendor Cost ($)"
                    />
                    <button
                      type="submit"
                      disabled={addingOption}
                      className="btn btn-primary"
                      style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', whiteSpace: 'nowrap' }}
                    >
                      {addingOption ? '...' : '+ Save Tier'}
                    </button>
                  </div>
                </form>

                {/* Options List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                  {loadingOptions ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                      Loading options from bid_options table...
                    </div>
                  ) : bidOptions.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                      No tier options created yet. Add sample quotas or alternative pricing above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {bidOptions.map((opt) => (
                        <div
                          key={opt.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            borderBottom: '1px solid #f8fafc',
                            background: '#ffffff'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                              {opt.option_name}
                            </div>
                            {opt.value && (
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                {opt.value}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(opt.id)}
                            className="btn btn-soft-danger btn-sm"
                            style={{ padding: '3px 6px', borderRadius: '4px', border: 'none', background: '#fee2e2', color: '#dc2626' }}
                            title="Remove Tier Option"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}


      {/* Modal: Won Bid Project Booking & PM Assignment */}
      {showBookingModal && bookingBid && (
        <ModalPortal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)}>
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
              maxWidth: '480px',
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
                  <div style={{ background: '#dbeafe', padding: '6px', borderRadius: '6px', color: '#1d4ed8' }}>
                    <Rocket size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Convert Won Bid to Study
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Assign Project Manager & trigger booking notification
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} style={{ padding: '20px' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>
                    {bookingBid.bid_name || bookingBid.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#3b82f6', marginTop: '3px' }}>
                    Client: {bookingBid.client_name || 'Direct Client'} • CPI: ${bookingBid.cpi} • Sample: {bookingBid.sample_size} N
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Assign Project Manager (PM) *
                  </label>
                  <select
                    value={bookingPm}
                    onChange={(e) => setBookingPm(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}
                  >
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (@{m.username}) — {m.role_name || (Number(m.role_id) === 1 ? 'Super Admin' : 'PM')}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={sendEmailNotification}
                    onChange={(e) => setSendEmailNotification(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="sendNotification" style={{ fontSize: '12px', color: '#475569', cursor: 'pointer', margin: 0 }}>
                    Trigger booking confirmation alert to Project Manager (Laravel sendBookingEmail)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="btn btn-light"
                    style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={converting}
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, background: '#2563eb', borderColor: '#2563eb' }}
                  >
                    {converting ? 'Converting...' : 'Launch Project'}
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
