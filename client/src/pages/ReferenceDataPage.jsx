import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Globe, 
  Briefcase, 
  Layers, 
  ShieldAlert, 
  Search, 
  RefreshCw 
} from 'lucide-react';
import { 
  getReferenceLanguages, 
  getReferenceIndustries, 
  getReferenceSurveyTypes, 
  getBlockedIps 
} from '../services/api';

export default function ReferenceDataPage() {
  const [activeCategory, setActiveCategory] = useState('languages');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchCategoryData = async (cat) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (cat === 'languages') res = await getReferenceLanguages();
      else if (cat === 'industries') res = await getReferenceIndustries();
      else if (cat === 'types') res = await getReferenceSurveyTypes();
      else if (cat === 'blocked-ips') res = await getBlockedIps();

      if (res && res.data) {
        setData(Array.isArray(res.data) ? res.data : []);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch Zamplia reference data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData(activeCategory);
  }, [activeCategory]);

  const filteredData = data.filter(item => {
    if (!search) return true;
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(search.toLowerCase());
  });

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
            <Database size={22} color="#00C851" /> Zamplia Reference Catalogs
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Official platform taxonomies, language codes, industry sectors, and blocked fraud IPs.
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => fetchCategoryData(activeCategory)}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Refresh Catalog
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '18px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <button 
          className={`btn ${activeCategory === 'languages' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveCategory('languages')}
        >
          <Globe size={15} /> Languages
        </button>
        <button 
          className={`btn ${activeCategory === 'industries' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveCategory('industries')}
        >
          <Briefcase size={15} /> Industries
        </button>
        <button 
          className={`btn ${activeCategory === 'types' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveCategory('types')}
        >
          <Layers size={15} /> Survey Types
        </button>
        <button 
          className={`btn ${activeCategory === 'blocked-ips' ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setActiveCategory('blocked-ips')}
        >
          <ShieldAlert size={15} /> Blocked Fraud IPs
        </button>
      </div>

      {/* Search and Table */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="input-field"
              placeholder="Search reference records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <span className="badge badge-info">
            {filteredData.length} records found
          </span>
        </div>

        {error && (
          <div style={{
            padding: '14px 18px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#DC2626',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            Querying Zamplia Reference API...
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            No records found for current selection.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID / Code</th>
                  <th>Name / Value</th>
                  <th>Details / Extra</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => {
                  const id = item.Id || item.LanguageId || item.IndustryId || item.SurveyTypeId || item.IpAddress || idx + 1;
                  const name = item.Name || item.LanguageName || item.IndustryName || item.SurveyTypeName || item.IpAddress || 'N/A';
                  const extra = item.IsoCode || item.Code || item.Description || item.Reason || (item.Country ? `Country: ${item.Country}` : 'Standard Taxonomy');

                  return (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4338CA' }}>
                        {id}
                      </td>
                      <td style={{ fontWeight: 600, color: '#0F172A' }}>
                        {name}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {extra}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
