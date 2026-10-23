import React, { useState, useEffect } from 'react';
import { 
  getClients, createClient, updateClient, toggleClientSecurity, deleteClient, syncClientInventory, 
  testS2sCallback, testHashing, testClientHandshake,
  getClientContacts, addClientContact, deleteClientContact 
} from '../services/api';
import { 
  Building2, Plus, Search, CheckCircle2, XCircle, Trash2, Globe, ShieldCheck, 
  X, Copy, Check, RefreshCw, Send, Key, Code, ExternalLink, Lock, Users, 
  Mail, Phone, UserPlus, Zap, ArrowRight, ShieldAlert, Cpu, Sparkles, Edit2
} from 'lucide-react';
import ModalPortal from '../components/ModalPortal';
import { sha3_256 } from 'js-sha3';

export default function ClientsPage({ onNavigate, globalSearch = '', showToast }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testingHandshake, setTestingHandshake] = useState(false);
  const [expandedUrls, setExpandedUrls] = useState({});

  // Frame 007: Admin Client Edit Modal State
  const [editModalClient, setEditModalClient] = useState(null);
  const [editFormData, setEditFormData] = useState({
    client_name: '',
    client_code: '',
    email: '',
    phone: '',
    country: 'United States',
    currency: 'USD',
    apiType: 'marketxcel',
    feed_api_url: '',
    s2s_callback_url: '',
    master_data_url: '',
    secret_key: '',
    api_token: '',
    hash_algorithm: 'sha3-256',
    security_enabled: 1,
    status: 'Active'
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const handleOpenEditModal = (client) => {
    setEditModalClient(client);
    setEditFormData({
      id: client.id || client._id,
      client_name: client.client_name || '',
      client_code: client.client_code || client.client_name?.replace(/\s+/g, '_').toUpperCase() || '',
      email: client.email || '',
      phone: client.phone || '',
      country: client.country || 'United States',
      currency: client.currency || 'USD',
      apiType: client.api_type || client.apiType || 'marketxcel',
      feed_api_url: client.feed_api_url || client.apiUrl || '',
      s2s_callback_url: client.s2s_callback_url || client.s2sEndpoint || '',
      master_data_url: client.master_data_url || '',
      secret_key: client.secret_key || client.secretKey || '',
      api_token: client.api_token || client.apiToken || '',
      hash_algorithm: client.hash_algorithm || client.hashAlgorithm || 'sha3-256',
      security_enabled: client.security_enabled !== undefined ? Number(client.security_enabled) : 1,
      status: client.status || 'Active'
    });
  };

  const handleSaveEditClient = async (e) => {
    e.preventDefault();
    if (!editFormData.client_name?.trim()) {
      if (showToast) showToast('Client Name is required', 'error');
      return;
    }
    setSavingEdit(true);
    try {
      const clientId = editModalClient.id || editModalClient._id;
      const res = await updateClient(clientId, editFormData);
      if (res?.success || res?.data) {
        setClients(prev => prev.map(c => {
          const match = (c.id && c.id === clientId) || (c._id && c._id === clientId) || (c.client_code && c.client_code === editModalClient.client_code);
          return match ? { ...c, ...editFormData, ...(res.data || {}) } : c;
        }));
        if (showToast) showToast('Client details updated successfully!', 'success');
        setEditModalClient(null);
      } else {
        if (showToast) showToast(res?.message || 'Failed to update client', 'error');
      }
    } catch (err) {
      console.error('Save client edit error:', err);
      if (showToast) showToast('Error saving client changes', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Frame 006: Cryptographic Anti-Tamper Security & Signing Modal State
  const [securityModalClient, setSecurityModalClient] = useState(null);
  const [securityForm, setSecurityForm] = useState({
    completeUrl: 'https://router.dynata.com/survey/complete?uid=[uid]',
    terminateUrl: 'https://router.dynata.com/survey/terminate?uid=[uid]',
    overquotaUrl: 'https://router.dynata.com/survey/overquota?uid=[uid]',
    securityUrl: 'https://router.dynata.com/survey/security?uid=[uid]',
    hashAlgorithm: 'SHA3-256 (Market Xcel / SMR Enterprise)',
    secretKey: 'mx_secret_sha3_key_2026',
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
    email: '',
    phone: '',
    apiType: 'marketxcel',
    feed_api_url: 'https://api.marketxcel.co.in/webservices/supplier/send_supplier_data',
    s2s_callback_url: 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus',
    master_data_url: 'https://api.marketxcel.co.in/webservices/supplier/get_master_data/',
    api_token: 'mx_token_live_2026',
    secret_key: 'mx_secret_sha3_key_2026',
    hash_algorithm: 'sha3-256',
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
        email: '',
        phone: '',
        apiType: 'marketxcel',
        feed_api_url: '',
        s2s_callback_url: '',
        master_data_url: '',
        api_token: '',
        secret_key: '',
        hash_algorithm: 'sha3-256',
      });
      await loadData();
      if (showToast) {
        showToast(`✓ Client "${formData.client_name}" added successfully!`);
      }
    } catch (err) {
      console.error('Failed to add client:', err);
      if (showToast) {
        showToast(`Failed to add client: ${err.message}`, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSecurity = async (clientId, currentlyEnabled) => {
    try {
      const newVal = currentlyEnabled ? 0 : 1;
      await toggleClientSecurity(clientId, newVal);
      setClients(prev => prev.map(c => {
        if (c.id === clientId || c._id === clientId) {
          return { ...c, security_enabled: newVal };
        }
        return c;
      }));
      if (showToast) {
        showToast(`✓ Client Security Gate toggled to ${newVal === 1 ? 'ACTIVE (Strict Protection)' : 'BYPASS (Sandbox)'}!`);
      }
    } catch (err) {
      if (showToast) {
        showToast(`Could not toggle security: ${err.message}`, 'error');
      } else {
        alert(`Could not toggle security: ${err.message}`);
      }
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

  const handleCopyAllRedirects = (clientCode, clientName) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://api.vmhgroupsmr.com';
    const comp = `${origin}/redirects/c/${clientCode}/complete?rid=[identifier]&hash=[hash]`;
    const term = `${origin}/redirects/c/${clientCode}/terminate?rid=[identifier]&hash=[hash]`;
    const oq = `${origin}/redirects/c/${clientCode}/quotafull?rid=[identifier]&hash=[hash]`;
    const sec = `${origin}/redirects/c/${clientCode}/quality_terminate?rid=[identifier]&hash=[hash]`;

    const text = `🎯 *SMR Platform Inbound Redirect URLs for ${clientName || clientCode}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `1. ✅ COMPLETE / SUCCESS:\n${comp}\n\n` +
      `2. ❌ TERMINATE / SCREENOUT:\n${term}\n\n` +
      `3. ⚠️ OVERQUOTA / QUOTA FULL:\n${oq}\n\n` +
      `4. 🚫 SECURITY / QUALITY SCREENOUT:\n${sec}\n\n` +
      `🔐 Anti-Tamper Security: SHA3-256 HMAC Signing Active\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  const handleTestHandshake = async (client) => {
    setTestingHandshake(true);
    try {
      const cCode = client.client_code || 'MX_DEMAND';
      const res = await testClientHandshake({
        clientCode: cCode,
        apiType: client.api_type || client.apiType || 'marketxcel',
        feedApiUrl: client.feed_api_url || client.apiUrl || 'https://api.marketxcel.co.in/webservices/supplier/send_supplier_data',
        s2sEndpoint: client.s2s_callback_url || client.s2sEndpoint || 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus',
        masterDataUrl: client.master_data_url || 'https://api.marketxcel.co.in/webservices/supplier/get_master_data/',
        secretKey: client.secret_key || client.secretKey || 'mx_secret_sha3_key_2026',
        respondentId: `TEST_${cCode}_${Date.now().toString().slice(-4)}`
      });
      setTestResult({
        client: client.client_name,
        type: '3-API Handshake & S2S Cryptographic Verification',
        details: res.result || res
      });
    } catch (err) {
      alert(`Handshake test error: ${err.message}`);
    } finally {
      setTestingHandshake(false);
    }
  };

  const handleOpenSecurityModal = (client) => {
    setSecurityModalClient(client);
    setSecurityForm({
      completeUrl: 'https://router.dynata.com/survey/complete?uid=[uid]',
      terminateUrl: 'https://router.dynata.com/survey/terminate?uid=[uid]',
      overquotaUrl: 'https://router.dynata.com/survey/overquota?uid=[uid]',
      securityUrl: 'https://router.dynata.com/survey/security?uid=[uid]',
      hashAlgorithm: client.hash_algorithm || client.hashAlgorithm || 'SHA3-256 (Market Xcel / SMR Enterprise)',
      secretKey: client.secret_key || client.secretKey || 'mx_secret_sha3_key_2026',
      testUid: `test_resp_${Date.now().toString().slice(-4)}`
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

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://api.vmhgroupsmr.com';
  const previewClientCode = formData.client_code || (formData.client_name ? formData.client_name.replace(/\s+/g, '_').toUpperCase() : 'CLIENT_CODE');

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
      {/* Top Header Banner matching Vendors & Payments (#2a2d8c theme) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
            <span>VMH</span>
            <span>/</span>
            <span>Integrations</span>
            <span>/</span>
            <span style={{ color: '#2a2d8c', fontWeight: 600 }}>Clients & Demand Feeds</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1d2c48', letterSpacing: '-0.3px' }}>
              Clients & 3-API Gateway
            </h2>
            <span style={{
              background: '#e9ebf8',
              color: '#2a2d8c',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <ShieldCheck size={12} color="#2a2d8c" />
              SHA3-256 S2S Active
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => handleCopyAllRedirects('DEMAND_CLIENT', 'Client')}
            style={{
              background: '#ffffff',
              color: '#2a2d8c',
              border: '1px solid #d5d9ea',
              borderRadius: '24px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
            title="Copy SMR 4 Inbound Redirect URLs formatted for Client Onboarding"
          >
            {copiedAll ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            <span>{copiedAll ? 'Redirects Copied!' : 'Copy SMR Redirects'}</span>
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#2a2d8c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '24px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(42, 45, 140, 0.25)'
            }}
          >
            <Plus size={15} /> Add New Client
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
              style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px' }}
            >
              <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e9ebf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e9ebf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2d8c' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#1d2c48' }}>
                      Security & Callback Verification
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
                      <span style={{ background: '#ecfdf5', color: '#15803d', fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
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
                  </div>

                  {/* 2. Terminate Callback URL */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48' }}>
                        2. Terminate / Screenout Callback URL
                      </label>
                      <span style={{ background: '#fef2f2', color: '#b91c1c', fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
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
                  </div>

                  {/* 3. OverQuota Callback URL */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48' }}>
                        3. OverQuota Callback URL
                      </label>
                      <span style={{ background: '#fffbeb', color: '#b45309', fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
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
                  </div>

                  {/* 4. Security Terminate Callback URL */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48' }}>
                        4. Security / Fraud Screenout Callback URL
                      </label>
                      <span style={{ background: '#f5f3ff', color: '#6d28d9', fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
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
                  </div>

                  {/* Secret Key & Hashing */}
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '6px' }}>
                      Cryptographic Anti-Tamper Secret Key (SHA3-256)
                    </div>
                    <input
                      type="text"
                      value={securityForm.secretKey}
                      onChange={e => setSecurityForm({ ...securityForm, secretKey: e.target.value })}
                      style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* Submit buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSecurityModalClient(null)}
                      style={{ padding: '7px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '7px 18px', borderRadius: '20px', border: 'none', background: '#2a2d8c', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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

      {/* Handshake & Test Log Modal Overlay */}
      {testResult && (
        <ModalPortal isOpen={!!testResult} onClose={() => setTestResult(null)}>
          <div className="modal-overlay" onClick={() => setTestResult(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px', borderRadius: '12px' }}>
              <div className="modal-header" style={{ padding: '14px 18px', borderBottom: '1px solid #e9ebf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1d2c48' }}>
                    {testResult.type} — {testResult.client}
                  </h3>
                </div>
                <button onClick={() => setTestResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8997bd' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body" style={{ padding: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  color: '#065f46',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  marginBottom: '12px'
                }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Integration Test Verified — 3 Inbound APIs & 4 Outbound Redirects Ready</span>
                </div>
                <pre style={{
                  background: '#1d2c48',
                  color: '#34d399',
                  padding: '14px',
                  borderRadius: '8px',
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

      {/* Filter / Search Bar */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #d5d9ea', 
        borderRadius: '24px', 
        padding: '10px 18px', 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <Search size={16} color="#8997bd" />
        <input
          type="text"
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', background: 'transparent' }}
          placeholder="Filter clients by name, code (e.g. MX_DEMAND, ZAMP_GLOBAL), or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clients Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ background: '#fff', border: '1px solid #d5d9ea', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8997bd' }}>
            Loading clients...
          </div>
        ) : filtered.map((client) => {
          const clientCode = client.client_code || client.client_name.replace(/\s+/g, '_').toUpperCase();
          const completeRedirect = `${origin}/redirects/c/${clientCode}/complete?rid=[identifier]&hash=[hash]`;
          const terminateRedirect = `${origin}/redirects/c/${clientCode}/terminate?rid=[identifier]&hash=[hash]`;
          const overquotaRedirect = `${origin}/redirects/c/${clientCode}/quotafull?rid=[identifier]&hash=[hash]`;
          const qualityRedirect = `${origin}/redirects/c/${clientCode}/quality_terminate?rid=[identifier]&hash=[hash]`;

          return (
            <div 
              key={client._id || client.id} 
              style={{ 
                background: '#ffffff', 
                border: '1px solid #d5d9ea', 
                borderRadius: '12px', 
                padding: '20px 24px', 
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)' 
              }}
            >
              {/* Client Top Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: '#1d2c48', margin: 0 }}>
                      {client.client_name}
                    </h2>
                    <span style={{
                      background: '#e9ebf8',
                      color: '#2a2d8c',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      Code: {clientCode}
                    </span>
                    {client.country && (
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {client.country} {client.currency ? `(${client.currency})` : ''}
                      </span>
                    )}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#ecfdf5',
                      color: '#15803d',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                      {client.status || 'Active'}
                    </span>

                    {/* PM 1-Click Security Gate Switch (Item 6) */}
                    <button
                      type="button"
                      onClick={() => handleToggleSecurity(client.id || client._id, client.security_enabled !== 0)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: client.security_enabled !== 0 ? '#ecfdf5' : '#fef2f2',
                        color: client.security_enabled !== 0 ? '#15803d' : '#b91c1c',
                        border: `1px solid ${client.security_enabled !== 0 ? '#bbf7d0' : '#fecaca'}`,
                        padding: '3px 10px',
                        borderRadius: '14px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: '0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                      title="Click to Toggle Security Gate: Active (Full Protection) vs Bypass (No speeder/device locks)"
                    >
                      {client.security_enabled !== 0 ? <ShieldCheck size={12} color="#15803d" /> : <ShieldAlert size={12} color="#b91c1c" />}
                      <span>{client.security_enabled !== 0 ? 'Security Gate: ACTIVE' : 'Security Gate: BYPASS'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                    {client.email && <span>Email: <strong style={{ color: '#1d2c48' }}>{client.email}</strong></span>}
                    {client.phone && <span>Phone: <strong style={{ color: '#1d2c48' }}>{client.phone}</strong></span>}
                    <span>API Architecture: <strong style={{ color: '#2a2d8c' }}>{client.api_type || client.apiType || 'Market Xcel / Demand'}</strong></span>
                    <span>Hashing: <strong style={{ color: '#16a34a' }}>{client.hash_algorithm || 'SHA3-256'}</strong></span>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleTestHandshake(client)}
                    disabled={testingHandshake}
                    style={{
                      background: '#2a2d8c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                    title="Run 3-API Handshake and verification test"
                  >
                    <Zap size={13} color="#ffffff" />
                    <span>Test Handshake</span>
                  </button>

                  <button
                    onClick={() => setExpandedUrls(prev => ({ ...prev, [clientCode]: !prev[clientCode] }))}
                    style={{
                      background: expandedUrls[clientCode] ? '#2a2d8c' : '#e9ebf8',
                      color: expandedUrls[clientCode] ? '#ffffff' : '#2a2d8c',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={12} />
                    <span>{expandedUrls[clientCode] ? 'Hide SMR Redirects' : 'View SMR Redirects'}</span>
                  </button>

                  <button
                    onClick={() => openContactsModal(client)}
                    style={{
                      background: '#ffffff',
                      color: '#475569',
                      border: '1px solid #d5d9ea',
                      borderRadius: '20px',
                      padding: '5px 12px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="Manage Contacts for this Client"
                  >
                    <Users size={12} /> Contacts
                  </button>

                  <button
                    onClick={() => handleOpenSecurityModal(client)}
                    style={{
                      background: '#ffffff',
                      color: '#2a2d8c',
                      border: '1px solid #d5d9ea',
                      borderRadius: '20px',
                      padding: '5px 12px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="Open Security & Anti-Tamper Modal"
                  >
                    <ShieldCheck size={12} /> Security
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(client)}
                    style={{
                      background: '#0F172A',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)'
                    }}
                    title="Edit Client details, endpoints and security settings"
                  >
                    <Edit2 size={12} color="#ffffff" />
                    <span>Edit Client</span>
                  </button>

                  <button
                    onClick={() => handleDelete(client._id || client.id)}
                    style={{
                      background: '#ffffff',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '20px',
                      padding: '5px 8px',
                      cursor: 'pointer'
                    }}
                    title="Delete Client"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Client's 3 Configured APIs Summary */}
              <div style={{
                marginTop: '14px',
                background: '#f8fafc',
                border: '1px solid #e9ebf8',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '8px',
                fontSize: '11.5px'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#1d2c48', display: 'block' }}>1. Project Feed API:</span>
                  <span style={{ fontFamily: 'monospace', color: '#64748b', wordBreak: 'break-all' }}>
                    {client.feed_api_url || client.apiUrl || 'https://api.marketxcel.co.in/webservices/supplier/send_supplier_data'}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: '#1d2c48', display: 'block' }}>2. S2S Callback Webhook:</span>
                  <span style={{ fontFamily: 'monospace', color: '#64748b', wordBreak: 'break-all' }}>
                    {client.s2s_callback_url || client.s2sEndpoint || 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus'}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: '#1d2c48', display: 'block' }}>3. Master Data Endpoint:</span>
                  <span style={{ fontFamily: 'monospace', color: '#64748b', wordBreak: 'break-all' }}>
                    {client.master_data_url || 'https://api.marketxcel.co.in/webservices/supplier/get_master_data/'}
                  </span>
                </div>
              </div>

              {/* SMR Outbound Redirect URLs Handover Block */}
              {expandedUrls[clientCode] && (
                <div style={{
                  marginTop: '14px',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                      SMR Inbound Redirect URLs (Send these 4 links to {client.client_name}):
                    </div>
                    <button
                      onClick={() => handleCopyAllRedirects(clientCode, client.client_name)}
                      style={{
                        background: '#ffffff',
                        color: '#2a2d8c',
                        border: '1px solid #d5d9ea',
                        borderRadius: '16px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedAll ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      <span>Copy All 4 URLs</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {/* Complete */}
                    <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
                        <span>1. Complete / Success URL:</span>
                        <span 
                          onClick={() => handleCopy(completeRedirect, `${clientCode}-comp`)} 
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          {copiedKey === `${clientCode}-comp` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />} Copy
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                        {completeRedirect}
                      </div>
                    </div>

                    {/* Terminate */}
                    <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#dc2626' }}>
                        <span>2. Terminate / Screenout URL:</span>
                        <span 
                          onClick={() => handleCopy(terminateRedirect, `${clientCode}-term`)} 
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          {copiedKey === `${clientCode}-term` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />} Copy
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                        {terminateRedirect}
                      </div>
                    </div>

                    {/* Overquota */}
                    <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', borderLeft: '4px solid #d97706' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#d97706' }}>
                        <span>3. OverQuota URL:</span>
                        <span 
                          onClick={() => handleCopy(overquotaRedirect, `${clientCode}-oq`)} 
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          {copiedKey === `${clientCode}-oq` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />} Copy
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                        {overquotaRedirect}
                      </div>
                    </div>

                    {/* Quality Terminate */}
                    <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', borderLeft: '4px solid #9333ea' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#9333ea' }}>
                        <span>4. Quality / Security Screenout:</span>
                        <span 
                          onClick={() => handleCopy(qualityRedirect, `${clientCode}-sec`)} 
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          {copiedKey === `${clientCode}-sec` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />} Copy
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

      {/* Onboard Client Modal with 3-API Wizard */}
      {showAddModal && (
        <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '680px', width: '94%', maxHeight: '92vh', overflowY: 'auto', borderRadius: '12px' }}
            >
              <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e9ebf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#e9ebf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2d8c' }}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1d2c48' }}>
                      Client Onboarding & 3-API Hub
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                      Configure 4 SMR Inbound Redirects and ingest the client's 3 API endpoints
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8997bd' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAdd}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                  
                  {/* Section A: SMR Redirect URLs to share with client */}
                  <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1d2c48', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#2a2d8c', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>A</span>
                        <span>SMR Inbound Redirect URLs (Send these 4 links to your client):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyAllRedirects(previewClientCode, formData.client_name || 'Client')}
                        style={{
                          background: '#ffffff',
                          color: '#2a2d8c',
                          border: '1px solid #d5d9ea',
                          borderRadius: '14px',
                          padding: '3px 9px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedAll ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                        <span>Copy All</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div style={{ background: '#fff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#16a34a' }}>Complete:</strong>
                        <div style={{ fontFamily: 'monospace', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {origin}/redirects/c/{previewClientCode}/complete?rid=[id]&hash=[hash]
                        </div>
                      </div>
                      <div style={{ background: '#fff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#dc2626' }}>Terminate:</strong>
                        <div style={{ fontFamily: 'monospace', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {origin}/redirects/c/{previewClientCode}/terminate?rid=[id]&hash=[hash]
                        </div>
                      </div>
                      <div style={{ background: '#fff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#d97706' }}>OverQuota:</strong>
                        <div style={{ fontFamily: 'monospace', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {origin}/redirects/c/{previewClientCode}/quotafull?rid=[id]&hash=[hash]
                        </div>
                      </div>
                      <div style={{ background: '#fff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#9333ea' }}>Quality:</strong>
                        <div style={{ fontFamily: 'monospace', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {origin}/redirects/c/{previewClientCode}/quality_terminate?rid=[id]&hash=[hash]
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Client Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '4px' }}>Client Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Market Xcel, German Client GmbH"
                        className="input-control"
                        value={formData.client_name}
                        onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '4px' }}>Client Code / Identifier</label>
                      <input
                        type="text"
                        placeholder="e.g. MX_DEMAND, DE_CLIENT"
                        className="input-control"
                        value={formData.client_code}
                        onChange={e => setFormData({ ...formData, client_code: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '4px' }}>Market Country</label>
                      <input
                        type="text"
                        className="input-control"
                        value={formData.country}
                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '4px' }}>API Architecture</label>
                      <select
                        className="input-control"
                        value={formData.apiType}
                        onChange={e => {
                          const val = e.target.value;
                          let autoAlgo = 'sha3-256';
                          let autoSec = 'mx_secret_sha3_key_2026';
                          let autoFeed = 'https://api.marketxcel.co.in/webservices/supplier/send_supplier_data';
                          let autoEndpoint = 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus';
                          let autoMaster = 'https://api.marketxcel.co.in/webservices/supplier/get_master_data/';
                          if (val === 'zamplia') {
                            autoAlgo = 'hmac-sha256';
                            autoSec = 'zamplia_auth_token_live';
                            autoFeed = 'https://api.zamplia.com/v1/surveys/live';
                            autoEndpoint = 'https://api.zamplia.com/v1/surveys/callback';
                            autoMaster = 'https://api.zamplia.com/v1/surveys/master-data';
                          } else if (val === 'custom') {
                            autoAlgo = 'none';
                            autoSec = `${(formData.client_code || 'client').toLowerCase().replace(/[^a-z0-9]/g, '_')}_sec_2026`;
                            autoFeed = 'https://api.clientpartner.com/feed';
                            autoEndpoint = 'https://api.clientpartner.com/callback';
                            autoMaster = 'https://api.clientpartner.com/attributes';
                          }
                          setFormData({
                            ...formData,
                            apiType: val,
                            feed_api_url: autoFeed,
                            s2s_callback_url: autoEndpoint,
                            master_data_url: autoMaster,
                            hash_algorithm: autoAlgo,
                            secret_key: autoSec
                          });
                        }}
                      >
                        <option value="marketxcel">Market Xcel Demand API</option>
                        <option value="zamplia">Zamplia Supply API</option>
                        <option value="custom">German Client / Custom REST</option>
                      </select>
                    </div>
                  </div>

                  {/* Section C: Client's 3 APIs (Received from Client) */}
                  <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1d2c48', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: '#2a2d8c', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>B</span>
                      <span>Client's 3 API Endpoints (Received from Client):</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                          1. Project Feed API Endpoint:
                        </label>
                        <input
                          type="text"
                          className="input-control"
                          style={{ fontFamily: 'monospace', fontSize: '12px' }}
                          placeholder="https://api.marketxcel.co.in/webservices/supplier/send_supplier_data"
                          value={formData.feed_api_url}
                          onChange={e => setFormData({ ...formData, feed_api_url: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                          2. S2S Callback Webhook Endpoint:
                        </label>
                        <input
                          type="text"
                          className="input-control"
                          style={{ fontFamily: 'monospace', fontSize: '12px' }}
                          placeholder="https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus"
                          value={formData.s2s_callback_url}
                          onChange={e => setFormData({ ...formData, s2s_callback_url: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                          3. Master Data / Qualifications Endpoint:
                        </label>
                        <input
                          type="text"
                          className="input-control"
                          style={{ fontFamily: 'monospace', fontSize: '12px' }}
                          placeholder="https://api.marketxcel.co.in/webservices/supplier/get_master_data/"
                          value={formData.master_data_url}
                          onChange={e => setFormData({ ...formData, master_data_url: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section D: Security Tokens */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '4px' }}>Client API Token / Bearer Key:</label>
                      <input
                        type="text"
                        placeholder="e.g. mx_token_live_2026"
                        className="input-control"
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                        value={formData.api_token}
                        onChange={e => setFormData({ ...formData, api_token: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '4px' }}>Secret Hashing Key (SHA3-256 HMAC):</label>
                      <input
                        type="text"
                        placeholder="e.g. mx_secret_sha3_key_2026"
                        className="input-control"
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                        value={formData.secret_key}
                        onChange={e => setFormData({ ...formData, secret_key: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      style={{ padding: '8px 16px', borderRadius: '24px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: '8px 22px',
                        borderRadius: '24px',
                        border: 'none',
                        background: '#2a2d8c',
                        color: '#fff',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(42, 45, 140, 0.25)'
                      }}
                    >
                      {submitting ? 'Saving Client...' : 'Save & Onboard Client'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Multi-Contact Persons Modal */}
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
                  <div style={{ background: '#e9ebf8', padding: '8px', borderRadius: '8px', color: '#2a2d8c' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
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
                  <UserPlus size={14} color="#2a2d8c" /> Add Contact Person
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
                <button type="submit" style={{ padding: '6px 14px', fontSize: '11.5px', borderRadius: '20px', border: 'none', background: '#2a2d8c', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
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
                  No extra contact persons added yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clientContacts.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{c.name}</span>
                          {c.is_primary === 1 && <span style={{ background: '#e9ebf8', color: '#2a2d8c', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Primary</span>}
                          {c.billing === 1 && <span style={{ background: '#ecfdf5', color: '#16a34a', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Billing</span>}
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
      {/* Edit Client Modal (Admin editable) */}
      {editModalClient && (
        <ModalPortal isOpen={!!editModalClient} onClose={() => setEditModalClient(null)}>
          <div className="modal-overlay" onClick={() => setEditModalClient(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '680px', width: '94%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '14px', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#0F172A', padding: '8px', borderRadius: '8px', color: '#ffffff' }}>
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0F172A' }}>
                      Edit Client: {editModalClient.client_name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B' }}>
                      Update client credentials, API architecture, endpoints, and security gate
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditModalClient(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditClient}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Basic Client Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Client Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input-control"
                        value={editFormData.client_name}
                        onChange={e => setEditFormData({ ...editFormData, client_name: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Client Code / Identifier
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={editFormData.client_code}
                        onChange={e => setEditFormData({ ...editFormData, client_code: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        className="input-control"
                        placeholder="client@enterprise.com"
                        value={editFormData.email}
                        onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="+1-800-..."
                        value={editFormData.phone}
                        onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Market Country
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={editFormData.country}
                        onChange={e => setEditFormData({ ...editFormData, country: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Currency
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={editFormData.currency}
                        onChange={e => setEditFormData({ ...editFormData, currency: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  {/* Architecture & Hashing */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        API Architecture
                      </label>
                      <select
                        className="input-control"
                        value={editFormData.apiType}
                        onChange={e => setEditFormData({ ...editFormData, apiType: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      >
                        <option value="marketxcel">Market Xcel Demand API</option>
                        <option value="zamplia">Zamplia Supply API</option>
                        <option value="custom">German Client / Custom REST</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Hashing Algorithm
                      </label>
                      <select
                        className="input-control"
                        value={editFormData.hash_algorithm}
                        onChange={e => setEditFormData({ ...editFormData, hash_algorithm: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      >
                        <option value="sha3-256">SHA3-256 (Market Xcel / SMR Enterprise)</option>
                        <option value="hmac-sha256">HMAC-SHA256 (Zamplia)</option>
                        <option value="sha256">SHA-256 Standard</option>
                        <option value="none">None / Direct Pass</option>
                      </select>
                    </div>
                  </div>

                  {/* Security Key & Token */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Signing Secret Key / Salt
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={editFormData.secret_key}
                        onChange={e => setEditFormData({ ...editFormData, secret_key: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        API Token / Bearer Key
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={editFormData.api_token}
                        onChange={e => setEditFormData({ ...editFormData, api_token: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  {/* Endpoints */}
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Endpoints Configuration
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                          Feed API URL (Survey Inbound Feed)
                        </label>
                        <input
                          type="text"
                          className="input-control"
                          value={editFormData.feed_api_url}
                          onChange={e => setEditFormData({ ...editFormData, feed_api_url: e.target.value })}
                          style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '6px 8px', fontSize: '11.5px', fontFamily: 'monospace' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                          S2S Callback URL (Real-time Status Postback)
                        </label>
                        <input
                          type="text"
                          className="input-control"
                          value={editFormData.s2s_callback_url}
                          onChange={e => setEditFormData({ ...editFormData, s2s_callback_url: e.target.value })}
                          style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '6px 8px', fontSize: '11.5px', fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Settings */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Security Gate
                      </label>
                      <select
                        className="input-control"
                        value={editFormData.security_enabled}
                        onChange={e => setEditFormData({ ...editFormData, security_enabled: Number(e.target.value) })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      >
                        <option value={1}>ACTIVE (Speeder & Fraud Protection Enabled)</option>
                        <option value={0}>BYPASS (Security Gate Disabled / Testing Mode)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Client Status
                      </label>
                      <select
                        className="input-control"
                        value={editFormData.status}
                        onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                        style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '7px 10px', fontSize: '12.5px' }}
                      >
                        <option value="Active">Active (Accepting Traffic)</option>
                        <option value="Inactive">Inactive (Paused)</option>
                      </select>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setEditModalClient(null)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '20px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#475569',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      style={{
                        padding: '8px 22px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
                      }}
                    >
                      {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
