import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Share2, 
  Search, 
  Zap, 
  PieChart, 
  UserCheck 
} from 'lucide-react';
import { normalizeSurveys } from '../utils/normalize';

export default function TopPicksPage({ 
  surveys = [], 
  onOpenQuotas, 
  onOpenQuals, 
  onOpenAssign 
}) {
  const [minCpi, setMinCpi] = useState(1.0);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');

  const normalized = useMemo(() => normalizeSurveys(surveys), [surveys]);

  const countries = useMemo(() => {
    return ['ALL', ...new Set(normalized.map(s => s.country).filter(Boolean))];
  }, [normalized]);

  const filtered = useMemo(() => {
    return normalized
      .filter(s => (s.cpi || 0) >= minCpi)
      .filter(s => {
        if (selectedCountry === 'ALL') return true;
        return s.country === selectedCountry;
      })
      .filter(s => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          String(s.survey_id).includes(q) ||
          s.survey_name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.cpi || 0) - (a.cpi || 0));
  }, [normalized, minCpi, selectedCountry, search]);

  return (
    <div>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Marketplace</span>
            <span className="separator">/</span>
            <span className="current">Top Picks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              High-Yield Top Picks
            </h4>
            <span className="badge-soft-success" style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span className="pulse-dot" />
              {filtered.length} Prioritized Studies
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          <div className="badge-soft-primary" style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#1761fd" /> Yield Optimizer Active
          </div>
        </div>
      </div>

      {/* Control Bar (Dastone Report Card) */}
      <div className="report-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
            <input 
              type="text"
              className="input-control"
              placeholder="Search by Survey ID or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', height: '34px', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', color: '#7081b9', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Min CPI: <strong style={{ color: '#1d2c48' }}>${minCpi.toFixed(2)}</strong>
            </label>
            <input 
              type="range"
              min="0.5"
              max="5.0"
              step="0.25"
              value={minCpi}
              onChange={e => setMinCpi(parseFloat(e.target.value))}
              style={{ width: '120px', cursor: 'pointer', accentColor: '#1761fd' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#7081b9', fontWeight: 600 }}>Country:</span>
            <select 
              className="input-control" 
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              style={{ width: 'auto', height: '34px', fontSize: '12px', padding: '4px 10px' }}
            >
              {countries.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? '🌍 All Countries' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Top Picks Cards (Dastone Report Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '18px'
      }}>
        {filtered.length === 0 ? (
          <div className="report-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#8997bd', margin: 0, fontSize: '13px' }}>
              No surveys found matching your minimum CPI threshold of ${minCpi.toFixed(2)}.
            </p>
          </div>
        ) : (
          filtered.map(s => (
            <div 
              key={s.survey_id} 
              className="report-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderTop: '3px solid #1761fd',
                margin: 0
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge-soft-primary" style={{ fontFamily: 'monospace', fontSize: '11px', padding: '2px 7px', borderRadius: '4px' }}>
                    PID: {s.survey_id}
                  </span>
                  <span className="badge-soft-info" style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px' }}>
                    {s.country}
                  </span>
                </div>

                <h4 style={{ 
                  fontSize: '14.5px', 
                  fontWeight: 700, 
                  margin: '0 0 12px 0', 
                  color: '#1d2c48',
                  lineHeight: '1.4'
                }}>
                  {s.survey_name}
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  border: '1px solid #e3ebf6'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8997bd', fontWeight: 600 }}>Estimated CPI</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#03d87f', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <DollarSign size={15} />
                      {s.cpi.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8997bd', fontWeight: 600 }}>Duration</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1d2c48', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#8997bd" />
                      {s.loi} mins
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8997bd', fontWeight: 600 }}>Incidence</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#303e67', marginTop: '2px' }}>
                      {s.ir}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8997bd', fontWeight: 600 }}>Category</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#7081b9', marginTop: '2px' }}>
                      {s.category || 'General'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', paddingTop: '12px', borderTop: '1px solid #e3ebf6' }}>
                <button 
                  className="btn btn-soft-secondary btn-sm" 
                  style={{ flex: 1, padding: '5px 8px', fontSize: '11.5px', borderRadius: '4px' }}
                  onClick={() => onOpenQuotas(s.survey_id)}
                >
                  <PieChart size={12} /> Quotas
                </button>
                <button 
                  className="btn btn-soft-secondary btn-sm" 
                  style={{ flex: 1, padding: '5px 8px', fontSize: '11.5px', borderRadius: '4px' }}
                  onClick={() => onOpenQuals(s.survey_id)}
                >
                  <UserCheck size={12} /> Quals
                </button>
                <button 
                  className="btn btn-soft-primary btn-sm" 
                  style={{ flex: 1.2, padding: '5px 10px', fontSize: '11.5px', borderRadius: '4px' }}
                  onClick={() => onOpenAssign(s.survey_id)}
                >
                  <Share2 size={12} /> Assign
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
