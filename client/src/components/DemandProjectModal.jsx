import React, { useState, useEffect } from 'react';
import { 
  X, Check, Calculator, Send, AlertCircle, CheckCircle2, 
  DollarSign, Clock, Target, Globe, Layers, Sparkles, RefreshCw, Link2, Monitor, Smartphone, Tablet
} from 'lucide-react';
import { createDemandProject, getDemandFeasibility, GoogleSheetAPI, createCustomSurvey, getClients } from '../services/api';
import ModalPortal from './ModalPortal';

export default function DemandProjectModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' | 'zamplia'
  const [availableClients, setAvailableClients] = useState([]);
  const clientsList = availableClients;

  useEffect(() => {
    getClients().then(res => {
      if (Array.isArray(res) && res.length > 0) {
        setAvailableClients(res);
      }
    }).catch(() => {});
  }, []);

  // Tab 1: Client Custom / Market Xcel Survey State (Frame 001 / Admin Video)
  const [customForm, setCustomForm] = useState({
    name: 'German Consumer Retail & E-Commerce Preferences',
    client: 'Zamplia Global',
    clientSurveyUrl: 'https://cluster.marketxcel.co.in/survey/supplier-auth?projectid=59715429818372&supplierid=12833316770&uid=[uid]',
    country: 'United States',
    cpi: 1.00,
    totalRequired: 100,
    loi: 15,
    ir: 40,
    category: 'Consumer Research',
    studyType: 'Consumer',
    devices: 'Desktop,Mobile,Tablet'
  });

  // Tab 2: Zamplia Demand Programmatic API State
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

  // Submit Tab 1: Custom Client / Market Xcel Survey
  const handleSubmitCustom = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const sid = Math.floor(100000 + Math.random() * 900000);
      const newStudy = {
        surveyId: sid,
        SurveyId: sid,
        survey_id: sid,
        name: customForm.name || `Survey #${sid}`,
        survey_name: customForm.name || `Survey #${sid}`,
        cpi: Number(customForm.cpi || 1.00),
        loi: Number(customForm.loi || 15),
        ir: Number(customForm.ir || 40),
        client: customForm.client || 'Zamplia Global',
        clientCode: customForm.client === 'Zamplia Global' ? 'MX_DEMAND' : 'CUSTOM_CLIENT',
        status: 'Live',
        totalRequired: Number(customForm.totalRequired || 100),
        completesNeeded: Number(customForm.totalRequired || 100),
        device: customForm.devices || 'Desktop,Mobile,Tablet',
        languageCode: 'en-US',
        country: customForm.country || 'United States',
        category: customForm.category || 'Consumer Research',
        studyType: customForm.studyType || 'Consumer',
        liveSurveyUrl: customForm.clientSurveyUrl || ''
      };

      createCustomSurvey(newStudy);

      try {
        GoogleSheetAPI.syncToSheet('logActivity', {
          eventType: 'CUSTOM_STUDY_CREATED',
          projectId: sid,
          projectName: newStudy.name,
          client: newStudy.client,
          cpi: newStudy.cpi,
          quota: newStudy.totalRequired
        });
      } catch (e) {}

      setCreatedProject({
        ProjectId: sid,
        ProjectName: newStudy.name,
        Client: newStudy.client,
        CPI: newStudy.cpi,
        TotalCompleteRequired: newStudy.totalRequired,
        LiveSurveyUrl: newStudy.liveSurveyUrl
      });

      if (onSuccess) onSuccess(newStudy);
    } catch (err) {
      setError('Failed to create custom survey project: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Tab 2: Zamplia Programmatic Demand Study
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
      } catch (e) {}
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
          style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: '#F8FAFC',
                  color: '#0F172A',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: '1px solid #CBD5E1'
                }}>
                  {activeTab === 'custom' ? 'Direct Client Link' : 'Zamplia Demand API'}
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Create New Survey Study
                </h2>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                Add a live survey from Market Xcel, Zamplia, or any client with parameters & entry routing.
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 24px', background: '#F8FAFC' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('custom'); setError(null); }}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'custom' ? '2px solid #0F172A' : '2px solid transparent',
                color: activeTab === 'custom' ? '#0F172A' : '#64748B',
                fontWeight: activeTab === 'custom' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Link2 size={14} /> Client Survey Link (Market Xcel / Custom)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('zamplia'); setError(null); }}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'zamplia' ? '2px solid #0F172A' : '2px solid transparent',
                color: activeTab === 'zamplia' ? '#0F172A' : '#64748B',
                fontWeight: activeTab === 'zamplia' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} /> Zamplia Demand Programmatic API
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
                  Survey Successfully Added to Marketplace!
                </h3>
                <p style={{ fontSize: '13px', color: '#15803D', margin: '0 0 16px 0' }}>
                  Project #{createdProject.ProjectId} is now live and ready to be assigned to supply vendors.
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
                    <span style={{ color: '#64748B' }}>Survey ID:</span>
                    <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>#{createdProject.ProjectId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#64748B' }}>Study Name:</span>
                    <strong style={{ color: '#0F172A' }}>{createdProject.ProjectName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#64748B' }}>Client:</span>
                    <strong style={{ color: '#0F172A' }}>{createdProject.Client || 'Zamplia Global'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#64748B' }}>Completes Target:</span>
                    <strong style={{ color: '#0F172A' }}>{createdProject.TotalCompleteRequired} Completes</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#64748B' }}>Agreed Rate (CPI):</span>
                    <strong style={{ color: '#16A34A' }}>${Number(createdProject.CPI || 1.00).toFixed(2)} USD</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#64748B' }}>Client Target URL:</span>
                    <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: '11px', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {createdProject.LiveSurveyUrl || customForm.clientSurveyUrl}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={onClose}
                  >
                    Done & View Surveys
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setCreatedProject(null);
                      setFeasibility(null);
                    }}
                  >
                    Add Another Survey
                  </button>
                </div>
              </div>
            ) : activeTab === 'custom' ? (
              /* TAB 1: Custom Client / Market Xcel Form */
              <form onSubmit={handleSubmitCustom}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Survey / Study Name *
                    </label>
                    <input 
                      type="text"
                      required
                      value={customForm.name}
                      onChange={e => setCustomForm({ ...customForm, name: e.target.value })}
                      placeholder="e.g. German Consumer Retail & E-Commerce Preferences"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Client Source *
                    </label>
                    <select
                      value={customForm.client}
                      onChange={e => {
                        const val = e.target.value;
                        const found = clientsList.find(c => (c.client_name || c.name) === val);
                        setCustomForm({ 
                          ...customForm, 
                          client: val,
                          client_id: found ? found.id : customForm.client_id 
                        });
                      }}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    >
                      {clientsList.length > 0 ? (
                        clientsList.map(c => {
                          const cName = c.client_name || c.name;
                          return <option key={c.id || cName} value={cName}>{cName}</option>;
                        })
                      ) : (
                        <option value="Zamplia Global">Zamplia Global</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Client Live URL */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Client Live Survey Link (Target Destination) *
                  </label>
                  <input 
                    type="url"
                    required
                    value={customForm.clientSurveyUrl}
                    onChange={e => setCustomForm({ ...customForm, clientSurveyUrl: e.target.value })}
                    placeholder="https://cluster.marketxcel.co.in/survey/supplier-auth?projectid=...&uid=[uid]"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12.5px', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    Include <code>[uid]</code>, <code>[#UID#]</code>, or <code>[RESPONDENT_ID]</code> so respondent IDs pass through seamlessly.
                  </div>
                </div>

                {/* Grid: Country, CPI, Completes Needed */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Target Country
                    </label>
                    <select
                      value={customForm.country}
                      onChange={e => setCustomForm({ ...customForm, country: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    >
                      <option value="United States">United States (US)</option>
                      <option value="India">India (IN)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="Canada">Canada (CA)</option>
                      <option value="Germany">Germany (DE)</option>
                      <option value="France">France (FR)</option>
                      <option value="Australia">Australia (AU)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Client Rate (CPI $) *
                    </label>
                    <input 
                      type="number"
                      step="0.05"
                      min="0.10"
                      required
                      value={customForm.cpi}
                      onChange={e => setCustomForm({ ...customForm, cpi: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Completes Required *
                    </label>
                    <input 
                      type="number"
                      step="1"
                      min="1"
                      required
                      value={customForm.totalRequired}
                      onChange={e => setCustomForm({ ...customForm, totalRequired: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                {/* Grid: LOI, IR, Devices, StudyType */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Length of Interview (LOI mins)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      value={customForm.loi}
                      onChange={e => setCustomForm({ ...customForm, loi: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Incidence Rate (IR %)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={customForm.ir}
                      onChange={e => setCustomForm({ ...customForm, ir: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Study Type
                    </label>
                    <select
                      value={customForm.studyType}
                      onChange={e => setCustomForm({ ...customForm, studyType: e.target.value, category: `${e.target.value} Research` })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    >
                      <option value="Consumer">Consumer</option>
                      <option value="B2B">B2B Professional</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Financial">Financial</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
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
                    {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    Create Survey & Add to Marketplace
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: Zamplia Programmatic Form */
              <form onSubmit={handleSubmitProject}>
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
                      <option value={228}>United Kingdom (UK)</option>
                      <option value={80}>Germany (DE)</option>
                      <option value={99}>India (IN)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Survey Language
                    </label>
                    <select
                      value={formData.LanguageId}
                      onChange={e => setFormData({ ...formData, LanguageId: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    >
                      <option value={5}>English (United States)</option>
                      <option value={6}>English (United Kingdom)</option>
                      <option value={9}>German (Deutsch)</option>
                      <option value={12}>French (Français)</option>
                      <option value={18}>Hindi (India)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Interview LOI (Mins)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      required
                      value={formData.LOI}
                      onChange={e => setFormData({ ...formData, LOI: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Incidence Rate (IR %)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={formData.IR}
                      onChange={e => setFormData({ ...formData, IR: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Completes Required
                    </label>
                    <input 
                      type="number"
                      min="1"
                      required
                      value={formData.TotalCompleteRequired}
                      onChange={e => setFormData({ ...formData, TotalCompleteRequired: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Agreed CPI ($ USD)
                    </label>
                    <input 
                      type="number"
                      step="0.10"
                      min="0.50"
                      required
                      value={formData.CPI}
                      onChange={e => setFormData({ ...formData, CPI: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Client Target Survey URL (with Respondent Token) *
                  </label>
                  <input 
                    type="url"
                    required
                    value={formData.SurveyUrl}
                    onChange={e => setFormData({ ...formData, SurveyUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12.5px', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCheckFeasibility}
                    disabled={checkingFeasibility}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <Calculator size={14} />
                    {checkingFeasibility ? 'Calculating...' : 'Calculate Feasibility'}
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={submitting}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                      Launch Zamplia Demand Project
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
