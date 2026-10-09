import React, { useState, useEffect } from 'react';
import { 
  Database, Globe, Briefcase, Layers, ShieldAlert, Search, RefreshCw, HelpCircle, MapPin, Code
} from 'lucide-react';
import { 
  getReferenceLanguages, 
  getReferenceIndustries, 
  getReferenceSurveyTypes, 
  getBlockedIps,
  getReferenceDemographics,
  getReferenceSurveyGroups,
  getReferenceCategories,
  getMarketXcelCountries,
  getMarketXcelLanguages,
  getMarketXcelQuestions
} from '../services/api';

export default function ReferenceDataPage() {
  const [activeCategory, setActiveCategory] = useState('mx-questions');
  const [data, setData] = useState([]);
  const [legend, setLegend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchCategoryData = async (cat) => {
    setLoading(true);
    setError(null);
    setLegend([]);
    try {
      let res;
      if (cat === 'mx-questions') {
        const qRes = await getMarketXcelQuestions(229, 5);
        setData(qRes?.data || []);
        setLegend(qRes?.controlTypesLegend || []);
        return;
      } else if (cat === 'mx-countries') {
        res = await getMarketXcelCountries();
      } else if (cat === 'mx-languages') {
        res = await getMarketXcelLanguages();
      } else if (cat === 'zamp-demographics') {
        const dRes = await getReferenceDemographics();
        res = dRes.data || dRes;
      } else if (cat === 'zamp-groups') {
        const gRes = await getReferenceSurveyGroups();
        res = gRes.data || gRes;
      } else if (cat === 'zamp-categories') {
        const cRes = await getReferenceCategories();
        res = cRes.data || cRes;
      } else if (cat === 'languages') {
        const lRes = await getReferenceLanguages();
        res = lRes.data || lRes;
      } else if (cat === 'industries') {
        const iRes = await getReferenceIndustries();
        res = iRes.data || iRes;
      } else if (cat === 'types') {
        const tRes = await getReferenceSurveyTypes();
        res = tRes.data || tRes;
      } else if (cat === 'blocked-ips') {
        const bRes = await getBlockedIps();
        res = bRes.data || bRes;
      }

      setData(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch reference catalog');
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
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Catalogs</span>
            <span className="separator">/</span>
            <span className="current">Categories & Data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Categories & Reference Data
            </h4>
            <span className="badge-soft-primary" style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Database size={12} /> Standard Master Lists
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          <button 
            className="btn btn-soft-primary" 
            onClick={() => fetchCategoryData(activeCategory)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <RefreshCw size={13} className={loading ? 'sync-spin' : ''} /> Refresh Catalog
          </button>
        </div>
      </div>

      {/* Dastone Timeframe Filter Tabs */}
      <div className="timeframe-group" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {[
          { id: 'mx-questions', label: 'MX Questions & Controls', icon: HelpCircle },
          { id: 'mx-countries', label: 'MX Countries', icon: MapPin },
          { id: 'mx-languages', label: 'MX Languages', icon: Globe },
          { id: 'zamp-demographics', label: 'Zamplia Demographics', icon: Database },
          { id: 'zamp-groups', label: 'Zamplia Groups', icon: Layers },
          { id: 'zamp-categories', label: 'Zamplia Categories', icon: Briefcase },
          { id: 'languages', label: 'Zamplia Languages', icon: Globe },
          { id: 'industries', label: 'Industries', icon: Briefcase },
          { id: 'types', label: 'Survey Types', icon: Layers },
          { id: 'blocked-ips', label: 'Blocked Fraud IPs', icon: ShieldAlert },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`timeframe-btn ${active ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                fontSize: '11.5px',
                color: tab.id === 'blocked-ips' && active ? '#f5325c' : undefined
              }}
            >
              <Icon size={13} color={active ? (tab.id === 'blocked-ips' ? '#f5325c' : '#1761fd') : '#8997bd'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Control Types Legend Box when mx-questions is active */}
      {legend.length > 0 && (
        <div className="report-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            📋 Market Xcel Control Types Specification:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {legend.map((l, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#303e67' }}>
                <span className="badge-soft-primary" style={{ padding: '2px 6px', borderRadius: '4px', fontWeight: 700, marginRight: '6px' }}>
                  Code {l.code}
                </span>
                <strong>{l.label}:</strong> <span style={{ color: '#7081b9' }}>{l.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Table (Dastone Report Card) */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="report-card-header">
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
            <input 
              type="text"
              className="input-control"
              placeholder="Search reference records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', height: '34px', fontSize: '12px' }}
            />
          </div>
          <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
            {filteredData.length} Records Found
          </span>
        </div>

        {/* Dynamic Table Renderer */}
        <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead className="thead-light">
              {activeCategory === 'mx-questions' && (
                <tr>
                  <th>QID</th>
                  <th>Title</th>
                  <th>Question Text</th>
                  <th>Control Type</th>
                  <th>Range (From - To)</th>
                  <th>Mapped Options</th>
                </tr>
              )}

              {activeCategory === 'mx-countries' && (
                <tr>
                  <th>Country ID</th>
                  <th>Country Name</th>
                  <th>Short Name (Alpha-2)</th>
                  <th>ISO Code (Alpha-3)</th>
                </tr>
              )}

              {activeCategory === 'mx-languages' && (
                <tr>
                  <th>Language ID</th>
                  <th>Language Name</th>
                  <th>Short Code</th>
                </tr>
              )}

              {activeCategory === 'zamp-demographics' && (
                <tr>
                  <th>Demographic ID</th>
                  <th>Standard Code</th>
                  <th>Profiling Variable Name</th>
                  <th>Question Type</th>
                </tr>
              )}

              {activeCategory === 'zamp-groups' && (
                <tr>
                  <th>Group ID</th>
                  <th>Group Name</th>
                  <th>Active Studies</th>
                  <th>Exclusion Rule</th>
                </tr>
              )}

              {activeCategory === 'zamp-categories' && (
                <tr>
                  <th>Category ID</th>
                  <th>Demand Category Name</th>
                  <th>Target Sector</th>
                </tr>
              )}

              {(activeCategory === 'languages' || activeCategory === 'industries' || activeCategory === 'types' || activeCategory === 'blocked-ips') && (
                <tr>
                  <th>#</th>
                  <th>Identifier / Code</th>
                  <th>Name / Value</th>
                  <th>Details / Description</th>
                </tr>
              )}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div className="spinner" style={{ margin: '0 auto 10px auto' }}></div>
                    Loading master reference catalog...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={idx}>
                    {activeCategory === 'mx-questions' && (
                      <>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>#{item.question_id}</td>
                        <td><span className="badge badge-info">{item.title}</span></td>
                        <td style={{ fontWeight: 600, color: '#0F172A' }}>{item.question}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: item.control_type === '1' ? '#DCFCE7' : item.control_type === '4' ? '#F3E8FF' : '#EFF6FF',
                            color: item.control_type === '1' ? '#15803D' : item.control_type === '4' ? '#7E22CE' : '#1D4ED8',
                          }}>
                            {item.control_type_label || (item.control_type === '1' ? 'Single Punch' : item.control_type === '4' ? 'Multi Punch' : 'Range')} (Code {item.control_type})
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          {item.from_range ? `${item.from_range} - ${item.to_range}` : 'N/A'}
                        </td>
                        <td>
                          {item.mapped_option ? (
                            <div style={{ fontSize: '11.5px', color: '#475569' }}>
                              {Object.entries(item.mapped_option).map(([k, v]) => (
                                <span key={k} style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', marginRight: '4px', display: 'inline-block', marginBottom: '2px' }}>
                                  {v || k}
                                </span>
                              ))}
                            </div>
                          ) : '—'}
                        </td>
                      </>
                    )}

                    {activeCategory === 'mx-countries' && (
                      <>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>{item.country_id}</td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</td>
                        <td><span className="badge badge-info">{item.short_name}</span></td>
                        <td><strong style={{ fontFamily: 'monospace', color: '#2563EB' }}>{item.iso_code}</strong></td>
                      </>
                    )}

                    {activeCategory === 'mx-languages' && (
                      <>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>{item.language_id}</td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</td>
                        <td><span className="badge badge-info">{item.short_name}</span></td>
                      </>
                    )}

                    {activeCategory === 'zamp-demographics' && (
                      <>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>#{item.DemographicsId || idx + 1}</td>
                        <td><span className="badge badge-info">{item.Code}</span></td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{item.Name}</td>
                        <td>
                          <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                            {item.QuestionType}
                          </span>
                        </td>
                      </>
                    )}

                    {activeCategory === 'zamp-groups' && (
                      <>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>#{item.GroupId || idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{item.GroupName}</td>
                        <td><span className="badge badge-success">{item.ActiveStudiesCount || 1} Studies</span></td>
                        <td style={{ color: '#475569', fontFamily: 'monospace', fontSize: '12px' }}>{item.ExclusionRule || 'N/A'}</td>
                      </>
                    )}

                    {activeCategory === 'zamp-categories' && (
                      <>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>#{item.CategoryId || idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{item.CategoryName}</td>
                        <td><span className="badge badge-info">Demand Marketplace</span></td>
                      </>
                    )}

                    {(activeCategory === 'languages' || activeCategory === 'industries' || activeCategory === 'types' || activeCategory === 'blocked-ips') && (
                      <>
                        <td style={{ color: '#94A3B8' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>
                          {item.LanguageId || item.IndustryId || item.SurveyTypeId || item.ip || item.code || idx + 1}
                        </td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>
                          {item.Name || item.LanguageCode || item.ipAddress || item.title || JSON.stringify(item)}
                        </td>
                        <td style={{ color: '#64748B', fontSize: '12px' }}>
                          {item.NativeName || item.Description || item.Code || 'Active Reference'}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No records found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
