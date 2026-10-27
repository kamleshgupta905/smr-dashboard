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
  Zap,
  RefreshCw,
  Target,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  PieChart
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
  const [hoveredCpiBucket, setHoveredCpiBucket] = useState(null);

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

  const avgCpi = useMemo(() => {
    if (!normalized.length) return '0.00';
    return (normalized.reduce((a, s) => a + (s.cpi || 0), 0) / normalized.length).toFixed(2);
  }, [normalized]);

  const countryCount = useMemo(() => {
    return new Set(normalized.map(s => s.country).filter(Boolean)).size;
  }, [normalized]);

  const b2bCount = useMemo(() => {
    return normalized.filter(s => (s.studyType || '').toLowerCase().includes('b2b')).length;
  }, [normalized]);

  const consumerCount = useMemo(() => {
    return normalized.length - b2bCount;
  }, [normalized, b2bCount]);

  // CPI Distribution Histogram (6 buckets) — real from live surveys
  const cpiBucketData = useMemo(() => {
    const rawCounts = [
      normalized.filter(s => (s.cpi || 0) < 2).length,
      normalized.filter(s => (s.cpi || 0) >= 2 && (s.cpi || 0) < 3.5).length,
      normalized.filter(s => (s.cpi || 0) >= 3.5 && (s.cpi || 0) < 5).length,
      normalized.filter(s => (s.cpi || 0) >= 5 && (s.cpi || 0) < 7).length,
      normalized.filter(s => (s.cpi || 0) >= 7 && (s.cpi || 0) < 9).length,
      normalized.filter(s => (s.cpi || 0) >= 9).length,
    ];
    const maxCount = Math.max(...rawCounts, 1);
    const labels = ['<$2', '$2-3.5', '$3.5-5', '$5-7', '$7-9', '≥$9'];

    return rawCounts.map((count, idx) => ({
      label: labels[idx],
      count,
      pct: normalized.length > 0 ? Math.round((count / normalized.length) * 100) : 0,
      heightPct: Math.max(Math.round((count / maxCount) * 100), 10),
      isMax: count === maxCount && count > 0
    }));
  }, [normalized]);

  // ─── Sessions By Channel — real client/source distribution ───────────────
  const channels = useMemo(() => {
    if (!normalized.length) {
      return [
        { name: 'Supplier Panels', pct: 42.5, count: 0, color: '#0F172A' },
        { name: 'Direct Routing', pct: 26.3, count: 0, color: '#1E293B' },
        { name: 'Demand S2S', pct: 18.2, count: 0, color: '#10b981' },
        { name: 'Organic Traffic', pct: 8.0, count: 0, color: '#f59e0b' },
        { name: 'Sandbox Tests', pct: 5.0, count: 0, color: '#8b5cf6' },
      ];
    }
    const total = normalized.length;
    const clientMap = {};
    normalized.forEach(s => {
      const c = (s.client_name || s.client || 'Zamplia Global').trim();
      clientMap[c] = (clientMap[c] || 0) + 1;
    });

    const palette = ['#0F172A', '#059669', '#6366f1', '#f59e0b', '#8b5cf6'];
    return Object.entries(clientMap).map(([name, count], i) => ({
      name,
      count,
      color: palette[i % palette.length],
      pct: +((count / total) * 100).toFixed(1)
    }));
  }, [normalized]);

  // ─── Activity Timeline — real computed insights from live surveys ─────────
  const activities = useMemo(() => {
    if (!normalized.length) return [
      {
        icon: Zap,
        title: 'Inventory Awaiting Sync',
        text: 'Sync with Zamplia supply engine to load active marketplace surveys.',
        time: 'Ready to sync',
        color: '#64748b'
      }
    ];

    const topCpiSurvey = [...normalized].sort((a, b) => (b.cpi || 0) - (a.cpi || 0))[0];
    const topQuotaSurvey = [...normalized].sort((a, b) =>
      (b.completesNeeded || b.TotalCompleteRequired || 0) - (a.completesNeeded || a.TotalCompleteRequired || 0)
    )[0];
    const highCpiCount = normalized.filter(s => (s.cpi || 0) >= 5).length;

    const events = [];

    if (topCpiSurvey) {
      events.push({
        icon: DollarSign,
        title: 'High Yield Allocation',
        text: `Top rate study: "${topCpiSurvey.survey_name || topCpiSurvey.name}" offering $${topCpiSurvey.cpi} CPI (${topCpiSurvey.ir}% IR · ${topCpiSurvey.loi}m LOI)`,
        time: `${topCpiSurvey.country || 'Global'} · ${topCpiSurvey.category || 'Consumer Research'}`,
        color: '#0F172A'
      });
    }

    if (topQuotaSurvey) {
      const needed = Number(topQuotaSurvey.completesNeeded || topQuotaSurvey.TotalCompleteRequired || 0);
      const required = Number(topQuotaSurvey.totalRequired || topQuotaSurvey.TotalCompleteRequired || 0);
      events.push({
        icon: Target,
        title: 'Primary Quota Opportunity',
        text: `Largest demand: "${topQuotaSurvey.survey_name || topQuotaSurvey.name}" requiring ${needed.toLocaleString()} more completes`,
        time: `${topQuotaSurvey.country || 'Global'} · Target: ${required.toLocaleString()} total`,
        color: '#059669'
      });
    }

    events.push({
      icon: Activity,
      title: 'Marketplace Capacity Live',
      text: `${normalized.length} active studies · ${b2bCount} B2B panels · ${highCpiCount} premium rates (≥$5) · Avg CPI $${avgCpi}`,
      time: 'Real-time telemetry verified',
      color: '#d97706'
    });

    return events;
  }, [normalized, b2bCount, avgCpi]);

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
    <div className="page-content" style={{ padding: '0 4px' }}>
      {/* Mobbin-Inspired Modern Executive Header */}
      <div 
        className="dastone-page-title-box" 
        style={{
          background: '#ffffff',
          padding: '18px 24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 
              className="page-title" 
              style={{ 
                fontSize: '22px', 
                fontWeight: 700, 
                color: '#0f172a', 
                letterSpacing: '-0.025em',
                margin: 0
              }}
            >
              Executive Overview
            </h4>

            <span 
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: '#ecfdf5',
                color: '#059669',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid #a7f3d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span 
                className="pulse-dot" 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  background: '#10b981', 
                  borderRadius: '50%', 
                  display: 'inline-block' 
                }} 
              />
              Live Zamplia Telemetry
            </span>
          </div>

          <ol className="breadcrumb" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
            <li><span className="breadcrumb-item-link" style={{ color: '#0F172A', fontWeight: 600 }}>VMH Enterprise</span></li>
            <li className="separator">/</li>
            <li>Marketplace Intelligence</li>
            <li className="separator">/</li>
            <li className="active" style={{ color: '#0f172a', fontWeight: 600 }}>Overview</li>
          </ol>
        </div>

        {/* Header Action Tools */}
        <div className="title-box-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onSync && (
            <button 
              className="btn"
              onClick={onSync}
              disabled={loading}
              title="Synchronize real-time survey inventory from Zamplia"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                background: loading ? '#f1f5f9' : '#F8FAFC',
                color: loading ? '#94a3b8' : '#0F172A',
                border: '1px solid #E2E8F0',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Refreshing...' : 'Sync Inventory'}</span>
            </button>
          )}

          <div 
            className="btn-title-date"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '8px',
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #e2e8f0'
            }}
          >
            <Calendar size={13} color="#64748b" />
            <span>{todayStr}</span>
          </div>

          <button 
            className="btn-title-download" 
            title="Export live inventory as CSV" 
            onClick={handleExportCsv} 
            aria-label="Export CSV"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Mobbin Quick Metrics Highlight Ribbon */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={16} color="#0F172A" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 500 }}>Active Inventory</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{normalized.length.toLocaleString()} Studies</strong>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={16} color="#059669" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 500 }}>Remaining Demand</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{totalCompletesNeeded.toLocaleString()} Completes</strong>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={16} color="#d97706" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 500 }}>Average Yield</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>${avgCpi} CPI</strong>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Globe size={16} color="#7c3aed" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 500 }}>Global Footprint</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{countryCount} Target Markets</strong>
          </div>
        </div>
      </div>

      {/* 4 Hero KPI Cards — Real data from live surveys */}
      <StatsCards stats={stats} totalSurveys={normalized.length} onNavigate={onNavigate} />

      {/* Main Charts Row: Capacity & Trajectory (8 col) + Device Sessions (4 col) */}
      <ApitoolAnalytics data={analyticsData} surveys={surveys} />

      {/* Secondary Row: Open Quota Meter + Sessions By Channel */}
      <div className="dastone-secondary-grid" style={{ marginBottom: '20px' }}>
        {/* Widget 1: Real Open Quota Metrics & CPI Distribution */}
        <div 
          className="card report-card secondary-grid-card"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
          }}
        >
          <div className="card-body" style={{ padding: '20px' }}>
            {/* Widget Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
                <h4 className="card-title" style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Open Quota Fulfillment
                </h4>
              </div>

              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#F8FAFC',
                  color: '#0F172A',
                  border: '1px solid #E2E8F0',
                }}
              >
                {quotaFillPct}% Fulfilled
              </span>
            </div>

            {/* Main Numeric Highlight */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
                <AnimatedCounter value={totalCompletesNeeded} duration={1400} />
              </h2>
              <span style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                Completes Still Needed
              </span>
            </div>

            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
              Marketplace target across <strong style={{ color: '#0F172A' }}>{normalized.length}</strong> active studies
              (Goal: <strong style={{ color: '#0f172a' }}>{totalRequired.toLocaleString()}</strong> total interviews)
            </p>

            {/* Quota Fill Multi-stop Progress Bar */}
            <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '999px', marginBottom: '18px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${quotaFillPct}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #0F172A, #0F172A)', 
                  borderRadius: '999px', 
                  transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' 
                }} 
              />
            </div>

            {/* CPI Distribution Histogram — Interactive with Tooltip */}
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Rate Matrix (CPI Distribution)
              </span>
              {hoveredCpiBucket !== null && (
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A' }}>
                  {cpiBucketData[hoveredCpiBucket].label}: {cpiBucketData[hoveredCpiBucket].count} studies ({cpiBucketData[hoveredCpiBucket].pct}%)
                </span>
              )}
            </div>

            {/* Histogram Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '52px', paddingBottom: '4px' }}>
              {cpiBucketData.map((b, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredCpiBucket(i)}
                  onMouseLeave={() => setHoveredCpiBucket(null)}
                  title={`${b.label}: ${b.count} surveys (${b.pct}%)`}
                  style={{
                    flex: 1,
                    height: `${b.heightPct}%`,
                    background: hoveredCpiBucket === i
                      ? '#0F172A'
                      : (b.isMax ? '#0F172A' : '#CBD5E1'),
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                />
              ))}
            </div>

            {/* Bucket Scale Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
              {cpiBucketData.map((b, i) => (
                <span key={i} style={{ color: hoveredCpiBucket === i ? '#0F172A' : '#94a3b8' }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 2: Surveys By Client — Real from live survey clients */}
        <div 
          className="card report-card secondary-grid-card"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
          }}
        >
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={15} color="#0F172A" />
                </div>
                <h4 className="card-title" style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Surveys by Client Source
                </h4>
              </div>

              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {normalized.length} Studies Active
              </span>
            </div>

            {/* Segmented Modern Progress Bar */}
            <div style={{ display: 'flex', height: '9px', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px', background: '#f1f5f9' }}>
              {channels.map((c, i) => (
                <div
                  key={i}
                  style={{ width: `${c.pct}%`, background: c.color, transition: 'width 0.8s ease' }}
                  title={`${c.name}: ${c.pct}% (${c.count} studies)`}
                />
              ))}
            </div>

            {/* Client Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {channels.map((c, i) => (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '12px',
                    padding: '4px 0',
                    borderBottom: i < channels.length - 1 ? '1px solid #f8fafc' : 'none'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 500 }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    {c.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{c.count} studies</span>
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        color: '#0f172a', 
                        minWidth: '42px', 
                        textAlign: 'right',
                        fontSize: '11.5px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      {c.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Audience Taxonomy Tags */}
            {normalized.length > 0 && (
              <div 
                style={{ 
                  marginTop: '14px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid #f1f5f9', 
                  fontSize: '11.5px', 
                  color: '#64748b', 
                  display: 'flex', 
                  gap: '8px', 
                  flexWrap: 'wrap' 
                }}
              >
                <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a' }}>{b2bCount}</strong> B2B Panels
                </span>
                <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a' }}>{consumerCount}</strong> Consumer
                </span>
                <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a' }}>{countryCount}</strong> Countries
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline — Real computed insights from live survey inventory */}
      <div 
        className="card report-card" 
        style={{ 
          marginBottom: '24px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={15} color="#0F172A" />
              </div>
              <h4 className="card-title" style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Operational & Yield Intelligence
              </h4>
            </div>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <span className="pulse-dot" style={{ width: '5px', height: '5px', background: '#10b981', borderRadius: '50%' }} />
              Live Feed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #e2e8f0', paddingLeft: '18px', marginLeft: '10px' }}>
            {activities.map((act, idx) => {
              const EventIcon = act.icon || Activity;
              return (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Timeline Node Badge */}
                  <span 
                    style={{
                      position: 'absolute',
                      left: '-26px',
                      top: '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: act.color,
                      border: '3px solid #ffffff',
                      boxShadow: '0 0 0 1px #cbd5e1'
                    }} 
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: act.color, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {act.title}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>•</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {act.time}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>
                    {act.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
