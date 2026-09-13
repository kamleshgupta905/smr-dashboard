import React, { useState } from 'react';

// Smooth SVG Sparkline Component
function Sparkline({ data, color, height = 50 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 240;
  const step = width / (data.length - 1);

  const points = data.map((val, idx) => {
    const x = idx * step;
    const y = height - ((val - min) / range) * (height - 12) - 6;
    return { x, y };
  });

  // Create smooth bezier curve path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const gradientId = `grad_${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradientId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ApitoolAnalytics({ data }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const totalVendors = data?.totalVendors ?? 60;
  const pendingLeads = data?.pendingLeads ?? 10166;
  const totalClick = data?.totalClick ?? 22284;
  const activeProjects = data?.activeProjects ?? 1342;

  // Sample or live sparkline trends
  const sparkline1 = [52, 54, 53, 57, 59, 58, totalVendors];
  const sparkline2 = [9400, 9800, 9650, 10050, 9980, 10210, pendingLeads];
  const sparkline3 = [18500, 19200, 20100, 21050, 21600, 21950, totalClick];
  const sparkline4 = [1210, 1250, 1280, 1310, 1290, 1325, activeProjects];

  // Bar Chart Data
  const rawChartData = data?.chartData || {
    'Project Alpha': 3420,
    'Consumer Pulse': 4280,
    'Global Healthcare': 2890,
    'Tech Leaders': 5120,
    'Automotive Study': 3820,
    'Finance Matrix': 2754
  };

  const barLabels = Object.keys(rawChartData);
  const barValues = Object.values(rawChartData);
  const maxBarValue = Math.max(...barValues, 1000);

  // Donut Chart Data
  const donutData = data?.donutChartData || [
    { category: 'Vendors', value: totalVendors },
    { category: 'Projects', value: activeProjects },
    { category: 'Leads', value: totalClick }
  ];

  const donutTotal = donutData.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
  const donutColors = ['#4F46E5', '#6366F1', '#10B981', '#F59E0B'];

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* 4 TOP METRIC CARDS WITH SPARKLINE WAVES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Card 1: Active Vendors */}
        <div className="card" style={{
          padding: '18px 20px 12px 20px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          transition: 'transform 0.25s, box-shadow 0.25s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Active Vendors</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{totalVendors.toLocaleString()}</span>
          </div>
          <Sparkline data={sparkline1} color="#4F46E5" height={45} />
        </div>

        {/* Card 2: Pending Leads */}
        <div className="card" style={{
          padding: '18px 20px 12px 20px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          transition: 'transform 0.25s, box-shadow 0.25s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Pending Leads</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{pendingLeads.toLocaleString()}</span>
          </div>
          <Sparkline data={sparkline2} color="#F59E0B" height={45} />
        </div>

        {/* Card 3: Total Clicks */}
        <div className="card" style={{
          padding: '18px 20px 12px 20px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          transition: 'transform 0.25s, box-shadow 0.25s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Total Clicks</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{totalClick.toLocaleString()}</span>
          </div>
          <Sparkline data={sparkline3} color="#10B981" height={45} />
        </div>

        {/* Card 4: Active Projects */}
        <div className="card" style={{
          padding: '18px 20px 12px 20px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          transition: 'transform 0.25s, box-shadow 0.25s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Active Projects</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{activeProjects.toLocaleString()}</span>
          </div>
          <Sparkline data={sparkline4} color="#EF4444" height={45} />
        </div>
      </div>

      {/* CHARTS ROW: Performance Overview Bar Chart & Vendor Distribution Donut Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Performance Overview Bar Chart */}
        <div className="card" style={{
          gridColumn: 'span 2',
          padding: '24px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Performance Overview</h3>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Clicks per Project</span>
          </div>

          <div style={{ flex: 1, minHeight: '220px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '10px', position: 'relative' }}>
            {barLabels.map((label, idx) => {
              const val = barValues[idx];
              const heightPercent = Math.max(12, Math.round((val / maxBarValue) * 100));
              const isHovered = hoveredBar === idx;

              return (
                <div 
                  key={idx} 
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      bottom: `${heightPercent + 14}%`,
                      background: '#0F172A',
                      color: '#FFFFFF',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      pointerEvents: 'none'
                    }}>
                      {val.toLocaleString()} clicks
                    </div>
                  )}
                  <div style={{
                    width: '100%',
                    maxWidth: '32px',
                    height: `${heightPercent}%`,
                    background: isHovered 
                      ? 'linear-gradient(180deg, #4338CA 0%, #312E81 100%)' 
                      : 'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)',
                    borderRadius: '10px 10px 4px 4px',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer'
                  }} />
                  <span style={{
                    marginTop: '10px',
                    fontSize: '11px',
                    color: isHovered ? '#0F172A' : '#64748B',
                    fontWeight: isHovered ? 700 : 500,
                    textAlign: 'center',
                    maxWidth: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={label}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vendor Distribution Donut Chart */}
        <div className="card" style={{
          padding: '24px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Vendor Distribution</h3>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Market Share</span>
          </div>

          {/* SVG Donut Chart with Total in Center */}
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '10px 0' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {(() => {
                let cumulativePercent = 0;
                return donutData.map((item, idx) => {
                  const percent = donutTotal > 0 ? (item.value / donutTotal) : 0;
                  const strokeDasharray = `${percent * 251.2} 251.2`;
                  const strokeDashoffset = `-${cumulativePercent * 251.2}`;
                  cumulativePercent += percent;
                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={donutColors[idx % donutColors.length]}
                      strokeWidth="15"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                  );
                });
              })()}
            </svg>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                {donutTotal.toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Records
              </span>
            </div>
          </div>

          {/* Legends */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px', marginTop: '12px' }}>
            {donutData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: donutColors[idx % donutColors.length]
                }} />
                <span>{item.category}: {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
