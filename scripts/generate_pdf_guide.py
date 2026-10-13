import os
import sys
from playwright.sync_api import sync_playwright

html_content = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>VMH SMR Enterprise System Operating Manual</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
  
  @page {
    size: A4;
    margin: 14mm 14mm 14mm 14mm;
    @bottom-right {
      content: "Page " counter(page);
      font-size: 8pt;
      font-family: 'Inter', sans-serif;
      color: #64748b;
    }
    @bottom-left {
      content: "VMH GROUP • SMR Enterprise Operating Manual";
      font-size: 8pt;
      font-family: 'Inter', sans-serif;
      color: #94a3b8;
    }
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  h1, h2, h3, h4 {
    font-family: 'Montserrat', sans-serif;
    color: #0c213a;
    margin-top: 0;
    letter-spacing: -0.3px;
  }

  /* Cover Page */
  .cover-page {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justifyContent: space-between;
    min-height: 94vh;
    padding: 20px 10px;
    border-bottom: 4px solid #1761fd;
  }

  .cover-header {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .logo-box {
    background: #0c213a;
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 8px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    font-size: 18pt;
    letter-spacing: -0.5px;
  }

  .cover-title-section {
    margin-top: 60px;
  }

  .badge-tag {
    display: inline-block;
    background: #eef4ff;
    color: #1761fd;
    font-weight: 800;
    font-size: 8.5pt;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 18px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border: 1px solid #c7d8fe;
  }

  .cover-title {
    font-size: 28pt;
    line-height: 1.2;
    font-weight: 900;
    color: #0c213a;
    margin-bottom: 16px;
  }

  .cover-subtitle {
    font-size: 11pt;
    color: #475569;
    max-width: 620px;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 18px;
    margin-top: 30px;
  }

  .meta-item {
    font-size: 8.5pt;
  }

  .meta-label {
    color: #64748b;
    font-weight: 600;
    display: block;
    margin-bottom: 3px;
    text-transform: uppercase;
    font-size: 7pt;
    letter-spacing: 0.6px;
  }

  .meta-value {
    color: #0c213a;
    font-weight: 800;
    font-size: 9.5pt;
  }

  .section-title {
    font-size: 13.5pt;
    font-weight: 800;
    color: #0c213a;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 6px;
    margin-top: 22px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 16px;
    background: #1761fd;
    border-radius: 2px;
  }

  .page-break {
    page-break-before: always;
  }

  /* Cards */
  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 12px;
    font-size: 9pt;
  }

  .card-highlight {
    background: #f8fafd;
    border-left: 4px solid #1761fd;
  }

  .card-success {
    background: #f0fdf4;
    border-left: 4px solid #16a34a;
  }

  .card-warning {
    background: #fffbeb;
    border-left: 4px solid #d97706;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 8.2pt;
  }

  th {
    background: #0c213a;
    color: #ffffff;
    text-align: left;
    padding: 7px 9px;
    font-weight: 700;
    font-size: 7.8pt;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  td {
    padding: 6px 9px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  /* Step Badge */
  .step-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    align-items: flex-start;
  }

  .step-num {
    background: #1761fd;
    color: #ffffff;
    font-weight: 800;
    font-size: 8.5pt;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .step-content {
    flex: 1;
  }

  .step-title {
    font-weight: 700;
    color: #0c213a;
    font-size: 9.5pt;
    margin-bottom: 2px;
  }

  .code-block {
    background: #0f172a;
    color: #38bdf8;
    padding: 8px 12px;
    border-radius: 5px;
    font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
    font-size: 7.8pt;
    margin: 6px 0;
    word-break: break-all;
  }

  .pill-badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 10px;
    font-size: 7pt;
    font-weight: 700;
  }
  .pill-green { background: #dcfce7; color: #15803d; }
  .pill-blue { background: #dbeafe; color: #1d4ed8; }
  .pill-amber { background: #fef3c7; color: #b45309; }
  .pill-red { background: #fee2e2; color: #b91c1c; }

  ul {
    margin: 4px 0 8px 0;
    padding-left: 18px;
  }

  li {
    margin-bottom: 3px;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div class="cover-header">
    <div class="logo-box">VMH GROUP</div>
    <div>
      <div style="font-weight: 800; font-size: 11pt; color: #0c213a; letter-spacing: -0.2px;">SURVEY MARKETPLACE & TRAFFIC ROUTER</div>
      <div style="font-size: 8pt; color: #64748b;">Enterprise Multi-Client API Gateway • Version 3.4 Production</div>
    </div>
  </div>

  <div class="cover-title-section">
    <span class="badge-tag">Official Senior Software Developer & System Operator Manual</span>
    <h1 class="cover-title">VMH SMR Platform<br>System Architecture & Operating SOP</h1>
    <p class="cover-subtitle">
      Ye complete standard operating manual VMH Admin, Operations aur Engineering teams ke liye banaya gaya hai. Isme system architecture, MySQL 8.0 schema, Zamplia API sync, 910+ panel partners allotment, bulk survey assignment, single-click Reports Hub, S2S tracking callbacks, fraud security aur production maintenance ka poora process simple Hinglish me detail se samjhaya gaya hai.
    </p>
  </div>

  <div class="cover-meta-grid">
    <div class="meta-item">
      <span class="meta-label">Live Platform URL</span>
      <span class="meta-value">https://smr.vmhgroupsmr.com/</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Default Super Admin</span>
      <span class="meta-value">vmhgroup / Jelly (Role: Developer / Admin)</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Production Datacenter</span>
      <span class="meta-value">Hostinger Mumbai (srv2215.hstgr.io)</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Active MySQL Database</span>
      <span class="meta-value">u839355029_vmh_group (910+ Live Vendors)</span>
    </div>
  </div>
</div>

<!-- PAGE 2: ARCHITECTURE & DATABASE -->
<div class="page-break"></div>

<h2 class="section-title">1. System Architecture & High-Speed Flow</h2>
<p>VMH SMR automated high-throughput marketplace aur router hai jo market research buyers aur supply panel vendors ke beech kaam karta hai:</p>

<div class="card card-highlight">
  <strong>💡 Production Architecture Breakdown:</strong>
  <ul>
    <li><strong>Client Layer:</strong> React 18 + Vite SPA, Montserrat & Inter typography, responsive compact tables with sticky action buttons, hash-based URL routing (<code>#surveys</code>, <code>#reports</code>, <code>#vendors</code>).</li>
    <li><strong>Core API Layer:</strong> Native PHP 8.1+ LiteSpeed Gateway (<code>/api/index.php</code>) jo sub-5ms cURL proxy se Zamplia supply endpoints connect karta hai.</li>
    <li><strong>Database Layer:</strong> MySQL 8.0 (<code>u839355029_vmh_group</code>) hostinger server par permanent persistence provide karta hai with zero-mock data policy.</li>
    <li><strong>Anti-Tamper Security:</strong> Market Xcel SHA3-256 digital signature formula (<code>$hash = hash('sha3-256', $baseUrl . $secretKey)</code>).</li>
  </ul>
</div>

<h2 class="section-title">2. Database Schema & Key Tables (MySQL)</h2>
<p>Platform ke saare records real MySQL tables mein store hote hain:</p>

<table>
  <thead>
    <tr>
      <th>Table Name</th>
      <th>Primary Columns</th>
      <th>Role & Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong><code>users</code></strong></td>
      <td><code>id, name, username, email, password, role_id, is_active</code></td>
      <td>Portal admin accounts and employee logins.</td>
    </tr>
    <tr>
      <td><strong><code>menu_permissions</code></strong></td>
      <td><code>id, user_id, menu_id, created_at</code></td>
      <td>Granular access controls mapping users to authorized menu IDs (1 to 10).</td>
    </tr>
    <tr>
      <td><strong><code>vendors</code></strong></td>
      <td><code>id, vendor_name, vendor_code, rev_share, default_cpi, status</code></td>
      <td>910+ active panel partners with permanent RevShare percentage.</td>
    </tr>
    <tr>
      <td><strong><code>vendor_allotments</code></strong></td>
      <td><code>id, project_id, vendor_id, vendor_cpi, quota_limit, complete_count</code></td>
      <td>Stores survey assignments, negotiated payout CPI, and entry links.</td>
    </tr>
    <tr>
      <td><strong><code>leads</code></strong></td>
      <td><code>id, project_id, vendor_id, respondent_id, status_code, ip_address</code></td>
      <td>High-speed click tracking and status logging for every respondent session.</td>
    </tr>
    <tr>
      <td><strong><code>payments</code></strong></td>
      <td><code>id, payment_id, vendor_id, amount, status, date</code></td>
      <td>Accounting ledger for vendor payouts (<code>Pending</code>, <code>Paid</code>, <code>Rejected</code>).</td>
    </tr>
    <tr>
      <td><strong><code>log_table</code></strong></td>
      <td><code>id, row_id, table_name, action, data_array, ip_address, user_id</code></td>
      <td>Real-time security and audit logs tracking every DB update and login.</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 3: AUTHENTICATION & LIVE SURVEYS -->
<div class="page-break"></div>

<h2 class="section-title">3. Authentication, RBAC & Granular Menu Permissions</h2>
<p>Security ko maintain rakhne ke liye platform par multi-role RBAC active hai:</p>

<table>
  <thead>
    <tr>
      <th>Role Name</th>
      <th>Menu Permission Access</th>
      <th>Operations Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="pill-badge pill-green">Developer</span></td>
      <td>All Menus (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)</td>
      <td>Full root access, code deployment, database alterations, API keys.</td>
    </tr>
    <tr>
      <td><span class="pill-badge pill-blue">Admin</span></td>
      <td>Menus 1, 6, 7, 8, 9, 10</td>
      <td>Operations management, survey allocation, vendor payout approvals.</td>
    </tr>
    <tr>
      <td><span class="pill-badge pill-amber">User</span></td>
      <td>Menus 1, 7, 8</td>
      <td>Study inspection, link generation, live traffic monitoring.</td>
    </tr>
  </tbody>
</table>

<h2 class="section-title">4. Active Surveys Hub & Zamplia Supply Engine</h2>
<p>Surveys Page (<code>#surveys</code>) par live studies available hoti hain. Table ke columns aur metrics:</p>

<table>
  <thead>
    <tr>
      <th>Field Name</th>
      <th>Meaning (Hinglish)</th>
      <th>Ideal Range</th>
      <th>Admin Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Checkbox</strong></td>
      <td>Multi-select checkbox</td>
      <td>Multi-Select</td>
      <td>10-15 surveys tick karke 1-click Bulk Assign karein.</td>
    </tr>
    <tr>
      <td><strong>Survey ID</strong></td>
      <td>Zamplia / MX unique study tracking number</td>
      <td>e.g. <code>90142</code></td>
      <td>Vendor link banane aur client dispute audit me use hota hai.</td>
    </tr>
    <tr>
      <td><strong>CPI ($)</strong></td>
      <td>Cost Per Interview (Client kitna dollar pay karega)</td>
      <td>$1.50 — $12.00+</td>
      <td>High CPI surveys ko priority supply partners ko allotte karein.</td>
    </tr>
    <tr>
      <td><strong>LOI (Min)</strong></td>
      <td>Length of Interview (Survey kitna lamba hai)</td>
      <td>8 — 15 Min</td>
      <td>Chhota LOI (&lt; 15 min) respondents jaldi complete karte hain.</td>
    </tr>
    <tr>
      <td><strong>IR (%)</strong></td>
      <td>Incidence Rate (100 me se kitne pass honge)</td>
      <td>50% — 90%</td>
      <td>High IR wale surveys me drop-off kam aur conversion rate high hota hai.</td>
    </tr>
    <tr>
      <td><strong>Capacity</strong></td>
      <td>Needed vs Completed Target</td>
      <td>e.g. <code>600 / 340</code></td>
      <td>Capacity full hote hi routing automatically pause ho jaati hai.</td>
    </tr>
  </tbody>
</table>

<div class="card card-highlight">
  <strong>🔘 Row Action Controls:</strong>
  <ul>
    <li><strong>Assign (<code>Share2</code> Icon):</strong> Single survey assignment modal kholta hai jaha vendor select karke customized tracking link generate hota hai.</li>
    <li><strong>Clone (<code>Copy</code> Icon):</strong> Study setup ko replicate karke naya target study create karta hai.</li>
    <li><strong>Quotas Modal:</strong> Sub-quota breakdown (Age, Gender, Region) dikhata hai ki kaunsa slot bhara hai aur kaunsa khali.</li>
    <li><strong>Quals Modal:</strong> Pre-screener questions aur qualification conditions show karta hai.</li>
  </ul>
</div>

<!-- PAGE 4: VENDOR ALLOTMENT & BULK ASSIGNMENT -->
<div class="page-break"></div>

<h2 class="section-title">5. Vendor Allotment & Bulk Survey Assignment (SOP)</h2>
<p>Supply vendors ko studies allot karne ke liye 2 efficient methods provide kiye gaye hain:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Single Survey Assignment:</div>
    <div>Row ke <strong>"Assign"</strong> button par click karein ➔ Dropdown se vendor select karein (e.g. Rohan) ➔ Vendor RevShare (e.g. 60% = $1.80) auto-calculate ho jayega ➔ Quota limit daalein ➔ Click <strong>"Generate Entry Link & Assign"</strong>.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Bulk Survey Assignment (10–15 Surveys at Once):</div>
    <div>Surveys table ke start me bane <strong>Checkboxes</strong> se 10 se 15 surveys tick karein ➔ Top table bar me <strong>"Bulk Assign to Vendor"</strong> button dabayein ➔ Vendor pick karein ➔ 1 click me saare studies MySQL <code>vendor_allotments</code> me allocate ho jayenge aur tracking links ki CSV download ho jayegi.</div>
  </div>
</div>

<div class="card card-highlight">
  <strong>🔗 Generated Universal Entry Link Anatomy:</strong>
  <div class="code-block">
https://smr.vmhgroupsmr.com/r.php?v=VND_ROHAN&sid=90142&rid=[RESPONDENT_ID]
  </div>
  <div style="font-size: 8pt; color: #475569; margin-top: 4px;">
    * <code>v</code> = Vendor Code (Rohan / PureSpectrum / Dynata)<br>
    * <code>sid</code> = Survey Study ID<br>
    * <code>rid</code> = Respondent ID Placeholder (Supports: <code>[RESPONDENT_ID]</code>, <code>[UID]</code>, <code>[#UID#]</code>, <code>vmhgroupss</code>, <code>[RID]</code>)
  </div>
</div>

<h2 class="section-title">6. Supply Partners Hub (910+ Vendors) & RevShare Persistence</h2>
<p>Vendors tab (<code>#vendors</code>) me system ke 910+ active panel partners live database se fetch hote hain:</p>

<div class="step-row">
  <div class="step-num">A</div>
  <div class="step-content">
    <div class="step-title">Instant Search:</div>
    <div>Search bar me vendor name ya vendor code type karein; 910 vendors sub-millisecond me filter ho jaate hain.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">B</div>
  <div class="step-content">
    <div class="step-title">RevShare Edit & Permanent MySQL Persistence:</div>
    <div>Jab kisi vendor (e.g. Rohan) ka RevShare 70% se badalkar <strong>60%</strong> karke Save dabate hain, to frontend direct authenticated API request bhejta hai jo MySQL <code>vendors</code> table me <code>UPDATE vendors SET rev_share = 60.00 WHERE id = 12</code> execute karta hai. Page refresh karein ya browser restart karein, RevShare permanently 60% hi save rehta hai.</div>
  </div>
</div>

<!-- PAGE 5: REPORTS HUB & S2S CALLBACKS -->
<div class="page-break"></div>

<h2 class="section-title">7. Consolidated Single-Click Reports Hub</h2>
<p>Pehele reports ke liye 5 alag tabs click karne padte the. Ab <strong>Reports Hub (<code>#reports</code>)</strong> single consolidated view me live hai:</p>

<div class="card card-success">
  <strong>📊 Comprehensive "View Details" Modal Drilldown:</strong>
  <ul>
    <li><strong>Study Details:</strong> Survey ID, Project Name, Country, Client CPI, Status.</li>
    <li><strong>Vendor Allotment List:</strong> Kis-kis vendor ko study di gayi hai aur unka individual quota.</li>
    <li><strong>Delivered Completes vs Target:</strong> Har vendor ne kitne actual completes deliver kiye.</li>
    <li><strong>Financial Margins:</strong> Gross Client Billed, Vendor Payable, aur Net VMH Profit Margin real-time calculate hota hai.</li>
    <li><strong>Pacing Meter:</strong> Dynamic progress bar jo show karta hai survey kitna percent complete hua hai.</li>
  </ul>
</div>

<h2 class="section-title">8. Traffic Router & S2S Postbacks (4 Status Codes)</h2>
<p>Incoming respondents <code>/r.php</code> se enter hote hain aur survey complete hone par client system 4 postback signals return karta hai:</p>

<table>
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Signal Type</th>
      <th>Outcome (Nateeja)</th>
      <th>System Action & Financial Settlement</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1 / 10</strong></td>
      <td><span class="pill-badge pill-green">COMPLETE</span></td>
      <td>Survey successfully verified ✅</td>
      <td>Vendor S2S Complete URL fire hota hai. Vendor ko payout credit, VMH revenue confirm.</td>
    </tr>
    <tr>
      <td><strong>2 / 20</strong></td>
      <td><span class="pill-badge pill-amber">TERMINATE</span></td>
      <td>Demographic / criteria screenout ❌</td>
      <td>Vendor Terminate URL return hota hai. Koi financial penalty nahi.</td>
    </tr>
    <tr>
      <td><strong>3 / 30</strong></td>
      <td><span class="pill-badge pill-blue">OVERQUOTA</span></td>
      <td>Target slots pehle hi full ho chuke the ⚠️</td>
      <td>Agar router enabled hai, to respondent ko instant doosre live survey me route kiya jata hai.</td>
    </tr>
    <tr>
      <td><strong>4 / 40</strong></td>
      <td><span class="pill-badge pill-red">SECURITY</span></td>
      <td>Fraud, VPN, Bot, Speeder pakda gaya 🚫</td>
      <td>Session terminated, IP blacklisted, 0 payout.</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 6: FRAUD SHIELD, HISTORY & MAINTENANCE -->
<div class="page-break"></div>

<h2 class="section-title">9. Multi-Layer Fraud Security & Device Fingerprint</h2>
<div class="card card-highlight">
  <strong>🛡️ 4 Active Security Shields:</strong>
  <ul>
    <li><strong>1. IP Quality Score & Datacenter VPN Shield:</strong> AWS, DigitalOcean, commercial proxies aur VPNs ko entry gate par hi drop kar deta hai.</li>
    <li><strong>2. Device Fingerprinting:</strong> HTML5 Canvas, WebGL renderer aur screen resolution scan karke unique hardware hash banata hai taaki duplicate entries block ho sakein.</li>
    <li><strong>3. Speeder Detection Engine:</strong> Survey ka minimum duration check karta hai (e.g. 15 min survey in 2 min = Auto Fraud Terminate).</li>
    <li><strong>4. Honeypot Traps:</strong> Bot spiders ko pakadne ke liye hidden trap fields use karta hai.</li>
  </ul>
</div>

<h2 class="section-title">10. Browser History & Deep Linking SOP</h2>
<ul>
  <li><strong>URL Hash Routing:</strong> Pages standard hash URLs (<code>#surveys</code>, <code>#reports</code>, <code>#vendors</code>, <code>#payments</code>) follow karte hain. Page refresh (<code>F5</code>) karne par aap bilkul usi page aur state par rahenge.</li>
  <li><strong>Modal Back-Button Interception:</strong> Jab koi popup (Details, Assign Modal, Quotas) open ho, to browser ka Back button dabane par poora page refresh hone ke bajaye sirf modal smoothly close hota hai aur screen scroll wahi rehta hai.</li>
</ul>

<h2 class="section-title">11. DevOps & Production Deployment Pipeline</h2>
<div class="card card-highlight">
  <strong>🚀 1-Click Production Deployment Procedure:</strong>
  <div class="code-block">
# 1. Compile React 18 production bundle
cd "c:\Users\shri hari computer\Downloads\smr1\client"
npm run build

# 2. Deploy to Hostinger Production Server (smr_v2 & api)
cd "c:\Users\shri hari computer\Downloads\smr1"
python "C:\Users\shri hari computer\.gemini\antigravity\brain\84f23ed8-58fe-4431-82c6-cc606978dd1d\scratch\deploy_smr_frontend.py"

# 3. Synchronize Git Version Control
git add .
git commit -m "Deployment update"
git push origin main
  </div>
</div>

<div style="margin-top: 24px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 8pt; color: #64748b;">
  <strong>VMH GROUP'S SMR ENTERPRISE PLATFORM</strong> • Proprietary Traffic Router & Marketplace • Confidential
</div>

</body>
</html>
"""

pdf_paths = [
    r"c:\Users\shri hari computer\Downloads\smr1\VMH_SMR_Admin_Guide_Hinglish.pdf",
    r"c:\Users\shri hari computer\Downloads\smr1\client\public\VMH_SMR_Admin_Guide_Hinglish.pdf",
    r"c:\Users\shri hari computer\Downloads\smr1\client\dist\VMH_SMR_Admin_Guide_Hinglish.pdf"
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_content(html_content, wait_until="networkidle")
    
    for path in pdf_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        page.pdf(
            path=path,
            format="A4",
            print_background=True,
            margin={"top": "10mm", "bottom": "10mm", "left": "10mm", "right": "10mm"}
        )
        print(f"Generated: {path} (Size: {os.path.getsize(path)} bytes)")
        
    browser.close()
print("All enterprise PDF operating guides created successfully!")
