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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A' }}>
            <TrendingUp size={22} color="#00C851" /> High-Yield Top Picks
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Prioritized inventory with maximum payouts (CPI) and optimal conversion potential.
          </p>
        </div>

        <div style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          padding: '6px 14px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#059669',
          fontSize: '13px',
          fontWeight: 700
        }}>
          <Zap size={14} /> Filtered: {filtered.length} High-Yield Surveys
        </div>
      </div>

      {/* Control Bar (Solid White Card) */}
      <div className="card" style={{ marginBottom: '22px', padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="input-field"
              placeholder="Search by Survey ID or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Min CPI: <strong style={{ color: '#0F172A' }}>${minCpi.toFixed(2)}</strong>
            </label>
            <input 
              type="range"
              min="0.5"
              max="5.0"
              step="0.25"
              value={minCpi}
              onChange={e => setMinCpi(parseFloat(e.target.value))}
              style={{ width: '130px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Country:</span>
            <select 
              className="input-field" 
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              {countries.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Countries' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Top Picks Cards (Solid White Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '18px'
      }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              No surveys found matching your minimum CPI threshold of ${minCpi.toFixed(2)}.
            </p>
          </div>
        ) : (
          filtered.map(s => (
            <div 
              key={s.survey_id} 
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderTop: '3px solid #00C851',
                margin: 0
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge badge-purple" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                    PID: {s.survey_id}
                  </span>
                  <span className="badge badge-info">
                    {s.country}
                  </span>
                </div>

                <h4 style={{ 
                  fontSize: '15px', 
                  fontWeight: 700, 
                  margin: '0 0 12px 0', 
                  color: '#0F172A',
                  lineHeight: '1.4'
                }}>
                  {s.survey_name}
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  background: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Estimated CPI</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#00C851', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <DollarSign size={16} />
                      {s.cpi.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Duration</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} color="#64748B" />
                      {s.loi} mins
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Incidence</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-body)', marginTop: '2px' }}>
                      {s.ir}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-body)', marginTop: '2px' }}>
                      {s.category}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ flex: 1 }}
                  onClick={() => onOpenQuotas(s.survey_id)}
                >
                  <PieChart size={13} /> Quotas
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ flex: 1 }}
                  onClick={() => onOpenQuals(s.survey_id)}
                >
                  <UserCheck size={13} /> Quals
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1.2 }}
                  onClick={() => onOpenAssign(s.survey_id)}
                >
                  <Share2 size={13} /> Assign
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
