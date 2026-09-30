import React, { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCards';
import ApitoolAnalytics from '../components/ApitoolAnalytics';
import { getDashboardAnalytics } from '../services/api';
import { normalizeSurveys } from '../utils/normalize';
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Clock, 
  CheckCircle2,
  DollarSign,
  Share2,
  FileText,
  Radio,
  Calendar,
  Download
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

  const normalized = normalizeSurveys(surveys);

  // Sessions By Channel
  const channels = [
    { name: 'Supplier Panels', pct: 42.5, color: '#1761fd' },
    { name: 'Direct Routing', pct: 26.3, color: '#2a76f4' },
    { name: 'Demand S2S', pct: 18.2, color: '#22c55e' },
    { name: 'Organic Traffic', pct: 8.0, color: '#f59e0b' },
    { name: 'Sandbox Tests', pct: 5.0, color: '#8b5cf6' }
  ];

  // Activity Timeline (Live VMH Operations)
  const activities = [
    { text: 'Dynata Global Panel completed 140 interviews on US Beverage Tracker (#PRJ-2026-01)', time: '8 Min ago', color: '#1761fd' },
    { text: 'Zamplia Supply Engine auto-synced 626 live high-yield surveys with fresh quotas', time: '25 Min ago', color: '#22c55e' },
    { text: 'Security Engine automatically blocked suspicious VPN/Proxy attempt (Risk Score: 98)', time: '1 hour ago', color: '#f59e0b' }
  ];

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Export inventory as CSV
  const handleExportCsv = () => {
    const headers = ['Survey ID', 'Title', 'Country', 'CPI', 'LOI', 'IR', 'Required'];
    const rows = normalized.map(s => [
      s.survey_id,
      `"${String(s.survey_name || '').replace(/"/g, '""')}"`,
      s.country,
      s.cpi,
      s.loi,
      s.ir,
      s.TotalCompleteRequired || s.target_completes || '',
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
      <ApitoolAnalytics data={analyticsData} surveys={surveys} />

      {/* Secondary Row: Live Concurrency ("80 Right Now") + Sessions By Channel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Widget 1: Concurrency Meter ("80 Right Now") - 6 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 6' }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '12px', color: '#8997bd', fontWeight: 500 }}>Traffic Sources</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins', lineHeight: 1 }}>80</h2>
              <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>Right now</span>
            </div>

            <p style={{ margin: '8px 0 14px 0', fontSize: '11.5px', color: '#8997bd', lineHeight: 1.5 }}>
              Active respondents currently routing through Zamplia & Market Xcel endpoints.
            </p>

            {/* Rolling Mini Histogram */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '42px', paddingTop: '6px' }}>
              {[35, 45, 60, 52, 70, 65, 80, 75, 88, 70, 85, 92, 78, 85, 95, 80, 84, 90, 80].map((val, i) => (
                <div 
                  key={i} 
                  style={{ 
                    flex: 1, 
                    height: `${val}%`, 
                    background: i === 18 ? '#1761fd' : 'rgba(23, 97, 253, 0.25)', 
                    borderRadius: '2px' 
                  }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Widget 2: Sessions By Channel - 6 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 6' }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="card-title">Sessions By Channel</h4>
              <span style={{ fontSize: '11px', color: '#8997bd' }}>30 Days</span>
            </div>

            {/* Segmented Progress Bar */}
            <div style={{ display: 'flex', height: '8px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px', background: '#f1f5fa' }}>
              {channels.map((c, i) => (
                <div key={i} style={{ width: `${c.pct * 2.5}%`, background: c.color }} title={`${c.name}: ${c.pct}%`} />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {channels.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#303e67' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
                    {c.name}
                  </span>
                  <span style={{ fontWeight: 700, color: '#1d2c48' }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card report-card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#1761fd" /> Activity Timeline
            </h4>
            <span style={{ fontSize: '11px', color: '#8997bd', fontWeight: 600 }}>All Activities</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '2px solid #e3ebf6', paddingLeft: '16px', marginLeft: '8px' }}>
            {activities.map((act, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '-21px', 
                  top: '2px', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: act.color,
                  border: '2px solid #ffffff' 
                }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#303e67', lineHeight: 1.4, fontWeight: 500 }}>
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
