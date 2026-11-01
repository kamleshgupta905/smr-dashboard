import React, { useState, useEffect, useRef } from 'react';
import { Check, ShieldAlert, ExternalLink } from 'lucide-react';
import { getSecurityPolicy, DEFAULT_SURVEYS, getVendors, RouterAPI, generateVendorLink, getCustomSurveys } from '../services/api';

// Concise, direct 3-question demographic pre-screener
const PRESCREENER_QUESTIONS = [
  {
    id: 'age',
    question: 'What is your age?',
    options: [
      { id: 'under_18', text: 'Under 18', isDisqualify: true },
      { id: '18_24', text: '18 - 24' },
      { id: '25_34', text: '25 - 34' },
      { id: '35_44', text: '35 - 44' },
      { id: '45_54', text: '45 - 54' },
      { id: '55_plus', text: '55+' }
    ]
  },
  {
    id: 'gender',
    question: 'What is your gender?',
    options: [
      { id: 'male', text: 'Male' },
      { id: 'female', text: 'Female' },
      { id: 'other', text: 'Other' },
      { id: 'prefer_not_to_say', text: 'Prefer not to say' }
    ]
  },
  {
    id: 'employment',
    question: 'What is your employment status?',
    options: [
      { id: 'full_time', text: 'Employed full-time' },
      { id: 'part_time', text: 'Employed part-time' },
      { id: 'self_employed', text: 'Self-employed' },
      { id: 'student', text: 'Student' },
      { id: 'retired', text: 'Retired' },
      { id: 'other', text: 'Other' }
    ]
  }
];

