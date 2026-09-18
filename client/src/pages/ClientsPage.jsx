import React, { useState, useEffect } from 'react';
import { getClients, createClient, deleteClient, syncClientInventory, testS2sCallback, testHashing } from '../services/api';
import { Building2, Plus, Search, CheckCircle2, XCircle, Trash2, Globe, ShieldCheck, X, Copy, Check, RefreshCw, Send, Key, Code } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const [formData, setFormData] = useState({
    client_name: '',
    client_code: '',
    country: 'United States',
    currency: 'USD',
    apiType: 'marketxcel',
    apiUrl: 'https://api.marketxcel.co.in/webservices/supplier/send_supplier_data',
    supplierId: '7353212849',
    apiToken: 'mx_token_live_2026',
    hashAlgorithm: 'sha3-256',
    secretKey: 'mx_secret_sha3_key_2026',
    s2sEnabled: true,
    s2sEndpoint: 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const list = await getClients();
      setClients(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load clients:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.client_name.trim()) return;
    setSubmitting(true);
    try {
      await createClient(formData);
      setShowAddModal(false);
      setFormData({
        client_name: '',
        client_code: '',
        country: 'United States',
        currency: 'USD',
        apiType: 'marketxcel',
        apiUrl: '',
        supplierId: '',
        apiToken: '',
        hashAlgorithm: 'sha3-256',
        secretKey: '',
        s2sEnabled: true,
        s2sEndpoint: '',
      });
      await loadData();
    } catch (err) {
      console.error('Failed to add client:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this client integration?')) return;
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => (c._id !== id && c.id != id)));
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSync = async (clientCode) => {
    setSyncingId(clientCode);
    try {
      const res = await syncClientInventory(clientCode);
      alert(`✓ Synchronized ${res.count || 0} projects from ${res.client || clientCode}!`);
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleTestS2s = async (client) => {
    try {
      const res = await testS2sCallback({
        clientCode: client.client_code,
        respondentId: `RESP_${client.client_code}_${Date.now().toString().slice(-4)}`,
        status: 1,
      });
      setTestResult({
        client: client.client_name,
        type: 'S2S Callback Test',
        details: res.result,
      });
    } catch (err) {
      alert(`S2S test error: ${err.message}`);
    }
  };

  const handleTestHash = async (client) => {
    try {
      const res = await testHashing({
        baseUrl: `https://cluster.marketxcel.co.in/survey/thankyou?auth=1&uid=DEMO_USER_99`,
        secretKey: client.secretKey || 'mx_secret_sha3_key_2026',
        algorithm: client.hashAlgorithm || 'sha3-256',
      });
      setTestResult({
        client: client.client_name,
        type: `Hashing Verification (${res.algorithm})`,
        details: res,
      });
    } catch (err) {
      alert(`Hashing test error: ${err.message}`);
    }
  };

  const filtered = clients.filter(c => 
    (c.client_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.country || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.client_code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Integrations</span>
            <span className="separator">/</span>
            <span className="current">Demand Clients</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Demand Clients & Buyer Integrations
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
              <ShieldCheck size={12} />
              S2S & SHA3-256 Hashing Active
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Onboard New Client
          </button>
        </div>
      </div>

      {/* Test Log Modal Overlay */}
      {testResult && (
        <div className="modal-overlay" onClick={() => setTestResult(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1d2c48' }}>
                {testResult.type} — {testResult.client}
              </h3>
              <button onClick={() => setTestResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8997bd' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '16px' }}>
              <pre style={{
                background: '#1d2c48',
                color: '#03d87f',
                padding: '14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'monospace',
                overflowX: 'auto',
                margin: 0
              }}>
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Filter / Search Bar (Dastone Report Card) */}
      <div className="report-card" style={{ padding: '12px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Search size={14} color="#8997bd" />
        <input
          type="text"
          className="input-control"
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', background: 'transparent' }}
          placeholder="Filter clients by name, code (e.g. MX_DEMAND, ZAMP_GLOBAL), or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clients Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div className="report-card" style={{ padding: '40px', textAlign: 'center', color: '#8997bd' }}>
            Loading enterprise demand clients...
          </div>
        ) : filtered.map((client) => {
          const clientCode = client.client_code || client.client_name.replace(/\s+/g, '_').toUpperCase();
          const host = window.location.origin.replace(':3000', ':5000');
          const completeRedirect = `${host}/redirects/c/${clientCode}/complete?rid=[identifier]&hash=[hash]`;
          const terminateRedirect = `${host}/redirects/c/${clientCode}/terminate?rid=[identifier]&hash=[hash]`;
          const overquotaRedirect = `${host}/redirects/c/${clientCode}/quotafull?rid=[identifier]&hash=[hash]`;
          const qualityRedirect = `${host}/redirects/c/${clientCode}/quality_terminate?rid=[identifier]&hash=[hash]`;

          return (
            <div key={client._id || client.id} className="report-card" style={{ padding: '20px 24px', margin: 0 }}>
              {/* Client Top Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1d2c48', margin: 0 }}>
                      {client.client_name}
                    </h2>
                    <span className="badge-soft-primary" style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      Code: {clientCode}
                    </span>
                    <span className="badge-soft-success" style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {client.country} ({client.currency})
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#7081b9' }}>
                    <span>API Standard: <strong style={{ color: '#1d2c48' }}>{client.apiType?.toUpperCase()}</strong></span>
                    <span>Hashing Spec: <strong style={{ color: '#1761fd' }}>{client.hashAlgorithm?.toUpperCase()}</strong></span>
                    <span>S2S Callback: <strong style={{ color: '#03d87f' }}>Active (updateRespondentStatus)</strong></span>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-soft-secondary btn-sm"
                    onClick={() => handleSync(clientCode)}
                    disabled={syncingId === clientCode}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', borderRadius: '4px' }}
                  >
                    <RefreshCw size={12} className={syncingId === clientCode ? 'spinner' : ''} />
                    Sync Projects
                  </button>

                  <button
                    className="btn btn-soft-primary btn-sm"
                    onClick={() => handleTestHash(client)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', borderRadius: '4px' }}
                  >
                    <Key size={12} /> Verify SHA3
                  </button>

                  <button
                    className="btn btn-soft-success btn-sm"
                    onClick={() => handleTestS2s(client)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', borderRadius: '4px' }}
                  >
                    <Send size={12} /> Test S2S
                  </button>

                  <button
                    className="btn btn-soft-danger btn-sm"
                    onClick={() => handleDelete(client._id || client.id)}
                    style={{ padding: '4px 8px', borderRadius: '4px' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Platform Redirect URLs Handover Block */}
              <div style={{
                marginTop: '16px',
                padding: '14px 16px',
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  📋 Provide These Redirect URLs To {client.client_name}:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {/* Complete */}
                  <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#16A34A' }}>
                      <span>1. Complete Redirect URL:</span>
                      <span 
                        onClick={() => handleCopy(completeRedirect, `${clientCode}-comp`)} 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        {copiedKey === `${clientCode}-comp` ? <Check size={12} color="#16A34A" /> : <Copy size={12} />} Copy
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                      {completeRedirect}
                    </div>
                  </div>

                  {/* Terminate */}
                  <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#DC2626' }}>
                      <span>2. Terminate / Screenout URL:</span>
                      <span 
                        onClick={() => handleCopy(terminateRedirect, `${clientCode}-term`)} 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        {copiedKey === `${clientCode}-term` ? <Check size={12} color="#16A34A" /> : <Copy size={12} />} Copy
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                      {terminateRedirect}
                    </div>
                  </div>

                  {/* Overquota */}
                  <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#D97706' }}>
                      <span>3. OverQuota URL:</span>
                      <span 
                        onClick={() => handleCopy(overquotaRedirect, `${clientCode}-oq`)} 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        {copiedKey === `${clientCode}-oq` ? <Check size={12} color="#16A34A" /> : <Copy size={12} />} Copy
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                      {overquotaRedirect}
                    </div>
                  </div>

                  {/* Quality Terminate */}
                  <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#9333EA' }}>
                      <span>4. Quality / Security Terminate:</span>
                      <span 
                        onClick={() => handleCopy(qualityRedirect, `${clientCode}-sec`)} 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        {copiedKey === `${clientCode}-sec` ? <Check size={12} color="#16A34A" /> : <Copy size={12} />} Copy
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                      {qualityRedirect}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Client Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Onboard Enterprise Demand Client
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0 0 0' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Client Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Market Xcel, German Auto Client GmbH"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={formData.client_name}
                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Client Code:</label>
                    <input
                      type="text"
                      placeholder="e.g. MX_DEMAND, DE_AUTO"
                      className="input-field"
                      style={{ width: '100%' }}
                      value={formData.client_code}
                      onChange={e => setFormData({ ...formData, client_code: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Market Country:</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '100%' }}
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>API Architecture:</label>
                    <select
                      className="input-field"
                      style={{ width: '100%' }}
                      value={formData.apiType}
                      onChange={e => setFormData({ ...formData, apiType: e.target.value })}
                    >
                      <option value="marketxcel">Market Xcel Demand API</option>
                      <option value="zamplia">Zamplia Supply API</option>
                      <option value="custom">German Client / Custom REST</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Hashing Security:</label>
                    <select
                      className="input-field"
                      style={{ width: '100%' }}
                      value={formData.hashAlgorithm}
                      onChange={e => setFormData({ ...formData, hashAlgorithm: e.target.value })}
                    >
                      <option value="sha3-256">SHA3-256 (Market Xcel Spec)</option>
                      <option value="hmac-sha256">HMAC-SHA256 (Zamplia Spec)</option>
                      <option value="none">None (Standard)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Client S2S Secret Token:</label>
                  <input
                    type="text"
                    placeholder="Enter secret token for SHA3-256 hashing"
                    className="input-field"
                    style={{ width: '100%', fontFamily: 'monospace' }}
                    value={formData.secretKey}
                    onChange={e => setFormData({ ...formData, secretKey: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>S2S Callback Webhook Endpoint:</label>
                  <input
                    type="text"
                    placeholder="https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus"
                    className="input-field"
                    style={{ width: '100%', fontFamily: 'monospace' }}
                    value={formData.s2sEndpoint}
                    onChange={e => setFormData({ ...formData, s2sEndpoint: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                >
                  {submitting ? 'Generating Integration...' : '✓ Complete Client Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
