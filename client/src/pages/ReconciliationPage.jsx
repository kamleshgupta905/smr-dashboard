import React, { useState } from 'react';
import { 
  FileCheck2, 
  Calendar, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign
} from 'lucide-react';
import { getReconciliationCompletes } from '../services/api';

export default function ReconciliationPage() {
  const [activeSubTab, setActiveSubTab] = useState('completes');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const fetchReconciliation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReconciliationCompletes(fromDate, toDate);
      if (res && res.data) {
        setRecords(Array.isArray(res.data) ? res.data : []);
      } else {
        setRecords([]);
      }
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch Zamplia reconciliation records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Dastone Page Title Box */}
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
            <h4 className="page-title">
              Zamplia Reconciliation & Auditing
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
              Accounting Ledger Ready
            </span>
          </div>
        </div>
      </div>

      {/* Date Filter Card (Dastone Report Card) */}
      <div className="report-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
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

            {/* Timeframe Group Switcher */}
            <div className="timeframe-group">
              <button 
                className={`timeframe-btn ${activeSubTab === 'completes' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('completes')}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12px' }}
              >
                <CheckCircle2 size={13} color={activeSubTab === 'completes' ? '#03d87f' : '#8997bd'} /> Completes Report
              </button>
              <button 
                className={`timeframe-btn ${activeSubTab === 'reversals' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('reversals')}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12px' }}
              >
                <AlertTriangle size={13} color={activeSubTab === 'reversals' ? '#f5325c' : '#8997bd'} /> Reversals Report
              </button>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={fetchReconciliation}
            disabled={loading}
            style={{ fontSize: '12px', fontWeight: 600, padding: '7px 16px', borderRadius: '4px', height: '34px' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '13px', height: '13px' }} /> Fetching Audit...
              </>
            ) : (
              <>
                <Search size={13} /> Fetch Zamplia Audit
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(245, 50, 92, 0.08)',
          border: '1px solid rgba(245, 50, 92, 0.2)',
          borderRadius: '6px',
          color: '#f5325c',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12.5px'
        }}>
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Table (Dastone Report Card) */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="report-card-header">
          <h4 className="report-card-title">
            <FileCheck2 size={15} color="#1761fd" /> {activeSubTab === 'completes' ? 'Official Zamplia Completes' : 'Zamplia Reversals & Scrapped Leads'}
          </h4>
          {records.length > 0 && (
            <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
              {records.length} Records Found
            </span>
          )}
        </div>

        {!hasSearched ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8997bd' }}>
            <Calendar size={40} style={{ opacity: 0.35, marginBottom: '12px', color: '#1761fd' }} />
            <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1d2c48', margin: '0 0 4px 0' }}>
              Select a Date Range to Run Audit
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px' }}>
              Queries Zamplia Supply API endpoint <code>/api/v1/reconciliation/{activeSubTab}</code> to match internal panel completes.
            </p>
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8997bd' }}>
            <CheckCircle2 size={36} style={{ color: '#03d87f', marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '13.5px', color: '#1d2c48', fontWeight: 600 }}>
              No {activeSubTab} records reported by Zamplia for the period {fromDate} to {toDate}.
            </p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead className="thead-light">
                <tr>
                  <th>Zamplia Survey ID</th>
                  <th>Transaction / Lead ID</th>
                  <th>Complete Date</th>
                  <th>Payout / CPI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                        {r.SurveyId || r.survey_id || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#303e67', fontSize: '12px' }}>
                      {r.SupplierTransactionId || r.transaction_id || r.rid || 'N/A'}
                    </td>
                    <td style={{ color: '#8997bd', fontSize: '12.5px' }}>
                      {r.CompleteDate || r.date || 'N/A'}
                    </td>
                    <td style={{ fontWeight: 800, color: '#03d87f', fontSize: '13.5px' }}>
                      ${Number(r.Cpi || r.cpi || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={activeSubTab === 'completes' ? 'badge-soft-success' : 'badge-soft-danger'} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span className={activeSubTab === 'completes' ? 'pulse-dot' : 'pulse-dot pulse-danger'} />
                        {activeSubTab === 'completes' ? 'Verified Complete' : 'Reversed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
