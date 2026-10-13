import React, { useState } from 'react';
import { Copy, X, CheckCircle2, AlertCircle, ArrowRight, Layers, Sparkles } from 'lucide-react';
import ModalPortal from './ModalPortal';
import { duplicateProject } from '../services/api';

export default function DuplicateProjectModal({ isOpen, project, onClose, onSuccess }) {
  if (!isOpen || !project) return null;

  const originalId = project.id || project._id || project.survey_id || project.project_id;
  const originalName = project.name || project.survey_name || project.project_name || `Study #${originalId}`;
  const originalCpi = project.cpi || project.cost_per_complete || project.CPI || 1.00;
  const originalLoi = project.loi || project.LOI || 10;
  const originalIr = project.ir || project.IR || 80;
  const originalLimit = project.target_completes || project.max_limit || project.totalRequired || 500;

  const [formData, setFormData] = useState({
    target_name: `${originalName} (Clone)`,
    country: project.country || 'US',
    cost_per_complete: originalCpi,
    loi: originalLoi,
    ir: originalIr,
    max_limit: originalLimit,
    status: 'Pause',
    description: `Duplicated from #${originalId} [${originalName}]`
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await duplicateProject({
        source_project_id: originalId,
        target_name: formData.target_name.trim(),
        country: formData.country,
        cost_per_complete: parseFloat(formData.cost_per_complete),
        loi: parseInt(formData.loi, 10),
        ir: parseFloat(formData.ir),
        max_limit: parseInt(formData.max_limit, 10),
        status: formData.status,
        description: formData.description
      });

      if (res.success && res.project) {
        setSuccessResult(res.project);
        if (onSuccess) onSuccess(res.project);
      } else {
        throw new Error(res.message || 'Failed to clone study');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error occurred while duplicating study.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="dastone-modal-backdrop" onClick={onClose}>
        <div 
          className="dastone-modal-dialog" 
          style={{ maxWidth: '580px', width: '92%' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="dastone-modal-header" style={{ borderBottom: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Copy size={18} color="#1761fd" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                  1-Click Project Cloner
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Duplicate study parameters, quotas, and generate unique project ID
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Success Result View */}
          {successResult ? (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                Project Duplicated Successfully!
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                New unique Study ID <strong>{successResult.project_id || successResult.id}</strong> was registered in the database.
              </p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                  <strong>Study Name:</strong> {successResult.project_name || successResult.name}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                  <strong>New Project ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1761fd' }}>{successResult.project_id}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                  <strong>CPI:</strong> ${parseFloat(successResult.cpi || successResult.cost_per_complete).toFixed(2)} | <strong>LOI:</strong> {successResult.loi}m | <strong>IR:</strong> {successResult.ir}%
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  <strong>Status:</strong> <span style={{ color: successResult.status === 'Live' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{successResult.status}</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={onClose}
                style={{ width: '100%', padding: '10px', fontWeight: 600 }}
              >
                Done
              </button>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                {error && (
                  <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Source Project Summary Pill */}
                <div style={{ background: '#F1F5F9', borderRadius: '8px', padding: '12px 14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Source Study</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                      {originalName}
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#E2E8F0', padding: '3px 8px', borderRadius: '4px', color: '#475569' }}>
                    #{originalId}
                  </span>
                </div>

                {/* Cloned Study Name */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    New Study / Project Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.target_name}
                    onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
                    style={{ fontSize: '13px', padding: '8px 12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  {/* Target Market / Country */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Country / Market
                    </label>
                    <select
                      className="form-control"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      style={{ fontSize: '13px', padding: '8px 12px' }}
                    >
                      <option value="US">United States (US)</option>
                      <option value="IN">India (IN)</option>
                      <option value="GB">United Kingdom (GB)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="FR">France (FR)</option>
                      <option value="CA">Canada (CA)</option>
                      <option value="AU">Australia (AU)</option>
                    </select>
                  </div>

                  {/* Initial Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Initial Status
                    </label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ fontSize: '13px', padding: '8px 12px' }}
                    >
                      <option value="Pause">Pause (Recommended)</option>
                      <option value="Live">Live</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                  {/* CPI */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Cost/CPI ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.10"
                      className="form-control"
                      required
                      value={formData.cost_per_complete}
                      onChange={(e) => setFormData({ ...formData, cost_per_complete: e.target.value })}
                      style={{ fontSize: '13px', padding: '8px 12px' }}
                    />
                  </div>

                  {/* LOI */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      LOI (Mins)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={formData.loi}
                      onChange={(e) => setFormData({ ...formData, loi: e.target.value })}
                      style={{ fontSize: '13px', padding: '8px 12px' }}
                    />
                  </div>

                  {/* IR */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      IR (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-control"
                      value={formData.ir}
                      onChange={(e) => setFormData({ ...formData, ir: e.target.value })}
                      style={{ fontSize: '13px', padding: '8px 12px' }}
                    />
                  </div>
                </div>

                {/* Target Completes */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Target Completes / Max Quota Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.max_limit}
                    onChange={(e) => setFormData({ ...formData, max_limit: e.target.value })}
                    style={{ fontSize: '13px', padding: '8px 12px' }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#F8FAFC' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                  style={{ padding: '8px 16px', fontSize: '12.5px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ padding: '8px 18px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {loading ? (
                    'Cloning Study...'
                  ) : (
                    <>
                      <Copy size={13} /> Clone Project Now
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
