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
            <FileCheck2 size={22} color="#00C851" /> Zamplia Reconciliation & Auditing
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Verify official completes and monitor reversals directly from Zamplia Supply Accounting API.
          </p>
        </div>
      </div>

      {/* Date Filter Card (Solid White Card) */}
      <div className="card" style={{ marginBottom: '22px', padding: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '18px',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              From Date
            </label>
            <input 
              type="date" 
              className="input-field" 
              value={fromDate} 
              onChange={e => setFromDate(e.target.value)}
              style={{ width: '170px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              To Date
            </label>
            <input 
              type="date" 
              className="input-field" 
              value={toDate} 
              onChange={e => setToDate(e.target.value)}
              style={{ width: '170px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${activeSubTab === 'completes' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSubTab('completes')}
            >
              <CheckCircle2 size={15} /> Completes Report
            </button>
            <button 
              className={`btn ${activeSubTab === 'reversals' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setActiveSubTab('reversals')}
            >
              <AlertTriangle size={15} /> Reversals Report
            </button>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={fetchReconciliation}
            disabled={loading}
            style={{ marginLeft: 'auto' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '15px', height: '15px' }} /> Fetching Audit...
              </>
            ) : (
              <>
                <Search size={15} /> Fetch Zamplia Audit
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '14px 18px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          color: '#DC2626',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Table */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
            {activeSubTab === 'completes' ? 'Official Zamplia Completes' : 'Zamplia Reversals & Scrapped Leads'}
          </h3>
          {records.length > 0 && (
            <span className="badge badge-success">
              {records.length} Records Found
            </span>
          )}
        </div>

        {!hasSearched ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Calendar size={44} style={{ opacity: 0.3, marginBottom: '14px', color: '#64748B' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
              Select a Date Range to Run Audit
            </h4>
            <p style={{ margin: 0, fontSize: '13px' }}>
              Queries Zamplia Supply API endpoint <code>/api/v1/reconciliation/{activeSubTab}</code> to match internal panel completes.
            </p>
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} style={{ opacity: 0.6, color: '#00C851', marginBottom: '10px' }} />
            <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>
              No {activeSubTab} records reported by Zamplia for the period {fromDate} to {toDate}.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
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
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                      {r.SurveyId || r.survey_id || 'N/A'}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-body)', fontSize: '12px' }}>
                      {r.SupplierTransactionId || r.transaction_id || r.rid || 'N/A'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {r.CompleteDate || r.date || 'N/A'}
                    </td>
                    <td style={{ fontWeight: 800, color: '#00C851' }}>
                      ${Number(r.Cpi || r.cpi || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${activeSubTab === 'completes' ? 'badge-success' : 'badge-danger'}`}>
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
