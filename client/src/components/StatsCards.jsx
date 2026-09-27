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
      trendLabel: 'Allocation Filled',
      isPositive: true,
      icon: Database,
      clickable: true,
      hint: `View ${totalStudies} studies`,
      onClick: () => onNavigate && onNavigate('surveys'),
    },
    {
      title: 'Avg. CPI',
      numericValue: avgCpi,
      prefix: '$',
      decimals: 2,
      trend: avgCpi >= 3 ? 'High Yield' : 'Standard',
      trendLabel: 'Revenue / Complete',
      isPositive: avgCpi >= 3,
      icon: DollarSign,
      clickable: true,
      hint: 'Inspect Live Surveys',
      onClick: () => onNavigate && onNavigate('surveys'),
    },
    {
      title: 'Live Inventory',
      numericValue: liveStudies,
      trend: 'Open',
      trendLabel: 'Accepting Traffic',
      isPositive: true,
      icon: CheckCircle2,
      clickable: true,
      hint: `Inspect ${liveStudies} live quotas`,
      onClick: () => onNavigate && onNavigate('surveys'),
    },
    {
      title: 'Demand Sources',
      numericValue: demandSources,
      trend: 'Connected',
      trendLabel: 'Zamplia + Market Xcel',
      isPositive: true,
      icon: Building2,
      clickable: true,
      hint: 'Manage clients',
      onClick: () => onNavigate && onNavigate('clients'),
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
            <div className="kpi-card-content">
              <div>
                <p className="kpi-title">{item.title}</p>
                <h3 className="kpi-value">
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
                <div className="kpi-trend-row">
                  <span className={`kpi-trend-pct ${item.isPositive ? 'positive' : 'negative'}`}>
                    {item.isPositive ? (
                      <TrendingUp size={12} className="trend-arrow" />
                    ) : (
                      <TrendingDown size={12} className="trend-arrow" />
                    )}
                    {item.trend}
                  </span>
                  <span className="kpi-trend-label">{item.trendLabel}</span>
                </div>

                {item.clickable && (
                  <div className="kpi-action-link" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#1761fd',
                    cursor: 'pointer'
                  }}>
                    <span>{item.hint}</span>
                    <ArrowRight size={11} />
                  </div>
                )}
              </div>

              {/* Circular Soft Icon Bubble (Exact Match to Image 2) */}
              <div className="kpi-icon-bubble">
                <Icon size={20} color="#9ba7ca" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
