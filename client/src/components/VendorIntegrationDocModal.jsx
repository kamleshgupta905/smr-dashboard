import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  X, 
  ShieldCheck, 
  Link2, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Zap,
  PlayCircle,
  HelpCircle,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import ModalPortal from './ModalPortal';

export default function VendorIntegrationDocModal({ isOpen, onClose, vendors = [] }) {
  const [activeTab, setActiveTab] = useState('links'); // 'links' | 'how_to_run' | 'management' | 'tester'
  const [copiedSection, setCopiedSection] = useState(null);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [showAdvancedTech, setShowAdvancedTech] = useState(false);

  // Interactive Test Link Generator State
  const defaultVendor = vendors.length > 0 ? (vendors[0].vendor_code || vendors[0].vendorUid || 'VND-DYN-01') : 'VND-DYN-01';
  const [testVendorId, setTestVendorId] = useState(defaultVendor);
  const [testProjectId, setTestProjectId] = useState('2042481293');
  const [testUid, setTestUid] = useState('TEST_SAMPLE_001');

  if (!isOpen) return null;

  const copyToClipboard = (text, sectionKey) => {
    navigator.clipboard.writeText(text);
    if (sectionKey === 'full_doc') {
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    } else {
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const SIMPLE_GUIDE_TEXT = `# VMH GROUP'S • SMR Platform Vendor Integration & Operations Guide

## 1. Survey Entry Link (How to send traffic to SMR):
https://api.vmhgroupsmr.com/vendor/auth/{VENDOR_CODE}/project/{PROJECT_ID}?uid=[RESPONDENT_ID]

Parameters:
- {VENDOR_CODE}: Your allocated Vendor ID (e.g. VND-DYN-01)
- {PROJECT_ID}: Survey Study ID (e.g. 2042481293)
- uid: Dynamic unique panelist tracking identifier ([RESPONDENT_ID])

## 2. The 4 Return Redirect Callbacks (Where SMR returns your panelists):
- Complete (Status 10): https://your-panel.com/callback/complete?uid=[UID] (Billable - 100% Agreed CPI)
- Terminate (Status 20): https://your-panel.com/callback/terminate?uid=[UID] (Criteria Mismatch)
- Overquota (Status 30): https://your-panel.com/callback/overquota?uid=[UID] (Quota Full)
- Security (Status 40): https://your-panel.com/callback/security?uid=[UID] (Duplicate IP / VPN / Speeder)

Note: [UID] will automatically be replaced with your panelist's original ID upon return.

## 3. How to Run (4-Step Quick Start):
Step 1: Obtain your Vendor Code from SMR Operations.
Step 2: Enter your 4 return URLs in SMR dashboard or provide them to your PM.
Step 3: Run a test click with uid=TEST_001 to verify callback redirection.
Step 4: Launch live panel traffic!
`;

  const downloadGuide = () => {
    const blob = new Blob([SIMPLE_GUIDE_TEXT], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'VMH_SMR_Vendor_Integration_Guide.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatedTestUrl = `https://api.vmhgroupsmr.com/vendor/auth/${encodeURIComponent(testVendorId || 'VND-DYN-01')}/project/${encodeURIComponent(testProjectId || '2042481293')}?uid=${encodeURIComponent(testUid || 'TEST_SAMPLE_001')}&test=1`;

  return (
    <ModalPortal>
      <div 
        className="modal-overlay" 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}
      >
        <div 
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
            border: '1px solid #CBD5E1',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8'
              }}>
                <BookOpen size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Vendor Integration & Operations Guide</span>
                  <span style={{ fontSize: '11px', background: '#0284C7', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    Official Spec
                  </span>
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Simple Links • Kaise Chalana Hai (Quick Start) • Vendor Management & Rules
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => copyToClipboard(SIMPLE_GUIDE_TEXT, 'full_doc')}
                style={{
                  background: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedDoc ? <Check size={14} color="#4ADE80" /> : <Copy size={14} />}
                <span>{copiedDoc ? 'Copied Guide!' : 'Copy Guide'}</span>
              </button>

              <button
                type="button"
                onClick={downloadGuide}
                style={{
                  background: '#0284C7',
                  border: '1px solid #0369A1',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>Download .MD</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Clean 4-Tab Navigation */}
          <div style={{
            display: 'flex',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '8px 20px 0 20px',
            gap: '8px',
            overflowX: 'auto'
          }}>
            {[
              { id: 'links', label: '1. Simple Links (Entry & Callbacks)', icon: Link2 },
              { id: 'how_to_run', label: '2. Kaise Chalana Hai (Quick Start)', icon: PlayCircle },
              { id: 'management', label: '3. Vendor Management & Rules', icon: Sliders },
              { id: 'tester', label: '4. Live Test Link Generator', icon: Zap },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #0284C7' : '3px solid transparent',
                    color: isActive ? '#0284C7' : '#64748B',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '13px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    whiteSpace: 'nowrap',
                    marginBottom: '-1px'
                  }}
                >
                  <Icon size={15} color={isActive ? '#0284C7' : '#64748B'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Content Body */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#FFFFFF', fontSize: '13px', color: '#1E293B' }}>
            
            {/* TAB 1: SIMPLE LINKS (ENTRY & CALLBACKS) */}
            {activeTab === 'links' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                {/* Intro summary banner */}
                <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={24} color="#0284C7" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '12.5px', color: '#0C4A6E', lineHeight: 1.5 }}>
                    <strong>Integration Principle:</strong> Vendor ko SMR ke saath integrate karne ke liye sirf <strong>2 cheezein</strong> chahiye:
                    <br />
                    1. <strong>Inbound Entry Link</strong> (Aap apne panelists ko SMR me bhejte hain)
                    <br />
                    2. <strong>4 Outbound Callbacks</strong> (SMR aapke panelists ko aapke platform par wapas bhejta hai)
                  </div>
                </div>

                {/* 1. Inbound Survey Entry Link */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284C7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>1</span>
                      <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                        Inbound Survey Entry Link (Vendor ➔ SMR Traffic)
                      </h4>
                    </div>
                    <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Panelist Entry Format
                    </span>
                  </div>

                  <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#64748B' }}>
                    Apne survey panelists ko is URL par bhejein. Har panelist ke liye <code>[RESPONDENT_ID]</code> ko unke unique ID se replace karein:
                  </p>

                  <div style={{
                    background: '#0F172A',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'monospace',
                    fontSize: '12.5px',
                    color: '#38BDF8',
                    wordBreak: 'break-all',
                    gap: '12px'
                  }}>
                    <span>https://api.vmhgroupsmr.com/vendor/auth/<strong style={{ color: '#FCD34D' }}>{'{VENDOR_CODE}'}</strong>/project/<strong style={{ color: '#4ADE80' }}>{'{PROJECT_ID}'}</strong>?uid=<strong style={{ color: '#F472B6' }}>[RESPONDENT_ID]</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://api.vmhgroupsmr.com/vendor/auth/{VENDOR_CODE}/project/{PROJECT_ID}?uid=[RESPONDENT_ID]', 'entry_link')}
                      style={{
                        background: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {copiedSection === 'entry_link' ? <Check size={12} color="#4ADE80" /> : <Copy size={12} />}
                      <span>{copiedSection === 'entry_link' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* 3 Parameter Explanations */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '12px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                      <strong style={{ color: '#D97706', fontSize: '11.5px', display: 'block' }}>{'{VENDOR_CODE}'}</strong>
                      <span style={{ fontSize: '11.5px', color: '#475569' }}>Aapka Vendor Code (Jaise: <code>VND-DYN-01</code> ya <code>VND-PSP-01</code>)</span>
                    </div>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                      <strong style={{ color: '#16A34A', fontSize: '11.5px', display: 'block' }}>{'{PROJECT_ID}'}</strong>
                      <span style={{ fontSize: '11.5px', color: '#475569' }}>SMR Survey ID (Jaise: <code>2042481293</code> ya <code>VMHPI000102026</code>)</span>
                    </div>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                      <strong style={{ color: '#DB2777', fontSize: '11.5px', display: 'block' }}>[RESPONDENT_ID]</strong>
                      <span style={{ fontSize: '11.5px', color: '#475569' }}>Panelist ka unique ID (Jaise: <code>RESP_881902</code>)</span>
                    </div>
                  </div>
                </div>

                {/* 2. Outbound Return Callbacks */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>2</span>
                      <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                        The 4 Return Callbacks (SMR ➔ Vendor Platform Redirects)
                      </h4>
                    </div>
                    <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      4 Standard Outcomes
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#64748B' }}>
                    Survey khatam hone par SMR router panelist ko aapke platform ke in 4 links par <strong>HTTP 302 redirect</strong> karega. Aap apne URLs me <code>[UID]</code> placeholder laga dein:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Complete */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', borderLeft: '4px solid #16A34A', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#166534', fontSize: '12.5px' }}>
                          🟢 1. Complete (Status 10) — Billable Complete
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#DCFCE7', padding: '1px 8px', borderRadius: '4px' }}>
                          100% Payout Credited
                        </span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0F172A', background: '#F8FAFC', padding: '6px 10px', borderRadius: '4px' }}>
                        https://your-panel.com/surveys/complete?uid=<span style={{ color: '#16A34A', fontWeight: 700 }}>[UID]</span>
                      </div>
                    </div>

                    {/* Terminate */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderLeft: '4px solid #DC2626', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#991B1B', fontSize: '12.5px' }}>
                          🔴 2. Terminate / Screenout (Status 20) — Criteria Mismatch
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', background: '#FEE2E2', padding: '1px 8px', borderRadius: '4px' }}>
                          Non-Billable
                        </span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0F172A', background: '#F8FAFC', padding: '6px 10px', borderRadius: '4px' }}>
                        https://your-panel.com/surveys/terminate?uid=<span style={{ color: '#DC2626', fontWeight: 700 }}>[UID]</span>
                      </div>
                    </div>

                    {/* Overquota */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderLeft: '4px solid #D97706', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#9A3412', fontSize: '12.5px' }}>
                          🟡 3. Overquota / Quota Full (Status 30) — Study Target Full
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#9A3412', background: '#FFEDD5', padding: '1px 8px', borderRadius: '4px' }}>
                          Non-Billable
                        </span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0F172A', background: '#F8FAFC', padding: '6px 10px', borderRadius: '4px' }}>
                        https://your-panel.com/surveys/overquota?uid=<span style={{ color: '#D97706', fontWeight: 700 }}>[UID]</span>
                      </div>
                    </div>

                    {/* Security */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E9D5FF', borderLeft: '4px solid #7C3AED', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#6B21A8', fontSize: '12.5px' }}>
                          🟣 4. Security / Fraud Reject (Status 40) — Duplicate IP / Speeder / VPN
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B21A8', background: '#F3E8FF', padding: '1px 8px', borderRadius: '4px' }}>
                          Disqualified
                        </span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0F172A', background: '#F8FAFC', padding: '6px 10px', borderRadius: '4px' }}>
                        https://your-panel.com/surveys/security?uid=<span style={{ color: '#7C3AED', fontWeight: 700 }}>[UID]</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: KAISE CHALANA HAI (HOW TO RUN / QUICK START) */}
            {activeTab === 'how_to_run' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '14px 16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlayCircle size={18} />
                    <span>How to Run Vendor Integration in 4 Simple Steps</span>
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#15803D' }}>
                    Kisi bhi technical coding ki zaroorat nahi hai. Yeh 4 simple steps follow karein aur 5 minute me live traffic start karein:
                  </p>
                </div>

                {/* 4 Step Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Step 1 */}
                  <div style={{ display: 'flex', gap: '14px', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284C7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                        Step 1: Apna Unique Vendor Code Lein
                      </h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                        SMR Operations team ya Dashboard ke <strong>Vendors</strong> page se apna unique <strong>Vendor Code</strong> lein (Jaise: <code>VND-DYN-01</code>). Yahi code aapke traffic ko identify karega.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ display: 'flex', gap: '14px', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                        Step 2: Apne 4 Return URLs Set Karein
                      </h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                        Apne panel software me Complete, Terminate, Overquota aur Security return URLs generate karein aur unhe SMR dashboard me save karein ya account manager ko share karein. In links me <code>[UID]</code> token zaroor hona chahiye.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ display: 'flex', gap: '14px', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                        Step 3: Test Link Run Karke Verify Karein
                      </h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                        Tab 4 (Test Link Generator) se ek test URL banayein jisme <code>uid=TEST_001&test=1</code> laga ho. Link par click karke dekhein ki pre-screener aur survey redirect sahi chal raha hai aur return aapke callback URL par ho raha hai.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div style={{ display: 'flex', gap: '14px', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                      4
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                        Step 4: Live Panel Traffic Start Karein
                      </h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                        Survey list se active Project ID lekar apne live panelists ko link share karein. Har click ka status real-time me <strong>Operations & Payouts ➔ Traffic Leads Stream</strong> me update hota rahega.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: VENDOR MANAGEMENT & RULES */}
            {activeTab === 'management' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={18} color="#16A34A" />
                    <span>Commercial Model & Payout Settlement</span>
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748B' }}>
                    Vendor payouts ka calculation kaise hota hai:
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Payout Formula</span>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A', marginTop: '4px' }}>
                        Completes × Agreed CPI
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px', display: 'block' }}>
                        Sirf verified status 10 (Complete) par payout banta hai. Terminate aur overquota non-billable hote hain.
                      </span>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Vendor Payments Page</span>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0284C7', marginTop: '4px' }}>
                        Auto-Calculated Reports
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px', display: 'block' }}>
                        Monthly billing, payable amounts aur invoice details automatically dashboard me generate hoti hain.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quality & Security Gates */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#0284C7" />
                    <span>Quality & Anti-Fraud Security Rules</span>
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                      <strong style={{ color: '#0F172A', fontSize: '12.5px', display: 'block' }}>Unique IP Restriction</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>
                        Ek IP address se 24 ghante ke andar sirf 1 attempt allow hota hai. Duplicate IP ko Status 40 (Security) par redirect kiya jata hai.
                      </p>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                      <strong style={{ color: '#0F172A', fontSize: '12.5px', display: 'block' }}>Speeder LOI Protection</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>
                        Agar panelist survey ko average Length of Interview (LOI) ke 30% se kam samay me complete karta hai, toh use bot/speeder mark kiya jata hai.
                      </p>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                      <strong style={{ color: '#0F172A', fontSize: '12.5px', display: 'block' }}>VPN & Proxy Filtering</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>
                        Automated datacenter IPs, anonymous proxies aur headless browsers ko pre-screener gate par hi block kar diya jata hai.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Waterfall & Routing Behavior */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowRight size={18} color="#D97706" />
                    <span>Auto-Waterfall Routing (Optional)</span>
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                    Agar kisi vendor ke panelist ko survey terminate ya overquota hota hai, toh SMR automatically panelist ko ek matching alternative survey me cascade (waterfall) kar sakta hai, jisse vendor ka completion rate aur revenue maximize hota hai.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: LIVE TEST LINK GENERATOR */}
            {activeTab === 'tester' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '14px 16px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} />
                    <span>Interactive Test Survey Link Generator</span>
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#1D4ED8' }}>
                    Apna Vendor Code aur Project ID daalein. System turant ek test entry link create kar dega jise aap ek click me test kar sakte hain:
                  </p>
                </div>

                {/* Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Vendor Code (vid):
                    </label>
                    <input
                      type="text"
                      value={testVendorId}
                      onChange={e => setTestVendorId(e.target.value.trim())}
                      placeholder="e.g. VND-DYN-01"
                      style={{ width: '100%', height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Project / Survey ID (pid):
                    </label>
                    <input
                      type="text"
                      value={testProjectId}
                      onChange={e => setTestProjectId(e.target.value.trim())}
                      placeholder="e.g. 2042481293"
                      style={{ width: '100%', height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Test Respondent ID (uid):
                    </label>
                    <input
                      type="text"
                      value={testUid}
                      onChange={e => setTestUid(e.target.value.trim())}
                      placeholder="e.g. TEST_SAMPLE_001"
                      style={{ width: '100%', height: '36px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                {/* Generated Test Link */}
                <div style={{ background: '#0F172A', borderRadius: '10px', padding: '16px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      Generated Live Test Entry URL:
                    </span>
                    <span style={{ fontSize: '11px', background: '#16A34A', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Ready to Test
                    </span>
                  </div>

                  <div style={{ fontFamily: 'monospace', fontSize: '12.5px', color: '#38BDF8', wordBreak: 'break-all', marginBottom: '14px', lineHeight: 1.5 }}>
                    {generatedTestUrl}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedTestUrl, 'test_link')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: '#334155',
                        border: '1px solid #475569',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {copiedSection === 'test_link' ? <Check size={14} color="#4ADE80" /> : <Copy size={14} />}
                      <span>{copiedSection === 'test_link' ? 'Copied Test Link!' : 'Copy Test Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.open(generatedTestUrl, '_blank')}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '6px',
                        background: '#0284C7',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(2, 132, 199, 0.4)'
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Test Survey (Open in New Tab)</span>
                    </button>
                  </div>
                </div>

                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Note:</strong> Test UIDs me <code>TEST_</code> prefix laga hone ke karan duplicate IP checks aur LOI speeder gates bypass ho jate hain, jisse aap bina kisi block ke testing kar sakte hain.
                  </span>
                </div>
              </div>
            )}

            {/* OPTIONAL COLLAPSIBLE: TECHNICAL API & WEBHOOKS (For Enterprise IT / Developers Only) */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowAdvancedTech(!showAdvancedTech)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0
                }}
              >
                {showAdvancedTech ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                <span>Technical Specifications (Optional: Server-to-Server Webhook & Security Salt)</span>
              </button>

              {showAdvancedTech && (
                <div style={{ marginTop: '12px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>Optional Security Hash:</strong> Agar vendor anti-tamper security hash verify karna chahe, toh SMR return redirect me <code>[hash]</code> parameter attach kar deta hai jo SHA3-256 algorithm se sign hota hai:
                  </p>
                  <pre style={{ background: '#0F172A', color: '#38BDF8', padding: '10px', borderRadius: '6px', fontSize: '11.5px', overflowX: 'auto', margin: '0 0 12px 0' }}>
                    {`// Optional SHA3-256 Signature:\n$hash = hash('sha3-256', $baseUrl . $vendorSecretKey);`}
                  </pre>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>Optional Server-to-Server (S2S) Webhook:</strong> Agar vendor automated postback chahta hai, toh study complete hone par SMR vendor ke webhook endpoint par HTTPS POST request bhejta hai:
                  </p>
                  <pre style={{ background: '#0F172A', color: '#4ADE80', padding: '10px', borderRadius: '6px', fontSize: '11.5px', overflowX: 'auto', margin: 0 }}>
                    {`POST https://vendor-api.com/callback\n{\n  "event": "survey.session_closed",\n  "respondentId": "RESP_001",\n  "projectId": "2042481293",\n  "status": "complete",\n  "statusCode": 10\n}`}
                  </pre>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 24px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Host Gateway: <strong style={{ color: '#0F172A' }}>api.vmhgroupsmr.com</strong> • Standard 302 Redirection
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                background: '#0F172A',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Done / Close
            </button>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}
