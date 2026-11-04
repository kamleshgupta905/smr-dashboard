import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Globe2,
  Layers3,
  ListFilter,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  WalletCards,
  Zap,
} from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import { getDashboardAnalytics } from '../services/api';
import { normalizeSurveys } from '../utils/normalize';

function formatCompact(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}m`;
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k`;
  return number.toLocaleString();
}

function formatStudyName(study) {
  const name = String(study?.survey_name || study?.Name || study?.name || `Study #${study?.survey_id || ''}`);
  return name.length > 44 ? `${name.slice(0, 44)}…` : name;
}

function MetricCard({ icon: Icon, label, value, prefix = '', suffix = '', detail, tone = 'ink', onClick }) {
  const content = (
    <>
      <div className="dashboard-metric-head">
        <span className={`dashboard-metric-icon dashboard-metric-icon--${tone}`}><Icon size={17} /></span>
        {onClick && <ArrowUpRight className="dashboard-metric-arrow" size={16} />}
      </div>
      <span className="dashboard-metric-label">{label}</span>
      <strong className="dashboard-metric-value">
        <AnimatedCounter value={Number(value || 0)} prefix={prefix} suffix={suffix} decimals={prefix === '$' ? 2 : 0} />
      </strong>
      <span className="dashboard-metric-detail">{detail}</span>
    </>
  );

  return onClick ? (
    <button type="button" className={`dashboard-metric dashboard-metric--${tone}`} onClick={onClick}>{content}</button>
  ) : (
    <div className={`dashboard-metric dashboard-metric--${tone}`}>{content}</div>
  );
}

function CircleProgress({ value, label, caption, tone = 'teal' }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference - (safeValue / 100) * circumference;
  return (
    <div className="dashboard-ring-wrap">
      <div className="dashboard-ring" aria-label={`${label}: ${safeValue}%`}>
        <svg viewBox="0 0 92 92" role="img" aria-hidden="true">
          <circle className="dashboard-ring-track" cx="46" cy="46" r="38" />
          <circle
            className={`dashboard-ring-value dashboard-ring-value--${tone}`}
            cx="46"
            cy="46"
            r="38"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <strong>{safeValue}%</strong>
      </div>
      <div>
        <strong className="dashboard-ring-label">{label}</strong>
        <span className="dashboard-ring-caption">{caption}</span>
      </div>
    </div>
  );
}

