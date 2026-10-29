import React, { useEffect, useState } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import { ZampliaAPI } from '../services/api';
import ModalPortal from './ModalPortal';

export default function QualsModal({ survey, surveyId, onClose }) {
  const [quals, setQuals] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentId = survey?.SurveyId || survey?.survey_id || survey?.surveyId || survey?.id || (typeof survey === 'string' || typeof survey === 'number' ? survey : surveyId);
  const currentName = survey?.Name || survey?.survey_name || `Survey #${currentId}`;

  useEffect(() => {
    if (!currentId) return;
    setLoading(true);
    ZampliaAPI.getQualifications(currentId)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setQuals(Array.isArray(list) ? list : []);
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
            <UserCheck size={18} color="#00C851" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Survey Qualifications & Targeting Requirements
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
            className="btn-modal-close"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
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
              <p style={{ margin: 0, fontSize: '13px' }}>Fetching targeting qualifications from Zamplia Supply API...</p>
            </div>
          ) : quals.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Question / Demographic</th>
                    <th>Condition</th>
                    <th>Acceptable Answers / Codes</th>
                  </tr>
                </thead>
                <tbody>
                  {quals.map((item, idx) => {
                    const answers = Array.isArray(item.Answers) ? item.Answers.join(', ') : (item.Answers || 'Any');
                    return (
                      <tr key={idx}>
                        <td>
                          <strong style={{ color: '#0F172A' }}>{item.Name || item.QualificationId || 'Demographic Criterion'}</strong>
                        </td>
                        <td>
                          <span className="badge badge-info">{item.Operator || 'Equals'}</span>
                        </td>
                        <td>
                          <code style={{ fontFamily: 'monospace', color: '#0F172A', background: '#F1F5F9', border: '1px solid var(--border-color)', padding: '3px 6px', borderRadius: '4px' }}>
                            {answers}
                          </code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '16px', borderRadius: '8px', color: '#059669' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>No specific qualification filters required. Open to general population.</span>
            </div>
          )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
