import React, { useState, useEffect, useMemo } from 'react';
import StatsCards from '../components/StatsCards';
import ApitoolAnalytics from '../components/ApitoolAnalytics';
import { getDashboardAnalytics } from '../services/api';
import { normalizeSurveys } from '../utils/normalize';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Layers, 
  Clock, 
  CheckCircle2,
  DollarSign,
  Share2,
  FileText,
  Radio,
  ExternalLink,
  Calendar,
  Download
} from 'lucide-react';

export default function DashboardPage({ 
  stats, 
  surveys = [], 
  loading, 
  systemStatus, 
  dataMode = 'unknown',
  onRecheckStatus,
  onSync, 
  onNavigate, 
  onOpenQuotas, 
  onOpenQuals, 
  onOpenAssign 
}) {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    getDashboardAnalytics().then(res => {
      setAnalyticsData(res?.data || res || null);
    }).catch(() => {});
  }, []);

  const normalized = normalizeSurveys(surveys);
  const topSurveys = [...normalized]
    .sort((a, b) => (b.cpi || 0) - (a.cpi || 0))
    .slice(0, 6);

  // ---------------------------------------------------------------
  // Real marketplace metrics — every number below is derived from the
  // actual inventory in `normalized` (live from Zamplia, or the clearly-
  // labelled demo catalog). No hardcoded fake stats.
  // ---------------------------------------------------------------

  // Open demand: completes still needed across the whole marketplace
  const openCompletes = normalized.reduce((acc, s) => acc + (s.completesNeeded || 0), 0);
  const totalRequired = normalized.reduce((acc, s) => acc + (s.TotalCompleteRequired || 0), 0);
  const fulfilledCompletes = Math.max(0, totalRequired - openCompletes);
  const fulfillmentPct = totalRequired > 0 ? Math.min(100, (fulfilledCompletes / totalRequired) * 100) : 0;
  // Revenue at risk if open demand were delivered today (CPI x completes needed)
  const potentialRevenue = normalized.reduce((acc, s) => acc + (s.cpi || 0) * (s.completesNeeded || 0), 0);

  // Channel mix: real split between Zamplia vs Market Xcel demand
  const channelMix = useMemo(() => {
    const count = { 'Zamplia': 0, 'Market Xcel': 0 };
    const demand = { 'Zamplia': 0, 'Market Xcel': 0 };
    normalized.forEach(s => {
      const isMx = (s.client || '').toLowerCase().includes('market xcel') ||
        String(s.survey_id || '').toLowerCase().startsWith('mx');
      const key = isMx ? 'Market Xcel' : 'Zamplia';
      count[key] += 1;
      demand[key] += (s.completesNeeded || 0);
    });
    const total = count['Zamplia'] + count['Market Xcel'] || 1;
    return [
      { name: 'Zamplia', color: '#1761fd', surveys: count['Zamplia'], demand: demand['Zamplia'], pct: (count['Zamplia'] / total) * 100 },
      { name: 'Market Xcel', color: '#22c55e', surveys: count['Market Xcel'], demand: demand['Market Xcel'], pct: (count['Market Xcel'] / total) * 100 },
    ];
  }, [normalized]);

  // Top categories by study volume (real)
  const topCategories = useMemo(() => {
    const map = new Map();
    normalized.forEach(s => {
      const c = s.category || 'Uncategorized';
      const cur = map.get(c) || { cat: c, count: 0, demand: 0 };
      cur.count += 1;
      cur.demand += (s.completesNeeded || 0);
      map.set(c, cur);
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [normalized]);
  const maxCategoryCount = Math.max(1, ...topCategories.map(c => c.count));

  // Country distribution (real), top 6 by open demand
  const countryStats = useMemo(() => {
    const map = new Map();
    normalized.forEach(s => {
      const c = s.countryName || s.country || 'Unknown';
      const cur = map.get(c) || { country: c, count: 0, demand: 0 };
      cur.count += 1;
      cur.demand += (s.completesNeeded || 0);
      map.set(c, cur);
    });
    return [...map.values()].sort((a, b) => b.demand - a.demand).slice(0, 6);
  }, [normalized]);
  const maxCountryDemand = Math.max(1, ...countryStats.map(c => c.demand));

  // Rolling mini-histogram: studies per country (real, top 12 buckets)
  const histogramBuckets = useMemo(() => {
    const map = new Map();
    normalized.forEach(s => {
      const c = s.countryName || 'Other';
      map.set(c, (map.get(c) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([label, value]) => ({ label, value }));
  }, [normalized]);
  const maxBucket = Math.max(1, ...histogramBuckets.map(b => b.value));

  // Activity feed — built from real inventory facts, not scripted text
  const activities = useMemo(() => {
    const top = topSurveys[0];
    const bigCountry = countryStats[0];
    const list = [];
    list.push({
      text: `${normalized.length} studies active in marketplace — ${openCompletes.toLocaleString()} completes still open`,
      time: 'Just now', color: '#1761fd',
    });
    if (top) {
      list.push({
        text: `Highest yield study: ${top.survey_name} at $${top.cpi.toFixed(2)} CPI (rank #1)`,
        time: 'Inventory scan', color: '#22c55e',
      });
    }
    if (bigCountry) {
      list.push({
        text: `${bigCountry.country} leads demand with ${bigCountry.demand.toLocaleString()} open completes`,
        time: 'Inventory scan', color: '#8b5cf6',
      });
    }
    if (dataMode === 'demo') {
      list.push({
        text: 'Demo data mode active — live upstream APIs unreachable from this server',
        time: 'System check', color: '#f59e0b',
      });
    }
    return list;
  }, [normalized, topSurveys, countryStats, openCompletes, dataMode]);

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Export the current Top Allocations table as CSV
  const handleExportCsv = () => {
    const headers = ['Survey ID', 'Title', 'Country', 'CPI', 'LOI', 'IR', 'Required', 'Remaining'];
    const rows = topSurveys.map(s => [
      s.survey_id,
      `"${String(s.survey_name || '').replace(/"/g, '""')}"`,
      s.countryName || s.country,
      s.cpi,
      s.loi,
      s.ir,
      s.TotalCompleteRequired || s.target_completes || '',
      s.completesNeeded ?? '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vmh-smr-top-allocations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      {/* Page Title Box */}
      <div className="dastone-page-title-box">
        <div>
          <h4 className="page-title">Analytics</h4>
          <ol className="breadcrumb">
            <li><span className="breadcrumb-item-link">VMH</span></li>
            <li className="separator">/</li>
            <li className="active">Analytics</li>
          </ol>
        </div>

        <div className="title-box-actions">
          {/* Today Button */}
          <button className="btn-title-date">
            <span>Today: {todayStr}</span>
            <Calendar size={13} />
          </button>

          {/* Download Button (working CSV export) */}
          <button className="btn-title-download" title="Export top allocations as CSV" onClick={handleExportCsv} aria-label="Export CSV">
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <StatsCards stats={stats} totalSurveys={normalized.length} onNavigate={onNavigate} />

      {/* Main Charts Row: Audience Overview (8 col) + Sessions Device (4 col) */}
      <ApitoolAnalytics data={analyticsData} />

      {/* Secondary Row — all metrics computed from the real inventory above */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Widget 1: Open Market Demand (real completes needed) - 4 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 4' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '12px', color: '#8997bd', fontWeight: 500 }}>Open Market Demand</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins', lineHeight: 1 }}>
                {openCompletes.toLocaleString()}
              </h2>
              <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>completes open</span>
            </div>

            <p style={{ margin: '8px 0 4px 0', fontSize: '11.5px', color: '#8997bd', lineHeight: 1.5 }}>
              {totalRequired.toLocaleString()} total required &bull; est. revenue at risk ${potentialRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>

            {/* Fulfillment progress (real) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#8997bd', marginBottom: '4px' }}>
              <span>Fulfillment</span>
              <span style={{ fontWeight: 700, color: '#1d2c48' }}>{fulfillmentPct.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#f1f5fa', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${fulfillmentPct}%`, height: '100%', background: 'linear-gradient(90deg, #1761fd, #22c55e)', borderRadius: '9999px' }} />
            </div>

            {/* Real mini histogram: studies per country */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '34px', marginTop: '12px', paddingTop: '4px' }}>
              {histogramBuckets.map((b, i) => (
                <div
                  key={b.label}
                  title={`${b.label}: ${b.value} studies`}
                  style={{
                    flex: 1,
                    height: `${Math.max(8, (b.value / maxBucket) * 100)}%`,
                    background: i === 0 ? '#1761fd' : 'rgba(23, 97, 253, 0.25)',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: '10px', color: '#9ba7ca', marginTop: '4px' }}>Studies by country (top {histogramBuckets.length})</div>
          </div>
        </div>

        {/* Widget 2: Channel Mix (real Zamplia vs Market Xcel) - 4 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 4' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="card-title">Channel Mix</h4>
              <span style={{ fontSize: '11px', color: '#1761fd', fontWeight: 600 }}>By study count</span>
            </div>

            {/* Segmented bar from real counts */}
            <div style={{ display: 'flex', height: '8px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px', background: '#f1f5fa' }}>
              {channelMix.map((c, i) => (
                <div key={i} style={{ width: `${c.pct}%`, background: c.color }} title={`${c.name}: ${c.pct.toFixed(1)}%`} />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {channelMix.map((c, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#303e67' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
                      {c.name}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1d2c48' }}>{c.pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#8997bd', paddingLeft: '14px' }}>
                    {c.surveys.toLocaleString()} studies &bull; {c.demand.toLocaleString()} open completes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 3: Top Categories (real) - 4 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 4' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="card-title">Top Categories</h4>
              <span style={{ fontSize: '11px', color: '#8997bd' }}>By volume</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topCategories.map((c, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: '#1d2c48', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                      {c.cat}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1761fd' }}>{c.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '3px', background: '#e3ebf6', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${(c.count / maxCategoryCount) * 100}%`, height: '100%', background: '#1761fd', borderRadius: '9999px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tertiary Row: Activity Timeline + Browser Used & Traffic Reports */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Activity Feed (4 cols) */}
        <div className="card report-card" style={{ gridColumn: 'span 4' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="card-title">Activity</h4>
              <span style={{ fontSize: '11px', color: '#8997bd' }}>All</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '2px solid #e3ebf6', paddingLeft: '14px', marginLeft: '6px' }}>
              {activities.map((act, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '-19px', 
                    top: '2px', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: act.color,
                    border: '2px solid #ffffff' 
                  }} />
                  <p style={{ margin: 0, fontSize: '12px', color: '#303e67', lineHeight: 1.4 }}>
                    {act.text}
                  </p>
                  <span style={{ fontSize: '10.5px', color: '#8997bd', display: 'block', marginTop: '2px' }}>
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Country Distribution (real demand data) - 8 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 8' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="card-title">Country Distribution — Open Demand</h4>
              <span style={{ fontSize: '11px', color: '#1761fd', fontWeight: 600 }}>Top {countryStats.length} markets</span>
            </div>

            <div className="table-wrapper" style={{ border: 'none' }}>
              <table style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Active Studies</th>
                    <th>Open Completes</th>
                    <th style={{ width: '34%' }}>Demand Share</th>
                  </tr>
                </thead>
                <tbody>
                  {countryStats.map((c, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: '#1d2c48' }}>{c.country}</td>
                      <td>{c.count.toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: '#1761fd' }}>{c.demand.toLocaleString()}</td>
                      <td>
                        <div style={{ width: '100%', height: '5px', background: '#f1f5fa', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${(c.demand / maxCountryDemand) * 100}%`, height: '100%', background: '#1761fd', borderRadius: '9999px' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Top Yielding Survey Allocations (SMR Production Table) */}
      <div className="card report-card">
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <h4 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={15} color="#22c55e" /> Top Yielding Survey Allocations
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#8997bd' }}>
                High-margin inventory fetched live from Zamplia Supply API & Market Xcel panels
              </p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('surveys')}
            >
              View Full Inventory ({normalized.length}) <ArrowRight size={12} />
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Survey ID / Title</th>
                  <th>Supplier / Country</th>
                  <th>CPI ($)</th>
                  <th>Est. LOI</th>
                  <th>IR (%)</th>
                  <th>Quota Pacing</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topSurveys.length > 0 ? (
                  topSurveys.map((survey) => (
                    <tr key={survey.id || survey.survey_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1d2c48' }}>
                          {survey.survey_name || `Survey #${survey.survey_id || survey.id}`}
                        </div>
                        <span style={{ fontSize: '11px', color: '#8997bd' }}>ID: {survey.survey_id || survey.id}</span>
                      </td>
                      <td>
                        <span className="badge-soft-primary" style={{ padding: '2px 6px', borderRadius: '3px', fontSize: '11px', fontWeight: 600 }}>
                          {(survey.countryName || survey.country || 'US')} &bull; {String(survey.client || 'Zamplia').includes('Market Xcel') ? 'Market Xcel' : 'Zamplia'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>
                          ${Number(survey.cpi || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>{survey.loi || 15} mins</td>
                      <td>{survey.ir || 45}%</td>
                      <td style={{ minWidth: '120px' }}>
                        {(() => {
                          const target = survey.TotalCompleteRequired || 0;
                          const open = survey.completesNeeded || 0;
                          const done = Math.max(0, target - open);
                          const pct = target > 0 ? Math.min(100, (done / target) * 100) : 0;
                          return (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '3px', color: '#8997bd' }}>
                                <span>Fulfillment</span>
                                <span>{done.toLocaleString()}/{target.toLocaleString()}</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', background: '#f1f5fa', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 75 ? '#22c55e' : '#1761fd', borderRadius: '9999px' }} />
                              </div>
                            </>
                          );
                        })()}
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenAssign && onOpenAssign(survey.survey_id || survey.id)}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          Route Test <ExternalLink size={11} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#8997bd' }}>
                      No survey records active. Please click Sync Inventory to fetch live Zamplia data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