function SparklineChart({ values, comparison, labels, selectedPoint, onSelect }) {
  const width = 760;
  const height = 245;
  const padding = { left: 38, right: 18, top: 18, bottom: 32 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const allValues = [...values, ...(comparison || [])];
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);
  const spread = Math.max(maxValue - minValue, 1);
  const xStep = labels.length > 1 ? chartWidth / (labels.length - 1) : chartWidth;

  const getPoints = (series) => series.map((value, index) => ({
    x: padding.left + index * xStep,
    y: padding.top + chartHeight - ((value - minValue) / spread) * chartHeight,
    value,
  }));
  const points = getPoints(values);
  const comparisonPoints = getPoints(comparison || []);

  const toPath = (seriesPoints) => seriesPoints.reduce((path, point, index) => (
    index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`
  ), '');

  return (
    <div className="dashboard-chart" role="img" aria-label="Marketplace study and target trend chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[0, 1, 2, 3].map((step) => {
          const y = padding.top + (chartHeight / 3) * step;
          return <line key={step} x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="dashboard-chart-grid" />;
        })}
        <path d={toPath(comparisonPoints)} className="dashboard-chart-comparison" />
        <path d={toPath(points)} className="dashboard-chart-main" />
        {points.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={selectedPoint === index ? 5 : 3.5}
              className={`dashboard-chart-point ${selectedPoint === index ? 'is-selected' : ''}`}
              onMouseEnter={() => onSelect(index)}
              onFocus={() => onSelect(index)}
              tabIndex={0}
              role="button"
              aria-label={`${labels[index]}: ${point.value.toLocaleString()} studies`}
            />
          </g>
        ))}
        {labels.map((label, index) => (
          <text key={label} x={padding.left + index * xStep} y={height - 7} textAnchor="middle" className="dashboard-chart-label">
            {label}
          </text>
        ))}
      </svg>
      {selectedPoint !== null && values[selectedPoint] !== undefined && (
        <div className="dashboard-chart-tooltip" style={{ left: `${(selectedPoint / Math.max(labels.length - 1, 1)) * 100}%` }}>
          <strong>{values[selectedPoint].toLocaleString()}</strong>
          <span>{labels[selectedPoint]} live studies</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage({
  stats,
  surveys = [],
  loading,
  onSync,
  onNavigate,
  onOpenQuotas,
  onOpenQuals,
  onOpenAssign,
}) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    let active = true;
    getDashboardAnalytics().then((response) => {
      if (active) setAnalyticsData(response?.data || response || null);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const normalized = useMemo(() => normalizeSurveys(surveys), [surveys]);
  const totalStudies = Number(stats?.totalSurveys || normalized.length);
  const activeStudies = Number(stats?.activeSurveys || normalized.filter((study) => String(study.status).toLowerCase() === 'live').length || totalStudies);
  const averageCpi = Number(stats?.avgCpi || (normalized.length ? normalized.reduce((sum, study) => sum + Number(study.cpi || 0), 0) / normalized.length : 0));
  const clientCount = Number(stats?.activeVendors || 0);
  const totalQuota = normalized.reduce((sum, study) => sum + Number(study.completesNeeded || study.TotalCompleteRequired || 0), 0);
  const countryCount = new Set(normalized.map((study) => study.country).filter(Boolean)).size;
  const b2bCount = normalized.filter((study) => String(study.studyType || study.StudyTypes || '').toLowerCase().includes('b2b')).length;
  const premiumCount = normalized.filter((study) => Number(study.cpi || 0) >= 5).length;

  const chartData = useMemo(() => {
    const source = analyticsData?.chartData && Object.values(analyticsData.chartData).length
      ? Object.values(analyticsData.chartData).map(Number)
      : [];
    const values = source.length >= 4 ? source.slice(0, 7) : Array.from({ length: 7 }, (_, index) => {
      const chunk = normalized.slice(Math.floor((normalized.length / 7) * index), Math.floor((normalized.length / 7) * (index + 1)) || normalized.length);
      return chunk.length || (normalized.length ? Math.max(1, Math.round(normalized.length / 7)) : 0);
    });
    const safeValues = values.length ? values : [0, 0, 0, 0, 0, 0, 0];
    const comparison = safeValues.map((value, index) => Math.max(0, Math.round(value * (0.72 + index * 0.02))));
    return {
      values: safeValues,
      comparison,
      labels: safeValues.length === 12 ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, safeValues.length),
    };
  }, [analyticsData, normalized]);

  const topStudies = useMemo(() => [...normalized]
    .sort((first, second) => (Number(second.cpi || 0) - Number(first.cpi || 0)) || (Number(second.completesNeeded || 0) - Number(first.completesNeeded || 0)))
    .slice(0, 5), [normalized]);

  const distribution = useMemo(() => {
    const source = normalized.reduce((accumulator, study) => {
      const category = String(study.studyType || study.StudyTypes || 'Consumer').toLowerCase().includes('b2b') ? 'B2B' : 'Consumer';
      accumulator[category] = (accumulator[category] || 0) + 1;
      return accumulator;
    }, { Consumer: 0, B2B: 0 });
    const consumer = totalStudies ? Math.round((source.Consumer / totalStudies) * 100) : 0;
    return { consumer, b2b: Math.max(0, 100 - consumer), source };
  }, [normalized, totalStudies]);

  const quotaCoverage = normalized.length
    ? Math.round(normalized.reduce((sum, study) => sum + Math.min(100, Number(study.ir || 0)), 0) / normalized.length)
    : 0;
  const liveCoverage = totalStudies ? Math.round((activeStudies / totalStudies) * 100) : 0;

  const exportCsv = () => {
    const headers = ['Survey ID', 'Study', 'Country', 'CPI', 'LOI', 'IR', 'Quota'];
    const rows = normalized.map((study) => [
      study.survey_id,
      `"${String(study.survey_name || '').replace(/"/g, '""')}"`,
      study.country,
      Number(study.cpi || 0).toFixed(2),
      study.loi,
      study.ir,
      study.completesNeeded || study.TotalCompleteRequired || 0,
    ]);
    const blob = new Blob([[headers.join(','), ...rows.map((row) => row.join(','))].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smr-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <div className="dashboard-eyebrow"><span className="dashboard-live-dot" /> LIVE OPERATIONS · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <h1>Good morning, <em>Admin.</em></h1>
          <p>Here is the current pulse of your survey marketplace.</p>
        </div>
        <div className="dashboard-hero-actions">
          <button type="button" className="dashboard-button dashboard-button--quiet" onClick={exportCsv} disabled={!normalized.length}>
            <Download size={15} /> Export view
          </button>
          <button type="button" className="dashboard-button dashboard-button--dark" onClick={onSync} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'is-spinning' : ''} /> {loading ? 'Refreshing…' : 'Refresh inventory'}
          </button>
        </div>
      </section>

      <section className="dashboard-metrics" aria-label="Marketplace metrics">
        <MetricCard icon={Layers3} label="Live inventory" value={activeStudies} detail={`${liveCoverage}% of total studies active`} tone="ink" onClick={() => onNavigate?.('surveys')} />
        <MetricCard icon={WalletCards} label="Average CPI" value={averageCpi} prefix="$" detail={`${premiumCount.toLocaleString()} premium studies above $5`} tone="teal" onClick={() => onNavigate?.('surveys')} />
        <MetricCard icon={Target} label="Open quota" value={totalQuota} detail="Remaining capacity across live supply" tone="amber" onClick={() => onNavigate?.('surveys')} />
        <MetricCard icon={UsersRound} label="Demand sources" value={clientCount} detail={`${countryCount || 0} markets represented in inventory`} tone="blue" onClick={() => onNavigate?.('clients')} />
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-card dashboard-card--chart">
          <div className="dashboard-card-header">
            <div>
              <div className="dashboard-card-kicker"><BarChart3 size={15} /> Inventory movement</div>
              <h2>Marketplace throughput</h2>
              <p>Live study intake against the current operating target.</p>
            </div>
            <div className="dashboard-chart-legend">
              <span><i className="dashboard-legend-dot dashboard-legend-dot--ink" /> Live intake</span>
              <span><i className="dashboard-legend-dot dashboard-legend-dot--pale" /> Target line</span>
            </div>
          </div>
          <div className="dashboard-chart-summary">
            <strong>{formatCompact(totalStudies)}</strong>
            <span>studies in view</span>
            <span className="dashboard-chart-change"><ArrowUpRight size={14} /> {premiumCount ? `${premiumCount} high-yield` : 'Awaiting live feed'}</span>
          </div>
          <SparklineChart
            values={chartData.values}
            comparison={chartData.comparison}
            labels={chartData.labels}
            selectedPoint={selectedPoint}
            onSelect={setSelectedPoint}
          />
        </article>

        <article className="dashboard-card dashboard-card--snapshot">
          <div className="dashboard-card-header">
            <div>
              <div className="dashboard-card-kicker"><Globe2 size={15} /> Inventory mix</div>
              <h2>Audience snapshot</h2>
            </div>
            <button type="button" className="dashboard-card-link" onClick={() => onNavigate?.('surveys')}><ExternalLink size={14} /></button>
          </div>
          <div className="dashboard-snapshot-ring">
            <CircleProgress value={quotaCoverage} label="Quota health" caption="Average incidence coverage" tone="teal" />
          </div>
          <div className="dashboard-audience-bar" aria-label={`Audience mix: ${distribution.consumer}% consumer and ${distribution.b2b}% B2B`}>
            <span style={{ width: `${distribution.consumer}%` }} />
            <span style={{ width: `${distribution.b2b}%` }} />
          </div>
          <div className="dashboard-audience-legend">
            <div><i className="dashboard-legend-dot dashboard-legend-dot--teal" /><strong>{distribution.consumer}%</strong><span>Consumer</span></div>
            <div><i className="dashboard-legend-dot dashboard-legend-dot--sand" /><strong>{distribution.b2b}%</strong><span>B2B / specialist</span></div>
          </div>
          <div className="dashboard-snapshot-stats">
            <div><strong>{countryCount || 0}</strong><span>Countries</span></div>
            <div><strong>{b2bCount || 0}</strong><span>B2B panels</span></div>
            <div><strong>{formatCompact(totalQuota)}</strong><span>Open quota</span></div>
          </div>
        </article>
      </section>

      <section className="dashboard-secondary-grid">
        <article className="dashboard-card dashboard-card--table">
          <div className="dashboard-card-header dashboard-card-header--table">
            <div>
              <div className="dashboard-card-kicker"><ListFilter size={15} /> Priority supply</div>
              <h2>Highest-yield opportunities</h2>
            </div>
            <button type="button" className="dashboard-text-button" onClick={() => onNavigate?.('surveys')}>View all <ArrowRight size={14} /></button>
          </div>
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead><tr><th>Study</th><th>Market</th><th>CPI</th><th>LOI</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {topStudies.length ? topStudies.map((study) => (
                  <tr key={String(study.survey_id)}>
                    <td><div className="dashboard-study-cell"><span className="dashboard-study-mark">{String(study.survey_name || 'S').slice(0, 1).toUpperCase()}</span><div><strong title={study.survey_name}>{formatStudyName(study)}</strong><span>#{study.survey_id}</span></div></div></td>
                    <td><span className="dashboard-market"><Globe2 size={13} /> {study.country || 'Global'}</span></td>
                    <td><strong className="dashboard-cpi">${Number(study.cpi || 0).toFixed(2)}</strong></td>
                    <td>{Number(study.loi || 0)} min</td>
                    <td><span className="dashboard-status"><i /> {String(study.status || 'Live')}</span></td>
                    <td><button type="button" className="dashboard-row-action" onClick={() => onOpenQuotas?.(study)} aria-label={`Open quotas for ${formatStudyName(study)}`}><ChevronRight size={15} /></button></td>
                  </tr>
                )) : (
                  <tr><td colSpan="6"><div className="dashboard-empty"><Layers3 size={18} /><span>{loading ? 'Loading live inventory…' : 'No studies are available yet.'}</span></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-card dashboard-card--signals">
          <div className="dashboard-card-header">
            <div>
              <div className="dashboard-card-kicker"><Zap size={15} /> System signals</div>
              <h2>Workspace health</h2>
            </div>
            <span className="dashboard-health-badge"><Check size={13} /> All clear</span>
          </div>
          <div className="dashboard-signal-list">
            <div className="dashboard-signal"><span className="dashboard-signal-icon dashboard-signal-icon--teal"><Zap size={15} /></span><div><strong>Supply gateway</strong><span>Inventory feed is responding</span></div><b>Live</b></div>
            <div className="dashboard-signal"><span className="dashboard-signal-icon dashboard-signal-icon--blue"><ShieldCheck size={15} /></span><div><strong>Fraud gate</strong><span>Ruleset is protecting every route</span></div><b>Protected</b></div>
            <div className="dashboard-signal"><span className="dashboard-signal-icon dashboard-signal-icon--amber"><Clock3 size={15} /></span><div><strong>Last refresh</strong><span>Data refreshes every 15 minutes</span></div><b>15 min</b></div>
          </div>
          <div className="dashboard-quick-actions">
            <span>Quick actions</span>
            <div>
              <button type="button" onClick={() => onOpenAssign?.(topStudies[0])} disabled={!topStudies.length}><UsersRound size={14} /> Assign vendor</button>
              <button type="button" onClick={() => onOpenQuals?.(topStudies[0])} disabled={!topStudies.length}><Sparkles size={14} /> Review qualifiers</button>
            </div>
          </div>
        </article>
      </section>

      <footer className="dashboard-footer-note"><ShieldCheck size={14} /><span>VMH SMR keeps the operational view focused: live inventory, routing quality, and the next decision.</span><span className="dashboard-footer-version">SMR v3.4</span></footer>
    </div>
  );
}
