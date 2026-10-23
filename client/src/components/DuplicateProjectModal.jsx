import React, { useState, useEffect } from 'react';
import { Copy, X, CheckCircle2, AlertCircle, ArrowRight, Layers, Sparkles, Share2, Check } from 'lucide-react';
import ModalPortal from './ModalPortal';
import { duplicateProject, getVendors } from '../services/api';

export default function DuplicateProjectModal({ isOpen, project, onClose, onSuccess }) {
  if (!isOpen || !project) return null;

  const originalId = project.id || project._id || project.survey_id || project.project_id || 'PROJ';
  const rawOriginalName = project.name || project.survey_name || project.project_name || `Study #${originalId}`;
  // VMH White-labeling: strip any Zamplia / Market Xcel references from cloned study names
  const originalName = String(rawOriginalName).replace(/Zamplia\s*Global|Zamplia|Market\s*Xcel|MarketXcel/gi, 'VMH Research');
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
    status: 'Live',
    auto_pause_clicks: 50,
    vendor_id: '',
    rev_share_percent: 30,
    description: `Duplicated from #${originalId} [${originalName}]`
  });
  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    if (project) {
      setFormData({
        target_name: `${originalName} (Clone)`,
        country: project.country || 'US',
        cost_per_complete: originalCpi,
        loi: originalLoi,
        ir: originalIr,
        max_limit: originalLimit,
        status: 'Live',
        auto_pause_clicks: 50,
        vendor_id: '',
        rev_share_percent: 30,
        description: `Duplicated from #${originalId} [${originalName}]`
      });
      setSuccessResult(null);
      setError('');
    }
  }, [project, originalId, originalName, originalCpi, originalLoi, originalIr, originalLimit]);

  useEffect(() => {
    getVendors().then(res => {
      const v = res?.data || res || [];
      if (Array.isArray(v)) setVendorList(v);
    }).catch(() => {});
  }, []);

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
        auto_pause_clicks: parseInt(formData.auto_pause_clicks || 50, 10),
        vendor_id: formData.vendor_id || '',
        rev_share_percent: parseFloat(formData.rev_share_percent || 30),
        status: formData.status,
        description: formData.description
      });

      if (res.success && res.project) {
        setSuccessResult(res.project);
      } else {
        throw new Error(res.message || 'Failed to clone study');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error occurred while duplicating study.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSuccess = () => {
    if (successResult && onSuccess) {
      onSuccess(successResult);
    }
    onClose();
  };

  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content" 
          style={{ 
            maxWidth: '640px', 
            width: '94%', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', 
            border: '1px solid #E2E8F0', 
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ borderBottom: '1px solid #F1F5F9', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                <Copy size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  1-Click Project Cloner
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                  Duplicate study parameters, quotas, and generate unique project ID
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748B', borderRadius: '8px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Success Result View */}
          {successResult ? (
            <div style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #A7F3D0' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Project Duplicated Successfully!
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748B' }}>
                New unique Study ID <strong>{successResult.project_id || successResult.id}</strong> has been registered in the database.
              </p>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '22px' }}>
                <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>
                  <strong style={{ color: '#0F172A' }}>Study Name:</strong> {successResult.project_name || successResult.name}
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>
                  <strong style={{ color: '#0F172A' }}>New Project ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>{successResult.project_id}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>
                  <strong style={{ color: '#0F172A' }}>CPI:</strong> <span style={{ color: '#16A34A', fontWeight: 700 }}>${parseFloat(successResult.cpi || successResult.cost_per_complete).toFixed(2)}</span> | <strong style={{ color: '#0F172A' }}>LOI:</strong> {successResult.loi}m | <strong style={{ color: '#0F172A' }}>IR:</strong> {successResult.ir}%
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569' }}>
                  <strong style={{ color: '#0F172A' }}>Status:</strong> <span style={{ color: successResult.status === 'Live' ? '#10B981' : '#F59E0B', fontWeight: 700 }}>{successResult.status}</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleFinishSuccess}
                style={{ width: '100%', padding: '11px', fontWeight: 700, background: '#0F172A', color: '#FFFFFF', border: '1px solid #0F172A', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', boxShadow: '0 1px 2px rgba(15,23,42,0.1)' }}
              >
                Done & View in Marketplace
              </button>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
                {error && (
                  <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Source Project Summary Pill */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Source Study</span>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                      {originalName}
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#0F172A', color: '#FFFFFF', padding: '3px 10px', borderRadius: '999px' }}>
                    #{originalId}
                  </span>
                </div>

                {/* Cloned Study Name */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '5px' }}>
                    New Study / Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.target_name}
                    onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
                    style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  {/* Target Market / Country */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '5px' }}>
                      Country / Market
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', background: '#FFFFFF' }}
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '5px' }}>
                      Initial Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box', background: '#FFFFFF' }}
                    >
                      <option value="Pause">Pause (Recommended)</option>
                      <option value="Live">Live</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                  {/* CPI */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '5px' }}>
                      Cost/CPI ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.10"
                      required
                      value={formData.cost_per_complete}
                      onChange={(e) => setFormData({ ...formData, cost_per_complete: e.target.value })}
                      style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* LOI */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '5px' }}>
                      LOI (Mins)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.loi}
                      onChange={(e) => setFormData({ ...formData, loi: e.target.value })}
                      style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* IR */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '5px' }}>
                      IR (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.ir}
                      onChange={(e) => setFormData({ ...formData, ir: e.target.value })}
                      style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Target Completes & Auto-Pause Quality Guard */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '5px' }}>
                      Target Completes / Quota
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_limit}
                      onChange={(e) => setFormData({ ...formData, max_limit: e.target.value })}
                      style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '5px' }}>
                      Auto-Pause Guard (Clicks)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="500"
                      value={formData.auto_pause_clicks || 50}
                      onChange={(e) => setFormData({ ...formData, auto_pause_clicks: e.target.value })}
                      style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                      title="Study automatically pauses if this many clicks arrive with 0 completes"
                    />
                    <small style={{ fontSize: '10.5px', color: '#64748B' }}>Pauses if X clicks with 0 completes</small>
                  </div>
                </div>

                {/* Direct Allotment to Supply Vendor */}
                <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Share2 size={14} color="#0F172A" />
                    <span>Direct Allotment to Vendor (Optional)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                    <div>
                      <select
                        value={formData.vendor_id}
                        onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                        style={{ width: '100%', fontSize: '12.5px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', boxSizing: 'border-box' }}
                      >
                        <option value="">-- No Direct Vendor (Inventory Only) --</option>
                        {vendorList.map(v => (
                          <option key={v.id || v.vendor_id || v.vendor_code} value={v.vendor_id || v.vendor_code || v.id}>
                            {v.vendor_name || v.name || v.vendor_id} ({v.vendor_id || v.vendor_code})
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.vendor_id && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="10"
                          max="100"
                          value={formData.rev_share_percent}
                          onChange={(e) => setFormData({ ...formData, rev_share_percent: e.target.value })}
                          style={{ width: '70px', fontSize: '12.5px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>% Rate</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 22px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#FFFFFF' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{ padding: '8px 16px', fontSize: '12.5px', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', background: '#0F172A', color: '#FFFFFF', border: '1px solid #0F172A', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 1px 2px rgba(15,23,42,0.1)' }}
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
