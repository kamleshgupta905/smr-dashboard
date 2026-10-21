with open('client/src/pages/ClientsPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
code = code.replace(
    "import { getClients, createClient, deleteClient, syncClientInventory, testS2sCallback, testHashing } from '../services/api';",
    "import { getClients, createClient, deleteClient, syncClientInventory, testS2sCallback, testHashing, getClientContacts, addClientContact, deleteClientContact } from '../services/api';"
)

code = code.replace(
    "import { Building2, Plus, Search, CheckCircle2, XCircle, Trash2, Globe, ShieldCheck, X, Copy, Check, RefreshCw, Send, Key, Code, ExternalLink, Lock, BarChart3 } from 'lucide-react';",
    "import { Building2, Plus, Search, CheckCircle2, XCircle, Trash2, Globe, ShieldCheck, X, Copy, Check, RefreshCw, Send, Key, Code, ExternalLink, Lock, Users, Mail, Phone, UserPlus } from 'lucide-react';"
)

# 2. Remove dead View Client Reports button
dead_btn = """          <button 
            type="button"
            className="btn btn-soft-secondary"
            onClick={() => onNavigate && onNavigate('reconciliation', 'clients')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
            title="Open Client Performance & Reconciliation Reports"
          >
            <BarChart3 size={14} /> View Client Reports
          </button>"""

if dead_btn in code:
    code = code.replace(dead_btn, "")

# 3. Add contacts state and handlers
contacts_state = """  // Multi-contacts Modal State (Laravel client_contacts replicate)
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
  };\n\n"""

code = code.replace("  const [formData, setFormData] = useState({", contacts_state + "  const [formData, setFormData] = useState({")

# 4. Add Contacts button in client action buttons
contact_btn = """                  <button
                    className="btn btn-soft-secondary btn-sm"
                    onClick={() => openContactsModal(client)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', borderRadius: '4px' }}
                    title="Manage Multiple Contacts for this Client"
                  >
                    <Users size={12} /> Contacts
                  </button>\n"""

code = code.replace(
    """                  <button
                    className="btn btn-soft-primary btn-sm"
                    onClick={() => handleOpenSecurityModal(client)}""",
    contact_btn + """                  <button
                    className="btn btn-soft-primary btn-sm"
                    onClick={() => handleOpenSecurityModal(client)}"""
)

# 5. Add Modal for Client Contacts
contacts_modal = """
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
"""

code = code.rstrip() + contacts_modal

with open('client/src/pages/ClientsPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("Updated ClientsPage.jsx with Contacts modal and cleaned reports button!")
