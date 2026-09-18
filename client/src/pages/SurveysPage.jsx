import React, { useState, useMemo } from 'react';
import { 
  Search, PieChart, UserCheck, Share2, AlertCircle, ChevronLeft, ChevronRight, 
  DollarSign, Clock, ArrowUpDown, Filter, Monitor, Smartphone, Tablet, 
  ShieldCheck, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Layers, CheckCircle2
} from 'lucide-react';
import { normalizeSurveys } from '../utils/normalize';
import DemandProjectModal from '../components/DemandProjectModal';

export default function SurveysPage({ surveys = [], loading, onRefresh, onOpenQuotas, onOpenQuals, onOpenAssign }) {
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [sortBy, setSortBy] = useState('cpi-desc');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const pageSize = 12;

  const normalized = useMemo(() => normalizeSurveys(surveys), [surveys]);

  const countries = useMemo(() => {
    return ['ALL', ...new Set(normalized.map(s => s.country).filter(Boolean))];
  }, [normalized]);

  const channels = useMemo(() => {
    return ['ALL', 'Market Xcel', 'Zamplia'];
  }, []);

  const filtered = useMemo(() => {
    let list = normalized.filter((s) => {
      if (selectedCountry !== 'ALL' && s.country !== selectedCountry) return false;
      if (selectedChannel !== 'ALL') {
        const clientName = s.client || (String(s.survey_id).startsWith('MX') ? 'Market Xcel' : 'Zamplia');
        if (clientName !== selectedChannel) return false;
      }
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.survey_name.toLowerCase().includes(term) ||
        String(s.survey_id).toLowerCase().includes(term) ||
        (s.category && s.category.toLowerCase().includes(term))
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
  }, [normalized, selectedCountry, selectedChannel, searchTerm, sortBy]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedSurveys = filtered.slice((page - 1) * pageSize, page * pageSize);

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
            <span className="link">Marketplace</span>
            <span className="separator">/</span>
            <span className="current">Allocated Surveys</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Allocated Survey Marketplace
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
              Live Allocation
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          <button
            className="btn btn-primary"
            onClick={() => setDemandModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px' }}
          >
            <Layers size={14} /> + New Demand Study
          </button>
          {onRefresh && (
            <button
              className="btn btn-soft-primary"
              onClick={onRefresh}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px' }}
            >
              <RefreshCw size={13} /> Sync Live Inventory
            </button>
          )}
        </div>
      </div>

      {/* Filter & Channel Switcher Bar (Dastone Report Card) */}
      <div className="report-card" style={{ padding: '14px 20px', marginBottom: '20px' }}>
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
                {c === 'ALL' ? 'All Channels' : c}
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
                placeholder="Search PID, Study, Category..."
                value={searchTerm}
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', height: '34px', fontSize: '12px' }}
            >
              <option value="cpi-desc">💰 Highest CPI ($)</option>
              <option value="cpi-asc">Lowest CPI ($)</option>
              <option value="loi-asc">⚡ Shortest Duration (LOI)</option>
              <option value="ir-desc">🎯 Highest Incidence (IR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table (Dastone Report Card) */}
      <div className="report-card card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div className="report-card-header">
          <h4 className="report-card-title">
            <Layers size={15} color="#1761fd" /> Active Inventory Pipeline ({filtered.length} Studies)
          </h4>
          <span className="badge-soft-primary" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
        </div>
        <div className="table-wrapper table-container" style={{ margin: 0, border: 'none', borderRadius: 0, width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'block' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '1280px' }}>
            <thead className="thead-light">
              <tr>
                <th style={{ width: '38px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '220px' }}>Study Name & Identifier</th>
                <th>Client Source</th>
                <th>Country</th>
                <th>Devices</th>
                <th>CPI Payout</th>
                <th>Feasibility</th>
                <th style={{ minWidth: '140px' }}>Capacity / Quota</th>
                <th>Status</th>
                <th style={{ textAlign: 'center', minWidth: '180px', paddingRight: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
                    Synchronizing live inventory from Zamplia & Market Xcel...
                  </td>
                </tr>
              ) : paginatedSurveys.length > 0 ? (
                paginatedSurveys.map((s, idx) => {
                  const globalIdx = (page - 1) * pageSize + idx + 1;
                  const isExpanded = expandedId === s.survey_id;
                  const clientName = s.client || (String(s.survey_id).startsWith('MX') ? 'Market Xcel' : 'Zamplia');
                  const quotaTarget = s.complete_needed || s.target_completes || 200;
                  const quotaFilled = s.live_click_quota || Math.round(quotaTarget * 0.65);
                  const fillPercent = Math.min(100, Math.round((quotaFilled / quotaTarget) * 100));

                  return (
                    <React.Fragment key={s.survey_id || idx}>
                      <tr 
                        style={{ 
                          borderBottom: isExpanded ? 'none' : '1px solid #E2E8F0',
                          background: isExpanded ? '#F8FAFC' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                          {globalIdx}
                        </td>
                        <td>
                          <div 
                            style={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px', cursor: 'pointer' }}
                            onClick={() => toggleExpand(s.survey_id)}
                          >
                            {s.survey_name}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                            <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', fontWeight: 700 }}>
                              PID: {s.survey_id}
                            </span>
                            {s.category && (
                              <span style={{ fontSize: '10.5px', color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                                {s.category}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: clientName === 'Market Xcel' ? '#FFF7ED' : '#EFF6FF',
                            color: clientName === 'Market Xcel' ? '#C2410C' : '#1D4ED8',
                            border: `1px solid ${clientName === 'Market Xcel' ? '#FFEDD5' : '#DBEAFE'}`
                          }}>
                            {clientName}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-info" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                            {s.country}
                          </span>
                        </td>
                        <td>
                          {getDeviceBadges(s.device_type)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#15803D', fontSize: '14px' }}>
                            ${Number(s.cpi).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B' }}>per complete</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                            <Clock size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle', color: '#64748B' }} />
                            {s.loi} mins
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            IR: <strong>{s.ir}%</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>{quotaFilled} / {quotaTarget}</span>
                            <span style={{ color: '#64748B' }}>{fillPercent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${fillPercent}%`,
                              height: '100%',
                              background: fillPercent > 85 ? '#EA580C' : '#10B981',
                              borderRadius: '3px'
                            }} />
                          </div>
                        </td>
                        <td>
                          <span className="badge-soft-success" style={{
                            padding: '3px 9px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <span className="pulse-dot" />
                            {s.status || 'Live'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              className="btn btn-soft-primary btn-sm"
                              style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}
                              onClick={() => onOpenAssign(s)}
                              title="Assign Vendor & Generate Live Link"
                            >
                              <Share2 size={12} /> Assign Link
                            </button>

                            <button
                              className="btn btn-soft-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11.5px', borderRadius: '4px' }}
                              onClick={() => onOpenQuotas(s.survey_id)}
                              title="Inspect Quotas"
                            >
                              <PieChart size={12} />
                            </button>

                            <button
                              className="btn btn-soft-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11.5px', borderRadius: '4px' }}
                              onClick={() => onOpenQuals(s.survey_id)}
                              title="Inspect Qualifications"
                            >
                              <UserCheck size={12} />
                            </button>

                            <button
                              className="btn btn-soft-secondary btn-sm"
                              style={{ padding: '4px 6px', borderRadius: '4px', color: '#7081b9' }}
                              onClick={() => toggleExpand(s.survey_id)}
                              title="Toggle Specification Drawer"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Deep Specification View */}
                      {isExpanded && (
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                          <td colSpan="10" style={{ padding: '16px 24px' }}>
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
                                  <div style={{ marginTop: '4px' }}><strong>Test:</strong> {s.entry_test_url || 'Sandbox Simulation Ready'}</div>
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
                  <td colSpan="10" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                    No allocated surveys match your filter criteria.
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
          background: '#F8FAFC'
        }}>
          <span style={{ fontSize: '12.5px', color: '#64748B' }}>
            Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> studies
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
              {page} / {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Demand Study Creator Modal */}
      <DemandProjectModal
        isOpen={demandModalOpen}
        onClose={() => setDemandModalOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
