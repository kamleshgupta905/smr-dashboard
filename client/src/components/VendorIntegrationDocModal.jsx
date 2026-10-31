import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  X, 
  ShieldCheck, 
  Link2, 
  ArrowRight, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Code,
  Terminal,
  Layers,
  Globe,
  Zap,
  Cpu,
  BookOpen,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import ModalPortal from './ModalPortal';

export default function VendorIntegrationDocModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCodeLang, setActiveCodeLang] = useState('php');
  const [copiedSection, setCopiedSection] = useState(null);
  const [copiedDoc, setCopiedDoc] = useState(false);

  if (!isOpen) return null;

  const SPEC_MARKDOWN = `# VMH GROUP'S • SMR Platform Vendor / Supplier Integration Specification (v3.4)
Host Gateway: https://api.vmhgroupsmr.com
Document Status: Official Production Specification
Intended Audience: Panel Suppliers, Sample Vendors, Exchange Partners, Technical Integration Engineers

---

## Executive Summary & Architecture Overview
VMH GROUP'S SMR Platform operates as a high-speed Market Research Sample Exchange and Routing Gateway. As a panel supplier (Vendor), you supply survey respondents to studies hosted on our exchange.

The integration consists of two core pathways:
1. **Redirect Integration (Mandatory)**: 
   - You direct panelists to our allocated Survey Entry Link with their unique respondent identifier.
   - Upon survey completion or disqualification, our router returns the panelist back to your registered domain Return URLs with the respondent ID and an anti-tamper cryptographic hash.
2. **Server-to-Server (S2S) Webhook Postback (Optional / Recommended)**:
   - For real-time reconciliation and automated incentive crediting, our platform dispatches an asynchronous HTTP POST webhook directly to your backend API.
3. **Programmatic Supplier REST API (Optional for Automated Panels)**:
   - Live endpoints to fetch active survey inventory, real-time quotas, qualifications, and generate entry links dynamically.

---

## 1. Survey Entry Link (Inbound Traffic)
When a project is allocated to your vendor account, VMH SMR generates a dedicated Project Entry Link for your panel.

### Gateway Entry Link Template:
https://api.vmhgroupsmr.com/vendor/auth/{VENDOR_CODE}/project/{PROJECT_ID}?uid=[RESPONDENT_ID]

*(Alternate query parameter structure also supported: \`https://api.vmhgroupsmr.com/router?pid={PROJECT_ID}&vid={VENDOR_CODE}&uid=[RESPONDENT_ID]\`)*

### URL Parameters:
- \`{VENDOR_CODE}\`: Your unique vendor/supplier identifier assigned by VMH (e.g., VND-DYN-01, pure-spectrum, cint-supply).
- \`{PROJECT_ID}\`: The unique VMH study/project identifier (e.g., VMHP1026542026, 90142).
- \`uid\`: The dynamic unique identifier representing your panelist's session.

### Dynamic UID Replacement Tokens:
Your system must replace \`[RESPONDENT_ID]\` with your panelist's unique transaction identifier. Our gateway recognizes and extracts respondent identifiers from any of the following parameters:
- \`uid\`, \`UID\`, \`[UID]\`, \`[#UID#]\`, \`[identifier]\`, \`[RESPONDENT_ID]\`, \`[RID]\`, \`[TransactionId]\`, \`vmhgroupss\`

### Example Live Inbound Entry Link:
https://api.vmhgroupsmr.com/vendor/auth/VND-DYN-01/project/VMHP1026542026?uid=PNL_9948201

---

## 2. Supplier Return Redirects (Outbound Traffic)
**IMPORTANT**: Unlike the entry link, Return Redirect URLs belong to YOUR platform. You provide your 4 return URLs in the VMH SMR Vendor Portal (or during partner onboarding).

When a respondent's survey session concludes, the VMH SMR routing engine evaluates the outcome and immediately issues an **HTTP 302 redirect** back to YOUR registered Return URL.

### The 4 Standard Return URL Callbacks:

| Status Code | Outcome Name | Definition | Commercial Settlement |
|-------------|--------------|------------|-----------------------|
| **10** | **COMPLETE** | Verified complete survey completion. All client quality checks passed. | **Billable Complete (100% Agreed CPI)** |
| **20** | **TERMINATE** | Demographics or screener criteria did not match study requirements. | Non-billable (No payout) |
| **30** | **OVERQUOTA** | The survey quota or specific demographic cell was already full. | Non-billable (No payout) |
| **40** | **SECURITY** | Fraud gate triggered: duplicate IP, proxy/VPN detected, or speeder LOI (<30% baseline). | Disqualified & non-billable |

### Dynamic Placeholders Supported in Your Return URLs:
When configuring your 4 return URLs in VMH SMR, you can include the following placeholder tokens. Our router will dynamically substitute them before redirecting the panelist:

- \`[UID]\` or \`[identifier]\` or \`[RID]\` : Replaced with your panelist's original identifier.
- \`[hash]\` or \`[checksum]\` : Replaced with the SHA3-256 cryptographic security hash.
- \`[status]\` : Replaced with the outcome status code (10, 20, 30, 40).
- \`[project_id]\` or \`[pid]\` : Replaced with the VMH Project ID.

### Example Configuration:
Suppose your panel domain is \`https://panel.myvendor.com\`. You register the following in VMH SMR:
- **Complete URL**: \`https://panel.myvendor.com/surveys/complete?subid=[UID]&hash=[hash]&pid=[project_id]\`
- **Terminate URL**: \`https://panel.myvendor.com/surveys/terminate?subid=[UID]&hash=[hash]\`
- **Overquota URL**: \`https://panel.myvendor.com/surveys/overquota?subid=[UID]&hash=[hash]\`
- **Security URL**: \`https://panel.myvendor.com/surveys/security?subid=[UID]&hash=[hash]\`

When panelist \`PNL_9948201\` successfully completes study \`VMHP1026542026\`, VMH SMR redirects the panelist's browser to:
\`https://panel.myvendor.com/surveys/complete?subid=PNL_9948201&hash=3f9c6d4e8b2a1c0d4e5f6...&pid=VMHP1026542026\`

---

## 3. Anti-Tamper Cryptographic Security Hashing
To prevent malicious participants from manually editing URL query parameters or faking completions, VMH SMR signs every return redirect with a cryptographic hash using your private Secret Key (Salt).

### Signing Formula:
\`$hash = hash('sha3-256', $baseUrlWithoutHash . $secretKey);\`

- \`$baseUrlWithoutHash\`: The full return URL up to the hash parameter (or with \`[hash]\` removed).
- \`$secretKey\`: Your vendor-specific private cryptographic secret key configured in SMR.

---

## 4. Server-to-Server (S2S) Postback Webhook Specification
For high-volume panel suppliers, VMH SMR dispatches asynchronous server-to-server POST webhooks directly to your API endpoint upon study session closure.

### Webhook Dispatch Specs:
- **Protocol**: HTTPS POST
- **Content-Type**: \`application/json\`
- **Header**: \`X-SMR-Signature: <sha3-256-checksum>\`

### JSON Payload Schema:
\`\`\`json
{
  "event": "survey.session_closed",
  "supplierId": "VND-DYN-01",
  "respondentId": "PNL_9948201",
  "projectId": "VMHP1026542026",
  "status": "complete",
  "statusCode": 10,
  "loiSeconds": 412,
  "timestamp": 1741549200,
  "hash": "3f9c6d4e8b2a1c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d"
}
\`\`\`

### Webhook Response Requirement:
Your server must acknowledge receipt with an **HTTP 200 OK** response within **3000ms**:
\`\`\`json
{
  "success": true,
  "acknowledged": true
}
\`\`\`

---

## 5. Programmatic Supplier REST API (Inventory & Quotas)
For partners integrating programmatically (API suppliers), VMH SMR provides REST endpoints compatible with standard Market Research API architectures (SurveySherpa / Cint / PureSpectrum API specs).

### Key Endpoints:
1. **Get Live Survey Feed**:
   \`GET /api/v1/supplier/surveys\`
2. **Get Survey Details & Qualifications**:
   \`GET /api/v1/supplier/survey-details?projectId={PROJECT_ID}\`
3. **Check Live Quota Status**:
   \`GET /api/v1/supplier/quota-status?projectId={PROJECT_ID}\`
4. **Generate Dynamic Entry Link**:
   \`POST /api/v1/supplier/generate-entry-link\`

---

## 6. Testing & Sandbox QA Verification Procedure
Before sending live panel traffic, complete this 5-step verification checklist:

1. **Bypass Duplicate Filters (Test Mode)**:
   Always prefix your test respondent ID with \`TEST_\` (e.g., \`uid=TEST_DYNATA_001\`). Test UIDs bypass IP duplicate checks, device locks, and speeder minimum LOI guards.

2. **Test Survey Entry**:
   Open your test link in an incognito window:
   \`https://api.vmhgroupsmr.com/vendor/auth/{VENDOR_CODE}/project/{PROJECT_ID}?uid=TEST_DYNATA_001\`

3. **Verify Complete Callback (Status 10)**:
   Simulate a complete or navigate to:
   \`https://api.vmhgroupsmr.com/survey/callback?status=10&vid={VENDOR_CODE}&uid=TEST_DYNATA_001&pid={PROJECT_ID}\`
   Verify that the browser redirects to YOUR Complete URL and that your system credits the test panelist.

4. **Verify Terminate, Overquota & Security Callbacks**:
   Repeat with \`status=20\`, \`status=30\`, and \`status=40\` to confirm all 4 callback routes.

5. **Verify S2S Postback Receipt**:
   Check your server logs to ensure the JSON webhook was delivered and that your server responded with HTTP 200 OK.
`;

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

  const downloadMarkdown = () => {
    const blob = new Blob([SPEC_MARKDOWN], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'VMH_SMR_Vendor_Integration_Specification.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const CODE_SNIPPETS = {
    php: `// PHP Verification Implementation (Native & Robust)
$incomingHash = $_GET['hash'] ?? '';

// 1. Strip the hash parameter to reconstruct the signed base URL
$baseUrl = preg_replace('/([&?]hash=[^&]*)/', '', $_SERVER['REQUEST_URI']);

// 2. Recompute expected hash using your private Vendor Secret Key
$expectedHash = hash('sha3-256', $baseUrl . $vendorSecretKey);

// 3. Constant-time comparison to prevent timing attacks
if (hash_equals($expectedHash, $incomingHash)) {
    // Verified completion from VMH SMR -> Credit panelist incentive
    $respondentId = $_GET['subid'] ?? $_GET['uid'] ?? '';
    creditPanelistIncentive($respondentId);
    echo "Survey completion verified successfully.";
} else {
    // Tampered request -> Log security event and reject
    http_response_code(403);
    echo "Security signature validation failed.";
}`,
    node: `// Node.js / Express Verification Middleware
const crypto = require('crypto');

app.get('/surveys/complete', (req, res) => {
  const incomingHash = req.query.hash || '';
  
  // 1. Reconstruct original URL without the hash parameter
  const baseUrl = req.originalUrl.replace(/([&?]hash=[^&]*)/, '');
  
  // 2. Compute expected SHA3-256 checksum
  const expectedHash = crypto
    .createHash('sha3-256')
    .update(baseUrl + process.env.VENDOR_SECRET_KEY)
    .digest('hex');

  // 3. Constant-time buffer comparison
  const hashMatches = 
    incomingHash.length === expectedHash.length &&
    crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(expectedHash));

  if (hashMatches) {
    const respondentId = req.query.subid || req.query.uid;
    await creditUser(respondentId);
    res.status(200).send({ success: true, message: 'Complete verified' });
  } else {
    res.status(403).send({ error: 'Invalid security signature' });
  }
});`,
    python: `# Python / Flask Verification Handler
import re
import hmac
import hashlib
from flask import Flask, request, abort

@app.route('/surveys/complete')
def survey_complete():
    incoming_hash = request.args.get('hash', '')
    
    # 1. Extract base URL without the hash query parameter
    full_path = request.full_path.rstrip('?')
    base_url = re.sub(r'([&?]hash=[^&]*)', '', full_path)
    
    # 2. Compute expected SHA3-256 hash with Secret Key
    sign_target = (base_url + VENDOR_SECRET_KEY).encode('utf-8')
    expected_hash = hashlib.sha3_256(sign_target).hexdigest()
    
    # 3. Constant-time signature verification
    if hmac.compare_digest(expected_hash, incoming_hash):
        respondent_id = request.args.get('subid') or request.args.get('uid')
        credit_panelist(respondent_id)
        return {"status": "success", "message": "Verified"}, 200
    else:
        abort(403, description="Security signature mismatch")`,
    csharp: `// C# / ASP.NET Core Controller Implementation
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;

[HttpGet("/surveys/complete")]
public IActionResult VerifyComplete([FromQuery] string hash, [FromQuery] string subid) {
    string requestUri = Request.Path + Request.QueryString;
    string baseUrl = Regex.Replace(requestUri, @"([&?]hash=[^&]*)", "");
    
    using (var sha = SHA256.Create()) { // or SHA3-256 on .NET 8+
        byte[] payload = Encoding.UTF8.GetBytes(baseUrl + _vendorSecretKey);
        byte[] hashBytes = sha.ComputeHash(payload);
        string expectedHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

        if (CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expectedHash), 
                Encoding.UTF8.GetBytes(hash ?? ""))) {
            CreditPanelist(subid);
            return Ok(new { success = true });
        }
    }
    return Forbid();
}`
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
        <div 
          className="modal-content" 
          onClick={e => e.stopPropagation()} 
          style={{ 
            maxWidth: '920px', 
            width: '95vw', 
            maxHeight: '92vh', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ 
            background: '#0F172A', 
            color: '#FFFFFF', 
            padding: '18px 24px', 
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                border: '1px solid #475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <Globe size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    Vendor Integration Specification
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 700,
                    background: '#0369A1',
                    color: '#E0F2FE',
                    border: '1px solid #0284C7'
                  }}>
                    MR Exchange Protocol v3.4
                  </span>
                </div>
                <div style={{ color: '#94A3B8', fontSize: '12.5px', marginTop: '2px' }}>
                  Bi-directional guide for panel suppliers, programmatic vendors & exchange routers
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(SPEC_MARKDOWN, 'full_doc')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12px', 
                  padding: '7px 13px',
                  background: '#1E293B',
                  borderColor: '#334155',
                  color: '#F8FAFC'
                }}
                title="Copy entire specification to clipboard"
              >
                {copiedDoc ? <Check size={14} color="#4ADE80" /> : <Copy size={14} />}
                <span>{copiedDoc ? 'Copied Full Spec!' : 'Copy Spec'}</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={downloadMarkdown}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12px', 
                  padding: '7px 13px',
                  background: '#0284C7',
                  borderColor: '#0369A1',
                  color: '#FFFFFF'
                }}
                title="Download specification as markdown file"
              >
                <Download size={14} />
                <span>Download .MD</span>
              </button>
              <button
                onClick={onClose}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#94A3B8', 
                  cursor: 'pointer', 
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close Modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Subtabs Navigation */}
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '4px',
            padding: '8px 18px 0 18px',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC'
          }}>
            {[
              { id: 'overview', label: 'Exchange Architecture', icon: Layers },
              { id: 'entry', label: '1. Inbound Entry Link', icon: Link2 },
              { id: 'callbacks', label: '2. Outbound Return URLs', icon: ArrowRight },
              { id: 'security', label: '3. Security Hashing', icon: Key },
              { id: 's2s', label: '4. S2S Postback Webhook', icon: Server },
              { id: 'rest_api', label: '5. Supplier REST API', icon: Cpu },
              { id: 'sandbox', label: '6. Testing & Sandbox QA', icon: CheckCircle2 },
              { id: 'raw', label: 'Raw Markdown (.md)', icon: FileText },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #0284C7' : '3px solid transparent',
                    color: isActive ? '#0369A1' : '#64748B',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '12px',
                    padding: '9px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    marginBottom: '-1px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} color={isActive ? '#0284C7' : '#64748B'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Body */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, fontSize: '13px', background: '#FFFFFF' }}>
            
            {/* 1. OVERVIEW & EXCHANGE ARCHITECTURE */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ 
                  background: '#F0F9FF', 
                  border: '1px solid #BAE6FD', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '20px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', fontWeight: 800, marginBottom: '6px' }}>
                    <ShieldCheck size={18} />
                    <span>Market Research Exchange Role & Model Clarity</span>
                  </div>
                  <p style={{ margin: 0, color: '#0C4A6E', fontSize: '12.5px', lineHeight: 1.6 }}>
                    <strong>VMH GROUP SMR</strong> acts as the central Survey Routing Gateway and Exchange Buyer. 
                    <strong> You (the Vendor)</strong> are the Panel Supplier. 
                    Your system sends panelists to our allocated <em>Entry Link</em>. 
                    When the survey session terminates or completes, our router redirects the participant <strong>BACK TO YOUR REGISTERED RETURN URLs</strong> (on your domain) with dynamic respondent IDs and cryptographic anti-tamper signing.
                  </p>
                </div>

                {/* 4-Step Visual Flowchart */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} color="#0284C7" />
                  <span>Bi-Directional Exchange Lifecycle:</span>
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284C7', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>1</span>
                      <span>Supplier Panel Entry</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                      Supplier directs panelist into SMR gateway with dynamic respondent ID appended as <code>?uid=...</code>.
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7C3AED', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
                      <span>SMR Router & Guard</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                      SMR evaluates quotas, VPN/Proxy, device match, and logs the session before forwarding to client survey.
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>3</span>
                      <span>Client Study Session</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                      Panelist attempts survey. Outcome resolved as Complete (10), Terminate (20), Overquota (30), or Security (40).
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>4</span>
                      <span>Supplier Return Redirect</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                      SMR redirects browser back to <strong>Supplier's Registered URLs</strong> with injected UID and SHA3-256 hash.
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    Supplier Quick Start Checklist:
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#475569', fontSize: '12px', lineHeight: 1.7 }}>
                    <li><strong>Register 4 Return URLs:</strong> Enter your Complete, Terminate, Overquota, and Security URLs in SMR with <code>[UID]</code> and <code>[hash]</code> placeholders.</li>
                    <li><strong>Receive Project Allocation:</strong> Obtain your dedicated Project Entry Link from your VMH account manager or via the Supplier REST API.</li>
                    <li><strong>Send Traffic:</strong> Replace <code>[RESPONDENT_ID]</code> with your panelist's unique identifier.</li>
                    <li><strong>Verify Return Signature:</strong> Implement cryptographic hash verification on your server to guarantee legitimate payouts.</li>
                    <li><strong>(Optional) Enable S2S:</strong> Provide a webhook URL for asynchronous server-to-server completion postbacks.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. INBOUND ENTRY LINK */}
            {activeTab === 'entry' && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Allocated Project Entry Link Template:
                </h4>
                <p style={{ color: '#64748B', fontSize: '12.5px', margin: '0 0 12px 0' }}>
                  For each live project allocated to your panel, VMH SMR generates a unique study entry link:
                </p>

                <div style={{ 
                  background: '#0F172A', 
                  color: '#94A3B8', 
                  padding: '14px', 
                  borderRadius: '8px', 
                  fontFamily: 'monospace', 
                  fontSize: '12.5px', 
                  wordBreak: 'break-all', 
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div>
                    https://api.vmhgroupsmr.com/vendor/auth/<span style={{ color: '#FDE047' }}>{'{VENDOR_CODE}'}</span>/project/<span style={{ color: '#4ADE80' }}>{'{PROJECT_ID}'}</span>?uid=<span style={{ color: '#F472B6' }}>[RESPONDENT_ID]</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('https://api.vmhgroupsmr.com/vendor/auth/{VENDOR_CODE}/project/{PROJECT_ID}?uid=[RESPONDENT_ID]', 'entry_template')}
                    style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap' }}
                  >
                    {copiedSection === 'entry_template' ? 'Copied!' : 'Copy Template'}
                  </button>
                </div>

                <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                  <table className="custom-table" style={{ width: '100%', fontSize: '12px' }}>
                    <thead className="thead-light">
                      <tr>
                        <th style={{ width: '160px' }}>Parameter</th>
                        <th style={{ width: '80px' }}>Type</th>
                        <th style={{ width: '80px' }}>Required</th>
                        <th>Description & Requirements</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>{'{VENDOR_CODE}'}</code></td>
                        <td>String</td>
                        <td><span style={{ color: '#DC2626', fontWeight: 700 }}>YES</span></td>
                        <td>Your unique supplier code assigned by VMH (e.g., <code>VND-DYN-01</code>, <code>pure-spectrum</code>).</td>
                      </tr>
                      <tr>
                        <td><code>{'{PROJECT_ID}'}</code></td>
                        <td>String</td>
                        <td><span style={{ color: '#DC2626', fontWeight: 700 }}>YES</span></td>
                        <td>The unique study identifier assigned by VMH (e.g., <code>VMHP1026542026</code>, <code>90142</code>).</td>
                      </tr>
                      <tr>
                        <td><code>uid</code></td>
                        <td>String</td>
                        <td><span style={{ color: '#DC2626', fontWeight: 700 }}>YES</span></td>
                        <td>
                          The dynamic unique ID of your panelist. Must be alphanumeric and unique per survey attempt.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Supported Dynamic UID Replacement Tags:
                </h4>
                <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 10px 0' }}>
                  Your supply system may pass the panelist ID using any of the following industry placeholders:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '18px' }}>
                  {['[UID]', '[identifier]', '[RESPONDENT_ID]', '[RID]', '[TransactionId]', '[#UID#]', 'vmhgroupss'].map(tag => (
                    <div key={tag} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11.5px', color: '#0F172A', textAlign: 'center' }}>
                      <code>{tag}</code>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#0F172A', fontSize: '12.5px' }}>
                      Live Example Link (Sent to Dynata Global Panel):
                    </strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://api.vmhgroupsmr.com/vendor/auth/VND-DYN-01/project/VMHP1026542026?uid=[RESPONDENT_ID]', 'dynata_ex')}
                      style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      {copiedSection === 'dynata_ex' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code style={{ fontSize: '11.5px', color: '#0F172A', wordBreak: 'break-all' }}>
                    https://api.vmhgroupsmr.com/vendor/auth/VND-DYN-01/project/VMHP1026542026?uid=[RESPONDENT_ID]
                  </code>
                </div>
              </div>
            )}

            {/* 3. OUTBOUND RETURN URLS */}
            {activeTab === 'callbacks' && (
              <div>
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', fontWeight: 800, marginBottom: '4px' }}>
                    <CheckCircle2 size={16} />
                    <span>Important: Return URLs Belong to YOUR Domain</span>
                  </div>
                  <p style={{ margin: 0, color: '#064E3B', fontSize: '12.5px', lineHeight: 1.5 }}>
                    You provide your 4 return redirect URLs in the VMH SMR Vendor Portal (e.g., on <code>https://panel.yourcompany.com/...</code>). 
                    When a survey finishes, VMH SMR replaces the placeholders (such as <code>[UID]</code> and <code>[hash]</code>) and issues an <strong>HTTP 302 redirect</strong> back to your server.
                  </p>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  The 4 Standard Survey Outcome Status Codes:
                </h4>
                <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                  <table className="custom-table" style={{ width: '100%', fontSize: '12px' }}>
                    <thead className="thead-light">
                      <tr>
                        <th style={{ width: '70px' }}>Code</th>
                        <th style={{ width: '130px' }}>Outcome</th>
                        <th>Definition & Meaning</th>
                        <th style={{ width: '160px' }}>Commercial Terms</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge-soft-success" style={{ fontWeight: 800 }}>10</span></td>
                        <td><strong style={{ color: '#16A34A' }}>COMPLETE</strong></td>
                        <td>Respondent finished all client questions and passed validation checks.</td>
                        <td><strong style={{ color: '#16A34A' }}>Billable (100% CPI)</strong></td>
                      </tr>
                      <tr>
                        <td><span className="badge-soft-danger" style={{ fontWeight: 800 }}>20</span></td>
                        <td><strong style={{ color: '#DC2626' }}>TERMINATE</strong></td>
                        <td>Respondent screened out on demographics or qualification screening questions.</td>
                        <td><span style={{ color: '#64748B' }}>Non-Billable (No payout)</span></td>
                      </tr>
                      <tr>
                        <td><span className="badge-soft-warning" style={{ fontWeight: 800 }}>30</span></td>
                        <td><strong style={{ color: '#D97706' }}>OVERQUOTA</strong></td>
                        <td>Study quota or target sub-quota filled before respondent finished.</td>
                        <td><span style={{ color: '#64748B' }}>Non-Billable (No payout)</span></td>
                      </tr>
                      <tr>
                        <td><span className="badge-soft-danger" style={{ fontWeight: 800 }}>40</span></td>
                        <td><strong style={{ color: '#7E22CE' }}>SECURITY</strong></td>
                        <td>Disqualified due to fraud detection: duplicate IP, proxy, VPN, or speeder LOI.</td>
                        <td><span style={{ color: '#DC2626' }}>Disqualified & Logged</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Dynamic Substitution Placeholders Supported in Your URLs:
                </h4>
                <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                  <table className="custom-table" style={{ width: '100%', fontSize: '12px' }}>
                    <thead className="thead-light">
                      <tr>
                        <th style={{ width: '180px' }}>Placeholder Tag</th>
                        <th>Substituted Value</th>
                        <th style={{ width: '200px' }}>Example Replacement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>[UID]</code> or <code>[identifier]</code></td>
                        <td>The unique respondent ID originally provided by the supplier.</td>
                        <td><code>PNL_9948201</code></td>
                      </tr>
                      <tr>
                        <td><code>[hash]</code> or <code>[checksum]</code></td>
                        <td>The calculated SHA3-256 / HMAC anti-tamper cryptographic signature.</td>
                        <td><code>3f9c6d4e8b2a1c...</code></td>
                      </tr>
                      <tr>
                        <td><code>[status]</code></td>
                        <td>The numeric survey status code (10, 20, 30, or 40).</td>
                        <td><code>10</code></td>
                      </tr>
                      <tr>
                        <td><code>[project_id]</code> or <code>[pid]</code></td>
                        <td>The VMH study project code.</td>
                        <td><code>VMHP1026542026</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Example of Supplier Configured URLs:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: '1. Complete Callback URL', code: 10, color: '#16A34A', ex: 'https://panel.vendor.com/surveys/complete?subid=[UID]&hash=[hash]&pid=[project_id]' },
                    { name: '2. Terminate Callback URL', code: 20, color: '#DC2626', ex: 'https://panel.vendor.com/surveys/terminate?subid=[UID]&hash=[hash]' },
                    { name: '3. Overquota Callback URL', code: 30, color: '#D97706', ex: 'https://panel.vendor.com/surveys/overquota?subid=[UID]&hash=[hash]' },
                    { name: '4. Security Disqualify URL', code: 40, color: '#7E22CE', ex: 'https://panel.vendor.com/surveys/security?subid=[UID]&hash=[hash]' },
                  ].map(item => (
                    <div key={item.code} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <strong style={{ color: item.color, fontSize: '12px' }}>{item.name}</strong>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>Status Code: {item.code}</span>
                      </div>
                      <code style={{ fontSize: '11px', color: '#334155', wordBreak: 'break-all' }}>
                        {item.ex}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SECURITY HASHING */}
            {activeTab === 'security' && (
              <div>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 700, marginBottom: '6px' }}>
                    <Key size={16} />
                    <span>Cryptographic Anti-Tamper Protection</span>
                  </div>
                  <p style={{ margin: 0, color: '#14532D', fontSize: '12.5px', lineHeight: 1.5 }}>
                    To ensure respondents cannot falsify survey completions by directly visiting return URLs, VMH SMR signs every redirect using SHA3-256 cryptographic hashing. Your backend must recompute and verify this checksum before crediting panelist incentives.
                  </p>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Standard Hashing Formula:
                </h4>
                <div style={{ 
                  background: '#0F172A', 
                  color: '#4ADE80', 
                  padding: '12px 14px', 
                  borderRadius: '6px', 
                  fontFamily: 'monospace', 
                  fontSize: '12.5px', 
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>$hash = hash('sha3-256', $baseUrlWithoutHash . $secretKey);</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("hash('sha3-256', $baseUrlWithoutHash . $secretKey);", 'formula')}
                    style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {copiedSection === 'formula' ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Language Switcher Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'php', label: 'PHP' },
                      { id: 'node', label: 'Node.js / Express' },
                      { id: 'python', label: 'Python / Flask' },
                      { id: 'csharp', label: 'C# / .NET' },
                    ].map(lang => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setActiveCodeLang(lang.id)}
                        style={{
                          background: activeCodeLang === lang.id ? '#0F172A' : '#F1F5F9',
                          color: activeCodeLang === lang.id ? '#FFFFFF' : '#475569',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: activeCodeLang === lang.id ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(CODE_SNIPPETS[activeCodeLang], `code_${activeCodeLang}`)}
                    style={{ 
                      background: '#F1F5F9', 
                      border: '1px solid #CBD5E1', 
                      borderRadius: '4px', 
                      padding: '4px 10px', 
                      fontSize: '11.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedSection === `code_${activeCodeLang}` ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                    <span>{copiedSection === `code_${activeCodeLang}` ? 'Copied Code!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre style={{ 
                  background: '#0F172A', 
                  color: '#E2E8F0', 
                  padding: '14px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  overflowX: 'auto', 
                  margin: 0,
                  fontFamily: 'monospace',
                  lineHeight: 1.5
                }}>
                  {CODE_SNIPPETS[activeCodeLang]}
                </pre>
              </div>
            )}

            {/* 5. S2S POSTBACK WEBHOOK */}
            {activeTab === 's2s' && (
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Server-to-Server (S2S) Webhook Postback
                </h4>
                <p style={{ color: '#64748B', fontSize: '12.5px', margin: '0 0 14px 0' }}>
                  For high-volume panel suppliers, VMH SMR dispatches an asynchronous server-to-server POST webhook directly to your API endpoint upon survey closure for guaranteed delivery.
                </p>

                <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', color: '#F8FAFC', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#94A3B8', fontWeight: 700, fontSize: '12px' }}>
                      HTTP POST Webhook Payload:
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`POST /api/vendor/callbacks HTTP/1.1\nHost: api.yourdomain.com\nContent-Type: application/json\nX-SMR-Signature: 3f9c6d4e8b2a1c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d\n\n{\n  "event": "survey.session_closed",\n  "supplierId": "VND-DYN-01",\n  "respondentId": "PNL_9948201",\n  "projectId": "VMHP1026542026",\n  "status": "complete",\n  "statusCode": 10,\n  "loiSeconds": 412,\n  "timestamp": 1741549200,\n  "hash": "3f9c6d4e8b2a1c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d"\n}`, 's2s_sample')}
                      style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      {copiedSection === 's2s_sample' ? 'Copied!' : 'Copy Payload'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, fontSize: '11.5px', color: '#E2E8F0', fontFamily: 'monospace' }}>
{`POST /api/vendor/callbacks HTTP/1.1
Host: api.yourdomain.com
Content-Type: application/json
X-SMR-Signature: 3f9c6d4e8b2a1c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d

{
  "event": "survey.session_closed",
  "supplierId": "VND-DYN-01",
  "respondentId": "PNL_9948201",
  "projectId": "VMHP1026542026",
  "status": "complete",            // "complete" | "terminate" | "overquota" | "security"
  "statusCode": 10,                 // 10=Complete, 20=Terminate, 30=Overquota, 40=Security
  "loiSeconds": 412,                // Time spent by respondent in seconds
  "timestamp": 1741549200,          // Epoch timestamp
  "hash": "3f9c6d4e8b2a1c..."       // Anti-tamper verification signature
}`}
                  </pre>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px 14px' }}>
                  <strong style={{ fontSize: '12px', color: '#0F172A' }}>Webhook Response Requirement:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    Your webhook endpoint must respond with <code>HTTP 200 OK</code> within 3000ms. SMR automatically retries up to 3 times on network failure with exponential backoff.
                  </p>
                </div>
              </div>
            )}

            {/* 6. PROGRAMMATIC REST API */}
            {activeTab === 'rest_api' && (
              <div>
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, marginBottom: '6px' }}>
                    <Cpu size={16} />
                    <span>Programmatic Supplier REST API (Automated Inventory)</span>
                  </div>
                  <p style={{ margin: 0, color: '#334155', fontSize: '12.5px', lineHeight: 1.5 }}>
                    For automated suppliers (like SurveySherpa, Cint, and PureSpectrum API suppliers), VMH SMR exposes standard REST endpoints to pull live survey inventory, check real-time quotas, and programmatically generate authenticated entry links.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>GET</span>
                      <code style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>/api/v1/supplier/surveys</code>
                    </div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#64748B' }}>
                      Returns all live, active survey inventory currently allocated to your vendor account, including CPI, LOI, IR, country code, and quota limit.
                    </p>
                  </div>

                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>GET</span>
                      <code style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>/api/v1/supplier/survey-details?projectId={'{PID}'}</code>
                    </div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#64748B' }}>
                      Returns granular targeting parameters, demographic qualifications, device restrictions, and remaining sub-quota targets.
                    </p>
                  </div>

                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#DBEAFE', color: '#1E40AF', fontWeight: 800, fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>POST</span>
                      <code style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>/api/v1/supplier/generate-entry-link</code>
                    </div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#64748B' }}>
                      Takes <code>{`{ "projectId": "...", "respondentId": "..." }`}</code> and generates a validated, anti-fraud pre-screened entry URL.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. TESTING & SANDBOX QA */}
            {activeTab === 'sandbox' && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Self-Serve Sandbox Testing & QA Procedure:
                </h4>
                <p style={{ color: '#64748B', fontSize: '12.5px', margin: '0 0 16px 0' }}>
                  Before launching live traffic, complete this 5-step checklist to ensure 100% redirect and hash accuracy:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { step: '1', title: 'Use Test UID Prefix (Bypass Quality Locks)', desc: 'Always prefix your test respondent ID with TEST_ (e.g. uid=TEST_DYNATA_001). Test UIDs automatically bypass IP deduplication, device restrictions, and speeder LOI guards.' },
                    { step: '2', title: 'Verify Survey Inbound Entry', desc: 'Open the entry link in an incognito browser window. Confirm you land smoothly on the pre-screener or client survey gateway without error screens.' },
                    { step: '3', title: 'Verify Complete Return Callback (Status 10)', desc: 'Simulate or execute a complete outcome. Verify your browser redirects to YOUR Complete URL and that your backend verifies the SHA3-256 hash successfully.' },
                    { step: '4', title: 'Verify Terminate & Overquota Callbacks', desc: 'Simulate screenout and overquota outcomes. Confirm that status codes 20 and 30 redirect to their designated URLs without granting incentives.' },
                    { step: '5', title: 'Verify S2S Postback Receipt', desc: 'If S2S is configured, verify that your API server receives the JSON POST payload and responds with HTTP 200 OK within 3000ms.' },
                  ].map(item => (
                    <div key={item.step} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px 14px', display: 'flex', gap: '12px' }}>
                      <span style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: '#0F172A', 
                        color: '#FFFFFF', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '11.5px',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {item.step}
                      </span>
                      <div>
                        <strong style={{ fontSize: '12.5px', color: '#0F172A', display: 'block', marginBottom: '2px' }}>
                          {item.title}
                        </strong>
                        <span style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 700, marginBottom: '4px' }}>
                    <AlertTriangle size={16} />
                    <span>Common Integration Pitfalls:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#92400E', fontSize: '12px', lineHeight: 1.6 }}>
                    <li><strong>Hash mismatch:</strong> Ensure your server removes <code>&hash=...</code> from the URL string before concatenating with your private secret key.</li>
                    <li><strong>Missing UID:</strong> Verify that your panel system dynamically replaces <code>[RESPONDENT_ID]</code> with a real panelist ID, not leaving the literal bracketed placeholder.</li>
                    <li><strong>HTTP vs HTTPS:</strong> All production entry links and return redirects must use HTTPS.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 8. RAW MARKDOWN DOCUMENT */}
            {activeTab === 'raw' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Raw Markdown Document (Ready to copy or share with supplier technical leads):
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(SPEC_MARKDOWN, 'raw_text')}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    {copiedSection === 'raw_text' ? 'Copied!' : 'Copy Raw Text'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={SPEC_MARKDOWN}
                  rows={18}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #E2E8F0',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F8FAFC',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '12px' }}>
              <ShieldCheck size={14} color="#16A34A" />
              <span>Standard VMH Group SMR Supplier Integration Protocol • v3.4 Enterprise</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ fontSize: '12px', padding: '6px 16px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
