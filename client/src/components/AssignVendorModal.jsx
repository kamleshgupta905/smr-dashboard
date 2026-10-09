import React, { useEffect, useState } from 'react';
import { X, Link2, Copy, Check, Share2, Play, ShieldAlert, CheckCircle2, AlertTriangle, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { getVendors, DEFAULT_VENDORS, RouterAPI } from '../services/api';
import ModalPortal from './ModalPortal';

export default function AssignVendorModal({ survey, surveyId, onClose, onOpenPreScreener }) {
  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [selectedVendor, setSelectedVendor] = useState('VND-DYN-01');
  const [loading, setLoading] = useState(false);
  const [liveLink, setLiveLink] = useState('');
  const [testLink, setTestLink] = useState('');
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedTest, setCopiedTest] = useState(false);
  
  // Simulator State
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [copiedCallbackKey, setCopiedCallbackKey] = useState(null);

  const resolvedSurvey = (survey && typeof survey === 'object') ? survey : (surveyId && typeof surveyId === 'object' ? surveyId : null);
  const currentId = resolvedSurvey?.survey_id || resolvedSurvey?.SurveyId || resolvedSurvey?.surveyId || resolvedSurvey?.id || resolvedSurvey?._id || resolvedSurvey?.project_id || (typeof surveyId !== 'object' ? surveyId : '2042481293') || '2042481293';
  const currentName = resolvedSurvey?.survey_name || resolvedSurvey?.Name || resolvedSurvey?.name || `Survey #${currentId}`;
  const currentCpi = resolvedSurvey?.cpi || resolvedSurvey?.CPI || resolvedSurvey?.cost_per_interview || 2.70;
  const currentLoi = resolvedSurvey?.loi || resolvedSurvey?.LOI || resolvedSurvey?.length_of_interview || 10;
  const currentClient = resolvedSurvey?.client || resolvedSurvey?.client_name || (String(currentId).startsWith('MX') ? 'Market Xcel' : 'Zamplia Global');

  // Load vendors list from persistent storage
  useEffect(() => {
    getVendors()
      .then((res) => {
        const list = res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          setVendors(list);
          const firstCode = list[0].vendor_code || list[0].vendorUid || list[0]._id;
          if (firstCode) setSelectedVendor(firstCode);
        } else {
          setVendors(DEFAULT_VENDORS);
          setSelectedVendor(DEFAULT_VENDORS[0].vendor_code);
        }
      })
      .catch(() => {
        setVendors(DEFAULT_VENDORS);
        setSelectedVendor(DEFAULT_VENDORS[0].vendor_code);
      });
  }, []);

  // Auto-generate live and test links immediately on mount and vendor change
  useEffect(() => {
    const v = selectedVendor || 'VND-DYN-01';
    const id = currentId || '2042481293';
    const host = window.location.origin.replace(':3000', ':5000');
    setLiveLink(`${host}/vendor/auth/${v}/project/${id}?uid=[RESPONDENT_ID]`);
    setTestLink(`${host}/vendor/auth/${v}/project/${id}?uid=TEST_${v}_VERIFY`);
  }, [selectedVendor, currentId]);

  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSimResult(null);

    const host = window.location.origin.replace(':3000', ':5000');
    const v = selectedVendor || 'VND-DYN-01';
    const generatedLive = `${host}/vendor/auth/${v}/project/${currentId}?uid=[RESPONDENT_ID]`;
    const generatedTest = `${host}/vendor/auth/${v}/project/${currentId}?uid=TEST_${v}_VERIFY`;

    setTimeout(() => {
      setLiveLink(generatedLive);
      setTestLink(generatedTest);
      setLoading(false);
    }, 150);
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

  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
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
                Assign Survey to Vendor
              </h3>
              <small style={{ color: '#64748B' }}>
                Generate and test survey links for your vendor partners
              </small>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 0 0 0' }}>
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
                background: '#E0F2FE',
                color: '#0369A1',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                PID: {currentId}
              </span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
              {currentName}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px' }}>
              <span>Payout CPI: <strong style={{ color: '#16A34A' }}>${Number(currentCpi).toFixed(2)}</strong></span>
              <span>LOI: <strong style={{ color: '#0F172A' }}>{currentLoi} min</strong></span>
              <span>Algorithm: <strong style={{ color: '#2563EB' }}>SHA3-256 + S2S</strong></span>
            </div>
          </div>

          {/* Vendor Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>
              Select Panel Partner / Vendor:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="input-field"
                style={{ flex: 1 }}
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
              >
                {vendors.length === 0 ? (
                  <>
                    <option value="VND-DYN-01">Dynata Global Panel (VND-DYN-01)</option>
                    <option value="VND-CNT-02">Cint Audience Exchange (VND-CNT-02)</option>
                  </>
                ) : (
                  vendors.map((v) => (
                    <option key={v._id || v.vendor_code} value={v.vendor_code || v.vendorUid || v._id}>
                      {v.name} ({v.vendor_code || v.vendorUid || v._id})
                    </option>
                  ))
                )}
              </select>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Link2 size={16} /> Generate Link
              </button>
            </div>
          </div>

          {/* Generated Links Section */}
          {liveLink && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Live Link */}
              <div style={{ background: '#F1F5F9', padding: '12px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                    1. Live Survey Link (Send to Vendor):
                  </label>
                  <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>Live Link</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={liveLink}
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #94A3B8',
                      background: '#FFFFFF'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(liveLink, 'live')}
                    title="Copy Live Link"
                  >
                    {copiedLive ? <Check size={16} color="#16A34A" /> : <Copy size={16} />}
                  </button>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '11.5px', color: '#64748B' }}>
                  <Info size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Vendor will dynamically replace <code>[RESPONDENT_ID]</code> with their panelist ID.
                </p>
              </div>

              {/* Test Link */}
              <div style={{ background: '#EFF6FF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#1E40AF' }}>
                    2. Test Survey Link:
                  </label>
                  <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>Safe Test (No Quota Consumed)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={testLink}
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #93C5FD',
                      background: '#FFFFFF'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(testLink, 'test')}
                    title="Copy Test Link"
                  >
                    {copiedTest ? <Check size={16} color="#16A34A" /> : <Copy size={16} />}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (onOpenPreScreener) {
                        onOpenPreScreener({ vendorId: selectedVendor, projectId: currentId, uid: `TEST_${selectedVendor}_VERIFY` });
                      } else {
                        window.open(testLink, '_blank');
                      }
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', whiteSpace: 'nowrap', padding: '0 12px' }}
                    title="Launch Pre-Screener & Fraud Gate Test"
                  >
                    <ExternalLink size={13} /> Test Pre-Screener
                  </button>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '11.5px', color: '#1E40AF' }}>
                  <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Safe sandbox link — launches live Pre-Screener qualification & device fraud screening without consuming quota.
                </p>
              </div>

              {/* Configured Return Callbacks for this Supply Vendor */}
              {(() => {
                const vendorObj = vendors.find(v => (v.vendor_code === selectedVendor || v.vendorUid === selectedVendor || v._id === selectedVendor));
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smr.vmhgroupsmr.com';
                const vidCode = vendorObj?.vendor_code || selectedVendor || 'VND-DYN-01';
                const isDummy = (url) => !url || url.includes('vnddyn01.com') || url.includes('supplier.com');
                const rc = !isDummy(vendorObj?.redirect_complete) ? vendorObj.redirect_complete : `${origin}/survey/callback?status=10&uid=[UID]&vid=${vidCode}&hash=[HASH]`;
                const rt = !isDummy(vendorObj?.redirect_terminate) ? vendorObj.redirect_terminate : `${origin}/survey/callback?status=20&uid=[UID]&vid=${vidCode}&hash=[HASH]`;
                const ro = !isDummy(vendorObj?.redirect_overquota) ? vendorObj.redirect_overquota : `${origin}/survey/callback?status=30&uid=[UID]&vid=${vidCode}&hash=[HASH]`;
                const rs = !isDummy(vendorObj?.redirect_security) ? vendorObj.redirect_security : `${origin}/survey/callback?status=40&uid=[UID]&vid=${vidCode}&hash=[HASH]`;
                const hashAlg = vendorObj?.hash_algorithm || 'SHA3-256';

                const copyCallback = (url, key) => {
                  navigator.clipboard.writeText(url);
                  setCopiedCallbackKey(key);
                  setTimeout(() => setCopiedCallbackKey(null), 2000);
                };

                return (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Link2 size={13} color="#2563EB" /> 3. Supply Vendor Return Callbacks ({vendorObj?.name || selectedVendor}):
                      </span>
                      <span className="badge-soft-success" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {hashAlg} Secured
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
                      {/* Complete */}
                      <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '10.5px' }}>✓ COMPLETE (Status 10):</span>
                          <button
                            type="button"
                            onClick={() => copyCallback(rc, 'rc')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedCallbackKey === 'rc' ? '#16A34A' : '#64748B', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}
                            title="Copy Complete Return URL"
                          >
                            {copiedCallbackKey === 'rc' ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                            <span>{copiedCallbackKey === 'rc' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10.5px' }} title={rc}>
                          {rc}
                        </div>
                      </div>

                      {/* Terminate */}
                      <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '10.5px' }}>✕ TERMINATE (Status 20):</span>
                          <button
                            type="button"
                            onClick={() => copyCallback(rt, 'rt')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedCallbackKey === 'rt' ? '#16A34A' : '#64748B', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}
                            title="Copy Terminate Return URL"
                          >
                            {copiedCallbackKey === 'rt' ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                            <span>{copiedCallbackKey === 'rt' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10.5px' }} title={rt}>
                          {rt}
                        </div>
                      </div>

                      {/* OverQuota */}
                      <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ color: '#D97706', fontWeight: 700, fontSize: '10.5px' }}>⊘ OVERQUOTA (Status 30):</span>
                          <button
                            type="button"
                            onClick={() => copyCallback(ro, 'ro')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedCallbackKey === 'ro' ? '#16A34A' : '#64748B', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}
                            title="Copy OverQuota Return URL"
                          >
                            {copiedCallbackKey === 'ro' ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                            <span>{copiedCallbackKey === 'ro' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10.5px' }} title={ro}>
                          {ro}
                        </div>
                      </div>

                      {/* Security */}
                      <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ color: '#4F46E5', fontWeight: 700, fontSize: '10.5px' }}>🛡️ SECURITY (Status 40):</span>
                          <button
                            type="button"
                            onClick={() => copyCallback(rs, 'rs')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedCallbackKey === 'rs' ? '#16A34A' : '#64748B', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}
                            title="Copy Security Return URL"
                          >
                            {copiedCallbackKey === 'rs' ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                            <span>{copiedCallbackKey === 'rs' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10.5px' }} title={rs}>
                          {rs}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 1-Click Interactive Test Simulator */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '14px',
                marginTop: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Play size={16} color="#2563EB" />
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                    Test Callback Return URLs
                  </strong>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748B' }}>
                  Test what happens when a user completes, terminates, or gets quota full:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    disabled={simulating}
                    onClick={() => runTestSimulation(1)}
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      border: '1px solid #86EFAC',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      padding: '8px'
                    }}
                  >
                    ✓ Complete (1)
                  </button>

                  <button
                    type="button"
                    className="btn"
                    disabled={simulating}
                    onClick={() => runTestSimulation(2)}
                    style={{
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      border: '1px solid #FCA5A5',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      padding: '8px'
                    }}
                  >
                    ✕ Terminate (2)
                  </button>

                  <button
                    type="button"
                    className="btn"
                    disabled={simulating}
                    onClick={() => runTestSimulation(3)}
                    style={{
                      background: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FCD34D',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      padding: '8px'
                    }}
                  >
                    ⊘ OverQuota (3)
                  </button>

                  <button
                    type="button"
                    className="btn"
                    disabled={simulating}
                    onClick={() => runTestSimulation(4)}
                    style={{
                      background: '#F3E8FF',
                      color: '#7E22CE',
                      border: '1px solid #D8B4FE',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      padding: '8px'
                    }}
                  >
                    🛡️ Security (4)
                  </button>
                </div>

                {/* Simulation Output Log */}
                {simResult && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: '#0F172A',
                    color: '#E2E8F0',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    lineHeight: 1.5
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
);
}
