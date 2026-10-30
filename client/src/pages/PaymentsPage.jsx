import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2, 
  CreditCard, 
  TrendingUp, 
  X, 
  Building2,
  Users,
  Download,
  Edit2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getPayments, createPayment, updatePaymentStatus, deletePayment, getVendors, getProjects } from '../services/api';
import ModalPortal from '../components/ModalPortal';

export default function PaymentsPage({ currentUser, showToast, canAdd = true, canEdit = true, canDelete = true }) {
  const isVendor = currentUser?.role_name === "Vendor" || currentUser?.role === "Vendor";
  const vendorId = currentUser?.vendor_id || currentUser?.username;
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    total_count: 0,
    total_payout: 0,
    total_paid: 0,
    total_pending: 0,
    total_rejected: 0,
    count_paid: 0,
    count_pending: 0,
    count_rejected: 0
  });
  const [vendors, setVendors] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [createForm, setCreateForm] = useState({
    project_id: 1,
    project_name: '',
    vendor_id: '',
    amount: '',
    status: 'Pending',
    remarks: ''
  });

  const [editForm, setEditForm] = useState({
    id: null,
    payment_id: '',
    status: 'Pending',
    amount: '',
    remarks: ''
  });

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [payRes, venRes, projRes] = await Promise.all([
        getPayments(),
        getVendors(),
        getProjects().catch(() => ({ data: [] }))
      ]);

      const pList = projRes?.data || (Array.isArray(projRes) ? projRes : []);
      if (Array.isArray(pList) && pList.length > 0) {
        setProjectsList(pList);
        if (!createForm.project_name) {
          setCreateForm(prev => ({
            ...prev,
            project_id: pList[0].id || pList[0].project_id || 1,
            project_name: pList[0].project_name || pList[0].name || ''
          }));
        }
      }

      if (payRes && payRes.success) {
        setPayments(payRes.data || []);
        if (payRes.summary) {
          setSummary(payRes.summary);
        }
      }

      const vList = Array.isArray(venRes) ? venRes : (venRes?.data || []);
      if (Array.isArray(vList) && vList.length > 0) {
        setVendors(vList);
        if (!createForm.vendor_id) {
          setCreateForm(prev => ({ ...prev, vendor_id: vList[0].id || vList[0].vendor_id }));
        }
      }
    } catch (err) {
      console.error('Failed to load payments data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
    // Real-time pulse every 15s to keep reconciliation statements synced
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.amount || Number(createForm.amount) <= 0) {
      if (showToast) showToast('Please enter a valid payout amount.', 'error');
      else alert('Please enter a valid payout amount.');
      return;
    }
    setSubmitting(true);
    try {
      await createPayment({
        project_id: createForm.project_id || 1,
        vendor_id: createForm.vendor_id || (vendors[0]?.id || 1),
        amount: parseFloat(createForm.amount),
        status: createForm.status,
        remarks: createForm.remarks || `Vendor payout for ${createForm.project_name || 'Market Research Study'}`
      });
      setShowCreateModal(false);
      setCreateForm({
        project_id: 1,
        project_name: '',
        vendor_id: vendors[0]?.id || '',
        amount: '',
        status: 'Pending',
        remarks: ''
      });
      if (showToast) showToast('✓ Payment voucher recorded successfully!');
      await loadData(false);
    } catch (err) {
      console.error('Failed to create payment:', err);
      if (showToast) showToast('Failed to record payout. Please try again.', 'error');
      else alert('Failed to record payout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.id) return;
    setSubmitting(true);
    try {
      await updatePaymentStatus({
        id: editForm.id,
        status: editForm.status,
        amount: parseFloat(editForm.amount),
        remarks: editForm.remarks
      });
      setShowEditModal(false);
      if (showToast) showToast('✓ Payment record updated successfully!');
      await loadData(false);
    } catch (err) {
      console.error('Failed to update payment:', err);
      if (showToast) showToast('Failed to update payment record.', 'error');
      else alert('Failed to update payment record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (payment, newStatus) => {
    try {
      await updatePaymentStatus({
        id: payment.id,
        status: newStatus,
        remarks: payment.remarks
      });
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: newStatus } : p));
      if (showToast) showToast(`✓ Payout #${payment.payment_id || payment.id} marked as ${newStatus}!`);
      loadData(true);
    } catch (err) {
      console.error('Failed to quick update status:', err);
      if (showToast) showToast('Could not update status.', 'error');
    }
  };

  const handleDelete = async (id, paymentId) => {
    if (!window.confirm(`Are you sure you want to permanently delete payout record #${paymentId || id}?`)) {
      return;
    }
    try {
      await deletePayment(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      loadData();
    } catch (err) {
      console.error('Failed to delete payment:', err);
      alert('Failed to delete payment record.');
    }
  };

  const openEditModal = (p) => {
    setSelectedPayment(p);
    setEditForm({
      id: p.id,
      payment_id: p.payment_id || `PAY#${p.id}`,
      status: p.status || 'Pending',
      amount: p.amount || 0,
      remarks: p.remarks || ''
    });
    setShowEditModal(true);
  };

  const exportCSV = () => {
    if (payments.length === 0) return;
    const headers = ['Payment ID', 'Project', 'Vendor', 'Amount ($)', 'Status', 'Date', 'Remarks'];
    const rows = payments.map(p => [
      `"${p.payment_id || p.id}"`,
      `"${(p.project_name || '').replace(/"/g, '""')}"`,
      `"${(p.vendor_name || '').replace(/"/g, '""')}"`,
      p.amount,
      `"${p.status}"`,
      `"${p.date || p.created_at || ''}"`,
      `"${(p.remarks || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vmh_vendor_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = payments.filter((p) => {
    const matchesSearch = 
      (p.payment_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.project_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.vendor_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.remarks || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || (p.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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
              <CreditCard size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1d2c48', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Vendor Payments & Disbursements
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                Track project payouts, vendor disbursement ledgers, reconciliation approvals, and settlement dates
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            title="Refresh Ledger"
          >
            <RefreshCw size={13} className={loading ? 'fa-spin' : ''} />
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
          {canAdd && (
            <button
              onClick={() => setShowCreateModal(true)}
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
              + Record Payout
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Ledger */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Ledger Volume</span>
              <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px', color: '#475569' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              ${Number(summary.total_payout || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Across {Number(summary.total_count || payments.length)} transactions
            </div>
          </div>
        </div>

        {/* Settled / Paid */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid & Disbursed</span>
              <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
              ${Number(summary.total_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {Number(summary.count_paid || 0)} settled payouts
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Approval</span>
              <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px', color: '#d97706' }}>
                <Clock size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>
              ${Number(summary.total_pending || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {Number(summary.count_pending || 0)} in pipeline
            </div>
          </div>
        </div>

        {/* Rejected / Withheld */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejected / Flagged</span>
              <div style={{ background: '#ffe4e6', padding: '8px', borderRadius: '8px', color: '#e11d48' }}>
                <XCircle size={16} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#e11d48' }}>
              ${Number(summary.total_rejected || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {Number(summary.count_rejected || 0)} rejected
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Filter Controls */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['ALL', 'Pending', 'Paid', 'Rejected'].map((st) => (
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
                {st === 'ALL' ? 'All Payments' : st}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by ID, project, vendor..."
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
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#e9ebf8', borderBottom: '1px solid #d6d9ef' }}>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment ID</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project / Study</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vendor Partner</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Disbursed Amount</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date / Time</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Remarks</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#2a2d8c', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    <RefreshCw size={24} className="fa-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    Loading vendor payment records from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '50px 20px', textAlign: 'center' }}>
                    <CreditCard size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>No payment records found</div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px 0' }}>Click "Record Payout" above to record a new vendor disbursement.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isPaid = (p.status || '').toLowerCase() === 'paid';
                  const isRejected = (p.status || '').toLowerCase() === 'rejected';
                  const isPending = !isPaid && !isRejected;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                        {p.payment_id || `PAY#${p.id}`}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{p.project_name || `Study #${p.project_id}`}</div>
                        {p.project_code && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Code: {p.project_code}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={13} color="#94a3b8" />
                          {p.vendor_name || `Vendor #${p.vendor_id}`}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 800, color: isPaid ? '#059669' : '#0f172a' }}>
                        ${Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <select
                          value={p.status || 'Pending'}
                          onChange={(e) => handleQuickStatus(p, e.target.value)}
                          style={{
                            border: '1px solid transparent',
                            outline: 'none',
                            cursor: 'pointer',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '11px',
                            background: isPaid ? '#dcfce7' : isRejected ? '#ffe4e6' : '#fef3c7',
                            color: isPaid ? '#15803d' : isRejected ? '#b91c1c' : '#b45309'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid / Settled</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b' }}>
                        {p.date ? p.date.substring(0, 16) : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', maxWidth: '200px' }}>
                        <span title={p.remarks} style={{ display: 'inline-block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.remarks || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(p)}
                              style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '4px', 
                                background: '#2a2d8c', 
                                color: '#ffffff', 
                                border: 'none', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContents: 'center', 
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(42, 45, 140, 0.2)'
                              }}
                              title="Edit / Add Remarks"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id, p.payment_id)}
                              style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '4px', 
                                background: '#fee2e2', 
                                color: '#dc2626', 
                                border: 'none', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer' 
                              }}
                              title="Delete Record"
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

      {/* Modal: Record Payout */}
      {showCreateModal && (
        <ModalPortal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
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
                  <div style={{ background: '#dcfce7', padding: '6px', borderRadius: '6px', color: '#10b981' }}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Record Vendor Payout</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Add a payout entry to the vendor ledger</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Project / Study Name *
                  </label>
                  <input
                    type="text"
                    required
                    list="payments-projects-datalist"
                    placeholder="Select or enter study name..."
                    value={createForm.project_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = projectsList.find(p => (p.project_name === val || p.name === val || p.project_id === val));
                      setCreateForm({
                        ...createForm,
                        project_name: val,
                        project_id: match ? (match.id || match.project_id) : createForm.project_id
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  />
                  <datalist id="payments-projects-datalist">
                    {projectsList.map((p, idx) => (
                      <option key={idx} value={p.project_name || p.name || p.project_id}>
                        {p.project_id ? `[${p.project_id}] ` : ''}{p.project_name || p.name}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Vendor Partner *
                    </label>
                    <select
                      value={createForm.vendor_id}
                      onChange={(e) => setCreateForm({ ...createForm, vendor_id: e.target.value })}
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
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Disbursement Amount ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 750.00"
                      value={createForm.amount}
                      onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
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
                    Initial Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
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
                    <option value="Pending">Pending Approval</option>
                    <option value="Paid">Paid / Settled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Remarks / Invoice Reference
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Invoice #INV-2026-902 received via email"
                    value={createForm.remarks}
                    onChange={(e) => setCreateForm({ ...createForm, remarks: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                      background: '#10b981', 
                      borderColor: '#10b981',
                      fontWeight: 600 
                    }}
                  >
                    {submitting ? 'Recording...' : 'Save Payout'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal: Edit Payment & Remarks */}
      {showEditModal && (
        <ModalPortal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
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
                padding: '18px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Update Payment #{editForm.payment_id}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Modify status, amount, or reconciliation remarks</p>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Payment Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                    <option value="Pending">Pending Approval</option>
                    <option value="Paid">Paid / Settled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Payout Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
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
                    Reconciliation Remarks & Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter payment reference, bank transaction UTR, or reason..."
                    value={editForm.remarks}
                    onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn btn-light"
                    style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '8px', fontWeight: 600 }}
                  >
                    {submitting ? 'Updating...' : 'Save Changes'}
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
