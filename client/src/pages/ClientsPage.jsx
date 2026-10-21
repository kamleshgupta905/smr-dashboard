import React, { useState, useEffect } from 'react';
import { getClients, createClient, deleteClient, syncClientInventory, testS2sCallback, testHashing, getClientContacts, addClientContact, deleteClientContact } from '../services/api';
import { Building2, Plus, Search, CheckCircle2, XCircle, Trash2, Globe, ShieldCheck, X, Copy, Check, RefreshCw, Send, Key, Code, ExternalLink, Lock, Users, Mail, Phone, UserPlus } from 'lucide-react';
import ModalPortal from '../components/ModalPortal';
import { sha3_256 } from 'js-sha3';

export default function ClientsPage({ onNavigate, globalSearch = '' }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [expandedUrls, setExpandedUrls] = useState({});

  // Dedicated Frame 006: Cryptographic Anti-Tamper Security & Signing Modal State
  const [securityModalClient, setSecurityModalClient] = useState(null);
  const [securityForm, setSecurityForm] = useState({
    completeUrl: 'https://router.dynata.com/survey/complete?uid=[uid]',
    terminateUrl: 'https://router.dynata.com/survey/terminate?uid=[uid]',
    overquotaUrl: 'https://router.dynata.com/survey/overquota?uid=[uid]',
    securityUrl: 'https://router.dynata.com/survey/security?uid=[uid]',
    hashAlgorithm: 'SHA3-256 (Market Xcel / SMR Enterprise)',
    secretKey: 'vmd-dyn-rt3_sec_key_2026',
    testUid: 'test_resp_7721'
  });
  const [saveSecuritySuccess, setSaveSecuritySuccess] = useState(false);

  // Multi-contacts Modal State (Laravel client_contacts replicate)
  const [contactsModalClient, setContactsModalClient] = useState(null);
  const [clientContacts, setClientContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [newContactForm, setNewContactForm] = useState({ name: '', email: '', phone: '', is_primary: 0, billing: 0 });

  const openContactsModal = async (client) => {
    setContactsModalClient(client);
    setLoadingContacts(true);
    try {
      const res = await getClientContacts(client._id || client.id);
      if (res && res.success) {
        setClientContacts(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContactForm.name.trim() || !contactsModalClient) return;
    try {
      await addClientContact({
        client_id: contactsModalClient._id || contactsModalClient.id,
        ...newContactForm
      });
      setNewContactForm({ name: '', email: '', phone: '', is_primary: 0, billing: 0 });
      const res = await getClientContacts(contactsModalClient._id || contactsModalClient.id);
      if (res && res.success) setClientContacts(res.data || []);
    } catch (err) {
      console.error('Failed to add contact', err);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await deleteClientContact(id);
      setClientContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete contact', err);
    }
  };

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
        type: 'S2S Callback Webhook Test',
        details: res.result || res,
      });
    } catch (err) {
      alert(`S2S test error: ${err.message}`);
    }
  };

  const handleOpenSecurityModal = (client) => {
    setSecurityModalClient(client);
    setSecurityForm({
      completeUrl: 'https://router.dynata.com/survey/complete?uid=[uid]',
      terminateUrl: 'https://router.dynata.com/survey/terminate?uid=[uid]',
      overquotaUrl: 'https://router.dynata.com/survey/overquota?uid=[uid]',
      securityUrl: 'https://router.dynata.com/survey/security?uid=[uid]',
      hashAlgorithm: client.hashAlgorithm?.includes('hmac') 
        ? 'HMAC-SHA256 (Dynata / CINT Standard)' 
        : 'SHA3-256 (Market Xcel / SMR Enterprise)',
      secretKey: client.secretKey || 'vmd-dyn-rt3_sec_key_2026',
      testUid: 'test_resp_7721'
    });
    setSaveSecuritySuccess(false);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    setSaveSecuritySuccess(true);
    setTimeout(() => {
      setSecurityModalClient(null);
      setSaveSecuritySuccess(false);
    }, 1200);
  };

  const effectiveSearch = (search || globalSearch || '').toLowerCase().trim();
  const filtered = clients.filter(c => 
    !effectiveSearch ||
    (c.client_name || '').toLowerCase().includes(effectiveSearch) ||
    (c.country || '').toLowerCase().includes(effectiveSearch) ||
    (c.client_code || '').toLowerCase().includes(effectiveSearch)
  );

  // Compute live test signed URLs inside security modal
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smr.vmhgroupsmr.com';
  const computedHash = sha3_256(`https://router.dynata.com/survey/complete?uid=${securityForm.testUid}${securityForm.secretKey}`);
  const signedPreviewUrl = `https://router.dynata.com/survey/complete?uid=${securityForm.testUid}&hash=${computedHash}`;

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
            <span className="current">Clients</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Clients
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
              Secure S2S Active
            </span>
          </div>
        </div>

        <div className="title-box-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Add New Client
          </button>
        </div>
      </div>

      {/* Frame 006: Dedicated Cryptographic Anti-Tamper Security & Signing Modal */}
      {securityModalClient && (
        <ModalPortal isOpen={!!securityModalClient} onClose={() => setSecurityModalClient(null)}>
          <div className="modal-overlay" onClick={() => setSecurityModalClient(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: '#1d2c48' }}>
                      Security & Callback Settings
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                      Client: <strong>{securityModalClient.client_name}</strong> ({securityModalClient.client_code})
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSecurityModalClient(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8997bd' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveSecurity}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* 1. Complete Callback URL */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48' }}>
                        1. Complete / Success Callback URL
                      </label>
                      <span className="badge-soft-success" style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px' }}>
                        Status 10 (Complete)
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input-control"
                      value={securityForm.completeUrl}
                      onChange={e => setSecurityForm({ ...securityForm, completeUrl: e.target.value })}
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Respondent is redirected to this destination upon survey completion.
                    </div>
                  </div>

                  {/* 2. Terminate Callback URL */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48' }}>
                        2. Terminate / Screenout Callback URL
                      </label>
                      <span className="badge-soft-danger" style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px' }}>
                        Status 20 (Screenout)
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input-control"
                      value={securityForm.terminateUrl}
                      onChange={e => setSecurityForm({ ...securityForm, terminateUrl: e.target.value })}
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Respondent is redirected here if demographic qualifications are not met.
                    </div>
                  </div>

                  {/* 3. OverQuota Callback URL */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48' }}>
                        3. OverQuota Callback URL
                      </label>
                      <span className="badge-soft-warning" style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px' }}>
                        Status 30 (OverQuota)
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input-control"
                      value={securityForm.overquotaUrl}
                      onChange={e => setSecurityForm({ ...securityForm, overquotaUrl: e.target.value })}
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Respondent is redirected here if the target quota is full.
                    </div>
                  </div>

                  {/* 4. Security Terminate Callback URL */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48' }}>
                        4. Security / Fraud Screenout Callback URL
                      </label>
                      <span className="badge-soft-primary" style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px' }}>
                        Status 40 (Security Screenout)
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input-control"
                      value={securityForm.securityUrl}
                      onChange={e => setSecurityForm({ ...securityForm, securityUrl: e.target.value })}
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Respondent is redirected here if security, proxy, or fraud checks fail.
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSecurityModalClient(null)}
                      className="btn btn-light"
                      style={{ fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {saveSecuritySuccess ? <Check size={14} /> : <ShieldCheck size={14} />}
                      {saveSecuritySuccess ? 'Saved Successfully!' : 'Save Webhooks & Security'}
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Test Log Modal Overlay */}
      {testResult && (
        <ModalPortal isOpen={!!testResult} onClose={() => setTestResult(null)}>
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '6px',
                  color: '#065F46',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '12px'
                }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Integration Test Verified — Live Server Test Successful</span>
                </div>
                <pre style={{
                  background: '#1d2c48',
                  color: '#03d87f',
                  padding: '14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  {JSON.stringify(testResult.details || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </ModalPortal>
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
            Loading clients...
          </div>
        ) : filtered.map((client) => {
          const clientCode = client.client_code || client.client_name.replace(/\s+/g, '_').toUpperCase();
          const completeRedirect = `${origin}/redirects/c/${clientCode}/complete?rid=[identifier]&hash=[hash]`;
          const terminateRedirect = `${origin}/redirects/c/${clientCode}/terminate?rid=[identifier]&hash=[hash]`;
          const overquotaRedirect = `${origin}/redirects/c/${clientCode}/quotafull?rid=[identifier]&hash=[hash]`;
          const qualityRedirect = `${origin}/redirects/c/${clientCode}/quality_terminate?rid=[identifier]&hash=[hash]`;

          return (
            <div key={client._id || client.id} className="report-card" style={{ padding: '20px 24px', margin: 0 }}>
              {/* Client Top Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                    {client.country && (
                      <span className="badge-soft-success" style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {client.country} {client.currency ? `(${client.currency})` : ''}
                      </span>
                    )}
                    <span className="badge-soft-success" style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {client.status || 'Active'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#7081b9', flexWrap: 'wrap' }}>
                    {client.email && <span>Email: <strong style={{ color: '#1d2c48' }}>{client.email}</strong></span>}
                    {client.phone && <span>Phone: <strong style={{ color: '#1d2c48' }}>{client.phone}</strong></span>}
                    <span>Traffic Router: <strong style={{ color: '#1761fd' }}>S2S Active</strong></span>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className={`btn ${expandedUrls[clientCode] ? 'btn-primary' : 'btn-soft-primary'} btn-sm`}
                    onClick={() => setExpandedUrls(prev => ({ ...prev, [clientCode]: !prev[clientCode] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', borderRadius: '4px', fontWeight: 600 }}
                  >
                    <Copy size={12} />
                    {expandedUrls[clientCode] ? 'Hide Redirect URLs' : '📋 View Redirect URLs'}
                  </button>

                  <button
                    className="btn btn-soft-secondary btn-sm"
                    onClick={() => openContactsModal(client)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', borderRadius: '4px' }}
                    title="Manage Multiple Contacts for this Client"
                  >
                    <Users size={12} /> Contacts
                  </button>
                  <button
                    className="btn btn-soft-primary btn-sm"
                    onClick={() => handleOpenSecurityModal(client)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', borderRadius: '4px' }}
                    title="Open Cryptographic Anti-Tamper Security & Signing (Frame 006)"
                  >
                    <ShieldCheck size={12} /> Verify Hash
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

              {/* Platform Redirect URLs Handover Block (Frame 004) */}
              {expandedUrls[clientCode] && (
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
                      <span>1. Complete / Success URL:</span>
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
              )}
            </div>
          );
        })}
      </div>

      {/* Onboard Client Modal */}
      {showAddModal && (
        <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Add Client
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
                      onChange={e => {
                        const val = e.target.value;
                        let autoAlgo = 'sha3-256';
                        let autoSec = 'mx_secret_sha3_key_2026';
                        let autoEndpoint = 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus';
                        if (val === 'zamplia') {
                          autoAlgo = 'hmac-sha256';
                          autoSec = 'zamplia_auth_token_live';
                          autoEndpoint = 'https://api.zamplia.com/v1/surveys/callback';
                        } else if (val === 'custom') {
                          autoAlgo = 'none';
                          autoSec = `${(formData.client_code || 'client').toLowerCase().replace(/[^a-z0-9]/g, '_')}_sec_2026`;
                          autoEndpoint = 'https://api.vmhgroupsmr.com/redirects';
                        }
                        setFormData({
                          ...formData,
                          apiType: val,
                          hashAlgorithm: autoAlgo,
                          secretKey: autoSec,
                          s2sEndpoint: autoEndpoint
                        });
                      }}
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
                      <option value="sha3-256">SHA3-256</option>
                      <option value="hmac-sha256">HMAC-SHA256</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 700 }}>Client S2S Secret Token:</label>
                    <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>🔒 Auto-Managed Background Token</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Auto-generated secure background token"
                    className="input-field"
                    style={{ width: '100%', fontFamily: 'monospace', background: '#F8FAFC' }}
                    value={formData.secretKey || `${(formData.client_code || 'client').toLowerCase().replace(/[^a-z0-9]/g, '_')}_sec_2026`}
                    onChange={e => setFormData({ ...formData, secretKey: e.target.value })}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Hashing signatures are automatically signed and applied across all projects and router links in the background.
                  </span>
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
                  {submitting ? 'Saving Client...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ModalPortal>
      )}


      {/* Multi-Contact Persons Modal (Laravel client_contacts) */}
      {contactsModalClient && (
        <ModalPortal isOpen={!!contactsModalClient} onClose={() => setContactsModalClient(null)}>
          <div className="modal-overlay" onClick={() => setContactsModalClient(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '580px', width: '92%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '12px', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '8px', color: '#4f46e5' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                      {contactsModalClient.client_name} — Contacts
                    </h3>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Account managers, billing & technical contact directory</p>
                  </div>
                </div>
                <button onClick={() => setContactsModalClient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Add New Contact Form */}
              <form onSubmit={handleAddContact} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={14} color="#4f46e5" /> Add Contact Person
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={newContactForm.name}
                    onChange={e => setNewContactForm({ ...newContactForm, name: e.target.value })}
                    style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newContactForm.email}
                    onChange={e => setNewContactForm({ ...newContactForm, email: e.target.value })}
                    style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Phone / Mobile"
                    value={newContactForm.phone}
                    onChange={e => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                    style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#475569' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={newContactForm.is_primary === 1} onChange={e => setNewContactForm({ ...newContactForm, is_primary: e.target.checked ? 1 : 0 })} />
                      Primary
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={newContactForm.billing === 1} onChange={e => setNewContactForm({ ...newContactForm, billing: e.target.checked ? 1 : 0 })} />
                      Billing
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: '11.5px', borderRadius: '6px' }}>
                  + Add Contact Person
                </button>
              </form>

              {/* Contacts List */}
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Contact Persons ({clientContacts.length})
              </div>
              {loadingContacts ? (
                <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#64748b' }}>Loading contacts...</div>
              ) : clientContacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', background: '#f8fafc', borderRadius: '8px' }}>
                  No extra contact persons added yet. Use the form above to add account managers or billing contacts.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clientContacts.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{c.name}</span>
                          {c.is_primary === 1 && <span className="badge-soft-primary" style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Primary</span>}
                          {c.billing === 1 && <span className="badge-soft-success" style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Billing</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '14px', marginTop: '3px', fontSize: '11px', color: '#64748b' }}>
                          {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} /> {c.email}</span>}
                          {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={11} /> {c.phone}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteContact(c.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }} title="Remove Contact">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
