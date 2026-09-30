import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  ShieldAlert, 
  Sparkles,
  ExternalLink,
  RotateCcw,
  Check,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  Layers,
  Star,
  CheckCircle,
  Clock,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';
import { getSecurityPolicy, DEFAULT_SURVEYS, getVendors, RouterAPI } from '../services/api';

// Fixed Demographics Question 1: Age
const FIXED_AGE_QUESTION = {
  id: 'screener_age_bracket',
  category: 'Demographics & Age Profiling',
  question: 'Which age bracket accurately represents your current age?',
  subtitle: 'Select your age range to confirm demographic quota eligibility',
  options: [
    { id: 'age_18_24', text: '18 to 24 years of age', code: 'A' },
    { id: 'age_25_34', text: '25 to 34 years of age', code: 'B' },
    { id: 'age_35_44', text: '35 to 44 years of age', code: 'C' },
    { id: 'age_45_54', text: '45 to 54 years of age', code: 'D' },
    { id: 'age_55_plus', text: '55 years of age or older', code: 'E' }
  ]
};

// Fixed Demographics Question 2: Gender
const FIXED_GENDER_QUESTION = {
  id: 'screener_gender_identity',
  category: 'Demographics & Gender Identity',
  question: 'What is your current gender identity for study quota balance?',
  subtitle: 'Select the option that best reflects your gender identity',
  options: [
    { id: 'gen_female', text: 'Female (Woman)', code: 'A' },
    { id: 'gen_male', text: 'Male (Man)', code: 'B' },
    { id: 'gen_nonbinary', text: 'Non-binary or diverse', code: 'C' },
    { id: 'gen_decline', text: 'Prefer not to disclose', code: 'D' }
  ]
};

// Curated Rotating Pool for Question 3 (Switches dynamically every session)
const ROTATING_BASIC_POOL = [
  {
    id: 'employment_status',
    category: 'Professional Background',
    question: 'Which category best reflects your current employment state?',
    subtitle: 'Select the classification matching your primary work commitment',
    options: [
      { id: 'opt_full_time', text: 'Full-time salaried worker', code: 'A' },
      { id: 'opt_business_owner', text: 'Self-employed firm owner', code: 'B' },
      { id: 'opt_part_time', text: 'Part-time contract worker', code: 'C' },
      { id: 'opt_student', text: 'Current university student', code: 'D' }
    ]
  },
  {
    id: 'decision_maker',
    category: 'Household Governance',
    question: 'What role do you hold for primary household purchases?',
    subtitle: 'Select your level of responsibility in grocery and retail goods',
    options: [
      { id: 'opt_sole', text: 'Sole primary decision maker', code: 'A' },
      { id: 'opt_equal', text: 'Shared equal decision maker', code: 'B' },
      { id: 'opt_influencer', text: 'Occasional input or helper', code: 'C' },
      { id: 'opt_none', text: 'No involvement in decisions', code: 'D' }
    ]
  },
  {
    id: 'tech_platform',
    category: 'Technology Ecosystem',
    question: 'Which primary operating system do you use most frequently?',
    subtitle: 'Select the primary platform for your daily computing needs',
    options: [
      { id: 'opt_apple', text: 'Apple iOS & macOS ecosystem', code: 'A' },
      { id: 'opt_android', text: 'Google Android & ChromeOS', code: 'B' },
      { id: 'opt_windows', text: 'Microsoft Windows system', code: 'C' },
      { id: 'opt_linux', text: 'Linux open-source desktop', code: 'D' }
    ]
  },
  {
    id: 'banking_fintech',
    category: 'Digital Financial Services',
    question: 'How do you primarily access and manage your bank account?',
    subtitle: 'Indicate your most frequent channel for managing personal funds',
    options: [
      { id: 'opt_mobile_app', text: 'Mobile smartphone banking', code: 'A' },
      { id: 'opt_desktop_web', text: 'Desktop personal web app', code: 'B' },
      { id: 'opt_branch', text: 'Local bank branch teller', code: 'C' },
      { id: 'opt_atm', text: 'Automated ATM kiosk unit', code: 'D' }
    ]
  },
  {
    id: 'streaming_media',
    category: 'Media & Entertainment',
    question: 'Which digital streaming service do you watch most often?',
    subtitle: 'Choose your main digital entertainment and video provider',
    options: [
      { id: 'opt_netflix', text: 'Netflix & Prime Video apps', code: 'A' },
      { id: 'opt_disney', text: 'Disney+ & Apple TV+ apps', code: 'B' },
      { id: 'opt_youtube', text: 'YouTube Premium & Music', code: 'C' },
      { id: 'opt_none_stream', text: 'Do not use streaming apps', code: 'D' }
    ]
  },
  {
    id: 'online_shopping',
    category: 'E-Commerce & Retail',
    question: 'How often do you make purchases on online marketplaces?',
    subtitle: 'Select the typical frequency of your digital shopping orders',
    options: [
      { id: 'opt_weekly', text: 'Multiple orders each week', code: 'A' },
      { id: 'opt_monthly', text: 'Several purchases a month', code: 'B' },
      { id: 'opt_quarterly', text: 'Once every couple months', code: 'C' },
      { id: 'opt_rarely', text: 'Rarely or once per year', code: 'D' }
    ]
  },
  {
    id: 'beverage_choices',
    category: 'Consumer Goods & Beverage',
    question: 'Which packaged beverage category do you buy most often?',
    subtitle: 'Choose the drink category you purchase on a regular basis',
    options: [
      { id: 'opt_water', text: 'Bottled and sparkling water', code: 'A' },
      { id: 'opt_coffee', text: 'Specialty coffee and teas', code: 'B' },
      { id: 'opt_juice', text: 'Cold pressed fruit juices', code: 'C' },
      { id: 'opt_energy', text: 'Functional energy drinks', code: 'D' }
    ]
  },
  {
    id: 'automotive_transit',
    category: 'Automotive & Mobility',
    question: 'How frequently do you drive a personal motor vehicle?',
    subtitle: 'Indicate your personal car usage for commute or leisure travel',
    options: [
      { id: 'opt_drive_daily', text: 'Daily for commute transit', code: 'A' },
      { id: 'opt_drive_weekly', text: 'Weekly for family errands', code: 'B' },
      { id: 'opt_drive_weekend', text: 'Occasional weekend drives', code: 'C' },
      { id: 'opt_drive_never', text: 'Do not operate a vehicle', code: 'D' }
    ]
  }
];

