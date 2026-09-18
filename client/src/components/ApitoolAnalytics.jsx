import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, ChevronDown } from 'lucide-react';

export default function ApitoolAnalytics({ data }) {
  const [timeframe, setTimeframe] = useState('yearly');
  const [hoverIndex, setHoverIndex] = useState(null);
  const [deviceFilter, setDeviceFilter] = useState('All');

  // Exact Dastone Live Audience Datasets
  const audienceData = {
    today: {
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      newVisits: [25, 40, 80, 140, 210, 190, 150, 90],
      uniqueVisits: [15, 25, 50, 95, 150, 130, 110, 60]
    },
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      newVisits: [120, 150, 190, 175, 230, 160, 140],
      uniqueVisits: [80, 110, 140, 125, 170, 110, 95]
    },
    monthly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      newVisits: [540, 680, 820, 910],
      uniqueVisits: [390, 480, 610, 720]
    },
    yearly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      newVisits: [50, 80, 120, 110, 170, 150, 210, 190, 220, 240, 230, 250],
      uniqueVisits: [30, 50, 85, 75, 120, 105, 150, 135, 160, 180, 170, 195]
    }
  };

  const currentDataset = audienceData[timeframe] || audienceData.yearly;
  const labels = currentDataset.labels;
  const newVisits = currentDataset.newVisits;
  const uniqueVisits = currentDataset.uniqueVisits;

  const maxVal = 250;
  const minVal = 0;
  const range = 250;
  const svgWidth = 720;
  const svgHeight = 230;
  const paddingX = 35;
  const paddingY = 20;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;
  const stepX = chartW / (labels.length - 1);

  // Generate smooth bezier curve path for SVG
  const generatePath = (values) => {
    const points = values.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const y = svgHeight - paddingY - (val / range) * chartH;
      return { x, y };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const fillD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
    return { pathD, fillD, points };
  };

  const newVisitsCurve = generatePath(newVisits);
  const uniqueVisitsCurve = generatePath(uniqueVisits);

  // Exact Live Sessions Device Table Data
  const deviceList = [
    { name: 'Desktops', icon: Monitor, sessions: 1843, day: '-3', week: '-12', color: '#0b51b7' },
    { name: 'Tablets', icon: Tablet, sessions: 2543, day: '-5', week: '-2', color: '#22b783' },
    { name: 'Mobiles', icon: Smartphone, sessions: 3654, day: '-5', week: '-6', color: '#ff9f43' },
  ];

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px',
        alignItems: 'stretch'
      }}>
        {/* Left 8 Columns: Dastone Audience Overview */}
        <div className="card report-card" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column' }}>
          <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <h4 className="card-title">Audience Overview</h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Series Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#303e67' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1761fd' }} />
                    New Visits
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#303e67' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} />
                    Unique Visits
                  </span>
                </div>

                {/* Timeframe Dropdown / Pill Group */}
                <div className="timeframe-group">
                  {['today', 'weekly', 'monthly', 'yearly'].map((t) => (
                    <button 
                      key={t}
                      className={`timeframe-btn ${timeframe === t ? 'active' : ''}`}
                      onClick={() => setTimeframe(t)}
                    >
                      {t === 'yearly' ? 'This Year' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SVG Spline Chart */}
            <div style={{ flex: 1, minHeight: '230px', position: 'relative' }}>
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                style={{ width: '100%', height: '220px', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="vmh_blue_gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1761fd" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1761fd" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines & Y-Axis values */}
                {[0, 50, 100, 150, 200, 250].map((val) => {
                  const y = svgHeight - paddingY - (val / range) * chartH;
                  return (
                    <g key={val}>
                      <text x="12" y={y + 4} fill="#8997bd" fontSize="10.5" fontFamily="Roboto">{val}</text>
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={svgWidth - paddingX} 
                        y2={y} 
                        stroke="#e3ebf6" 
                        strokeDasharray="3 3" 
                        strokeWidth="1" 
                      />
                    </g>
                  );
                })}

                {/* Area Fill */}
                <path d={newVisitsCurve.fillD} fill="url(#vmh_blue_gradient)" />

                {/* Stroke Curves */}
                <path d={newVisitsCurve.pathD} fill="none" stroke="#1761fd" strokeWidth="2.5" strokeLinecap="round" />
                <path d={uniqueVisitsCurve.pathD} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />

                {/* Data Points on Hover */}
                {newVisitsCurve.points.map((p, idx) => (
                  <g 
                    key={idx} 
                    onMouseEnter={() => setHoverIndex(idx)}
                    onMouseLeave={() => setHoverIndex(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx={p.x} cy={p.y} r={hoverIndex === idx ? 5 : 3.5} fill="#ffffff" stroke="#1761fd" strokeWidth="2" />
                    <circle cx={uniqueVisitsCurve.points[idx].x} cy={uniqueVisitsCurve.points[idx].y} r={hoverIndex === idx ? 4 : 2.5} fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                  </g>
                ))}
              </svg>

              {/* Tooltip */}
              {hoverIndex !== null && newVisitsCurve.points[hoverIndex] && (
                <div style={{
                  position: 'absolute',
                  top: `${newVisitsCurve.points[hoverIndex].y - 44}px`,
                  left: `${(newVisitsCurve.points[hoverIndex].x / svgWidth) * 100}%`,
                  transform: 'translateX(-50%)',
                  background: '#1d2c48',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(29, 44, 72, 0.25)',
                  pointerEvents: 'none',
                  zIndex: 10
                }}>
                  <div>{labels[hoverIndex]}: <strong>{newVisits[hoverIndex]}k</strong> New Visits</div>
                  <div style={{ color: '#8997bd', fontSize: '10px' }}>{uniqueVisits[hoverIndex]}k Unique Visits</div>
                </div>
              )}

              {/* X-Axis Month Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 35px 0 35px', fontSize: '11.5px', color: '#8997bd', fontFamily: 'Roboto' }}>
                {labels.map((lbl, idx) => (
                  <span key={idx} style={{ fontWeight: hoverIndex === idx ? 700 : 400, color: hoverIndex === idx ? '#1761fd' : '#8997bd' }}>
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Dastone Sessions Device (Donut & 4-Col Table) */}
        <div className="card report-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
          <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 className="card-title">Sessions Device</h4>
              <div style={{ display: 'flex', gap: '4px', fontSize: '11px', color: '#8997bd' }}>
                {['All', 'Mobile', 'Tablet', 'Desktop'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setDeviceFilter(tab)}
                    style={{
                      border: 'none',
                      background: deviceFilter === tab ? 'rgba(23, 97, 253, 0.08)' : 'transparent',
                      color: deviceFilter === tab ? '#1761fd' : '#8997bd',
                      fontWeight: deviceFilter === tab ? 600 : 400,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#8997bd' }}>
              01 January 2026 to 31 December 2026
            </p>

            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '4px auto' }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {(() => {
                  let cumulativePercent = 0;
                  const donutSegments = [
                    { share: 0.45, color: '#f59e0b' },
                    { share: 0.32, color: '#22c55e' },
                    { share: 0.23, color: '#1761fd' }
                  ];
                  return donutSegments.map((item, idx) => {
                    const strokeDasharray = `${item.share * 251.2} 251.2`;
                    const strokeDashoffset = `-${cumulativePercent * 251.2}`;
                    cumulativePercent += item.share;
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  });
                })()}
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>8,040</span>
                <span style={{ fontSize: '10px', color: '#8997bd', textTransform: 'uppercase' }}>Sessions</span>
              </div>
            </div>

            {/* 4-Column Table: Device | Sassions | Day | Week */}
            <div style={{ marginTop: '10px' }}>
              <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e3ebf6', color: '#8997bd' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600, fontSize: '10.5px' }}>Device</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 600, fontSize: '10.5px' }}>Sessions</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 600, fontSize: '10.5px' }}>Day</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 600, fontSize: '10.5px' }}>Week</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceList.map((dev, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5fa' }}>
                      <td style={{ padding: '6px 4px', display: 'flex', alignItems: 'center', gap: '6px', color: '#303e67' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dev.color }} />
                        {dev.name}
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 600, color: '#1d2c48' }}>
                        {dev.sessions}
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px 4px', color: '#dc2626' }}>
                        {dev.day}
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px 4px', color: '#dc2626' }}>
                        {dev.week}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
