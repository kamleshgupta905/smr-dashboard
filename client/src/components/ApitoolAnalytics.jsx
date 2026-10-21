import React, { useState, useMemo } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { BarChart3, PieChart, Layers, Info } from 'lucide-react';

/**
 * Panel 1 Exact Operational Performance Overview (Bar Chart)
 * Gradient: #6366F1 to #4F46E5
 * Shows real project click volumes (VMH#100223, VMH#100170 USA, etc.)
 */
function PerformanceBarChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const items = useMemo(() => {
    let source = data?.chartData;
    if (!source || Object.keys(source).length === 0) {
      source = {
        'VMH#100223': 577,
        'VMH#100170 USA (B2C)': 548,
        'VMHAML29201 US': 459,
        'VMHZASI26213- TG -1': 418,
        'VMH_1498': 404,
        'VMH_1685': 393
      };
    }

    return Object.entries(source).map(([project, val]) => {
      let clicks = 0;
      if (typeof val === 'object' && val !== null) {
        clicks = Object.values(val).reduce((acc, c) => acc + (parseInt(c, 10) || 0), 0);
      } else {
        clicks = parseInt(val, 10) || 0;
      }
      return { project, clicks };
    });
  }, [data]);

  const maxVal = Math.max(...items.map(i => i.clicks), 600);
  const roundedMax = Math.ceil(maxVal / 100) * 100;

  const svgWidth = 620;
  const svgHeight = 250;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 50;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;
  const barWidth = 26;
  const gap = (chartW - (barWidth * items.length)) / (items.length + 1);

  const yTicks = [0, Math.round(roundedMax * 0.33), Math.round(roundedMax * 0.66), roundedMax];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="panel1BarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="panel1BarGradientHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {yTicks.map((tick, i) => {
          const y = padTop + chartH - (tick / roundedMax) * chartH;
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#94A3B8"
                fontFamily="Inter, sans-serif"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {items.map((item, idx) => {
          const barH = (item.clicks / roundedMax) * chartH;
          const x = padLeft + gap + idx * (barWidth + gap);
          const y = padTop + chartH - barH;
          const isHover = hoveredIdx === idx;

          // Short label for X axis
          const shortName = item.project.length > 13 ? item.project.slice(0, 11) + '..' : item.project;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Background hover column */}
              <rect
                x={x - gap / 3}
                y={padTop}
                width={barWidth + (gap * 2) / 3}
                height={chartH}
                fill={isHover ? 'rgba(79, 70, 229, 0.05)' : 'transparent'}
                rx="6"
              />

              {/* Bar with gradient and rounded top */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="8"
                fill={isHover ? 'url(#panel1BarGradientHover)' : 'url(#panel1BarGradient)'}
                filter={isHover ? 'drop-shadow(0 4px 8px rgba(79, 70, 229, 0.35))' : 'none'}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Click count label above bar */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={isHover ? '#4F46E5' : '#64748B'}
                fontFamily="Inter, sans-serif"
              >
                {item.clicks}
              </text>

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={padTop + chartH + 18}
                textAnchor="middle"
                fontSize="10"
                fontWeight={isHover ? '600' : '500'}
                fill={isHover ? '#0F172A' : '#64748B'}
                fontFamily="Inter, sans-serif"
              >
                {shortName}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredIdx !== null && items[hoveredIdx] && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '16px',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontWeight: 600 }}>{items[hoveredIdx].project}:</span>
          <span style={{ color: '#818CF8', fontWeight: 700 }}>{items[hoveredIdx].clicks.toLocaleString()} Clicks</span>
        </div>
      )}
    </div>
  );
}

/**
 * Panel 1 Exact Vendor Distribution (Donut Chart)
 * Cutout: 75%
 * Colors: #4F46E5, #6366F1, #818CF8
 * Center text: Total sum
 */
function VendorDistributionDonut({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const categories = useMemo(() => {
    const raw = data?.donutChartData;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item, i) => {
        const colors = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC'];
        return {
          category: item.category,
          value: Number(item.value) || 0,
          color: colors[i % colors.length]
        };
      });
    }

    const totalVendors = Number(data?.totalVendors || 2143);
    const activeProjects = Number(data?.activeProjects || 1397);
    const totalClick = Number(data?.totalClick || 33744);

    return [
      { category: 'Vendors', value: totalVendors, color: '#4F46E5' },
      { category: 'Active Studies', value: activeProjects, color: '#6366F1' },
      { category: 'Routed Leads', value: totalClick, color: '#818CF8' }
    ];
  }, [data]);

  const total = categories.reduce((sum, c) => sum + c.value, 0);

  // Calculate SVG arc paths for 75% cutout donut
  const size = 200;
  const center = size / 2;
  const outerR = 80;
  const innerR = 60; // 75% cutout: 60 / 80 = 0.75

  let currentAngle = -Math.PI / 2;
  const arcs = categories.map((c) => {
    const angle = (c.value / (total || 1)) * (2 * Math.PI);
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Outer arc
    const x1 = center + outerR * Math.cos(startAngle);
    const y1 = center + outerR * Math.sin(startAngle);
    const x2 = center + outerR * Math.cos(endAngle);
    const y2 = center + outerR * Math.sin(endAngle);

    // Inner arc
    const x3 = center + innerR * Math.cos(endAngle);
    const y3 = center + innerR * Math.sin(endAngle);
    const x4 = center + innerR * Math.cos(startAngle);
    const y4 = center + innerR * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    const pct = ((c.value / (total || 1)) * 100).toFixed(1);

    return { ...c, path, pct };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%' }}>
          {arcs.map((arc, i) => (
            <path
              key={i}
              d={arc.path}
              fill={arc.color}
              opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.6}
              transform={hoveredIdx === i ? `scale(1.03) translate(-${center * 0.03}, -${center * 0.03})` : undefined}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </svg>

        {/* Center Text (Exact Panel 1 Center Metric) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#0F172A',
            lineHeight: 1
          }}>
            <AnimatedCounter value={total} duration={1200} />
          </div>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#64748B',
            marginTop: '3px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Total Volume
          </div>
        </div>
      </div>

      {/* Legend at bottom matching Panel 1 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '16px',
        width: '100%'
      }}>
        {categories.map((c, i) => {
          const pct = ((c.value / (total || 1)) * 100).toFixed(1);
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11.5px',
                color: hoveredIdx === i ? '#0F172A' : '#64748B',
                fontWeight: hoveredIdx === i ? 600 : 500,
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: c.color,
                display: 'inline-block'
              }} />
              <span>{c.category}:</span>
              <strong style={{ color: '#0F172A' }}>{c.value.toLocaleString()}</strong>
              <span style={{ color: '#94A3B8', fontSize: '10.5px' }}>({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ApitoolAnalytics({ data, surveys = [] }) {
  return (
    <div className="panel1-charts-row" style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px',
      marginBottom: '24px'
    }}>
      {/* 8-Column Left: Performance Overview */}
      <div
        className="card chart-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <h6 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BarChart3 size={17} color="#4F46E5" />
              Performance Overview
            </h6>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Top project click volumes and respondent traffic
            </p>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '12px',
            background: '#EEF2FF',
            color: '#4F46E5'
          }}>
            Live Lead Attribution
          </span>
        </div>

        <PerformanceBarChart data={data} />
      </div>

      {/* 4-Column Right: Vendor Distribution */}
      <div
        className="card chart-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <h6 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <PieChart size={17} color="#4F46E5" />
              Vendor Distribution
            </h6>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Ecosystem entity breakdown
            </p>
          </div>
        </div>

        <VendorDistributionDonut data={data} />
      </div>
    </div>
  );
}
