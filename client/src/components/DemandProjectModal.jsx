import React, { useState } from 'react';
import { 
  X, Check, Calculator, Send, AlertCircle, CheckCircle2, 
  DollarSign, Clock, Target, Globe, Layers, Sparkles, RefreshCw 
} from 'lucide-react';
import { createDemandProject, getDemandFeasibility, GoogleSheetAPI } from '../services/api';
import ModalPortal from './ModalPortal';

export default function DemandProjectModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    ProjectName: 'Global Brand Health & Product Preferences 2026',
    StudyType: 'Consumer',
    LOI: 12,
    IR: 80,
    TotalCompleteRequired: 500,
    CPI: 3.50,
    CountryId: 229, // US
    LanguageId: 5,   // en-US
    SurveyUrl: 'https://research-host.com/survey?uid=[%RESPONDENT_ID%]',
    Description: 'Evaluating consumer sentiment and brand recognition across top tier markets.',
  });

  const [feasibility, setFeasibility] = useState(null);
  const [checkingFeasibility, setCheckingFeasibility] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleCheckFeasibility = async () => {
    setCheckingFeasibility(true);
    setError(null);
    try {
      const res = await getDemandFeasibility({
        LOI: formData.LOI,
        IR: formData.IR,
        SampleSize: formData.TotalCompleteRequired,
        CountryId: formData.CountryId,
      });
      setFeasibility(res.data || res);
    } catch (err) {
      setError(err.response?.data?.message || 'Feasibility calculation failed');
    } finally {
      setCheckingFeasibility(false);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await createDemandProject(formData);
      const project = res.data || res;
      setCreatedProject(project);
      try {
        GoogleSheetAPI.syncToSheet('logActivity', {
          eventType: 'DEMAND_STUDY_CREATED',
          projectId: project.ProjectId || project.surveyId,
          projectName: formData.ProjectName,
          cpi: formData.CPI,
          loi: formData.LOI,
          ir: formData.IR,
          completes: formData.TotalCompleteRequired
        });
      } catch (e) {
        console.warn('Google Sheet log warning:', e);
      }
      if (onSuccess) onSuccess(project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create demand project on Zamplia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content" 
          onClick={e => e.stopPropagation()} 
          style={{ maxWidth: '760px', maxHeight: '88vh' }}
        >
          {/* Header */}
          <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#EFF6FF',
                color: '#2563EB',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: '1px solid #BFDBFE'
              }}>
                Zamplia Demand API V2
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Create New Research Study (Sample Buyer)
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
              Launch a project directly onto the Zamplia marketplace, calculate feasibility, and source global sample.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#991B1B',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {createdProject ? (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={44} color="#16A34A" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', margin: '0 0 6px 0' }}>
                Project Successfully Launched on Zamplia!
              </h3>
              <p style={{ fontSize: '13px', color: '#15803D', margin: '0 0 16px 0' }}>
                Study is live and available for provider traffic matching and allocation.
              </p>

              <div style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px',
                border: '1px solid #BBF7D0',
                textAlign: 'left',
                fontSize: '12.5px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#64748B' }}>Zamplia Project ID:</span>
                  <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>#{createdProject.ProjectId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#64748B' }}>Study Name:</span>
                  <strong style={{ color: '#0F172A' }}>{createdProject.ProjectName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#64748B' }}>Completes Target:</span>
                  <strong style={{ color: '#0F172A' }}>{createdProject.TotalCompleteRequired} Completes</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#64748B' }}>Agreed CPI:</span>
                  <strong style={{ color: '#16A34A' }}>${createdProject.CPI?.toFixed(2)} USD</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#64748B' }}>Live Routing URL:</span>
                  <span style={{ color: '#2563EB', fontFamily: 'monospace', fontSize: '11px', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {createdProject.LiveSurveyUrl || formData.SurveyUrl}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={onClose}
                >
                  Done & Close
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setCreatedProject(null);
                    setFeasibility(null);
                  }}
                >
                  Create Another Study
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitProject}>
              {/* Basic Fields */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Project / Study Name *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.ProjectName}
                  onChange={e => setFormData({ ...formData, ProjectName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1'
                  }}
                />
              </div>

              {/* Grid: StudyType, Country, Language */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Study Type
                  </label>
                  <select
                    value={formData.StudyType}
                    onChange={e => setFormData({ ...formData, StudyType: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                  >
                    <option value="Consumer">Consumer / Gen-Pop</option>
                    <option value="B2B">B2B Professional</option>
                    <option value="Healthcare">Healthcare (HCP)</option>
                    <option value="Concept">Product Concept</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Target Country
                  </label>
                  <select
                    value={formData.CountryId}
                    onChange={e => setFormData({ ...formData, CountryId: Number(e.target.value) })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                  >
                    <option value={229}>United States (US)</option>
                    <option value={38}>Canada (CA)</option>
                    <option value={228}>United Kingdom (GB)</option>
                    <option value={80}>Germany (DE)</option>
                    <option value={99}>India (IN)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Language
                  </label>
                  <select
                    value={formData.LanguageId}
                    onChange={e => setFormData({ ...formData, LanguageId: Number(e.target.value) })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                  >
                    <option value={5}>English (US)</option>
                    <option value={6}>English (UK)</option>
                    <option value={9}>German (de-DE)</option>
                    <option value={12}>French (fr-FR)</option>
                    <option value={18}>Hindi (hi-IN)</option>
                  </select>
                </div>
              </div>

              {/* Research Metrics: LOI, IR, Sample Size, CPI */}
              <div style={{
                background: '#F8FAFC',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Targeting Specifications & Fielding Metrics
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      Length of Interview (LOI)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number"
                        min="1"
                        max="60"
                        value={formData.LOI}
                        onChange={e => setFormData({ ...formData, LOI: Number(e.target.value) })}
                        style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '7px', fontSize: '11px', color: '#94A3B8' }}>mins</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      Incidence Rate (IR)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number"
                        min="5"
                        max="100"
                        value={formData.IR}
                        onChange={e => setFormData({ ...formData, IR: Number(e.target.value) })}
                        style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '7px', fontSize: '11px', color: '#94A3B8' }}>%</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      Completes Required
                    </label>
                    <input 
                      type="number"
                      min="10"
                      max="10000"
                      value={formData.TotalCompleteRequired}
                      onChange={e => setFormData({ ...formData, TotalCompleteRequired: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      Max CPI (Bid)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '8px', top: '7px', fontSize: '12px', color: '#94A3B8' }}>$</span>
                      <input 
                        type="number"
                        step="0.05"
                        min="0.5"
                        value={formData.CPI}
                        onChange={e => setFormData({ ...formData, CPI: Number(e.target.value) })}
                        style={{ width: '100%', padding: '7px 10px 7px 22px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Feasibility Check Trigger */}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCheckFeasibility}
                    disabled={checkingFeasibility}
                    style={{
                      border: '1px solid #BFDBFE',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '5px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Calculator size={13} className={checkingFeasibility ? 'spinner' : ''} />
                    {checkingFeasibility ? 'Checking Marketplace...' : 'Check Feasibility & CPI Guidance (getFeasibility API)'}
                  </button>
                </div>

                {/* Feasibility Result Box */}
                {feasibility && (
                  <div style={{
                    marginTop: '12px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                        ZAMPLIA MARKETPLACE FEASIBILITY:
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#15803D' }}>
                        {feasibility.FeasibilityScore || 'High (94%)'} • Est. Days to Field: {feasibility.EstimatedDaysToComplete || 2} Days
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', textAlign: 'right' }}>
                      <div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>Rec. CPI</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                          ${feasibility.EstimatedCPI || feasibility.RecommendedCPI || 3.35} USD
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>Marketplace Pool</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>
                          {feasibility.AvailableMarketplaceAudience?.toLocaleString() || '145,000'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Survey Client URL */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Survey Target URL (with [%RESPONDENT_ID%]) *
                </label>
                <input 
                  type="url"
                  required
                  value={formData.SurveyUrl}
                  onChange={e => setFormData({ ...formData, SurveyUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    fontFamily: 'monospace',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  {submitting ? <RefreshCw size={14} className="spinner" /> : <Send size={14} />}
                  {submitting ? 'Creating Project...' : 'Launch Demand Study on Zamplia (createProject API)'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  </ModalPortal>
);
}
