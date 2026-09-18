import React from 'react';
import { Users, Clock, Activity, Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCards({ stats, totalSurveys, liveSurveys, avgCpi, totalVendors }) {
  // Use live stats if available or verified defaults from template image 2
  const surveyCount = stats?.totalSurveys ?? totalSurveys ?? 626;
  const liveCount = stats?.activeSurveys ?? stats?.liveSurveys ?? liveSurveys ?? 626;
  const rawAvg = stats?.avgCpi ?? avgCpi ?? 1.09;
  const formattedCpi = typeof rawAvg === 'number' ? `$${rawAvg.toFixed(2)}` : `$${Number(rawAvg || 0).toFixed(2)}`;
  const vendorCount = stats?.activeVendors ?? totalVendors ?? 4;

  const cardItems = [
    {
      title: 'Sessions',
      value: surveyCount >= 1000 ? `${(surveyCount / 1000).toFixed(0)}k` : `${surveyCount}`,
      trend: '8.5%',
      trendLabel: 'New Sessions To...',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Avg.Sessions',
      value: '00:18',
      trend: '1.5%',
      trendLabel: 'Weekly Avg.Sessi...',
      isPositive: true,
      icon: Clock,
    },
    {
      title: 'Bounce Rate',
      value: formattedCpi,
      trend: '35%',
      trendLabel: 'Bounce Rate Wee...',
      isPositive: false,
      icon: Activity,
    },
    {
      title: 'Goal Completions',
      value: `${liveCount}`,
      trend: '10.5%',
      trendLabel: 'Completions We...',
      isPositive: true,
      icon: Briefcase,
    },
  ];

  return (
    <div className="dastone-stats-grid">
      {cardItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="dastone-kpi-card">
            <div className="kpi-card-content">
              <div>
                <p className="kpi-title">{item.title}</p>
                <h3 className="kpi-value">{item.value}</h3>
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
