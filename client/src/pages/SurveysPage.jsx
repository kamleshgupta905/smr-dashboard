import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, PieChart, UserCheck, Share2, AlertCircle, ChevronLeft, ChevronRight, 
  DollarSign, Clock, ArrowUpDown, Filter, Monitor, Smartphone, Tablet, 
  ShieldCheck, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Layers, CheckCircle2,
  Download, Copy
} from 'lucide-react';
import { normalizeSurveys } from '../utils/normalize';
import DemandProjectModal from '../components/DemandProjectModal';
import DuplicateProjectModal from '../components/DuplicateProjectModal';
import BulkAssignModal from '../components/BulkAssignModal';
import { exportSurveysInventoryToExcel } from '../utils/excelExport';

export default function SurveysPage({ surveys = [], globalSearch = '', loading, onRefresh, onAddSurvey, onOpenQuotas, onOpenQuals, onOpenAssign }) {
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [duplicateModalProject, setDuplicateModalProject] = useState(null);
  const [selectedSurveyIds, setSelectedSurveyIds] = useState(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Modal openers that push browser history so Back button closes modal
  const openDemandModal = () => {
    window.history.pushState({ modal: 'demand' }, '');
    setDemandModalOpen(true);
  };
  const openDuplicateModal = (project) => {
    window.history.pushState({ modal: 'duplicate' }, '');
    setDuplicateModalProject(project);
  };
  const openBulkModal = () => {
    window.history.pushState({ modal: 'bulk' }, '');
    setShowBulkModal(true);
  };

  // Browser Back Button Interceptor for Modals
  useEffect(() => {
    const handlePopState = () => {
      if (demandModalOpen) setDemandModalOpen(false);
      if (duplicateModalProject) setDuplicateModalProject(null);
      if (showBulkModal) setShowBulkModal(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [demandModalOpen, duplicateModalProject, showBulkModal]);
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
      // 1. Country Filter (case-insensitive)
      if (selectedCountry !== 'ALL') {
        const sCountry = (s.country || '').trim().toUpperCase();
        const selCountry = selectedCountry.trim().toUpperCase();
        if (sCountry !== selCountry) return false;
      }

      // 2. Channel / Demand Source Filter
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

      // 3. CPI Payout Range Filter
      if (selectedCpiRange !== 'ALL') {
        const cpiVal = Number(s.cpi || s.CPI || 0);
        if (selectedCpiRange === 'under-1' && cpiVal >= 1.00) return false;
        if (selectedCpiRange === '1-to-2' && (cpiVal < 1.00 || cpiVal > 2.00)) return false;
        if (selectedCpiRange === '2-to-3' && (cpiVal < 2.00 || cpiVal > 3.00)) return false;
        if (selectedCpiRange === '3-to-5' && (cpiVal < 3.00 || cpiVal > 5.00)) return false;
        if (selectedCpiRange === '5-plus' && cpiVal < 5.00) return false;
      }

      // 4. Search Filter (Multi-field fuzzy search)
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
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {d.includes('desktop') && <span title="Desktop Allowed" style={{ color: '#0284C7' }}><Monitor size={14} /></span>}
        {d.includes('mobile') && <span title="Mobile Allowed" style={{ color: '#16A34A' }}><Smartphone size={14} /></span>}
        {d.includes('tablet') && <span title="Tablet Allowed" style={{ color: '#9333EA' }}><Tablet size={14} /></span>}
      </div>
    );
  };

  return (
    <div>
      {/* Dastone Authentic Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Platform</span>
            <span className="separator">/</span>
            <span className="current">Surveys</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Surveys
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
              Live Surveys
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          {selectedSurveyIds.size > 0 && (
            <button
              className="btn btn-primary"
              onClick={openBulkModal}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, padding: '7px 14px', background: '#4361EE' }}
            >
              <Share2 size={13} /> Bulk Assign ({selectedSurveyIds.size} Selected)
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={openDemandModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px' }}
          >
            <Layers size={14} /> + Add Survey
          </button>
          <button
            className="btn btn-soft-success"
            onClick={() => exportSurveysInventoryToExcel(filtered)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px' }}
            title="Export filtered surveys inventory to Excel (.xlsx)"
          >
            <Download size={13} /> Export Excel (.xlsx)
          </button>
          {onRefresh && (
            <button
              className="btn btn-soft-primary"
              onClick={onRefresh}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px' }}
            >
              <RefreshCw size={13} /> Sync Surveys
            </button>
          )}
        </div>
      </div>

      {/* Filter & Channel Switcher Bar (Dastone Report Card) */}
      <div className="report-card" style={{ padding: '10px 14px', marginBottom: '14px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}>
          {/* Demand Source Tabs (Dastone Timeframe Group Style) */}
          <div className="timeframe-group">
            {channels.map(c => (
              <button
                key={c}
                onClick={() => { setSelectedChannel(c); setPage(1); }}
                className={`timeframe-btn ${selectedChannel === c ? 'active' : ''}`}
                style={{ padding: '5px 14px', fontSize: '12px' }}
              >
                {c === 'ALL' ? 'All Clients' : c}
              </button>
            ))}
          </div>

          {/* Search, Country & Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }}
              />
              <input
                type="text"
                className="input-control"
                style={{ paddingLeft: '32px', width: '220px', height: '34px', fontSize: '12px' }}
                placeholder="Search by name, ID, category..."
                value={searchTerm || globalSearch}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            <select 
              className="input-control"
              value={selectedCountry}
              onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); }}
              style={{ width: 'auto', height: '34px', fontSize: '12px' }}
            >
              {countries.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? '🌍 All Countries' : c}</option>
              ))}
            </select>

            <select
              className="input-control"
              value={selectedCpiRange}
              onChange={(e) => { setSelectedCpiRange(e.target.value); setPage(1); }}
              style={{ width: 'auto', height: '34px', fontSize: '12px', fontWeight: 600, color: '#15803D' }}
            >
              <option value="ALL">💵 All Rates (CPI)</option>
              <option value="under-1">Below $1.00 ($0 - $0.99)</option>
              <option value="1-to-2">$1.00 - $2.00</option>
              <option value="2-to-3">$2.00 - $3.00</option>
              <option value="3-to-5">$3.00 - $5.00</option>
              <option value="5-plus">$5.00+ High Rate</option>
            </select>

            <select
              className="input-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', height: '34px', fontSize: '12px' }}
            >
              <option value="cpi-desc">💰 Highest Rate ($)</option>
              <option value="cpi-asc">Lowest Rate ($)</option>
              <option value="loi-asc">⚡ Shortest Time (LOI)</option>
              <option value="ir-desc">🎯 Highest Match (IR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table (Dastone Report Card) */}
      <div className="report-card card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div className="report-card-header" style={{ padding: '10px 14px' }}>
          <h4 className="report-card-title">
            <Layers size={15} color="#1761fd" /> Active Surveys ({filtered.length})
          </h4>
          <span className="badge-soft-primary" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
        </div>
        <div className="table-wrapper table-container" style={{ margin: 0, border: 'none', borderRadius: 0, width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'block' }}>
          <table className="custom-table compact-table" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead className="thead-light">
              <tr>
                <th className="col-checkbox" style={{ width: '28px', textAlign: 'center', padding: '6px 2px' }}>
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    ref={el => { if (el) el.indeterminate = isSomePageSelected; }}
                    onChange={handleToggleSelectAllPage}
                    title="Select all surveys on this page"
                    style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: '#4361EE' }}
                  />
                </th>
                <th className="col-index" style={{ width: '26px', textAlign: 'center', padding: '6px 2px' }}>#</th>
                <th style={{ minWidth: '130px', padding: '6px 6px' }}>Survey Name & ID</th>
                <th style={{ width: '70px', padding: '6px 4px' }}>Client</th>
                <th style={{ width: '40px', textAlign: 'center', padding: '6px 2px' }}>Country</th>
                <th style={{ width: '48px', textAlign: 'center', padding: '6px 2px' }}>Devices</th>
                <th style={{ width: '58px', padding: '6px 4px' }}>Rate (CPI)</th>
                <th style={{ width: '58px', padding: '6px 4px' }}>Length (LOI)</th>
                <th style={{ width: '82px', padding: '6px 4px' }}>Quota / Completes</th>
                <th style={{ width: '48px', textAlign: 'center', padding: '6px 2px' }}>Status</th>
                <th className="col-sticky-action" style={{ textAlign: 'center', width: '180px', padding: '6px 4px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
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
                  const quotaTarget = s.complete_needed || s.target_completes || 200;
                  const quotaFilled = s.live_click_quota || Math.round(quotaTarget * 0.65);
                  const fillPercent = Math.min(100, Math.round((quotaFilled / quotaTarget) * 100));

                  return (
                    <React.Fragment key={s.survey_id || idx}>
                      <tr 
                        style={{ 
                          borderBottom: isExpanded ? 'none' : '1px solid #E2E8F0',
                          background: isExpanded ? '#F8FAFC' : selectedSurveyIds.has(s.survey_id) ? 'rgba(67, 97, 238, 0.04)' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <td className="col-checkbox" style={{ textAlign: 'center', padding: '6px 2px' }}>
                          <input
                            type="checkbox"
                            checked={selectedSurveyIds.has(s.survey_id)}
                            onChange={() => handleToggleSelect(s.survey_id)}
                            title={`Select survey ${s.survey_id}`}
                            style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: '#4361EE' }}
                          />
                        </td>
                        <td className="col-index" style={{ textAlign: 'center', color: '#94A3B8', fontSize: '11px', padding: '6px 2px' }}>
                          {globalIdx}
                        </td>
                        <td style={{ padding: '6px 6px' }}>
                          <div 
                            style={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px', cursor: 'pointer', lineHeight: 1.25, wordBreak: 'break-word', whiteSpace: 'normal' }}
                            onClick={() => toggleExpand(s.survey_id)}
                          >
                            {s.survey_name}
                          </div>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', fontWeight: 700 }}>
                              PID: {s.survey_id}
                            </span>
                            {s.category && (
                              <span style={{ fontSize: '9.5px', color: '#64748B', background: '#F1F5F9', padding: '1px 4px', borderRadius: '3px' }}>
                                {s.category}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '6px 4px' }}>
                          <span style={{
                            padding: '2px 5px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700,
                            background: clientName === 'Market Xcel' ? '#FFF7ED' : '#EFF6FF',
                            color: clientName === 'Market Xcel' ? '#C2410C' : '#1D4ED8',
                            border: `1px solid ${clientName === 'Market Xcel' ? '#FFEDD5' : '#DBEAFE'}`,
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}>
                            {clientName}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px 2px' }}>
                          <span className="badge badge-info" style={{ fontSize: '10.5px', fontWeight: 600, padding: '2px 4px' }}>
                            {s.country}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px 2px' }}>
                          {getDeviceBadges(s.device_type)}
                        </td>
                        <td style={{ padding: '6px 4px' }}>
                          <div style={{ fontWeight: 800, color: '#15803D', fontSize: '12px' }}>
                            ${Number(s.cpi).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#64748B' }}>per complete</div>
                        </td>
                        <td style={{ padding: '6px 4px' }}>
                          <div style={{ fontSize: '11px', color: '#0F172A', fontWeight: 600 }}>
                            <Clock size={10} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle', color: '#64748B' }} />
                            {s.loi}m
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>
                            IR: <strong>{s.ir}%</strong>
                          </div>
                        </td>
                        <td style={{ padding: '6px 4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>{quotaFilled} / {quotaTarget}</span>
                            <span style={{ color: '#64748B' }}>{fillPercent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${fillPercent}%`,
                              height: '100%',
                              background: fillPercent > 85 ? '#EA580C' : '#10B981',
                              borderRadius: '3px'
                            }} />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px 2px' }}>
                          <span className="badge-soft-success" style={{
                            padding: '2px 5px',
                            borderRadius: '20px',
                            fontSize: '10px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />
                            {s.status || 'Live'}
                          </span>
                        </td>
                        <td className="col-sticky-action" style={{ textAlign: 'center', padding: '6px 4px' }}>
                          <div style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 7px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}
                              onClick={() => onOpenAssign(s)}
                              title="Assign survey to vendor"
                            >
                              <Share2 size={11} /> Assign
                            </button>

                            <button
                              className="btn btn-soft-info btn-sm"
                              style={{ padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#0891b2', border: '1px solid rgba(6, 182, 212, 0.2)', fontWeight: 600, whiteSpace: 'nowrap' }}
                              onClick={() => openDuplicateModal(s)}
                              title="1-Click Clone / Duplicate Project"
                            >
                              <Copy size={11} /> Clone
                            </button>

                            <button
                              className="btn btn-soft-secondary btn-sm"
                              style={{ padding: '3px 5px', fontSize: '11px', borderRadius: '4px' }}
                              onClick={() => onOpenQuotas(s.survey_id)}
                              title="View Quotas"
                            >
                              <PieChart size={11} />
                            </button>

                            <button
                              className="btn btn-soft-secondary btn-sm"
                              style={{ padding: '3px 5px', fontSize: '11px', borderRadius: '4px' }}
                              onClick={() => onOpenQuals(s.survey_id)}
                              title="View Criteria & Qualifications"
                            >
                              <UserCheck size={11} />
                            </button>

                            <button
                              className="btn btn-soft-secondary btn-sm"
                              style={{ padding: '3px 4px', borderRadius: '4px', color: '#7081b9' }}
                              onClick={() => toggleExpand(s.survey_id)}
                              title="Toggle Survey Details"
                            >
                              {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Deep Specification View */}
                      {isExpanded && (
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                          <td colSpan="11" style={{ padding: '16px 24px' }}>
                            <div style={{
                              background: '#FFFFFF',
                              borderRadius: '8px',
                              padding: '16px',
                              border: '1px solid #E2E8F0',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                              gap: '16px'
                            }}>
                              <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>
                                  Study Description & Audience
                                </h4>
                                <p style={{ margin: 0, fontSize: '12.5px', color: '#0F172A', lineHeight: 1.5 }}>
                                  {s.survey_description || 'General population survey with demographic quota constraints and quality speeder filters.'}
                                </p>
                              </div>

                              <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>
                                  Security & Hashing Specifications
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155' }}>
                                  <li>Hashing Algorithm: <strong>SHA3-256 (Market Xcel Spec)</strong></li>
                                  <li>S2S Webhook: <strong>Automated POST callback active</strong></li>
                                  <li>Fraud Protection: <strong>Honeypot + Speeder Threshold (30%)</strong></li>
                                </ul>
                              </div>

                              <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>
                                  Live Target URLs
                                </h4>
                                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', wordBreak: 'break-all' }}>
                                  <div><strong>Live:</strong> {s.entry_live_url || 'Zamplia On-Demand Authenticated Session'}</div>
                                  <div style={{ marginTop: '4px' }}><strong>Test:</strong> {s.entry_test_url || 'Live Test Link Ready'}</div>
                                </div>
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
                  <td colSpan="11" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5, color: '#EA580C' }} />
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px', fontSize: '14px' }}>
                      No allocated surveys match your filter criteria.
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                      Try clearing your search term, changing country, or switching demand channels.
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedChannel('ALL');
                        setSelectedCountry('ALL');
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

        {/* Pagination Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#F8FAFC',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12.5px', color: '#64748B' }}>
              Showing <strong>{filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> live studies
            </span>

            {/* Page Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="input-control"
                style={{ width: 'auto', height: '28px', padding: '2px 8px', fontSize: '12px' }}
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
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(1)}
              title="First Page"
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              First
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '12px', fontWeight: 700, color: '#0F172A', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', height: '30px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              title="Last Page"
              style={{ padding: '4px 8px', fontSize: '11px' }}
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
          if (onRefresh) onRefresh();
        }}
      />

      {/* 1-Click Project Cloner Modal */}
      <DuplicateProjectModal
        isOpen={Boolean(duplicateModalProject)}
        project={duplicateModalProject}
        onClose={() => setDuplicateModalProject(null)}
        onSuccess={(cloned) => {
          if (cloned && onAddSurvey) {
            onAddSurvey({
              surveyId: cloned.id || cloned.project_id,
              name: cloned.name || cloned.project_name,
              cpi: Number(cloned.cpi || cloned.cost_per_complete),
              loi: Number(cloned.loi),
              ir: Number(cloned.ir),
              client: 'Market Xcel',
              clientCode: 'MX_DEMAND',
              status: cloned.status || 'Pause',
              totalRequired: Number(cloned.target_completes || cloned.max_limit || 500),
              completesNeeded: Number(cloned.target_completes || cloned.max_limit || 500),
              country: cloned.country || 'United States',
              category: 'Cloned Enterprise Study',
              studyType: 'Consumer'
            });
          }
          if (onRefresh) onRefresh();
        }}
      />

      {/* Floating Bulk Action Bar */}
      {selectedSurveyIds.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: '50px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <span style={{
              background: '#4361EE',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11.5px',
              fontWeight: 800
            }}>
              {selectedSurveyIds.size}
            </span>
            <span>surveys selected</span>
          </div>

          <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />

          <button
            onClick={openBulkModal}
            style={{
              background: '#4361EE',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '30px',
              padding: '7px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(67, 97, 238, 0.4)'
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
                background: 'rgba(255,255,255,0.1)',
                color: '#E2E8F0',
                border: 'none',
                borderRadius: '30px',
                padding: '6px 12px',
                fontSize: '11.5px',
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
              color: '#94A3B8',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '30px',
              padding: '6px 12px',
              fontSize: '11.5px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      )}

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
    </div>
  );
}