export default function PreScreenerGate({ 
  vendorId: propVendorId, 
  projectId: propProjectId, 
  uid: propUid,
  targetUrl: propTargetUrl 
}) {
  // Extract parameters from URL search or hash if not passed via props
  const getParam = (name) => {
    if (typeof window === 'undefined') return '';
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get(name)) return searchParams.get(name);
    if (window.location.hash && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.substring(window.location.hash.indexOf('?'));
      const hashParams = new URLSearchParams(hashQuery);
      if (hashParams.get(name)) return hashParams.get(name);
    }
    return '';
  };

  const vendorId = propVendorId || getParam('vid') || getParam('vendorId') || 'VND-DYN-01';
  const projectId = propProjectId || getParam('pid') || getParam('projectId') || getParam('sid') || '2042481293';
  const uid = propUid || getParam('uid') || getParam('rid') || getParam('transaction_id') || `PANEL_${Date.now().toString().slice(-4)}`;
  const targetUrl = propTargetUrl || getParam('target') || '';

  const [evaluating, setEvaluating] = useState(true);
  const [evalStatus, setEvalStatus] = useState('checking'); // 'checking' | 'passed' | 'blocked'
  const [blockReason, setBlockReason] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [surveyInfo, setSurveyInfo] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);

  const autoAdvanceTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // 1. Prevent duplicate entries (Bypassed for test runs to allow seamless verification)
  useEffect(() => {
    const isTest = String(uid).toUpperCase().startsWith('TEST_') || 
                   String(uid).toUpperCase().includes('TEST') ||
                   (typeof window !== 'undefined' && (window.location.href.includes('test=1') || window.location.search.includes('test=')));
    if (isTest) {
      try {
        localStorage.removeItem(`smr_status_${projectId}_${uid}`);
      } catch (e) {}
      return;
    }

    if (projectId && uid && uid !== '[RESPONDENT_ID]' && uid !== '%5BRESPONDENT_ID%5D') {
      try {
        const savedStatus = localStorage.getItem(`smr_status_${projectId}_${uid}`);
        if (savedStatus) {
          const code = String(savedStatus);
          const reason = code === '10' ? 'already_completed' : 'already_terminated';
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          window.location.replace(
            `${origin}/survey/callback?status=${code}&uid=${encodeURIComponent(uid)}&vid=${encodeURIComponent(vendorId)}&pid=${encodeURIComponent(projectId)}&reason=${reason}`
          );
          return;
        }
      } catch (e) {
        console.warn('LocalStorage check warning:', e);
      }
    }
  }, [projectId, uid, vendorId]);

  // 2. Initial Security & Device check
  useEffect(() => {
    async function init() {
      try {
        const pol = await getSecurityPolicy().catch(() => ({}));

        // Survey details lookup
        const customSurveys = typeof getCustomSurveys === 'function' ? getCustomSurveys() : [];
        const surveysList = [...customSurveys, ...(DEFAULT_SURVEYS || [])];
        const matchedSurvey = surveysList.find(s => 
          String(s.survey_id || s.SurveyId || s.surveyId || s.id || s.ProjectId) === String(projectId)
        ) || {
          survey_id: projectId || '2077902648',
          survey_name: `Survey Study #${projectId || '2077902648'}`
        };
        setSurveyInfo(matchedSurvey);

        // Vendor lookup
        const vendorsRes = await getVendors().catch(() => ({ data: [] }));
        const vList = vendorsRes.data || [];
        const matchedVendor = vList.find(v => 
          (v.vendor_code === vendorId || v.vendorUid === vendorId || v._id === vendorId)
        ) || {
          name: vendorId || 'Panel Partner',
          vendor_code: vendorId || 'VND-DYN-01'
        };
        setVendorInfo(matchedVendor);

        // Basic Bot / Automated crawler screening
        if (pol?.botProtection !== false) {
          const isHeadless = typeof navigator !== 'undefined' && (navigator.webdriver || window.__nightmare || window.callPhantom);
          if (isHeadless) {
            setEvalStatus('blocked');
            setBlockReason('Automated browser environment detected.');
            setEvaluating(false);
            return;
          }
        }

        setEvalStatus('passed');
        setEvaluating(false);
      } catch (e) {
        console.error('Pre-screener init failed:', e);
        setEvalStatus('passed');
        setEvaluating(false);
      }
    }
    init();
  }, [vendorId, projectId]);

  // 3. Connect and redirect directly to survey upon passing pre-screener
  const redirectToZampliaLiveSurvey = async () => {
    setIsConnecting(true);

    try {
      const isTestSession = String(uid).toUpperCase().startsWith('TEST_') || 
                            String(uid).toUpperCase().includes('TEST') ||
                            (typeof window !== 'undefined' && (window.location.href.includes('test=1') || window.location.search.includes('test=')));

      let finalTargetUrl = '';

      // 1. If explicit target URL was passed into the screener
      if (targetUrl && targetUrl.startsWith('http')) {
        finalTargetUrl = targetUrl;
      }

      // 2. Check if survey has custom target link from surveyInfo
      if (!finalTargetUrl) {
        const customUrl = surveyInfo?.liveSurveyUrl || surveyInfo?.entry_live_url || surveyInfo?.live_url;
        if (customUrl && customUrl.startsWith('http')) {
          finalTargetUrl = customUrl;
        }
      }

      // 3. Fallback to Zamplia live gateway if numeric survey ID or parent study ID
      if (!finalTargetUrl) {
        const numMatch = String(projectId).match(/^\d+$/) || 
                         (surveyInfo?.name || surveyInfo?.project_name || surveyInfo?.survey_name || '').match(/(\d{6,})/);
        if (numMatch) {
          const sid = numMatch[1] || projectId;
          finalTargetUrl = `https://res.zamplia.com/?vid=2138&isMap=1&sid=${sid}&username=${vendorId}&cid=42`;
        }
      }

      // 4. Query backend vendor link generator API
      if (!finalTargetUrl) {
        try {
          const linkRes = await generateVendorLink(projectId, vendorId);
          const live = linkRes?.liveLink || linkRes?.signedLiveLink || linkRes?.data?.liveUrl;
          if (live && live.includes('http')) {
            finalTargetUrl = live;
          }
        } catch (e) {
          console.warn('Backend link generation notice:', e);
        }
      }

      // 5. If STILL no target URL:
      if (!finalTargetUrl) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        window.location.href = `${origin}/survey/callback?status=30&vid=${encodeURIComponent(vendorId)}&pid=${encodeURIComponent(projectId)}&uid=${encodeURIComponent(uid)}&reason=survey_unavailable`;
        return;
      }

      // Attach respondent UID / transaction_id
      const cleanUid = uid || `PANEL_${Date.now()}`;
      finalTargetUrl = finalTargetUrl
        .replace(/\[#UID#\]/g, cleanUid)
        .replace(/\[identifier\]/g, cleanUid)
        .replace(/\[RESPONDENT_ID\]/g, cleanUid)
        .replace(/\[UID\]/g, cleanUid)
        .replace(/\[uid\]/g, cleanUid)
        .replace(/vmhgroupss/g, cleanUid)
        .replace(/vmhgroups/g, cleanUid);

      const delim = finalTargetUrl.includes('?') ? '&' : '?';
      if (!finalTargetUrl.includes('transaction_id') && !finalTargetUrl.includes('rid') && !finalTargetUrl.includes('uid=')) {
        finalTargetUrl = `${finalTargetUrl}${delim}transaction_id=${encodeURIComponent(cleanUid)}&rid=${encodeURIComponent(cleanUid)}`;
      }

      if (!finalTargetUrl.includes('screened=1')) {
        finalTargetUrl += `${finalTargetUrl.includes('?') ? '&' : '?'}screened=1`;
      }

      // Log lead entry asynchronously
      try {
        RouterAPI.simulateTest({
          projectId: String(projectId),
          vendorId: String(vendorId),
          testUid: cleanUid,
          status: 1
        }).catch(() => {});
      } catch (e) {}

      // Immediate browser navigation to the target survey page
      window.location.href = finalTargetUrl;
    } catch (err) {
      console.error('Redirection error:', err);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      window.location.href = `${origin}/vendor/auth/${encodeURIComponent(vendorId)}/project/${encodeURIComponent(projectId)}?uid=${encodeURIComponent(uid)}&screened=1`;
    }
  };

  // 4. Handle Option Selection (Instant highlight, disqualification check, and auto-advance)
  const handleSelectOption = (option) => {
    if (isConnecting) return;

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    const currentQ = PRESCREENER_QUESTIONS[currentStep];
    setAnswers(prev => ({ ...prev, [currentQ.id]: option.id }));

    // Disqualification on Question 1 (Under 18)
    if (option.isDisqualify) {
      try {
        localStorage.setItem(`smr_status_${projectId}_${uid}`, '20');
      } catch (e) {}

      autoAdvanceTimerRef.current = setTimeout(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        window.location.replace(
          `${origin}/survey/callback?status=20&uid=${encodeURIComponent(uid)}&vid=${encodeURIComponent(vendorId)}&pid=${encodeURIComponent(projectId)}&reason=screener_age_under18`
        );
      }, 300);
      return;
    }

    // Auto-advance to next question or redirect to survey
    autoAdvanceTimerRef.current = setTimeout(() => {
      if (currentStep < PRESCREENER_QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        redirectToZampliaLiveSurvey();
      }
    }, 260);
  };

  const currentQ = PRESCREENER_QUESTIONS[currentStep] || null;
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(120% 120% at 50% 0%, #1c2b45 0%, #0d1525 60%, #070b13 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#1d1d1f'
    }}>
      <style>{`
        @keyframes prescreenerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .screener-option-card:hover {
          border-color: #0F172A !important;
          background-color: rgba(15, 23, 42, 0.03) !important;
        }
      `}</style>

      {/* Main Clean Card (No external headers, category bars, counters or subtitle text) */}
      <div style={{
        maxWidth: '540px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
        padding: '36px 30px',
        boxSizing: 'border-box'
      }}>

        {/* 1. Security Checking State */}
        {evaluating && (
          <div style={{ textAlign: 'center', padding: '40px 10px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: '3px solid rgba(15, 23, 42, 0.15)',
              borderTopColor: '#0F172A',
              display: 'inline-block',
              animation: 'prescreenerSpin 0.75s linear infinite',
              marginBottom: '16px'
            }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1d1d1f' }}>
              Verifying security safeguards...
            </div>
          </div>
        )}

        {/* 2. Blocked Access State */}
        {!evaluating && evalStatus === 'blocked' && (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <ShieldAlert size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px 0' }}>
              Survey Access Restricted
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              {blockReason || 'Session does not meet security requirements.'}
            </p>
            <a
              href={`/survey/callback?status=40&uid=${encodeURIComponent(uid)}&vid=${encodeURIComponent(vendorId)}&pid=${encodeURIComponent(projectId)}&reason=security_blocked`}
              style={{
                display: 'inline-block',
                background: '#ef4444',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              View Survey Status
            </a>
          </div>
        )}

        {/* 3. Connecting to Survey State */}
        {!evaluating && isConnecting && (
          <div style={{ textAlign: 'center', padding: '36px 12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '3.5px solid rgba(15, 23, 42, 0.15)',
              borderTopColor: '#0F172A',
              display: 'inline-block',
              animation: 'prescreenerSpin 0.75s linear infinite',
              marginBottom: '18px'
            }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px 0' }}>
              Connecting to Survey...
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Redirecting you to the research study. Please do not close or refresh this window.
            </p>
          </div>
        )}

        {/* 4. Active Pre-Screener (Only Question & Options Visible — No Headers, No Subtitles, No Counters, No Back Button) */}
        {!evaluating && evalStatus === 'passed' && !isConnecting && currentQ && (
          <div>
            {/* Question Text */}
            <h2 style={{
              fontSize: '21px',
              fontWeight: 700,
              color: '#1d1d1f',
              margin: '0 0 24px 0',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: 1.3
            }}>
              {currentQ.question}
            </h2>

            {/* Answer Options Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '8px'
            }}>
              {currentQ.options.map((opt) => {
                const isSelected = currentAnswer === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className="screener-option-card"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: isSelected ? 'rgba(15, 23, 42, 0.05)' : '#f8fafc',
                      border: isSelected ? '2px solid #0F172A' : '1.5px solid #e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      minHeight: '52px',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? '#0F172A' : '#1e293b'
                    }}>
                      {opt.text}
                    </span>

                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                      background: isSelected ? '#0F172A' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
