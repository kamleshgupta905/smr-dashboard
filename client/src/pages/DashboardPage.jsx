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
  Globe,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function DashboardPage({ 
  stats, 
  surveys = [], 
  loading, 
  syncing,
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

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
        { name: 'Zamplia Supply', pct: 42.5, color: '#6366F1' },
        { name: 'Market Xcel', pct: 26.3, color: '#10B981' },
        { name: 'Ipsos Reid', pct: 18.2, color: '#06B6D4' },
        { name: 'Other Sources', pct: 13.0, color: '#F59E0B' },
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
      { name: 'Zamplia Supply', count: counts.zamplia, color: '#6366F1' },
      { name: 'Market Xcel', count: counts.mx, color: '#10B981' },
      { name: 'Ipsos Reid', count: counts.ipsos, color: '#06B6D4' },
      { name: 'Other Sources', count: counts.other, color: '#F59E0B' },
    ]
      .filter(c => c.count > 0)
      .map(c => ({ ...c, pct: +((c.count / total) * 100).toFixed(1) }));
  }, [normalized]);

  // ─── Activity Timeline — real computed insights from live surveys ─────────
  const activities = useMemo(() => {
    if (!normalized.length) return [
      {
        text: 'Sync with Zamplia to load active surveys and inventory alerts.',
        time: 'Click "Sync Surveys" above',
        color: '#6366F1'
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
        color: '#6366F1'
      });
    }

    if (topQuotaSurvey) {
      const needed = Number(topQuotaSurvey.completesNeeded || topQuotaSurvey.TotalCompleteRequired || 0);
      const required = Number(topQuotaSurvey.totalRequired || topQuotaSurvey.TotalCompleteRequired || 0);
      events.push({
        text: `Largest Open Quota: "${topQuotaSurvey.survey_name || topQuotaSurvey.name}" — ${needed.toLocaleString()} completes still needed`,
        time: `${topQuotaSurvey.country || 'Global'} · Target: ${required.toLocaleString()} total · ${topQuotaSurvey.studyType || 'Consumer'}`,
        color: '#10B981'
      });
    }

    events.push({
      text: `Marketplace Inventory: ${normalized.length} allocated studies · ${b2bCount} B2B panels · ${highCpiCount} high-rate studies (≥$5 CPI) · ${countryCount} countries · Avg CPI $${avgCpi}`,
      time: 'Zamplia + Market Xcel · Live Router Synced',
      color: '#F59E0B'
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
    <div className="page-content" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Concept 1 Dark Header Title Box */}
      <div className="dastone-page-title-box">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 className="page-title" style={{ fontSize: '24px', letterSpacing: '-0.03em' }}>Overview</h4>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818CF8',
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={11} />
              Telemetry
            </span>
          </div>

          <ol className="breadcrumb" style={{ marginTop: '3px' }}>
            <li><span className="breadcrumb-item-link">VMH</span></li>
            <li className="separator">/</li>
            <li className="active">Overview</li>
          </ol>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px'
            }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
              Live Telemetry Active • Zamplia Supply Engine ({normalized.length} Studies Connected)
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="title-box-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onSync && (
            <button 
              className="btn-title-date"
              onClick={onSync}
              disabled={syncing}
              title="Sync marketplace surveys from live Zamplia API"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Inventory'}</span>
            </button>
          )}

          <button className="btn-title-date" title="Today's Date">
            <span>{todayStr}</span>
            <Calendar size={13} />
          </button>

          <button className="btn-title-download" title="Export live inventory as CSV" onClick={handleExportCsv} aria-label="Export CSV">
            <Download size={13} style={{ marginRight: '5px' }} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards — Linear / Stripe Modern Dark Style */}
      <StatsCards stats={stats} totalSurveys={normalized.length} onNavigate={onNavigate} />

      {/* Main Charts Row: Marketplace Capacity & Yield Trajectory + Device Breakdown */}
      <ApitoolAnalytics data={analyticsData} surveys={surveys} />

      {/* Secondary Row: Open Quota Meter + Sessions By Channel */}
      <div className="dastone-secondary-grid">
        {/* Widget 1: Real Open Quota Metrics & CPI Histogram */}
        <div className="card report-card secondary-grid-card">
          <div className="card-body" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Needed Completes
                </span>
              </div>
              <span style={{
                background: 'rgba(99, 102, 241, 0.14)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#818CF8',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {quotaFillPct}% Fulfilled
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', margin: '4px 0 10px 0' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em', lineHeight: 1 }}>
                <AnimatedCounter value={totalCompletesNeeded} duration={1400} />
              </h2>
              <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>Interviews Needed</span>
            </div>

            <p style={{ margin: '0 0 12px 0', fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5 }}>
              Open quota across <strong style={{ color: '#818CF8' }}>{normalized.length}</strong> live studies
              · Target: <strong style={{ color: '#E2E8F0' }}>{totalRequired.toLocaleString()}</strong> total completes
            </p>

            {/* Glowing Quota fill progress bar */}
            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{
                width: `${quotaFillPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366F1 0%, #10B981 100%)',
                borderRadius: '9999px',
                transition: 'width 1s ease',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
              }} />
            </div>

            {/* CPI Distribution Histogram — Real from live surveys */}
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Survey Yield Rates (CPI Distribution)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px', padding: '0 2px' }}>
              {cpiHistogram.map((val, i) => {
                const isMax = val === Math.max(...cpiHistogram);
                const labels = ['<$2', '$2-3.5', '$3.5-5', '$5-7', '$7-9', '≥$9'];
                return (
                  <div
                    key={i}
                    title={`${labels[i]} CPI (${val}% relative density)`}
                    style={{
                      flex: 1,
                      height: `${Math.max(val, 10)}%`,
                      background: isMax
                        ? 'linear-gradient(180deg, #818CF8 0%, #6366F1 100%)'
                        : 'rgba(99, 102, 241, 0.22)',
                      borderRadius: '4px 4px 0 0',
                      boxShadow: isMax ? '0 0 12px rgba(99, 102, 241, 0.6)' : 'none',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>
              <span>&lt;$2</span>
              <span>$3.5</span>
              <span>$5</span>
              <span>$7</span>
              <span>$9</span>
              <span>$9+</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Sessions By Channel / Partner */}
        <div className="card report-card secondary-grid-card">
          <div className="card-body" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 className="card-title" style={{ fontSize: '15px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Globe size={15} color="#818CF8" />
                  Demand & Supply Distribution
                </span>
              </h4>
              <span style={{
                fontSize: '11px',
                color: '#94A3B8',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {normalized.length} Studies Active
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div style={{ display: 'flex', height: '8px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '16px', background: 'rgba(255, 255, 255, 0.06)' }}>
              {channels.map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: `${c.pct}%`,
                    background: c.color,
                    transition: 'width 0.8s ease',
                    boxShadow: `0 0 8px ${c.color}66`
                  }}
                  title={`${c.name}: ${c.pct}%`}
                />
              ))}
            </div>

            {/* List of Partner Channels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {channels.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E2E8F0', fontWeight: 500 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}`, flexShrink: 0 }} />
                    {c.name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{c.count} studies</span>
                    <span style={{
                      fontWeight: 700,
                      color: '#FFFFFF',
                      minWidth: '42px',
                      textAlign: 'right',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      {c.pct}%
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {normalized.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '11px', color: '#64748B', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '3px 8px', borderRadius: '6px' }}>
                  <strong style={{ color: '#F8FAFC' }}>
                    {normalized.filter(s => (s.studyType || '').toLowerCase().includes('b2b')).length}
                  </strong> B2B Studies
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '3px 8px', borderRadius: '6px' }}>
                  <strong style={{ color: '#F8FAFC' }}>
                    {normalized.filter(s => !(s.studyType || '').toLowerCase().includes('b2b')).length}
                  </strong> Consumer Studies
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '3px 8px', borderRadius: '6px' }}>
                  <strong style={{ color: '#F8FAFC' }}>
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
        <div className="card-body" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h4 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Activity size={16} color="#818CF8" /> Marketplace Telemetry & Live Events
            </h4>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#10B981',
              fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 6px #10B981' }} />
              Live Stream
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: '2px solid rgba(255, 255, 255, 0.08)', paddingLeft: '18px', marginLeft: '8px' }}>
            {activities.map((act, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '-23px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: act.color,
                  border: '2px solid #0F172A',
                  boxShadow: `0 0 8px ${act.color}`
                }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#F1F5F9', lineHeight: 1.5, fontWeight: 500 }}>
                  {act.text}
                </p>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '3px' }}>
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
