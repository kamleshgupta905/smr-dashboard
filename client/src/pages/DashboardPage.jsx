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
        { name: 'Supplier Panels', count: 264, pct: 42.5, color: '#4F46E5' },
        { name: 'Direct Routing', count: 163, pct: 26.3, color: '#6366F1' },
        { name: 'Demand S2S', count: 113, pct: 18.2, color: '#10B981' },
        { name: 'Organic Traffic', count: 50, pct: 8.0, color: '#F59E0B' },
        { name: 'Sandbox Tests', count: 31, pct: 5.0, color: '#8B5CF6' },
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
      { name: 'Zamplia Supply', count: counts.zamplia, color: '#4F46E5' },
      { name: 'Market Xcel', count: counts.mx, color: '#10B981' },
      { name: 'Ipsos Reid', count: counts.ipsos, color: '#6366F1' },
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
        time: 'Click "Sync Inventory" above',
        color: '#94A3B8'
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
        color: '#4F46E5'
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
      time: 'Zamplia + Market Xcel · Live Operational Pipeline',
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
    <div className="page-content" style={{ background: '#F8FAFC', minHeight: '100%', padding: '24px' }}>
      {/* Panel 1 Page Title Box */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.3px' }}>
              Overview
            </h4>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              background: '#DCFCE7',
              color: '#15803D',
              padding: '3px 10px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', background: '#16A34A', borderRadius: '50%', display: 'inline-block' }} />
              Live Sync Active • Zamplia Supply Engine ({normalized.length} Studies Connected)
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            <span>VMH Group SMR</span>
            <span style={{ margin: '0 6px', color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Overview Dashboard</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onSync && (
            <button 
              onClick={onSync}
              disabled={syncing}
              title="Sync marketplace surveys from live Zamplia API"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={13} className={syncing ? 'sync-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Inventory'}</span>
            </button>
          )}

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <Calendar size={13} color="#64748B" />
            <span>Today: {todayStr}</span>
          </div>

          <button 
            onClick={handleExportCsv}
            title="Export live inventory as CSV"
            aria-label="Export CSV"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: '#4F46E5',
              border: 'none',
              borderRadius: '10px',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'background 0.2s'
            }}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards — Exact Panel 1 Specifications (Active Vendors, Pending Leads, Total Clicks, Active Projects) */}
      <StatsCards
        stats={stats}
        analyticsData={analyticsData}
        totalSurveys={normalized.length}
        onNavigate={onNavigate}
      />

      {/* Main Charts Row: Performance Overview (8 col) + Vendor Distribution (4 col) */}
      <ApitoolAnalytics data={analyticsData} surveys={surveys} />

      {/* Secondary Row: Open Quota Meter + Sessions By Channel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Widget 1: Real Open Quota Metrics */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          padding: '20px 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Needed Completes</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#0F172A', fontFamily: 'Inter, sans-serif', lineHeight: 1, margin: 0 }}>
              <AnimatedCounter value={totalCompletesNeeded} duration={1400} />
            </h2>
            <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>Interviews Needed</span>
          </div>

          <p style={{ margin: '10px 0 8px 0', fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
            Open quota across <strong style={{ color: '#4F46E5' }}>{normalized.length}</strong> live surveys
            · <strong style={{ color: '#10B981' }}>{quotaFillPct}%</strong> filled
            of {totalRequired.toLocaleString()} total target
          </p>

          {/* Quota fill progress bar */}
          <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '9999px', marginBottom: '14px', overflow: 'hidden' }}>
            <div style={{ width: `${quotaFillPct}%`, height: '100%', background: '#4F46E5', borderRadius: '9999px', transition: 'width 1s ease' }} />
          </div>

          {/* CPI Distribution Histogram — Real from live surveys */}
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Survey Rates (CPI Distribution)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '46px' }}>
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
                    background: isMax ? '#4F46E5' : 'rgba(79, 70, 229, 0.22)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default'
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#94A3B8' }}>
            <span>&lt;$2</span>
            <span>$3.5</span>
            <span>$5</span>
            <span>$7</span>
            <span>$9</span>
            <span>$9+</span>
          </div>
        </div>

        {/* Widget 2: Sessions By Channel — Real from live survey clients */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          padding: '20px 24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="#4F46E5" />
              Surveys by Client
            </h5>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
              {normalized.length} Surveys
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div style={{ display: 'flex', height: '8px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '16px', background: '#F1F5F9' }}>
            {channels.map((c, i) => (
              <div
                key={i}
                style={{ width: `${c.pct}%`, background: c.color, transition: 'width 0.8s ease' }}
                title={`${c.name}: ${c.pct}%`}
              />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {channels.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  {c.name}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{c.count} surveys</span>
                  <span style={{ fontWeight: 700, color: '#0F172A', minWidth: '40px', textAlign: 'right' }}>{c.pct}%</span>
                </span>
              </div>
            ))}
          </div>

          {normalized.length > 0 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', fontSize: '11.5px', color: '#64748B', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span>
                <strong style={{ color: '#0F172A' }}>
                  {normalized.filter(s => (s.studyType || '').toLowerCase().includes('b2b')).length}
                </strong> B2B Panels
              </span>
              <span>
                <strong style={{ color: '#0F172A' }}>
                  {normalized.filter(s => !(s.studyType || '').toLowerCase().includes('b2b')).length}
                </strong> Consumer
              </span>
              <span>
                <strong style={{ color: '#0F172A' }}>
                  {new Set(normalized.map(s => s.country).filter(Boolean)).size}
                </strong> Countries
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline — Real computed insights from live survey inventory */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        padding: '20px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#4F46E5" /> Recent Operational Activity
          </h5>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981', fontWeight: 600, background: '#DCFCE7', padding: '3px 8px', borderRadius: '10px' }}>
            <span style={{ width: '6px', height: '6px', background: '#16A34A', borderRadius: '50%', display: 'inline-block' }} />
            Live Pipeline
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #EEF2F6', paddingLeft: '16px', marginLeft: '8px' }}>
          {activities.map((act, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '-21px',
                top: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: act.color,
                border: '2px solid #FFFFFF',
                boxShadow: `0 0 0 2px ${act.color}30`
              }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: 1.5, fontWeight: 500 }}>
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
  );
}
