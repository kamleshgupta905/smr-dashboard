import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Monitor, Tablet, CheckCircle, AlertOctagon, Save, RefreshCw, Eye, Lock, Globe, Cpu } from 'lucide-react';
import { SecurityAPI } from '../services/api';

export default function SecurityFraudPage() {
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

        <div className="title-box-actions">
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

      </div>
    </div>
  );
}
