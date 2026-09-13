import React from 'react';
import { Layers, Radio, DollarSign, Users } from 'lucide-react';

export default function StatsCards({ stats, totalSurveys, liveSurveys, avgCpi, totalVendors }) {
  const finalTotal = stats?.totalSurveys ?? totalSurveys ?? 0;
  const finalLive = stats?.activeSurveys ?? stats?.liveSurveys ?? liveSurveys ?? finalTotal;
  const rawAvg = stats?.avgCpi ?? avgCpi ?? 0;
  const finalAvg = typeof rawAvg === 'number' ? rawAvg.toFixed(2) : Number(rawAvg || 0).toFixed(2);
  const finalVendors = stats?.activeVendors ?? totalVendors ?? 4;

  const cardItems = [
    {
      title: 'Total Surveys',
      value: finalTotal.toLocaleString(),
      icon: Layers,
      color: '#4338CA',
      bg: '#EEF2FF',
    },
    {
      title: 'Live Allocations',
      value: finalLive.toLocaleString(),
      icon: Radio,
      color: '#00C851',
      bg: '#ECFDF5',
    },
    {
      title: 'Average CPI',
      value: `$${finalAvg}`,
      icon: DollarSign,
      color: '#D97706',
      bg: '#FFFBEB',
    },
    {
      title: 'Active Panels',
      value: finalVendors,
      icon: Users,
      color: '#0284C7',
      bg: '#EFF6FF',
    },
  ];

  return (
    <div className="stats-grid">
      {cardItems.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="stat-card">
            <div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: stat.bg, color: stat.color }}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
