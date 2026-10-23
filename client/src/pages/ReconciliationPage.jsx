import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck2,
  Calendar,
  Search,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Download,
  RotateCcw,
  Clock,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  Percent,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Activity,
  Database,
  Archive,
  ChevronLeft,
  ChevronRight,
  Layers,
  Eye,
  Copy,
  Check,
  X,
  Target,
  Trash2
} from 'lucide-react';
import {
  getReconciliationCompletes,
  getReconciliationReversals,
  getInternalLeads,
  getUnifiedReports,
  getVendorReportDetails,
  getProjectReportDetails,
  getClients,
  getProjects,
  getVendors,
  getVendorAllotments,
  getLegacyStats,
  getLegacyProjects,
  getPayments,
  updatePaymentStatus,
  deletePayment
} from '../services/api';
import { exportToExcel } from '../utils/excelExport';
import ModalPortal from '../components/ModalPortal';

const STATUS_STYLES = {
  Complete: { bg: 'rgba(3, 216, 127, 0.1)', color: '#03a36a', label: 'Verified Complete' },
  Reversed: { bg: 'rgba(245, 50, 92, 0.1)', color: '#e11d48', label: 'Reversed' },
  Pending: { bg: 'rgba(23, 97, 253, 0.08)', color: '#1761fd', label: 'Pending' },
  Terminates: { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', label: 'Terminated' },
  'Quota Full': { bg: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', label: 'Quota Full' },
  'Quality Terminate': { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', label: 'Quality Terminated' },
  'Security Terminate': { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', label: 'Security Terminated' },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span style={{
      padding: '3px 9px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: style.bg,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      <span className="pulse-dot" style={{ background: style.color }} />
      {style.label}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="report-card" style={{ padding: '16px 18px', margin: 0, flex: 1, minWidth: '180px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#7081b9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {label}
        </span>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: '#1d2c48', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: '#8997bd', marginTop: '5px' }}>{sub}</div>
      )}
    </div>
  );
}

export default function ReconciliationPage({ initialTab = 'clients' }) {
  // Main report categories: 'clients', 'projects', 'vendors', 'journal'
  const [reportTab, setReportTab] = useState(initialTab || 'clients');

  useEffect(() => {
    if (initialTab) {
      setReportTab(initialTab);
    }
  }, [initialTab]);

  // Subtab for journal: 'completes', 'reversals', 'all_leads'
  const [journalSubTab, setJournalSubTab] = useState('completes');

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Data Stores
  const [unifiedData, setUnifiedData] = useState(null);
  const [journalRecords, setJournalRecords] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [leadsList, setLeadsList] = useState([]);

  // Legacy Archive State (1,554 Studies)
  const [legacyStats, setLegacyStats] = useState({
    totalProjects: 1554,
    totalLeads: 33699,
    totalCompletes: 3875,
    totalVendors: 2137
  });
  const [legacyProjects, setLegacyProjects] = useState([]);
  const [legacyTotal, setLegacyTotal] = useState(1554);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [legacySearch, setLegacySearch] = useState('');
  const [legacyPage, setLegacyPage] = useState(1);
  const [legacyLimit, setLegacyLimit] = useState(25);
  const [legacyStatusFilter, setLegacyStatusFilter] = useState('ALL');

  // Real Payments State (2,245 MySQL Records)
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentsSummary, setPaymentsSummary] = useState({
    total_count: 2245,
    total_payout: 8662.10,
    total_paid: 39.00,
    total_pending: 8623.10,
    total_rejected: 0.00,
    count_paid: 1,
    count_pending: 2240,
    count_rejected: 4
  });
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLimit, setPaymentsLimit] = useState(25);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  // Drilldown Modal States: Vendor Reports & Project Reports
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);
  const [vendorDetailLoading, setVendorDetailLoading] = useState(false);
  const [vendorDetailData, setVendorDetailData] = useState(null);
  const [vendorStudySearch, setVendorStudySearch] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [projectDetailData, setProjectDetailData] = useState(null);
  const [projectVendorSearch, setProjectVendorSearch] = useState('');
  const [copiedProjectLinkId, setCopiedProjectLinkId] = useState(null);

  const handleOpenVendorDetails = async (vendor) => {
    setSelectedVendorDetail(vendor);
    setVendorDetailLoading(true);
    setVendorDetailData(null);
    setVendorStudySearch('');
    try {
      const res = await getVendorReportDetails(vendor.vendor_id, vendor.vendor_name);
      if (res) {
        setVendorDetailData(res);
      }
    } catch (err) {
      console.error('Error fetching vendor report details:', err);
    } finally {
      setVendorDetailLoading(false);
    }
  };

  const handleOpenProjectDetails = async (project) => {
    setSelectedProjectDetail(project);
    setProjectDetailLoading(true);
    setProjectDetailData(null);
    setProjectVendorSearch('');
    try {
      const res = await getProjectReportDetails(project.project_id);
      if (res) {
        setProjectDetailData(res);
      }
    } catch (err) {
      console.error('Error fetching project report details:', err);
    } finally {
      setProjectDetailLoading(false);
    }
  };

  const handleCopyLink = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2500);
  };

  const handleCopyProjectVendorLink = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedProjectLinkId(id);
    setTimeout(() => setCopiedProjectLinkId(null), 2500);
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await getPayments({
        status: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
        search: searchTerm || undefined,
        limit: paymentsLimit,
        offset: (paymentsPage - 1) * paymentsLimit
      });
      if (res?.success) {
        setPaymentsList(res.data || []);
        if (res.summary) setPaymentsSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (reportTab === 'payments') {
      loadPayments();
    }
  }, [reportTab, paymentStatusFilter, paymentsPage, paymentsLimit, searchTerm]);

  const handleUpdatePaymentStatus = async (id, newStatus) => {
    setUpdatingPaymentId(id);
    try {
      const res = await updatePaymentStatus({ id, status: newStatus });
      if (res?.success) {
        setPaymentsList(prev => prev.map(p => (p.id === id ? { ...p, status: newStatus } : p)));
        loadPayments();
      }
    } catch (err) {
      alert('Error updating payment status: ' + (err.message || 'Server error'));
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleDeletePayment = async (id, paymentCode) => {
    if (!window.confirm(`Are you sure you want to delete payment record ${paymentCode || ('#' + id)} permanently? This cannot be undone.`)) {
      return;
    }
    setUpdatingPaymentId(id);
    try {
      const res = await deletePayment(id);
      if (res?.success) {
        setPaymentsList(prev => prev.filter(p => p.id !== id));
        loadPayments();
      } else {
        alert(res?.message || 'Failed to delete payment');
      }
    } catch (err) {
      alert('Error deleting payment: ' + (err.message || 'Server error'));
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  useEffect(() => {
    if (reportTab === 'archive') {
      getLegacyStats().then(s => {
        if (s) setLegacyStats(s);
      }).catch(() => {});
    }
  }, [reportTab]);

  useEffect(() => {
    if (reportTab === 'archive') {
      setLegacyLoading(true);
      const offset = (legacyPage - 1) * legacyLimit;
      getLegacyProjects(legacySearch, legacyLimit, offset)
        .then(res => {
          setLegacyProjects(res?.data || []);
          if (res?.total) setLegacyTotal(res.total);
        })
        .catch(() => {})
        .finally(() => setLegacyLoading(false));
    }
  }, [reportTab, legacySearch, legacyPage, legacyLimit]);

  const filteredLegacyProjects = useMemo(() => {
    if (legacyStatusFilter === 'ALL') return legacyProjects;
    return legacyProjects.filter(p => (p.status || '').toLowerCase() === legacyStatusFilter.toLowerCase());
  }, [legacyProjects, legacyStatusFilter]);

  // Fetch all necessary reporting data
  const loadReportsData = async () => {
    setLoading(true);
    try {
      // 1. Try unified reports endpoint
      const uRes = await getUnifiedReports(fromDate, toDate);
      if (uRes && uRes.success) {
        setUnifiedData(uRes.data);
      }

      // 2. Load entities to guarantee complete reporting even if offline
      const [cRes, pRes, vRes, lRes] = await Promise.allSettled([
        getClients(),
        getProjects(),
        getVendors(),
        getInternalLeads(300)
      ]);

      const clients = cRes.status === 'fulfilled' && (cRes.value?.data || (Array.isArray(cRes.value) ? cRes.value : [])) || [];
      const projects = pRes.status === 'fulfilled' && (pRes.value?.data || (Array.isArray(pRes.value) ? pRes.value : [])) || [];
      const vendors = vRes.status === 'fulfilled' && (vRes.value?.data || (Array.isArray(vRes.value) ? vRes.value : [])) || [];
      const leads = lRes.status === 'fulfilled' && (lRes.value?.data || (Array.isArray(lRes.value) ? lRes.value : [])) || [];

      setClientsList(clients);
      setProjectsList(projects);
      setVendorsList(vendors);
      setLeadsList(leads);

      // Load journal subtab
      if (journalSubTab === 'completes') {
        const compRes = await getReconciliationCompletes(fromDate, toDate);
        setJournalRecords(Array.isArray(compRes?.data) ? compRes.data : []);
      } else if (journalSubTab === 'reversals') {
        const revRes = await getReconciliationReversals(fromDate, toDate);
        setJournalRecords(Array.isArray(revRes?.data) ? revRes.data : []);
      } else {
        setJournalRecords(leads);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, [fromDate, toDate, journalSubTab]);

  // -------------------------------------------------------------
  // Dynamic Aggregations (Computed Real Metrics)
  // -------------------------------------------------------------
  
  // 1. Clients Summary & Breakdown
  const clientRows = useMemo(() => {
    if (unifiedData?.clients && Array.isArray(unifiedData.clients)) {
      return unifiedData.clients;
    }

    const map = {};

    clientsList.forEach(c => {
      const name = c.client_name || c.name || c.clientCode;
      if (name) {
        map[name] = {
          client_name: name,
          client_code: c.client_code || c.code || 'MX',
          country: c.country || 'Global',
          currency: c.currency || 'USD',
          total_projects: 0,
          total_clicks: 0,
          total_completes: 0,
          total_terminates: 0,
          total_overquota: 0,
          total_revenue: 0
        };
      }
    });

    // Populate from projects
    projectsList.forEach(p => {
      const cName = p.client_name || p.clientName || 'Market Xcel';
      const target = map[cName] || map['Market Xcel'];
      if (target) {
        target.total_projects += 1;
        const comp = Number(p.total_completes || p.completeCount || 0);
        const clicks = Number(p.total_clicks || (comp > 0 ? comp : 0));
        const terms = Number(p.total_terminates || 0);
        const overq = Number(p.total_overquota || 0);
        target.total_completes += comp;
        target.total_clicks += clicks;
        target.total_terminates += terms;
        target.total_overquota += overq;
        target.total_revenue += comp * Number(p.cpi || p.cost_per_complete || p.costPerComplete || 1.00);
      }
    });

    return Object.values(map);
  }, [unifiedData, clientsList, projectsList]);

  // 2. Projects Summary & Breakdown
  const projectRows = useMemo(() => {
    if (unifiedData?.projects && Array.isArray(unifiedData.projects)) {
      return unifiedData.projects;
    }

    return projectsList.map(p => {
      const pid = p.project_id || p.projectId || p._id;
      const target = Number(p.target_completes || p.max_limit || p.maxLimit || 500);
      const delivered = Number(p.total_completes || p.completeCount || 0);
      const clicks = Number(p.total_clicks || (delivered > 0 ? delivered : 0));
      const terminates = Number(p.total_terminates || 0);
      const overquota = Number(p.total_overquota || 0);
      const cpi = Number(p.cpi || p.cost_per_complete || p.costPerComplete || 1.00);
      const cr = clicks > 0 ? Math.round((delivered / clicks) * 100) : (delivered > 0 ? 100 : 0);

      return {
        project_id: pid,
        project_name: p.project_name || p.name || `Study #${pid}`,
        client_name: p.client_name || p.clientName || 'Market Xcel',
        cpi,
        target_completes: target,
        total_clicks: clicks,
        total_completes: delivered,
        total_terminates: terminates,
        total_overquota: overquota,
        conversion_rate: cr,
        total_revenue: delivered * cpi,
        status: p.status || 'Live'
      };
    });
  }, [unifiedData, projectsList]);

  // 3. Vendors Summary & Breakdown
  const vendorRows = useMemo(() => {
    if (unifiedData?.vendors && Array.isArray(unifiedData.vendors)) {
      return unifiedData.vendors;
    }

    return vendorsList.map(v => {
      const vid = v.vendor_code || v.vendor_id || v.vendorUid || v._id;
      const cpi = Number(v.cpi || v.avg_cpi || 0.70);
      const completes = Number(v.total_completes || v.complete_count || v.completes_count || 0);
      const clicks = Number(v.total_clicks || v.clicks_count || (completes > 0 ? completes : 0));
      const terminates = Number(v.total_terminates || v.terminates_count || 0);
      const security = Number(v.security_terminates || 0);
      const cr = clicks > 0 ? Math.round((completes / clicks) * 100) : (completes > 0 ? 100 : 0);
      const payout = completes * cpi;

      return {
        vendor_id: vid,
        vendor_name: v.name || v.vendor_name || vid,
        assigned_projects: v.assigned_projects || 1,
        avg_cpi: cpi,
        total_clicks: clicks,
        total_completes: completes,
        total_terminates: terminates,
        security_terminates: security,
        conversion_rate: cr,
        total_payout: payout
      };
    });
  }, [unifiedData, vendorsList]);

  // Grand KPI Totals across platform
  const kpis = useMemo(() => {
    const totalRev = clientRows.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
    const totalPayout = vendorRows.reduce((sum, v) => sum + (v.total_payout || 0), 0);
    const totalCompletes = projectRows.reduce((sum, p) => sum + (p.total_completes || 0), 0);
    const totalClicks = projectRows.reduce((sum, p) => sum + (p.total_clicks || 0), 0);
    const netMargin = totalRev - totalPayout;

    return {
      totalRev: totalRev.toFixed(2),
      totalPayout: totalPayout.toFixed(2),
      netMargin: netMargin.toFixed(2),
      totalCompletes: totalCompletes.toLocaleString(),
      totalClicks: totalClicks.toLocaleString(),
      marginPct: totalRev > 0 ? Math.round((netMargin / totalRev) * 100) : 0
    };
  }, [clientRows, vendorRows, projectRows]);

  // Filtered rows based on search
  const filteredClientRows = useMemo(() => {
    if (!searchTerm) return clientRows;
    const q = searchTerm.toLowerCase();
    return clientRows.filter(c => 
      c.client_name?.toLowerCase().includes(q) || 
      c.client_code?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q)
    );
  }, [clientRows, searchTerm]);

  const filteredProjectRows = useMemo(() => {
    if (!searchTerm) return projectRows;
    const q = searchTerm.toLowerCase();
    return projectRows.filter(p => 
      String(p.project_id).toLowerCase().includes(q) ||
      p.project_name?.toLowerCase().includes(q) ||
      p.client_name?.toLowerCase().includes(q)
    );
  }, [projectRows, searchTerm]);

  const filteredVendorRows = useMemo(() => {
    if (!searchTerm) return vendorRows;
    const q = searchTerm.toLowerCase();
    return vendorRows.filter(v => 
      v.vendor_name?.toLowerCase().includes(q) ||
      v.vendor_id?.toLowerCase().includes(q)
    );
  }, [vendorRows, searchTerm]);

  const filteredJournalRecords = useMemo(() => {
    if (!searchTerm) return journalRecords;
    const q = searchTerm.toLowerCase();
    return journalRecords.filter(r => 
      String(r.participantId || r.lead_id || r.SupplierTransactionId || '').toLowerCase().includes(q) ||
      String(r.surveyId || r.project_id || '').toLowerCase().includes(q) ||
      String(r.vendorId || r.vendor_id || '').toLowerCase().includes(q)
    );
  }, [journalRecords, searchTerm]);

  // Export functions
  const exportCsv = (filename, headers, rows) => {
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${fromDate}_to_${toDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportLegacyArchive = async () => {
    try {
      const res = await getLegacyProjects(legacySearch, 1554, 0);
      const data = res?.data || legacyProjects;
      const exportRows = data.map(p => ({
        'Project ID': p.project_id || p.id,
        'Project Name': p.name || 'N/A',
        'Client': p.client_name || 'Direct Buyer',
        'Agreed CPI ($)': Number(p.cpi || p.cost_per_complete || 1.00).toFixed(2),
        'Max Quota Cap': p.max_limit || 0,
        'Routed Leads': p.routed_leads || 0,
        'Verified Completes': p.completes || 0,
        'Status': p.status || 'Live',
        'Created Date': p.date || 'N/A'
      }));
      exportToExcel(exportRows, 'VMH_Legacy_Database_Archive_1554', 'Legacy Projects');
    } catch {
      alert('Failed to export legacy projects.');
    }
  };

  const handleExportBankBatchCsv = () => {
    const headers = [
      'Recipient Name',
      'Vendor ID',
      'Payment Reference',
      'Payout Amount ($)',
      'Currency',
      'Status',
      'Study PID',
      'Study Name',
      'Payment Method',
      'Bank Account / PayPal Email',
      'Invoice Date',
      'Audit Remarks'
    ];
    const rows = paymentsList.map(p => [
      `"${(p.vendor_name || 'Vendor ' + (p.vendor_id || '')).replace(/"/g, '""')}"`,
      `"${p.vendor_id || ''}"`,
      `"${p.payment_id || 'PAY-' + p.id}"`,
      Number(p.amount || 0).toFixed(2),
      'USD',
      `"${p.status || 'Pending'}"`,
      `"${p.project_id || ''}"`,
      `"${(p.project_name || '').replace(/"/g, '""')}"`,
      `"${p.payment_method || 'Bank Batch Wire'}"`,
      `"${p.account_details || p.vendor_email || ''}"`,
      `"${p.created_at || ''}"`,
      `"${(p.remarks || '').replace(/"/g, '""')}"`
    ]);
    exportCsv('bank_paypal_batch_settlement_file', headers, rows);
  };

  const handleExportActiveTab = () => {
    if (reportTab === 'archive') {
      handleExportLegacyArchive();
      return;
    }
    if (reportTab === 'payments') {
      handleExportBankBatchCsv();
      return;
    }
    if (reportTab === 'clients') {
      const headers = ['Client Name', 'Client Code', 'Country', 'Currency', 'Total Studies', 'Routed Clicks', 'Delivered Completes', 'Terminates', 'Overquota', 'Gross Revenue ($)'];
      const rows = filteredClientRows.map(c => [
        `"${c.client_name}"`, c.client_code, c.country, c.currency, c.total_projects, c.total_clicks, c.total_completes, c.total_terminates, c.total_overquota, c.total_revenue.toFixed(2)
      ]);
      exportCsv('vmh_clients_performance_report', headers, rows);
    } else if (reportTab === 'projects') {
      const headers = ['Project ID', 'Project Name', 'Client', 'Revenue CPI ($)', 'Target Completes', 'Total Clicks', 'Completes', 'Terminates', 'Conversion Rate (%)', 'Total Revenue ($)', 'Status'];
      const rows = filteredProjectRows.map(p => [
        p.project_id, `"${p.project_name}"`, `"${p.client_name}"`, p.cpi.toFixed(2), p.target_completes, p.total_clicks, p.total_completes, p.total_terminates, `${p.conversion_rate}%`, p.total_revenue.toFixed(2), p.status
      ]);
      exportCsv('vmh_projects_performance_report', headers, rows);
    } else if (reportTab === 'vendors') {
      const headers = ['Vendor Name', 'Vendor Code', 'Assigned Studies', 'Average CPI ($)', 'Inbound Clicks', 'Verified Completes', 'Terminates', 'Security Disqualified', 'Conversion Rate (%)', 'Total Payout Due ($)'];
      const rows = filteredVendorRows.map(v => [
        `"${v.vendor_name}"`, v.vendor_id, v.assigned_projects, v.avg_cpi.toFixed(2), v.total_clicks, v.total_completes, v.total_terminates, v.security_terminates, `${v.conversion_rate}%`, v.total_payout.toFixed(2)
      ]);
      exportCsv('vmh_vendors_performance_report', headers, rows);
    } else {
      const headers = ['Participant UID', 'Project ID', 'Vendor', 'Completion Date', 'Duration (Min)', 'Status', 'Device', 'Country'];
      const rows = filteredJournalRecords.map(r => [
        r.participantId || r.lead_id || '', r.surveyId || r.project_id || '', r.vendorId || r.vendor_id || '', r.completionDate || r.end_time || '', r.durationMinutes || r.time_spent || '', r.status || '', r.device || 'Desktop', r.country || 'US'
      ]);
      exportCsv(`vmh_audit_journal_${journalSubTab}`, headers, rows);
    }
  };

  return (
    <div>
      {/* Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Intelligence</span>
            <span className="separator">/</span>
            <span className="current">Unified Reports Hub</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">Reports & Analytics Hub</h4>
            <span className="badge-soft-success" style={{
              padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: '5px'
            }}>
              <span className="pulse-dot" />
              Real-Time MySQL Persistence
            </span>
          </div>
        </div>

        <div className="title-box-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadReportsData}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '7px 12px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportActiveTab}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px' }}
          >
            <Download size={14} />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="responsive-four-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <SummaryCard
          icon={DollarSign}
          label="Gross Client Revenue"
          value={`$${kpis.totalRev}`}
          color="#03d87f"
          sub="Total earned across active buyer studies"
        />
        <SummaryCard
          icon={Users}
          label="Supply Vendor Payout"
          value={`$${kpis.totalPayout}`}
          color="#1761fd"
          sub="Payable to partner sample suppliers"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Net Gross Margin"
          value={`$${kpis.netMargin}`}
          color="#10b981"
          sub={`+${kpis.marginPct}% Gross operating profit`}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Delivered Completes"
          value={kpis.totalCompletes}
          color="#7c3aed"
          sub={`From ${kpis.totalClicks} routed leads`}
        />
      </div>

      {/* Main Filter & Navigation Bar */}
      <div className="report-card" style={{ marginBottom: '16px', padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          {/* 4 Main Report Navigation Tabs */}
          <div className="timeframe-group" style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`timeframe-btn ${reportTab === 'clients' ? 'active' : ''}`}
              onClick={() => { setReportTab('clients'); setSearchTerm(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: 700 }}
            >
              <Building2 size={14} />
              <span>1. Client Reports</span>
            </button>

            <button
              className={`timeframe-btn ${reportTab === 'projects' ? 'active' : ''}`}
              onClick={() => { setReportTab('projects'); setSearchTerm(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: 700 }}
            >
              <Briefcase size={14} />
              <span>2. Project / PID Reports</span>
            </button>

            <button
              className={`timeframe-btn ${reportTab === 'vendors' ? 'active' : ''}`}
              onClick={() => { setReportTab('vendors'); setSearchTerm(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: 700 }}
            >
              <Users size={14} />
              <span>3. Vendor Reports</span>
            </button>

            <button
              className={`timeframe-btn ${reportTab === 'journal' ? 'active' : ''}`}
              onClick={() => { setReportTab('journal'); setSearchTerm(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: 700 }}
            >
              <FileCheck2 size={14} />
              <span>4. Respondent Audit Journal</span>
            </button>

            <button
              className={`timeframe-btn ${reportTab === 'archive' ? 'active' : ''}`}
              onClick={() => { setReportTab('archive'); setSearchTerm(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: 700 }}
            >
              <Database size={14} color="#1761fd" />
              <span>5. Legacy Database Archive</span>
              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(23, 97, 253, 0.15)', color: '#1761fd', fontWeight: 800 }}>
                1,554
              </span>
            </button>

            <button
              className={`timeframe-btn ${reportTab === 'payments' ? 'active' : ''}`}
              onClick={() => { setReportTab('payments'); setSearchTerm(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: 700 }}
            >
              <DollarSign size={14} color="#10b981" />
              <span>6. Vendor Payments & Payouts</span>
              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800 }}>
                2,245
              </span>
            </button>
          </div>

          {/* Date Range & Search Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                className="input-control"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{ width: '135px', height: '34px', fontSize: '11.5px' }}
                title="From Date"
              />
              <span style={{ fontSize: '11px', color: '#8997bd' }}>to</span>
              <input
                type="date"
                className="input-control"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{ width: '135px', height: '34px', fontSize: '11.5px' }}
                title="To Date"
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Search
                size={13}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }}
              />
              <input
                type="text"
                className="input-control"
                placeholder={`Search ${reportTab}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '38px', width: '200px', height: '34px', fontSize: '11.5px' }}
              />
            </div>
          </div>
        </div>

        {/* Journal Subtabs (Only shown when reportTab === 'journal') */}
        {reportTab === 'journal' && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${journalSubTab === 'completes' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setJournalSubTab('completes')}
              style={{ fontSize: '11.5px', padding: '4px 12px' }}
            >
              ✓ Verified Completes ({journalRecords.length})
            </button>
            <button
              className={`btn btn-sm ${journalSubTab === 'reversals' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setJournalSubTab('reversals')}
              style={{ fontSize: '11.5px', padding: '4px 12px' }}
            >
              🛡️ Security & Disqualified
            </button>
            <button
              className={`btn btn-sm ${journalSubTab === 'all_leads' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setJournalSubTab('all_leads')}
              style={{ fontSize: '11.5px', padding: '4px 12px' }}
            >
              📋 All Inbound Leads ({leadsList.length})
            </button>
          </div>
        )}
      </div>

      {/* Report Tables */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8997bd' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            Aggregating performance metrics from live MySQL database...
          </div>
        ) : (
          <>
            {/* 1. Client-Wise Report View */}
            {reportTab === 'clients' && (
              <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="custom-table compact-table" style={{ width: '100%' }}>
                  <thead className="thead-light">
                    <tr>
                      <th>Demand Client & Code</th>
                      <th>Region / Currency</th>
                      <th>Total Studies</th>
                      <th>Routed Clicks</th>
                      <th>Delivered Completes</th>
                      <th>Terminates</th>
                      <th>Overquota</th>
                      <th>Conversion Rate</th>
                      <th>Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientRows.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#8997bd' }}>
                          No client records match current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredClientRows.map(c => {
                        const cr = c.total_clicks > 0 ? Math.round((c.total_completes / c.total_clicks) * 100) : 0;
                        return (
                          <tr key={c.client_name || c.client_code}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13px' }}>
                                {c.client_name}
                              </div>
                              <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>
                                {c.client_code}
                              </span>
                            </td>
                            <td>
                              <div style={{ color: '#303e67', fontSize: '12px', fontWeight: 600 }}>{c.country}</div>
                              <span style={{ fontSize: '11px', color: '#8997bd' }}>{c.currency}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#1d2c48' }}>{c.total_projects} Active</span>
                            </td>
                            <td>
                              <span style={{ color: '#303e67', fontWeight: 600 }}>{c.total_clicks.toLocaleString()}</span>
                            </td>
                            <td>
                              <span style={{ color: '#16a34a', fontWeight: 800 }}>{c.total_completes.toLocaleString()}</span>
                            </td>
                            <td>
                              <span style={{ color: '#d97706' }}>{c.total_terminates.toLocaleString()}</span>
                            </td>
                            <td>
                              <span style={{ color: '#8997bd' }}>{c.total_overquota.toLocaleString()}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '45px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${cr}%`, height: '100%', background: '#1761fd' }} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '11.5px', color: '#1761fd' }}>{cr}%</span>
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: '#03d87f', fontSize: '14px' }}>
                                ${Number(c.total_revenue || 0).toFixed(2)}
                              </strong>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. Project Performance Report View */}
            {reportTab === 'projects' && (
              <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="custom-table compact-table" style={{ width: '100%' }}>
                  <thead className="thead-light">
                    <tr>
                      <th style={{ width: '190px' }}>Project / PID</th>
                      <th style={{ width: '90px' }}>Buyer</th>
                      <th style={{ width: '60px' }}>CPI</th>
                      <th style={{ width: '100px' }}>Quota Pacing</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>Clicks</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>Comp</th>
                      <th style={{ width: '50px', textAlign: 'center' }}>Term</th>
                      <th style={{ width: '50px', textAlign: 'center' }}>OQ</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>CR%</th>
                      <th style={{ width: '75px' }}>Revenue</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>Status</th>
                      <th className="col-sticky-action" style={{ width: '85px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjectRows.length === 0 ? (
                      <tr>
                        <td colSpan="12" style={{ textAlign: 'center', padding: '30px', color: '#8997bd' }}>
                          No study projects match current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProjectRows.map(p => {
                        const target = p.target_completes || 500;
                        const delivered = p.total_completes || 0;
                        const pacing = Math.min(100, Math.round((delivered / target) * 100));

                        return (
                          <tr key={p.project_id}>
                            <td style={{ maxWidth: '190px' }}>
                              <div style={{ fontWeight: 700, color: '#1d2c48', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.project_name}>
                                {p.project_name}
                              </div>
                              <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', marginTop: '1px', display: 'inline-block' }}>
                                PID: {p.project_id}
                              </span>
                            </td>
                            <td style={{ maxWidth: '90px' }}>
                              <span style={{ color: '#303e67', fontSize: '11.5px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }} title={p.client_name}>
                                {p.client_name}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: '#028745', fontSize: '12px' }}>${Number(p.cpi).toFixed(2)}</strong>
                            </td>
                            <td style={{ minWidth: '95px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                                <span>{delivered}/{target}</span>
                                <span style={{ fontWeight: 700, color: '#2e3094' }}>{pacing}%</span>
                              </div>
                              <div style={{ width: '100%', height: '3px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${pacing}%`, height: '100%', background: pacing > 80 ? '#028745' : '#2e3094' }} />
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontSize: '11.5px' }}>{p.total_clicks}</td>
                            <td style={{ textAlign: 'center' }}><strong style={{ color: '#028745', fontSize: '12px' }}>{p.total_completes}</strong></td>
                            <td style={{ textAlign: 'center' }}><span style={{ color: '#d97706', fontSize: '11.5px' }}>{p.total_terminates}</span></td>
                            <td style={{ textAlign: 'center' }}><span style={{ color: '#8997bd', fontSize: '11.5px' }}>{p.total_overquota}</span></td>
                            <td style={{ textAlign: 'center' }}><strong style={{ color: '#2e3094', fontSize: '11.5px' }}>{p.conversion_rate}%</strong></td>
                            <td><strong style={{ color: '#028745', fontSize: '12px' }}>${Number(p.total_revenue).toFixed(2)}</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="badge-soft-success" style={{ padding: '1px 5px', borderRadius: '3px', fontSize: '10px', fontWeight: 700 }}>
                                Live
                              </span>
                            </td>
                            <td className="col-sticky-action" style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => handleOpenProjectDetails(p)}
                                style={{
                                  background: 'rgba(46, 48, 148, 0.08)',
                                  color: '#2e3094',
                                  border: '1px solid rgba(46, 48, 148, 0.25)',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                                title={`View assigned vendors and delivery breakdown for ${p.project_name}`}
                              >
                                <Eye size={11} />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Vendor Performance Report View */}
            {reportTab === 'vendors' && (
              <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="custom-table compact-table" style={{ width: '100%' }}>
                  <thead className="thead-light">
                    <tr>
                      <th style={{ width: '180px' }}>Vendor Panel</th>
                      <th style={{ width: '65px' }}>Avg CPI</th>
                      <th style={{ width: '65px', textAlign: 'center' }}>Studies</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Clicks</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Comp</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>Term</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>Sec Term</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>CR%</th>
                      <th style={{ width: '80px' }}>Payout</th>
                      <th className="col-sticky-action" style={{ width: '85px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendorRows.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#8997bd' }}>
                          No vendor records match current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredVendorRows.map(v => (
                        <tr key={v.vendor_id}>
                          <td style={{ maxWidth: '180px' }}>
                            <div style={{ fontWeight: 700, color: '#1d2c48', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.vendor_name}>
                              {v.vendor_name}
                            </div>
                            <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', marginTop: '1px', display: 'inline-block' }}>
                              {v.vendor_id}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#2e3094', fontSize: '12px' }}>${Number(v.avg_cpi).toFixed(2)}</strong>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: '#303e67', fontWeight: 600, fontSize: '11.5px' }}>{v.assigned_projects}</span>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '11.5px' }}>
                            <span style={{ color: '#303e67' }}>{v.total_clicks.toLocaleString()}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <strong style={{ color: '#028745', fontSize: '12px' }}>{v.total_completes.toLocaleString()}</strong>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: '#d97706', fontSize: '11.5px' }}>{v.total_terminates.toLocaleString()}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '11.5px' }}>{v.security_terminates}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#2e3094', fontSize: '11.5px' }}>{v.conversion_rate}%</span>
                          </td>
                          <td>
                            <strong style={{ color: '#1d2c48', fontSize: '12px' }}>
                              ${Number(v.total_payout).toFixed(2)}
                            </strong>
                          </td>
                          <td className="col-sticky-action" style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => handleOpenVendorDetails(v)}
                              style={{
                                background: 'rgba(46, 48, 148, 0.08)',
                                color: '#2e3094',
                                border: '1px solid rgba(46, 48, 148, 0.25)',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                              title={`View assigned studies breakdown for ${v.vendor_name}`}
                            >
                              <Eye size={11} />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Respondent Audit Journal View */}
            {reportTab === 'journal' && (
              <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="custom-table compact-table" style={{ width: '100%' }}>
                  <thead className="thead-light">
                    <tr>
                      <th>Participant UID</th>
                      <th>Study PID</th>
                      <th>Vendor ID</th>
                      <th>Outcome Status</th>
                      <th>Duration</th>
                      <th>IP & Device</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJournalRecords.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#8997bd' }}>
                          No audit records found for current criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredJournalRecords.map((r, idx) => {
                        const uid = r.participantId || r.lead_id || `UID_${idx}`;
                        const pid = r.surveyId || r.project_id || 'VMHP1026542026';
                        const vid = r.vendorId || r.vendor_id || 'VND-DYN-01';
                        const st = r.status || 'Complete';
                        const dur = r.durationMinutes || Math.round((r.time_spent || 60) / 60);

                        return (
                          <tr key={uid + idx}>
                            <td>
                              <code style={{ fontSize: '11.5px', color: '#1761fd', fontWeight: 700 }}>
                                {uid}
                              </code>
                            </td>
                            <td>
                              <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px' }}>
                                PID: {pid}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: '#303e67', fontSize: '12px', fontWeight: 600 }}>{vid}</span>
                            </td>
                            <td>
                              <StatusBadge status={st} />
                            </td>
                            <td>
                              <span style={{ color: '#303e67', fontSize: '11.5px' }}>{dur} mins</span>
                            </td>
                            <td>
                              <div style={{ fontSize: '11px', color: '#303e67' }}>{r.ip_address || '127.0.0.1'}</div>
                              <span style={{ fontSize: '10.5px', color: '#8997bd' }}>{r.device || 'Desktop'}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: '11px', color: '#8997bd' }}>
                                {r.completionDate || r.end_time || r.start_time || new Date().toISOString().slice(0, 16).replace('T', ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. Legacy Database Archive View (1,554 Studies) */}
            {reportTab === 'archive' && (
              <div>
                {/* Legacy KPI Mini Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Legacy Projects</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1761FD', marginTop: '2px' }}>
                      {Number(legacyStats.totalProjects || 1554).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#10B981', marginTop: '2px' }}>● 100% Preserved Studies</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Historical Leads</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#03D87F', marginTop: '2px' }}>
                      {Number(legacyStats.totalLeads || 33699).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Routed traffic sessions</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Delivered Completes</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
                      {Number(legacyStats.totalCompletes || 3875).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Verified completions</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Connected Suppliers</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#FDAB3D', marginTop: '2px' }}>
                      {Number(legacyStats.totalVendors || 2137).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Panel suppliers network</div>
                  </div>
                </div>

                {/* Legacy Archive Filter & Search Bar */}
                <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Search 1,554 studies by name, PID, client..."
                        value={legacySearch}
                        onChange={e => { setLegacySearch(e.target.value); setLegacyPage(1); }}
                        style={{ paddingLeft: '32px', height: '34px', fontSize: '12px', width: '100%' }}
                      />
                    </div>
                    <select
                      className="input-control"
                      value={legacyStatusFilter}
                      onChange={e => setLegacyStatusFilter(e.target.value)}
                      style={{ height: '34px', fontSize: '12px', width: 'auto' }}
                    >
                      <option value="ALL">All Project Statuses</option>
                      <option value="Live">Live / Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Paused">Paused</option>
                      <option value="Cancel">Cancelled</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-soft-success btn-sm"
                      onClick={handleExportLegacyArchive}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '6px 12px', fontWeight: 700 }}
                      title="Export all matching legacy studies to Excel (.xlsx)"
                    >
                      <Download size={13} /> Export Archive (.xlsx)
                    </button>
                    <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                      Showing {legacyLoading ? '...' : `${(legacyPage - 1) * legacyLimit + 1} - ${Math.min(legacyPage * legacyLimit, legacyTotal)} of ${legacyTotal.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Legacy Archive Data Table */}
                <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                  <table className="custom-table compact-table" style={{ width: '100%' }}>
                    <thead className="thead-light">
                      <tr>
                        <th>Study PID / Code</th>
                        <th>Study Name</th>
                        <th>Client / Buyer</th>
                        <th>Agreed CPI</th>
                        <th>Target Cap</th>
                        <th>Routed Leads</th>
                        <th>Completes</th>
                        <th>Pacing</th>
                        <th>Status</th>
                        <th>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {legacyLoading ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                            Loading legacy study records from MySQL archive...
                          </td>
                        </tr>
                      ) : filteredLegacyProjects.length === 0 ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '13px' }}>
                            No legacy studies found matching "{legacySearch}".
                          </td>
                        </tr>
                      ) : (
                        filteredLegacyProjects.map(p => {
                          const limit = Number(p.max_limit || 100);
                          const comp = Number(p.completes || 0);
                          const leads = Number(p.routed_leads || 0);
                          const pct = limit > 0 ? Math.min(100, Math.round((comp / limit) * 100)) : 0;
                          return (
                            <tr key={p.id || p.project_id}>
                              <td>
                                <strong style={{ color: '#0F172A', fontFamily: 'monospace', fontSize: '12px' }}>
                                  {p.project_id || `PID-${p.id}`}
                                </strong>
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '12.5px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                                  {p.name || 'Unnamed Study'}
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                                  {p.client_name || 'Direct Buyer'}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: '#16A34A', fontSize: '13px' }}>
                                  ${Number(p.cpi || p.cost_per_complete || 1.00).toFixed(2)}
                                </strong>
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', color: '#334155' }}>
                                  {limit.toLocaleString()}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', color: '#64748B' }}>
                                  {leads.toLocaleString()}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: '#1761FD', fontSize: '12.5px' }}>
                                  {comp.toLocaleString()}
                                </strong>
                              </td>
                              <td style={{ minWidth: '120px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 700, color: pct >= 100 ? '#DC2626' : '#1761FD' }}>{pct}%</span>
                                  <span style={{ color: '#64748B' }}>{comp} / {limit}</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#DC2626' : '#10B981' }} />
                                </div>
                              </td>
                              <td>
                                <span className={`badge-soft-${(p.status || '').toLowerCase() === 'live' ? 'success' : (p.status || '').toLowerCase() === 'completed' ? 'primary' : 'warning'}`} style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                                  {p.status || 'Active'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  {p.date ? String(p.date).slice(0, 10) : 'Archive'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Legacy Archive Pagination Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                    <span>Rows per page:</span>
                    <select
                      className="input-control"
                      value={legacyLimit}
                      onChange={e => { setLegacyLimit(Number(e.target.value)); setLegacyPage(1); }}
                      style={{ height: '30px', fontSize: '11.5px', width: '70px' }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={legacyPage <= 1 || legacyLoading}
                      onClick={() => setLegacyPage(p => Math.max(1, p - 1))}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 10px' }}
                    >
                      <ChevronLeft size={13} /> Previous
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', padding: '0 8px' }}>
                      Page {legacyPage} of {Math.max(1, Math.ceil(legacyTotal / legacyLimit))}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={legacyPage * legacyLimit >= legacyTotal || legacyLoading}
                      onClick={() => setLegacyPage(p => p + 1)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 10px' }}
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Vendor Payments & Payout Reconciliation (Real MySQL `payments`) */}
            {reportTab === 'payments' && (
              <div>
                {/* Financial Overview Sub-header */}
                <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Filter Status:</span>
                    {['ALL', 'Pending', 'Paid', 'Rejected'].map(st => {
                      const count = st === 'ALL' ? (paymentsSummary.total_count || 0) :
                                    st === 'Pending' ? (paymentsSummary.count_pending || 0) :
                                    st === 'Paid' ? (paymentsSummary.count_paid || 0) :
                                    (paymentsSummary.count_rejected || 0);
                      const active = paymentStatusFilter === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => { setPaymentStatusFilter(st); setPaymentsPage(1); }}
                          style={{ fontSize: '11px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <span>{st === 'ALL' ? 'All Invoices' : st}</span>
                          <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '10px', background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)' }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Pending: <strong style={{ color: '#d97706' }}>${parseFloat(paymentsSummary.total_pending || 0).toFixed(2)}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Settled Paid: <strong style={{ color: '#10b981' }}>${parseFloat(paymentsSummary.total_paid || 0).toFixed(2)}</strong>
                    </div>
                    <button
                      type="button"
                      className="btn btn-soft-success btn-sm"
                      onClick={handleExportBankBatchCsv}
                      disabled={paymentsList.length === 0}
                      title="Download Bank / PayPal Batch Transfer File (RFC-4180 CSV)"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '4px 10px' }}
                    >
                      <Download size={12} /> Bank Batch Settlement CSV
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={loadPayments}
                      title="Refresh Payments"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                    >
                      <RefreshCw size={12} className={paymentsLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                {/* Payments Table */}
                <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                  <table className="custom-table" style={{ width: '100%' }}>
                    <thead className="thead-light">
                      <tr>
                        <th>Invoice / Payment ID</th>
                        <th>Associated Study</th>
                        <th>Partner Vendor</th>
                        <th style={{ textAlign: 'right' }}>Payout Due</th>
                        <th style={{ textAlign: 'center' }}>Settlement Status</th>
                        <th>Remarks / Audit Note</th>
                        <th>Invoice Date</th>
                        <th style={{ textAlign: 'center' }}>Reconcile Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsLoading ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                            <div className="spinner" style={{ margin: '0 auto 12px' }} />
                            Loading live payout records from MySQL database...
                          </td>
                        </tr>
                      ) : paymentsList.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8997bd' }}>
                            No payment records found matching current criteria.
                          </td>
                        </tr>
                      ) : (
                        paymentsList.map(pay => {
                          const isUpdating = updatingPaymentId === pay.id;
                          return (
                            <tr key={pay.id || pay.payment_id}>
                              <td>
                                <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#1761fd', fontSize: '12.5px' }}>
                                  {pay.payment_id}
                                </div>
                                <span style={{ fontSize: '10.5px', color: '#8997bd' }}>
                                  Ref #{pay.id}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '12.5px' }}>
                                  {pay.project_name || `Study #${pay.project_id}`}
                                </div>
                                {pay.project_code && (
                                  <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>
                                    {pay.project_code}
                                  </span>
                                )}
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px' }}>
                                  {pay.vendor_name || `Vendor #${pay.vendor_id}`}
                                </div>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 800, fontSize: '13px', color: parseFloat(pay.amount) > 0 ? '#10b981' : '#64748b' }}>
                                  ${parseFloat(pay.amount || 0).toFixed(2)}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  background: pay.status === 'Paid' ? 'rgba(16, 185, 129, 0.12)' : pay.status === 'Rejected' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                  color: pay.status === 'Paid' ? '#10b981' : pay.status === 'Rejected' ? '#ef4444' : '#d97706'
                                }}>
                                  <span className="pulse-dot" style={{ background: pay.status === 'Paid' ? '#10b981' : pay.status === 'Rejected' ? '#ef4444' : '#d97706' }} />
                                  {pay.status}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                                  {pay.remarks || '—'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '11.5px', color: '#475569' }}>
                                  {pay.date ? pay.date.replace('T', ' ').substring(0, 16) : '—'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                                  {pay.status !== 'Paid' && (
                                    <button
                                      type="button"
                                      className="btn btn-soft-success btn-sm"
                                      disabled={isUpdating}
                                      onClick={() => handleUpdatePaymentStatus(pay.id, 'Paid')}
                                      style={{ padding: '3px 8px', fontSize: '10.5px', fontWeight: 600, borderRadius: '4px' }}
                                      title="Mark invoice as Paid"
                                    >
                                      ✓ Settle
                                    </button>
                                  )}
                                  {pay.status !== 'Pending' && (
                                    <button
                                      type="button"
                                      className="btn btn-soft-secondary btn-sm"
                                      disabled={isUpdating}
                                      onClick={() => handleUpdatePaymentStatus(pay.id, 'Pending')}
                                      style={{ padding: '3px 8px', fontSize: '10.5px', borderRadius: '4px' }}
                                      title="Reset status to Pending"
                                    >
                                      Hold
                                    </button>
                                  )}
                                  {pay.status !== 'Rejected' && (
                                    <button
                                      type="button"
                                      className="btn btn-soft-danger btn-sm"
                                      disabled={isUpdating}
                                      onClick={() => handleUpdatePaymentStatus(pay.id, 'Rejected')}
                                      style={{ padding: '3px 8px', fontSize: '10.5px', borderRadius: '4px' }}
                                      title="Reject / Dispute invoice"
                                    >
                                      <X size={14} /> Reject
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-soft-danger btn-sm"
                                    disabled={isUpdating}
                                    onClick={() => handleDeletePayment(pay.id, pay.payment_id)}
                                    style={{
                                      padding: '3px 8px',
                                      fontSize: '10.5px',
                                      borderRadius: '4px',
                                      color: '#b91c1c',
                                      backgroundColor: '#fef2f2',
                                      border: '1px solid #fecaca',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                    title="Delete invoice permanently from database"
                                  >
                                    <Trash2 size={11} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Payments Pagination Bar */}
                <div style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#F8FAFC'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                    <span>Showing</span>
                    <select
                      className="input-control"
                      value={paymentsLimit}
                      onChange={e => { setPaymentsLimit(Number(e.target.value)); setPaymentsPage(1); }}
                      style={{ height: '30px', fontSize: '11.5px', width: '70px' }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>records per page</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={paymentsPage <= 1 || paymentsLoading}
                      onClick={() => setPaymentsPage(p => Math.max(1, p - 1))}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 10px' }}
                    >
                      <ChevronLeft size={13} /> Previous
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', padding: '0 8px' }}>
                      Page {paymentsPage} of {Math.max(1, Math.ceil((paymentsSummary.total_count || 1) / paymentsLimit))}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={paymentsPage * paymentsLimit >= (paymentsSummary.total_count || 0) || paymentsLoading}
                      onClick={() => setPaymentsPage(p => p + 1)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 10px' }}
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Vendor Details Drilldown Modal: Konsi Assign Hui & Kitni Poori Ki */}
      {/* ------------------------------------------------------------- */}
      {selectedVendorDetail && (
        <ModalPortal isOpen={!!selectedVendorDetail} onClose={() => { setSelectedVendorDetail(null); setVendorDetailData(null); }}>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedVendorDetail(null);
                setVendorDetailData(null);
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              padding: '16px',
              overflowY: 'auto'
            }}
          >
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '1150px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(23, 97, 253, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1761fd'
                }}>
                  <Users size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      {selectedVendorDetail.vendor_name}
                    </h3>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(23, 97, 253, 0.1)',
                      color: '#1761fd'
                    }}>
                      {selectedVendorDetail.vendor_id}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981'
                    }}>
                      Verified Supplier
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Lifetime Study Assignments & Delivery Breakdown &bull; Real-Time Database Audit
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const studies = vendorDetailData?.studies || [];
                    const exportRows = studies.map(s => ({
                      'Vendor': selectedVendorDetail.vendor_name,
                      'Vendor ID': selectedVendorDetail.vendor_id,
                      'Study PID': s.project_code,
                      'Study Name': s.project_name,
                      'Client': s.client_name,
                      'Agreed CPI ($)': Number(s.cpi).toFixed(2),
                      'Target Quota': s.quota_limit > 0 ? s.quota_limit : 'Open',
                      'Inbound Clicks': s.clicks_count,
                      'Verified Completes': s.complete_count,
                      'Terminates': s.terminates_count,
                      'CR (%)': `${s.conversion_rate}%`,
                      'Fulfillment (%)': `${s.fulfillment_rate}%`,
                      'Total Payout ($)': Number(s.total_payout).toFixed(2),
                      'Status': s.project_status,
                      'Entry Link': s.entry_link
                    }));
                    exportToExcel(exportRows, `${selectedVendorDetail.vendor_name.replace(/\s+/g, '_')}_Assigned_Studies`, 'Assigned Studies');
                  }}
                  disabled={!vendorDetailData?.studies?.length}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '6px 12px' }}
                >
                  <Download size={13} />
                  <span>Export Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedVendorDetail(null); setVendorDetailData(null); }}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {/* Top Stat Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Assigned Studies
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {vendorDetailData?.vendor?.total_studies ?? vendorDetailData?.studies?.length ?? selectedVendorDetail.assigned_projects}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8997bd', marginTop: '2px' }}>
                    Total studies assigned to partner
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Inbound Traffic
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1761fd', marginTop: '4px' }}>
                    {Number(vendorDetailData?.vendor?.total_clicks ?? selectedVendorDetail.total_clicks).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8997bd', marginTop: '2px' }}>
                    Clicks routed &bull; {Number(vendorDetailData?.vendor?.total_terminates ?? selectedVendorDetail.total_terminates).toLocaleString()} terminates
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Verified Completes
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    {Number(vendorDetailData?.vendor?.total_completes ?? selectedVendorDetail.total_completes).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8997bd', marginTop: '2px' }}>
                    {vendorDetailData?.vendor?.conversion_rate ?? selectedVendorDetail.conversion_rate}% Conversion Rate (CR)
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Payout Due
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    ${Number(vendorDetailData?.vendor?.total_payout ?? selectedVendorDetail.total_payout).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8997bd', marginTop: '2px' }}>
                    Avg CPI: ${Number(vendorDetailData?.vendor?.avg_cpi ?? selectedVendorDetail.avg_cpi).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Sub-header & Filter Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    Assigned Studies Breakdown (Konsi Assign Hui aur Kitni Poori Ki)
                  </h4>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Complete study-by-study performance, assigned quota, and fulfillment progress
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Search studies by name or PID..."
                    value={vendorStudySearch}
                    onChange={e => setVendorStudySearch(e.target.value)}
                    style={{ paddingLeft: '38px', width: '250px', height: '32px', fontSize: '11.5px' }}
                  />
                </div>
              </div>

              {/* Table of Assigned Studies */}
              {vendorDetailLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', display: 'block', color: '#1761fd' }} />
                  <div>Loading live study assignments from database...</div>
                </div>
              ) : (
                <div className="table-wrapper" style={{ margin: 0, border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                  <table className="custom-table" style={{ width: '100%', fontSize: '12px' }}>
                    <thead className="thead-light">
                      <tr>
                        <th>Study PID & Name</th>
                        <th>Client Buyer</th>
                        <th>Agreed CPI</th>
                        <th>Target Quota</th>
                        <th>Inbound Clicks</th>
                        <th>Verified Completes</th>
                        <th>Terminates</th>
                        <th>Quota Fulfillment</th>
                        <th>Study Payout</th>
                        <th>Status</th>
                        <th>Entry Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const studies = vendorDetailData?.studies || [];
                        const q = vendorStudySearch.toLowerCase().trim();
                        const filtered = q
                          ? studies.filter(s =>
                              String(s.project_code || '').toLowerCase().includes(q) ||
                              String(s.project_name || '').toLowerCase().includes(q) ||
                              String(s.client_name || '').toLowerCase().includes(q)
                            )
                          : studies;

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#8997bd' }}>
                                No assigned studies match current search.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((s, sIdx) => {
                          const quota = s.quota_limit > 0 ? s.quota_limit : 0;
                          const completes = s.complete_count || 0;
                          const fulfillment = quota > 0 ? Math.min(100, Math.round((completes / quota) * 100)) : (s.clicks_count > 0 ? Math.round((completes / s.clicks_count) * 100) : 0);

                          return (
                            <tr key={s.assignment_id || sIdx}>
                              <td>
                                <div style={{ fontWeight: 700, color: '#1e293b' }}>
                                  {s.project_name}
                                </div>
                                <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', marginTop: '2px', display: 'inline-block' }}>
                                  {s.project_code}
                                </span>
                              </td>
                              <td>
                                <span style={{ color: '#475569', fontWeight: 600 }}>{s.client_name || 'Market Xcel'}</span>
                              </td>
                              <td>
                                <strong style={{ color: '#1761fd' }}>${Number(s.cpi).toFixed(2)}</strong>
                              </td>
                              <td>
                                <span style={{ color: '#334155' }}>
                                  {quota > 0 ? quota.toLocaleString() : <span style={{ color: '#8997bd' }}>Open</span>}
                                </span>
                              </td>
                              <td>
                                <span style={{ color: '#334155' }}>{s.clicks_count.toLocaleString()}</span>
                              </td>
                              <td>
                                <strong style={{ color: completes > 0 ? '#16a34a' : '#64748b', fontSize: '12.5px' }}>
                                  {completes.toLocaleString()}
                                </strong>
                              </td>
                              <td>
                                <span style={{ color: '#d97706' }}>{s.terminates_count.toLocaleString()}</span>
                              </td>
                              <td style={{ minWidth: '110px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                                  <span>{completes} {quota > 0 ? `/ ${quota}` : ''}</span>
                                  <span style={{ fontWeight: 700, color: '#1761fd' }}>{fulfillment}%</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${fulfillment}%`, height: '100%', background: fulfillment >= 80 ? '#16a34a' : '#1761fd' }} />
                                </div>
                              </td>
                              <td>
                                <strong style={{ color: '#0f172a' }}>
                                  ${Number(s.total_payout).toFixed(2)}
                                </strong>
                              </td>
                              <td>
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  background: s.project_status === 'Live' ? 'rgba(16, 185, 129, 0.12)' : s.project_status === 'Pause' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                                  color: s.project_status === 'Live' ? '#10b981' : s.project_status === 'Pause' ? '#d97706' : '#64748b'
                                }}>
                                  {s.project_status}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(s.entry_link, s.assignment_id)}
                                    style={{
                                      background: copiedLinkId === s.assignment_id ? '#dcfce7' : '#f1f5f9',
                                      color: copiedLinkId === s.assignment_id ? '#16a34a' : '#334155',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '4px',
                                      padding: '3px 7px',
                                      fontSize: '10.5px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="Copy inbound vendor link"
                                  >
                                    {copiedLinkId === s.assignment_id ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                                    <span>{copiedLinkId === s.assignment_id ? 'Copied!' : 'Copy Link'}</span>
                                  </button>
                                  {s.entry_link && (
                                    <a
                                      href={s.entry_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: '#8997bd', display: 'flex', alignItems: 'center' }}
                                      title="Open link in new tab"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <div>
                Showing <strong>{vendorDetailData?.studies?.length || 0}</strong> assigned study records for <strong>{selectedVendorDetail.vendor_name}</strong>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setSelectedVendorDetail(null); setVendorDetailData(null); }}
                style={{ padding: '5px 14px', fontSize: '12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
    )}

      {/* ------------------------------------------------------------- */}
      {/* Project Details Drilldown Modal: Assigned Vendors Breakdown */}
      {/* ------------------------------------------------------------- */}
      {selectedProjectDetail && (
        <ModalPortal isOpen={!!selectedProjectDetail} onClose={() => { setSelectedProjectDetail(null); setProjectDetailData(null); }}>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedProjectDetail(null);
                setProjectDetailData(null);
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              padding: '16px',
              overflowY: 'auto'
            }}
          >
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '1100px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(3, 216, 127, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#03a36a'
                }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      {selectedProjectDetail.project_name}
                    </h3>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(23, 97, 253, 0.1)',
                      color: '#1761fd'
                    }}>
                      PID: {selectedProjectDetail.project_id}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981'
                    }}>
                      {selectedProjectDetail.status || 'Live'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Client: <strong>{selectedProjectDetail.client_name}</strong> &bull; Agreed CPI: <strong>${Number(selectedProjectDetail.cpi).toFixed(2)}</strong> &bull; Target Quota: <strong>{selectedProjectDetail.target_completes}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setSelectedProjectDetail(null); setProjectDetailData(null); }}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {/* Dynamic Quota Pacing Meter Card */}
              {(() => {
                const target = Number(selectedProjectDetail.target_completes || selectedProjectDetail.max_limit || 0);
                const vendors = projectDetailData?.vendors || [];
                const totalCompletes = vendors.reduce((acc, v) => acc + (Number(v.complete_count) || 0), 0) || Number(selectedProjectDetail.success_count || selectedProjectDetail.completes || 0);
                const totalClicks = vendors.reduce((acc, v) => acc + (Number(v.clicks_count) || 0), 0) || Number(selectedProjectDetail.clicks_count || 0);
                const pacingPercent = target > 0 ? Math.min(100, Math.round((totalCompletes / target) * 100)) : (totalCompletes > 0 ? 100 : 0);
                const remainingGap = target > 0 ? Math.max(0, target - totalCompletes) : 0;
                const totalPayout = vendors.reduce((acc, v) => acc + (Number(v.total_payout) || ((Number(v.cpi) || 0) * (Number(v.complete_count) || 0))), 0);
                const clientRev = totalCompletes * (Number(selectedProjectDetail.cpi) || 0);
                const margin = clientRev - totalPayout;

                return (
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    marginBottom: '20px'
                  }}>
                    {/* Top Stats Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '12px',
                      marginBottom: '14px'
                    }}>
                      <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Target Quota</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                          {target > 0 ? target.toLocaleString() : 'Open / Uncapped'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8997BD', marginTop: '2px' }}>Client Goal</div>
                      </div>

                      <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Delivered Completes</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                          {totalCompletes.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px', fontWeight: 600 }}>
                          {pacingPercent}% Fulfilled
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Remaining Gap</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: remainingGap === 0 ? '#10B981' : '#EA580C', marginTop: '2px' }}>
                          {target > 0 ? remainingGap.toLocaleString() : '0'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          {remainingGap === 0 ? 'Goal Completed' : 'Completes Needed'}
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Delivery Margin</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: margin >= 0 ? '#10B981' : '#DC2626', marginTop: '2px' }}>
                          ${margin.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          Rev: ${clientRev.toFixed(2)} &bull; Cost: ${totalPayout.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Visual Quota Pacing Meter Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                          <Target size={14} color="#1761FD" />
                          <span>Dynamic Quota Pacing Meter</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: pacingPercent >= 100 ? '#10B981' : '#1761FD' }}>
                          {pacingPercent}% Full
                        </div>
                      </div>

                      <div style={{
                        width: '100%',
                        height: '10px',
                        background: '#E2E8F0',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: `${pacingPercent}%`,
                          height: '100%',
                          background: pacingPercent >= 100 
                            ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' 
                            : pacingPercent >= 70 
                              ? 'linear-gradient(90deg, #1761FD 0%, #0284C7 100%)' 
                              : 'linear-gradient(90deg, #F59E0B 0%, #EA580C 100%)',
                          borderRadius: '5px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                        <span>Inbound Clicks: <strong>{totalClicks.toLocaleString()}</strong></span>
                        <span>
                          Status: {pacingPercent >= 100 ? (
                            <strong style={{ color: '#10B981' }}>🎯 Target Completed</strong>
                          ) : pacingPercent >= 75 ? (
                            <strong style={{ color: '#1761FD' }}>🚀 Rapid Pacing</strong>
                          ) : (
                            <strong style={{ color: '#D97706' }}>⚡ Active Pacing</strong>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Sub-header & Filter Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    Assigned Supply Partners Breakdown
                  </h4>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Partners allocated to this study and their individual delivery metrics
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Search vendors..."
                    value={projectVendorSearch}
                    onChange={e => setProjectVendorSearch(e.target.value)}
                    style={{ paddingLeft: '38px', width: '220px', height: '32px', fontSize: '11.5px' }}
                  />
                </div>
              </div>

              {/* Table of Assigned Vendors */}
              {projectDetailLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', display: 'block', color: '#1761fd' }} />
                  <div>Loading assigned vendors from database...</div>
                </div>
              ) : (
                <div className="table-wrapper" style={{ margin: 0, border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                  <table className="custom-table" style={{ width: '100%', fontSize: '12px' }}>
                    <thead className="thead-light">
                      <tr>
                        <th>Supply Vendor</th>
                        <th>Vendor CPI</th>
                        <th>Allocated Quota</th>
                        <th>Inbound Clicks</th>
                        <th>Delivered Completes</th>
                        <th>Terminates</th>
                        <th>CR (%)</th>
                        <th>Fulfillment</th>
                        <th>Total Payout</th>
                        <th>Entry Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const vendors = projectDetailData?.vendors || [];
                        const q = projectVendorSearch.toLowerCase().trim();
                        const filtered = q
                          ? vendors.filter(v =>
                              String(v.vendor_name || '').toLowerCase().includes(q) ||
                              String(v.vendor_id || '').toLowerCase().includes(q)
                            )
                          : vendors;

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#8997bd' }}>
                                No vendors currently assigned to this study.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((v, vIdx) => {
                          const quota = v.quota_limit > 0 ? v.quota_limit : 0;
                          const completes = v.complete_count || 0;
                          const fulfillment = quota > 0 ? Math.min(100, Math.round((completes / quota) * 100)) : (v.clicks_count > 0 ? Math.round((completes / v.clicks_count) * 100) : 0);

                          return (
                            <tr key={v.assignment_id || vIdx}>
                              <td>
                                <div style={{ fontWeight: 700, color: '#1e293b' }}>
                                  {v.vendor_name}
                                </div>
                                <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', marginTop: '2px', display: 'inline-block' }}>
                                  {v.vendor_id}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: '#1761fd' }}>${Number(v.cpi).toFixed(2)}</strong>
                              </td>
                              <td>
                                <span style={{ color: '#334155' }}>
                                  {quota > 0 ? quota.toLocaleString() : <span style={{ color: '#8997bd' }}>Open</span>}
                                </span>
                              </td>
                              <td>{v.clicks_count.toLocaleString()}</td>
                              <td>
                                <strong style={{ color: completes > 0 ? '#16a34a' : '#64748b', fontSize: '12.5px' }}>
                                  {completes.toLocaleString()}
                                </strong>
                              </td>
                              <td><span style={{ color: '#d97706' }}>{v.terminates_count.toLocaleString()}</span></td>
                              <td><strong style={{ color: '#1761fd' }}>{v.conversion_rate}%</strong></td>
                              <td style={{ minWidth: '100px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                                  <span>{completes} {quota > 0 ? `/ ${quota}` : ''}</span>
                                  <span style={{ fontWeight: 700, color: '#1761fd' }}>{fulfillment}%</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${fulfillment}%`, height: '100%', background: fulfillment >= 80 ? '#16a34a' : '#1761fd' }} />
                                </div>
                              </td>
                              <td>
                                <strong style={{ color: '#0f172a' }}>
                                  ${Number(v.total_payout).toFixed(2)}
                                </strong>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleCopyProjectVendorLink(v.entry_link, v.assignment_id)}
                                  style={{
                                    background: copiedProjectLinkId === v.assignment_id ? '#dcfce7' : '#f1f5f9',
                                    color: copiedProjectLinkId === v.assignment_id ? '#16a34a' : '#334155',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '3px 7px',
                                    fontSize: '10.5px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Copy vendor inbound survey link"
                                >
                                  {copiedProjectLinkId === v.assignment_id ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                                  <span>{copiedProjectLinkId === v.assignment_id ? 'Copied!' : 'Copy Link'}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <div>
                Total <strong>{projectDetailData?.vendors?.length || 0}</strong> supply partners assigned to <strong>{selectedProjectDetail.project_name}</strong>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setSelectedProjectDetail(null); setProjectDetailData(null); }}
                style={{ padding: '5px 14px', fontSize: '12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
    )}
    </div>
  );
}