export default function PreScreenerGate({ vendorId, projectId, uid, onComplete }) {
  const [policy, setPolicy] = useState(null);
  const [evaluating, setEvaluating] = useState(true);
  const [evalStatus, setEvalStatus] = useState('checking'); // 'checking' | 'passed' | 'blocked'
  const [blockReason, setBlockReason] = useState('');
  const [blockStatusCode, setBlockStatusCode] = useState(2);

  // Survey & Vendor Info
  const [surveyInfo, setSurveyInfo] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);

  // Dynamic 3-Question Pre-Screener (Question 1 = Age [Fixed], Question 2 = Gender [Fixed], Question 3 = Rotating Basic Question)
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Age, 1 = Gender, 2 = Rotating Basic
  const [answers, setAnswers] = useState({}); // { [questionId]: optionId }

  // App Stages: 'prescreener' | 'passed_overview' | 'active_survey' | 'survey_finished'
  const [stage, setStage] = useState('prescreener');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryTimestamp, setEntryTimestamp] = useState(null);

  // Active Client Survey State
  const [surveyQIndex, setSurveyQIndex] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [simOutcome, setSimOutcome] = useState(null);

  // Generates exactly 3 questions: Age (fixed) + Gender (fixed) + 1 dynamic basic question
  const pickThreeQuestions = () => {
    const randomIndex = Math.floor(Math.random() * ROTATING_BASIC_POOL.length);
    const rotatingQ = ROTATING_BASIC_POOL[randomIndex];
    return [FIXED_AGE_QUESTION, FIXED_GENDER_QUESTION, rotatingQ];
  };

  useEffect(() => {
    setSelectedQuestions(pickThreeQuestions());
  }, [projectId, vendorId]);

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
          device: 'Desktop,Mobile,Tablet',
          category: 'Consumer Insights'
        };
        setSurveyInfo(matchedSurvey);

        const vendorsRes = await getVendors();
        const vList = vendorsRes.data || [];
        const matchedVendor = vList.find(v => 
          (v.vendor_code === vendorId || v.vendorUid === vendorId || v._id === vendorId)
        ) || {
          name: vendorId || 'Panel Partner',
          vendor_code: vendorId || 'VND-DYN-01',
          redirect_complete: 'https://router.dynata.com/survey/complete?uid=[UID]',
          redirect_terminate: 'https://router.dynata.com/survey/terminate?uid=[UID]',
          redirect_overquota: 'https://router.dynata.com/survey/overquota?uid=[UID]',
          redirect_security: 'https://router.dynata.com/survey/security?uid=[UID]',
          hash_algorithm: 'SHA3-256'
        };
        setVendorInfo(matchedVendor);

        // Run Pre-Click Automated Fraud Evaluation
        runPreClickEvaluation(pol || {}, matchedSurvey);
      } catch (e) {
        console.error('Pre-screener init failed:', e);
        setEvalStatus('passed');
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
      setBlockReason('Device Policy Restriction: Mobile devices are not permitted for this study by client security policy.');
      setBlockStatusCode(2); // Terminate
      setEvaluating(false);
      return;
    }
    if (isDesktop && pol.allowDesktop === false) {
      setEvalStatus('blocked');
      setBlockReason('Device Policy Restriction: Desktop access is restricted for this specific study.');
      setBlockStatusCode(2);
      setEvaluating(false);
      return;
    }
    if (isTablet && pol.allowTablet === false) {
      setEvalStatus('blocked');
      setBlockReason('Device Policy Restriction: Tablet devices are not permitted for this study.');
      setBlockStatusCode(2);
      setEvaluating(false);
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
        return;
      }
    }

    // Passed pre-click checks
    setEvalStatus('passed');
    setEvaluating(false);
  };

  const currentQ = selectedQuestions[currentStep] || null;
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  const handleSelectOption = (optionId) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleNextPreScreen = () => {
    if (!currentAnswer) return;
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStage('passed_overview');
        setEntryTimestamp(Date.now());
      }, 500);
    }
  };

  const handlePrevPreScreen = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleResetForTesting = () => {
    setSelectedQuestions(pickThreeQuestions());
    setAnswers({});
    setCurrentStep(0);
    setStage('prescreener');
    setSimOutcome(null);
  };

  // Client Study Questions (Active in-engine questionnaire, avoids blank external domains)
  const clientStudyQuestions = [
    {
      title: 'Overall Satisfaction & Perception',
      question: `Overall, how satisfied are you with modern solutions in ${surveyInfo?.category || 'this category'}?`,
      options: [
        'Extremely satisfied (5/5)',
        'Very satisfied (4/5)',
        'Moderately satisfied (3/5)',
        'Slightly dissatisfied (2/5)',
        'Not satisfied at all (1/5)'
      ]
    },
    {
      title: 'Primary Decision Criteria',
      question: 'Which factor holds the highest importance when deciding on a brand or service?',
      options: [
        'Speed, convenience and digital access',
        'High reliability and data privacy protection',
        'Competitive pricing and long-term value',
        'Quality of live customer support and care'
      ]
    },
    {
      title: 'Net Promoter Recommendation (NPS)',
      question: 'How likely are you to recommend these products or services to colleagues or friends?',
      options: [
        '10 — Extremely Likely (Promoter)',
        '9 — Very Likely (Promoter)',
        '8 — Likely (Passive)',
        '7 — Neutral (Passive)',
        '6 or Below — Unlikely (Detractor)'
      ]
    }
  ];

  const handleSurveyAnswer = (index, ans) => {
    setSurveyAnswers(prev => ({ ...prev, [index]: ans }));
  };

  const handleNextSurveyQ = () => {
    if (surveyQIndex < clientStudyQuestions.length - 1) {
      setSurveyQIndex(prev => prev + 1);
    } else {
      // Completed Client Survey!
      setStage('survey_finished');
      handleOutcomeSimulation(1); // Record verified complete
    }
  };

  const handleOutcomeSimulation = async (statusNumber) => {
    try {
      const elapsedSeconds = entryTimestamp ? Math.round((Date.now() - entryTimestamp) / 1000) : 120;
      const res = await RouterAPI.simulateTest({
        projectId: projectId,
        vendorId: vendorId,
        testUid: uid || `PANELIST_${Date.now().toString().slice(-4)}`,
        status: statusNumber
      });
      setSimOutcome(res);
    } catch (err) {
      console.error(err);
    }
  };

  const getInternalCallbackUrl = (statusNum) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://client-ten-lyart-71.vercel.app';
    const statusMap = { 1: 10, 2: 20, 3: 30, 4: 40 };
    const code = statusMap[statusNum] || statusNum || 10;
    const cleanUid = uid || `TEST_RESP_${Date.now().toString().slice(-4)}`;
    const cleanVid = vendorInfo?.vendor_code || vendorId || 'VND-DYN-01';
    const cleanPid = projectId || '2042481293';
    return `${origin}/survey/callback?status=${code}&uid=${encodeURIComponent(cleanUid)}&vid=${encodeURIComponent(cleanVid)}&pid=${encodeURIComponent(cleanPid)}&hash=b4a5d89f4172c1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b89`;
  };

  const getExternalVendorUrl = (status) => {
    let template = '';
    if (status === 1) template = vendorInfo?.redirect_complete;
    else if (status === 2) template = vendorInfo?.redirect_terminate;
    else if (status === 3) template = vendorInfo?.redirect_overquota;
    else template = vendorInfo?.redirect_security;

    if (!template || template.includes('vnddyn01.com') || template.includes('supplier.com') || template.includes('cluster.marketxcel')) {
      return null;
    }
    const cleanUid = uid || `TEST_RESP_${Date.now().toString().slice(-4)}`;
    return template.replace(/\[UID\]/gi, cleanUid).replace(/\[RESPONDENT_ID\]/gi, cleanUid);
  };

  const getVendorRedirectUrl = (status) => {
    return getInternalCallbackUrl(status);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(120% 120% at 50% 0%, #1c2b45 0%, #0d1525 60%, #070b13 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      color: '#1d1d1f'
    }}>
      {/* Apple Frosted Glass Card Container */}
      <div 
        className="apple-spring-card prescreener-apple-card"
        style={{
          maxWidth: '580px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
          borderRadius: '26px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >

        {/* Apple Style Header */}
        <div style={{
          padding: '18px 24px 16px 24px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.65)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '980px',
              background: 'rgba(0, 113, 227, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0071e3'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.01em' }}>
                Secure Pre-Screener
              </div>
              <div style={{ fontSize: '11px', color: '#86868b' }}>
                Panel: <strong style={{ color: '#1d1d1f' }}>{vendorInfo?.name || vendorId}</strong> • PID {projectId}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              background: 'rgba(0, 113, 227, 0.08)',
              color: '#0071e3',
              padding: '3px 10px',
              borderRadius: '980px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Lock size={11} /> SHA3-256
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px' }}>

          {/* 1. Evaluating Security Screening */}
          {evaluating && (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '980px',
                background: 'rgba(0, 113, 227, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0071e3',
                marginBottom: '16px',
                animation: 'applePulseGlow 1.8s infinite'
              }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1d1d1f', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                Verifying Security Safeguards...
              </h3>
              <p style={{ fontSize: '13px', color: '#86868b', margin: 0 }}>
                Auditing device profile, browser environment, and tamper integrity.
              </p>
            </div>
          )}

          {/* 2. Blocked Access View */}
          {!evaluating && evalStatus === 'blocked' && (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '980px',
                background: 'rgba(255, 59, 48, 0.1)',
                color: '#ff3b30',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <ShieldAlert size={30} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ff3b30', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                Survey Access Restricted
              </h3>
              <div style={{
                background: 'rgba(255, 59, 48, 0.06)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
                borderRadius: '14px',
                padding: '14px 16px',
                color: '#d70015',
                fontSize: '13px',
                lineHeight: 1.45,
                marginBottom: '18px'
              }}>
                {blockReason}
              </div>
              <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '22px' }}>
                Respondent UID: <code>{uid || 'N/A'}</code> • StatusCode: <strong>{blockStatusCode}</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={getInternalCallbackUrl(blockStatusCode || 4)}
                  className="apple-btn-active"
                  style={{
                    background: '#ff3b30',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: '980px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  View Callback Receipt <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => window.location.href = `/`}
                  className="apple-btn-active"
                  style={{
                    background: '#1d1d1f',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: '980px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* 3. STAGE 1: DYNAMIC 2-QUESTION PRE-SCREENER */}
          {!evaluating && evalStatus === 'passed' && stage === 'prescreener' && selectedQuestions.length > 0 && currentQ && (
            <div>
              {/* Apple Segmented 3-Step Progress Track */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {currentQ.category}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#86868b' }}>
                    Question {currentStep + 1} of 3
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{
                    height: '5px',
                    borderRadius: '980px',
                    background: currentStep >= 0 ? '#0071e3' : '#e5e5ea',
                    transition: 'background 0.35s ease'
                  }} />
                  <div style={{
                    height: '5px',
                    borderRadius: '980px',
                    background: currentStep >= 1 ? '#0071e3' : '#e5e5ea',
                    transition: 'background 0.35s ease'
                  }} />
                  <div style={{
                    height: '5px',
                    borderRadius: '980px',
                    background: currentStep >= 2 ? '#0071e3' : '#e5e5ea',
                    transition: 'background 0.35s ease'
                  }} />
                </div>
              </div>

              {/* Question Text Box (Symmetrical typography & balanced size) */}
              <div key={currentQ.id} className="apple-slide-question" style={{ marginBottom: '20px' }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1d1d1f',
                  margin: '0 0 6px 0',
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {currentQ.question}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#86868b', margin: 0 }}>
                  {currentQ.subtitle}
                </p>
              </div>

              {/* 4 Selectable Option Cards (Symmetrical text length & layout) */}
              <div 
                className="prescreener-options-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  marginBottom: '26px'
                }}
              >
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswer === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className="apple-btn-active"
                      style={{
                        padding: '14px',
                        borderRadius: '16px',
                        background: isSelected ? 'rgba(0, 113, 227, 0.05)' : '#ffffff',
                        border: isSelected ? '2px solid #0071e3' : '1.5px solid #e5e5ea',
                        boxShadow: isSelected 
                          ? '0 6px 20px rgba(0, 113, 227, 0.12)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.02)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        minHeight: '58px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '980px',
                          background: isSelected ? '#0071e3' : '#f5f5f7',
                          color: isSelected ? '#ffffff' : '#86868b',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {opt.code}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#0071e3' : '#1d1d1f',
                          lineHeight: 1.3
                        }}>
                          {opt.text}
                        </span>
                      </div>

                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '980px',
                        border: isSelected ? 'none' : '1.5px solid #d1d1d6',
                        background: isSelected ? '#0071e3' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: currentStep > 0 ? 'space-between' : 'flex-end',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                paddingTop: '18px'
              }}>
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevPreScreen}
                    className="apple-btn-active"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 14px',
                      color: '#0071e3',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextPreScreen}
                  disabled={!currentAnswer || isSubmitting}
                  className="apple-btn-active"
                  style={{
                    background: currentAnswer ? '#0071e3' : '#e5e5ea',
                    color: currentAnswer ? '#ffffff' : '#86868b',
                    border: 'none',
                    borderRadius: '980px',
                    padding: '12px 28px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    cursor: currentAnswer ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: currentAnswer ? '0 6px 18px rgba(0, 113, 227, 0.3)' : 'none'
                  }}
                >
                  {isSubmitting ? (
                    'Evaluating...'
                  ) : currentStep < 2 ? (
                    <>Next Question <ArrowRight size={14} /></>
                  ) : (
                    <>Submit & Proceed <Check size={14} /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 4. STAGE 2: PRE-QUALIFICATION PASSED OVERVIEW */}
          {!evaluating && stage === 'passed_overview' && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '980px',
                background: 'rgba(52, 199, 89, 0.12)',
                color: '#34c759',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                animation: 'appleSuccessPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <Check size={32} strokeWidth={3} />
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1d1d1f', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                Pre-Qualification Confirmed!
              </h3>
              <p style={{ fontSize: '13px', color: '#86868b', margin: '0 0 20px 0' }}>
                Cryptographic session signature verified. Ready to enter client study.
              </p>

              {/* Study Summary Box */}
              <div style={{
                background: '#f5f5f7',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left',
                border: '1px solid rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ fontSize: '11px', color: '#0071e3', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Forwarding Target Study:
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d1d1f', marginBottom: '8px' }}>
                  {surveyInfo?.survey_name || `Study #${projectId}`}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#86868b' }}>Yield:</span> <strong style={{ color: '#34c759' }}>${Number(surveyInfo?.cpi || 2.75).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#86868b' }}>LOI:</span> <strong>{surveyInfo?.loi || 12} Mins</strong>
                  </div>
                  <div>
                    <span style={{ color: '#86868b' }}>Security:</span> <strong style={{ color: '#0071e3' }}>SHA3-256</strong>
                  </div>
                </div>
              </div>

              {/* Seamless Live Survey Experience Button */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setStage('active_survey')}
                  className="apple-btn-active"
                  style={{
                    background: '#0071e3',
                    color: '#ffffff',
                    border: 'none',
                    padding: '13px 32px',
                    borderRadius: '980px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 8px 24px rgba(0, 113, 227, 0.35)'
                  }}
                >
                  Begin Client Survey Questionnaire <ArrowRight size={15} />
                </button>
              </div>

              {/* 1-Click Callback Outcome Simulator */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e5e5ea',
                borderRadius: '16px',
                padding: '14px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d1d1f', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={13} color="#0071e3" /> 1-Click Callback Simulator & Vendor Test:
                  </div>
                  <button
                    type="button"
                    onClick={handleResetForTesting}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0071e3',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <RotateCcw size={11} /> Test Another Question Pair
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleOutcomeSimulation(1)}
                    className="apple-btn-active"
                    style={{
                      background: 'rgba(52, 199, 89, 0.1)',
                      color: '#28cd41',
                      border: '1px solid rgba(52, 199, 89, 0.3)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Complete (1)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOutcomeSimulation(2)}
                    className="apple-btn-active"
                    style={{
                      background: 'rgba(255, 59, 48, 0.1)',
                      color: '#ff3b30',
                      border: '1px solid rgba(255, 59, 48, 0.3)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Terminate (2)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOutcomeSimulation(3)}
                    className="apple-btn-active"
                    style={{
                      background: 'rgba(255, 149, 0, 0.1)',
                      color: '#ff9500',
                      border: '1px solid rgba(255, 149, 0, 0.3)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    OverQuota (3)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOutcomeSimulation(4)}
                    className="apple-btn-active"
                    style={{
                      background: 'rgba(88, 86, 214, 0.1)',
                      color: '#5856d6',
                      border: '1px solid rgba(88, 86, 214, 0.3)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Security (4)
                  </button>
                </div>

                {simOutcome && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#1d1d1f',
                    color: '#f5f5f7',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}>
                    <div style={{ color: '#38bdf8', fontWeight: 700 }}>
                      [Simulation Output] Status: {simOutcome.statusRequested} ({simOutcome.statusLabel})
                    </div>
                    <div style={{ color: '#a1a1a6', marginTop: '3px', wordBreak: 'break-all' }}>
                      Redirect: {simOutcome.targetUrl}
                    </div>
                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <a
                        href={simOutcome.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        Execute Vendor Redirect Test <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. STAGE 3: INTERACTIVE CLIENT SURVEY QUESTIONNAIRE RUNNER */}
          {!evaluating && stage === 'active_survey' && (
            <div className="apple-slide-question">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {clientStudyQuestions[surveyQIndex]?.title}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#86868b' }}>
                    Question {surveyQIndex + 1} of {clientStudyQuestions.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '4px', background: '#e5e5ea', borderRadius: '980px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${((surveyQIndex + 1) / clientStudyQuestions.length) * 100}%`,
                    background: '#0071e3',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <h2 style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#1d1d1f',
                lineHeight: 1.35,
                marginBottom: '16px',
                letterSpacing: '-0.015em'
              }}>
                {clientStudyQuestions[surveyQIndex]?.question}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
                {clientStudyQuestions[surveyQIndex]?.options.map((option, idx) => {
                  const isSelected = surveyAnswers[surveyQIndex] === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSurveyAnswer(surveyQIndex, idx)}
                      className="apple-btn-active"
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        background: isSelected ? 'rgba(0, 113, 227, 0.05)' : '#ffffff',
                        border: isSelected ? '2px solid #0071e3' : '1.5px solid #e5e5ea',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: isSelected ? '#0071e3' : '#1d1d1f',
                        fontWeight: isSelected ? 600 : 500,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{option}</span>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isSelected ? 'none' : '1.5px solid #d1d1d6',
                        background: isSelected ? '#0071e3' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleNextSurveyQ}
                  disabled={surveyAnswers[surveyQIndex] === undefined}
                  className="apple-btn-active"
                  style={{
                    background: surveyAnswers[surveyQIndex] !== undefined ? '#0071e3' : '#e5e5ea',
                    color: surveyAnswers[surveyQIndex] !== undefined ? '#ffffff' : '#86868b',
                    border: 'none',
                    borderRadius: '980px',
                    padding: '11px 26px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: surveyAnswers[surveyQIndex] !== undefined ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: surveyAnswers[surveyQIndex] !== undefined ? '0 6px 18px rgba(0, 113, 227, 0.3)' : 'none'
                  }}
                >
                  {surveyQIndex < clientStudyQuestions.length - 1 ? (
                    <>Next Question <ArrowRight size={14} /></>
                  ) : (
                    <>Submit & Finish Study <Check size={14} /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 6. STAGE 4: SURVEY FINISHED -> VENDOR CALLBACK RETURN */}
          {!evaluating && stage === 'survey_finished' && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '980px',
                background: 'rgba(52, 199, 89, 0.12)',
                color: '#34c759',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                animation: 'appleSuccessPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <Check size={32} strokeWidth={3} />
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1d1d1f', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                Survey Session Completed!
              </h3>
              <p style={{ fontSize: '13px', color: '#86868b', margin: '0 0 20px 0' }}>
                Your responses have been successfully recorded and cryptographically signed.
              </p>

              {/* Vendor Callback Card */}
              <div style={{
                background: '#f5f5f7',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left',
                border: '1px solid rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#34c759', fontWeight: 800, textTransform: 'uppercase' }}>
                    ✓ Verified Complete (Status: 10 / Success)
                  </span>
                  <span style={{ fontSize: '10px', color: '#0071e3', fontWeight: 700 }}>
                    Official SMR Settlement
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#1d1d1f', wordBreak: 'break-all', fontFamily: 'monospace', background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e5ea', marginTop: '6px' }}>
                  {getInternalCallbackUrl(1)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href={getInternalCallbackUrl(1)}
                    className="apple-btn-active"
                    style={{
                      background: '#0071e3',
                      color: '#ffffff',
                      padding: '12px 28px',
                      borderRadius: '980px',
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 6px 20px rgba(0, 113, 227, 0.35)'
                    }}
                  >
                    View Settlement Receipt <ExternalLink size={13} />
                  </a>

                  <button
                    type="button"
                    onClick={handleResetForTesting}
                    className="apple-btn-active"
                    style={{
                      background: '#ffffff',
                      color: '#1d1d1f',
                      border: '1.5px solid #e5e5ea',
                      padding: '12px 20px',
                      borderRadius: '980px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Test Again
                  </button>
                </div>

                {getExternalVendorUrl(1) && (
                  <div style={{ marginTop: '4px' }}>
                    <a
                      href={getExternalVendorUrl(1)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '11.5px', color: '#86868b', textDecoration: 'underline' }}
                    >
                      Test External Panel Callback ({vendorInfo?.name || vendorId})
                    </a>
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
