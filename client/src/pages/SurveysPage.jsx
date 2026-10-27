import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, PieChart, UserCheck, Share2, AlertCircle, ChevronLeft, ChevronRight, 
  DollarSign, Clock, ArrowUpDown, Filter, Monitor, Smartphone, Tablet, 
  ShieldCheck, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Layers, CheckCircle2,
  Download, Copy, Link as LinkIcon, Check, Globe, Sparkles, X
} from 'lucide-react';
import { normalizeSurveys } from '../utils/normalize';
import DemandProjectModal from '../components/DemandProjectModal';
import DuplicateProjectModal from '../components/DuplicateProjectModal';
import BulkAssignModal from '../components/BulkAssignModal';
import { exportSurveysInventoryToExcel } from '../utils/excelExport';

export default function SurveysPage({ 
  surveys = [], 
  globalSearch = '', 
  loading, 
  onRefresh, 
  onAddSurvey, 
  onOpenQuotas, 
  onOpenQuals, 
  onOpenAssign,
  currentUser,
  showToast
}) {
  const isVendor = currentUser?.role_name === "Vendor" || currentUser?.role === "Vendor";
  const vendorId = currentUser?.vendor_id || currentUser?.username || "VND-DYN-01";
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [duplicateModalProject, setDuplicateModalProject] = useState(null);
  const [selectedSurveyIds, setSelectedSurveyIds] = useState(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (s) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://api.vmhgroupsmr.com';
    const link = isVendor
      ? `https://api.vmhgroupsmr.com/vendor/auth/${vendorId}/project/${s.survey_id}?uid=[RESPONDENT_ID]`
      : (s.entry_live_url || `${origin}/redirect?pid=${s.survey_id}&uid=[RESPONDENT_ID]`);
    try {
      navigator.clipboard.writeText(link);
      setCopiedId(s.survey_id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      prompt("Copy survey entry link:", link);
    }
  };

  const [linkModalSurvey, setLinkModalSurvey] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Reliable Modal Triggers without fragile history popstate conflicts
  const openDemandModal = () => setDemandModalOpen(true);
  const openDuplicateModal = (project) => setDuplicateModalProject(project);
  const openBulkModal = () => setShowBulkModal(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedCpiRange, setSelectedCpiRange] = useState('ALL');
  const [sortBy, setSortBy] = useState('cpi-desc');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [pageSize, setPageSize] = useState(15);

  const effectiveSearch = (searchTerm || globalSearch || '').toLowerCase().trim();

  const normalized = useMemo(() => normalizeSurveys(surveys), [surveys]);

  const countries = useMemo(() => {
    return ['ALL', ...new Set(normalized.map(s => s.country).filter(Boolean))];
  }, [normalized]);

  const channels = useMemo(() => {
    return ['ALL', 'Market Xcel', 'Zamplia'];
  }, []);

  const filtered = useMemo(() => {
    let list = normalized.filter((s) => {
      // 1. Country Filter
      if (selectedCountry !== 'ALL') {
        const sCountry = (s.country || '').trim().toUpperCase();
        const selCountry = selectedCountry.trim().toUpperCase();
        if (sCountry !== selCountry) return false;
      }

      // 2. Channel Filter
      if (selectedChannel !== 'ALL') {
        const clientStr = (s.client || '').toLowerCase();
        const idStr = String(s.survey_id || '').toLowerCase();
        if (selectedChannel === 'Market Xcel') {
          const isMx = clientStr.includes('market xcel') || idStr.startsWith('mx');
          if (!isMx) return false;
        } else if (selectedChannel === 'Zamplia') {
          const isZamp = clientStr.includes('zamplia') || (!idStr.startsWith('mx') && !clientStr.includes('market xcel'));
          if (!isZamp) return false;
        }
      }

      // 3. CPI Range Filter
      if (selectedCpiRange !== 'ALL') {
        const cpiVal = Number(s.cpi || s.CPI || 0);
        if (selectedCpiRange === 'under-1' && cpiVal >= 1.00) return false;
        if (selectedCpiRange === '1-to-2' && (cpiVal < 1.00 || cpiVal > 2.00)) return false;
        if (selectedCpiRange === '2-to-3' && (cpiVal < 2.00 || cpiVal > 3.00)) return false;
        if (selectedCpiRange === '3-to-5' && (cpiVal < 3.00 || cpiVal > 5.00)) return false;
        if (selectedCpiRange === '5-plus' && cpiVal < 5.00) return false;
      }

      // 4. Search Filter
      if (!effectiveSearch) return true;
      const term = effectiveSearch;
      return (
        (s.survey_name || '').toLowerCase().includes(term) ||
        String(s.survey_id || '').toLowerCase().includes(term) ||
        (s.category || '').toLowerCase().includes(term) ||
        (s.country || '').toLowerCase().includes(term) ||
        (s.client || '').toLowerCase().includes(term) ||
        (s.studyType || '').toLowerCase().includes(term)
      );
    });

    list.sort((a, b) => {
      if (sortBy === 'cpi-desc') return (b.cpi || 0) - (a.cpi || 0);
      if (sortBy === 'cpi-asc') return (a.cpi || 0) - (b.cpi || 0);
      if (sortBy === 'loi-asc') return (a.loi || 0) - (b.loi || 0);
      if (sortBy === 'ir-desc') return (b.ir || 0) - (a.ir || 0);
      return 0;
    });

    return list;
  }, [normalized, selectedCountry, selectedChannel, selectedCpiRange, effectiveSearch, sortBy]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedSurveys = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pageSurveyIds = useMemo(() => paginatedSurveys.map(s => s.survey_id), [paginatedSurveys]);
  const isAllPageSelected = pageSurveyIds.length > 0 && pageSurveyIds.every(id => selectedSurveyIds.has(id));
  const isSomePageSelected = pageSurveyIds.some(id => selectedSurveyIds.has(id)) && !isAllPageSelected;

  const handleToggleSelectAllPage = () => {
    setSelectedSurveyIds(prev => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        pageSurveyIds.forEach(id => next.delete(id));
      } else {
        pageSurveyIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleToggleSelect = (id) => {
    setSelectedSurveyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedSurveyIds(new Set());
  };

  const selectedSurveysList = useMemo(() => {
    return normalized.filter(s => selectedSurveyIds.has(s.survey_id));
  }, [normalized, selectedSurveyIds]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getDeviceBadges = (deviceStr) => {
    const d = (deviceStr || 'Desktop,Mobile,Tablet').toLowerCase();
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 6px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px'
      }}>
        {d.includes('desktop') && <span title="Desktop Allowed" style={{ color: '#0F172A', display: 'flex' }}><Monitor size={13} /></span>}
        {d.includes('mobile') && <span title="Mobile Allowed" style={{ color: '#059669', display: 'flex' }}><Smartphone size={13} /></span>}
        {d.includes('tablet') && <span title="Tablet Allowed" style={{ color: '#7c3aed', display: 'flex' }}><Tablet size={13} /></span>}
      </div>
    );
  };

  const hasActiveFilters = selectedChannel !== 'ALL' || selectedCountry !== 'ALL' || selectedCpiRange !== 'ALL' || searchTerm.length > 0;

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* 1. Executive Linear/Stripe Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
            <span>VMH Platform</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Surveys Inventory</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.025em',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              {isVendor ? "My Allocated Surveys" : "Surveys"}
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '999px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#059669'
            }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
              {filtered.length} Live Studies
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isVendor ? "Live surveys allocated to your panel with agreed CPI and real-time quota tracking" : "Real-time allocated survey traffic synced across Zamplia and Market Xcel supply channels"}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {selectedSurveyIds.size > 0 && (
            <button
              onClick={openBulkModal}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                fontSize: '12.5px',
                fontWeight: 700,
                padding: '8px 14px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.35)'
              }}
            >
              <Share2 size={13} />
              <span>Bulk Assign ({selectedSurveyIds.size})</span>
            </button>
          )}

          <button
            onClick={() => exportSurveysInventoryToExcel(filtered)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease'
            }}
            title="Export filtered surveys inventory to Excel (.xlsx)"
          >
            <Download size={14} color="#059669" />
            <span>Export (.xlsx)</span>
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.15s ease'
              }}
              title="Sync live inventory from Zamplia"
            >
              <RefreshCw size={13} color="#0F172A" className={loading ? 'sync-spin' : ''} />
              <span>Sync Surveys</span>
            </button>
          )}

          <button
            onClick={openDemandModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
              border: '1px solid #0F172A',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>+ Add Survey</span>
          </button>
        </div>
      </div>

      {/* 2. Refined Filter Bar (Mobbin Segmented Control, Zero Emojis) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Demand Channel Switcher Pills */}
        <div style={{
          display: 'inline-flex',
          background: '#f1f5f9',
          padding: '3px',
          borderRadius: '9px',
          border: '1px solid #e2e8f0',
          gap: '2px'
        }}>
          {channels.map(c => {
            const isActive = selectedChannel === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => { setSelectedChannel(c); setPage(1); }}
                style={{
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0F172A' : '#64748b',
                  boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {c === 'ALL' ? 'All Clients' : c}
              </button>
            );
          })}
        </div>

        {/* Search, Country & Filter Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              value={searchTerm || globalSearch}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="search-box-input"
              placeholder="Search title, PID, category..."
              style={{
                paddingLeft: '38px',
                paddingRight: '12px',
                width: '240px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                color: '#0f172a',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Country Filter */}
          <select 
            value={selectedCountry}
            onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); }}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 500,
              color: '#334155',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            {countries.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Markets' : `Market: ${c}`}</option>
            ))}
          </select>

          {/* CPI Range Filter */}
          <select
            value={selectedCpiRange}
            onChange={(e) => { setSelectedCpiRange(e.target.value); setPage(1); }}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              color: '#059669',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Rates (CPI)</option>
            <option value="under-1">Below $1.00</option>
            <option value="1-to-2">$1.00 - $2.00</option>
            <option value="2-to-3">$2.00 - $3.00</option>
            <option value="3-to-5">$3.00 - $5.00</option>
            <option value="5-plus">$5.00+ High Rate</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 500,
              color: '#334155',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="cpi-desc">Sort: Highest Rate ($)</option>
            <option value="cpi-asc">Sort: Lowest Rate ($)</option>
            <option value="loi-asc">Sort: Shortest Length (LOI)</option>
            <option value="ir-desc">Sort: Highest Match (IR)</option>
          </select>

          {/* Reset Filters Quick Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSelectedChannel('ALL');
                setSelectedCountry('ALL');
                setSelectedCpiRange('ALL');
                setSearchTerm('');
                setPage(1);
              }}
              style={{
                height: '36px',
                padding: '0 10px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Reset all filters"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* 3. Flush Senior Staff Table Card */}
      <div className="table-flush-card">
        {/* Table Card Sub-Header */}
        <div className="table-flush-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Active Surveys Directory</span>
            <span style={{
              background: '#f1f5f9',
              color: '#475569',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {filtered.length} total
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            <span>Page {page} of {totalPages}</span>
            <div style={{ display: 'inline-flex', gap: '4px' }}>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.5 : 1
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Clean Data Table */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ width: '36px', textAlign: 'center', padding: '12px 6px' }}>
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    ref={el => { if (el) el.indeterminate = isSomePageSelected; }}
                    onChange={handleToggleSelectAllPage}
                    title="Select all surveys on this page"
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#0F172A' }}
                  />
                </th>
                <th style={{ width: '40px', textAlign: 'center', padding: '12px 6px' }}>#</th>
                <th style={{ minWidth: '220px' }}>Survey Name & ID</th>
                <th style={{ width: '110px' }}>Client</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Market</th>
                <th style={{ width: '85px', textAlign: 'center' }}>Devices</th>
                <th style={{ width: '95px' }}>Rate (CPI)</th>
                <th style={{ width: '100px' }}>Length (LOI)</th>
                <th style={{ minWidth: '150px' }}>Quota Progress</th>
                <th style={{ width: '75px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '170px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
                    Synchronizing live inventory from Zamplia & Market Xcel...
                  </td>
                </tr>
              ) : paginatedSurveys.length > 0 ? (
                paginatedSurveys.map((s, idx) => {
                  const globalIdx = (page - 1) * pageSize + idx + 1;
                  const isExpanded = expandedId === s.survey_id;
                  const isMarketXcel = (s.client || '').toLowerCase().includes('market xcel') || String(s.survey_id).startsWith('MX');
                  const clientName = isMarketXcel ? 'Market Xcel' : 'Zamplia';
                  const quotaTarget = Number(s.complete_needed || s.target_completes || s.max_limit || 200);
                  const quotaFilled = Number(s.completes !== undefined ? s.completes : (s.total_complete || 0));
                  const fillPercent = quotaTarget > 0 ? Math.min(100, Math.round((quotaFilled / quotaTarget) * 100)) : 0;

                  return (
                    <React.Fragment key={s.survey_id || idx}>
                      <tr style={{
                        background: isExpanded ? '#f8fafc' : selectedSurveyIds.has(s.survey_id) ? 'rgba(15, 23, 42, 0.04)' : '#ffffff',
                        borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9'
                      }}>
                        {/* Checkbox */}
                        <td style={{ textAlign: 'center', padding: '12px 6px' }}>
                          <input
                            type="checkbox"
                            checked={selectedSurveyIds.has(s.survey_id)}
                            onChange={() => handleToggleSelect(s.survey_id)}
                            title={`Select survey ${s.survey_id}`}
                            style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#0F172A' }}
                          />
                        </td>

                        {/* Muted Row Index (NO blue box!) */}
                        <td style={{ textAlign: 'center', padding: '12px 6px' }}>
                          <span className="row-index-subtle">{globalIdx}</span>
                        </td>

                        {/* Survey Name & PID */}
                        <td>
                          <div
                            onClick={() => toggleExpand(s.survey_id)}
                            style={{
                              fontWeight: 700,
                              color: '#0f172a',
                              fontSize: '13px',
                              cursor: 'pointer',
                              lineHeight: 1.35,
                              transition: 'color 0.15s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#0F172A'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#0f172a'; }}
                          >
                            {s.survey_name}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '10.5px',
                              color: '#475569',
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              background: '#f1f5f9',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              PID: {s.survey_id}
                            </span>
                            {s.category && (
                              <span style={{
                                fontSize: '10.5px',
                                color: '#64748b',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                {s.category}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Client / Demand Source */}
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: clientName === 'Market Xcel' ? '#fff7ed' : '#F8FAFC',
                            color: clientName === 'Market Xcel' ? '#c2410c' : '#0F172A',
                            border: `1px solid ${clientName === 'Market Xcel' ? '#ffedd5' : '#E2E8F0'}`,
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}>
                            {clientName}
                          </span>
                        </td>

                        {/* Country Market */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 7px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            display: 'inline-block'
                          }}>
                            {s.country}
                          </span>
                        </td>

                        {/* Devices Allowed */}
                        <td style={{ textAlign: 'center' }}>
                          {getDeviceBadges(s.device_type)}
                        </td>

                        {/* Payout Rate (CPI) */}
                        <td>
                          <div style={{ fontWeight: 800, color: '#059669', fontSize: '13.5px', fontVariantNumeric: 'tabular-nums' }}>
                            ${Number(s.cpi).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>per complete</div>
                        </td>

                        {/* Length & Match (LOI & IR) */}
                        <td>
                          <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                            <Clock size={11} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle', color: '#64748b' }} />
                            {s.loi}m
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            IR: <strong>{s.ir}%</strong>
                          </div>
                        </td>

                        {/* Quota Progress & Real Pacing */}
                        <td style={{ minWidth: '150px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{quotaFilled} / {quotaTarget} <span style={{ color: '#64748b', fontWeight: 500 }}>({s.routed_leads || 0} clk)</span></span>
                            <span style={{ fontWeight: 700, color: fillPercent >= 100 ? '#059669' : (fillPercent > 50 ? '#0F172A' : '#64748b') }}>{fillPercent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, fillPercent)}%`,
                              height: '100%',
                              background: fillPercent >= 100 ? '#059669' : (fillPercent > 75 ? '#0F172A' : '#0F172A'),
                              borderRadius: '999px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />
                            {s.status || 'Live'}
                          </span>
                        </td>

                        {/* Action Suite (Uncluttered, No Clipped Clone Button) */}
                        <td style={{ textAlign: 'center' }}>
                          <div className="action-suite">
                            {!isVendor && (
                              <button
                                type="button"
                                className="action-suite-btn primary"
                                onClick={() => onOpenAssign(s)}
                                title="Assign survey to vendor"
                              >
                                <Share2 size={12} />
                                <span>Assign</span>
                              </button>
                            )}

                            {!isVendor && (
                              <button
                                type="button"
                                className="action-suite-btn"
                                onClick={() => openDuplicateModal(s)}
                                title="Clone Study & Modify Parameters"
                                style={{ background: '#f1f5f9', color: '#0f172a' }}
                              >
                                <Copy size={12} color="#0f172a" />
                                <span>Clone</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="action-suite-btn"
                              onClick={() => setLinkModalSurvey(s)}
                              title="View & Test Survey Entry Link"
                              style={{ background: '#F1F5F9', color: '#0F172A' }}
                            >
                              <LinkIcon size={12} color="#0F172A" />
                              <span>Link</span>
                            </button>

                            <button
                              type="button"
                              className="action-suite-btn icon-only"
                              onClick={() => onOpenQuotas(s.survey_id)}
                              title="View Quotas"
                            >
                              <PieChart size={12} color="#64748b" />
                            </button>

                            <button
                              type="button"
                              className="action-suite-btn icon-only"
                              onClick={() => onOpenQuals(s.survey_id)}
                              title="View Criteria & Qualifications"
                            >
                              <UserCheck size={12} color="#64748b" />
                            </button>

                            <button
                              type="button"
                              className="action-suite-btn icon-only"
                              onClick={() => toggleExpand(s.survey_id)}
                              title="Toggle Survey Details"
                            >
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Specifications Drawer */}
                      {isExpanded && (
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <td colSpan="11" style={{ padding: '16px 20px' }}>
                            <div style={{
                              background: '#ffffff',
                              borderRadius: '10px',
                              padding: '16px 20px',
                              border: '1px solid #e2e8f0',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                              gap: '16px',
                              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                            }}>
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                                  Study Description & Audience
                                </div>
                                <p style={{ margin: 0, fontSize: '13px', color: '#0f172a', lineHeight: 1.5 }}>
                                  {s.survey_description || 'General population survey with demographic quota constraints and quality speeder filters.'}
                                </p>
                              </div>

                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                                  Study Specifications
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12.5px', color: '#334155', lineHeight: 1.6 }}>
                                  <li>Target Market: <strong>{s.country || 'US'}</strong></li>
                                  <li>Length (LOI): <strong>{s.length_of_interview || s.loi || 13} mins</strong></li>
                                  <li>Incidence Rate (IR): <strong>{s.ir ? `${s.ir}%` : '74%'}</strong></li>
                                </ul>
                              </div>

                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                                  Quota & Delivery Status
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12.5px', color: '#334155', lineHeight: 1.6 }}>
                                  <li>Quota Allocation: <strong>{s.completes_needed || s.quota_total || 850} Completes</strong></li>
                                  <li>Network Status: <strong style={{ color: '#16a34a' }}>Active & Routed</strong></li>
                                  <li>Platform: <strong>VMH Research Network</strong></li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5, color: '#ea580c' }} />
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', fontSize: '14px' }}>
                      No allocated surveys match your filter criteria.
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                      Try clearing your search term, changing country, or switching demand channels.
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedChannel('ALL');
                        setSelectedCountry('ALL');
                        setSelectedCpiRange('ALL');
                        setSearchTerm('');
                        setPage(1);
                      }}
                      style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
                    >
                      Reset All Filters ({normalized.length} Surveys Available)
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Showing <strong>{filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> live studies
            </span>

            {/* Page Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
              <span style={{ fontWeight: 600 }}>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  height: '34px',
                  minWidth: '135px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              style={{
                height: '34px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#ffffff',
                color: page === 1 ? '#94a3b8' : '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.6 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
            >
              First
            </button>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                height: '34px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#ffffff',
                color: page === 1 ? '#94a3b8' : '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.6 : 1,
                boxSizing: 'border-box'
              }}
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0f172a',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              height: '34px',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap'
            }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                height: '34px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#ffffff',
                color: page >= totalPages ? '#94a3b8' : '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.6 : 1,
                boxSizing: 'border-box'
              }}
            >
              Next <ChevronRight size={13} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              style={{
                height: '34px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#ffffff',
                color: page >= totalPages ? '#94a3b8' : '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.6 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Demand Study Creator Modal */}
      <DemandProjectModal
        isOpen={demandModalOpen}
        onClose={() => setDemandModalOpen(false)}
        onSuccess={(created) => {
          if (created && onAddSurvey) {
            const countryMap = { 229: 'United States', 38: 'Canada', 228: 'United Kingdom', 80: 'Germany', 99: 'India' };
            const langMap = { 5: 'en-US', 6: 'en-GB', 9: 'de-DE', 12: 'fr-FR', 18: 'hi-IN' };
            const newStudy = {
              surveyId: created.surveyId || created.ProjectId || Math.floor(100000 + Math.random() * 900000),
              name: created.name || created.ProjectName || 'New Research Study',
              cpi: Number(created.cpi ?? created.CPI ?? 1.00),
              loi: Number(created.loi ?? created.LOI ?? 15),
              ir: Number(created.ir ?? created.IR ?? 40),
              client: created.client || created.Client || 'Market Xcel',
              clientCode: created.clientCode || (created.client === 'Market Xcel' ? 'MX_DEMAND' : 'CUSTOM_CLIENT'),
              status: 'Live',
              totalRequired: Number(created.totalRequired || created.TotalCompleteRequired || 100),
              completesNeeded: Number(created.completesNeeded || created.TotalCompleteRequired || 100),
              device: created.device || created.devices || 'Desktop,Mobile,Tablet',
              languageCode: created.languageCode || langMap[created.LanguageId] || 'en-US',
              country: created.country || countryMap[created.CountryId] || 'United States',
              category: created.category || (created.StudyType ? `${created.StudyType} Research` : 'Consumer Research'),
              studyType: created.studyType || created.StudyType || 'Consumer',
              liveSurveyUrl: created.liveSurveyUrl || created.LiveSurveyUrl || ''
            };
            onAddSurvey(newStudy);
          }
          if (showToast) {
            showToast(`✓ Study added to marketplace!`);
          }
          if (onRefresh) onRefresh();
        }}
      />

      {/* Floating Bulk Action Bar */}
      {selectedSurveyIds.size > 0 && (
        <div className="floating-pill-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <span style={{
              background: '#0F172A',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 800
            }}>
              {selectedSurveyIds.size}
            </span>
            <span style={{ color: '#e2e8f0' }}>surveys selected</span>
          </div>

          <div style={{ height: '18px', width: '1px', background: 'rgba(255,255,255,0.18)' }} />

          <button
            onClick={openBulkModal}
            style={{
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '7px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.4)'
            }}
          >
            <Share2 size={13} /> Bulk Assign to Vendor
          </button>

          {selectedSurveyIds.size < filtered.length && (
            <button
              onClick={() => {
                const all = new Set(filtered.map(s => s.survey_id));
                setSelectedSurveyIds(all);
              }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Select All {filtered.length}
            </button>
          )}

          <button
            onClick={handleClearSelection}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: 'none',
              borderRadius: '999px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* 1-Click Project Cloner / Duplicator Modal */}
      <DuplicateProjectModal
        isOpen={!!duplicateModalProject}
        project={duplicateModalProject}
        onClose={() => setDuplicateModalProject(null)}
        onSuccess={(cloned) => {
          setDuplicateModalProject(null);
          if (cloned && onAddSurvey) {
            const sid = cloned.project_id || cloned.id;
            onAddSurvey({
              surveyId: sid,
              survey_id: sid,
              project_id: sid,
              id: cloned.id,
              name: cloned.name || cloned.project_name,
              survey_name: cloned.name || cloned.project_name,
              cpi: Number(cloned.cpi || cloned.cost_per_complete),
              cost_per_complete: Number(cloned.cpi || cloned.cost_per_complete),
              loi: Number(cloned.loi),
              ir: Number(cloned.ir),
              client: "VMH GROUP'S",
              clientCode: 'VMH_DEMAND',
              status: cloned.status || 'Live',
              totalRequired: Number(cloned.target_completes || cloned.max_limit || 500),
              completesNeeded: Number(cloned.target_completes || cloned.max_limit || 500),
              country: cloned.country || 'United States',
              category: 'Market Research',
              studyType: 'Consumer',
              live_url: cloned.live_url,
              is_cloned: true
            });
          }
          if (showToast) {
            showToast(`✓ Study cloned successfully: ${cloned.name || cloned.project_id}!`);
          }
          if (onRefresh) onRefresh();
        }}
      />

      {/* Enterprise Bulk Assignment Modal */}
      <BulkAssignModal
        isOpen={showBulkModal}
        selectedSurveys={selectedSurveysList}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => {
          setSelectedSurveyIds(new Set());
          setShowBulkModal(false);
          if (onRefresh) onRefresh();
        }}
      />
      {/* Dedicated Survey Link & Test Router Modal */}
      {linkModalSurvey && (
        <ModalPortal isOpen={!!linkModalSurvey} onClose={() => { setLinkModalSurvey(null); setLinkCopied(false); }}>
          <div className="modal-overlay" onClick={() => { setLinkModalSurvey(null); setLinkCopied(false); }}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '640px', width: '92%', background: '#FFFFFF', borderRadius: '14px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '8px', borderRadius: '8px' }}>
                    <LinkIcon size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                      Survey Router & Entry Link
                    </h3>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B' }}>
                      PID: #{linkModalSurvey.survey_id} — {linkModalSurvey.survey_name || linkModalSurvey.name}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setLinkModalSurvey(null); setLinkCopied(false); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Router Link Box */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Live Router Inbound Link (Send to Vendors / Partners):
                  </label>
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#0F172A',
                    wordBreak: 'break-all',
                    lineHeight: 1.5
                  }}>
                    {`https://api.vmhgroupsmr.com/router?pid=${linkModalSurvey.survey_id}&vid=VND-DYN-01&uid=[RESPONDENT_ID]`}
                  </div>
                </div>

                {/* Direct Vendor Auth Link */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Alternative Secure Vendor Entry Link:
                  </label>
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#0F172A',
                    wordBreak: 'break-all',
                    lineHeight: 1.5
                  }}>
                    {`https://api.vmhgroupsmr.com/vendor/auth/VND-DYN-01/project/${linkModalSurvey.survey_id}?uid=[RESPONDENT_ID]`}
                  </div>
                </div>

                {/* Study Parameters Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#F1F5F9', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Buyer CPI</span>
                    <strong style={{ fontSize: '14px', color: '#16A34A' }}>${Number(linkModalSurvey.cpi || linkModalSurvey.cost_per_complete || 1.20).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Length (LOI)</span>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>{linkModalSurvey.loi || 13}m</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Incidence (IR)</span>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>{linkModalSurvey.ir || 74}%</strong>
                  </div>
                </div>

                {/* Actions: Copy & Test */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://api.vmhgroupsmr.com';
                      const sid = linkModalSurvey.survey_id || linkModalSurvey.project_id || linkModalSurvey.id;
                      const testUrl = `${origin}/router?pid=${encodeURIComponent(sid)}&vid=VND-DYN-01&uid=TEST_${Date.now()}&test=1`;
                      window.open(testUrl, '_blank');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #0F172A',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Test Survey (Open in New Tab)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const linkToCopy = `https://api.vmhgroupsmr.com/router?pid=${linkModalSurvey.survey_id}&vid=VND-DYN-01&uid=[RESPONDENT_ID]`;
                      navigator.clipboard.writeText(linkToCopy).catch(() => {});
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2500);
                    }}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)'
                    }}
                  >
                    {linkCopied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    <span>{linkCopied ? 'Link Copied!' : 'Copy Router Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
