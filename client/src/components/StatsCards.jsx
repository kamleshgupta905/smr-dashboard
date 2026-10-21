import React from 'react';
import { Database, DollarSign, CheckCircle2, Building2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

export default function StatsCards({ stats, totalSurveys, onNavigate }) {
  // Real metrics derived from the live marketplace inventory (App.jsx computes these)
  const totalStudies = (stats?.totalSurveys && stats.totalSurveys > 0)
    ? stats.totalSurveys
    : (totalSurveys || 0);

  const liveStudies = (stats?.activeSurveys && stats.activeSurveys > 0)
    ? stats.activeSurveys
    : totalStudies;

  const avgCpi = (stats?.avgCpi && stats.avgCpi > 0) ? stats.avgCpi : 0;
  const demandSources = (stats?.activeVendors && stats.activeVendors > 0) ? stats.activeVendors : 0;

  const cardItems = [
    {
      title: 'Total Surveys',
      numericValue: totalStudies,
      trend: liveStudies > 0 ? `${Math.round((liveStudies / Math.max(totalStudies, 1)) * 100)}%` : '—',
      trendLabel: 'Live Capacity',
      isPositive: true,
      icon: Database,
      clickable: true,
      hint: `View ${totalStudies} surveys`,
      onClick: () => onNavigate && onNavigate('surveys'),
      microGraphic: 'bars',
    },
    {
      title: 'Avg. Rate (CPI)',
      numericValue: avgCpi,
      prefix: '$',
      decimals: 2,
      trend: avgCpi >= 3 ? 'High Yield' : 'Standard',
      trendLabel: 'Per Complete',
      isPositive: avgCpi >= 3,
      icon: DollarSign,
      clickable: true,
      hint: 'View yield rates',
      onClick: () => onNavigate && onNavigate('surveys'),
      microGraphic: 'sparkline',
    },
    {
      title: 'Active Surveys',
      numericValue: liveStudies,
      trend: 'Open',
      trendLabel: 'Accepting Traffic',
      isPositive: true,
      icon: CheckCircle2,
      clickable: true,
      hint: `View ${liveStudies} active studies`,
      onClick: () => onNavigate && onNavigate('surveys'),
      microGraphic: 'ring',
    },
    {
      title: 'Connected Partners',
      numericValue: demandSources,
      trend: 'Live Synced',
      trendLabel: 'Active Routing Sources',
      isPositive: true,
      icon: Building2,
      clickable: true,
      hint: 'Manage partners',
      onClick: () => onNavigate && onNavigate('clients'),
      microGraphic: 'network',
    },
  ];

  return (
    <div className="dastone-stats-grid">
      {cardItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`dastone-kpi-card ${item.clickable ? 'clickable-kpi-card' : ''}`}
            onClick={item.onClick}
            title={item.clickable ? item.hint : undefined}
            role={item.clickable ? 'button' : undefined}
            tabIndex={item.clickable ? 0 : undefined}
            onKeyDown={(e) => { if (item.clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); item.onClick && item.onClick(); } }}
          >
            {/* Top Row: Title + Icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="kpi-title" style={{ margin: 0 }}>
                {item.title}
              </span>
              <div className="kpi-icon-bubble" style={{ width: '36px', height: '36px' }}>
                <Icon size={18} />
              </div>
            </div>

            {/* Middle Row: Large Value + Visual Telemetry Micro-Graphic */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
              <div>
                <h3 className="kpi-value" style={{ margin: 0 }}>
                  {item.numericValue > 0 || item.numericValue === 0 ? (
                    <AnimatedCounter
                      value={item.numericValue}
                      prefix={item.prefix || ''}
                      suffix={item.suffix || ''}
                      decimals={item.decimals || 0}
                    />
                  ) : (
                    '—'
                  )}
                </h3>
              </div>

              {/* Linear-Style Micro Telemetry Visual */}
              <div style={{ width: '48px', height: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                {item.microGraphic === 'bars' && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '22px' }}>
                    <span style={{ width: '4px', height: '40%', background: 'rgba(99, 102, 241, 0.4)', borderRadius: '2px' }} />
                    <span style={{ width: '4px', height: '65%', background: 'rgba(99, 102, 241, 0.6)', borderRadius: '2px' }} />
                    <span style={{ width: '4px', height: '50%', background: 'rgba(99, 102, 241, 0.8)', borderRadius: '2px' }} />
                    <span style={{ width: '4px', height: '100%', background: '#6366F1', borderRadius: '2px', boxShadow: '0 0 6px rgba(99, 102, 241, 0.6)' }} />
                  </div>
                )}
                {item.microGraphic === 'sparkline' && (
                  <svg width="48" height="22" viewBox="0 0 48 22" fill="none">
                    <path
                      d="M2 18 C 10 16, 16 6, 24 10 C 32 14, 38 4, 46 3"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="46" cy="3" r="2.5" fill="#10B981" />
                  </svg>
                )}
                {item.microGraphic === 'ring' && (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2.5" fill="none" />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#6366F1"
                      strokeWidth="2.5"
                      strokeDasharray="56.5"
                      strokeDashoffset="12"
                      strokeLinecap="round"
                      fill="none"
                      transform="rotate(-90 12 12)"
                    />
                  </svg>
                )}
                {item.microGraphic === 'network' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06B6D4', boxShadow: '0 0 6px #06B6D4' }} />
                    <span style={{ width: '12px', height: '1.5px', background: 'rgba(6, 182, 212, 0.5)' }} />
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366F1', boxShadow: '0 0 6px #6366F1' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Trend Pill + Action Link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div className="kpi-trend-row">
                <span className={`kpi-trend-pct ${item.isPositive ? 'positive' : 'negative'}`}>
                  {item.isPositive ? (
                    <TrendingUp size={11} className="trend-arrow" />
                  ) : (
                    <TrendingDown size={11} className="trend-arrow" />
                  )}
                  {item.trend}
                </span>
                <span className="kpi-trend-label">{item.trendLabel}</span>
              </div>

              {item.clickable && (
                <div
                  className="kpi-action-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <span>{item.hint}</span>
                  <ArrowRight size={11} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
