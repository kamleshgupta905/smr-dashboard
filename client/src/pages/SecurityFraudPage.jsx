import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Tablet, 
  CheckCircle, 
  AlertOctagon, 
  Save, 
  RefreshCw, 
  Eye, 
  Lock, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  AlertTriangle, 
  Play, 
  Sparkles 
} from 'lucide-react';
import { SecurityAPI } from '../services/api';

export default function SecurityFraudPage({ onLaunchPreScreener }) {
  const [policy, setPolicy] = useState({
    preScreenEnabled: true,
    dynamicThanksUrl: true,
    excludeDuplicates: true,
    geoLocationValidation: true,
    uniqueIpLimit: 1,
    speederCheck: true,
    speederThresholdPercent: 0.3,
    lhProtection: true,
    excludeGroup: false,
    fraudCops: true,
    browserSecurity: true,
    vpnDetection: true,
    botProtection: true,
    verifyEmail: true,
    rocSecurity: false,
    motionDetection: false,
    textAnalyzer: true,
    offLocationHour: false,
    allowDesktop: true,
    allowMobile: true,
    allowTablet: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live Fraud Policy Simulation State
  const [simDevice, setSimDevice] = useState('mobile');
  const [simUserType, setSimUserType] = useState('human');
  const [simDurationSeconds, setSimDurationSeconds] = useState(45);
  const [simTestOutput, setSimTestOutput] = useState(null);

  useEffect(() => {
    SecurityAPI.getPolicy()
      .then((data) => {
        if (data) setPolicy(prev => ({ ...prev, ...data }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => {
    setPolicy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await SecurityAPI.updatePolicy(policy);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save security policy:', err);
    } finally {
      setSaving(false);
    }
  };

  const runLivePolicyEvaluation = () => {
    // 1. Device check
    if (simDevice === 'mobile' && policy.allowMobile === false) {
      setSimTestOutput({
        verdict: 'BLOCKED',
        statusCode: 2,
        reason: 'Device Policy Violation: Mobile device access is disabled in active policy.',
        color: '#EF4444',
        rule: 'Device Compatibility Filter'
      });
      return;
    }
    if (simDevice === 'desktop' && policy.allowDesktop === false) {
      setSimTestOutput({
        verdict: 'BLOCKED',
        statusCode: 2,
        reason: 'Device Policy Violation: Desktop access is disabled in active policy.',
        color: '#EF4444',
        rule: 'Device Compatibility Filter'
      });
      return;
    }
    if (simDevice === 'tablet' && policy.allowTablet === false) {
      setSimTestOutput({
        verdict: 'BLOCKED',
        statusCode: 2,
        reason: 'Device Policy Violation: Tablet access is disabled in active policy.',
        color: '#EF4444',
        rule: 'Device Compatibility Filter'
      });
      return;
    }

    // 2. Bot / Crawler check
    if (simUserType === 'bot' && policy.botProtection !== false) {
      setSimTestOutput({
        verdict: 'BLOCKED',
        statusCode: 4,
        reason: 'Security Threat Detected: Headless crawler / automated bot script blocked by Bot Protection Engine.',
        color: '#DC2626',
        rule: 'Bot Protection Suite'
      });
      return;
    }

    // 3. Speeder check (e.g. 10 min LOI -> min 180s)
    const loiMin = 10;
    const minThreshold = (loiMin * 60) * (policy.speederThresholdPercent || 0.3);
    if (policy.speederCheck !== false && simDurationSeconds < minThreshold) {
      setSimTestOutput({
        verdict: 'FLAGGED_SPEEDER',
        statusCode: 4,
        reason: `Speeder Quality Violation: Session duration (${simDurationSeconds}s) is below 30% of stated LOI (${minThreshold}s). Flagged as Security Terminate.`,
        color: '#F59E0B',
        rule: 'Speeder Detection Engine'
      });
      return;
    }

    // 4. Pre-Screening match
    if (policy.preScreenEnabled !== false) {
      setSimTestOutput({
        verdict: 'PRE_SCREEN_REQUIRED',
        statusCode: 1,
        reason: 'Pre-Click Safeguards Passed! Respondent forwarded to demographic Pre-Screener questionnaire before client survey.',
        color: '#2563EB',
        rule: 'Pre-Screen Gate Active'
      });
      return;
    }

    // 5. Complete Pass
    setSimTestOutput({
      verdict: 'PASSED_DIRECT',
      statusCode: 1,
      reason: 'All active security & fraud safeguards satisfied! Direct survey access granted with SHA3-256 signature.',
      color: '#10B981',
      rule: 'Direct Inbound Access'
    });
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: '#ffffff',
      border: '1px solid #e3ebf6',
      borderRadius: '6px',
      marginBottom: '8px',
      transition: 'border-color 0.15s ease'
    }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1d2c48' }}>{label}</div>
        {description && <div style={{ fontSize: '11.5px', color: '#8997bd' }}>{description}</div>}
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer', margin: 0 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: checked ? '#1761fd' : '#e3ebf6',
          borderRadius: '20px',
          transition: '.25s ease',
        }}>
          <span style={{
            position: 'absolute',
            height: '16px',
            width: '16px',
            left: checked ? '20px' : '3px',
            bottom: '3px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: '.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
          }} />
        </span>
      </label>
    </div>
  );

  return (
    <div>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Security</span>
            <span className="separator">/</span>
            <span className="current">Fraud Engine</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Security & Fraud Screening Engine
            </h4>
            <span className="badge-soft-success" style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span className="pulse-dot" />
              Active Safeguards
            </span>
          </div>
        </div>

        <div className="title-box-actions" style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onLaunchPreScreener && onLaunchPreScreener({ vendorId: 'VND-DYN-01', projectId: '2042481293', uid: 'TEST_PRESCREEN_GATE' })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <ExternalLink size={14} /> Launch Pre-Screener Live Gate
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, padding: '7px 16px', borderRadius: '4px' }}
          >
            {saveSuccess ? <CheckCircle size={15} color="#ffffff" /> : <Save size={14} />}
            {saving ? 'Saving...' : saveSuccess ? 'Policies Applied!' : 'Save Fraud Policies'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* Section 1: Pre Screen & Thanks URL */}
        <div className="report-card" style={{ margin: 0, padding: 0 }}>
          <div className="report-card-header">
            <h4 className="report-card-title">
              <Lock size={14} color="#1761fd" /> Pre Screen & Thanks URL
            </h4>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <ToggleSwitch
              label="Pre Screen"
              description="Verify demographic match before sending respondent to client survey"
              checked={policy.preScreenEnabled}
              onChange={() => handleToggle('preScreenEnabled')}
            />
            <ToggleSwitch
              label="Dynamic Thanks URL"
              description="Allow dynamic vendor callback query string propagation"
              checked={policy.dynamicThanksUrl}
              onChange={() => handleToggle('dynamicThanksUrl')}
            />
          </div>
        </div>

        {/* Section 2: Set-up Fraud Screening */}
        <div className="report-card" style={{ margin: 0, padding: 0 }}>
          <div className="report-card-header">
            <h4 className="report-card-title">
              <AlertOctagon size={14} color="#f5325c" /> Set-up Fraud Screening
            </h4>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <ToggleSwitch
              label="Exclude Duplicate Leads"
              description="Prevent identical respondent IDs from entering multiple times"
              checked={policy.excludeDuplicates}
              onChange={() => handleToggle('excludeDuplicates')}
            />
            <ToggleSwitch
              label="Geo Location Validation"
              description="Ensure respondent IP country matches target survey market"
              checked={policy.geoLocationValidation}
              onChange={() => handleToggle('geoLocationValidation')}
            />
            <ToggleSwitch
              label="Unique IP Enforcement (1 Max)"
              description="Block multiple completes originating from the same IP address"
              checked={policy.uniqueIpLimit === 1}
              onChange={() => setPolicy(p => ({ ...p, uniqueIpLimit: p.uniqueIpLimit === 1 ? 0 : 1 }))}
            />
            <ToggleSwitch
              label="Speeder Check (LOI Threshold)"
              description="Auto-flag and reject finishes under 30% of average duration"
              checked={policy.speederCheck}
              onChange={() => handleToggle('speederCheck')}
            />
            <ToggleSwitch
              label="LH Protection (Honeypot Trap)"
              description="Automated link manipulation detection"
              checked={policy.lhProtection}
              onChange={() => handleToggle('lhProtection')}
            />
          </div>
        </div>

        {/* Section 3: Security & Fraud Cops */}
        <div className="report-card" style={{ margin: 0, padding: 0 }}>
          <div className="report-card-header">
            <h4 className="report-card-title">
              <Cpu size={14} color="#1761fd" /> Security & Fraud Cops Suite
            </h4>
          </div>
          <div style={{ padding: '16px 20px' }}>
          <ToggleSwitch
            label="Fraud Cops / Research Defender"
            description="AI behavioral evaluation of panelist session authenticity"
            checked={policy.fraudCops}
            onChange={() => handleToggle('fraudCops')}
          />
          <ToggleSwitch
            label="Browser Security & Fingerprinting"
            description="Block headless browsers, automated scripts, and emulator spoofing"
            checked={policy.browserSecurity}
            onChange={() => handleToggle('browserSecurity')}
          />
          <ToggleSwitch
            label="VPN & Datacenter Proxy Detection"
            description="Blacklist Tor exit nodes, AWS, DigitalOcean and known proxy IP ranges"
            checked={policy.vpnDetection}
            onChange={() => handleToggle('vpnDetection')}
          />
          <ToggleSwitch
            label="Bot Protection"
            description="Challenge abnormal keystroke and click telemetry"
            checked={policy.botProtection}
            onChange={() => handleToggle('botProtection')}
          />
            <ToggleSwitch
              label="Text Quality Analyzer"
              description="Check open-ended survey responses for gibberish and AI generation"
              checked={policy.textAnalyzer}
              onChange={() => handleToggle('textAnalyzer')}
            />
          </div>
        </div>

        {/* Section 4: Device Filtering */}
        <div className="report-card" style={{ margin: 0, padding: 0 }}>
          <div className="report-card-header">
            <h4 className="report-card-title">
              <Monitor size={14} color="#03d87f" /> Device Compatibility Filter
            </h4>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#8997bd' }}>
              Select allowed device categories across active routing channels:
            </p>

            <ToggleSwitch
              label="🖥️ Desktop Studies"
              description="Allow Windows, macOS, Linux desktop and laptop users"
              checked={policy.allowDesktop}
              onChange={() => handleToggle('allowDesktop')}
            />
            <ToggleSwitch
              label="📱 Mobile Studies"
              description="Allow iOS and Android smartphone users"
              checked={policy.allowMobile}
              onChange={() => handleToggle('allowMobile')}
            />
            <ToggleSwitch
              label="📟 Tablet Studies"
              description="Allow iPad and Android tablet users"
              checked={policy.allowTablet}
              onChange={() => handleToggle('allowTablet')}
            />
          </div>
        </div>

        {/* Section 5: Interactive Live Fraud Policy Rule Evaluator & Simulator */}
        <div className="report-card" style={{ gridColumn: '1 / -1', margin: 0, padding: 0, border: '1px solid #CBD5E1' }}>
          <div className="report-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#16A34A" />
              <h4 className="report-card-title" style={{ margin: 0 }}>
                Live Fraud Screening Engine Tester & Rule Evaluation
              </h4>
            </div>
            <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
              Live Rule Engine Active
            </span>
          </div>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px 0' }}>
              Test how the SMR Fraud Screening Engine evaluates inbound panel traffic based on your configured switches in real time:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Simulated Visitor Device:
                </label>
                <select
                  value={simDevice}
                  onChange={(e) => setSimDevice(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                >
                  <option value="mobile">📱 Mobile Smartphone</option>
                  <option value="desktop">🖥️ Desktop / Laptop</option>
                  <option value="tablet">📟 Tablet</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Visitor Client Signature:
                </label>
                <select
                  value={simUserType}
                  onChange={(e) => setSimUserType(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                >
                  <option value="human">👤 Real Human User (Normal Browser)</option>
                  <option value="bot">🤖 Automated Headless Bot (Crawler / Script)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Session Duration (LOI: 10m):
                </label>
                <select
                  value={simDurationSeconds}
                  onChange={(e) => setSimDurationSeconds(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                >
                  <option value={45}>⚡ 45 Seconds (Speeder Check Alert)</option>
                  <option value={120}>⏱️ 2 Minutes (Marginal)</option>
                  <option value={480}>✅ 8 Minutes (Normal Completion)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={runLivePolicyEvaluation}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Play size={14} /> Run Live Policy Evaluation
              </button>

              <button
                type="button"
                onClick={() => onLaunchPreScreener && onLaunchPreScreener({ vendorId: 'VND-DYN-01', projectId: '2042481293', uid: 'TEST_LIVE_GATE' })}
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} /> Launch Pre-Screener Live Questionnaire
              </button>
            </div>

            {/* Test Output Card */}
            {simTestOutput && (
              <div style={{
                background: '#0F172A',
                borderLeft: `4px solid ${simTestOutput.color}`,
                borderRadius: '8px',
                padding: '16px',
                color: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: simTestOutput.color }}>
                      EVALUATION RESULT: {simTestOutput.verdict}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                      Status Code: {simTestOutput.statusCode}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Triggered Rule: {simTestOutput.rule}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#E2E8F0', lineHeight: 1.5 }}>
                  {simTestOutput.reason}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
