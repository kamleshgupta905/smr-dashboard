import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Search,
  ShieldCheck,
  DollarSign,
  Activity,
  ArrowUpRight,
  Trash2,
  Link2,
  ExternalLink,
  Settings,
  Shield,
  Key,
  Info,
  CheckCheck,
  Share2,
  X,
  FileText,
  BarChart3,
  Globe,
  Building2,
  Phone,
  Mail,
  UserPlus,
  Ban
} from 'lucide-react';
import { 
  getVendors, 
  createVendor, 
  updateVendor, 
  deleteVendor, 
  getProjects, 
  DEFAULT_VENDORS,
  getCountries,
  getClients
} from '../services/api';
import ModalPortal from '../components/ModalPortal';
import VendorIntegrationDocModal from '../components/VendorIntegrationDocModal';

const DEFAULT_COUNTRIES = [
  { id: 1, name: 'United States', code: 'US' },
  { id: 2, name: 'United Kingdom', code: 'GB' },
  { id: 3, name: 'Canada', code: 'CA' },
  { id: 4, name: 'Australia', code: 'AU' },
  { id: 5, name: 'India', code: 'IN' },
  { id: 6, name: 'Germany', code: 'DE' },
  { id: 7, name: 'France', code: 'FR' },
  { id: 8, name: 'Italy', code: 'IT' },
  { id: 9, name: 'Spain', code: 'ES' },
  { id: 10, name: 'Japan', code: 'JP' },
  { id: 11, name: 'Brazil', code: 'BR' },
  { id: 12, name: 'Mexico', code: 'MX' },
  { id: 13, name: 'Netherlands', code: 'NL' },
  { id: 14, name: 'Sweden', code: 'SE' },
  { id: 15, name: 'Switzerland', code: 'CH' },
  { id: 16, name: 'Singapore', code: 'SG' },
  { id: 17, name: 'New Zealand', code: 'NZ' },
  { id: 18, name: 'South Africa', code: 'ZA' },
  { id: 19, name: 'United Arab Emirates', code: 'AE' },
  { id: 20, name: 'Saudi Arabia', code: 'SA' },
  { id: 21, name: 'Poland', code: 'PL' },
  { id: 22, name: 'Turkey', code: 'TR' },
  { id: 23, name: 'Indonesia', code: 'ID' },
  { id: 24, name: 'Philippines', code: 'PH' },
  { id: 25, name: 'Vietnam', code: 'VN' },
  { id: 26, name: 'Thailand', code: 'TH' },
  { id: 27, name: 'Malaysia', code: 'MY' },
  { id: 28, name: 'Argentina', code: 'AR' },
  { id: 29, name: 'Chile', code: 'CL' },
  { id: 30, name: 'Colombia', code: 'CO' },
  { id: 31, name: 'Peru', code: 'PE' },
  { id: 32, name: 'Egypt', code: 'EG' },
  { id: 33, name: 'Nigeria', code: 'NG' },
  { id: 34, name: 'Kenya', code: 'KE' },
  { id: 35, name: 'South Korea', code: 'KR' },
  { id: 36, name: 'Ireland', code: 'IE' },
  { id: 37, name: 'Belgium', code: 'BE' },
  { id: 38, name: 'Austria', code: 'AT' },
  { id: 39, name: 'Portugal', code: 'PT' },
  { id: 40, name: 'Denmark', code: 'DK' },
  { id: 41, name: 'Norway', code: 'NO' },
  { id: 42, name: 'Finland', code: 'FI' },
  { id: 43, name: 'Czech Republic', code: 'CZ' },
  { id: 44, name: 'Romania', code: 'RO' },
  { id: 45, name: 'Israel', code: 'IL' },
  { id: 46, name: 'Greece', code: 'GR' },
  { id: 47, name: 'Hungary', code: 'HU' },
  { id: 48, name: 'Hong Kong', code: 'HK' }
];

