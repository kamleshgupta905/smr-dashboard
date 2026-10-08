import React, { useState, useEffect, useMemo } from 'react';
import StatsCards from '../components/StatsCards';
import ApitoolAnalytics from '../components/ApitoolAnalytics';
import AnimatedCounter from '../components/AnimatedCounter';
import { getDashboardAnalytics } from '../services/api';
import { normalizeSurveys } from '../utils/normalize';
import { 
  Activity, 
  Calendar,
  Download,
  TrendingUp,
  Globe,
  Zap
} from 'lucide-react';

export default function DashboardPage({ 
  stats, 
  surveys = [], 
  loading, 
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

  // Memoize normalized surveys so it doesn't recompute on every render
  const normalized = useMemo(() => normalizeSurveys(surveys), [surveys]);

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // ─── Real Open Quota Metrics ──────────────────────────────────────────────
  const totalCompletesNeeded = useMemo(() =>
    normalized.reduce((acc, s) => acc + Number(s.completesNeeded || s.TotalCompleteRequired || 0), 0)
  , [normalized]);

  const totalRequired = useMemo(() =>
    normalized.reduce((acc, s) => acc + Number(s.totalRequired || s.TotalCompleteRequired || 0), 0)
  , [normalized]);

  const quotaFillPct = totalRequired > 0
    ? Math.round(((totalRequired - totalCompletesNeeded) / totalRequired) * 100)
    : 0;

  // CPI Distribution Histogram (6 buckets) — real from live surveys
  const cpiHistogram = useMemo(() => {
    const buckets = [
      normalized.filter(s => (s.cpi || 0) < 2).length,
      normalized.filter(s => (s.cpi || 0) >= 2 && (s.cpi || 0) < 3.5).length,
      normalized.filter(s => (s.cpi || 0) >= 3.5 && (s.cpi || 0) < 5).length,
      normalized.filter(s => (s.cpi || 0) >= 5 && (s.cpi || 0) < 7).length,
      normalized.filter(s => (s.cpi || 0) >= 7 && (s.cpi || 0) < 9).length,
      normalized.filter(s => (s.cpi || 0) >= 9).length,
    ];
    const maxBucket = Math.max(...buckets, 1);
    return buckets.map(c => Math.round((c / maxBucket) * 100));
  }, [normalized]);

  // ─── Sessions By Channel — real client/source distribution ───────────────
  const channels = useMemo(() => {
    if (!normalized.length) {
      return [
        { name: 'Supplier Panels', pct: 42.5, color: '#1761fd' },
        { name: 'Direct Routing', pct: 26.3, color: '#2a76f4' },
        { name: 'Demand S2S', pct: 18.2, color: '#22c55e' },
        { name: 'Organic Traffic', pct: 8.0, color: '#f59e0b' },
        { name: 'Sandbox Tests', pct: 5.0, color: '#8b5cf6' },
      ];
    }
    const total = normalized.length;
    const counts = normalized.reduce((acc, s) => {
      const client = (s.client || '').toLowerCase();
      if (client.includes('zamplia')) acc.zamplia++;
      else if (client.includes('market xcel') || client.includes('marketxcel')) acc.mx++;
      else if (client.includes('ipsos')) acc.ipsos++;
      else acc.other++;
      return acc;
    }, { zamplia: 0, mx: 0, ipsos: 0, other: 0 });

    return [
      { name: 'Zamplia Supply', count: counts.zamplia, color: '#1761fd' },
      { name: 'Market Xcel', count: counts.mx, color: '#22c55e' },
      { name: 'Ipsos Reid', count: counts.ipsos, color: '#2a76f4' },
      { name: 'Other Sources', count: counts.other, color: '#f59e0b' },
    ]
      .filter(c => c.count > 0)
      .map(c => ({ ...c, pct: +((c.count / total) * 100).toFixed(1) }));
  }, [normalized]);

  // ─── Activity Timeline — real computed insights from live surveys ─────────
  const activities = useMemo(() => {
    if (!normalized.length) return [
      {
        text: 'Sync with Zamplia Supply Engine to load live marketplace activities and survey alerts.',
        time: 'Press "Sync" in the topbar',
        color: '#8997bd'
      }
    ];

    const topCpiSurvey = [...normalized].sort((a, b) => (b.cpi || 0) - (a.cpi || 0))[0];
    const topQuotaSurvey = [...normalized].sort((a, b) =>
      (b.completesNeeded || b.TotalCompleteRequired || 0) - (a.completesNeeded || a.TotalCompleteRequired || 0)
    )[0];
    const avgCpi = (normalized.reduce((a, s) => a + (s.cpi || 0), 0) / normalized.length).toFixed(2);
    const countryCount = new Set(normalized.map(s => s.country).filter(Boolean)).size;
    const b2bCount = normalized.filter(s => (s.studyType || '').toLowerCase().includes('b2b')).length;
    const highCpiCount = normalized.filter(s => (s.cpi || 0) >= 5).length;

    const events = [];

    if (topCpiSurvey) {
      events.push({
        text: `Top Yield Study: "${topCpiSurvey.survey_name || topCpiSurvey.name}" — $${topCpiSurvey.cpi} CPI · ${topCpiSurvey.ir}% IR · ${topCpiSurvey.loi}min LOI`,
        time: `${topCpiSurvey.country || 'Global'} · ${topCpiSurvey.category || 'Consumer Study'}`,
        color: '#1761fd'
      });
    }

    if (topQuotaSurvey) {
      const needed = Number(topQuotaSurvey.completesNeeded || topQuotaSurvey.TotalCompleteRequired || 0);
      const required = Number(topQuotaSurvey.totalRequired || topQuotaSurvey.TotalCompleteRequired || 0);
      events.push({
        text: `Largest Open Quota: "${topQuotaSurvey.survey_name || topQuotaSurvey.name}" — ${needed.toLocaleString()} completes still needed`,
        time: `${topQuotaSurvey.country || 'Global'} · Target: ${required.toLocaleString()} total · ${topQuotaSurvey.studyType || 'Consumer'}`,
        color: '#22c55e'
      });
    }

    events.push({
      text: `Live Marketplace: ${normalized.length} allocated studies · ${b2bCount} B2B executive panels · ${highCpiCount} high-yield studies (≥$5 CPI) · ${countryCount} countries · Avg CPI $${avgCpi}`,
      time: 'Zamplia Supply Engine + Market Xcel · Synced live',
      color: '#f59e0b'
    });

    return events;
  }, [normalized]);

  // ─── CSV Export ──────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    const headers = ['Survey ID', 'Title', 'Country', 'CPI', 'LOI', 'IR', 'Required', 'Remaining', 'Client', 'Study Type'];
    const rows = normalized.map(s => [
      s.survey_id,
      `"${String(s.survey_name || '').replace(/"/g, '""')}"`,
      s.country,
      s.cpi,
      s.loi,
      s.ir,
      s.totalRequired || s.TotalCompleteRequired || '',
      s.completesNeeded || '',
      s.client || '',
      s.studyType || '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vmh-smr-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
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
          <button className="btn-title-date">
            <span>Today: {todayStr}</span>
            <Calendar size={13} />
          </button>
          <button className="btn-title-download" title="Export live inventory as CSV" onClick={handleExportCsv} aria-label="Export CSV">
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards — Real data from live surveys */}
      <StatsCards stats={stats} totalSurveys={normalized.length} onNavigate={onNavigate} />

      {/* Main Charts Row: Audience Overview (8 col) + Sessions Device (4 col) */}
      <ApitoolAnalytics data={analyticsData} surveys={surveys} />

      {/* Secondary Row: Open Quota Meter + Sessions By Channel */}
      <div className="dastone-secondary-grid">
        {/* Widget 1: Real Open Quota Metrics */}
        <div className="card report-card secondary-grid-card">
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '12px', color: '#8997bd', fontWeight: 500 }}>Open Quota Slots</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins', lineHeight: 1 }}>
                <AnimatedCounter value={totalCompletesNeeded} duration={1400} />
              </h2>
              <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>Interviews Needed</span>
            </div>

            <p style={{ margin: '8px 0 6px 0', fontSize: '11.5px', color: '#8997bd', lineHeight: 1.5 }}>
              Open quota across <strong style={{ color: '#1761fd' }}>{normalized.length}</strong> live studies
              · <strong style={{ color: '#16a34a' }}>{quotaFillPct}%</strong> filled
              of {totalRequired.toLocaleString()} total target
            </p>

            {/* Quota fill progress bar */}
            <div style={{ height: '5px', background: '#f1f5fa', borderRadius: '9999px', marginBottom: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${quotaFillPct}%`, height: '100%', background: '#1761fd', borderRadius: '9999px', transition: 'width 1s ease' }} />
            </div>

            {/* CPI Distribution Histogram — Real from live surveys */}
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: '#8997bd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CPI Distribution
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '42px' }}>
              {cpiHistogram.map((val, i) => {
                const isMax = val === Math.max(...cpiHistogram);
                const labels = ['<$2', '$2-3.5', '$3.5-5', '$5-7', '$7-9', '≥$9'];
                return (
                  <div
                    key={i}
                    title={`${labels[i]} CPI`}
                    style={{
                      flex: 1,
                      height: `${Math.max(val, 8)}%`,
                      background: isMax ? '#1761fd' : 'rgba(23, 97, 253, 0.25)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'default'
                    }}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '9px', color: '#b0bac9' }}>
              <span>&lt;$2</span>
              <span>$3.5</span>
              <span>$5</span>
              <span>$7</span>
              <span>$9</span>
              <span>$9+</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Sessions By Channel — Real from live survey clients */}
        <div className="card report-card secondary-grid-card">
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="card-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} color="#1761fd" />
                  Demand Sources
                </span>
              </h4>
              <span style={{ fontSize: '11px', color: '#8997bd' }}>
                {normalized.length} Studies
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div style={{ display: 'flex', height: '8px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px', background: '#f1f5fa' }}>
              {channels.map((c, i) => (
                <div
                  key={i}
                  style={{ width: `${c.pct}%`, background: c.color, transition: 'width 0.8s ease' }}
                  title={`${c.name}: ${c.pct}%`}
                />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {channels.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#303e67' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    {c.name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#8997bd' }}>{c.count} studies</span>
                    <span style={{ fontWeight: 700, color: '#1d2c48', minWidth: '38px', textAlign: 'right' }}>{c.pct}%</span>
                  </span>
                </div>
              ))}
            </div>

            {normalized.length > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5fa', fontSize: '11px', color: '#8997bd', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span>
                  <strong style={{ color: '#1d2c48' }}>
                    {normalized.filter(s => (s.studyType || '').toLowerCase().includes('b2b')).length}
                  </strong> B2B
                </span>
                <span>
                  <strong style={{ color: '#1d2c48' }}>
                    {normalized.filter(s => !(s.studyType || '').toLowerCase().includes('b2b')).length}
                  </strong> Consumer
                </span>
                <span>
                  <strong style={{ color: '#1d2c48' }}>
                    {new Set(normalized.map(s => s.country).filter(Boolean)).size}
                  </strong> Countries
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline — Real computed insights from live survey inventory */}
      <div className="card report-card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#1761fd" /> Live Marketplace Insights
            </h4>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px', marginRight: '2px' }} />
              Live Data
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #e3ebf6', paddingLeft: '16px', marginLeft: '8px' }}>
            {activities.map((act, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '-21px',
                  top: '3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: act.color,
                  border: '2px solid #ffffff'
                }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#303e67', lineHeight: 1.45, fontWeight: 500 }}>
                  {act.text}
                </p>
                <span style={{ fontSize: '11px', color: '#8997bd', display: 'block', marginTop: '3px' }}>
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
