import React, { useState, useEffect } from 'react';
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

  // VMH Platform Endpoints Performance
  const pagesViewList = [
    { title: 'VMH SMR - Live Router & Yield Matrix', path: '/router/live-yield', views: '5.4k', pct: 95 },
    { title: 'VMH Zamplia Allocations & Quotas', path: '/zamplia/inventory', views: '4.8k', pct: 88 },
    { title: 'VMH Supply Panels & Entry Feeds', path: '/partners/vendors', views: '3.2k', pct: 64 },
    { title: 'VMH Demand S2S API Gateway', path: '/clients/s2s-stream', views: '2.1k', pct: 42 }
  ];

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

  // Browser Used & Traffic Reports
  const browserReports = [
    { browser: 'Chrome', sessions: '10853 (52%)', bounce: '52.8%', transactions: '566 (92%)' },
    { browser: 'Microsoft Edge', sessions: '2545 (47%)', bounce: '47.54%', transactions: '498 (81%)' },
    { browser: 'Internet-Explorer', sessions: '1836 (38%)', bounce: '41.12%', transactions: '455 (74%)' },
    { browser: 'Opera', sessions: '1958 (31%)', bounce: '36.82%', transactions: '361 (61%)' }
  ];

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

          {/* Download Button */}
          <button className="btn-title-download" title="Export / Download">
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <StatsCards stats={stats} totalSurveys={normalized.length} onNavigate={onNavigate} />

      {/* Main Charts Row: Audience Overview (8 col) + Sessions Device (4 col) */}
      <ApitoolAnalytics data={analyticsData} />

      {/* Secondary Row: Live Concurrency ("80 Right Now") + Pages View By Users + Sessions By Channel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Widget 1: Concurrency Meter ("80 Right Now") - 4 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 4' }}>
          <div className="card-body" style={{ padding: '16px' }}>
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

        {/* Widget 2: Pages View By Users - 4 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 4' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="card-title">Pages View By Users</h4>
              <span style={{ fontSize: '11px', color: '#1761fd', fontWeight: 600 }}>Today</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pagesViewList.map((p, idx) => (
                <div key={idx} style={{ position: 'relative', padding: '6px 8px', borderRadius: '4px', background: '#fafbfd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#1d2c48', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                      {p.title}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1761fd' }}>{p.views}</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#8997bd' }}>{p.path}</span>
                  <div style={{ width: '100%', height: '3px', background: '#e3ebf6', borderRadius: '9999px', marginTop: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.pct}%`, height: '100%', background: '#1761fd', borderRadius: '9999px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 3: Sessions By Channel - 4 cols */}
        <div className="card report-card" style={{ gridColumn: 'span 4' }}>
          <div className="card-body" style={{ padding: '16px' }}>
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

        {/* Browser Used & Traffic Reports Table (8 cols) */}
        <div className="card report-card" style={{ gridColumn: 'span 8' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="card-title">Browser Used & Traffic Reports</h4>
              <span style={{ fontSize: '11px', color: '#1761fd', fontWeight: 600 }}>Active Protocols</span>
            </div>

            <div className="table-wrapper" style={{ border: 'none' }}>
              <table style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Browser</th>
                    <th>Sessions</th>
                    <th>Bounce Rate</th>
                    <th>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {browserReports.map((b, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: '#1d2c48' }}>{b.browser}</td>
                      <td>{b.sessions}</td>
                      <td style={{ color: '#dc2626' }}>{b.bounce}</td>
                      <td style={{ fontWeight: 600, color: '#16a34a' }}>{b.transactions}</td>
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
                          {survey.country_code || 'US'} &bull; Zamplia
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '3px', color: '#8997bd' }}>
                          <span>Fulfillment</span>
                          <span>{survey.completes || 18}/{survey.quota || 50}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#f1f5fa', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, ((survey.completes || 18)/(survey.quota || 50))*100)}%`, height: '100%', background: '#1761fd' }} />
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => onNavigate('surveys')}
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
