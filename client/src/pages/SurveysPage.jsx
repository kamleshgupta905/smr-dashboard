import React, { useState, useMemo } from 'react';
import { Search, PieChart, UserCheck, Share2, AlertCircle, ChevronLeft, ChevronRight, DollarSign, Clock, ArrowUpDown, Filter } from 'lucide-react';
import { normalizeSurveys } from '../utils/normalize';

export default function SurveysPage({ surveys = [], loading, onOpenQuotas, onOpenQuals, onOpenAssign }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [sortBy, setSortBy] = useState('cpi-desc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const normalized = useMemo(() => normalizeSurveys(surveys), [surveys]);

  const countries = useMemo(() => {
    return ['ALL', ...new Set(normalized.map(s => s.country).filter(Boolean))];
  }, [normalized]);

  const filtered = useMemo(() => {
    let list = normalized.filter((s) => {
      if (selectedCountry !== 'ALL' && s.country !== selectedCountry) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.survey_name.toLowerCase().includes(term) ||
        String(s.survey_id).includes(term) ||
        (s.category && s.category.toLowerCase().includes(term))
      );
    });

    list.sort((a, b) => {
      if (sortBy === 'cpi-desc') return (b.cpi || 0) - (a.cpi || 0);
      if (sortBy === 'cpi-asc') return (a.cpi || 0) - (b.cpi || 0);
      if (sortBy === 'loi-asc') return (a.loi || 0) - (b.loi || 0);
      if (sortBy === 'ir-desc') return (b.ir || 0) - (a.ir || 0);
      return 0;
    });

    return list;
  }, [normalized, selectedCountry, searchTerm, sortBy]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedSurveys = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCountryChange = (c) => {
    setSelectedCountry(c);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  return (
    <div>
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <h2 className="card-panel-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0' }}>
              Allocated Survey Inventory
            </h2>
            <small style={{ color: 'var(--text-muted)' }}>
              Real-time survey allocations matched to your supplier account ({filtered.length} matching)
            </small>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input-control"
                style={{ paddingLeft: '36px', width: '220px' }}
                placeholder="Search by name, PID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select 
                className="input-control"
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={{ width: 'auto' }}
              >
                {countries.map(c => (
                  <option key={c} value={c}>{c === 'ALL' ? 'All Countries' : c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="var(--text-muted)" />
              <select
                className="input-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="cpi-desc">Highest CPI ($)</option>
                <option value="cpi-asc">Lowest CPI ($)</option>
                <option value="loi-asc">Shortest Duration (LOI)</option>
                <option value="ir-desc">Highest Incidence (IR)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Survey Name & PID</th>
                <th>Country</th>
                <th>CPI</th>
                <th>IR</th>
                <th>LOI</th>
                <th>Target (N)</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Targeting & Quota</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
                    Loading surveys from Zamplia Supply API...
                  </td>
                </tr>
              ) : paginatedSurveys.length > 0 ? (
                paginatedSurveys.map((s, idx) => {
                  const globalIdx = (page - 1) * pageSize + idx + 1;
                  return (
                    <tr key={s.survey_id || idx}>
                      <td style={{ color: 'var(--text-muted)' }}>{globalIdx}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.survey_name}</div>
                        <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>
                          PID: {s.survey_id}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{s.country}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#00C851', display: 'inline-flex', alignItems: 'center' }}>
                          <DollarSign size={13} />
                          {s.cpi.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-body)' }}>
                        {s.ir}%
                      </td>
                      <td style={{ color: 'var(--text-body)' }}>
                        <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#64748B' }} />
                        {s.loi}m
                      </td>
                      <td style={{ color: 'var(--text-body)' }}>
                        {s.target_completes}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {s.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Inspect Quotas"
                            onClick={() => onOpenQuotas(s.survey_id)}
                          >
                            <PieChart size={13} /> Quotas
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Inspect Targeting Qualifications"
                            onClick={() => onOpenQuals(s.survey_id)}
                          >
                            <UserCheck size={13} /> Quals
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenAssign(s.survey_id)}
                        >
                          <Share2 size={13} /> Assign Link
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No surveys matched your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filtered.length > pageSize && (
          <div className="pagination-bar">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> surveys
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600, padding: '0 8px' }}>
                Page {page} of {totalPages}
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
