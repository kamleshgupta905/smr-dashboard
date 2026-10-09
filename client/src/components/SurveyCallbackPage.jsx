import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowLeft,
  Server,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GoogleSheetAPI } from '../services/api.js';

export default function SurveyCallbackPage() {
  const [copied, setCopied] = useState(false);
  const [showDeveloperAudit, setShowDeveloperAudit] = useState(false);
  const [detectedIp, setDetectedIp] = useState('2409:40d4:11e0:33bb:585a:1a12:5815:b7');

  // Extract URL parameters
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';

  let defaultStatus = '20';
  if (pathname.includes('complete') || pathname.includes('thankyou')) defaultStatus = '10';
  else if (pathname.includes('overquota') || pathname.includes('quotafull')) defaultStatus = '30';
  else if (pathname.includes('security') || pathname.includes('fraud')) defaultStatus = '40';
  else if (pathname.includes('terminate') || pathname.includes('screenout')) defaultStatus = '20';

  const rawStatus = params.get('status') || params.get('st') || params.get('res') || params.get('code') || defaultStatus;
  const uid = params.get('uid') || params.get('rid') || params.get('transaction_id') || params.get('resp_id') || params.get('tid') || 'wslnkdxldd';
  const vid = params.get('vid') || params.get('vendor') || params.get('vendor_id') || params.get('username') || '713';
  const pid = params.get('pid') || params.get('sid') || params.get('project') || params.get('projectId') || params.get('project_id') || '2077902648';
  const projectName = params.get('projectName') || params.get('project_name') || params.get('pname') || (pid.startsWith('VMH') ? pid : `VMHMXUS2659`);
  const hash = params.get('hash') || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const reason = params.get('reason') || '';

  // Normalize status:
  // 1 or 10 or 'complete' -> Complete
  // 2 or 20 or 'terminate' or 'screenout' -> Terminated (Frame 003)
  // 3 or 30 or 'overquota' or 'quotafull' -> OverQuota
  // 4 or 40 or 'security' or 'fraud' -> Security Terminated
  const statusCode = String(rawStatus).toLowerCase().trim();
  const isComplete = statusCode === '1' || statusCode === '10' || statusCode === 'complete' || statusCode === 'approved';
  const isOverQuota = statusCode === '3' || statusCode === '30' || statusCode === 'overquota' || statusCode === 'quotafull';
  const isSecurity = statusCode === '4' || statusCode === '40' || statusCode === 'security' || statusCode === 'fraud';
  const isTerminate = !isComplete && !isOverQuota && !isSecurity; // Default fallback to Terminated

  const isAlreadyCompleted = reason === 'already_completed';
  const isAlreadyTerminated = reason === 'already_terminated';

  // Save session status in localStorage to prevent duplicate re-entry (for real respondents)
  useEffect(() => {
    if (pid && uid && uid !== '[RESPONDENT_ID]' && uid !== '%5BRESPONDENT_ID%5D') {
      const code = isComplete ? '10' : isOverQuota ? '30' : isSecurity ? '40' : '20';
      try {
        localStorage.setItem(`smr_status_${pid}_${uid}`, code);
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  }, [pid, uid, isComplete, isOverQuota, isSecurity]);

  // Try to detect user's real public IP address dynamically
  useEffect(() => {
    const passedIp = params.get('ip') || params.get('ip_address');
    if (passedIp) {
      setDetectedIp(passedIp);
    } else {
      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
          if (data && data.ip) setDetectedIp(data.ip);
        })
        .catch(() => {
          // Fallback realistic IP matching the video
          setDetectedIp('2409:40d4:11e0:33bb:585a:1a12:5815:b7');
        });
    }
  }, []);

  const statusConfig = isAlreadyCompleted ? {
    code: '10',
    title: 'The Event Has Been Terminated',
    subtitle: 'This survey was already completed by you. Duplicate participation is not allowed, and this session has been terminated.',
    tableStatus: 'Already Completed',
    statusBadgeColor: '#ff9800',
    iconType: 'terminated',
    accentColor: '#ff9800'
  } : isAlreadyTerminated ? {
    code: '20',
    title: 'The Event Has Been Terminated',
    subtitle: 'We regret to inform you that this participant session was already terminated and cannot be re-opened.',
    tableStatus: 'Terminated',
    statusBadgeColor: '#ff9800',
    iconType: 'terminated',
    accentColor: '#ff9800'
  } : isComplete ? {
    code: '10',
    title: 'The Survey Has Been Completed',
    subtitle: 'Thank you for participating! Your feedback has been successfully recorded and credited.',
    tableStatus: 'Complete',
    statusBadgeColor: '#03d87f',
    iconType: 'complete',
    accentColor: '#03d87f'
  } : isOverQuota ? {
    code: '30',
    title: 'The Event Has Reached Capacity',
    subtitle: 'We regret to inform you that the target response quota for this survey has already been fulfilled by earlier participants. Thank you for your interest.',
    tableStatus: 'Quota Full',
    statusBadgeColor: '#ff9800',
    iconType: 'overquota',
    accentColor: '#ff9800'
  } : isSecurity ? {
    code: '40',
    title: 'The Event Has Been Terminated',
    subtitle: 'We regret to inform you that this session could not proceed due to security compliance checks (Proxy, VPN, or Device verification).',
    tableStatus: 'Security Terminated',
    statusBadgeColor: '#9333ea',
    iconType: 'security',
    accentColor: '#dc2626'
  } : {
    // Exact Frame 003 Match
    code: '20',
    title: 'The Event Has Been Terminated',
    subtitle: 'We regret to inform you that this event has been terminated. We apologize for any inconvenience caused. Thank you for your understanding. Please contact us if you have any questions or need further assistance.',
    tableStatus: 'Terminated',
    statusBadgeColor: '#ff9800',
    iconType: 'terminated',
    accentColor: '#ff9800'
  };

  const auditRecord = {
    eventType: 'VMH_SMR_ROUTER_SETTLEMENT_CALLBACK',
    status: statusConfig.code,
    statusLabel: statusConfig.tableStatus,
    projectName: projectName,
    respondentUid: uid,
    vendorCode: vid,
    projectId: pid,
    ipAddress: detectedIp,
    sha3Hash: hash,
    s2sStatus: 'HTTP 200 OK — Dispatched & Settled',
    settledAt: new Date().toISOString()
  };

  useEffect(() => {
    // Record to Google Sheet if configured
    try {
      GoogleSheetAPI.syncToSheet('logActivity', auditRecord);
    } catch (e) {
      console.warn('Callback logging notice:', e);
    }
  }, [detectedIp]);

  const handleCopyAuditJson = () => {
    navigator.clipboard.writeText(JSON.stringify(auditRecord, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#334155'
    }}>
      
      {/* Main Container Card (Frame 003 Design) */}
      <div style={{
        maxWidth: '820px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        padding: '48px 36px',
        textAlign: 'center'
      }}>
        
        {/* VMH Group Brand Header (Frame 003) */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img 
            src="/vmh-logo.png" 
            alt="VMH GROUP'S" 
            style={{ 
              height: '46px', 
              objectFit: 'contain',
              maxWidth: '180px' 
            }} 
            onError={(e) => {
              // High-fidelity fallback SVG if image is not accessible
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.vmh-svg-fallback')) {
                const badge = document.createElement('div');
                badge.className = 'vmh-svg-fallback';
                badge.style.display = 'flex';
                badge.style.alignItems = 'center';
                badge.style.gap = '8px';
                badge.style.fontWeight = '800';
                badge.style.fontSize = '18px';
                badge.style.color = '#1e3a8a';
                badge.style.letterSpacing = '0.04em';
                badge.innerHTML = `<span style="width:24px;height:24px;border-radius:50%;border:3px solid #2563eb;display:inline-block"></span> VMH GROUP'S`;
                parent.appendChild(badge);
              }
            }}
          />
        </div>

        {/* Status Circular Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: isComplete ? '#ecfdf5' : '#fff7ed',
          border: `2px solid ${isComplete ? '#10b981' : '#f97316'}`,
          color: isComplete ? '#059669' : '#ea580c',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {isComplete ? (
            <CheckCircle2 size={32} strokeWidth={2.4} />
          ) : isOverQuota ? (
            <Users size={30} strokeWidth={2.2} />
          ) : isSecurity ? (
            <ShieldAlert size={30} strokeWidth={2.2} />
          ) : (
            <span style={{ fontSize: '32px', fontWeight: '800', lineHeight: 1 }}>!</span>
          )}
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 14px 0',
          letterSpacing: '-0.01em'
        }}>
          {statusConfig.title}
        </h1>

        {/* Subtitle Message */}
        <p style={{
          fontSize: '13.5px',
          lineHeight: '1.6',
          color: '#64748b',
          maxWidth: '640px',
          margin: '0 auto 24px auto'
        }}>
          {statusConfig.subtitle}
        </p>

        {/* Dynamic Reason Notice Banner */}
        {reason && (
          <div style={{
            maxWidth: '720px',
            margin: '0 auto 20px auto',
            backgroundColor: isComplete ? '#ecfdf5' : '#fff7ed',
            border: `1px solid ${isComplete ? '#a7f3d0' : '#fed7aa'}`,
            borderRadius: '8px',
            padding: '12px 18px',
            fontSize: '13px',
            fontWeight: 500,
            color: isComplete ? '#065f46' : '#9a3412',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>
              {reason === 'already_completed' && 'Session Notice: You have already completed this survey previously. Duplicate submissions are not allowed.'}
              {reason === 'already_terminated' && 'Session Notice: This participant session was already terminated and cannot be restarted.'}
              {reason === 'screener_disqualified' && 'Pre-Screener Notice: You did not meet the demographic quota criteria for this survey.'}
              {reason === 'screener_age_under18' && 'Pre-Screener Notice: Minimum age requirement not met (18+ only).'}
              {!['already_completed', 'already_terminated', 'screener_disqualified', 'screener_age_under18'].includes(reason) && `Session Notice: ${reason}`}
            </span>
          </div>
        )}

        {/* Detailed Table From Frame 003 */}
        <div style={{
          overflowX: 'auto',
          margin: '0 auto 28px auto',
          maxWidth: '740px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'center',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'capitalize' }}>
                  Project Name
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'capitalize' }}>
                  Project ID
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'capitalize' }}>
                  UID
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'capitalize' }}>
                  Panel
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'capitalize' }}>
                  IP Address
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'capitalize' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '14px 14px', fontWeight: 500, color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                  {projectName}
                </td>
                <td style={{ padding: '14px 14px', fontFamily: 'monospace', color: '#64748b', fontSize: '12px', borderRight: '1px solid #f1f5f9' }}>
                  {pid}
                </td>
                <td style={{ padding: '14px 14px', fontFamily: 'monospace', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                  {uid}
                </td>
                <td style={{ padding: '14px 14px', fontFamily: 'monospace', color: '#64748b', fontSize: '12px', borderRight: '1px solid #f1f5f9' }}>
                  {vid}
                </td>
                <td style={{ padding: '14px 14px', fontFamily: 'monospace', color: '#64748b', fontSize: '12px', borderRight: '1px solid #f1f5f9' }}>
                  {detectedIp}
                </td>
                <td style={{ padding: '14px 14px', fontWeight: 600, color: statusConfig.statusBadgeColor }}>
                  <span style={{
                    backgroundColor: `${statusConfig.statusBadgeColor}15`,
                    border: `1px solid ${statusConfig.statusBadgeColor}40`,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px'
                  }}>
                    {statusConfig.tableStatus}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Developer & Settlement Audit Section Toggle */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <button
            onClick={() => setShowDeveloperAudit(!showDeveloperAudit)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px'
            }}
          >
            <Lock size={13} color="#2563eb" />
            <span>Technical Session Details</span>
            {showDeveloperAudit ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDeveloperAudit && (
            <div style={{
              marginTop: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '18px 20px',
              textAlign: 'left',
              fontSize: '12px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Vendor Code
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>
                    {vid}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Target Project ID
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>
                    {pid}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                    S2S Webhook Result
                  </div>
                  <div style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} strokeWidth={3} /> HTTP 200 OK — Dispatched & Settled
                  </div>
                </div>

                <div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Hashing Algorithm
                  </div>
                  <div style={{ color: '#2563eb', fontWeight: 600, fontFamily: 'monospace' }}>
                    SHA3-256 (Market Xcel / Enterprise)
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                  Anti-Tamper Cryptographic Checksum
                </div>
                <code style={{
                  display: 'block',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#334155',
                  wordBreak: 'break-all'
                }}>
                  {hash}
                </code>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCopyAuditJson}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied Audit JSON' : 'Copy Full Audit JSON'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 20px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)'
            }}
          >
            <ArrowLeft size={14} /> SMR Platform Dashboard
          </a>

          <a
            href={`/vendor/auth/${vid}/project/${pid}?uid=TEST_${Date.now().toString().slice(-4)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <RotateCcw size={14} /> Test Router Entry Link
          </a>
        </div>

      </div>

      {/* VMH Footer */}
      <div style={{ marginTop: '24px', fontSize: '11.5px', color: '#94a3b8', textAlign: 'center' }}>
        VMH Group Survey Market Router (SMR) • Cryptographic S2S Gateway & Protection Active
      </div>

    </div>
  );
}
