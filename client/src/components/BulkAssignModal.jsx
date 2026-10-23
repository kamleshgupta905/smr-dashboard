import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Copy, Share2, DollarSign, Target, CheckCheck, 
  ExternalLink, Download, AlertCircle, Sparkles, Building2, Layers
} from 'lucide-react';
import ModalPortal from './ModalPortal';
import { getVendors, bulkAssignSurveys } from '../services/api';
import { exportToExcel } from '../utils/excelExport';

export default function BulkAssignModal({ selectedSurveys = [], isOpen, onClose, onSuccess }) {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [cpiMode, setCpiMode] = useState('rev_share'); // 'rev_share' | 'custom_cpi' | 'default'
  const [customRevShare, setCustomRevShare] = useState(30);
  const [customFlatCpi, setCustomFlatCpi] = useState(1.50);
  const [quotaLimit, setQuotaLimit] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [copiedLinkMap, setCopiedLinkMap] = useState({});
  const [vendorSearch, setVendorSearch] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setBulkResult(null);
      return;
    }
    setLoadingVendors(true);
    getVendors({ limit: 'all' })
      .then(res => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        setVendors(list);
        if (list.length > 0) {
          const firstVid = list[0].vendor_code || list[0].vendor_id || list[0]._id;
          setSelectedVendorId(firstVid);
          const p = Number(list[0].cpi_percentage) || 70;
          setCustomRevShare(p);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingVendors(false));
  }, [isOpen]);

  const activeVendor = useMemo(() => {
    return vendors.find(v => (v.vendor_code === selectedVendorId || v.vendor_id === selectedVendorId || v._id === selectedVendorId)) || vendors[0];
  }, [vendors, selectedVendorId]);

  const filteredVendors = useMemo(() => {
    if (!vendorSearch.trim()) return vendors;
    const term = vendorSearch.toLowerCase().trim();
    return vendors.filter(v => 
      (v.name || '').toLowerCase().includes(term) ||
      (v.vendor_id || '').toLowerCase().includes(term) ||
      (v.email || '').toLowerCase().includes(term)
    );
  }, [vendors, vendorSearch]);

  const handleVendorSelect = (vid) => {
    setSelectedVendorId(vid);
    const found = vendors.find(v => (v.vendor_code === vid || v.vendor_id === vid || v._id === vid));
    if (found) {
      const p = Number(found.cpi_percentage) || 70;
      setCustomRevShare(p);
    }
  };

  const handleCopyLink = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkMap(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedLinkMap(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleCopyAllLinks = () => {
    if (!bulkResult?.data?.length) return;
    const text = bulkResult.data.map(item => `${item.project_name} (${item.project_id}):\n${item.entry_link}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedLinkMap(prev => ({ ...prev, all: true }));
    setTimeout(() => {
      setCopiedLinkMap(prev => ({ ...prev, all: false }));
    }, 2500);
  };

  const handleExportBatchExcel = () => {
    if (!bulkResult?.data?.length) return;
    const rows = bulkResult.data.map(item => ({
      'Vendor Name': activeVendor?.name || 'Supplier',
      'Vendor ID': activeVendor?.vendor_id || selectedVendorId,
      'Study PID': item.project_id,
      'Study Name': item.project_name,
      'Client CPI ($)': Number(item.client_cpi).toFixed(2),
      'Vendor Agreed CPI ($)': Number(item.vendor_cpi).toFixed(2),
      'Target Quota': item.quota_limit > 0 ? item.quota_limit : 'Open / Unlimited',
      'Inbound Entry Link': item.entry_link
    }));
    exportToExcel(rows, `Bulk_Allotment_${activeVendor?.name || selectedVendorId}_${selectedSurveys.length}_Studies`, 'Batch Allotments');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVendorId || !selectedSurveys.length) return;
    setSubmitting(true);
    try {
      const surveyIds = selectedSurveys.map(s => s.survey_id || s.SurveyId || s.surveyId || s.id || s.project_id || s._id);
      const payload = {
        vendor_id: selectedVendorId,
        survey_ids: surveyIds,
        cpi_mode: cpiMode,
        cpi_value: cpiMode === 'custom_cpi' ? customFlatCpi : customRevShare,
        quota_limit: Number(quotaLimit) || 0
      };

      const res = await bulkAssignSurveys(payload);
      if (res?.success) {
        setBulkResult(res);
        if (onSuccess) onSuccess(res);
      }
    } catch (err) {
      console.error('Bulk allotment error:', err);
      alert('Bulk assignment error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div 
        onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px',
          overflowY: 'auto'
        }}
      >
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          margin: 'auto'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 22px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(46, 48, 148, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2e3094'
              }}>
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Bulk Survey Assignment</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: '#e0e7ff',
                    color: '#2e3094'
                  }}>
                    {selectedSurveys.length} Studies Selected
                  </span>
                </h3>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Assign multiple live surveys to a supply partner in 1-click with synchronized MySQL records.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
            {!bulkResult ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. Target Vendor Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    1. Select Target Supply Partner (Vendor)
                  </label>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="text"
                        placeholder="Search 910 live vendors by name or ID..."
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <select
                    value={selectedVendorId}
                    onChange={(e) => handleVendorSelect(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff'
                    }}
                    required
                  >
                    {filteredVendors.map(v => (
                      <option key={v.vendor_id || v.vendor_code || v._id} value={v.vendor_code || v.vendor_id || v._id}>
                        {v.name} ({v.vendor_id}) &bull; {v.cpi_percentage || 30}% RevShare &bull; {v.email || 'No email'}
                      </option>
                    ))}
                  </select>

                  {activeVendor && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11.5px',
                      color: '#475569'
                    }}>
                      <div>
                        Selected: <strong>{activeVendor.name}</strong> ({activeVendor.vendor_id}) &bull; Email: {activeVendor.email}
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#E2E8F0',
                        color: '#1d4ed8',
                        fontWeight: 700
                      }}>
                        Current Baseline: {activeVendor.cpi_percentage || 30}% RevShare
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. CPI / Revenue Share Pricing Mode */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    2. Payout Rate Calculation Mode
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${cpiMode === 'rev_share' ? '#2e3094' : '#e2e8f0'}`,
                      background: cpiMode === 'rev_share' ? '#f5f6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="cpiMode" 
                        checked={cpiMode === 'rev_share'} 
                        onChange={() => setCpiMode('rev_share')} 
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                          Percentage Revenue Share (%)
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Calculates each study's vendor payout as a % of its Client CPI.
                        </div>
                        {cpiMode === 'rev_share' && (
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input 
                              type="number"
                              min="10"
                              max="95"
                              value={customRevShare}
                              onChange={(e) => setCustomRevShare(e.target.value)}
                              style={{ width: '70px', padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>% RevShare</span>
                          </div>
                        )}
                      </div>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${cpiMode === 'custom_cpi' ? '#2e3094' : '#e2e8f0'}`,
                      background: cpiMode === 'custom_cpi' ? '#f5f6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="cpiMode" 
                        checked={cpiMode === 'custom_cpi'} 
                        onChange={() => setCpiMode('custom_cpi')} 
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                          Uniform Flat CPI ($)
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Applies the exact same fixed dollar CPI to all {selectedSurveys.length} studies.
                        </div>
                        {cpiMode === 'custom_cpi' && (
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>$</span>
                            <input 
                              type="number"
                              step="0.05"
                              min="0.10"
                              max="50"
                              value={customFlatCpi}
                              onChange={(e) => setCustomFlatCpi(e.target.value)}
                              style={{ width: '80px', padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>per complete</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. Target Completes Quota */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    3. Target Quota Limit Per Study
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number"
                      min="0"
                      max="10000"
                      value={quotaLimit}
                      onChange={(e) => setQuotaLimit(e.target.value)}
                      style={{
                        width: '120px',
                        padding: '7px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '12.5px'
                      }}
                    />
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      completes per study (Enter <strong>0</strong> for open capacity / unlimited delivery)
                    </span>
                  </div>
                </div>

                {/* 4. Selected Studies Review Table */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      4. Review Selected Studies ({selectedSurveys.length})
                    </label>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      All {selectedSurveys.length} studies will be allocated to {activeVendor?.name} in MySQL.
                    </span>
                  </div>

                  <div style={{
                    maxHeight: '190px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr>
                          <th style={{ padding: '6px 10px', color: '#475569' }}>#</th>
                          <th style={{ padding: '6px 10px', color: '#475569' }}>PID</th>
                          <th style={{ padding: '6px 10px', color: '#475569' }}>Study Name</th>
                          <th style={{ padding: '6px 10px', color: '#475569' }}>Client</th>
                          <th style={{ padding: '6px 10px', color: '#475569', textAlign: 'right' }}>Client CPI</th>
                          <th style={{ padding: '6px 10px', color: '#475569', textAlign: 'right' }}>Vendor Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSurveys.map((s, idx) => {
                          const sid = s.survey_id || s.SurveyId || s.surveyId || s.id || s.project_id || s._id;
                          const name = s.survey_name || s.Name || s.name || `Study #${sid}`;
                          const client = s.client || s.client_name || 'Marketplace';
                          const clientCpi = Number(s.cpi || s.CPI || s.cost_per_complete || 1.00);
                          const vendorCpi = cpiMode === 'custom_cpi'
                            ? Number(customFlatCpi)
                            : Number(((clientCpi * Number(customRevShare || 30)) / 100).toFixed(2));

                          return (
                            <tr key={sid || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '5px 10px', color: '#64748b' }}>{idx + 1}</td>
                              <td style={{ padding: '5px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{sid}</td>
                              <td style={{ padding: '5px 10px', fontWeight: 600, color: '#334155', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {name}
                              </td>
                              <td style={{ padding: '5px 10px', color: '#64748b' }}>{client}</td>
                              <td style={{ padding: '5px 10px', textAlign: 'right', color: '#64748b' }}>${clientCpi.toFixed(2)}</td>
                              <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 800, color: '#028745' }}>${vendorCpi.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '12.5px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedSurveys.length}
                    style={{
                      background: 'linear-gradient(135deg, #2e3094 0%, #1e2060 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 20px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px'
                    }}
                  >
                    {submitting ? (
                      <span>Assigning {selectedSurveys.length} Studies to MySQL...</span>
                    ) : (
                      <>
                        <Share2 size={13} />
                        <span>Assign {selectedSurveys.length} Studies to {activeVendor?.name || 'Vendor'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Results Screen */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '8px',
                  background: 'rgba(2, 135, 69, 0.08)',
                  border: '1px solid rgba(2, 135, 69, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#028745',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#028745' }}>
                        Bulk Allotment Completed Successfully!
                      </h4>
                      <div style={{ fontSize: '12px', color: '#1e293b', marginTop: '2px' }}>
                        All <strong>{bulkResult.count}</strong> studies have been allotted to <strong>{bulkResult.vendor_name} ({bulkResult.vendor_id})</strong> and registered in MySQL.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleCopyAllLinks}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', padding: '6px 12px' }}
                    >
                      {copiedLinkMap.all ? <CheckCheck size={13} color="#028745" /> : <Copy size={13} />}
                      <span>{copiedLinkMap.all ? 'All Copied!' : 'Copy All Links'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportBatchExcel}
                      style={{
                        background: '#028745',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Download size={13} />
                      <span>Export Batch Excel</span>
                    </button>
                  </div>
                </div>

                {/* Table of Generated Links */}
                <div style={{
                  maxHeight: '380px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 2 }}>
                      <tr>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Study PID</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Study Name</th>
                        <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'right' }}>Agreed CPI</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Generated Inbound Link</th>
                        <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(bulkResult.data || []).map((item, idx) => {
                        const isCopied = copiedLinkMap[item.assignment_id || item.project_id];
                        return (
                          <tr key={item.assignment_id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                              {item.project_id}
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: 600, color: '#334155' }}>
                              {item.project_name}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#028745' }}>
                              ${Number(item.vendor_cpi).toFixed(2)}
                            </td>
                            <td style={{ padding: '8px 12px', maxWidth: '300px' }}>
                              <div style={{
                                fontFamily: 'monospace',
                                fontSize: '10.5px',
                                color: '#475569',
                                background: '#f8fafc',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {item.entry_link}
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(item.entry_link, item.assignment_id || item.project_id)}
                                style={{
                                  background: isCopied ? '#dcfce7' : '#f1f5f9',
                                  color: isCopied ? '#16a34a' : '#334155',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {isCopied ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      background: '#2e3094',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 24px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
