import React from 'react';
import { Database, DollarSign, CheckCircle2, Building2, TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';
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

  const liveCapacityPct = liveStudies > 0 ? Math.min(100, Math.round((liveStudies / Math.max(totalStudies, 1)) * 100)) : 100;
  const cpiBenchmarkPct = Math.min(100, Math.max(15, Math.round((avgCpi / 8) * 100)));

  const cardItems = [
    {
      title: 'Total Surveys',
      numericValue: totalStudies,
      trend: liveStudies > 0 ? `${liveCapacityPct}%` : '—',
      trendLabel: 'Live Capacity',
      isPositive: true,
      icon: Database,
      clickable: true,
      hint: `Explore ${totalStudies.toLocaleString()} surveys`,
      onClick: () => onNavigate && onNavigate('surveys'),
      accent: '#2563eb',
      bgLight: '#F8FAFC',
      borderLight: '#E2E8F0',
      barPct: liveCapacityPct,
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
      hint: 'Inspect rate matrix',
      onClick: () => onNavigate && onNavigate('surveys'),
      accent: '#059669',
      bgLight: '#ecfdf5',
      borderLight: '#d1fae5',
      barPct: cpiBenchmarkPct,
    },
    {
      title: 'Active Surveys',
      numericValue: liveStudies,
      trend: 'Open Quotas',
      trendLabel: 'Accepting Traffic',
      isPositive: true,
      icon: CheckCircle2,
      clickable: true,
      hint: `View ${liveStudies.toLocaleString()} active studies`,
      onClick: () => onNavigate && onNavigate('surveys'),
      accent: '#4f46e5',
      bgLight: '#eef2ff',
      borderLight: '#e0e7ff',
      barPct: liveStudies > 0 ? 94 : 0,
    },
    {
      title: 'Connected Clients',
      numericValue: demandSources,
      trend: 'Active S2S',
      trendLabel: 'Demand Sources',
      isPositive: true,
      icon: Building2,
      clickable: true,
      hint: 'Manage client supply',
      onClick: () => onNavigate && onNavigate('clients'),
      accent: '#d97706',
      bgLight: '#fffbeb',
      borderLight: '#fef3c7',
      barPct: demandSources > 0 ? 100 : 0,
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
            onKeyDown={(e) => {
              if (item.clickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                item.onClick && item.onClick();
              }
            }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Top Accent Stripe */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${item.accent}, transparent)`,
              }}
            />

            <div>
              {/* Header: Title + Themed Icon Bubble */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.title}
                </span>

                <div
                  className="kpi-icon-bubble"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: item.bgLight,
                    border: `1px solid ${item.borderLight}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Icon size={18} color={item.accent} />
                </div>
              </div>

              {/* Main Metric Value */}
              <div style={{ marginBottom: '12px' }}>
                <h3
                  className="kpi-value"
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
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

              {/* Trend Badge & Sub-label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '14px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: item.bgLight,
                    color: item.accent,
                    border: `1px solid ${item.borderLight}`,
                  }}
                >
                  {item.isPositive ? (
                    <TrendingUp size={11} strokeWidth={2.5} />
                  ) : (
                    <TrendingDown size={11} strokeWidth={2.5} />
                  )}
                  {item.trend}
                </span>
                <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 500 }}>
                  {item.trendLabel}
                </span>
              </div>
            </div>

            {/* Micro Progress Bar & Action Footer */}
            <div>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: '#f1f5f9',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    width: `${item.barPct}%`,
                    height: '100%',
                    background: item.accent,
                    borderRadius: '999px',
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>

              {item.clickable && (
                <div
                  className="kpi-action-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: item.accent,
                    paddingTop: '4px',
                  }}
                >
                  <span>{item.hint}</span>
                  <ArrowRight size={12} className="kpi-arrow-icon" style={{ transition: 'transform 0.2s ease' }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
