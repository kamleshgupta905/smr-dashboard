import React from 'react';
import { Database, DollarSign, CheckCircle2, Building2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

export default function StatsCards({ stats, totalSurveys, onNavigate }) {
  // Real metrics derived from the live marketplace inventory
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
      accentColor: '#1761fd',
      clickable: true,
      hint: `View ${totalStudies} surveys`,
      onClick: () => onNavigate && onNavigate('surveys'),
    },
    {
      title: 'Avg. Rate (CPI)',
      numericValue: avgCpi,
      prefix: '$',
      decimals: 2,
      trend: avgCpi >= 3 ? 'High' : 'Normal',
      trendLabel: 'Per Complete',
      isPositive: avgCpi >= 3,
      icon: DollarSign,
      accentColor: '#2a76f4',
      clickable: true,
      hint: 'View surveys',
      onClick: () => onNavigate && onNavigate('surveys'),
    },
    {
      title: 'Active Surveys',
      numericValue: liveStudies,
      trend: 'Open',
      trendLabel: 'Accepting Responses',
      isPositive: true,
      icon: CheckCircle2,
      accentColor: '#22c55e',
      clickable: true,
      hint: `View ${liveStudies} active surveys`,
      onClick: () => onNavigate && onNavigate('surveys'),
    },
    {
      title: 'Connected Clients',
      numericValue: demandSources,
      trend: 'Connected',
      trendLabel: 'Active Sources',
      isPositive: true,
      icon: Building2,
      accentColor: '#f59e0b',
      clickable: true,
      hint: 'View clients',
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
                    color: item.accentColor || '#1761fd',
                    cursor: 'pointer'
                  }}>
                    <span>{item.hint}</span>
                    <ArrowRight size={11} />
                  </div>
                )}
              </div>

              {/* Exact Dastone Circular Soft Icon Bubble */}
              <div
                className="kpi-icon-bubble"
                style={{
                  backgroundColor: `${item.accentColor}14`,
                  color: item.accentColor
                }}
              >
                <Icon size={20} color={item.accentColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
