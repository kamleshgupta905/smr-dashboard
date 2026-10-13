import os
import sys
from playwright.sync_api import sync_playwright

html_content = r"""<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<title>VMH SMR Enterprise Portal - Complete 30-Page Operator & User Handbook</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
  
  @page {
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
    @bottom-right {
      content: "Page " counter(page);
      font-size: 8pt;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      color: #64748b;
    }
    @bottom-left {
      content: "VMH GROUP • SMR Portal User & Operator Handbook (Step-by-Step)";
      font-size: 8pt;
      font-family: 'Inter', sans-serif;
      color: #94a3b8;
    }
    @top-right {
      content: "Official Operations Manual";
      font-size: 7.5pt;
      font-family: 'Inter', sans-serif;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 9pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  h1, h2, h3, h4 {
    font-family: 'Montserrat', sans-serif;
    color: #0c213a;
    margin-top: 0;
    letter-spacing: -0.2px;
  }

  .page-break {
    page-break-before: always;
  }

  /* Cover Page Styling */
  .cover-page {
    display: flex;
    flex-direction: column;
    justifyContent: space-between;
    min-height: 92vh;
    padding: 20px 10px;
    border-bottom: 5px solid #1761fd;
  }

  .cover-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .logo-box {
    background: #0c213a;
    color: #ffffff;
    padding: 12px 22px;
    border-radius: 8px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    font-size: 20pt;
    letter-spacing: -0.5px;
  }

  .cover-title-section {
    margin-top: 50px;
  }

  .badge-tag {
    display: inline-block;
    background: #eef4ff;
    color: #1761fd;
    font-weight: 800;
    font-size: 8.5pt;
    padding: 6px 16px;
    border-radius: 20px;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border: 1px solid #c7d8fe;
  }

  .cover-title {
    font-size: 27pt;
    line-height: 1.25;
    font-weight: 900;
    color: #0c213a;
    margin-bottom: 16px;
  }

  .cover-subtitle {
    font-size: 11pt;
    color: #475569;
    max-width: 640px;
    margin-bottom: 26px;
    line-height: 1.6;
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    margin-top: 30px;
  }

  .meta-item {
    font-size: 8.5pt;
  }

  .meta-label {
    color: #64748b;
    font-weight: 700;
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

  /* Section Titles */
  .section-title {
    font-size: 13.5pt;
    font-weight: 800;
    color: #0c213a;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 6px;
    margin-top: 10px;
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

  .chapter-header {
    background: #f1f5f9;
    border-left: 4px solid #1761fd;
    padding: 8px 12px;
    margin-bottom: 14px;
    border-radius: 0 6px 6px 0;
  }

  .chapter-num {
    font-size: 7.5pt;
    font-weight: 800;
    color: #1761fd;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .chapter-title {
    font-size: 12.5pt;
    font-weight: 800;
    color: #0c213a;
    margin: 2px 0 0 0;
  }

  /* Cards & Callouts */
  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 11px 13px;
    margin-bottom: 11px;
    font-size: 8.8pt;
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

  .card-danger {
    background: #fef2f2;
    border-left: 4px solid #dc2626;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 9px 0 13px 0;
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
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  /* Badges & Buttons Simulation */
  .btn-sim {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 700;
    text-align: center;
    border: 1px solid transparent;
  }
  .btn-blue { background: #1761fd; color: #ffffff; }
  .btn-light { background: #f1f5f9; color: #0c213a; border-color: #cbd5e1; }
  .btn-green { background: #16a34a; color: #ffffff; }
  .btn-amber { background: #f59e0b; color: #ffffff; }
  .btn-red { background: #dc2626; color: #ffffff; }

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
    font-size: 9.3pt;
    margin-bottom: 2px;
  }

  .code-block {
    background: #0f172a;
    color: #38bdf8;
    padding: 7px 11px;
    border-radius: 5px;
    font-family: 'JetBrains Mono', Courier, monospace;
    font-size: 7.8pt;
    margin: 5px 0;
    word-break: break-all;
  }

  ul, ol {
    margin: 4px 0 8px 0;
    padding-left: 18px;
  }

  li {
    margin-bottom: 3px;
  }

  .toc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
    margin-top: 14px;
  }

  .toc-item {
    font-size: 8.2pt;
    padding: 4px 0;
    border-bottom: 1px dotted #cbd5e1;
    display: flex;
    justify-content: space-between;
  }
  .toc-title { font-weight: 600; color: #0c213a; }
  .toc-page { font-weight: 700; color: #1761fd; }
</style>
</head>
<body>

<!-- ==========================================
     PAGE 1: COVER PAGE
     ========================================== -->
<div class="cover-page">
  <div class="cover-header">
    <div class="logo-box">VMH GROUP</div>
    <div>
      <div style="font-weight: 900; font-size: 12pt; color: #0c213a;">SURVEY MARKETPLACE & TRAFFIC ROUTER</div>
      <div style="font-size: 8pt; color: #64748b;">Official Non-Technical User & Operator Handbook • Version 3.4</div>
    </div>
  </div>

  <div class="cover-title-section">
    <span class="badge-tag">100% Practical • Visual UI Operations Guide</span>
    <h1 class="cover-title">VMH SMR Portal<br>Complete Operator Handbook</h1>
    <p class="cover-subtitle">
      Ye manual kisi developer ya engineer ke liye nahi, balki <strong>Portal Admin, Operations Team, Campaign Managers aur Daily Staff</strong> ke liye banaya gaya hai. Isme bilkul simple bhasha me samjhaya gaya hai ki <strong>kaunsa button dabane se kya hoga</strong>, surveys kaise search karne hain, vendor ko kaise link bhejna hai, payments kaise check karni hain, aur har feature ko bina kisi technical knowledge ke kaise asani se use karna hai.
    </p>
  </div>

  <div class="cover-meta-grid">
    <div class="meta-item">
      <span class="meta-label">Live Platform Login URL</span>
      <span class="meta-value">https://smr.vmhgroupsmr.com/</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Master Admin Credentials</span>
      <span class="meta-value">Username: <strong>vmhgroup</strong> | Password: <strong>Jelly</strong></span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Primary Daily Function</span>
      <span class="meta-value">Survey Allocation, Vendor Links & Profit Tracking</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Live Supply Directory</span>
      <span class="meta-value">910+ Active Panel Partners (Zero Fake/Demo Data)</span>
    </div>
  </div>
</div>

<!-- ==========================================
     PAGE 2: TABLE OF CONTENTS (INDEX)
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Quick Navigation</div>
  <h2 class="chapter-title">📑 Table of Contents (Vishay Suchi)</h2>
</div>

<p>Is handbook me total 30 chapters hain. Har chapter me ek specific screen ya feature ko step-by-step detail me samjhaya gaya hai:</p>

<div class="toc-grid">
  <div>
    <div class="toc-item"><span class="toc-title">1. Portal Introduction & First Login</span><span class="toc-page">Page 3</span></div>
    <div class="toc-item"><span class="toc-title">2. Top Navigation Bar (Header Buttons)</span><span class="toc-page">Page 4</span></div>
    <div class="toc-item"><span class="toc-title">3. Sidebar Menu (All 12 Navigation Tabs)</span><span class="toc-page">Page 5</span></div>
    <div class="toc-item"><span class="toc-title">4. Dashboard Overview (KPI Cards & Charts)</span><span class="toc-page">Page 6</span></div>
    <div class="toc-item"><span class="toc-title">5. Active Surveys Hub (Search & Filters)</span><span class="toc-page">Page 7</span></div>
    <div class="toc-item"><span class="toc-title">6. Active Surveys Table (Columns Meaning)</span><span class="toc-page">Page 8</span></div>
    <div class="toc-item"><span class="toc-title">7. Row Action Buttons (Assign, Clone, etc.)</span><span class="toc-page">Page 9</span></div>
    <div class="toc-item"><span class="toc-title">8. Quotas & Quals Inspectors (Slots Check)</span><span class="toc-page">Page 10</span></div>
    <div class="toc-item"><span class="toc-title">9. Single Survey Vendor Assignment SOP</span><span class="toc-page">Page 11</span></div>
    <div class="toc-item"><span class="toc-title">10. Bulk Survey Assignment (10-15 Surveys)</span><span class="toc-page">Page 12</span></div>
    <div class="toc-item"><span class="toc-title">11. Tracking Entry Links & UID Tags</span><span class="toc-page">Page 13</span></div>
    <div class="toc-item"><span class="toc-title">12. Supply Partners Hub (910+ Vendors)</span><span class="toc-page">Page 14</span></div>
    <div class="toc-item"><span class="toc-title">13. Editing & Saving RevShare (70% ➔ 60%)</span><span class="toc-page">Page 15</span></div>
    <div class="toc-item"><span class="toc-title">14. Adding a New Supply Vendor</span><span class="toc-page">Page 16</span></div>
    <div class="toc-item"><span class="toc-title">15. Consolidated Reports Hub (Single-Click)</span><span class="toc-page">Page 17</span></div>
  </div>
  <div>
    <div class="toc-item"><span class="toc-title">16. Deep "View Details" Modal in Reports</span><span class="toc-page">Page 18</span></div>
    <div class="toc-item"><span class="toc-title">17. Demand Clients Hub (Survey Buyers)</span><span class="toc-page">Page 19</span></div>
    <div class="toc-item"><span class="toc-title">18. Projects & Campaigns Management</span><span class="toc-page">Page 20</span></div>
    <div class="toc-item"><span class="toc-title">19. Financial Ledger & Vendor Payments</span><span class="toc-page">Page 21</span></div>
    <div class="toc-item"><span class="toc-title">20. 1-Click Bank Batch Payout File (CSV)</span><span class="toc-page">Page 22</span></div>
    <div class="toc-item"><span class="toc-title">21. Zamplia Month-End Reconciliation</span><span class="toc-page">Page 23</span></div>
    <div class="toc-item"><span class="toc-title">22. Traffic Router & Live Leads Monitor</span><span class="toc-page">Page 24</span></div>
    <div class="toc-item"><span class="toc-title">23. The 4 Callback Status Codes (1,2,3,4)</span><span class="toc-page">Page 25</span></div>
    <div class="toc-item"><span class="toc-title">24. Security Shield & IP Blacklisting</span><span class="toc-page">Page 26</span></div>
    <div class="toc-item"><span class="toc-title">25. User Management & Menu Permissions</span><span class="toc-page">Page 27</span></div>
    <div class="toc-item"><span class="toc-title">26. Change Password & Account Profile</span><span class="toc-page">Page 28</span></div>
    <div class="toc-item"><span class="toc-title">27. Daily Morning SOP (9:00 AM Routine)</span><span class="toc-page">Page 29</span></div>
    <div class="toc-item"><span class="toc-title">28. Daily Evening SOP (Closing Routine)</span><span class="toc-page">Page 30</span></div>
    <div class="toc-item"><span class="toc-title">29. Operator FAQ & Troubleshooting (Q1-Q8)</span><span class="toc-page">Page 31</span></div>
    <div class="toc-item"><span class="toc-title">30. Operator FAQ & Troubleshooting (Q9-Q15)</span><span class="toc-page">Page 32</span></div>
  </div>
</div>

<!-- ==========================================
     PAGE 3: CHAPTER 1 - FIRST LOGIN & ACCESS
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 1</div>
  <h2 class="chapter-title">🔐 Portal Introduction & First-Time Login</h2>
</div>

<p>VMH SMR Portal market research survey business ka core software hai. Isme aap surveys dhoondhte hain, apne panel vendors ko assign karte hain, aur live tracking dekhte hain.</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Browser Kholna:</div>
    <div>Google Chrome, Microsoft Edge ya Firefox open karein. URL bar me type karein: <strong>https://smr.vmhgroupsmr.com/</strong></div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Login Credentials Enter Karna:</div>
    <div>Aapke screen par clean modern login card aayega.
      <ul>
        <li><strong>Username</strong> field me daalein: <code>vmhgroup</code></li>
        <li><strong>Password</strong> field me daalein: <code>Jelly</code></li>
      </ul>
    </div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">"Sign In" Button Dabayein:</div>
    <div>Blue <strong>"Sign In"</strong> button click karein. System 1 second me authenticate karke seedha main Dashboard par le aayega.</div>
  </div>
</div>

<div class="card card-warning">
  <strong>⚠️ Dhyan Dene Wali Baat:</strong>
  <ul>
    <li>Username aur Password case-sensitive hote hain (Jelly me <strong>J</strong> capital hai).</li>
    <li>Agar kisi team member ka alag account banaya gaya hai, to wo apna allotted username aur password use karega.</li>
    <li>Aapko baar-baar login karne ki zaroorat nahi padti, browser aapka secure session yaad rakhta hai.</li>
  </ul>
</div>

<!-- ==========================================
     PAGE 4: CHAPTER 2 - TOP NAVIGATION BAR
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 2</div>
  <h2 class="chapter-title">🧭 Top Navigation Bar (Header Buttons Ka Kaam)</h2>
</div>

<p>Har page par upar ek horizontal navigation bar hota hai. Yaha 5 sabse important controls hote hain:</p>

<table>
  <thead>
    <tr>
      <th>Control / Button</th>
      <th>Kaha Dikhayi Deta Hai</th>
      <th>Dabane Par Kya Hota Hai</th>
      <th>Kab Istemal Karein</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>VMH Logo & Brand</strong></td>
      <td>Top-Left corner par</td>
      <td>Is par click karne se seedha Dashboard (Home) open ho jata hai.</td>
      <td>Kisi bhi page se turant main dashboard par aane ke liye.</td>
    </tr>
    <tr>
      <td><span class="pill-badge pill-green">● SYSTEM ONLINE</span></td>
      <td>Logo ke bagal me</td>
      <td>Ye live server health status indicator hai. Green ka matlab sab kuch 100% chal raha hai.</td>
      <td>Dekhne ke liye ki network connection aur server theek kaam kar rahe hain.</td>
    </tr>
    <tr>
      <td><strong>Search Bar</strong></td>
      <td>Center-Left header</td>
      <td>Yaha survey number ya vendor name likhne par instant search results aate hain.</td>
      <td>Jab jaldi se kisi specific survey ID ya vendor ko dhoondhna ho.</td>
    </tr>
    <tr>
      <td><span class="btn-sim btn-blue">Sync</span></td>
      <td>Center-Right header</td>
      <td><strong>Sabse important button!</strong> Isko dabate hi Zamplia ke saare live surveys, naye CPI aur updated quotas turant sync ho jaate hain.</td>
      <td>Roz subah 9:00 AM kaam shuru karte waqt aur har 2-3 ghante me ek baar zaroor dabayein.</td>
    </tr>
    <tr>
      <td><strong>Profile & Logout</strong></td>
      <td>Top-Right corner par</td>
      <td>Admin image aur naam dikhta hai. Click karne par <strong>"Logout"</strong> option aata hai.</td>
      <td>Kaam khatam hone par portal secure tarike se band karne ke liye.</td>
    </tr>
  </tbody>
</table>

<div class="card card-highlight">
  <strong>💡 Admin Meeting Note (Important Fix Applied):</strong>
  <p>Admin ne meeting me kaha tha ki header me sirf <strong>"Sync"</strong> likha hona chahiye, "Sync Zamplia" nahi. Isko update kar diya gaya hai aur ab waha clean blue <strong>"Sync"</strong> button dikhta hai jo 1 click me poori inventory refresh karta hai.</p>
</div>

<!-- ==========================================
     PAGE 5: CHAPTER 3 - SIDEBAR NAVIGATION
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 3</div>
  <h2 class="chapter-title">📑 Sidebar Menu (All 12 Navigation Tabs)</h2>
</div>

<p>Left side me vertical dark blue navigation bar hai. Isme saare functional modules listed hain:</p>

<table>
  <thead>
    <tr>
      <th>Menu Icon & Name</th>
      <th>URL Hash Slug</th>
      <th>Is Page Par Kya Kaam Hota Hai</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>📊 Dashboard</strong></td>
      <td><code>#dashboard</code></td>
      <td>Poore business ka live summary, total revenue, completes count, aur performance charts.</td>
    </tr>
    <tr>
      <td><strong>📋 Active Surveys</strong></td>
      <td><code>#surveys</code></td>
      <td>Saare live surveys ki list. Yahi se vendor ko single ya bulk surveys assign kiye jaate hain.</td>
    </tr>
    <tr>
      <td><strong>📈 Reports Hub</strong></td>
      <td><code>#reports</code></td>
      <td>Single-click consolidated reports. Survey-wise vendor allocation, complete count, aur profit margins.</td>
    </tr>
    <tr>
      <td><strong>🤝 Supply Partners</strong></td>
      <td><code>#vendors</code></td>
      <td>910+ panel partners ki directory. Vendor add karna, search karna aur RevShare (60%) set karna.</td>
    </tr>
    <tr>
      <td><strong>🏢 Demand Clients</strong></td>
      <td><code>#clients</code></td>
      <td>Survey buyers (Zamplia, Market Xcel, Dynata). Unke S2S callback links manage karna.</td>
    </tr>
    <tr>
      <td><strong>📁 Projects / Campaigns</strong></td>
      <td><code>#projects</code></td>
      <td>Surveys ko campaign me group karna (e.g. Healthcare, B2B, Automotive).</td>
    </tr>
    <tr>
      <td><strong>💳 Payments & Ledger</strong></td>
      <td><code>#payments</code></td>
      <td>Vendor ki monthly earnings, invoices, Paid/Pending status aur 1-click Bank Batch File download.</td>
    </tr>
    <tr>
      <td><strong>🔄 Reconciliation</strong></td>
      <td><code>#reconciliation</code></td>
      <td>Zamplia server se data match karna taaki month-end par koi complete miss na ho.</td>
    </tr>
    <tr>
      <td><strong>🛡️ Traffic Router & Leads</strong></td>
      <td><code>#router</code></td>
      <td>Live clicks monitor karna, respondent ID track karna, aur fraud IP block karna.</td>
    </tr>
    <tr>
      <td><strong>👥 User Management</strong></td>
      <td><code>#users</code></td>
      <td>Team members ke accounts banana aur unko specific menus ka access dena.</td>
    </tr>
    <tr>
      <td><strong>🔑 Change Password</strong></td>
      <td><code>#changepassword</code></td>
      <td>Apna portal login password change karna.</td>
    </tr>
  </tbody>
</table>

<!-- ==========================================
     PAGE 6: CHAPTER 4 - DASHBOARD OVERVIEW
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 4</div>
  <h2 class="chapter-title">📊 Dashboard Overview (KPI Cards & Charts)</h2>
</div>

<p>Login karte hi sabse pehle **Dashboard** screen open hoti hai. Yaha 6 core KPI summary cards dikhte hain:</p>

<table>
  <thead>
    <tr>
      <th>Card Ka Naam</th>
      <th>Kya Number Dikhata Hai</th>
      <th>Admin Ke Liye Iska Kya Matlab Hai</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Active Live Surveys</strong></td>
      <td>Total active studies count (e.g. <code>626</code>)</td>
      <td>Marketplace me abhi kitne surveys live chal rahe hain jinko traffic diya ja sakta hai.</td>
    </tr>
    <tr>
      <td><strong>Goal Completions</strong></td>
      <td>Total verified completes (e.g. <code>1,420</code>)</td>
      <td>Panelists ne aaj kitne surveys successfully 100% complete kiye hain.</td>
    </tr>
    <tr>
      <td><strong>Average CPI ($)</strong></td>
      <td>Average Cost Per Interview (e.g. <code>$3.45</code>)</td>
      <td>Client se har complete par average kitna dollar amount mil raha hai.</td>
    </tr>
    <tr>
      <td><strong>Total Revenue ($)</strong></td>
      <td>Gross Billed Dollars (e.g. <code>$4,899.00</code>)</td>
      <td>Aaj ya is mahine ki total billing value.</td>
    </tr>
    <tr>
      <td><strong>Active Supply Partners</strong></td>
      <td>Traffic bhejne wale vendors (e.g. <code>910</code>)</td>
      <td>Portal me registered live supply vendors ki sankhya.</td>
    </tr>
    <tr>
      <td><strong>Conversion Rate</strong></td>
      <td>Percentage Conversion (e.g. <code>18.4%</code>)</td>
      <td>Total clicks me se kitne percent completes me convert hue. Ideal range: 12% - 25%.</td>
    </tr>
  </tbody>
</table>

<div class="card card-highlight">
  <strong>📈 Dashboard Ke 2 Main Charts:</strong>
  <ul>
    <li><strong>Daily Delivery Volume Bar Chart:</strong> Dikhata hai kis din kitna traffic aaya aur kitne completes deliver hue.</li>
    <li><strong>Live Activity Stream:</strong> Neeche live table chalta hai jisme real-time me aane wale completes blink hote hain.</li>
  </ul>
</div>

<!-- ==========================================
     PAGE 7: CHAPTER 5 - ACTIVE SURVEYS HUB
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 5</div>
  <h2 class="chapter-title">📋 Active Surveys Hub (Search & Filters Engine)</h2>
</div>

<p>Sidebar me <strong>"Active Surveys"</strong> par click karein. Yaha sabhi live surveys available hote hain. Sabse upar filter bar hai jisse aap manchaha survey 2 second me dhoondh sakte hain:</p>

<table>
  <thead>
    <tr>
      <th>Filter Ka Naam</th>
      <th>UI Control Type</th>
      <th>Kaise Istemal Karein (Example)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Search Box</strong></td>
      <td>Text input field</td>
      <td>Survey number type karein (e.g. <code>90142</code>) ya client name (e.g. <code>Zamplia</code>). Type karte hi table filter ho jata hai.</td>
    </tr>
    <tr>
      <td><strong>Country Filter</strong></td>
      <td>Dropdown list</td>
      <td>Click karke country select karein (e.g. <code>United States</code>, <code>United Kingdom</code>, <code>India</code>). Sirf usi desh ke surveys dikhenge.</td>
    </tr>
    <tr>
      <td><strong>CPI Price Filter</strong></td>
      <td>Price range selector</td>
      <td>Options: <code>All</code>, <code>$0 - $2.00</code>, <code>$2.00 - $5.00</code>, <code>$5.00+</code>. High paying surveys nikalne ke liye <strong>$5.00+</strong> chunein.</td>
    </tr>
    <tr>
      <td><strong>Status Filter</strong></td>
      <td>Dropdown list</td>
      <td>Options: <code>Active</code>, <code>Paused</code>, <code>Closed</code>. Hamesha <strong>Active</strong> select rakhein taaki live survey hi milein.</td>
    </tr>
    <tr>
      <td><strong>Reset Filters</strong></td>
      <td><span class="btn-sim btn-light">Reset</span> button</td>
      <td>Saare search aur filters ko clear karke wapas normal default view me lane ke liye.</td>
    </tr>
  </tbody>
</table>

<div class="card card-success">
  <strong>💡 High-Yield Survey Dhoondhne Ka Trick:</strong>
  <p>Country me <strong>US</strong> select karein aur CPI me <strong>$5.00+</strong> select karein. Screen par top high-paying surveys aa jayenge jinhe aap apne sabse ache vendors ko turant assign kar sakte hain.</p>
</div>

<!-- ==========================================
     PAGE 8: CHAPTER 6 - SURVEYS TABLE COLUMNS
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 6</div>
  <h2 class="chapter-title">📑 Active Surveys Table (Columns Ka Simple Matlab)</h2>
</div>

<p>Filter bar ke theek neeche main surveys table hoti hai. Isme 10 columns hote hain:</p>

<table>
  <thead>
    <tr>
      <th>Column Header</th>
      <th>Kya Dikhata Hai</th>
      <th>Example Value</th>
      <th>Admin Action & Importance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>[ ] (Checkbox)</strong></td>
      <td>Selection square box</td>
      <td>Tick / Untick</td>
      <td>Ek ya ek se zyada surveys select karke <strong>Bulk Assign</strong> karne ke liye.</td>
    </tr>
    <tr>
      <td><strong>#</strong></td>
      <td>Serial index number</td>
      <td><code>1, 2, 3...</code></td>
      <td>Row identification.</td>
    </tr>
    <tr>
      <td><strong>Survey ID</strong></td>
      <td>Unique study number</td>
      <td><code>90142</code></td>
      <td>Zamplia ka tracking code. Vendor link banane me yahi ID use hoti hai.</td>
    </tr>
    <tr>
      <td><strong>Project / Client</strong></td>
      <td>Buyer & study title</td>
      <td><code>Zamplia Auto Study</code></td>
      <td>Pata chalta hai kis client ka survey hai aur kis vishay par hai.</td>
    </tr>
    <tr>
      <td><strong>Country</strong></td>
      <td>Country flag & code</td>
      <td><code>US - English</code></td>
      <td>Target country. Galat country me link share na karein.</td>
    </tr>
    <tr>
      <td><strong>LOI (Min)</strong></td>
      <td>Length of Interview</td>
      <td><code>12 Min</code></td>
      <td>Survey kitna lamba hai. 10-15 minute ke surveys sabse fast complete hote hain.</td>
    </tr>
    <tr>
      <td><strong>IR (%)</strong></td>
      <td>Incidence Rate</td>
      <td><code>75%</code></td>
      <td>100 me se kitne log pass honge. High IR (>70%) wale surveys me screenout kam hota hai.</td>
    </tr>
    <tr>
      <td><strong>CPI ($)</strong></td>
      <td>Client Dollar Payout</td>
      <td><code>$3.50</code></td>
      <td>Client ek complete hone par itna dollar amount dega.</td>
    </tr>
    <tr>
      <td><strong>Capacity</strong></td>
      <td>Target vs Done</td>
      <td><code>500 / 120</code></td>
      <td>500 completes chahiye the, 120 ho chuke hain, 380 baaki hain.</td>
    </tr>
    <tr>
      <td><strong>Actions</strong></td>
      <td>Right side action group</td>
      <td>Sticky buttons</td>
      <td><strong>Assign, Clone, Quotas, Quals</strong> buttons yahi hote hain.</td>
    </tr>
  </tbody>
</table>

<!-- ==========================================
     PAGE 9: CHAPTER 7 - ROW ACTION BUTTONS
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 7</div>
  <h2 class="chapter-title">🔘 Row Action Buttons (Har Icon Ka Detailed Kaam)</h2>
</div>

<p>Surveys table ke right side me <strong>Actions</strong> column hamesha visible (sticky) rehta hai. Isme 5 controls hote hain:</p>

<table>
  <thead>
    <tr>
      <th>Button Icon & Text</th>
      <th>Button Ka Rang</th>
      <th>Dabane Par Kya Open Hoga</th>
      <th>Kaise Use Karein</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="btn-sim btn-blue">Assign</span></td>
      <td>Blue Pill Button</td>
      <td><strong>"Assign to Vendor"</strong> popup modal khulta hai.</td>
      <td>Kisi specific vendor ko survey dene aur uska dynamic link banane ke liye.</td>
    </tr>
    <tr>
      <td><span class="btn-sim btn-light">Clone</span></td>
      <td>Gray Border Button</td>
      <td>Is study ki exact duplicate copy create ho jati hai.</td>
      <td>Jab same survey doosre project name se chalana ho.</td>
    </tr>
    <tr>
      <td><strong>📊 Quotas Icon</strong></td>
      <td>Bar Chart Icon</td>
      <td><strong>"Quotas Inspector"</strong> popup modal open hota hai.</td>
      <td>Check karne ke liye ki Age, Gender, ya Region me kaunsi seat khali hai.</td>
    </tr>
    <tr>
      <td><strong>🔍 Quals Icon</strong></td>
      <td>Filter Funnel Icon</td>
      <td><strong>"Qualifications Inspector"</strong> popup open hota hai.</td>
      <td>Targeting questions (e.g. Job Title, Income) aur screening rules dekhne ke liye.</td>
    </tr>
    <tr>
      <td><strong>▼ Expand Arrow</strong></td>
      <td>Chevron Icon</td>
      <td>Table row ke neeche inline details panel open hota hai.</td>
      <td>Survey ke bare me full technical overview dekhne ke liye.</td>
    </tr>
  </tbody>
</table>

<div class="card card-highlight">
  <strong>💡 Layout Sizing Update:</strong>
  <p>Pehle buttons screen ke right side cut ho rahe the. Humne layout optimize karke buttons ko compact banaya hai aur <strong>Actions</strong> column ko right edge par sticky pin kar diya hai taaki choti laptop screen par bhi ye buttons kabhi gayab na hon.</p>
</div>

<!-- ==========================================
     PAGE 10: CHAPTER 8 - QUOTAS & QUALS
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 8</div>
  <h2 class="chapter-title">📊 Quotas & Quals Inspectors (Slots Check Karna)</h2>
</div>

<p>Survey allocate karne se pehle ye check karna zaroori hota hai ki survey me kis category ke respondents chahiye.</p>

<div class="section-title">1. Quotas Inspector (Bar Chart Icon dabane par)</div>
<p>Jab aap bar chart icon click karte hain, to ek modal open hota hai jo survey ke demographic buckets dikhata hai:</p>

<table>
  <thead>
    <tr>
      <th>Quota Category</th>
      <th>Target Group</th>
      <th>Total Required</th>
      <th>Achieved (Done)</th>
      <th>Remaining Slots</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Gender</strong></td>
      <td>Male</td>
      <td>250</td>
      <td>250</td>
      <td>0</td>
      <td><span class="pill-badge pill-red">FULL</span></td>
    </tr>
    <tr>
      <td><strong>Gender</strong></td>
      <td>Female</td>
      <td>250</td>
      <td>110</td>
      <td>140</td>
      <td><span class="pill-badge pill-green">OPEN</span></td>
    </tr>
    <tr>
      <td><strong>Age Group</strong></td>
      <td>18 - 24 Years</td>
      <td>100</td>
      <td>45</td>
      <td>55</td>
      <td><span class="pill-badge pill-green">OPEN</span></td>
    </tr>
    <tr>
      <td><strong>Age Group</strong></td>
      <td>25 - 34 Years</td>
      <td>150</td>
      <td>150</td>
      <td>0</td>
      <td><span class="pill-badge pill-red">FULL</span></td>
    </tr>
  </tbody>
</table>

<div class="card card-warning">
  <strong>⚠️ Actionable Operator Tip:</strong>
  <p>Upar ke example me <strong>Male quota FULL</strong> ho chuka hai. Agar aapka vendor Male traffic bhejega to unka screenout (Overquota) ho jayega. Apne vendor ko bolen ki sirf <strong>Female (18-24)</strong> panelists ko invite kare.</p>
</div>

<div class="section-title">2. Quals Inspector (Filter Funnel Icon dabane par)</div>
<p>Is modal me pre-screening questions dikhte hain jaise: <em>"Are you the primary IT decision maker?"</em> ya <em>"Annual Household Income > $50,000"</em>. Yaha se question ke answer codes milte hain jo vendor ko screening me madad karte hain.</p>

<!-- ==========================================
     PAGE 11: CHAPTER 9 - SINGLE SURVEY ASSIGNMENT
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 9</div>
  <h2 class="chapter-title">🔗 Single Survey Vendor Assignment (Step-by-Step SOP)</h2>
</div>

<p>Kisi ek specific survey ko kisi ek vendor (jaise Rohan) ko assign karne ka pura step-by-step process:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">"Assign" Button Par Click Karein:</div>
    <div>Jis survey ko dena hai, uski row me blue <span class="btn-sim btn-blue">Assign</span> button click karein. <strong>"Assign Survey to Vendor"</strong> popup open ho jayega.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Supply Vendor Chunein:</div>
    <div><strong>"Select Supply Partner"</strong> dropdown par click karein aur list me se vendor select karein (e.g. <code>Rohan - VND_901</code>).</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">Vendor CPI / Payout Check Karein:</div>
    <div>Client CPI auto-filled rehta hai (e.g. $3.00). Agar vendor ka RevShare 60% hai, to system automatically Vendor CPI <strong>$1.80</strong> set kar deta hai. Agar aapko koi custom rate dena hai (jaise $1.50), to yaha manually type kar sakte hain.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">4</div>
  <div class="step-content">
    <div class="step-title">Quota Limit Daalein:</div>
    <div>Vendor ko kitne completes deliver karne hain wo number daalein (e.g. <code>100</code>).</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">5</div>
  <div class="step-content">
    <div class="step-title">"Generate Entry Link & Assign" Dabayein:</div>
    <div>Green button click karein. Popup me instant unique tracking link ban kar aa jayega:</div>
    <div class="code-block">https://smr.vmhgroupsmr.com/r.php?v=VND_ROHAN&sid=90142&rid=[RESPONDENT_ID]</div>
    <div>Blue <strong>"Copy Link"</strong> button dabayein aur Skype / Email / WhatsApp par apne vendor ko bhej dein!</div>
  </div>
</div>

<!-- ==========================================
     PAGE 12: CHAPTER 10 - BULK SURVEY ASSIGNMENT
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 10</div>
  <h2 class="chapter-title">📦 Bulk Survey Assignment (10-15 Surveys Ek Sath)</h2>
</div>

<p>Jab aapke vendor ko ek ya do nahi, balki 10 se 15 surveys ek sath assign karne hon, to baar-baar ek-ek karke assign karne ki zaroorat nahi hai:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Surveys Ke Checkboxes Tick Karein:</div>
    <div>Surveys table me pehle column me bane square boxes ko click karein. Aap jitne chahe utne surveys select kar sakte hain (e.g. 12 surveys tick karein).</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">"Bulk Actions" Banner Par Dhyan Dein:</div>
    <div>Jaise hi aap 2 ya zyada surveys tick karte hain, table ke upar ek blue action banner appear ho jata hai jisme likha hota hai: <strong>"12 Surveys Selected"</strong> aur ek bada button aata hai: <span class="btn-sim btn-blue">Bulk Assign to Vendor</span>.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">"Bulk Assign to Vendor" Button Dabayein:</div>
    <div>Is button par click karte hi <strong>"Bulk Survey Allocation Modal"</strong> khulega.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">4</div>
  <div class="step-content">
    <div class="step-title">Vendor Aur Quota Set Karein:</div>
    <div>
      <ul>
        <li>Dropdown se vendor select karein (e.g. <code>Rohan</code>).</li>
        <li>Vendor ka RevShare share verify karein (e.g. 60%).</li>
        <li>Quota Per Survey set karein (e.g. 50 completes each).</li>
      </ul>
    </div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">5</div>
  <div class="step-content">
    <div class="step-title">"Confirm & Allocate All Selected" Dabayein:</div>
    <div>1 click me saare 12 surveys Rohan ko allocate ho jaate hain. Screen par turant ek popup aayega jisme <strong>"Download All Links (CSV)"</strong> button hoga. Is par click karte hi Excel/CSV sheet download ho jayegi jisme saare 12 surveys ke tracking links ready honge!</div>
  </div>
</div>

<!-- ==========================================
     PAGE 13: CHAPTER 11 - TRACKING LINKS & UID
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 11</div>
  <h2 class="chapter-title">🔗 Tracking Entry Links & UID Tags Ko Samajhna</h2>
</div>

<p>Jab aap vendor ko link dete hain, to vendor aapse poochta hai ki: <em>"Isme respondent ID kisme pass karni hai?"</em>. Yaha link ka structure samjhein:</p>

<div class="card card-highlight">
  <strong>🔍 Link Ka Example:</strong>
  <div class="code-block">https://smr.vmhgroupsmr.com/r.php?v=VND_ROHAN&sid=90142&rid=[RESPONDENT_ID]</div>
</div>

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Iska Kya Matlab Hai</th>
      <th>Kya Isko Badalte Hain?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>https://smr.vmhgroupsmr.com/r.php</code></td>
      <td>VMH SMR Portal ka live router entry point.</td>
      <td>Kabhi nahi badalna.</td>
    </tr>
    <tr>
      <td><code>v=VND_ROHAN</code></td>
      <td>Vendor Code (Pata chalta hai ye Rohan ka traffic hai).</td>
      <td>System automatically vendor select karne par daalta hai.</td>
    </tr>
    <tr>
      <td><code>sid=90142</code></td>
      <td>Survey ID number.</td>
      <td>Zamplia study ka ID hota hai.</td>
    </tr>
    <tr>
      <td><code>rid=[RESPONDENT_ID]</code></td>
      <td>Panelist / Respondent ID placeholder.</td>
      <td>Vendor ka system apne panelist ka unique ID yaha inject karega.</td>
    </tr>
  </tbody>
</table>

<div class="section-title">Supported UID Tags:</div>
<p>Agar vendor bole ki uska system <code>[UID]</code> ya <code>[#UID#]</code> ya <code>vmhgroupss</code> support karta hai, to fikar karne ki zaroorat nahi hai. Humara router in sabhi formats ko automatically accept kar leta hai:</p>
<p><code>[RESPONDENT_ID]</code> • <code>[UID]</code> • <code>[#UID#]</code> • <code>[identifier]</code> • <code>vmhgroupss</code> • <code>[RID]</code> • <code>[TransactionId]</code> • <code>{{UID}}</code></p>

<!-- ==========================================
     PAGE 14: CHAPTER 12 - SUPPLY PARTNERS HUB
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 12</div>
  <h2 class="chapter-title">🤝 Supply Partners Hub (910+ Live Vendors)</h2>
</div>

<p>Sidebar me <strong>"Supply Partners"</strong> (<code>#vendors</code>) par click karein. Yaha system ke saare 910+ panel vendors listed hote hain:</p>

<div class="step-row">
  <div class="step-num">A</div>
  <div class="step-content">
    <div class="step-title">Vendor Ko Search Karna:</div>
    <div>Top search box me vendor ka naam (e.g. <code>Rohan</code>) ya vendor code (e.g. <code>VND_901</code>) type karein. Sub-millisecond me 910 vendors me se Rohan filter ho kar samne aa jayega.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">B</div>
  <div class="step-content">
    <div class="step-title">Vendor Card / Row Par Kya Dikhayi Deta Hai:</div>
    <div>
      <ul>
        <li><strong>Vendor Name & Code:</strong> e.g. Rohan (<code>VND_ROHAN</code>).</li>
        <li><strong>Contact Email:</strong> Vendor ka operational email.</li>
        <li><strong>Default RevShare (%):</strong> e.g. <code>60%</code>.</li>
        <li><strong>Default CPI ($):</strong> e.g. <code>$1.80</code>.</li>
        <li><strong>Total Completes Delivered:</strong> Aaj tak is vendor ne kitne verified completes diye hain.</li>
        <li><strong>Conversion Rate:</strong> Is vendor ke traffic ki quality score (e.g. <code>88% High Quality</code>).</li>
        <li><strong>Status:</strong> <span class="pill-badge pill-green">ACTIVE</span>.</li>
      </ul>
    </div>
  </div>
</div>

<!-- ==========================================
     PAGE 15: CHAPTER 13 - EDITING REVSHARE
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 13</div>
  <h2 class="chapter-title">💰 Editing & Saving RevShare (70% ➔ 60% Permanently)</h2>
</div>

<p>Aapne poocha tha: <em>"Maine Rohan ka 60 kar diya tha revShare fir save kiya to yaha 60 dikhne laga but jaise hi refresh kiya firse 70 ho gya aisa kyu?"</em></p>

<div class="card card-danger">
  <strong>Pehle Problem Kya Thi:</strong>
  <p>Pehle jab aap 60 likh kar save dabate the, to sirf browser ki temporary memory me change hota tha, database me permanent update query nahi chalti thi, isliye page refresh karte hi wapas 70% ho jata tha.</p>
</div>

<div class="card card-success">
  <strong>Ab Kaise Fix Kiya Gaya Hai (Permanent Solution):</strong>
  <p>Humne direct MySQL database update command bind kar di hai. Ab jab aap Rohan ka RevShare change karte hain, to ye permanently save hota hai.</p>
</div>

<div class="section-title">RevShare Badal Kar Save Karne Ka Step-by-Step Tareeqa:</div>
<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Rohan Ko Search Karein:</div>
    <div>Supply Partners tab me search box me <code>Rohan</code> likhein.</div>
  </div>
</div>
<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">RevShare Input Box Me Value Badlein:</div>
    <div>RevShare field me <code>70</code> ko mita kar <strong><code>60</code></strong> likhein.</div>
  </div>
</div>
<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">"Save" Button Par Click Karein:</div>
    <div>Blue <strong>"Save"</strong> button click karein. Screen par green message aayega: <em>"RevShare updated to 60% successfully"</em>.</div>
  </div>
</div>
<div class="step-row">
  <div class="step-num">4</div>
  <div class="step-content">
    <div class="step-title">Verify Karein (Page Refresh Karke Dekhein):</div>
    <div>Keyboard par <strong>F5</strong> ya <strong>Ctrl + R</strong> dabakar page refresh karein. <strong>Aap dekhenge ki RevShare 60% hi bana hua hai</strong>, bilkul bhi change nahi hoga!</div>
  </div>
</div>

<!-- ==========================================
     PAGE 16: CHAPTER 14 - ADDING A NEW VENDOR
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 14</div>
  <h2 class="chapter-title">➕ Adding a New Supply Vendor (Naya Partner Jodna)</h2>
</div>

<p>Jab koi naya panel partner aapke sath judta hai, to use portal me register karne ka simple process:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">"+ Add Supply Partner" Button Dabayein:</div>
    <div>Supply Partners page ke top-right corner par blue <span class="btn-sim btn-blue">+ Add Supply Partner</span> button par click karein. Ek form modal khulega.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Vendor Details Fill Karein:</div>
    <div>
      <ul>
        <li><strong>Vendor Name:</strong> Partner ka naam (e.g. <code>PureSpectrum India</code>).</li>
        <li><strong>Vendor Code:</strong> Unique code (e.g. <code>VND_PS_IN</code>). Ye code entry link me use hoga.</li>
        <li><strong>Contact Email:</strong> Unki operations team ka email.</li>
        <li><strong>Phone Number:</strong> Unka contact number.</li>
        <li><strong>Default RevShare (%):</strong> Vendor ka negotiated percentage (e.g. <code>65%</code>).</li>
        <li><strong>Default Base CPI ($):</strong> e.g. <code>$1.50</code>.</li>
      </ul>
    </div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">"Save Partner" Button Click Karein:</div>
    <div>Green <strong>"Save Partner"</strong> button dabate hi naya vendor directory me add ho jayega aur aap use turant surveys assign kar sakte hain.</div>
  </div>
</div>

<!-- ==========================================
     PAGE 17: CHAPTER 15 - CONSOLIDATED REPORTS HUB
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 15</div>
  <h2 class="chapter-title">📈 Consolidated Reports Hub (Single-Click Solution)</h2>
</div>

<p>Aapne kaha tha: <em>"reports hub ke baare main admin ne jo bola wo fix kiya ya nhi sirf ak hi baar reports hub pe click kare phir uske page pe hi saari cheeze dikhe or view details hona chahiye"</em></p>

<div class="card card-success">
  <strong>Fix Applied: Ab Reports Hub 1 Click me khulta hai!</strong>
  <p>Pehle reports dekhne ke liye 5 alag-alag tabs par bhatakna padta tha. Ab aap sidebar me <strong>"Reports Hub"</strong> par sirf <strong>1 baar click karte hain</strong>, aur usi page par saari cheezein samne aa jaati hain:</p>
</div>

<table>
  <thead>
    <tr>
      <th>Top Summary Card</th>
      <th>Kya Number Dikhata Hai</th>
      <th>Business Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Total Allocated Projects</strong></td>
      <td>Total alloted studies (e.g. <code>48</code>)</td>
      <td>Kitne projects supply partners ko diye gaye hain.</td>
    </tr>
    <tr>
      <td><strong>Active Supply Partners</strong></td>
      <td>Delivering vendors (e.g. <code>14</code>)</td>
      <td>Kitne vendors abhi actively completes deliver kar rahe hain.</td>
    </tr>
    <tr>
      <td><strong>Gross Client Billed</strong></td>
      <td>Total Client Bill (e.g. <code>$7,250.00</code>)</td>
      <td>Client se total kitna revenue collect hona hai.</td>
    </tr>
    <tr>
      <td><strong>Net Vendor Payable</strong></td>
      <td>Vendors Ka Payout (e.g. <code>$4,350.00</code>)</td>
      <td>Supply partners ko kitna paisa dena hai.</td>
    </tr>
    <tr>
      <td><strong>Net VMH Margin / Profit</strong></td>
      <td>VMH Ka Net Profit (e.g. <code>$2,900.00</code>)</td>
      <td><strong>VMH ka direct munafa (profit)!</strong></td>
    </tr>
  </tbody>
</table>

<!-- ==========================================
     PAGE 18: CHAPTER 16 - VIEW DETAILS MODAL
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 16</div>
  <h2 class="chapter-title">👁️ Deep "View Details" Modal (Har Survey Ka Kachha-Chittha)</h2>
</div>

<p>Reports Hub table me har row ke aage ek blue <span class="btn-sim btn-blue">View Details</span> button hota hai. Is par click karne par ek comprehensive detail modal open hota hai:</p>

<div class="card card-highlight">
  <strong>Modal Me Kya-Kya Dikhayi Deta Hai:</strong>
  <ul>
    <li><strong>Study Overview:</strong> Survey ID (<code>90142</code>), Project Name, Client CPI ($3.00), Target Quota (500).</li>
    <li><strong>Dynamic Pacing Progress Meter:</strong> Green progress bar jo dikhata hai ki survey 72% pura ho chuka hai (360 / 500 Completes).</li>
  </ul>
</div>

<div class="section-title">Assigned Supply Partners Ki Full List (Is Survey Me Kaun-Kaun Hai):</div>
<table>
  <thead>
    <tr>
      <th>Vendor Name</th>
      <th>Alloted Quota</th>
      <th>Delivered Completes</th>
      <th>Vendor CPI</th>
      <th>Vendor Payout ($)</th>
      <th>VMH Profit ($)</th>
      <th>Delivery Ratio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Rohan (VND_ROHAN)</strong></td>
      <td>200</td>
      <td>180</td>
      <td>$1.80</td>
      <td>$324.00</td>
      <td>$216.00</td>
      <td><span class="pill-badge pill-green">90% Done</span></td>
    </tr>
    <tr>
      <td><strong>PureSpectrum</strong></td>
      <td>200</td>
      <td>140</td>
      <td>$1.90</td>
      <td>$266.00</td>
      <td>$154.00</td>
      <td><span class="pill-badge pill-blue">70% Done</span></td>
    </tr>
    <tr>
      <td><strong>Dynata Panel</strong></td>
      <td>100</td>
      <td>40</td>
      <td>$1.80</td>
      <td>$72.00</td>
      <td>$48.00</td>
      <td><span class="pill-badge pill-amber">40% Done</span></td>
    </tr>
  </tbody>
</table>

<p>Is modal ke neeche <strong>"Export Survey Audit PDF"</strong> button hota hai jisse aap client ya accounts team ko bhejne ke liye 1-click report download kar sakte hain.</p>

<!-- ==========================================
     PAGE 19: CHAPTER 17 - DEMAND CLIENTS HUB
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 17</div>
  <h2 class="chapter-title">🏢 Demand Clients Hub (Survey Buyers Ko Manage Karna)</h2>
</div>

<p>Sidebar me <strong>"Demand Clients"</strong> (<code>#clients</code>) par click karein. Yaha survey buyers (jaise Zamplia, Market Xcel, Cint, Dynata) manage hote hain:</p>

<table>
  <thead>
    <tr>
      <th>Client Name</th>
      <th>Active Surveys</th>
      <th>Average CPI</th>
      <th>S2S Status</th>
      <th>Action Controls</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Zamplia</strong></td>
      <td>626 Live</td>
      <td>$3.50</td>
      <td><span class="pill-badge pill-green">CONNECTED</span></td>
      <td><span class="btn-sim btn-light">Edit</span> <span class="btn-sim btn-blue">Test S2S</span></td>
    </tr>
    <tr>
      <td><strong>Market Xcel</strong></td>
      <td>14 Live</td>
      <td>$4.20</td>
      <td><span class="pill-badge pill-green">CONNECTED</span></td>
      <td><span class="btn-sim btn-light">Edit</span> <span class="btn-sim btn-blue">Test S2S</span></td>
    </tr>
    <tr>
      <td><strong>Dynata Demand</strong></td>
      <td>8 Live</td>
      <td>$5.00</td>
      <td><span class="pill-badge pill-green">CONNECTED</span></td>
      <td><span class="btn-sim btn-light">Edit</span> <span class="btn-sim btn-blue">Test S2S</span></td>
    </tr>
  </tbody>
</table>

<div class="step-row">
  <div class="step-num">!</div>
  <div class="step-content">
    <div class="step-title">"Test S2S" Button Ka Kaam:</div>
    <div>Jab naya client add hota hai, to <span class="btn-sim btn-blue">Test S2S</span> button dabakar ek dummy test complete bhej kar check karte hain ki client ka postback theek se connect ho gaya hai ya nahi.</div>
  </div>
</div>

<!-- ==========================================
     PAGE 20: CHAPTER 18 - PROJECTS & CAMPAIGNS
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 18</div>
  <h2 class="chapter-title">📁 Projects & Campaigns Hub (Studies Ki Grouping)</h2>
</div>

<p>Sidebar me <strong>"Projects"</strong> (<code>#projects</code>) par click karein. Yaha alag-alag surveys ko ek common campaign me group kiya jata hai:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Naya Project Banana:</div>
    <div>Top-Right me blue <span class="btn-sim btn-blue">+ Create Project</span> button dabayein. Project Name (e.g. <code>Q4 Healthcare Study</code>), Client Name, aur Target Completes daal kar save karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Duplicate Project Feature:</div>
    <div>Agar koi campaign pichle mahine chala tha aur is mahine waisa hi campaign dobara chalana hai, to purane project ke aage bane <strong>"Duplicate"</strong> button par click karein. 1 second me naya project copy ho jayega aur saare settings pehle jaise save rahenge.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">Status Toggle (Active / Paused):</div>
    <div>Har project ke samne ek toggle switch hota hai. Agar client bole ki <em>"Abhi study pause kardo"</em>, to toggle switch ko <strong>OFF (Paused)</strong> kar dein. Turant router traffic stop kar dega taaki extra unbilled completes na ban sakein.</div>
  </div>
</div>

<!-- ==========================================
     PAGE 21: CHAPTER 19 - FINANCIAL PAYMENTS
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 19</div>
  <h2 class="chapter-title">💳 Financial Ledger & Vendor Payments (Hisab-Kitab)</h2>
</div>

<p>Sidebar me <strong>"Payments"</strong> (<code>#payments</code>) par click karein. Yaha month-end me vendors ka payout aur invoices manage hote hain:</p>

<table>
  <thead>
    <tr>
      <th>Invoice #</th>
      <th>Vendor Name</th>
      <th>Billing Period</th>
      <th>Verified Completes</th>
      <th>Agreed Rate</th>
      <th>Total Amount ($)</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>INV-2026-001</code></td>
      <td><strong>Rohan</strong></td>
      <td>Oct 2026</td>
      <td>450</td>
      <td>$1.80</td>
      <td><strong>$810.00</strong></td>
      <td><span class="pill-badge pill-amber">Pending</span></td>
      <td><span class="btn-sim btn-green">Mark Paid</span></td>
    </tr>
    <tr>
      <td><code>INV-2026-002</code></td>
      <td><strong>PureSpectrum</strong></td>
      <td>Oct 2026</td>
      <td>800</td>
      <td>$1.90</td>
      <td><strong>$1,520.00</strong></td>
      <td><span class="pill-badge pill-green">Paid</span></td>
      <td><span class="btn-sim btn-light">View Receipt</span></td>
    </tr>
    <tr>
      <td><code>INV-2026-003</code></td>
      <td><strong>Spam Panel</strong></td>
      <td>Oct 2026</td>
      <td>50</td>
      <td>$1.50</td>
      <td><strong>$75.00</strong></td>
      <td><span class="pill-badge pill-red">Rejected</span></td>
      <td><span class="btn-sim btn-light">Fraud Log</span></td>
    </tr>
  </tbody>
</table>

<div class="card card-highlight">
  <strong>Payment Status Badalne Ka Tareeqa:</strong>
  <ul>
    <li>Jab finance team vendor ke bank account me paise transfer kar de, to row me green <strong>"Mark Paid"</strong> button dabayein.</li>
    <li>Popup aayega jisme <strong>UTR / Transaction Reference Number</strong> (e.g. <code>BANK_TXN_99214</code>) daalein aur confirm karein. Status green <strong>PAID</strong> ho jayega.</li>
  </ul>
</div>

<!-- ==========================================
     PAGE 22: CHAPTER 20 - BANK BATCH CSV
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 20</div>
  <h2 class="chapter-title">📑 1-Click Bank Batch Payout File (CSV Export)</h2>
</div>

<p>Agar aapke 50 vendors hain, to ek-ek vendor ko manually bank portal me add karke transfer karna bohot mushkil hota hai. SMR Portal me <strong>1-Click Automated Batch File Generator</strong> diya gaya hai:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Payments Tab Me Jayein:</div>
    <div>Sidebar se <strong>"Payments"</strong> tab open karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">"Export Bank Batch CSV" Button Dabayein:</div>
    <div>Top-Right corner par blue <span class="btn-sim btn-blue">Export Bank Batch CSV</span> button hota hai. Is par click karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">CSV Sheet Download Ho Jayegi:</div>
    <div>Browser me ek standardized CSV file download ho jayegi jisme:
      <ul>
        <li>Vendor Bank Account Number</li>
        <li>IFSC / SWIFT Code</li>
        <li>Beneficiary Name</li>
        <li>Net Payout Amount in INR / USD</li>
      </ul>
      Aapki accounts team ye CSV sheet seedha apne Corporate Netbanking (HDFC, ICICI, Wise, PayPal) me upload karke 1 click me sabhi vendors ka payment transfer kar sakti hai!
    </div>
  </div>
</div>

<!-- ==========================================
     PAGE 23: CHAPTER 21 - ZAMPLIA RECONCILIATION
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 21</div>
  <h2 class="chapter-title">🔄 Zamplia Month-End Reconciliation (Dispute Resolution)</h2>
</div>

<p>Kayi baar vendor bolta hai: <em>"Maine 500 completes kiye hain"</em>, lekin client bolta hai: <em>"Sirf 480 completes aaye hain"</em>. Is dispute ko solve karne ke liye <strong>Reconciliation</strong> tool use hota hai:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Date Range Select Karein:</div>
    <div>Sidebar se <strong>"Reconciliation"</strong> (<code>#reconciliation</code>) kholein. Start Date (e.g. <code>01-10-2026</code>) aur End Date (e.g. <code>31-10-2026</code>) select karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">"Fetch Zamplia Data" Click Karein:</div>
    <div>System Zamplia server se audit log khinch kar laata hai aur aapke portal ke database se line-by-line compare karta hai.</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Survey ID</th>
      <th>SMR Portal Count</th>
      <th>Zamplia Verified Count</th>
      <th>Discrepancy (Antar)</th>
      <th>Resolution Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>90142</code></td>
      <td>250 Completes</td>
      <td>250 Completes</td>
      <td><span class="pill-badge pill-green">0 (100% Match)</span></td>
      <td>Invoice Approved ✅</td>
    </tr>
    <tr>
      <td><code>90148</code></td>
      <td>100 Completes</td>
      <td>95 Completes</td>
      <td><span class="pill-badge pill-amber">-5 Disputed</span></td>
      <td>5 Speeder Completes Rejected by Client ⚠️</td>
    </tr>
  </tbody>
</table>

<!-- ==========================================
     PAGE 24: CHAPTER 22 - TRAFFIC ROUTER & LEADS
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 22</div>
  <h2 class="chapter-title">🛡️ Traffic Router & Live Leads Monitor</h2>
</div>

<p>Sidebar me <strong>"Traffic Router & Leads"</strong> (<code>#router</code>) par click karein. Yaha live aane wale har ek respondent click ka log dikhta hai:</p>

<table>
  <thead>
    <tr>
      <th>Respondent ID</th>
      <th>Vendor</th>
      <th>Survey ID</th>
      <th>IP Address</th>
      <th>Device</th>
      <th>LOI Time</th>
      <th>Outcome Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>RESP_88192</code></td>
      <td>Rohan</td>
      <td>90142</td>
      <td>103.21.54.12</td>
      <td>Windows Chrome</td>
      <td>14 Min</td>
      <td><span class="pill-badge pill-green">status=1 (COMPLETE)</span></td>
    </tr>
    <tr>
      <td><code>RESP_88193</code></td>
      <td>PureSpectrum</td>
      <td>90142</td>
      <td>45.12.89.90</td>
      <td>Android Mobile</td>
      <td>2 Min</td>
      <td><span class="pill-badge pill-amber">status=2 (TERMINATE)</span></td>
    </tr>
    <tr>
      <td><code>RESP_88194</code></td>
      <td>Dynata</td>
      <td>90148</td>
      <td>182.72.10.4</td>
      <td>iPad Safari</td>
      <td>1 Min</td>
      <td><span class="pill-badge pill-blue">status=3 (OVERQUOTA)</span></td>
    </tr>
    <tr>
      <td><code>BOT_USER_01</code></td>
      <td>Unknown</td>
      <td>90142</td>
      <td>198.51.100.1</td>
      <td>Datacenter VPN</td>
      <td>0.2 Min</td>
      <td><span class="pill-badge pill-red">status=4 (SECURITY BLOCK)</span></td>
    </tr>
  </tbody>
</table>

<div class="card card-danger">
  <strong>🚨 One-Click IP Block Button:</strong>
  <p>Agar kisi IP address se lagatar fake clicks ya bot traffic aa raha ho, to row ke aage bane red <strong>"Block IP"</strong> button par click karein. Wo IP address turant blacklist me chala jayega aur future me uska koi bhi click enter nahi ho payega.</p>
</div>

<!-- ==========================================
     PAGE 25: CHAPTER 23 - STATUS CODES 1,2,3,4
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 23</div>
  <h2 class="chapter-title">🚦 The 4 Callback Status Codes (1, 2, 3, 4) Explained</h2>
</div>

<p>Jab koi panelist survey pura karke wapas aata hai, to system use ek status code assign karta hai. Iska matlab kya hai:</p>

<table>
  <thead>
    <tr>
      <th>Status Code</th>
      <th>System Signal</th>
      <th>Hinglish Me Matlab</th>
      <th>Vendor Ko Payout Milega?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1 (ya 10)</strong></td>
      <td><span class="pill-badge pill-green">COMPLETE</span></td>
      <td>Respondent ne survey poora 100% sahi-sahi complete kiya aur client ne approve kiya.</td>
      <td><strong>HAAN (YES)</strong>. Vendor ko uska agreed payout credit hoga, aur client se VMH ko full CPI milega.</td>
    </tr>
    <tr>
      <td><strong>2 (ya 20)</strong></td>
      <td><span class="pill-badge pill-amber">TERMINATE</span></td>
      <td>Respondent qualification questions me disqualify ho gaya (jaise Age mismatch ya Job title mismatch).</td>
      <td><strong>NAHI (NO)</strong>. Screenout par koi payment nahi hoti, lekin vendor par koi penalty bhi nahi lagti.</td>
    </tr>
    <tr>
      <td><strong>3 (ya 30)</strong></td>
      <td><span class="pill-badge pill-blue">OVERQUOTA</span></td>
      <td>Survey ke target slots pehle hi bhar chuke the jab respondent enter hua.</td>
      <td><strong>NAHI (NO)</strong>. Lekin agar router enabled hai to system respondent ko doosre matching survey me redirect kar deta hai.</td>
    </tr>
    <tr>
      <td><strong>4 (ya 40)</strong></td>
      <td><span class="pill-badge pill-red">SECURITY</span></td>
      <td>Fraud pakda gaya: Datacenter VPN, Bot, duplicate browser, ya speeder (15 min survey 1 min me submit).</td>
      <td><strong>KABHI NAHI (0)</strong>. Session blocked, IP blacklisted.</td>
    </tr>
  </tbody>
</table>

<!-- ==========================================
     PAGE 26: CHAPTER 24 - SECURITY & FRAUD SHIELD
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 24</div>
  <h2 class="chapter-title">🛡️ Security Shield & Fraud Prevention Controls</h2>
</div>

<p>Client ke survey rejection ko zero rakhne ke liye system me 4 automated security shields active hain:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">VPN & Proxy Filter:</div>
    <div>Commercial VPNs (NordVPN, ExpressVPN), proxies aur cloud servers (AWS, DigitalOcean) se aane wale traffic ko gate par hi reject kar diya jata hai.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Device Hardware Fingerprint:</div>
    <div>Har respondent ke phone ya computer ka screen size aur graphics chip scan karke digital hash banaya jata hai. Agar koi panelist browser cookie delete karke dobara aayega, tab bhi system use pehchan kar block kar dega.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">Speeder Detection Engine:</div>
    <div>Agar kisi survey ka normal time 15 minute hai, to uska minimum threshold 4 minute hota hai. Agar koi bot ya fraud panelist 2 minute me random click karke submit karega, to system use automatically <code>status=4</code> dekar reject kar deta hai.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">4</div>
  <div class="step-content">
    <div class="step-title">Honeypot Trap Questions:</div>
    <div>Surveys me invisible trap fields hote hain jo sirf bots ko dikhte hain insano ko nahi. Agar koi bot unhe fill karta hai to system use permanent ban kar deta hai.</div>
  </div>
</div>

<!-- ==========================================
     PAGE 27: CHAPTER 25 - USER MANAGEMENT
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 25</div>
  <h2 class="chapter-title">👥 User Management & Menu Permissions (Staff Logins)</h2>
</div>

<p>Aapne poocha tha: <em>"menu permission to apne smr wale main to add hi kar dena sirf add hi nhi karna bulky sab acche se working real time hona chahiye"</em></p>

<div class="card card-success">
  <strong>Working Feature: Granular Menu Permission Matrix!</strong>
  <p>Ab aap apne kisi bhi employee (staff) ka account bana kar decide kar sakte hain ki use kaunsa menu dikhega aur kaunsa nahi.</p>
</div>

<div class="section-title">Naye Employee Ko Specific Menu Access Dene Ka Tareeqa:</div>
<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">User Management Me Jayein:</div>
    <div>Sidebar ➔ <strong>User Management</strong> ➔ <strong>User</strong> open karein.</div>
  </div>
</div>
<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">"+ Add User" Click Karein:</div>
    <div>Staff ka Name, Username, Email, Phone aur Password daalein. Role me <strong>User</strong> select karein.</div>
  </div>
</div>
<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">Menu Permission Checkboxes Tick Karein:</div>
    <div>Neeche 10 menus ke checkboxes dikhenge:
      <ul>
        <li>[✓] Dashboard</li>
        <li>[✓] Projects / Surveys (Traffic dene ke liye)</li>
        <li>[✓] Supply Vendors (Vendor link banane ke liye)</li>
        <li>[ ] <strong>Payments (Untick rakhein agar finance nahi dikhana)</strong></li>
        <li>[ ] <strong>User Management (Untick rakhein taaki wo naya admin na bana sake)</strong></li>
      </ul>
    </div>
  </div>
</div>
<div class="step-row">
  <div class="step-num">4</div>
  <div class="step-content">
    <div class="step-title">"Save User" Dabayein:</div>
    <div>Save karte hi employee ka login active ho jata hai. Jab wo login karega, to use sidebar me <strong>sirf wahi menus dikhenge jinka checkbox aapne tick kiya tha!</strong></div>
  </div>
</div>

<!-- ==========================================
     PAGE 28: CHAPTER 26 - CHANGE PASSWORD
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 26</div>
  <h2 class="chapter-title">🔑 Change Password & Account Profile Settings</h2>
</div>

<p>Apna login password badalne ke liye:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Sidebar Se "Change Password" Kholein:</div>
    <div>Sidebar me <strong>Change Password</strong> (<code>#changepassword</code>) par click karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Fields Fill Karein:</div>
    <div>
      <ul>
        <li><strong>Current Password:</strong> Jo abhi aapka password hai (e.g. <code>Jelly</code>).</li>
        <li><strong>New Password:</strong> Naya password jo aap rakhna chahte hain.</li>
        <li><strong>Confirm New Password:</strong> Naya password dobara type karein.</li>
      </ul>
    </div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">"Update Password" Button Dabayein:</div>
    <div>Green button click karein. Turant message aayega: <em>"Password updated successfully"</em>. Agli baar aap naye password se login karenge.</div>
  </div>
</div>

<div class="card card-warning">
  <strong>⚠️ Security Rule:</strong>
  <p>Password me kam se kam 8 characters, ek number aur ek special character zaroor use karein taaki account safe rahe.</p>
</div>

<!-- ==========================================
     PAGE 29: CHAPTER 27 - MORNING 9:00 AM SOP
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 27</div>
  <h2 class="chapter-title">☀️ Daily Morning SOP (Subah 9:00 AM Ka 5-Minute Routine)</h2>
</div>

<p>Har subah office aate hi portal par bas ye 4 simple steps karne hain jisse poora din smoothly business chale:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Step 1: Portal Login Karein (9:00 AM)</div>
    <div>Browser me <code>https://smr.vmhgroupsmr.com/</code> open karke <code>vmhgroup</code> / <code>Jelly</code> se login karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Step 2: Blue "Sync" Button Dabayein (9:01 AM)</div>
    <div>Header me blue <strong>"Sync"</strong> button click karein. Ye 1 second me Zamplia ke saare naye high-budget surveys aur updated quotas ko sync kar lega.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">Step 3: High-CPI Surveys Filter Karein (9:02 AM)</div>
    <div>Active Surveys page par jayein. CPI filter me <strong>$3.00 - $5.00+</strong> select karein. Screen par top high-paying studies aa jayengi.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">4</div>
  <div class="step-content">
    <div class="step-title">Step 4: Top Vendors Ko Links Assign Karein (9:04 AM)</div>
    <div>Surveys ko select karke <strong>Bulk Assign</strong> ya <strong>Assign</strong> karein aur apne top supply partners (Rohan, PureSpectrum, Dynata) ko tracking links bhej dein. Bas, aapka morning setup ready hai!</div>
  </div>
</div>

<!-- ==========================================
     PAGE 30: CHAPTER 28 - EVENING CLOSING SOP
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 28</div>
  <h2 class="chapter-title">🌙 Daily Evening SOP (Sham Ko 6:00 PM Ka Closing Routine)</h2>
</div>

<p>Sham ko kaam wrap up karte waqt bas ye 3 quick verification steps lene hain:</p>

<div class="step-row">
  <div class="step-num">1</div>
  <div class="step-content">
    <div class="step-title">Step 1: Reports Hub Me Day's Revenue Check Karein:</div>
    <div>Sidebar se <strong>"Reports Hub"</strong> kholein. Check karein:
      <ul>
        <li>Aaj total kitne completes deliver hue.</li>
        <li>Client ka Total Gross Billed amount kitna bana.</li>
        <li>Vendor ka payable kitna hai aur <strong>VMH ka Net Profit kitna earn hua</strong>.</li>
      </ul>
    </div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">2</div>
  <div class="step-content">
    <div class="step-title">Step 2: Full Ho Chuke Surveys Check Karein:</div>
    <div>Surveys table me dekhein agar kisi survey ki capacity 100% full ho chuki hai (jaise 500/500), to vendor ko message daal dein ki is study me traffic stop karein.</div>
  </div>
</div>

<div class="step-row">
  <div class="step-num">3</div>
  <div class="step-content">
    <div class="step-title">Step 3: Secure Logout:</div>
    <div>Top-Right me profile icon par click karke <strong>"Logout"</strong> button dabayein taaki system secure band ho sake.</div>
  </div>
</div>

<!-- ==========================================
     PAGE 31: CHAPTER 29 - OPERATOR FAQ (PART 1)
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 29</div>
  <h2 class="chapter-title">❓ Operator FAQ & Troubleshooting (Q1 to Q8)</h2>
</div>

<div class="card card-highlight">
  <strong>Q1: Agar main page refresh (F5) karu to kya mera khula hua page band ho jayega?</strong>
  <p><strong>Jawab:</strong> NAHI! Humne system me Hash Routing implement kar di hai. Agar aap Surveys page par hain ya Reports par hain, refresh karne par bhi aap usi page par rahenge, pehle ki tarah dashboard par jump nahi karega.</p>
</div>

<div class="card card-highlight">
  <strong>Q2: Pop-up khula ho aur main browser ka Back button daba doon to kya hoga?</strong>
  <p><strong>Jawab:</strong> Pehle poora page piche chala jata tha. Ab modal interception fix hai: Back button dabane se sirf popup modal band hoga aur aapki screen wahi rahegi jaha aap scroll karke the.</p>
</div>

<div class="card card-highlight">
  <strong>Q3: Sync button dabane par agar 2-3 second ghumta rahe to kya wo normal hai?</strong>
  <p><strong>Jawab:</strong> Haan, bilkul normal hai. System live Zamplia server se 600+ surveys ka live data fetch karta hai. 2-3 second me green alert aa jayega: <em>"Sync Complete"</em>.</p>
</div>

<div class="card card-highlight">
  <strong>Q4: Rohan ka RevShare 60% kiya, kya ye hamesha ke liye 60% rahega?</strong>
  <p><strong>Jawab:</strong> Haan, 100% permanently save rahega kyunki ye direct database me save hota hai.</p>
</div>

<div class="card card-highlight">
  <strong>Q5: Vendor ko ek sath 10 se 15 survey kaise assign karein?</strong>
  <p><strong>Jawab:</strong> Table me shuru ke checkboxes tick karein, upar <strong>"Bulk Assign to Vendor"</strong> button dabayein, vendor chunein aur 1 click me assign karein.</p>
</div>

<div class="card card-highlight">
  <strong>Q6: Table ke right side ke Actions buttons agar screen se bahar ja rahe hon to kya karein?</strong>
  <p><strong>Jawab:</strong> Ab Actions column permanently sticky hai (right: 0), screen choti ho ya badi, buttons hamesha right edge par dikhte rahenge.</p>
</div>

<div class="card card-highlight">
  <strong>Q7: Vendor bol raha hai link par click karne se "Survey Terminated" aa raha hai, kyu?</strong>
  <p><strong>Jawab:</strong> Ya to survey ka quota full ho chuka hai, ya panelist ka demographic profile (Age/Gender) survey ke criteria se match nahi hua.</p>
</div>

<div class="card card-highlight">
  <strong>Q8: Kya portal me koi demo ya fake data bacha hai?</strong>
  <p><strong>Jawab:</strong> Bilkul nahi! Poore portal se har tarah ka fake/demo data hata diya gaya hai. Saare 910 vendors aur surveys 100% real hain.</p>
</div>

<!-- ==========================================
     PAGE 32: CHAPTER 30 - OPERATOR FAQ (PART 2)
     ========================================== -->
<div class="page-break"></div>

<div class="chapter-header">
  <div class="chapter-num">Chapter 30</div>
  <h2 class="chapter-title">❓ Operator FAQ & Troubleshooting (Q9 to Q15)</h2>
</div>

<div class="card card-highlight">
  <strong>Q9: Status 4 (Security Block) aane par kya vendor ko payment deni hoti hai?</strong>
  <p><strong>Jawab:</strong> KABHI NAHI. Status 4 ka matlab hai ki traffic bot ya VPN se aaya tha. Iska client koi payment nahi deta, isliye vendor ko 0 payout diya jata hai.</p>
</div>

<div class="card card-highlight">
  <strong>Q10: Naye staff member ko sirf surveys dikhana hai, payment nahi, kaise karein?</strong>
  <p><strong>Jawab:</strong> User Management me naya user banate waqt sirf <strong>Surveys</strong> aur <strong>Vendors</strong> ka checkbox tick karein, <strong>Payments</strong> ka checkbox uncheck rakhein.</p>
</div>

<div class="card card-highlight">
  <strong>Q11: Bank Batch CSV file ka kya fayda hai?</strong>
  <p><strong>Jawab:</strong> Ek-ek vendor ko manually transfer karne ke bajaye ye CSV sheet direct Netbanking me upload ho jaati hai aur sabhi vendors ko 1 click me payment chali jaati hai.</p>
</div>

<div class="card card-highlight">
  <strong>Q12: Zamplia Reconciliation kab karni chahiye?</strong>
  <p><strong>Jawab:</strong> Har mahine ki 1st ya 2nd date ko pichle mahine ka reconciliation fetch karein taaki vendor ko final payment dene se pehle numbers match ho jayein.</p>
</div>

<div class="card card-highlight">
  <strong>Q13: Agar kisi survey me "Male Full" dikha raha hai to kya karein?</strong>
  <p><strong>Jawab:</strong> Quotas modal me check karein. Vendor ko turant bolen ki ab Male traffic na bheje, sirf Female traffic bheje taaki screenout na ho.</p>
</div>

<div class="card card-highlight">
  <strong>Q14: Vendor link me `rid=` ke aage kya likhna hota hai?</strong>
  <p><strong>Jawab:</strong> Waha <code>[RESPONDENT_ID]</code> likha rehta hai. Vendor ka system automatically apne panelist ka ID waha fill kar lega.</p>
</div>

<div class="card card-highlight">
  <strong>Q15: Kisi bhi technical problem ya emergency me kis se contact karein?</strong>
  <p><strong>Jawab:</strong> Portal ke official technical support desk se: <strong>admin@vmhgroupsmr.com</strong> par email karein ya VMH System Operations team ko sampark karein.</p>
</div>

<div style="margin-top: 30px; text-align: center; border-top: 2px solid #e2e8f0; padding-top: 14px; font-size: 8.5pt; color: #64748b;">
  <strong>VMH GROUP'S SMR ENTERPRISE PLATFORM</strong> • Complete 30-Page Operator & User Handbook • Confidential
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
            margin={"top": "12mm", "bottom": "12mm", "left": "12mm", "right": "12mm"}
        )
        print(f"Generated: {path} (Size: {os.path.getsize(path)} bytes)")
        
    browser.close()
print("All 30-page user & operator manuals compiled successfully!")
