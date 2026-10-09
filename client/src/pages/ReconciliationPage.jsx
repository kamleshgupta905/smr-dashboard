import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Calendar,
  Search,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Download,
  Radio,
  RotateCcw,
  Clock
} from 'lucide-react';
import { getReconciliationCompletes, getReconciliationReversals, getInternalLeads } from '../services/api';

const STATUS_STYLES = {
  Complete: { bg: 'rgba(3, 216, 127, 0.1)', color: '#03a36a', label: 'Verified Complete' },
  Reversed: { bg: 'rgba(245, 50, 92, 0.1)', color: '#e11d48', label: 'Reversed' },
  Pending: { bg: 'rgba(23, 97, 253, 0.08)', color: '#1761fd', label: 'Pending' },
  Terminates: { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', label: 'Terminated' },
  'Quota Full': { bg: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', label: 'Quota Full' },
  'Quality Terminate': { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', label: 'Quality Terminated' },
  'Security Terminate': { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', label: 'Security Terminated' },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span style={{
      padding: '3px 9px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: style.bg,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      <span className="pulse-dot" style={{ background: style.color }} />
      {style.label}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="report-card" style={{ padding: '16px 18px', margin: 0, flex: 1, minWidth: '180px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#7081b9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {label}
        </span>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: '#1d2c48', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: '#8997bd', marginTop: '5px' }}>{sub}</div>
      )}
    </div>
  );
}

export default function ReconciliationPage() {
  const [activeSubTab, setActiveSubTab] = useState('completes');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReconciliation = async (tab = activeSubTab) => {
    setLoading(true);
    setError(null);
    setSearchTerm('');
    try {
      let res;
      if (tab === 'completes') {
        res = await getReconciliationCompletes(fromDate, toDate);
      } else if (tab === 'reversals') {
        res = await getReconciliationReversals(fromDate, toDate);
      } else {
        res = await getInternalLeads(200);
      }

      const rows = Array.isArray(res?.data) ? res.data : [];
      setRecords(rows);
      setDataSource(res?.source || 'Zamplia Live Supply Gateway');
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch reconciliation records');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveSubTab(tab);
    fetchReconciliation(tab);
  };

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const q = searchTerm.toLowerCase();
    return records.filter((r) =>
      String(r.SurveyId ?? r.surveyId ?? '').toLowerCase().includes(q) ||
      String(r.SupplierTransactionId ?? r.participantId ?? '').toLowerCase().includes(q) ||
      String(r.SurveyName ?? r.surveyName ?? '').toLowerCase().includes(q) ||
      String(r.VendorCode ?? r.vendorName ?? '').toLowerCase().includes(q) ||
      String(r.Status ?? r.status ?? '').toLowerCase().includes(q)
    );
  }, [records, searchTerm]);

  const summary = useMemo(() => {
    const completes = filteredRecords.filter((r) => {
      const s = (r.Status ?? r.status ?? 'Complete').toString().toLowerCase();
      return s === 'complete' || s === 'verified complete';
    });
    const reversed = filteredRecords.filter((r) => {
      const s = (r.Status ?? r.status ?? '').toString().toLowerCase();
      return s === 'reversed';
    });
    const payout = filteredRecords.reduce((acc, r) => acc + Number(r.Cpi ?? r.cpi ?? 0), 0);
    return {
      total: filteredRecords.length,
      completes: completes.length,
      reversed: reversed.length,
      payout,
      matchRate: filteredRecords.length
        ? Math.round((completes.length / filteredRecords.length) * 100)
        : 0,
    };
  }, [filteredRecords]);

  const handleExportCsv = () => {
    const isInternal = activeSubTab === 'internal';
    const headers = isInternal
      ? ['Lead ID', 'Survey ID', 'Vendor', 'Transaction ID', 'Event Date', 'Status', 'Duration (min)', 'IP Address']
      : ['Reconciliation ID', 'Survey ID', 'Survey Name', 'Transaction ID', 'Date', 'CPI ($)', 'Status', 'Reversal Reason'];
    const rows = filteredRecords.map((r) =>
      isInternal
        ? [
            r.LeadId ?? '',
            r.SurveyId ?? '',
            `"${r.VendorCode ?? ''}"`,
            r.SupplierTransactionId ?? '',
            r.EventDate ?? '',
            r.Status ?? '',
            r.DurationMinutes ?? '',
            r.IpAddress ?? '',
          ]
        : [
            r.ReconciliationId ?? '',
            r.SurveyId ?? r.surveyId ?? '',
            `"${String(r.SurveyName ?? r.surveyName ?? '').replace(/"/g, '""')}"`,
            r.SupplierTransactionId ?? r.participantId ?? r.verificationCode ?? '',
            r.CompleteDate ?? r.completionDate ?? '',
            Number(r.Cpi ?? r.cpi ?? 0).toFixed(2),
            r.Status ?? r.status ?? '',
            `"${r.ReversalReason ?? r.reversalReason ?? ''}"`,
          ]
    );
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vmh-reconciliation-${activeSubTab}-${fromDate}-to-${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Auditing</span>
            <span className="separator">/</span>
            <span className="current">Reconciliation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">Reports & Reconciliation</h4>
            <span className="badge-soft-success" style={{
              padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: '5px'
            }}>
              <span className="pulse-dot" />
              Live Data Ready
            </span>
          </div>
        </div>
      </div>

      {/* Date Filter + Tabs Card */}
      <div className="report-card" style={{ marginBottom: '16px', padding: '16px 20px' }}>
        <div style={{
          display: 'flex', gap: '16px', alignItems: 'flex-end',
          justifyContent: 'space-between', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#7081b9', marginBottom: '5px', textTransform: 'uppercase' }}>
                From Date
              </label>
              <input
                type="date"
                className="input-control"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{ width: '160px', height: '34px', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#7081b9', marginBottom: '5px', textTransform: 'uppercase' }}>
                To Date
              </label>
              <input
                type="date"
                className="input-control"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{ width: '160px', height: '34px', fontSize: '12px' }}
              />
            </div>

            {/* Report Switcher */}
            <div className="timeframe-group">
              <button
                className={`timeframe-btn ${activeSubTab === 'completes' ? 'active' : ''}`}
                onClick={() => switchTab('completes')}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12px' }}
              >
                <CheckCircle2 size={13} color={activeSubTab === 'completes' ? '#03a36a' : '#8997bd'} /> Completes
              </button>
              <button
                className={`timeframe-btn ${activeSubTab === 'reversals' ? 'active' : ''}`}
                onClick={() => switchTab('reversals')}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12px' }}
              >
                <AlertTriangle size={13} color={activeSubTab === 'reversals' ? '#e11d48' : '#8997bd'} /> Reversals
              </button>
              <button
                className={`timeframe-btn ${activeSubTab === 'internal' ? 'active' : ''}`}
                onClick={() => switchTab('internal')}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12px' }}
              >
                <Radio size={13} color={activeSubTab === 'internal' ? '#1761fd' : '#8997bd'} /> Internal Live Traffic
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {hasSearched && filteredRecords.length > 0 && (
              <button
                className="btn btn-soft-secondary"
                onClick={handleExportCsv}
                title="Export current view as CSV"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', height: '34px' }}
              >
                <Download size={13} /> Export CSV
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => fetchReconciliation()}
              disabled={loading}
              style={{ fontSize: '12px', fontWeight: 600, padding: '7px 16px', borderRadius: '4px', height: '34px' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '13px', height: '13px' }} /> Fetching Audit...
                </>
              ) : (
                <>
                  <Search size={13} /> Fetch {activeSubTab === 'internal' ? 'Live Traffic' : 'Zamplia Audit'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(245, 50, 92, 0.08)',
          border: '1px solid rgba(245, 50, 92, 0.2)',
          borderRadius: '6px',
          color: '#e11d48',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12.5px'
        }}>
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      {hasSearched && filteredRecords.length > 0 && (
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <SummaryCard icon={FileCheck2} label="Total Transactions" value={summary.total} color="#1761fd"
            sub={dataSource ? `Source: ${dataSource}` : undefined} />
          <SummaryCard icon={CheckCircle2} label="Verified Completes" value={summary.completes} color="#03a36a"
            sub={`${summary.matchRate}% match rate`} />
          <SummaryCard icon={RotateCcw} label="Reversals" value={summary.reversed} color="#e11d48"
            sub={summary.reversed > 0 ? 'Billing adjustments pending' : 'Clean ledger'} />
          <SummaryCard icon={DollarSign} label="Net Payout" value={`$${summary.payout.toFixed(2)}`} color="#d97706"
            sub="Sum of per-transaction CPI" />
        </div>
      )}

      {/* Results Table */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="report-card-header">
          <h4 className="report-card-title">
            {activeSubTab === 'completes' && <><FileCheck2 size={15} color="#1761fd" /> Zamplia Completes Ledger</>}
            {activeSubTab === 'reversals' && <><AlertTriangle size={15} color="#e11d48" /> Zamplia Reversals (Scrapped Leads)</>}
            {activeSubTab === 'internal' && <><Radio size={15} color="#1761fd" /> Internal Live Traffic (Vendor Clicks & Outcomes)</>}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {hasSearched && filteredRecords.length > 0 && (
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
                <input
                  type="text"
                  className="input-control"
                  placeholder="Filter rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '30px', width: '180px', height: '30px', fontSize: '11.5px' }}
                />
              </div>
            )}
            {filteredRecords.length > 0 && (
              <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                {filteredRecords.length} Records
              </span>
            )}
          </div>
        </div>

        {!hasSearched ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8997bd' }}>
            <Calendar size={40} style={{ opacity: 0.35, marginBottom: '12px', color: '#1761fd' }} />
            <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1d2c48', margin: '0 0 4px 0' }}>
              Select a Date Range to Run Audit
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px' }}>
              {activeSubTab === 'internal'
                ? 'Pulls the live internal lead ledger — every vendor click with its routing outcome.'
                : <>Queries Zamplia Supply API <code>/api/v1/reconciliation</code> and matches per-transaction completes & reversals.</>}
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8997bd' }}>
            <CheckCircle2 size={36} style={{ color: '#03a36a', marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '13.5px', color: '#1d2c48', fontWeight: 600 }}>
              No {activeSubTab === 'internal' ? 'traffic' : activeSubTab} records found for the period {fromDate} to {toDate}.
            </p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0, overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '900px' }}>
              <thead className="thead-light">
                {activeSubTab === 'internal' ? (
                  <tr>
                    <th>Survey / Project</th>
                    <th>Vendor</th>
                    <th>Transaction ID</th>
                    <th>Event Date</th>
                    <th>Duration</th>
                    <th>IP Address</th>
                    <th>Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Zamplia Survey</th>
                    <th>Transaction / Lead ID</th>
                    <th>Complete Date</th>
                    <th>Payout / CPI</th>
                    {activeSubTab === 'reversals' && <th>Reversal Reason</th>}
                    <th>Status</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => {
                  const status = r.Status ?? r.status ?? 'Complete';
                  const surveyLabel = r.SurveyName ?? r.surveyName;

                  if (activeSubTab === 'internal') {
                    return (
                      <tr key={r.LeadId ?? idx}>
                        <td>
                          <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                            {r.SurveyId ?? '—'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#303e67', fontSize: '12px' }}>{r.VendorCode ?? '—'}</td>
                        <td style={{ fontFamily: 'monospace', color: '#303e67', fontSize: '12px' }}>{r.SupplierTransactionId ?? '—'}</td>
                        <td style={{ color: '#8997bd', fontSize: '12.5px' }}>{formatDate(r.EventDate)}</td>
                        <td>
                          {r.DurationMinutes != null ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#303e67' }}>
                              <Clock size={12} color="#8997bd" /> {r.DurationMinutes} min
                            </span>
                          ) : (
                            <span style={{ color: '#8997bd', fontSize: '12px' }}>In progress…</span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', color: '#8997bd', fontSize: '11.5px' }}>{r.IpAddress ?? '—'}</td>
                        <td><StatusBadge status={status} /></td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={r.ReconciliationId ?? r.participantId ?? idx}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1d2c48', fontSize: '12.5px' }}>
                          {surveyLabel || `Survey #${r.SurveyId ?? r.surveyId ?? '—'}`}
                        </div>
                        <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px' }}>
                          ID: {r.SurveyId ?? r.surveyId ?? '—'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#303e67', fontSize: '12px' }}>
                        {r.SupplierTransactionId ?? r.participantId ?? r.verificationCode ?? '—'}
                      </td>
                      <td style={{ color: '#8997bd', fontSize: '12.5px' }}>
                        {formatDate(r.CompleteDate ?? r.completionDate)}
                      </td>
                      <td style={{ fontWeight: 800, color: status === 'Reversed' || status === 'reversed' ? '#e11d48' : '#03a36a', fontSize: '13.5px' }}>
                        ${Number(r.Cpi ?? r.cpi ?? 0).toFixed(2)}
                      </td>
                      {activeSubTab === 'reversals' && (
                        <td style={{ fontSize: '12px', color: '#e11d48', maxWidth: '220px' }}>
                          {r.ReversalReason ?? r.reversalReason ?? '—'}
                        </td>
                      )}
                      <td><StatusBadge status={status === 'complete' ? 'Complete' : status === 'reversed' ? 'Reversed' : status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