function CountriesSelector({ selected = [], onChange, countries = [] }) {
  const [filter, setFilter] = useState('');
  
  const filtered = useMemo(() => {
    if (!filter) return countries;
    const q = filter.toLowerCase().trim();
    return countries.filter(c => 
      (c.name || '').toLowerCase().includes(q) || 
      (c.code || '').toLowerCase().includes(q)
    );
  }, [countries, filter]);

  const toggle = (code) => {
    const isSelected = selected.includes(code);
    if (isSelected) {
      onChange(selected.filter(c => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const selectAll = () => onChange(countries.map(c => c.code));
  const clearAll = () => onChange([]);
  const selectTier1 = () => onChange(['US', 'GB', 'CA', 'AU', 'DE', 'FR']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={15} color="#1761FD" /> Operating Countries & Geographies
          </span>
          <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginTop: '2px' }}>
            Select respondent markets where this supplier can route survey traffic.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-soft-primary btn-sm"
            onClick={selectAll}
            style={{ fontSize: '11px', padding: '4px 9px', fontWeight: 700 }}
          >
            Select All ({countries.length})
          </button>
          <button
            type="button"
            className="btn btn-soft-secondary btn-sm"
            onClick={selectTier1}
            style={{ fontSize: '11px', padding: '4px 9px', fontWeight: 700 }}
          >
            Tier 1 (US, UK, CA, AU, DE, FR)
          </button>
          <button
            type="button"
            className="btn btn-soft-danger btn-sm"
            onClick={clearAll}
            style={{ fontSize: '11px', padding: '4px 9px', fontWeight: 700 }}
          >
            Clear All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search country by name or code (e.g. India, US, Germany)..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px', fontSize: '12px' }}
          />
        </div>
        <span className="badge-soft-success" style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {selected.length} / {countries.length} Markets Selected
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: '8px',
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '4px',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        background: '#F8FAFC'
      }}>
        {filtered.map(c => {
          const isSel = selected.includes(c.code) || selected.includes(c.id);
          return (
            <div
              key={c.code || c.id}
              onClick={() => toggle(c.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                border: isSel ? '1.5px solid #1761FD' : '1px solid #E2E8F0',
                background: isSel ? 'rgba(23, 97, 253, 0.08)' : '#FFFFFF',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.12s ease'
              }}
            >
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => {}}
                style={{ cursor: 'pointer' }}
              />
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '3px',
                background: isSel ? '#1761FD' : '#E2E8F0',
                color: isSel ? '#FFFFFF' : '#475569',
                fontFamily: 'monospace'
              }}>
                {c.code}
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: isSel ? 700 : 500, color: isSel ? '#0F172A' : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RestrictionsAndContacts({ blockedClients = [], onBlockedChange, contacts = [], onContactsChange, clients = [] }) {
  const [draft, setDraft] = useState({ name: '', email: '', phone: '', role: '' });

  const defaultClientList = clients.length > 0 ? clients : [
    { id: 'CLI-ZAM-01', client_name: 'Zamplia Global' },
    { id: 'CLI-MX-02', client_name: 'Market Xcel' },
    { id: 'CLI-AMG-03', client_name: 'AMG Global Insights' },
    { id: 'CLI-CINT-04', client_name: 'Cint Enterprise' },
    { id: 'CLI-LUCID-05', client_name: 'Lucid Holdings' },
    { id: 'CLI-TOLUNA-06', client_name: 'Toluna Insights' },
    { id: 'CLI-DYNATA-07', client_name: 'Dynata Buyer Network' }
  ];

  const toggleClient = (cId) => {
    if (blockedClients.includes(cId)) {
      onBlockedChange(blockedClients.filter(c => c !== cId));
    } else {
      onBlockedChange([...blockedClients, cId]);
    }
  };

  const addContact = (e) => {
    e?.preventDefault();
    if (!draft.name && !draft.email) return;
    onContactsChange([...contacts, { ...draft }]);
    setDraft({ name: '', email: '', phone: '', role: '' });
  };

  const removeContact = (idx) => {
    onContactsChange(contacts.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Blocked Clients Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ban size={15} color="#DC2626" /> Restricted / Blocked Client Accounts
            </span>
            <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginTop: '2px' }}>
              Select buyers that this vendor is forbidden from supplying responses to.
            </span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: blockedClients.length > 0 ? '#DC2626' : '#64748B' }}>
            {blockedClients.length} Clients Blocked
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px',
          maxHeight: '180px',
          overflowY: 'auto',
          padding: '4px',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          background: '#F8FAFC'
        }}>
          {defaultClientList.map(cl => {
            const cId = cl.id || cl.client_code || cl.client_name;
            const cName = cl.client_name || cl.name || cId;
            const isBlocked = blockedClients.includes(cId) || blockedClients.includes(cName);
            return (
              <div
                key={cId}
                onClick={() => toggleClient(cId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: isBlocked ? '1.5px solid #DC2626' : '1px solid #E2E8F0',
                  background: isBlocked ? 'rgba(220, 38, 38, 0.08)' : '#FFFFFF',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <input type="checkbox" checked={isBlocked} onChange={() => {}} style={{ cursor: 'pointer' }} />
                <span style={{ fontSize: '11.5px', fontWeight: isBlocked ? 700 : 500, color: isBlocked ? '#DC2626' : '#1E293B', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cName}
                </span>
                {isBlocked && (
                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '1px 5px', borderRadius: '3px' }}>
                    BLOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Multiple Contact Persons Section */}
      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={15} color="#1761FD" /> Supplier Contact Persons ({contacts.length})
            </span>
            <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginTop: '2px' }}>
              Maintain key account managers, billing, and technical leads for this supplier.
            </span>
          </div>
        </div>

        {/* Add Contact Draft Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr auto', gap: '8px', background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Full Name *"
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            className="input-field"
            style={{ fontSize: '11.5px', padding: '6px 8px' }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={draft.email}
            onChange={e => setDraft({ ...draft, email: e.target.value })}
            className="input-field"
            style={{ fontSize: '11.5px', padding: '6px 8px' }}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={draft.phone}
            onChange={e => setDraft({ ...draft, phone: e.target.value })}
            className="input-field"
            style={{ fontSize: '11.5px', padding: '6px 8px' }}
          />
          <input
            type="text"
            placeholder="Designation / Role"
            value={draft.role}
            onChange={e => setDraft({ ...draft, role: e.target.value })}
            className="input-field"
            style={{ fontSize: '11.5px', padding: '6px 8px' }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={addContact}
            style={{ fontSize: '11.5px', padding: '6px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            + Add Contact
          </button>
        </div>

        {/* Added Contacts Cards */}
        {contacts.length === 0 ? (
          <div style={{ fontSize: '11.5px', color: '#94A3B8', fontStyle: 'italic', padding: '6px 0' }}>
            No additional contacts added yet. Enter details above and click "+ Add Contact".
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
            {contacts.map((c, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '12px', color: '#0F172A' }}>{c.name || 'Unnamed'}</strong>
                  {c.role && (
                    <span className="badge-soft-primary" style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {c.role}
                    </span>
                  )}
                  {c.email && (
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={11} /> {c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={11} /> {c.phone}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeContact(idx)}
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px 4px' }}
                  title="Remove Contact"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorsPage({ onNavigate, globalSearch = '' }) {
  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');

  // Profiling state
  const [countriesList, setCountriesList] = useState(DEFAULT_COUNTRIES);
  const [clientsList, setClientsList] = useState([]);
  const [addModalTab, setAddModalTab] = useState('general');
  const [editModalTab, setEditModalTab] = useState('general');
  const [countryFilter, setCountryFilter] = useState('');
  const [contactDraft, setContactDraft] = useState({ name: '', email: '', phone: '', role: '' });

  // Editing vendor redirects & security modal state
  const [editingVendor, setEditingVendor] = useState(null);
  const [redirectForm, setRedirectForm] = useState({
    redirect_complete: '',
    redirect_terminate: '',
    redirect_overquota: '',
    redirect_security: '',
    hash_algorithm: 'SHA3-256',
    secret_key: '',
    commission_type: 'flat_rate',
    cpi: '',
    cpi_percentage: '',
    countries: [],
    blocked_clients: [],
    contacts: []
  });
  const [testUid, setTestUid] = useState('TEST_RESP_7721');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingRedirects, setSavingRedirects] = useState(false);

  // Frame 001: Entry Link Generator Modal State
  const [entryLinkVendor, setEntryLinkVendor] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('VMHP1026542026');
  const [customProjectId, setCustomProjectId] = useState('');
  const [testUidParam, setTestUidParam] = useState('wslnkdxldd');
  const [copiedEntryLink, setCopiedEntryLink] = useState(false);

  // Form State for Add Vendor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vendor_code: '',
    commission_type: 'flat_rate',
    cpi: '',
    cpi_percentage: '',
    status: 'active',
    redirect_complete: '',
    redirect_terminate: '',
    redirect_overquota: '',
    redirect_security: '',
    hash_algorithm: 'SHA3-256',
    secret_key: '',
    countries: [],
    blocked_clients: [],
    contacts: []
  });
  const [showAddRedirectsTab, setShowAddRedirectsTab] = useState(false);

  const fetchVendorsList = async () => {
    setLoading(true);
    try {
      const res = await getVendors();
      const rawList = res?.data || res || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        // Deduplicate by vendor_code / vendor_id + name so project-level duplicate rows don't repeat
        const seen = new Map();
        rawList.forEach(item => {
          const key = `${(item.vendor_code || item.vendor_id || item.vendorUid || item._id || '').toString().trim().toUpperCase()}__${(item.name || '').toString().trim().toLowerCase()}`;
          if (!seen.has(key)) {
            seen.set(key, {
              ...item,
              status: (item.status === 'Y' || item.status === 'active' || item.is_active === 'Y') ? 'active' : (item.status || 'active')
            });
          } else {
            const existing = seen.get(key);
            existing.clicks_count = Number(existing.clicks_count || 0) + Number(item.clicks_count || 0);
            existing.complete_count = Number(existing.complete_count || 0) + Number(item.complete_count || 0);
            existing.completes_count = existing.complete_count;
            existing.terminates_count = Number(existing.terminates_count || 0) + Number(item.terminates_count || 0);
          }
        });
        const deduped = Array.from(seen.values());
        setVendors(deduped.length > 0 ? deduped : DEFAULT_VENDORS);
      } else {
        setVendors(DEFAULT_VENDORS);
      }
    } catch (err) {
      console.error('Failed to load vendors from API, keeping fallbacks:', err);
      setVendors(DEFAULT_VENDORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
    getProjects().then(res => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setProjectsList(res.data);
        const firstId = res.data[0].project_id || res.data[0].id;
        if (firstId) setSelectedProjectId(firstId);
      }
    }).catch(() => {});
    getCountries().then(list => {
      if (Array.isArray(list) && list.length > 0) setCountriesList(list);
    }).catch(() => {});
    getClients().then(list => {
      if (Array.isArray(list) && list.length > 0) setClientsList(list);
    }).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smr.vmhgroupsmr.com';
      const vidCode = formData.vendor_code || 'VND';
      const payload = {
        ...formData,
        cpi: formData.cpi !== '' && formData.cpi !== undefined ? Number(formData.cpi) : 0,
        cpi_percentage: formData.cpi_percentage !== '' && formData.cpi_percentage !== undefined ? Number(formData.cpi_percentage) : 0,
        redirect_complete: formData.redirect_complete || `${origin}/survey/callback?status=10&vid=${vidCode}&hash=[HASH]&uid=[UID]`,
        redirect_terminate: formData.redirect_terminate || `${origin}/survey/callback?status=20&vid=${vidCode}&hash=[HASH]&uid=[UID]`,
        redirect_overquota: formData.redirect_overquota || `${origin}/survey/callback?status=30&vid=${vidCode}&hash=[HASH]&uid=[UID]`,
        redirect_security: formData.redirect_security || `${origin}/survey/callback?status=40&vid=${vidCode}&hash=[HASH]&uid=[UID]`,
        hash_algorithm: formData.hash_algorithm || 'SHA3-256',
        secret_key: formData.secret_key || `${vidCode.toLowerCase()}_sec_2026`,
        countries: formData.countries || [],
        blocked_clients: formData.blocked_clients || [],
        contacts: formData.contacts || []
      };
      const res = await createVendor(payload);
      setShowModal(false);
      const created = res?.data || { ...payload, _id: `vnd_${Date.now()}` };
      setVendors(prev => [created, ...prev]);
      setFormData({
        name: '',
        email: '',
        vendor_code: '',
        commission_type: 'flat_rate',
        cpi: '',
        cpi_percentage: '',
        status: 'active',
        redirect_complete: '',
        redirect_terminate: '',
        redirect_overquota: '',
        redirect_security: '',
        hash_algorithm: 'SHA3-256',
        secret_key: '',
        countries: [],
        blocked_clients: [],
        contacts: []
      });
      setShowAddRedirectsTab(false);
      setAddModalTab('general');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error creating vendor');
    }
  };

  const handleOpenRedirects = (vendor) => {
    setEditingVendor(vendor);
    setEditModalTab('general');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smr.vmhgroupsmr.com';
    const vidCode = vendor.vendor_code || vendor.vendorUid || 'VND';
    const isDummy = (url) => !url || url.includes('vnddyn01.com') || url.includes('supplier.com');
    setRedirectForm({
      commission_type: vendor.commission_type || 'flat_rate',
      cpi: vendor.cpi !== undefined && vendor.cpi !== null ? vendor.cpi : '',
      cpi_percentage: vendor.cpi_percentage !== undefined && vendor.cpi_percentage !== null ? vendor.cpi_percentage : '',
      redirect_complete: !isDummy(vendor.redirect_complete) ? vendor.redirect_complete : `${origin}/survey/callback?status=10&vid=${vidCode}&hash=[HASH]&uid=[UID]`,
      redirect_terminate: !isDummy(vendor.redirect_terminate) ? vendor.redirect_terminate : `${origin}/survey/callback?status=20&vid=${vidCode}&hash=[HASH]&uid=[UID]`,
      redirect_overquota: !isDummy(vendor.redirect_overquota) ? vendor.redirect_overquota : `${origin}/survey/callback?status=30&vid=${vidCode}&hash=[HASH]&uid=[UID]`,
      redirect_security: !isDummy(vendor.redirect_security) ? vendor.redirect_security : `${origin}/survey/callback?status=40&vid=${vidCode}&hash=[HASH]&uid=[UID]`,
      hash_algorithm: vendor.hash_algorithm || 'SHA3-256',
      secret_key: vendor.secret_key || `${vidCode.toLowerCase()}_sec_key_2026`,
      countries: Array.isArray(vendor.countries) ? vendor.countries : (vendor.country_ids || []),
      blocked_clients: Array.isArray(vendor.blocked_clients) ? vendor.blocked_clients : [],
      contacts: Array.isArray(vendor.contacts) ? vendor.contacts : []
    });
    setSaveSuccess(false);
  };

  const handleSaveRedirects = async (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    setSavingRedirects(true);
    try {
      const vendorId = editingVendor._id || editingVendor.vendor_code;
      const updatedFields = {
        commission_type: redirectForm.commission_type,
        cpi: Number(redirectForm.cpi),
        cpi_percentage: Number(redirectForm.cpi_percentage),
        redirect_complete: redirectForm.redirect_complete,
        redirect_terminate: redirectForm.redirect_terminate,
        redirect_overquota: redirectForm.redirect_overquota,
        redirect_security: redirectForm.redirect_security,
        hash_algorithm: redirectForm.hash_algorithm,
        secret_key: redirectForm.secret_key,
        countries: redirectForm.countries || [],
        blocked_clients: redirectForm.blocked_clients || [],
        contacts: redirectForm.contacts || []
      };
      await updateVendor(vendorId, updatedFields);
      setVendors(prev => prev.map(v => (v._id === vendorId || v.vendor_code === vendorId) ? { ...v, ...updatedFields } : v));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingVendor(null);
      }, 1200);
    } catch (err) {
      alert(err.message || 'Error updating vendor redirects');
    } finally {
      setSavingRedirects(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vendor integration?')) return;
    try {
      await deleteVendor(id);
      setVendors(prev => prev.filter(v => (v._id !== id && v.vendor_code !== id)));
    } catch (err) {
      console.error('Failed to delete vendor:', err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getResolvedUrl = (template, uid) => {
    if (!template) return '';
    return template
      .replace(/\[UID\]/gi, uid)
      .replace(/\[RESPONDENT_ID\]/gi, uid)
      .replace(/\[RID\]/gi, uid)
      .replace(/\[TID\]/gi, uid);
  };

  const effectiveSearch = (search || globalSearch || '').toLowerCase().trim();
  const filtered = vendors.filter(v => {
    if (!effectiveSearch) return true;
    return (
      (v.name && v.name.toLowerCase().includes(effectiveSearch)) ||
      (v.vendor_code && v.vendor_code.toLowerCase().includes(effectiveSearch)) ||
      (v.vendorUid && v.vendorUid.toLowerCase().includes(effectiveSearch)) ||
      (v.email && v.email.toLowerCase().includes(effectiveSearch))
    );
  });

  const avgCpiNum = vendors.reduce((sum, v) => sum + Number(v.cpi || 0), 0) / (vendors.length || 1);
  const avgCpi = avgCpiNum.toFixed(2);
  const avgRevShare = Math.round(vendors.reduce((sum, v) => sum + Number(v.cpi_percentage || 70), 0) / (vendors.length || 1));
  const activeCount = vendors.filter(v => v.status === 'active' || v.status === 'Y' || v.is_active === 'Y' || v.isActive !== false).length;

  return (
    <div>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Partners</span>
            <span className="separator">/</span>
            <span className="current">Vendors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Vendors
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
              {filtered.length} Connected Vendors
            </span>
          </div>
        </div>

        <div className="title-box-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            className="btn btn-soft-secondary"
            onClick={() => onNavigate && onNavigate('reconciliation', 'vendors')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
            title="Open Vendor Performance & Reconciliation Reports"
          >
            <BarChart3 size={14} /> View Vendor Reports
          </button>
          <button 
            type="button"
            className="btn btn-soft-primary"
            onClick={() => setShowSpecModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
            title="Open Vendor Integration Guide & Specification"
          >
            <FileText size={14} /> Vendor Integration Spec
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            id="btn-add-vendor"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Add New Vendor
          </button>
        </div>
      </div>

      {/* 4 Dastone KPI Summary Cards */}
      <div className="responsive-four-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Connected Vendors</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>{vendors.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <span className="pulse-dot" /> {activeCount} Active Vendors
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Default Payout Model</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(3, 216, 127, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#03d87f' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>
            {avgCpiNum > 0 ? `$${avgCpi}` : `${avgRevShare}% RevShare`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#8997bd' }}>
            {avgCpiNum > 0 ? 'Base supply cost across panels' : '70% / 75% / 80% Dynamic CPI Share'}
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Security & Hash</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>SHA3-256 / HMAC</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <CheckCircle2 size={12} /> Strict Anti-Tamper Enabled
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Supply Redirects</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(253, 171, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fdab3d' }}>
              <Link2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: 'Poppins' }}>4 / 4 Callbacks</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#1761fd' }}>
            <ArrowUpRight size={12} /> Complete, Term, OQ, Security
          </div>
        </div>
      </div>

      {/* Vendors Table (Dastone Report Card) */}
      <div className="report-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="report-card-header">
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
            <input 
              type="text" 
              className="input-control"
              placeholder="Search vendors by name, code, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', height: '34px', fontSize: '12px' }}
            />
          </div>

          <span className="badge-soft-primary" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
            {filtered.length} Registered Panels
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8997bd' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            Loading vendors...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8997bd', fontSize: '13px' }}>
            No vendors configured yet. Click "Add New Vendor" to connect your first sample supplier!
          </div>
        ) : (
          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '100%' }}>
              <thead className="thead-light">
                <tr>
                  <th>Vendor Name / Code</th>
                  <th>Contact Email</th>
                  <th>Base Rate / Payout</th>
                  <th>Security Hash</th>
                  <th>Supply Callbacks (4)</th>
                  <th>Status</th>
                  <th>Sample Router Entry URL</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const sampleUrl = `${window.location.origin}/vendor/auth/${v.vendor_code || v._id}/project/:project_id?rid=[RESPONDENT_ID]`;
                  const isRevShare = v.commission_type === 'revenue_share' || (!Number(v.cpi) && v.cpi_percentage);
                  const isActiveVendor = v.status === 'active' || v.status === 'Y' || v.is_active === 'Y';
                  return (
                    <tr key={v._id || v.vendor_code}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1d2c48', fontSize: '13.5px' }}>{v.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span className="badge-soft-primary" style={{ fontFamily: 'monospace', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px' }}>
                            {v.vendor_code || v._id}
                          </span>
                          <span className="badge-soft-success" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Globe size={10} /> {(v.countries?.length || 0) > 0 ? `${v.countries.length} Markets` : '48 Markets'}
                          </span>
                          {(v.contacts?.length || 0) > 0 && (
                            <span className="badge-soft-info" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Users size={10} /> {v.contacts.length} Contacts
                            </span>
                          )}
                          {(v.blocked_clients?.length || 0) > 0 && (
                            <span className="badge-soft-danger" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Ban size={10} /> {v.blocked_clients.length} Blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: '#303e67', fontSize: '12.5px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.email || 'N/A'}>
                        {v.email || 'N/A'}
                      </td>
                      <td>
                        {isRevShare ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, color: '#1761fd', fontSize: '14px' }}>
                              {Number(v.cpi_percentage || 70)}%
                            </span>
                            <span className="badge-soft-primary" style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              RevShare
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, color: '#03d87f', fontSize: '14px' }}>
                              ${Number(v.cpi || 0).toFixed(2)}
                            </span>
                            <span style={{ fontSize: '11px', color: '#8997bd', fontWeight: 600 }}>
                              Fixed
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge-soft-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          <ShieldCheck size={12} /> {v.hash_algorithm || 'SHA3-256'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenRedirects(v)}
                          className="btn btn-soft-primary btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '4px 9px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Configure all 4 Supply Vendor Redirect Callbacks (Complete, Terminate, Overquota, Security)"
                        >
                          <Link2 size={13} />
                          <span>Configure Redirects (4)</span>
                        </button>
                        <div style={{ marginTop: '3px', fontSize: '10.5px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={11} /> 4 Callbacks Active
                        </div>
                      </td>
                      <td>
                        {isActiveVendor ? (
                          <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span className="pulse-dot" /> Active
                          </span>
                        ) : (
                          <span className="badge-soft-danger" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span className="pulse-dot pulse-danger" /> Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-soft-primary btn-sm"
                              onClick={() => {
                                setEntryLinkVendor(v);
                                setSelectedProjectId('VMHP1026542026');
                                setTestUidParam('wslnkdxldd');
                                setCopiedEntryLink(false);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Open Inbound Router Entry Link Generator (Frame 001)"
                            >
                              <Share2 size={12} /> Entry Link (Frame 001)
                            </button>
                            <button 
                              className="btn btn-soft-secondary btn-sm"
                              onClick={() => copyToClipboard(sampleUrl, v._id || v.vendor_code)}
                              title="Copy Raw Entry Format"
                              style={{ padding: '4px 7px', borderRadius: '4px' }}
                            >
                              {copiedId === (v._id || v.vendor_code) ? <Check size={12} color="#03d87f" /> : <Copy size={12} />}
                            </button>
                          </div>
                          <code style={{ 
                            fontSize: '10.5px', 
                            background: '#f8fafc', 
                            border: '1px solid #e3ebf6',
                            padding: '3px 6px', 
                            borderRadius: '4px',
                            color: '#475569',
                            maxWidth: '220px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {sampleUrl}
                          </code>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                          <button
                            className="btn btn-soft-success btn-sm"
                            onClick={() => {
                              setEntryLinkVendor(v);
                              setSelectedProjectId('VMHP1026542026');
                              setTestUidParam('wslnkdxldd');
                              setCopiedEntryLink(false);
                            }}
                            title="Generate Inbound Entry Link (Frame 001)"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            className="btn btn-soft-primary btn-sm"
                            onClick={() => handleOpenRedirects(v)}
                            title="Configure Redirects & Anti-Tamper Security (Frame 006)"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            <Settings size={13} />
                          </button>
                          <button
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => handleDelete(v._id || v.vendor_code)}
                            title="Remove Vendor"
                            style={{ padding: '4px 7px', borderRadius: '4px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEDICATED CONFIGURE VENDOR REDIRECTS MODAL */}
      {editingVendor && (
        <ModalPortal isOpen={!!editingVendor} onClose={() => setEditingVendor(null)}>
          <div className="modal-overlay" onClick={() => setEditingVendor(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
                      <Link2 size={16} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                      Configure Supply Vendor Redirects
                    </h3>
                  </div>
                  <p style={{ margin: '4px 0 0 36px', fontSize: '12px', color: '#64748b' }}>
                    Panel: <strong style={{ color: '#1d2c48' }}>{editingVendor.name}</strong> ({editingVendor.vendor_code || editingVendor._id})
                  </p>
                </div>
                <button 
                  onClick={() => setEditingVendor(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              {/* 3-Tab Navigation Bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 20px', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditModalTab('general')}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: editModalTab === 'general' ? '2px solid #1761fd' : '2px solid transparent',
                    color: editModalTab === 'general' ? '#1761fd' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Link2 size={14} /> 1. Redirects & Security
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalTab('countries')}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: editModalTab === 'countries' ? '2px solid #1761fd' : '2px solid transparent',
                    color: editModalTab === 'countries' ? '#1761fd' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Globe size={14} /> 2. Operating Countries
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: (redirectForm.countries?.length || 0) > 0 ? '#10b981' : '#e2e8f0', color: (redirectForm.countries?.length || 0) > 0 ? '#fff' : '#64748b', fontWeight: 800 }}>
                    {redirectForm.countries?.length || 0} / 48
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalTab('restrictions')}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: editModalTab === 'restrictions' ? '2px solid #1761fd' : '2px solid transparent',
                    color: editModalTab === 'restrictions' ? '#1761fd' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Ban size={14} /> 3. Blocked Clients & Contacts
                  {((redirectForm.blocked_clients?.length || 0) > 0 || (redirectForm.contacts?.length || 0) > 0) && (
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: '#3b82f6', color: '#fff', fontWeight: 800 }}>
                      {(redirectForm.blocked_clients?.length || 0) + (redirectForm.contacts?.length || 0)}
                    </span>
                  )}
                </button>
              </div>

              <form onSubmit={handleSaveRedirects}>
                {editModalTab === 'general' && (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Informational Guidance Box */}
                  <div style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '8px', 
                    padding: '12px 14px', 
                    display: 'flex', 
                    gap: '10px' 
                  }}>
                    <Info size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px', color: '#15803d', lineHeight: 1.5 }}>
                      Jab bhi koi respondent survey session end karega, router unhe in 4 Callback Redirect URLs par return karega. Tag <code>[UID]</code> dynamically respondent ke real ID se replace ho jayega.
                    </div>
                  </div>

                  {/* Payout Model / Commission Setup */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Supplier Payout Model
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setRedirectForm({ ...redirectForm, commission_type: 'flat_rate' })}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: redirectForm.commission_type !== 'revenue_share' ? '1px solid #1761fd' : '1px solid #cbd5e1',
                            background: redirectForm.commission_type !== 'revenue_share' ? 'rgba(23, 97, 253, 0.1)' : '#fff',
                            color: redirectForm.commission_type !== 'revenue_share' ? '#1761fd' : '#64748b'
                          }}
                        >
                          Fixed CPI ($)
                        </button>
                        <button
                          type="button"
                          onClick={() => setRedirectForm({ ...redirectForm, commission_type: 'revenue_share' })}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: redirectForm.commission_type === 'revenue_share' ? '1px solid #1761fd' : '1px solid #cbd5e1',
                            background: redirectForm.commission_type === 'revenue_share' ? 'rgba(23, 97, 253, 0.1)' : '#fff',
                            color: redirectForm.commission_type === 'revenue_share' ? '#1761fd' : '#64748b'
                          }}
                        >
                          Revenue Share (%)
                        </button>
                      </div>
                    </div>
                    {redirectForm.commission_type === 'revenue_share' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '130px', position: 'relative' }}>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            className="input-field"
                            style={{ width: '100%', fontSize: '12px', paddingRight: '28px' }}
                            value={redirectForm.cpi_percentage || 70}
                            onChange={e => setRedirectForm({ ...redirectForm, cpi_percentage: parseFloat(e.target.value) || 0 })}
                          />
                          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>%</span>
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          Vendor receives {redirectForm.cpi_percentage || 70}% of survey CPI on each complete
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '130px', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>$</span>
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            className="input-field"
                            style={{ width: '100%', fontSize: '12px', paddingLeft: '24px' }}
                            value={redirectForm.cpi || 1.50}
                            onChange={e => setRedirectForm({ ...redirectForm, cpi: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          Fixed agreed payout per complete
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 1. Complete Redirect */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        1. Complete / Success Callback URL
                      </label>
                      <span className="badge-soft-success" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Status 10 (Complete)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url"
                        required
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="https://supplier.com/survey/complete?uid=[UID]"
                        value={redirectForm.redirect_complete}
                        onChange={e => setRedirectForm({ ...redirectForm, redirect_complete: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(redirectForm.redirect_complete, 'rc')}
                        title="Copy Complete URL"
                        style={{ padding: '0 12px' }}
                      >
                        {copiedId === 'rc' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Survey successfully finish hone par respondent is URL par wapas jayega.
                    </span>
                  </div>

                  {/* 2. Terminate Redirect */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                        2. Terminate / Screenout Callback URL
                      </label>
                      <span className="badge-soft-danger" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Status 20 (Screenout)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url"
                        required
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="https://supplier.com/survey/terminate?uid=[UID]"
                        value={redirectForm.redirect_terminate}
                        onChange={e => setRedirectForm({ ...redirectForm, redirect_terminate: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(redirectForm.redirect_terminate, 'rt')}
                        title="Copy Terminate URL"
                        style={{ padding: '0 12px' }}
                      >
                        {copiedId === 'rt' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Demographics ya screener fail hone par respondent is URL par bhej diya jayega.
                    </span>
                  </div>

                  {/* 3. OverQuota Redirect */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                        3. OverQuota Callback URL
                      </label>
                      <span className="badge-soft-warning" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Status 30 (OverQuota)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url"
                        required
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="https://supplier.com/survey/overquota?uid=[UID]"
                        value={redirectForm.redirect_overquota}
                        onChange={e => setRedirectForm({ ...redirectForm, redirect_overquota: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(redirectForm.redirect_overquota, 'ro')}
                        title="Copy OverQuota URL"
                        style={{ padding: '0 12px' }}
                      >
                        {copiedId === 'ro' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Target quota full hone par respondent is URL par redirect hoga.
                    </span>
                  </div>

                  {/* 4. Security Redirect */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                        4. Security / Fraud Screenout Callback URL
                      </label>
                      <span className="badge-soft-primary" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Status 40 (Security Terminate)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="url"
                        required
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="https://supplier.com/survey/security?uid=[UID]"
                        value={redirectForm.redirect_security}
                        onChange={e => setRedirectForm({ ...redirectForm, redirect_security: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => copyToClipboard(redirectForm.redirect_security, 'rs')}
                        title="Copy Security URL"
                        style={{ padding: '0 12px' }}
                      >
                        {copiedId === 'rs' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      VPN/Proxy, Bot, Speeding ya Fraud check trigger hone par respondent security URL par drop hoga.
                    </span>
                  </div>

                  {/* Runtime Simulator & Live UID Verification Box */}
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1px dashed #cbd5e1', 
                    borderRadius: '8px', 
                    padding: '14px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={15} color="#03d87f" />
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1d2c48' }}>
                          Live UID Substitution Preview & Link Tester
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Test UID:</span>
                        <input 
                          type="text"
                          value={testUid}
                          onChange={e => setTestUid(e.target.value)}
                          style={{ 
                            fontSize: '11px', 
                            padding: '2px 6px', 
                            border: '1px solid #cbd5e1', 
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            width: '140px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#16a34a', fontWeight: 700, marginBottom: '2px' }}>
                          <span>Complete Return:</span>
                          <a 
                            href={getResolvedUrl(redirectForm.redirect_complete, testUid)} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ color: '#1761fd', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                          >
                            Test Open <ExternalLink size={11} />
                          </a>
                        </div>
                        <code style={{ fontSize: '11px', color: '#334155', wordBreak: 'break-all' }}>
                          {getResolvedUrl(redirectForm.redirect_complete, testUid) || 'No complete URL configured'}
                        </code>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ef4444', fontWeight: 700, marginBottom: '2px' }}>
                          <span>Terminate Return:</span>
                          <a 
                            href={getResolvedUrl(redirectForm.redirect_terminate, testUid)} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ color: '#1761fd', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                          >
                            Test Open <ExternalLink size={11} />
                          </a>
                        </div>
                        <code style={{ fontSize: '11px', color: '#334155', wordBreak: 'break-all' }}>
                          {getResolvedUrl(redirectForm.redirect_terminate, testUid) || 'No terminate URL configured'}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                {editModalTab === 'countries' && (
                  <div style={{ padding: '20px' }}>
                    <CountriesSelector
                      selected={redirectForm.countries || []}
                      onChange={c => setRedirectForm({ ...redirectForm, countries: c })}
                      countries={countriesList}
                    />
                  </div>
                )}

                {editModalTab === 'restrictions' && (
                  <div style={{ padding: '20px' }}>
                    <RestrictionsAndContacts
                      blockedClients={redirectForm.blocked_clients || []}
                      onBlockedChange={b => setRedirectForm({ ...redirectForm, blocked_clients: b })}
                      contacts={redirectForm.contacts || []}
                      onContactsChange={c => setRedirectForm({ ...redirectForm, contacts: c })}
                      clients={clientsList}
                    />
                  </div>
                )}

                <div style={{ 
                  borderTop: '1px solid #e2e8f0', 
                  padding: '14px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: '#f8fafc'
                }}>
                  <div>
                    {saveSuccess && (
                      <span className="badge-soft-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                        <CheckCheck size={14} /> Redirects & Security Saved Successfully!
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setEditingVendor(null)}
                      style={{ fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={savingRedirects}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
                    >
                      <CheckCircle2 size={14} /> 
                      {savingRedirects ? 'Saving...' : 'Save Redirects & Security'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Add Vendor Modal */}
      {showModal && (
        <ModalPortal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Add Supply Vendor Panel</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure supplier profile, entry routes, and 4 callback redirects.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>

              {/* 3-Tab Navigation Bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 20px', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAddModalTab('general')}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: addModalTab === 'general' ? '2px solid #1761fd' : '2px solid transparent',
                    color: addModalTab === 'general' ? '#1761fd' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Link2 size={14} /> 1. General Profile & Redirects
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalTab('countries')}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: addModalTab === 'countries' ? '2px solid #1761fd' : '2px solid transparent',
                    color: addModalTab === 'countries' ? '#1761fd' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Globe size={14} /> 2. Operating Countries
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: (formData.countries?.length || 0) > 0 ? '#10b981' : '#e2e8f0', color: (formData.countries?.length || 0) > 0 ? '#fff' : '#64748b', fontWeight: 800 }}>
                    {formData.countries?.length || 0} / 48
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalTab('restrictions')}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: addModalTab === 'restrictions' ? '2px solid #1761fd' : '2px solid transparent',
                    color: addModalTab === 'restrictions' ? '#1761fd' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Ban size={14} /> 3. Blocked Clients & Contacts
                  {((formData.blocked_clients?.length || 0) > 0 || (formData.contacts?.length || 0) > 0) && (
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: '#3b82f6', color: '#fff', fontWeight: 800 }}>
                      {(formData.blocked_clients?.length || 0) + (formData.contacts?.length || 0)}
                    </span>
                  )}
                </button>
              </div>

              <form onSubmit={handleCreate}>
                {addModalTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Vendor / Panel Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="e.g. Dynata Panel, PureSpectrum, Lucid"
                      value={formData.name}
                      onChange={e => {
                        const name = e.target.value;
                        const code = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
                        setFormData({ 
                          ...formData, 
                          name,
                          vendor_code: formData.vendor_code || code
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Unique Vendor Code / Slug *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="e.g. VND-DYN-01, pure-spectrum"
                      value={formData.vendor_code}
                      onChange={e => setFormData({ ...formData, vendor_code: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Contact Email
                    </label>
                    <input 
                      type="email" 
                      className="input-field" 
                      style={{ width: '100%' }}
                      placeholder="partners@supplier.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  {/* Payout Model / Commission Type Switch */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                      Payout Model / Commission Type
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, commission_type: 'flat_rate' })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: formData.commission_type !== 'revenue_share' ? '2px solid #1761fd' : '1px solid #e2e8f0',
                          background: formData.commission_type !== 'revenue_share' ? 'rgba(23, 97, 253, 0.08)' : '#fff',
                          color: formData.commission_type !== 'revenue_share' ? '#1761fd' : '#475569',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <DollarSign size={15} /> Fixed CPI ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, commission_type: 'revenue_share' })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: formData.commission_type === 'revenue_share' ? '2px solid #1761fd' : '1px solid #e2e8f0',
                          background: formData.commission_type === 'revenue_share' ? 'rgba(23, 97, 253, 0.08)' : '#fff',
                          color: formData.commission_type === 'revenue_share' ? '#1761fd' : '#475569',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '14px' }}>%</span> Revenue Share (%)
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      {formData.commission_type === 'revenue_share' ? (
                        <>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                            Revenue Share (%) <small style={{ color: '#64748b', fontWeight: 'normal' }}>(of Project CPI)</small>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="number" 
                              step="1"
                              min="1"
                              max="100"
                              className="input-field" 
                              style={{ width: '100%', paddingRight: '28px' }}
                              placeholder="e.g. 70"
                              value={formData.cpi_percentage ?? 70}
                              onChange={e => setFormData({ ...formData, cpi_percentage: parseFloat(e.target.value) || 0 })}
                            />
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>%</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                            e.g. 70% of $2.50 CPI = $1.75 vendor payout
                          </span>
                        </>
                      ) : (
                        <>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                            Default CPI Payout ($)
                          </label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>$</span>
                            <input 
                              type="number" 
                              step="0.05"
                              min="0"
                              className="input-field" 
                              style={{ width: '100%', paddingLeft: '24px' }}
                              placeholder="1.50"
                              value={formData.cpi ?? 1.50}
                              onChange={e => setFormData({ ...formData, cpi: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                            Fixed agreed payout per complete
                          </span>
                        </>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                        Status
                      </label>
                      <select 
                        className="input-field"
                        style={{ width: '100%' }}
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle Callback Redirects Section */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddRedirectsTab(!showAddRedirectsTab)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#1761fd'
                      }}
                    >
                      <Link2 size={14} />
                      {showAddRedirectsTab ? 'Hide 4 Callback Redirects' : 'Configure 4 Callback Redirects Now (Optional - Defaults Provided)'}
                    </button>

                    {showAddRedirectsTab && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                          Use <code>[UID]</code> as respondent ID placeholder.
                        </p>

                        <div>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#16a34a', marginBottom: '3px' }}>
                            Complete Callback URL
                          </label>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                            placeholder={`https://${formData.vendor_code || 'partner'}.com/survey/complete?uid=[UID]`}
                            value={formData.redirect_complete}
                            onChange={e => setFormData({ ...formData, redirect_complete: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#ef4444', marginBottom: '3px' }}>
                            Terminate Callback URL
                          </label>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                            placeholder={`https://${formData.vendor_code || 'partner'}.com/survey/terminate?uid=[UID]`}
                            value={formData.redirect_terminate}
                            onChange={e => setFormData({ ...formData, redirect_terminate: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#f59e0b', marginBottom: '3px' }}>
                            OverQuota Callback URL
                          </label>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                            placeholder={`https://${formData.vendor_code || 'partner'}.com/survey/overquota?uid=[UID]`}
                            value={formData.redirect_overquota}
                            onChange={e => setFormData({ ...formData, redirect_overquota: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#6366f1', marginBottom: '3px' }}>
                            Security Screenout Callback URL
                          </label>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', fontSize: '11.5px', fontFamily: 'monospace' }}
                            placeholder={`https://${formData.vendor_code || 'partner'}.com/survey/security?uid=[UID]`}
                            value={formData.redirect_security}
                            onChange={e => setFormData({ ...formData, redirect_security: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

                {addModalTab === 'countries' && (
                  <div style={{ padding: '24px' }}>
                    <CountriesSelector
                      selected={formData.countries || []}
                      onChange={c => setFormData({ ...formData, countries: c })}
                      countries={countriesList}
                    />
                  </div>
                )}

                {addModalTab === 'restrictions' && (
                  <div style={{ padding: '24px' }}>
                    <RestrictionsAndContacts
                      blockedClients={formData.blocked_clients || []}
                      onBlockedChange={b => setFormData({ ...formData, blocked_clients: b })}
                      contacts={formData.contacts || []}
                      onContactsChange={c => setFormData({ ...formData, contacts: c })}
                      clients={clientsList}
                    />
                  </div>
                )}

                <div style={{ 
                  borderTop: '1px solid #e2e8f0', 
                  padding: '14px 20px', 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '10px',
                  background: '#f8fafc' 
                }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ fontSize: '12px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                    <CheckCircle2 size={14} /> Create Vendor & Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* FRAME 001: DEDICATED ENTRY LINK MODAL */}
      {entryLinkVendor && (
        <ModalPortal isOpen={!!entryLinkVendor} onClose={() => setEntryLinkVendor(null)}>
          <div className="modal-overlay" onClick={() => setEntryLinkVendor(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(23, 97, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1761fd' }}>
                      <Share2 size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                        Entry Link for {entryLinkVendor.vendor_code || entryLinkVendor.vendorUid || entryLinkVendor._id || 'Vendor'}
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                        Panel: <strong style={{ color: '#1d2c48' }}>{entryLinkVendor.name}</strong> • Base CPI: <strong style={{ color: '#03d87f' }}>${Number(entryLinkVendor.cpi || 0).toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setEntryLinkVendor(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Step 1: Project Selector */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1d2c48', marginBottom: '6px' }}>
                    1. Select Study / Research Project
                  </label>
                  <select
                    className="input-field"
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    style={{ width: '100%', fontSize: '12.5px', padding: '9px 12px' }}
                  >
                    {projectsList.length > 0 ? (
                      projectsList.map(p => (
                        <option key={p.project_id || p.id} value={p.project_id || p.id}>
                          {p.project_id || p.id} — {p.project_name || p.name || 'Study'} (${Number(p.cpi || p.cost_per_complete || 1.00).toFixed(2)} CPI)
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="VMHPI026622026">VMHPI026622026 — VMHMXIN2661 ($1.00 CPI)</option>
                        <option value="VMHPI024912025">VMHPI024912025 — VMH#100188 ($1.00 CPI)</option>
                        <option value="VMHPI024062025">VMHPI024062025 — VMH#100123 China ($1.00 CPI)</option>
                      </>
                    )}
                    <option value="CUSTOM">-- Custom Project ID --</option>
                  </select>

                  {selectedProjectId === 'CUSTOM' && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter custom project ID (e.g. PRJ_TEST_99)"
                        value={customProjectId}
                        onChange={e => setCustomProjectId(e.target.value)}
                        style={{ width: '100%', fontSize: '12px', fontFamily: 'monospace' }}
                      />
                    </div>
                  )}
                </div>

                {/* Step 2: Generated Vendor Entry URL */}
                {(() => {
                  const activePid = selectedProjectId === 'CUSTOM' ? (customProjectId || 'CUSTOM_PRJ') : selectedProjectId;
                  const vCode = entryLinkVendor.vendor_code || entryLinkVendor.vendorUid || entryLinkVendor._id;
                  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smr.vmhgroupsmr.com';
                  const liveEntryUrl = `${origin}/vendor/auth/${vCode}/project/${activePid}?uid=[uid]`;
                  const testEntryUrl = `${origin}/vendor/auth/${vCode}/project/${activePid}?uid=${testUidParam}`;
                  const directCallbackUrl = `${origin}/survey/callback?status=20&uid=${testUidParam}&pid=${activePid}&vid=${vCode}`;

                  return (
                    <div>
                      <div style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48', margin: 0 }}>
                            2. Generated Inbound Vendor Entry URL
                          </label>
                          <span className="badge-soft-success" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                            Live Router Format
                          </span>
                        </div>
                        <div style={{ 
                          background: '#0f172a', 
                          border: '1px solid #1e293b', 
                          borderRadius: '6px', 
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}>
                          <code style={{ 
                            fontSize: '12px', 
                            color: '#38bdf8', 
                            fontFamily: 'monospace', 
                            wordBreak: 'break-all',
                            lineHeight: '1.4'
                          }}>
                            {liveEntryUrl}
                          </code>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(liveEntryUrl);
                              setCopiedEntryLink(true);
                              setTimeout(() => setCopiedEntryLink(false), 2000);
                            }}
                            style={{ 
                              whiteSpace: 'nowrap', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              padding: '7px 12px',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            {copiedEntryLink ? <Check size={14} color="#fff" /> : <Copy size={14} />}
                            {copiedEntryLink ? 'Copied Link!' : 'Copy Link'}
                          </button>
                        </div>
                        <p style={{ margin: '6px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                          Instruct <strong>{entryLinkVendor.name}</strong> to dynamically replace <code style={{ color: '#1761fd', fontWeight: 700 }}>[uid]</code> with their panelist's unique respondent ID for each survey attempt.
                        </p>
                      </div>

                      {/* Step 3: Test in Incognito / New Tab */}
                      <div style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '6px', 
                        padding: '14px',
                        marginBottom: '18px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1d2c48' }}>
                            3. Live Link Verification & Pre-Launch Testing
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Exact flow demonstrated in Admin Video 1
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                              Test Respondent UID
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              value={testUidParam}
                              onChange={e => setTestUidParam(e.target.value)}
                              style={{ width: '100%', fontSize: '12px', fontFamily: 'monospace', padding: '6px 10px' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <a
                            href={testEntryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '12px', 
                              fontWeight: 700,
                              textDecoration: 'none',
                              padding: '7px 12px'
                            }}
                          >
                            <ExternalLink size={13} />
                            <span>Test Open Router (Incognito/New Tab)</span>
                          </a>

                          <a
                            href={directCallbackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-soft-warning btn-sm"
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '12px', 
                              fontWeight: 700,
                              textDecoration: 'none',
                              padding: '7px 12px'
                            }}
                          >
                            <AlertTriangle size={13} />
                            <span>Direct Test Branded Termination Page (Frame 003)</span>
                          </a>
                        </div>
                      </div>

                      {/* Video Reference Architecture Notes */}
                      <div style={{ 
                        background: '#eff6ff', 
                        border: '1px solid #bfdbfe', 
                        borderRadius: '6px', 
                        padding: '12px 14px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#1e40af', fontSize: '12px', fontWeight: 700 }}>
                          <ShieldCheck size={14} />
                          <span>How Inbound Traffic is Protected (Admin Video Guide)</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#1e3a8a', lineHeight: '1.6' }}>
                          <li><strong>Zero Client Exposure:</strong> The supplier never sees the raw buyer URL. All traffic passes through the VMH Router.</li>
                          <li><strong>Real-Time Screening:</strong> IP geolocation, repeat clicks, and fraud behavior are checked before forwarding to the client.</li>
                          <li><strong>Branded Termination:</strong> Screened-out or overquota respondents land on the official VMH Termination screen (Frame 003).</li>
                          <li><strong>Cryptographic S2S:</strong> Status 10/20/30/40 callbacks are signed with {entryLinkVendor.hash_algorithm || 'SHA3-256'} anti-tamper salt.</li>
                        </ul>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEntryLinkVendor(null)}
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Vendor Integration Specification Modal */}
      {showSpecModal && (
        <VendorIntegrationDocModal 
          isOpen={showSpecModal} 
          onClose={() => setShowSpecModal(false)} 
        />
      )}
    </div>
  );
}
