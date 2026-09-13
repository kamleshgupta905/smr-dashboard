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
  FileText
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
    .slice(0, 8);

  return (
    <div>
      {/* Top Clean Solid Banner (NO GRADIENTS) */}
      <div className="card" style={{
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: '#ECFDF5', 
              color: '#059669', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid #A7F3D0'
            }}>
              <Zap size={14} /> Zamplia Supply Engine
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              • 16 APIs Active & Connected
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em', color: '#0F172A' }}>
            Survey Marketplace & Traffic Router
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', maxWidth: '640px' }}>
            Real-time survey inventory allocations, sub-5ms vendor redirection, HMAC-SHA256 callback security, and capacity monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => onNavigate('top-picks')}
            id="dash-btn-top-picks"
          >
            <TrendingUp size={15} /> Top Picks
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onNavigate('surveys')}
            id="dash-btn-all-surveys"
          >
            <Layers size={15} /> View All Surveys
          </button>
        </div>
      </div>

      {/* VMH Executive Analytics: 4 Sparkline Cards, Performance Bar Chart, Vendor Distribution Donut Chart */}
      <ApitoolAnalytics data={analyticsData} />

      {/* Zamplia Survey Inventory Stat Cards */}
      <div style={{ marginBottom: '14px', marginTop: '10px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="#059669" /> Live Zamplia Survey Marketplace Metrics
        </h3>
      </div>
      <StatsCards stats={stats} totalSurveys={normalized.length} />

      {/* Grid: High-Yield Surveys & System Health */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '22px',
        marginTop: '8px'
      }}>
        {/* Left Column: Top High-Yield Surveys */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A' }}>
                <TrendingUp size={17} color="#00C851" /> Top Paying Surveys (High CPI)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Highest revenue inventory fetched directly from Zamplia Supply API
              </p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('surveys')}
            >
              See All <ArrowRight size={13} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
              Loading top survey inventory...
            </div>
          ) : topSurveys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No surveys found. Click "Sync Zamplia" in the top bar to fetch live surveys!
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Survey / PID</th>
                    <th>Country</th>
                    <th>LOI</th>
                    <th>IR</th>
                    <th>CPI</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topSurveys.map(s => (
                    <tr key={s.survey_id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                          {s.survey_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>
                          PID: {s.survey_id}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{s.country}</span>
                      </td>
                      <td style={{ color: 'var(--text-body)' }}>
                        <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#64748B' }} />
                        {s.loi}m
                      </td>
                      <td style={{ color: 'var(--text-body)' }}>
                        {s.ir}%
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: 800, 
                          color: '#00C851', 
                          fontSize: '15px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <DollarSign size={14} />
                          {s.cpi.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            title="View Quotas"
                            onClick={() => onOpenQuotas(s.survey_id)}
                          >
                            Quotas
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            title="View Qualifications"
                            onClick={() => onOpenQuals(s.survey_id)}
                          >
                            <FileText size={13} /> Quals
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            title="Assign to Vendor"
                            onClick={() => onOpenAssign(s.survey_id)}
                          >
                            <Share2 size={13} /> Link
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Engine Features & Architecture */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A' }}>
            <Activity size={17} color="#00C851" /> Engine Architecture
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              padding: '12px 14px', 
              background: '#F8FAFC', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Zamplia Supply APIs</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Discovery, Quotas, Quals, Links</div>
              </div>
              <span className="badge badge-success">
                <CheckCircle2 size={12} style={{ marginRight: '3px' }} /> 16 / 16 Live
              </span>
            </div>

            <div style={{ 
              padding: '12px 14px', 
              background: '#F8FAFC', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Traffic Redirection</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sub-5ms vendor auth & router</div>
              </div>
              <span className="badge badge-success">Active</span>
            </div>

            <div style={{ 
              padding: '12px 14px', 
              background: '#F8FAFC', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Security & Hash</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>HMAC-SHA256 timing-safe</div>
              </div>
              <span className="badge badge-info">
                <ShieldCheck size={12} style={{ marginRight: '3px' }} /> Verified
              </span>
            </div>

            <div style={{ 
              padding: '12px 14px', 
              background: '#F8FAFC', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Background Auto-Sync</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Every 15 min cron worker</div>
              </div>
              <span className="badge badge-purple">Scheduled</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vendor Inbound Route Formula
            </h4>
            <div style={{ 
              background: '#F1F5F9', 
              padding: '10px 12px', 
              borderRadius: '6px', 
              fontFamily: 'monospace', 
              fontSize: '11.5px',
              color: '#0F172A',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border-color)'
            }}>
              /vendor/auth/:vendor_id/project/:project_id?rid=RID
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Passes respondent into live survey link, creates internal lead, and attaches return tracking callbacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
