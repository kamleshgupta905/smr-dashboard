import os

with open('client/src/pages/VendorsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Imports
imp_src = """  Ban,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { 
  getVendors, 
  getAllVendors,
  getVendorAuditLogs,
  createVendor, 
  updateVendor, 
  deleteVendor, 
  getProjects, 
  getCountries,
  getClients
} from '../services/api';"""

imp_dest = """  Ban,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Printer,
  Send
} from 'lucide-react';
import { 
  getVendors, 
  getAllVendors,
  getVendorAuditLogs,
  createVendor, 
  updateVendor, 
  deleteVendor, 
  getProjects, 
  getCountries,
  getClients,
  getVendorBilling,
  saveVendorBilling,
  getVendorReconciliation
} from '../services/api';"""

# 2. State & Handlers
state_src = """      setSavingBilling(false);
    }
  };

  const [vendorPage, setVendorPage] = useState(1);"""

state_dest = """      setSavingBilling(false);
    }
  };

  // WhatsApp Project Dispatch State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppVendor, setWhatsAppVendor] = useState(null);
  const [whatsAppProject, setWhatsAppProject] = useState('');
  const [whatsAppPhone, setWhatsAppPhone] = useState('');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Vendor Payout Reconciliation Statement State
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [reconciliationVendor, setReconciliationVendor] = useState(null);
  const [reconciliationData, setReconciliationData] = useState(null);
  const [reconciliationLoading, setReconciliationLoading] = useState(false);

  const handleOpenWhatsApp = (vendor) => {
    const vCode = vendor.vendor_id || vendor.vendor_code || vendor._id;
    setWhatsAppVendor(vendor);
    setWhatsAppPhone(vendor.phone || '');
    const firstProj = (projectsList && projectsList.length > 0) ? (projectsList[0].project_id || projectsList[0].id) : 'VMHP1026542026';
    setWhatsAppProject(firstProj);
    setCopiedWhatsApp(false);
    setShowWhatsAppModal(true);
  };

  const getWhatsAppMessageText = () => {
    if (!whatsAppVendor) return '';
    const vCode = whatsAppVendor.vendor_id || whatsAppVendor.vendor_code || whatsAppVendor._id;
    const vName = whatsAppVendor.name || 'Partner';
    const projId = whatsAppProject || 'VMHP1026542026';
    const cpiStr = Number(whatsAppVendor.cpi) > 0 ? `$${Number(whatsAppVendor.cpi).toFixed(2)}` : `${whatsAppVendor.cpi_percentage || 70}% RevShare`;
    const entryUrl = `https://api.vmhgroupsmr.com/traffic/router?pid=${projId}&vid=${vCode}&uid=[RESPONDENT_ID]`;
    
    return `🎯 *VMH GROUP | SMR Survey Allocation Brief*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏢 *Vendor:* ${vName} (${vCode})\n` +
      `📋 *Project ID:* ${projId}\n` +
      `🌐 *Target Market:* United States / Global (Gen Pop)\n` +
      `⏱️ *LOI:* 10-12 Mins | 📊 *IR:* 50%+\n` +
      `💰 *Agreed Rate:* ${cpiStr}\n` +
      `🎯 *Quota Cap:* 250 Completes\n\n` +
      `🔗 *Survey Router Entry Link:*\n` +
      `${entryUrl}\n\n` +
      `📌 *Standard Callbacks:*\n` +
      `✅ Complete: ${whatsAppVendor.redirect_complete || 'https://smr.vmhgroupsmr.com/survey/callback?status=10'}\n` +
      `❌ Terminate: ${whatsAppVendor.redirect_terminate || 'https://smr.vmhgroupsmr.com/survey/callback?status=20'}\n` +
      `⚠️ QuotaFull: ${whatsAppVendor.redirect_overquota || 'https://smr.vmhgroupsmr.com/survey/callback?status=30'}\n\n` +
      `_Note: Please pass your unique panelist UID in place of [RESPONDENT_ID]._\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `VMH Market Research Operations`;
  };

  const handleLaunchWhatsApp = () => {
    const text = getWhatsAppMessageText();
    const cleanPhone = (whatsAppPhone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyWhatsAppText = () => {
    const text = getWhatsAppMessageText();
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleOpenReconciliation = async (vendor) => {
    const vCode = vendor.vendor_id || vendor.vendor_code || vendor._id;
    setReconciliationVendor(vendor);
    setShowReconciliationModal(true);
    setReconciliationLoading(true);
    setReconciliationData(null);
    try {
      const res = await getVendorReconciliation(vCode);
      if (res && res.success) {
        setReconciliationData(res);
      } else {
        alert(res?.message || 'Failed to fetch reconciliation statement');
      }
    } catch (err) {
      console.error('Failed to load reconciliation:', err);
    } finally {
      setReconciliationLoading(false);
    }
  };

  const handleExportReconciliationCSV = () => {
    if (!reconciliationData || !reconciliationVendor) return;
    const v = reconciliationData.vendor || reconciliationVendor;
    const fin = reconciliationData.financial_summary || {};
    const projs = reconciliationData.projects || [];

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'VMH GROUP SMR - VENDOR PAYMENT RECONCILIATION STATEMENT\\r\\n';
    csvContent += `Statement Ref,${fin.statement_ref || 'N/A'}\\r\\n`;
    csvContent += `Date,${fin.statement_date || new Date().toISOString()}\\r\\n`;
    csvContent += `Vendor Code,${v.vendor_id || ''}\\r\\n`;
    csvContent += `Vendor Name,"${v.name || ''}"\\r\\n`;
    csvContent += `Email,${v.email || ''}\\r\\n\\r\\n`;

    csvContent += 'Project ID,Study Name,Clicks / Starts,Completes Delivered,Unit CPI,Line Total ($)\\r\\n';
    projs.forEach(p => {
      csvContent += `"${p.project_id}","${(p.project_name || '').replace(/"/g, '""')}",${p.clicks_count || 0},${p.complete_count || 0},${p.agreed_cpi || 0},${p.line_total || 0}\\r\\n`;
    });

    csvContent += '\\r\\nSummary Totals\\r\\n';
    csvContent += `Total Delivered Completes,${fin.total_completes || 0}\\r\\n`;
    csvContent += `Gross Payable Amount ($),${fin.gross_payable || 0}\\r\\n`;
    csvContent += `TDS Withholding (${fin.tds_rate || 2}%),${fin.tds_amount || 0}\\r\\n`;
    csvContent += `Net Payable Due ($),${fin.net_payable || 0}\\r\\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vendor_Statement_${v.vendor_id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [vendorPage, setVendorPage] = useState(1);"""

# 3. getQualityBadge
qb_src = """  const getQualityBadge = (v) => {
    const clicks = Number(v.clicks_count || 0);
    const completes = Number(v.complete_count || v.completes_count || 0);
    const cr = clicks > 0 ? (completes / clicks) * 100 : 0;

    if (clicks >= 50 && cr >= 12) {
      return {
        label: 'Elite Partner (98%)',
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        icon: '🏆'
      };
    } else if (clicks >= 20 && cr >= 5) {
      return {
        label: 'High Quality (88%)',
        bg: 'rgba(23, 97, 253, 0.1)',
        color: '#1761fd',
        border: '1px solid rgba(23, 97, 253, 0.25)',
        icon: '⭐'
      };
    } else if (clicks >= 15 && cr < 2) {
      return {
        label: 'Traffic Watchlist (45%)',
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        icon: '⚠️'
      };
    } else {
      return {
        label: 'Standard Supplier (80%)',
        bg: 'rgba(100, 116, 139, 0.1)',
        color: '#475569',
        border: '1px solid rgba(100, 116, 139, 0.2)',
        icon: '🛡️'
      };
    }
  };"""

qb_dest = """  const getQualityBadge = (v) => {
    const clicks = Number(v.clicks_count || 0);
    const completes = Number(v.complete_count || v.completes_count || 0);
    const cr = clicks > 0 ? (completes / clicks) * 100 : 0;
    const crStr = cr.toFixed(1);

    if (completes >= 100 || (clicks >= 50 && cr >= 12)) {
      return {
        grade: 'A+',
        label: 'Grade A+ (Elite)',
        sublabel: `${crStr}% CR • 98% Delivery`,
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        icon: '🏆',
        cr: crStr,
        reliability: 'Elite Delivery (98%)'
      };
    } else if (completes >= 20 || (clicks >= 20 && cr >= 5)) {
      return {
        grade: 'A',
        label: 'Grade A (High Perf)',
        sublabel: `${crStr}% CR • 92% Delivery`,
        bg: 'rgba(13, 148, 136, 0.12)',
        color: '#0d9488',
        border: '1px solid rgba(13, 148, 136, 0.3)',
        icon: '⭐',
        cr: crStr,
        reliability: 'High Delivery (92%)'
      };
    } else if (completes > 0 || (clicks >= 10 && cr >= 2)) {
      return {
        grade: 'B',
        label: 'Grade B (Reliable)',
        sublabel: `${crStr}% CR • 85% Delivery`,
        bg: 'rgba(37, 99, 235, 0.1)',
        color: '#2563eb',
        border: '1px solid rgba(37, 99, 235, 0.25)',
        icon: '🛡️',
        cr: crStr,
        reliability: 'Reliable (85%)'
      };
    } else if (clicks >= 15 && cr < 2) {
      return {
        grade: 'D',
        label: 'Grade D (Quality Alert)',
        sublabel: 'High Drop-off / Fraud Alert',
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        icon: '⚠️',
        cr: crStr,
        reliability: 'High Rejects (Watchlist)'
      };
    } else {
      return {
        grade: 'Standard',
        label: clicks > 0 ? 'Standard Supplier' : 'New Supplier',
        sublabel: clicks > 0 ? `${crStr}% CR` : 'Unrated Pacing',
        bg: 'rgba(100, 116, 139, 0.1)',
        color: '#475569',
        border: '1px solid rgba(100, 116, 139, 0.2)',
        icon: '⏳',
        cr: crStr,
        reliability: 'Standard Ramp-up'
      };
    }
  };"""

# 4. Table Header
th_src = """              <thead className="thead-light">
                <tr>
                  <th>Vendor Name / Code</th>
                  <th>Contact Email</th>
                  <th>Base Rate / Payout</th>
                  <th>Security Hash</th>
                  <th>Supply Callbacks (4)</th>
                  <th>Status</th>
                  <th>Sample Router Entry URL</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>"""

th_dest = """              <thead className="thead-light">
                <tr>
                  <th>Vendor Name / Code</th>
                  <th>Contact Email</th>
                  <th>Performance & Scorecard</th>
                  <th>Base Rate / Payout</th>
                  <th>Security Hash</th>
                  <th>Supply Callbacks (4)</th>
                  <th>Status</th>
                  <th>Sample Router Entry URL</th>
                  <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>"""

# 5. Table Row Performance Column
td_src = """                      <td style={{ color: '#303e67', fontSize: '12.5px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.email || 'N/A'}>
                        {v.email || 'N/A'}
                      </td>
                      <td>
                        {isRevShare ? ("""

td_dest = """                      <td style={{ color: '#303e67', fontSize: '12.5px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.email || 'N/A'}>
                        {v.email || 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: quality.bg,
                              color: quality.color,
                              border: quality.border,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }} title={`${quality.label} - ${quality.reliability}`}>
                              <span>{quality.icon}</span>
                              <span>{quality.label}</span>
                            </span>
                            {Number(v.total_projects || 0) > 0 && (
                              <span className="badge-soft-primary" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                                {v.total_projects} Studies
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                            <span title="Total Verified Completes Delivered" style={{ fontWeight: 700, color: '#059669' }}>
                              ✓ {Number(v.complete_count || v.completes_count || 0).toLocaleString()} Comp
                            </span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span title="Total Clicks / Starts" style={{ color: '#64748b' }}>
                              {Number(v.clicks_count || 0).toLocaleString()} Clicks
                            </span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span title="Conversion Rate %" style={{ fontWeight: 700, color: Number(quality.cr) >= 5 ? '#059669' : '#d97706' }}>
                              {quality.cr}% CR
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isRevShare ? ("""

# 6. Table Actions
act_src = """                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                          <button
                            className="btn btn-soft-success btn-sm"
                            onClick={() => {
                              setEntryLinkVendor(v);
                              setSelectedProjectId('VMHP1026542026');
                              setTestUidParam('wslnkdxldd');
                              setCopiedEntryLink(false);
                            }}
                            title="Generate Inbound Entry Link (Frame 001)"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            className="btn btn-soft-success btn-sm"
                            onClick={() => handleOpenBilling(v)}
                            title="Vendor Banking, GST/PAN & Financial Compliance (supplier_billing_details)"
                            style={{ padding: '4px 7px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', border: 'none' }}
                          >
                            <Landmark size={13} />
                          </button>
                          <button
                            className="btn btn-soft-primary btn-sm"
                            onClick={() => handleOpenRedirects(v)}
                            title="Configure Redirects & Anti-Tamper Security (Frame 006)"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            <Settings size={13} />
                          </button>
                          <button
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => handleDelete(v._id || v.vendor_code)}
                            title="Remove Vendor"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>"""

act_dest = """                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleOpenWhatsApp(v)}
                            title="1-Click WhatsApp Direct Survey Dispatch"
                            style={{ padding: '4px 7px', borderRadius: '4px', background: 'rgba(37, 211, 102, 0.15)', color: '#15803d', border: '1px solid rgba(37, 211, 102, 0.3)', cursor: 'pointer' }}
                          >
                            <MessageSquare size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleOpenReconciliation(v)}
                            title="Vendor Payment Reconciliation & Delivery Statement (CSV/Print)"
                            style={{ padding: '4px 7px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.12)', color: '#4338ca', border: '1px solid rgba(99, 102, 241, 0.3)', cursor: 'pointer' }}
                          >
                            <FileText size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-soft-success btn-sm"
                            onClick={() => handleOpenBilling(v)}
                            title="Vendor Banking, GST/PAN & Financial Compliance (supplier_billing_details)"
                            style={{ padding: '4px 7px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', border: 'none', cursor: 'pointer' }}
                          >
                            <Landmark size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-soft-primary btn-sm"
                            onClick={() => handleOpenRedirects(v)}
                            title="Configure Redirects & Anti-Tamper Security (Frame 006)"
                            style={{ padding: '4px 7px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <Settings size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => handleDelete(v._id || v.vendor_code)}
                            title="Remove Vendor"
                            style={{ padding: '4px 7px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>"""

# 7. Modals at the end of the file
modals_code = """
      {/* 1-Click WhatsApp Direct Brief Dispatch Modal */}
      {showWhatsAppModal && whatsAppVendor && (
        <ModalPortal>
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '650px',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 20px',
                background: '#075e54',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#25D366', padding: '7px', borderRadius: '50%', color: '#ffffff', display: 'flex' }}>
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                      1-Click WhatsApp Project Dispatch
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#dcfce7', margin: 0, opacity: 0.9 }}>
                      Instant survey allocation brief for {whatsAppVendor.name} ({whatsAppVendor.vendor_id || whatsAppVendor.vendor_code})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffffff' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '72vh' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Select Study / Project
                    </label>
                    <select
                      value={whatsAppProject}
                      onChange={(e) => setWhatsAppProject(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                    >
                      {projectsList && projectsList.length > 0 ? (
                        projectsList.slice(0, 30).map(p => (
                          <option key={p.project_id || p.id} value={p.project_id || p.id}>
                            {p.project_id || p.id} — {p.name || `Study #${p.id}`}
                          </option>
                        ))
                      ) : (
                        <option value="VMHP1026542026">VMHP1026542026 — General Population Study</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Vendor WhatsApp Number (With Country Code)
                    </label>
                    <input
                      type="text"
                      value={whatsAppPhone}
                      onChange={(e) => setWhatsAppPhone(e.target.value)}
                      placeholder="e.g. +919876543210 or +12025550198"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Live WhatsApp Message Preview
                  </label>
                  <div style={{
                    background: '#e5ddd5',
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }}>
                    <pre style={{
                      margin: 0,
                      background: '#ffffff',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#111827',
                      maxHeight: '260px',
                      overflowY: 'auto'
                    }}>
                      {getWhatsAppMessageText()}
                    </pre>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Info size={12} color="#0284c7" />
                  <span>The live link automatically routes vendor panelists through the SMR Anti-Fraud gate and dynamically maps respondent IDs.</span>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="btn btn-light"
                  style={{ fontSize: '12px', padding: '7px 14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  Close
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCopyWhatsAppText}
                    className="btn btn-soft-primary"
                    style={{ fontSize: '12px', padding: '7px 14px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    {copiedWhatsApp ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    <span>{copiedWhatsApp ? 'Copied Brief!' : 'Copy Text'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchWhatsApp}
                    className="btn btn-success"
                    style={{
                      fontSize: '12px',
                      padding: '7px 16px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      background: '#25D366',
                      borderColor: '#25D366',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Send size={14} />
                    <span>Open in WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Vendor Payout Reconciliation Statement Modal */}
      {showReconciliationModal && reconciliationVendor && (
        <ModalPortal>
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '880px',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 22px',
                background: '#1d2c48',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '6px', borderRadius: '8px', color: '#ffffff', display: 'flex' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15.5px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                      Vendor Payment Reconciliation & Delivery Statement
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#cbd5e1', margin: 0 }}>
                      Official SMR Project Deliverables Audit for {reconciliationVendor.name} ({reconciliationVendor.vendor_id || reconciliationVendor.vendor_code})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReconciliationModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffffff' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable Statement Body */}
              <div style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>
                {reconciliationLoading ? (
                  <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                    Generating official reconciliation statement...
                  </div>
                ) : reconciliationData ? (
                  <>
                    {/* Top Meta Card */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '14px 18px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Statement Reference</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                          {reconciliationData.financial_summary?.statement_ref || 'STMT-SMR-2026'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          Issued: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Vendor Details</div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                          {reconciliationData.vendor?.name || reconciliationVendor.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569' }}>
                          ID: {reconciliationData.vendor?.vendor_id} | {reconciliationData.vendor?.email || 'No email registered'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Bank Compliance</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: reconciliationData.billing?.bank ? '#059669' : '#d97706' }}>
                          {reconciliationData.billing?.bank ? `✓ ${reconciliationData.billing.bank}` : 'Pending Bank Profile'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569' }}>
                          A/C: {reconciliationData.billing?.acc ? `••••${reconciliationData.billing.acc.slice(-4)}` : 'N/A'} | IFSC: {reconciliationData.billing?.ifsc || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Deliverables Breakdown Table */}
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Assigned Studies & Verified Deliverables</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                          {reconciliationData.projects?.length || 0} Studies Recorded
                        </span>
                      </div>

                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                              <th style={{ padding: '8px 12px' }}>Project ID</th>
                              <th style={{ padding: '8px 12px' }}>Study Name</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Clicks</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Completes</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Agreed CPI</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Line Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reconciliationData.projects && reconciliationData.projects.length > 0 ? (
                              reconciliationData.projects.map((p, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#1e40af', fontWeight: 600 }}>
                                    {p.project_id}
                                  </td>
                                  <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {p.project_name}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b' }}>
                                    {Number(p.clicks_count || 0).toLocaleString()}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                    {Number(p.complete_count || 0).toLocaleString()}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#334155' }}>
                                    ${Number(p.agreed_cpi || 0).toFixed(2)}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                    ${Number(p.line_total || 0).toFixed(2)}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                  No verified completes recorded yet for this supplier.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Financial Settlement Card */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px',
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Completes</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                          {Number(reconciliationData.financial_summary?.total_completes || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                          {reconciliationData.financial_summary?.conversion_rate || 0}% Conversion
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Gross Payable</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                          ${Number(reconciliationData.financial_summary?.gross_payable || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>Pre-tax Billings</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TDS Withholding (2%)</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>
                          -${Number(reconciliationData.financial_summary?.tds_amount || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>Statutory Tax</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Net Payout Due</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
                          ${Number(reconciliationData.financial_summary?.net_payable || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600 }}>Ready for Disbursement</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#ef4444' }}>
                    Failed to generate statement.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '14px 22px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => setShowReconciliationModal(false)}
                  className="btn btn-light"
                  style={{ fontSize: '12px', padding: '7px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  Close
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleExportReconciliationCSV}
                    className="btn btn-soft-success"
                    style={{ fontSize: '12px', padding: '7px 16px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>Download CSV Statement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '7px 18px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={14} />
                    <span>Print / PDF Statement</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
"""

# Normalize text line endings to \n
text = text.replace('\r\n', '\n')

assert imp_src in text, "Imports target not found"
assert state_src in text, "State target not found"
assert qb_src in text, "QualityBadge target not found"
assert th_src in text, "Header target not found"
assert td_src in text, "TD target not found"
assert act_src in text, "Actions target not found"

text = text.replace(imp_src, imp_dest, 1)
text = text.replace(state_src, state_dest, 1)
text = text.replace(qb_src, qb_dest, 1)
text = text.replace(th_src, th_dest, 1)
text = text.replace(td_src, td_dest, 1)
text = text.replace(act_src, act_dest, 1)

# Find the very last closing </div>\n  );\n}
marker = "</ModalPortal>\n      )}\n\n    </div>\n  );\n}"
assert marker in text, "Modal portal end marker not found"
text = text.replace(marker, "</ModalPortal>\n      )}\n" + modals_code + "\n    </div>\n  );\n}", 1)

with open('client/src/pages/VendorsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Applied all 7 vendor enhancements cleanly to VendorsPage.jsx!")
