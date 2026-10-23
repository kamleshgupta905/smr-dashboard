import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Link2, Copy, Check, Share2, Play, ShieldAlert, CheckCircle2, 
  AlertTriangle, Info, ExternalLink, ShieldCheck, DollarSign, Target, 
  Trash2, FileText, CheckCheck, RefreshCw, Zap, Download, MessageSquare, ChevronDown
} from 'lucide-react';
import { 
  getVendors, 
  RouterAPI, 
  getVendorAllotments, 
  saveVendorAllotment, 
  deleteVendorAllotment,
  searchVendors,
  sendVendorAssignmentEmail
} from '../services/api';
import { exportToExcel } from '../utils/excelExport';
import ModalPortal from './ModalPortal';
import VendorIntegrationDocModal from './VendorIntegrationDocModal';

export default function AssignVendorModal({ survey, surveyId, onClose, onOpenPreScreener }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [vendorPercent, setVendorPercent] = useState(30);
  const [vendorCpi, setVendorCpi] = useState(1.50);
  const [quotaLimit, setQuotaLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [savingAllotment, setSavingAllotment] = useState(false);
  const [allottingAll, setAllottingAll] = useState(false);
  const [allotSuccess, setAllotSuccess] = useState(false);
  const [liveLink, setLiveLink] = useState('');
  const [testLink, setTestLink] = useState('');
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedTest, setCopiedTest] = useState(false);
  const [copiedAllotId, setCopiedAllotId] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [allotments, setAllotments] = useState([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [searchingVendors, setSearchingVendors] = useState(false);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const vendorDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target)) {
        setVendorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulator State
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [copiedCallbackKey, setCopiedCallbackKey] = useState(null);

  const resolvedSurvey = (survey && typeof survey === 'object') ? survey : (surveyId && typeof surveyId === 'object' ? surveyId : null);
  const currentId = resolvedSurvey?.survey_id || resolvedSurvey?.SurveyId || resolvedSurvey?.surveyId || resolvedSurvey?.id || resolvedSurvey?._id || resolvedSurvey?.project_id || (typeof surveyId !== 'object' ? surveyId : '2042481293') || '2042481293';
  const rawOriginalName = resolvedSurvey?.survey_name || resolvedSurvey?.Name || resolvedSurvey?.name || `Study #${currentId}`;
  // White-label: Vendors must NEVER see 3rd party demand names (Zamplia / Market Xcel)
  const sanitizedName = String(rawOriginalName).replace(/Zamplia\s*Global|Zamplia|Market\s*Xcel|MarketXcel/gi, 'VMH Research');
  const currentName = sanitizedName.startsWith('VMH') ? sanitizedName : `VMH Research Study #${currentId}`;
  const currentCpi = resolvedSurvey?.cpi || resolvedSurvey?.CPI || resolvedSurvey?.cost_per_interview || 2.70;
  const currentLoi = resolvedSurvey?.loi || resolvedSurvey?.LOI || resolvedSurvey?.length_of_interview || 10;
  const currentIr = resolvedSurvey?.ir || resolvedSurvey?.IR || resolvedSurvey?.incidence_rate || 80;
  const currentClient = "VMH GROUP'S";

  // Rate dual-synchronization handlers
  const handlePercentChange = (val) => {
    const clean = val.replace(/[^0-9.]/g, '');
    setVendorPercent(clean);
    const p = parseFloat(clean);
    if (!isNaN(p) && Number(currentCpi) > 0) {
      setVendorCpi(Number(((Number(currentCpi) * p) / 100).toFixed(2)));
    }
  };

  const handleCpiChange = (val) => {
    const clean = val.replace(/[^0-9.]/g, '');
    setVendorCpi(clean);
    const c = parseFloat(clean);
    if (!isNaN(c) && Number(currentCpi) > 0) {
      setVendorPercent(Number(((c / Number(currentCpi)) * 100).toFixed(1)));
    }
  };

  // Multi-vendor selection handlers
  const toggleVendorSelection = (code) => {
    setSelectedVendorIds(prev => {
      const exists = prev.includes(code);
      const updated = exists ? prev.filter(c => c !== code) : [...prev, code];
      if (updated.length > 0 && (!selectedVendor || !updated.includes(selectedVendor))) {
        setSelectedVendor(updated[0]);
      }
      return updated;
    });
  };

  const handleSelectAllFiltered = (filteredList) => {
    const codes = filteredList.map(v => v.vendor_code || v.vendor_id || v.vendorUid || v._id || v.id).filter(Boolean);
    setSelectedVendorIds(Array.from(new Set([...selectedVendorIds, ...codes])));
  };

  const handleClearSelection = () => {
    setSelectedVendorIds([]);
  };

  // Load vendors list from persistent storage
  useEffect(() => {
    getVendors()
      .then((res) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          setVendors(list);
          const firstCode = list[0].vendor_code || list[0].vendorUid || list[0]._id;
          if (firstCode) {
            setSelectedVendor(firstCode);
            setSelectedVendorIds([firstCode]);
            const p = 30; // standard 30%
            setVendorPercent(p);
            const initCpi = Number(((Number(currentCpi) * p) / 100).toFixed(2));
            setVendorCpi(initCpi);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load vendors:', err);
      });
  }, [currentCpi]);

  // Live search across 2,137 database vendors
  useEffect(() => {
    if (!vendorSearch || vendorSearch.trim().length < 2) return;
    const timer = setTimeout(async () => {
      setSearchingVendors(true);
      try {
        const found = await searchVendors(vendorSearch.trim());
        if (Array.isArray(found) && found.length > 0) {
          setVendors(prev => {
            const map = new Map();
            found.forEach(v => map.set(v.vendor_code || v.vendor_id || v.id, v));
            prev.forEach(v => {
              const k = v.vendor_code || v.vendorUid || v._id || v.id;
              if (!map.has(k)) map.set(k, v);
            });
            return Array.from(map.values());
          });
          const first = found[0];
          const k = first.vendor_code || first.vendor_id || first.id;
          if (k) setSelectedVendor(k);
        }
      } catch (err) {
        console.warn('Vendor search error:', err);
      } finally {
        setSearchingVendors(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [vendorSearch]);

  // Fetch existing allotments for this study
  const loadAllotments = async () => {
    try {
      const res = await getVendorAllotments(currentId);
      if (res?.data && Array.isArray(res.data)) {
        setAllotments(res.data);
      }
    } catch (e) {
      console.warn('Could not load allotments:', e);
    }
  };

  useEffect(() => {
    loadAllotments();
  }, [currentId]);

  // Update default CPI when selected vendor changes (respect user-entered values)
  useEffect(() => {
    const vObj = vendors.find(v => (v.vendor_code === selectedVendor || v.vendorUid === selectedVendor || v._id === selectedVendor));
    if (vObj) {
      if (vObj.commission_type === 'flat_rate' && vObj.cpi !== undefined && vObj.cpi !== '') {
        setVendorCpi(Number(vObj.cpi));
      } else if (vObj.cpi_percentage) {
        const p = Number(vObj.cpi_percentage);
        const calculated = ((Number(currentCpi) * p) / 100).toFixed(2);
        setVendorCpi(Number(calculated));
      }
    }
  }, [selectedVendor, vendors, currentCpi]);

  // 1-Click Open Live End Page in New Tab
  const openEndPageTab = (statusNum) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smr.vmhgroupsmr.com';
    const statusMap = { 1: '10', 2: '20', 3: '30', 4: '40', 10: '10', 20: '20', 30: '30', 40: '40' };
    const code = statusMap[statusNum] || '10';
    const testUid = `TEST_${selectedVendor}_${Date.now().toString().slice(-4)}`;
    const url = `${origin}/survey/callback?status=${code}&vid=${selectedVendor}&pid=${currentId}&hash=[HASH]&uid=${testUid}`;
    window.open(url, '_blank');
  };

  // 1-Click Allot All Active Supply Panels
  const handleAllotAllVendors = async () => {
    if (!vendors || vendors.length === 0) return;
    setAllottingAll(true);
    const host = window.location.origin.replace(':3000', ':5000');
    try {
      for (const vObj of vendors) {
        const v = vObj.vendor_code || vObj.vendorUid || vObj._id;
        if (!v) continue;
        const p = Number(vObj.cpi_percentage) || 0;
        const vCpi = p > 0 ? Number(((Number(currentCpi) * p) / 100).toFixed(2)) : (Number(vObj.cpi) || 0);
        const live = `${host}/vendor/auth/${v}/project/${currentId}?uid=[RESPONDENT_ID]`;
        await saveVendorAllotment({
          project_id: String(currentId),
          vendor_id: v,
          vendor_name: vObj.name || v,
          vendor_cpi: vCpi,
          quota_limit: parseInt(quotaLimit, 10) || 100,
          entry_link: live,
          status: 'active'
        });
      }
      setAllotSuccess(true);
      await loadAllotments();
      setTimeout(() => setAllotSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to allot all vendors:', err);
    } finally {
      setAllottingAll(false);
    }
  };

  // Auto-generate live and test links immediately on mount and vendor change
  useEffect(() => {
    const v = selectedVendor || 'VND-DYN-01';
    const id = currentId || '2042481293';
    const host = window.location.origin.replace(':3000', ':5000');
    setLiveLink(`${host}/vendor/auth/${v}/project/${id}?uid=[RESPONDENT_ID]`);
    setTestLink(`${host}/vendor/auth/${v}/project/${id}?uid=TEST_${v}_VERIFY`);
  }, [selectedVendor, currentId]);

  // Handle Save Allotment & Generate Link (Batch / Multi-Vendor Allotment Enabled)
  const handleSaveAndGenerate = async (e) => {
    if (e) e.preventDefault();
    const targetCodes = selectedVendorIds.length > 0 ? selectedVendorIds : (selectedVendor ? [selectedVendor] : []);
    if (targetCodes.length === 0) {
      alert('Please select at least one vendor panel to allot.');
      return;
    }

    setSavingAllotment(true);
    setAllotSuccess(false);

    const host = window.location.origin.replace(':3000', ':5000');
    const primaryVendor = targetCodes[0];
    const generatedLive = `${host}/vendor/auth/${primaryVendor}/project/${currentId}?uid=[RESPONDENT_ID]`;
    const generatedTest = `${host}/vendor/auth/${primaryVendor}/project/${currentId}?uid=TEST_${primaryVendor}_VERIFY`;

    setLiveLink(generatedLive);
    setTestLink(generatedTest);

    try {
      for (const v of targetCodes) {
        const vObj = vendors.find(vend => (vend.vendor_code === v || vend.vendor_id === v || vend.vendorUid === v || vend._id === v || vend.id === v));
        const vLive = `${host}/vendor/auth/${v}/project/${currentId}?uid=[RESPONDENT_ID]`;
        const allotmentPayload = {
          project_id: String(currentId),
          vendor_id: v,
          vendor_name: vObj?.name || v,
          vendor_cpi: Number(vendorCpi) || 1.50,
          quota_limit: parseInt(quotaLimit, 10) || 100,
          entry_link: vLive,
          status: 'active'
        };

        await saveVendorAllotment(allotmentPayload);
        try {
          await sendVendorAssignmentEmail({
            vendor_id: v,
            project_id: String(currentId),
            cpi: Number(vendorCpi) || 1.50,
            entry_link: vLive
          });
        } catch (me) {}
      }

      setAllotSuccess(true);
      await loadAllotments();
      setTimeout(() => setAllotSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save allotments:', err);
    } finally {
      setSavingAllotment(false);
    }
  };

  const handleDeleteAllotment = async (vId) => {
    if (!window.confirm(`Are you sure you want to remove allotment for vendor ${vId}?`)) return;
    try {
      await deleteVendorAllotment(currentId, vId);
      setAllotments(prev => prev.filter(a => a.vendor_id !== vId));
    } catch (err) {
      console.error('Failed to remove allotment:', err);
    }
  };

  const runTestSimulation = async (statusNumber) => {
    setSimulating(true);
    try {
      const vendorObj = vendors.find(v => (v.vendor_code === selectedVendor || v.vendorUid === selectedVendor || v._id === selectedVendor));
      const res = await RouterAPI.simulateTest({
        projectId: currentId,
        vendorId: selectedVendor,
        testUid: `TEST_${selectedVendor}_${Date.now().toString().slice(-4)}`,
        status: statusNumber,
        secretKey: vendorObj?.secret_key || 'marketxcel_smr_sec_2026'
      });
      setSimResult(res || null);
    } catch (err) {
      console.error(err);
      setSimResult({
        success: false,
        message: 'Simulation request failed. Check backend connection and try again.',
      });
    } finally {
      setSimulating(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'live') {
      setCopiedLive(true);
      setTimeout(() => setCopiedLive(false), 2000);
    } else {
      setCopiedTest(true);
      setTimeout(() => setCopiedTest(false), 2000);
    }
  };

  const filteredVendorsList = vendors.filter(v => {
    if (!vendorSearch || vendorSearch.trim().length === 0) return true;
    const term = vendorSearch.toLowerCase().trim();
    const name = String(v.name || v.vendor_name || '').toLowerCase();
    const code = String(v.vendor_code || v.vendor_id || v.vendorUid || v._id || v.id || '').toLowerCase();
    return name.includes(term) || code.includes(term);
  });

  return (
    <>
      <ModalPortal isOpen={true} onClose={onClose}>
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px', width: '96%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            {/* Header */}
            <div className="modal-header" style={{ borderBottom: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8'
                }}>
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Allot Study & Assign Vendor
                  </h3>
                  <small style={{ color: '#64748B' }}>
                    Set custom vendor CPI, quota limits, and generate protected router links
                  </small>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowDocModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}
                  title="Open Vendor Integration Guide"
                >
                  <FileText size={13} />
                  <span>Integration Spec</span>
                </button>
                <button 
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '20px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
              {/* Target Survey Context Box */}
              <div style={{ 
                background: '#F8FAFC', 
                padding: '14px 18px', 
                borderRadius: '10px', 
                marginBottom: '18px', 
                border: '1px solid #E2E8F0' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                    Target Study ({currentClient})
                  </span>
                  <span style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    PID: {currentId}
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                  {currentName}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12.5px' }}>
                  <span>Buyer Revenue CPI: <strong style={{ color: '#16A34A' }}>${Number(currentCpi).toFixed(2)}</strong></span>
                  <span>IR: <strong style={{ color: '#0F172A' }}>{currentIr}%</strong></span>
                  <span>Security: <strong style={{ color: '#0F172A' }}>SHA3-256 + S2S</strong></span>
                </div>
              </div>

              {/* Vendor Allotment Form (Multi-Vendor Selection + Dual Synced Rate + Quota Limit) */}
              <form onSubmit={handleSaveAndGenerate} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={15} color="#0F172A" />
                    <span>Configure Vendor Allocation & Quota</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                    {selectedVendorIds.length} Vendor{selectedVendorIds.length === 1 ? '' : 's'} Selected
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  {/* Multi-Vendor Selection Dropdown with Checkboxes */}
                  <div ref={vendorDropdownRef} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                        Select Supply Vendors:
                      </label>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectAllFiltered(filteredVendorsList)}
                          style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Trigger Dropdown Button */}
                    <button
                      type="button"
                      onClick={() => setVendorDropdownOpen(prev => !prev)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: selectedVendorIds.length > 0 ? '#0F172A' : '#64748B',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '88%', fontWeight: selectedVendorIds.length > 0 ? 600 : 400 }}>
                        {selectedVendorIds.length === 0
                          ? 'Choose vendors from dropdown...'
                          : `${selectedVendorIds.length} Vendor${selectedVendorIds.length > 1 ? 's' : ''} Selected (${
                              vendors.filter(v => selectedVendorIds.includes(v.vendor_code || v.vendor_id || v.vendorUid || v._id || v.id)).map(v => v.name || v.vendor_id).slice(0, 2).join(', ')
                            }${selectedVendorIds.length > 2 ? '...' : ''})`
                        }
                      </span>
                      <ChevronDown
                        size={15}
                        color="#64748B"
                        style={{
                          transform: vendorDropdownOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                          flexShrink: 0
                        }}
                      />
                    </button>

                    {/* Floating Dropdown Menu with Checkboxes */}
                    {vendorDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                          zIndex: 200,
                          padding: '8px'
                        }}
                      >
                        {/* Live Search inside dropdown */}
                        <div style={{ position: 'relative', marginBottom: '8px' }}>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Search vendor by name or ID (e.g. VI0103)..."
                            value={vendorSearch}
                            onChange={(e) => setVendorSearch(e.target.value)}
                            style={{
                              width: '100%',
                              fontSize: '11.5px',
                              padding: '6px 10px',
                              borderColor: '#CBD5E1',
                              borderRadius: '6px',
                              boxSizing: 'border-box'
                            }}
                            autoFocus
                          />
                          {searchingVendors && (
                            <span style={{ position: 'absolute', right: '8px', top: '7px', fontSize: '10px', color: '#64748B' }}>
                              Searching...
                            </span>
                          )}
                        </div>

                        {/* Scrollable Checkbox List */}
                        <div style={{
                          maxHeight: '180px',
                          overflowY: 'auto',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '4px'
                        }}>
                          {filteredVendorsList.length === 0 ? (
                            <div style={{ padding: '12px', textAlign: 'center', fontSize: '11.5px', color: '#64748B' }}>
                              No vendors match query
                            </div>
                          ) : (
                            filteredVendorsList.map((v) => {
                              const code = v.vendor_code || v.vendor_id || v.vendorUid || v._id || v.id;
                              const isChecked = selectedVendorIds.includes(code);
                              return (
                                <div
                                  key={code}
                                  onClick={() => toggleVendorSelection(code)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 8px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    background: isChecked ? '#E2E8F0' : '#FFFFFF',
                                    border: `1px solid ${isChecked ? '#94A3B8' : '#F1F5F9'}`,
                                    marginBottom: '3px',
                                    fontSize: '11.5px',
                                    transition: 'background 0.1s'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    style={{ cursor: 'pointer', accentColor: '#0F172A' }}
                                  />
                                  <span style={{ fontWeight: isChecked ? 700 : 500, color: '#0F172A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {v.name || code}
                                  </span>
                                  <span style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'monospace' }}>
                                    {code}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Footer Status inside dropdown */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', padding: '2px 4px', fontSize: '10.5px', color: '#64748B' }}>
                          <span>{selectedVendorIds.length} of {filteredVendorsList.length} selected</span>
                          <button
                            type="button"
                            onClick={() => setVendorDropdownOpen(false)}
                            style={{
                              background: '#0F172A',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dual Synced Rate Inputs (Percentage % & Fixed CPI $) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px', color: '#0F172A' }}>
                      Allotted Vendor Rate:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      {/* Percentage Input */}
                      <div>
                        <span style={{ display: 'block', fontSize: '10.5px', color: '#64748B', marginBottom: '3px' }}>
                          Rate (%):
                        </span>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="number"
                            step="1"
                            min="1"
                            max="100"
                            required
                            className="input-field"
                            style={{ width: '100%', paddingRight: '22px', fontSize: '12.5px', fontWeight: 600 }}
                            value={vendorPercent !== undefined && vendorPercent !== null ? vendorPercent : ''}
                            onChange={(e) => handlePercentChange(e.target.value)}
                            placeholder="30"
                          />
                          <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 700, fontSize: '11.5px' }}>%</span>
                        </div>
                      </div>

                      {/* CPI Input */}
                      <div>
                        <span style={{ display: 'block', fontSize: '10.5px', color: '#64748B', marginBottom: '3px' }}>
                          CPI ($):
                        </span>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#16A34A', fontWeight: 700, fontSize: '11.5px' }}>$</span>
                          <input 
                            type="text" 
                            inputMode="decimal"
                            required
                            className="input-field"
                            style={{ width: '100%', paddingLeft: '20px', fontSize: '12.5px', fontWeight: 600 }}
                            value={vendorCpi !== undefined && vendorCpi !== null ? vendorCpi : ''}
                            onChange={(e) => handleCpiChange(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <small style={{ fontSize: '11px', color: '#64748B' }}>
                      Vendor receives fixed payout of <strong>${Number(vendorCpi || 0).toFixed(2)}</strong> per complete
                    </small>
                  </div>

                  {/* Quota Limit Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px', color: '#0F172A' }}>
                      Quota Limit (Completes):
                    </label>
                    <input 
                      type="number" 
                      step="1"
                      min="1"
                      required
                      className="input-field" 
                      style={{ width: '100%', fontSize: '12.5px', fontWeight: 600 }}
                      value={quotaLimit}
                      onChange={(e) => setQuotaLimit(parseInt(e.target.value, 10) || 1)}
                    />
                    <small style={{ display: 'block', fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                      Cap on maximum verified completes per allotted vendor
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    {vendorCpi > currentCpi && (
                      <span style={{ color: '#DC2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={13} /> Vendor CPI exceeds buyer payout (${currentCpi})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {allotSuccess && (
                      <span className="badge-soft-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        <CheckCheck size={13} /> Saved!
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={savingAllotment || allottingAll}
                      onClick={handleAllotAllVendors}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 14px',
                        background: '#F1F5F9',
                        color: '#0F172A',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Automatically allot all connected supply panels"
                    >
                      <Zap size={14} color="#0F172A" />
                      {allottingAll ? 'Allotting All...' : 'Allot All Panels'}
                    </button>
                    <button
                      type="submit"
                      disabled={savingAllotment || allottingAll}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 16px',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: '1px solid #0F172A',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                      }}
                    >
                      <Link2 size={15} /> 
                      {savingAllotment ? 'Saving Allotments...' : `Allot Selected (${selectedVendorIds.length || 1})`}
                    </button>
                  </div>
                </div>
              </form>

              {/* Currently Allotted Vendors for this Project Table */}
              {allotments.length > 0 && (
                <div style={{ marginBottom: '18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Share2 size={14} color="#0F172A" />
                      <span>Allotted Vendors on Study #{currentId} ({allotments.length})</span>
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const rows = allotments.map(al => {
                            const entryUrl = al.entry_link || `${window.location.origin}/vendor/auth/${al.vendor_id}/project/${currentId}?uid=[RESPONDENT_ID]`;
                            return {
                              'Project ID': currentId,
                              'Project Name': currentName,
                              'Client': currentClient,
                              'Vendor ID': al.vendor_id,
                              'Vendor Name': al.vendor_name || al.vendor_id,
                              'Vendor CPI ($)': Number(al.vendor_cpi || 1.50).toFixed(2),
                              'Quota Limit': al.quota_limit || 100,
                              'Completes': al.complete_count || 0,
                              'Live Entry Link': entryUrl,
                              'Test Sandbox Link': `${entryUrl}&test=true`
                            };
                          });
                          exportToExcel(rows, `SMR_Project_${currentId}_Allotted_Vendors`, 'Allotted Vendors');
                        }}
                        className="btn btn-soft-success btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '3px 8px', fontWeight: 600 }}
                        title="Download Excel sheet with vendor links and details"
                      >
                        <Download size={12} /> Export Excel (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={loadAllotments}
                        style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                      >
                        <RefreshCw size={11} /> Refresh
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="custom-table" style={{ width: '100%', fontSize: '11.5px', background: '#FFFFFF' }}>
                      <thead className="thead-light">
                        <tr>
                          <th>Vendor / Panel</th>
                          <th>Allotted CPI</th>
                          <th>Quota Pacing</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allotments.map(al => {
                          const completes = al.complete_count || 0;
                          const limit = al.quota_limit || 100;
                          const pct = Math.min(100, Math.round((completes / (limit || 1)) * 100));
                          const entryUrl = al.entry_link || `${window.location.origin}/vendor/auth/${al.vendor_id}/project/${currentId}?uid=[RESPONDENT_ID]`;
                          const isCopied = copiedAllotId === al.vendor_id;

                          return (
                            <tr key={al.vendor_id || al.id}>
                              <td>
                                <strong style={{ color: '#0F172A' }}>{al.vendor_name || al.vendor_id}</strong>
                                <span style={{ display: 'block', fontSize: '10.5px', color: '#64748B', fontFamily: 'monospace' }}>
                                  {al.vendor_id}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: '#16A34A', fontSize: '12.5px' }}>
                                  ${Number(al.vendor_cpi || 1.50).toFixed(2)}
                                </strong>
                              </td>
                              <td style={{ minWidth: '130px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '2px' }}>
                                  <span>{completes} / {limit} completes</span>
                                  <span style={{ fontWeight: 700, color: pct >= 100 ? '#DC2626' : '#0F172A' }}>{pct}%</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#DC2626' : '#10B981' }} />
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', gap: '5px' }}>
                                  <button
                                    type="button"
                                    className="btn btn-soft-primary btn-sm"
                                    onClick={() => {
                                      navigator.clipboard.writeText(entryUrl);
                                      setCopiedAllotId(al.vendor_id);
                                      setTimeout(() => setCopiedAllotId(null), 2000);
                                    }}
                                    title="Copy Vendor Entry Link"
                                    style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    {isCopied ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                                    <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-soft-danger btn-sm"
                                    onClick={() => handleDeleteAllotment(al.vendor_id)}
                                    title="Remove allotment"
                                    style={{ padding: '3px 6px', fontSize: '11px' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Generated Links & Integration Section */}
              {liveLink && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
                  {/* 1. Inbound Survey Link */}
                  <div style={{ 
                    background: '#F8FAFC', 
                    padding: '14px 16px', 
                    borderRadius: '10px', 
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#0F172A', color: '#FFFFFF', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>1</span>
                        <span>Inbound Survey Link (Send to {selectedVendor}):</span>
                      </label>
                      <span className="badge-soft-success" style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                        Quota: {quotaLimit} Completes • ${Number(vendorCpi).toFixed(2)} CPI
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        readOnly
                        value={liveLink}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontFamily: 'monospace',
                          fontSize: '11.5px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#0F172A'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(liveLink, 'live')}
                        style={{ flexShrink: 0, padding: '8px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, background: '#0F172A', color: '#FFFFFF', border: '1px solid #0F172A', borderRadius: '8px', cursor: 'pointer' }}
                        title="Copy Live Production Link"
                      >
                        {copiedLive ? <Check size={14} color="#FFFFFF" /> : <Copy size={14} />}
                        <span>{copiedLive ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                      
                    </div>

                    <p style={{ margin: '8px 0 0 0', fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Info size={13} color="#3B82F6" style={{ flexShrink: 0 }} />
                      <span>Vendor must dynamically replace <code>[RESPONDENT_ID]</code> with their unique respondent ID.</span>
                    </p>
                  </div>

                  {/* 2. Sandbox Test Link */}
                  <div style={{ 
                    background: '#EFF6FF', 
                    padding: '14px 16px', 
                    borderRadius: '10px', 
                    border: '1px solid #BFDBFE',
                    boxShadow: '0 1px 2px rgba(59,130,246,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#0F172A', color: '#FFFFFF', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>2</span>
                        <span>Test Survey Link (Safe Sandbox):</span>
                      </label>
                      <span style={{ fontSize: '11px', color: '#1D4ED8', background: '#DBEAFE', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        🛡️ Safe Test • No Quota Used
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        readOnly
                        value={testLink}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontFamily: 'monospace',
                          fontSize: '11.5px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #93C5FD',
                          background: '#FFFFFF',
                          color: '#1E3A8A'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(testLink, 'test')}
                        style={{ flexShrink: 0, padding: '8px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer' }}
                        title="Copy Sandbox Link"
                      >
                        {copiedTest ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                        <span>{copiedTest ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const freshUid = `TEST_${selectedVendor || 'VND'}_${Date.now().toString().slice(-4)}`;
                          const host = window.location.origin.replace(':3000', ':5000');
                          const screenerTestUrl = `${host}/#/prescreener?vid=${encodeURIComponent(selectedVendor || 'VND-DYN-01')}&pid=${encodeURIComponent(currentId)}&uid=${encodeURIComponent(freshUid)}&test=1`;
                          window.open(screenerTestUrl, '_blank');
                        }}
                        style={{
                          flexShrink: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          padding: '8px 16px',
                          whiteSpace: 'nowrap',
                          fontWeight: 700,
                          background: '#0F172A',
                          color: '#FFFFFF',
                          border: '1px solid #0F172A',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(15,23,42,0.1)'
                        }}
                        title="Launch Pre-Screener in a new browser tab"
                      >
                        <ExternalLink size={13} />
                        <span>Test Pre-Screener</span>
                      </button>
                    </div>

                    <p style={{ margin: '8px 0 0 0', fontSize: '11.5px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={13} style={{ flexShrink: 0 }} />
                      <span>Safe sandbox link — tests routing, IP fraud gate & pre-screener qualification without consuming study quota.</span>
                    </p>
                  </div>

                  {/* 3. Configured Return Callbacks for this Supply Vendor */}
                  {(() => {
                    const vendorObj = vendors.find(v => (v.vendor_code === selectedVendor || v.vendorUid === selectedVendor || v._id === selectedVendor));
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smr.vmhgroupsmr.com';
                    const vidCode = vendorObj?.vendor_code || selectedVendor || 'VND-DYN-01';
                    const isDummy = (url) => !url || url.includes('vnddyn01.com') || url.includes('supplier.com');
                    const rc = !isDummy(vendorObj?.redirect_complete) ? vendorObj.redirect_complete : `${origin}/survey/callback?status=10&vid=${vidCode}&hash=[HASH]&uid=[UID]`;
                    const rt = !isDummy(vendorObj?.redirect_terminate) ? vendorObj.redirect_terminate : `${origin}/survey/callback?status=20&vid=${vidCode}&hash=[HASH]&uid=[UID]`;
                    const ro = !isDummy(vendorObj?.redirect_overquota) ? vendorObj.redirect_overquota : `${origin}/survey/callback?status=30&vid=${vidCode}&hash=[HASH]&uid=[UID]`;
                    const rs = !isDummy(vendorObj?.redirect_security) ? vendorObj.redirect_security : `${origin}/survey/callback?status=40&vid=${vidCode}&hash=[HASH]&uid=[UID]`;
                    const hashAlg = vendorObj?.hash_algorithm || 'SHA3-256';

                    const copyCallback = (url, key) => {
                      navigator.clipboard.writeText(url);
                      setCopiedCallbackKey(key);
                      setTimeout(() => setCopiedCallbackKey(null), 2000);
                    };

                    const callbackItems = [
                      { key: 'rc', label: '✓ COMPLETE (Status 10)', url: rc, color: '#16A34A', border: '#86EFAC', bg: '#F0FDF4' },
                      { key: 'rt', label: '✕ TERMINATE (Status 20)', url: rt, color: '#DC2626', border: '#FCA5A5', bg: '#FEF2F2' },
                      { key: 'ro', label: '⊘ OVERQUOTA (Status 30)', url: ro, color: '#D97706', border: '#FCD34D', bg: '#FFFBEB' },
                      { key: 'rs', label: '🛡️ SECURITY (Status 40)', url: rs, color: '#7C3AED', border: '#D8B4FE', bg: '#FAF5FF' },
                    ];

                    return (
                      <div style={{ 
                        background: '#F8FAFC', 
                        border: '1px solid #E2E8F0', 
                        borderRadius: '10px', 
                        padding: '14px 16px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ background: '#0F172A', color: '#FFFFFF', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>3</span>
                            <Link2 size={14} color="#0F172A" /> 
                            <span>Supply Vendor Return Callbacks ({vendorObj?.name || selectedVendor}):</span>
                          </span>
                          <span className="badge-soft-success" style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            {hashAlg} Secured S2S
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                          {callbackItems.map((cb) => {
                            const isCopied = copiedCallbackKey === cb.key;
                            return (
                              <div 
                                key={cb.key}
                                style={{ 
                                  background: '#FFFFFF', 
                                  padding: '10px 12px', 
                                  borderRadius: '8px', 
                                  border: '1px solid #E2E8F0',
                                  borderLeft: `4px solid ${cb.color}`,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '5px',
                                  minWidth: 0,
                                  overflow: 'hidden'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ color: cb.color, fontWeight: 800, fontSize: '11px', letterSpacing: '0.2px' }}>
                                    {cb.label}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyCallback(cb.url, cb.key)}
                                    style={{ 
                                      background: isCopied ? cb.bg : '#F1F5F9', 
                                      border: `1px solid ${isCopied ? cb.border : '#CBD5E1'}`, 
                                      borderRadius: '4px',
                                      padding: '2px 7px',
                                      cursor: 'pointer', 
                                      color: isCopied ? cb.color : '#475569', 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '4px', 
                                      fontSize: '10.5px',
                                      fontWeight: 600,
                                      flexShrink: 0
                                    }}
                                    title={`Copy ${cb.label} URL`}
                                  >
                                    {isCopied ? <Check size={11} color={cb.color} /> : <Copy size={11} />}
                                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                                <div 
                                  style={{ 
                                    background: '#F8FAFC',
                                    padding: '5px 8px',
                                    borderRadius: '5px',
                                    border: '1px solid #F1F5F9',
                                    color: '#475569', 
                                    fontFamily: 'monospace',
                                    fontSize: '10.5px',
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap'
                                  }} 
                                  title={cb.url}
                                >
                                  {cb.url}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. 1-Click Interactive Test Simulator & End Page Verifier */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#0F172A', color: '#FFFFFF', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>4</span>
                        <Play size={15} color="#0F172A" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                          Test SMR Branded End Pages (1-Click Live Preview)
                        </strong>
                      </div>
                      <span className="badge-soft-primary" style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                        Opens Live End Page
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748B' }}>
                      Click any outcome below to immediately view the official SMR branded end page in a new tab & verify automated S2S postback:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn"
                        disabled={simulating}
                        onClick={() => {
                          openEndPageTab(10);
                          runTestSimulation(1);
                        }}
                        style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          border: '1px solid #86EFAC',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          justifyContent: 'center',
                          padding: '9px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title="Open live SMR Complete End Page (Status 10) in a new browser tab"
                      >
                        <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Complete (10)</span>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} />
                      </button>

                      <button
                        type="button"
                        className="btn"
                        disabled={simulating}
                        onClick={() => {
                          openEndPageTab(20);
                          runTestSimulation(2);
                        }}
                        style={{
                          background: '#FEE2E2',
                          color: '#B91C1C',
                          border: '1px solid #FCA5A5',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          justifyContent: 'center',
                          padding: '9px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title="Open live SMR Terminate End Page (Status 20) in a new browser tab"
                      >
                        <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Terminate (20)</span>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} />
                      </button>

                      <button
                        type="button"
                        className="btn"
                        disabled={simulating}
                        onClick={() => {
                          openEndPageTab(30);
                          runTestSimulation(3);
                        }}
                        style={{
                          background: '#FEF3C7',
                          color: '#B45309',
                          border: '1px solid #FCD34D',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          justifyContent: 'center',
                          padding: '9px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title="Open live SMR OverQuota End Page (Status 30) in a new browser tab"
                      >
                        <Info size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>OverQuota (30)</span>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} />
                      </button>

                      <button
                        type="button"
                        className="btn"
                        disabled={simulating}
                        onClick={() => {
                          openEndPageTab(40);
                          runTestSimulation(4);
                        }}
                        style={{
                          background: '#F3E8FF',
                          color: '#7E22CE',
                          border: '1px solid #D8B4FE',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          justifyContent: 'center',
                          padding: '9px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title="Open live SMR Security Disqualified End Page (Status 40) in a new browser tab"
                      >
                        <ShieldAlert size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Security (40)</span>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} />
                      </button>
                    </div>

                    {/* Simulation Output Log */}
                    {simResult && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: '#0F172A',
                        color: '#E2E8F0',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        lineHeight: 1.6,
                        overflowX: 'auto'
                      }}>
                        <div style={{ color: simResult.success === false ? '#F87171' : '#38BDF8', fontWeight: 700 }}>
                          [Live Test Verification] {simResult.message || 'Live test verified.'}
                        </div>
                        {simResult.statusLabel && (
                          <div>• Status Code: <strong>{simResult.statusRequested || 'N/A'} ({simResult.statusLabel})</strong></div>
                        )}
                        {simResult.targetUrl && (
                          <div style={{ wordBreak: 'break-all' }}>• Redirect Target: <strong style={{ color: '#93C5FD' }}>{simResult.targetUrl}</strong></div>
                        )}
                        {simResult.generatedSha3Hash && (
                          <div>• SHA3-256 Hash: <strong style={{ color: '#4ADE80' }}>{String(simResult.generatedSha3Hash).slice(0, 24)}...</strong></div>
                        )}
                        {simResult.s2sCallbackResult && (
                          <div>• S2S Webhook: <strong style={{ color: '#FDE047' }}>{simResult.s2sCallbackResult.statusCode || 200} OK</strong></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* Vendor Integration Specification Modal */}
      {showDocModal && (
        <VendorIntegrationDocModal 
          isOpen={showDocModal} 
          onClose={() => setShowDocModal(false)} 
        />
      )}
    </>
  );
}
