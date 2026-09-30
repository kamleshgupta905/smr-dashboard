import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Monitor, 
  Smartphone, 
  Tablet, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getSecurityPolicy, DEFAULT_SURVEYS, getVendors, RouterAPI } from '../services/api';

export default function PreScreenerGate({ vendorId, projectId, uid, onComplete }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(true);
  const [evalStatus, setEvalStatus] = useState('checking'); // 'checking' | 'passed' | 'blocked'
  const [blockReason, setBlockReason] = useState('');
  const [blockStatusCode, setBlockStatusCode] = useState(2);

  // Survey & Vendor Info
  const [surveyInfo, setSurveyInfo] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);

  // Pre-screener Form State
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('United States');
  const [employment, setEmployment] = useState('');
  const [attentionCheck, setAttentionCheck] = useState('');
  const [submittingScreen, setSubmittingScreen] = useState(false);
  const [screeningPassed, setScreeningPassed] = useState(false);
  const [screenerError, setScreenerError] = useState('');

  // Live Survey Forward State
  const [surveyEntered, setSurveyEntered] = useState(false);
  const [entryTimestamp, setEntryTimestamp] = useState(null);
  const [simOutcome, setSimOutcome] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const pol = await getSecurityPolicy();
        setPolicy(pol || {});

        // Lookup survey & vendor
        const surveysList = DEFAULT_SURVEYS || [];
        const matchedSurvey = surveysList.find(s => 
          String(s.survey_id || s.SurveyId || s.surveyId || s.id) === String(projectId)
        ) || {
          survey_id: projectId || '2042481293',
          survey_name: `Market Research Study #${projectId || '2042481293'}`,
          cpi: 2.75,
          loi: 12,
          country: 'United States',
          device: 'Desktop,Mobile,Tablet'
        };
        setSurveyInfo(matchedSurvey);

        const vendorsRes = await getVendors();
        const vList = vendorsRes.data || [];
        const matchedVendor = vList.find(v => 
          (v.vendor_code === vendorId || v.vendorUid === vendorId || v._id === vendorId)
        ) || {
          name: vendorId || 'Panel Partner',
          vendor_code: vendorId || 'VND-DYN-01'
        };
        setVendorInfo(matchedVendor);

        // Run Pre-Click Automated Fraud Evaluation
        runPreClickEvaluation(pol || {}, matchedSurvey);
      } catch (e) {
        console.error('Pre-screener init failed:', e);
        setEvalStatus('passed');
        setLoading(false);
        setEvaluating(false);
      }
    }
    init();
  }, [vendorId, projectId]);

  const runPreClickEvaluation = (pol, survey) => {
    const userAgent = navigator.userAgent || '';
    const isMobile = /mobile|iphone|android(?!.*tablet)/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // 1. Device Compatibility Filter Check
    if (isMobile && pol.allowMobile === false) {
      setEvalStatus('blocked');
      setBlockReason('Device Policy Restriction: Mobile devices are not permitted for this study by the client security policy.');
      setBlockStatusCode(2); // Terminate
      setEvaluating(false);
      setLoading(false);
      return;
    }
    if (isDesktop && pol.allowDesktop === false) {
      setEvalStatus('blocked');
      setBlockReason('Device Policy Restriction: Desktop access is restricted for this specific study.');
      setBlockStatusCode(2);
      setEvaluating(false);
      setLoading(false);
      return;
    }
    if (isTablet && pol.allowTablet === false) {
      setEvalStatus('blocked');
      setBlockReason('Device Policy Restriction: Tablet devices are not permitted for this study.');
      setBlockStatusCode(2);
      setEvaluating(false);
      setLoading(false);
      return;
    }

    // 2. Headless Browser / Automation Bot Check
    if (pol.botProtection !== false) {
      const isHeadless = navigator.webdriver || window.__nightmare || window.callPhantom;
      if (isHeadless) {
        setEvalStatus('blocked');
        setBlockReason('Security Violation: Automated headless browser / bot signature detected.');
        setBlockStatusCode(4); // Security Block
        setEvaluating(false);
        setLoading(false);
        return;
      }
    }

    // Passed pre-click checks
    setEvalStatus('passed');
    setEvaluating(false);
    setLoading(false);
  };

  const handlePreScreenSubmit = (e) => {
    e.preventDefault();
    setScreenerError('');

    if (!age || !gender || !employment) {
      setScreenerError('Please answer all qualification questions to continue.');
      return;
    }

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 18 || numAge > 90) {
      setScreenerError('Age must be between 18 and 90 years.');
      return;
    }

    // Honeypot / Attention Trap Check (LH Protection)
    if (policy?.lhProtection !== false) {
      if (attentionCheck.toLowerCase() !== 'blue') {
        setEvalStatus('blocked');
        setBlockReason('Pre-Screening Quality Terminate: Failed attention / verification honeypot check.');
        setBlockStatusCode(4);
        return;
      }
    }

    setSubmittingScreen(true);
    setTimeout(() => {
      setSubmittingScreen(false);
      setScreeningPassed(true);
      setSurveyEntered(true);
      setEntryTimestamp(Date.now());
    }, 450);
  };

  const handleOutcomeSimulation = async (statusNumber) => {
    try {
      const elapsedSeconds = entryTimestamp ? Math.round((Date.now() - entryTimestamp) / 1000) : 120;
      
      // Speeder check evaluation
      const statedLoi = surveyInfo?.loi || 10;
      const minAcceptable = Math.max(30, (statedLoi * 60) * (policy?.speederThresholdPercent || 0.3));
      let finalStatus = statusNumber;
      let speederFlag = false;

      if (policy?.speederCheck !== false && statusNumber === 1 && elapsedSeconds < minAcceptable) {
        finalStatus = 4; // Downgrade to Security/Quality Terminate
        speederFlag = true;
      }

      const res = await RouterAPI.simulateTest({
        projectId: projectId,
        vendorId: vendorId,
        testUid: uid || `PANELIST_${Date.now().toString().slice(-4)}`,
        status: finalStatus
      });

      setSimOutcome({
        ...res,
        speederFlag,
        elapsedSeconds,
        finalStatus
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0F172A'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>

        {/* Top Security Banner */}
        <div style={{
          background: '#0F172A',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #334155',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                SMR Pre-Screener & Security Gateway
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Panel: <strong style={{ color: '#E2E8F0' }}>{vendorInfo?.name || vendorId}</strong> • PID: {projectId}
              </div>
            </div>
          </div>
          <span style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38BDF8',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            SHA3-256 + S2S
          </span>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>

          {/* 1. Loading State */}
          {evaluating && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="sync-spin" style={{ display: 'inline-block', marginBottom: '16px' }}>
                <ShieldCheck size={36} color="#2563EB" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: '#0F172A' }}>
                Running Security & Fraud Screening...
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Verifying device fingerprint, browser security & policy integrity.
              </p>
            </div>
          )}

          {/* 2. Blocked / Terminated Screen */}
          {!evaluating && evalStatus === 'blocked' && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <ShieldAlert size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#991B1B', margin: '0 0 8px 0' }}>
                Survey Access Restricted
              </h3>
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#B91C1C',
                fontSize: '13px',
                lineHeight: 1.5,
                marginBottom: '20px'
              }}>
                {blockReason}
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '20px' }}>
                Respondent UID: <code>{uid || 'N/A'}</code> • StatusCode: <strong>{blockStatusCode}</strong>
              </p>
              <button
                onClick={() => window.location.href = `/`}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* 3. Pre-Screener Questions (If preScreenEnabled) */}
          {!evaluating && evalStatus === 'passed' && !surveyEntered && policy?.preScreenEnabled !== false && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  Pre-Qualification Questionnaire
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                  Please answer these brief qualification questions before proceeding to the survey.
                </div>
              </div>

              {screenerError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  color: '#B91C1C',
                  fontSize: '12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={15} />
                  <span>{screenerError}</span>
                </div>
              )}

              <form onSubmit={handlePreScreenSubmit}>
                {/* Age */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    1. What is your current age?
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    required
                    placeholder="e.g. 29"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Gender */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    2. What is your gender identity?
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary / Third Gender</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Country */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    3. Country of Primary Residence:
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="United States">United States</option>
                    <option value="Germany">Germany</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                {/* Employment */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    4. Current Employment Status:
                  </label>
                  <select
                    required
                    value={employment}
                    onChange={(e) => setEmployment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Employed Full-Time">Employed Full-Time (35+ hours/week)</option>
                    <option value="Employed Part-Time">Employed Part-Time</option>
                    <option value="Self-Employed">Self-Employed / Business Owner</option>
                    <option value="Student">Student</option>
                    <option value="Homemaker">Homemaker</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                {/* Honeypot Attention Question (LH Protection) */}
                {policy?.lhProtection !== false && (
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '18px'
                  }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
                      5. Attention Verification (Quality Check):
                    </label>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '8px' }}>
                      To prevent automated submissions, please select the color <strong>Blue</strong> below:
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {['Red', 'Green', 'Blue', 'Yellow'].map((c) => (
                        <label key={c} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="radio"
                            name="honeypot"
                            value={c.toLowerCase()}
                            checked={attentionCheck.toLowerCase() === c.toLowerCase()}
                            onChange={(e) => setAttentionCheck(e.target.value)}
                          />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingScreen}
                  style={{
                    width: '100%',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {submittingScreen ? 'Verifying Pre-Screen...' : 'Pass Pre-Screen & Enter Survey'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* 4. Active Survey Session & Simulator */}
          {!evaluating && evalStatus === 'passed' && (surveyEntered || policy?.preScreenEnabled === false) && (
            <div>
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CheckCircle2 size={24} color="#10B981" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#065F46' }}>
                    Pre-Screening & Security Verified!
                  </div>
                  <div style={{ fontSize: '12px', color: '#047857' }}>
                    You have passed demographic criteria and bot screening checks.
                  </div>
                </div>
              </div>

              {/* Study Details */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '14px 16px',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '2px' }}>
                  Live Client Study
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  {surveyInfo?.name || surveyInfo?.survey_name || `Study #${projectId}`}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#475569' }}>
                  <span>LOI: <strong>{surveyInfo?.loi || 12} min</strong></span>
                  <span>Payout CPI: <strong style={{ color: '#16A34A' }}>${Number(surveyInfo?.cpi || 2.50).toFixed(2)}</strong></span>
                  <span>Market: <strong>{surveyInfo?.country || 'Global'}</strong></span>
                </div>
              </div>

              {/* Interactive Simulator / Complete Verification */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>
                  Complete / Outcome Testing Simulator:
                </label>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>
                  Click an outcome below to test real-time S2S callback and SHA3-256 hash generation for this respondent:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  <button
                    onClick={() => handleOutcomeSimulation(1)}
                    style={{
                      background: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '9px 4px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Complete (1)
                  </button>
                  <button
                    onClick={() => handleOutcomeSimulation(2)}
                    style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '9px 4px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Terminate (2)
                  </button>
                  <button
                    onClick={() => handleOutcomeSimulation(3)}
                    style={{
                      background: '#F59E0B',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '9px 4px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                  >
                    OverQuota (3)
                  </button>
                  <button
                    onClick={() => handleOutcomeSimulation(4)}
                    style={{
                      background: '#8B5CF6',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '9px 4px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Security (4)
                  </button>
                </div>

                {/* Outcome Result Card */}
                {simOutcome && (
                  <div style={{
                    background: '#0F172A',
                    borderRadius: '8px',
                    padding: '14px',
                    color: '#E2E8F0',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, color: simOutcome.status === 'COMPLETE' ? '#34D399' : '#F87171' }}>
                        {simOutcome.status} (Status Code: {simOutcome.finalStatus})
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                        Duration: {simOutcome.elapsedSeconds}s
                      </span>
                    </div>
                    {simOutcome.speederFlag && (
                      <div style={{ color: '#F87171', fontSize: '11px', marginBottom: '6px' }}>
                        ⚠️ Speeder Policy Triggered: Finished faster than 30% LOI! Automatically flagged as Security Terminate.
                      </div>
                    )}
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: '#94A3B8', marginBottom: '8px' }}>
                      <strong>Redirect URL:</strong> {simOutcome.redirectUrl}
                    </div>
                    <div style={{ fontSize: '11px', color: '#38BDF8' }}>
                      ✓ S2S Callback HTTP 200 OK Delivered to {vendorInfo?.name || vendorId}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
