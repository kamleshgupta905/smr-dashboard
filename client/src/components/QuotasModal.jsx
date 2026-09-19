import React, { useEffect, useState } from 'react';
import { X, PieChart, AlertCircle } from 'lucide-react';
import { ZampliaAPI } from '../services/api';
import ModalPortal from './ModalPortal';

export default function QuotasModal({ survey, surveyId, onClose }) {
  const [quotas, setQuotas] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentId = survey?.SurveyId || survey?.survey_id || (typeof survey === 'string' || typeof survey === 'number' ? survey : surveyId);
  const currentName = survey?.Name || survey?.survey_name || `Survey #${currentId}`;

  useEffect(() => {
    if (!currentId) return;
    setLoading(true);
    ZampliaAPI.getQuotas(currentId)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setQuotas(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentId]);

  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#00C851" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Survey Quotas & Capacity Status
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ 
            background: '#F8FAFC', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '16px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Survey Target: </span>
              <strong style={{ color: '#0F172A' }}>{currentName}</strong>
            </div>
            <span className="badge badge-purple">PID: {currentId}</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>Fetching live quotas from Zamplia Supply API...</p>
            </div>
          ) : quotas.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Quota Bucket / Name</th>
                    <th>Required</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quotas.map((q, idx) => {
                    const remaining = q.RemainingQuota ?? q.CompletesRemaining ?? 'Open';
                    const target = q.QuotaTarget ?? q.NumberOfRespondents ?? 'N/A';
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#0F172A' }}>
                          {q.QuotaName || q.Name || `Bucket #${idx + 1}`}
                        </td>
                        <td>{target}</td>
                        <td style={{ color: '#00C851', fontWeight: 700 }}>{remaining}</td>
                        <td>
                          <span className={`badge ${remaining === 0 ? 'badge-danger' : 'badge-success'}`}>
                            {remaining === 0 ? 'Full' : 'Open'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px' }}>No granular sub-quotas defined. Survey accepts all qualifying traffic.</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </ModalPortal>
  );
}
