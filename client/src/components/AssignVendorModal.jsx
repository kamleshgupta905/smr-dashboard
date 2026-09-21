import React, { useEffect, useState } from 'react';
import { X, Link2, Copy, Check, Share2, Play, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { ManagementAPI, RouterAPI } from '../services/api';
import ModalPortal from './ModalPortal';

export default function AssignVendorModal({ survey, surveyId, onClose }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('SAMPLE_VENDOR_1');
  const [loading, setLoading] = useState(false);
  const [liveLink, setLiveLink] = useState('');
  const [testLink, setTestLink] = useState('');
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedTest, setCopiedTest] = useState(false);
  
  // Simulator State
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const currentId = survey?.survey_id || survey?.SurveyId || survey?.surveyId || survey?.id || survey?._id || survey?.project_id || surveyId || '2042481293';
  const currentName = survey?.survey_name || survey?.Name || survey?.name || `Survey #${currentId}`;
  const currentCpi = survey?.cpi || survey?.CPI || survey?.cost_per_interview || 2.70;
  const currentLoi = survey?.loi || survey?.LOI || survey?.length_of_interview || 10;
  const currentClient = survey?.client || (String(currentId).startsWith('MX') ? 'Market Xcel' : 'Zamplia');

  useEffect(() => {
    ManagementAPI.getVendors()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setVendors(Array.isArray(list) ? list : []);
        if (list.length > 0) {
          setSelectedVendor(list[0].vendor_code || list[0].vendorUid || list[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSimResult(null);

    const host = window.location.origin.replace(':3000', ':5000');
    const generatedLive = `${host}/vendor/auth/${selectedVendor}/project/${currentId}?uid=[RESPONDENT_ID]`;
    const generatedTest = `${host}/vendor/auth/${selectedVendor}/project/${currentId}?uid=TEST_${selectedVendor}_DEMO`;

    setTimeout(() => {
      setLiveLink(generatedLive);
      setTestLink(generatedTest);
      setLoading(false);
    }, 200);
  };

  const runTestSimulation = async (statusNumber) => {
    setSimulating(true);
    try {
      const res = await RouterAPI.simulateTest({
        projectId: currentId,
        vendorId: selectedVendor,
        testUid: `TEST_${selectedVendor}_${Date.now().toString().slice(-4)}`,
        status: statusNumber,
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
                Assign Vendor & Generate Inbound Link
              </h3>
              <small style={{ color: '#64748B' }}>
                Generate vendor panel routing links with dynamic respondent placeholders
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
              Select Sample Vendor / Panel Partner:
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
                    <option value="SAMPLE_VENDOR_1">Default Sample Vendor (VND-DEMO-01)</option>
                    <option value="DYNATA_PANEL">Dynata Global Audience (DYNATA-01)</option>
                    <option value="CINT_EXCHANGE">Cint Access Panel (CINT-02)</option>
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
                    1. Live Entry URL (For Vendor Panel Setup):
                  </label>
                  <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>Active Inbound Route</span>
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
                  Vendor panel software will dynamically replace <code>[RESPONDENT_ID]</code> with their panelist ID.
                </p>
              </div>

              {/* Test Link */}
              <div style={{ background: '#EFF6FF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#1E40AF' }}>
                    2. Sandbox Test Link (Safe Click Testing):
                  </label>
                  <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>Zero Quota Impact</span>
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
                </div>
              </div>

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
                    1-Click Routing & S2S Callback Simulator
                  </strong>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748B' }}>
                  Simulate redirect outcomes to verify SHA3-256 hash generation and Server-to-Server callback:
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
                      [Simulator Output] {simResult.message || 'Test click simulated.'}
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
