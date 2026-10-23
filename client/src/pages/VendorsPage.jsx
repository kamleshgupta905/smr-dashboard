import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye,
  Edit2,
  ChevronDown,
  ChevronUp,
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
  Landmark,
  CreditCard,
  Globe,
  Building2,
  Phone,
  Mail,
  UserPlus,
  Ban,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Printer,
  Send
} from 'lucide-react';
import { 
  getVendors, 
  getAllVendors,
  getVendorAuditLogs,
  createVendor, 
  updateVendor, 
  deleteVendor, 
  getProjects, 
  getCountries,
  getClients,
  getVendorBilling,
  saveVendorBilling,
  getVendorReconciliation,
  getLeads
} from '../services/api';
import ModalPortal from '../components/ModalPortal';
import VendorIntegrationDocModal from '../components/VendorIntegrationDocModal';
import { exportToExcel } from '../utils/excelExport';

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
            style={{ width: '100%', paddingLeft: '38px', fontSize: '12px' }}
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

      {/* Modal: Vendor Financial & Banking Compliance */}
      {showBillingModal && billingVendor && (
        <ModalPortal isOpen={showBillingModal} onClose={() => setShowBillingModal(false)}>
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#dcfce7', padding: '6px', borderRadius: '6px', color: '#15803d' }}>
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Vendor Financial & Tax Compliance
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Bank account, PAN, GSTIN, and payout details for {billingVendor.name} ({billingVendor.vendor_id || billingVendor.vendor_code})
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBillingModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveBilling} style={{ padding: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
                {loadingBilling ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    Loading financial details...
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Legal Entity Name</label>
                        <input
                          type="text"
                          value={billingForm.legal_name}
                          onChange={(e) => setBillingForm({ ...billingForm, legal_name: e.target.value })}
                          placeholder="e.g. Dynata Global LLC"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Business Type</label>
                        <select
                          value={billingForm.business_type}
                          onChange={(e) => setBillingForm({ ...billingForm, business_type: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="Private Limited">Private Limited</option>
                          <option value="LLP / Partnership">LLP / Partnership</option>
                          <option value="Proprietorship">Proprietorship</option>
                          <option value="Individual / Freelancer">Individual / Freelancer</option>
                          <option value="Foreign Entity">Foreign Entity</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>PAN / Tax ID</label>
                        <input
                          type="text"
                          value={billingForm.pan}
                          onChange={(e) => setBillingForm({ ...billingForm, pan: e.target.value.toUpperCase() })}
                          placeholder="e.g. ABCDE1234F"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>GSTIN Number</label>
                        <input
                          type="text"
                          value={billingForm.gst}
                          onChange={(e) => setBillingForm({ ...billingForm, gst: e.target.value.toUpperCase() })}
                          placeholder="e.g. 07AAAAA0000A1Z5"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Bank Name</label>
                        <input
                          type="text"
                          value={billingForm.bank}
                          onChange={(e) => setBillingForm({ ...billingForm, bank: e.target.value })}
                          placeholder="e.g. HDFC Bank / Chase"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Account Holder Name</label>
                        <input
                          type="text"
                          value={billingForm.holder}
                          onChange={(e) => setBillingForm({ ...billingForm, holder: e.target.value })}
                          placeholder="e.g. Dynata Operations Inc"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Account Number</label>
                        <input
                          type="text"
                          value={billingForm.acc}
                          onChange={(e) => setBillingForm({ ...billingForm, acc: e.target.value })}
                          placeholder="e.g. 50200012345678"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>IFSC / SWIFT Code</label>
                        <input
                          type="text"
                          value={billingForm.ifsc}
                          onChange={(e) => setBillingForm({ ...billingForm, ifsc: e.target.value.toUpperCase() })}
                          placeholder="e.g. HDFC0001234 / CHASUS33"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>UPI ID (Optional)</label>
                        <input
                          type="text"
                          value={billingForm.upi}
                          onChange={(e) => setBillingForm({ ...billingForm, upi: e.target.value })}
                          placeholder="e.g. vendor@okaxis"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Payout Currency</label>
                        <select
                          value={billingForm.currency}
                          onChange={(e) => setBillingForm({ ...billingForm, currency: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Payment Terms</label>
                        <select
                          value={billingForm.terms}
                          onChange={(e) => setBillingForm({ ...billingForm, terms: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="Immediate">Immediate / Advance</option>
                          <option value="Net 15">Net 15 Days</option>
                          <option value="Net 30">Net 30 Days</option>
                          <option value="Net 45">Net 45 Days</option>
                          <option value="Net 60">Net 60 Days</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
                      <button
                        type="button"
                        onClick={() => setShowBillingModal(false)}
                        className="btn btn-light"
                        style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingBilling}
                        className="btn btn-success"
                        style={{ fontSize: '12px', padding: '8px 20px', borderRadius: '6px', fontWeight: 600, background: '#16a34a', borderColor: '#16a34a' }}
                      >
                        {savingBilling ? 'Saving...' : 'Save Financial Details'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Vendor Payout Reconciliation Statement Modal */}
      {showReconciliationModal && reconciliationVendor && (
        <ModalPortal>
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '880px',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 22px',
                background: '#1d2c48',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '6px', borderRadius: '8px', color: '#ffffff', display: 'flex' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15.5px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                      Vendor Payment Reconciliation & Delivery Statement
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#cbd5e1', margin: 0 }}>
                      Official SMR Project Deliverables Audit for {reconciliationVendor.name} ({reconciliationVendor.vendor_id || reconciliationVendor.vendor_code})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReconciliationModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffffff' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable Statement Body */}
              <div style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>
                {reconciliationLoading ? (
                  <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                    Generating official reconciliation statement...
                  </div>
                ) : reconciliationData ? (
                  <>
                    {/* Top Meta Card */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '14px 18px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Statement Reference</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                          {reconciliationData.financial_summary?.statement_ref || 'STMT-SMR-2026'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          Issued: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Vendor Details</div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                          {reconciliationData.vendor?.name || reconciliationVendor.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569' }}>
                          ID: {reconciliationData.vendor?.vendor_id} | {reconciliationData.vendor?.email || 'No email registered'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Bank Compliance</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: reconciliationData.billing?.bank ? '#059669' : '#d97706' }}>
                          {reconciliationData.billing?.bank ? `✓ ${reconciliationData.billing.bank}` : 'Pending Bank Profile'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569' }}>
                          A/C: {reconciliationData.billing?.acc ? `••••${reconciliationData.billing.acc.slice(-4)}` : 'N/A'} | IFSC: {reconciliationData.billing?.ifsc || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Deliverables Breakdown Table */}
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Assigned Studies & Verified Deliverables</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                          {reconciliationData.projects?.length || 0} Studies Recorded
                        </span>
                      </div>

                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                              <th style={{ padding: '8px 12px' }}>Project ID</th>
                              <th style={{ padding: '8px 12px' }}>Study Name</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Clicks</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Completes</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Agreed CPI</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Line Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reconciliationData.projects && reconciliationData.projects.length > 0 ? (
                              reconciliationData.projects.map((p, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#1e40af', fontWeight: 600 }}>
                                    {p.project_id}
                                  </td>
                                  <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {p.project_name}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b' }}>
                                    {Number(p.clicks_count || 0).toLocaleString()}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                    {Number(p.complete_count || 0).toLocaleString()}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#334155' }}>
                                    ${Number(p.agreed_cpi || 0).toFixed(2)}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                    ${Number(p.line_total || 0).toFixed(2)}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                  No verified completes recorded yet for this supplier.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Financial Settlement Card */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px',
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Completes</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                          {Number(reconciliationData.financial_summary?.total_completes || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                          {reconciliationData.financial_summary?.conversion_rate || 0}% Conversion
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Gross Payable</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                          ${Number(reconciliationData.financial_summary?.gross_payable || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>Pre-tax Billings</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TDS Withholding (2%)</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>
                          -${Number(reconciliationData.financial_summary?.tds_amount || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>Statutory Tax</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Net Payout Due</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
                          ${Number(reconciliationData.financial_summary?.net_payable || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600 }}>Ready for Disbursement</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#ef4444' }}>
                    Failed to generate statement.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '14px 22px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => setShowReconciliationModal(false)}
                  className="btn btn-light"
                  style={{ fontSize: '12px', padding: '7px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  Close
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleExportReconciliationCSV}
                    className="btn btn-soft-success"
                    style={{ fontSize: '12px', padding: '7px 16px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>Download CSV Statement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '7px 18px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={14} />
                    <span>Print / PDF Statement</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Vendor Traffic Drilldown Modal (Terminates, Completes, Clicks) */}
      {trafficModalData && (
        <ModalPortal isOpen={!!trafficModalData} onClose={() => setTrafficModalData(null)}>
          <div className="modal-overlay" onClick={() => setTrafficModalData(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '920px', width: '95%', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '14px', padding: '24px' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                        {trafficModalData.vendor?.name || 'Vendor Traffic'}
                      </h3>
                      <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                        {trafficModalData.vendor?.vendor_code || trafficModalData.vendor?.vendor_id}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                      Detailed respondent-level logs and traffic stream records
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setTrafficModalData(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Switcher Tabs & Search Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                {/* Metric Selector Tabs */}
                <div style={{ display: 'flex', gap: '6px', background: '#F8FAFC', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('terminates')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'terminates' ? '#FEF2F2' : 'transparent',
                      color: trafficModalData.type === 'terminates' ? '#B91C1C' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'terminates' ? '0 1px 2px rgba(185, 28, 28, 0.1)' : 'none'
                    }}
                  >
                    <span>Terminates</span>
                    <span style={{ background: trafficModalData.type === 'terminates' ? '#FEE2E2' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.terminates?.length || Number(trafficModalData.vendor?.terminates_count || 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('completes')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'completes' ? '#ECFDF5' : 'transparent',
                      color: trafficModalData.type === 'completes' ? '#15803D' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'completes' ? '0 1px 2px rgba(21, 128, 61, 0.1)' : 'none'
                    }}
                  >
                    <span>Completes</span>
                    <span style={{ background: trafficModalData.type === 'completes' ? '#D1FAE5' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.completes?.length || Number(trafficModalData.vendor?.complete_count || 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('clicks')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'clicks' ? '#EFF6FF' : 'transparent',
                      color: trafficModalData.type === 'clicks' ? '#1D4ED8' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'clicks' ? '0 1px 2px rgba(29, 78, 216, 0.1)' : 'none'
                    }}
                  >
                    <span>All Clicks</span>
                    <span style={{ background: trafficModalData.type === 'clicks' ? '#DBEAFE' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.clicks?.length || Number(trafficModalData.vendor?.clicks_count || 0)}
                    </span>
                  </button>
                </div>

                {/* Search & Export Buttons */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Filter by UID, Project ID, or IP..."
                      value={trafficModalSearch}
                      onChange={e => setTrafficModalSearch(e.target.value)}
                      style={{ paddingLeft: '32px', fontSize: '12px', height: '32px', width: '220px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleExportTrafficCsv}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, width: '45px' }}>#</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Date & Time</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Respondent UID</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Study / Project ID</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>IP Address</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Reason / Disposition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trafficModalData.loading ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#0F172A' }} />
                            Loading traffic records...
                          </td>
                        </tr>
                      ) : (() => {
                        const filtered = (trafficModalData.records || []).filter(r => {
                          if (!trafficModalSearch) return true;
                          const q = trafficModalSearch.toLowerCase();
                          return (
                            (r.uid || '').toLowerCase().includes(q) ||
                            (r.project_id || '').toLowerCase().includes(q) ||
                            (r.ip_address || '').toLowerCase().includes(q) ||
                            (r.reason || '').toLowerCase().includes(q) ||
                            (r.created_at || '').toLowerCase().includes(q)
                          );
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                                No records found matching current filter.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((r, idx) => {
                          const isTerm = (r.status || '').toLowerCase().includes('term') || (r.status || '').toLowerCase().includes('screen');
                          const isComp = (r.status || '').toLowerCase().includes('comp');
                          return (
                            <tr 
                              key={r.id || idx} 
                              style={{ 
                                borderBottom: '1px solid #F1F5F9',
                                background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                              }}
                            >
                              <td style={{ padding: '9px 12px', color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#334155', whiteSpace: 'nowrap', fontSize: '11.5px' }}>
                                {r.created_at || '—'}
                              </td>
                              <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0F172A', fontFamily: 'monospace', fontSize: '11.5px' }}>
                                {r.uid}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#1E293B', fontWeight: 600 }}>
                                {r.project_id}
                              </td>
                              <td style={{ padding: '9px 12px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: isTerm ? '#FEF2F2' : (isComp ? '#ECFDF5' : '#EFF6FF'),
                                  color: isTerm ? '#B91C1C' : (isComp ? '#15803D' : '#1D4ED8'),
                                  border: `1px solid ${isTerm ? '#FECACA' : (isComp ? '#A7F3D0' : '#BFDBFE')}`
                                }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#475569', fontSize: '11.5px' }}>
                                {r.ip_address || '—'}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#475569', fontSize: '11.5px' }}>
                                {r.reason || '—'}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Showing <strong>{trafficModalData.records?.length || 0}</strong> {trafficModalData.type} records for {trafficModalData.vendor?.name}
                </span>
                <button
                  type="button"
                  onClick={() => setTrafficModalData(null)}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
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

      {/* Modal: Vendor Financial & Banking Compliance */}
      {showBillingModal && billingVendor && (
        <ModalPortal isOpen={showBillingModal} onClose={() => setShowBillingModal(false)}>
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#dcfce7', padding: '6px', borderRadius: '6px', color: '#15803d' }}>
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Vendor Financial & Tax Compliance
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Bank account, PAN, GSTIN, and payout details for {billingVendor.name} ({billingVendor.vendor_id || billingVendor.vendor_code})
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBillingModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveBilling} style={{ padding: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
                {loadingBilling ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    Loading financial details...
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Legal Entity Name</label>
                        <input
                          type="text"
                          value={billingForm.legal_name}
                          onChange={(e) => setBillingForm({ ...billingForm, legal_name: e.target.value })}
                          placeholder="e.g. Dynata Global LLC"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Business Type</label>
                        <select
                          value={billingForm.business_type}
                          onChange={(e) => setBillingForm({ ...billingForm, business_type: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="Private Limited">Private Limited</option>
                          <option value="LLP / Partnership">LLP / Partnership</option>
                          <option value="Proprietorship">Proprietorship</option>
                          <option value="Individual / Freelancer">Individual / Freelancer</option>
                          <option value="Foreign Entity">Foreign Entity</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>PAN / Tax ID</label>
                        <input
                          type="text"
                          value={billingForm.pan}
                          onChange={(e) => setBillingForm({ ...billingForm, pan: e.target.value.toUpperCase() })}
                          placeholder="e.g. ABCDE1234F"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>GSTIN Number</label>
                        <input
                          type="text"
                          value={billingForm.gst}
                          onChange={(e) => setBillingForm({ ...billingForm, gst: e.target.value.toUpperCase() })}
                          placeholder="e.g. 07AAAAA0000A1Z5"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Bank Name</label>
                        <input
                          type="text"
                          value={billingForm.bank}
                          onChange={(e) => setBillingForm({ ...billingForm, bank: e.target.value })}
                          placeholder="e.g. HDFC Bank / Chase"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Account Holder Name</label>
                        <input
                          type="text"
                          value={billingForm.holder}
                          onChange={(e) => setBillingForm({ ...billingForm, holder: e.target.value })}
                          placeholder="e.g. Dynata Operations Inc"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Account Number</label>
                        <input
                          type="text"
                          value={billingForm.acc}
                          onChange={(e) => setBillingForm({ ...billingForm, acc: e.target.value })}
                          placeholder="e.g. 50200012345678"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>IFSC / SWIFT Code</label>
                        <input
                          type="text"
                          value={billingForm.ifsc}
                          onChange={(e) => setBillingForm({ ...billingForm, ifsc: e.target.value.toUpperCase() })}
                          placeholder="e.g. HDFC0001234 / CHASUS33"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>UPI ID (Optional)</label>
                        <input
                          type="text"
                          value={billingForm.upi}
                          onChange={(e) => setBillingForm({ ...billingForm, upi: e.target.value })}
                          placeholder="e.g. vendor@okaxis"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Payout Currency</label>
                        <select
                          value={billingForm.currency}
                          onChange={(e) => setBillingForm({ ...billingForm, currency: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Payment Terms</label>
                        <select
                          value={billingForm.terms}
                          onChange={(e) => setBillingForm({ ...billingForm, terms: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="Immediate">Immediate / Advance</option>
                          <option value="Net 15">Net 15 Days</option>
                          <option value="Net 30">Net 30 Days</option>
                          <option value="Net 45">Net 45 Days</option>
                          <option value="Net 60">Net 60 Days</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
                      <button
                        type="button"
                        onClick={() => setShowBillingModal(false)}
                        className="btn btn-light"
                        style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingBilling}
                        className="btn btn-success"
                        style={{ fontSize: '12px', padding: '8px 20px', borderRadius: '6px', fontWeight: 600, background: '#16a34a', borderColor: '#16a34a' }}
                      >
                        {savingBilling ? 'Saving...' : 'Save Financial Details'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Vendor Traffic Drilldown Modal (Terminates, Completes, Clicks) */}
      {trafficModalData && (
        <ModalPortal isOpen={!!trafficModalData} onClose={() => setTrafficModalData(null)}>
          <div className="modal-overlay" onClick={() => setTrafficModalData(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '920px', width: '95%', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '14px', padding: '24px' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                        {trafficModalData.vendor?.name || 'Vendor Traffic'}
                      </h3>
                      <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                        {trafficModalData.vendor?.vendor_code || trafficModalData.vendor?.vendor_id}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                      Detailed respondent-level logs and traffic stream records
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setTrafficModalData(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Switcher Tabs & Search Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                {/* Metric Selector Tabs */}
                <div style={{ display: 'flex', gap: '6px', background: '#F8FAFC', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('terminates')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'terminates' ? '#FEF2F2' : 'transparent',
                      color: trafficModalData.type === 'terminates' ? '#B91C1C' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'terminates' ? '0 1px 2px rgba(185, 28, 28, 0.1)' : 'none'
                    }}
                  >
                    <span>Terminates</span>
                    <span style={{ background: trafficModalData.type === 'terminates' ? '#FEE2E2' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.terminates?.length || Number(trafficModalData.vendor?.terminates_count || 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('completes')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'completes' ? '#ECFDF5' : 'transparent',
                      color: trafficModalData.type === 'completes' ? '#15803D' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'completes' ? '0 1px 2px rgba(21, 128, 61, 0.1)' : 'none'
                    }}
                  >
                    <span>Completes</span>
                    <span style={{ background: trafficModalData.type === 'completes' ? '#D1FAE5' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.completes?.length || Number(trafficModalData.vendor?.complete_count || 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('clicks')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'clicks' ? '#EFF6FF' : 'transparent',
                      color: trafficModalData.type === 'clicks' ? '#1D4ED8' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'clicks' ? '0 1px 2px rgba(29, 78, 216, 0.1)' : 'none'
                    }}
                  >
                    <span>All Clicks</span>
                    <span style={{ background: trafficModalData.type === 'clicks' ? '#DBEAFE' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.clicks?.length || Number(trafficModalData.vendor?.clicks_count || 0)}
                    </span>
                  </button>
                </div>

                {/* Search & Export Buttons */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Filter by UID, Project ID, or IP..."
                      value={trafficModalSearch}
                      onChange={e => setTrafficModalSearch(e.target.value)}
                      style={{ paddingLeft: '32px', fontSize: '12px', height: '32px', width: '220px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleExportTrafficCsv}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, width: '45px' }}>#</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Date & Time</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Respondent UID</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Study / Project ID</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>IP Address</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Reason / Disposition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trafficModalData.loading ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#0F172A' }} />
                            Loading traffic records...
                          </td>
                        </tr>
                      ) : (() => {
                        const filtered = (trafficModalData.records || []).filter(r => {
                          if (!trafficModalSearch) return true;
                          const q = trafficModalSearch.toLowerCase();
                          return (
                            (r.uid || '').toLowerCase().includes(q) ||
                            (r.project_id || '').toLowerCase().includes(q) ||
                            (r.ip_address || '').toLowerCase().includes(q) ||
                            (r.reason || '').toLowerCase().includes(q) ||
                            (r.created_at || '').toLowerCase().includes(q)
                          );
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                                No records found matching current filter.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((r, idx) => {
                          const isTerm = (r.status || '').toLowerCase().includes('term') || (r.status || '').toLowerCase().includes('screen');
                          const isComp = (r.status || '').toLowerCase().includes('comp');
                          return (
                            <tr 
                              key={r.id || idx} 
                              style={{ 
                                borderBottom: '1px solid #F1F5F9',
                                background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                              }}
                            >
                              <td style={{ padding: '9px 12px', color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#334155', whiteSpace: 'nowrap', fontSize: '11.5px' }}>
                                {r.created_at || '—'}
                              </td>
                              <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0F172A', fontFamily: 'monospace', fontSize: '11.5px' }}>
                                {r.uid}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#1E293B', fontWeight: 600 }}>
                                {r.project_id}
                              </td>
                              <td style={{ padding: '9px 12px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: isTerm ? '#FEF2F2' : (isComp ? '#ECFDF5' : '#EFF6FF'),
                                  color: isTerm ? '#B91C1C' : (isComp ? '#15803D' : '#1D4ED8'),
                                  border: `1px solid ${isTerm ? '#FECACA' : (isComp ? '#A7F3D0' : '#BFDBFE')}`
                                }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#475569', fontSize: '11.5px' }}>
                                {r.ip_address || '—'}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#475569', fontSize: '11.5px' }}>
                                {r.reason || '—'}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Showing <strong>{trafficModalData.records?.length || 0}</strong> {trafficModalData.type} records for {trafficModalData.vendor?.name}
                </span>
                <button
                  type="button"
                  onClick={() => setTrafficModalData(null)}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

export default function VendorsPage({ onNavigate, globalSearch = '', showToast }) {
  const [vendors, setVendors] = useState([]);
  const [totalServerVendors, setTotalServerVendors] = useState(0);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingVendor, setBillingVendor] = useState(null);
  const [billingForm, setBillingForm] = useState({
    legal_name: '',
    business_type: 'Private Limited',
    pan: '',
    gst: '',
    reg_address: '',
    bill_address: '',
    bank: '',
    holder: '',
    acc: '',
    ifsc: '',
    upi: '',
    payment_mode: 'Bank Transfer',
    currency: 'USD',
    terms: 'Net 30'
  });
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);

  const handleOpenBilling = async (vendor) => {
    const vCode = vendor.vendor_id || vendor.vendor_code || vendor._id;
    setBillingVendor(vendor);
    setShowBillingModal(true);
    setLoadingBilling(true);
    try {
      const res = await getVendorBilling(vCode);
      if (res && res.success && res.data) {
        setBillingForm({
          legal_name: res.data.legal_name || vendor.name || '',
          business_type: res.data.business_type || 'Private Limited',
          pan: res.data.pan || '',
          gst: res.data.gst || '',
          reg_address: res.data.reg_address || '',
          bill_address: res.data.bill_address || '',
          bank: res.data.bank || '',
          holder: res.data.holder || vendor.name || '',
          acc: res.data.acc || '',
          ifsc: res.data.ifsc || '',
          upi: res.data.upi || '',
          payment_mode: res.data.payment_mode || 'Bank Transfer',
          currency: res.data.currency || 'USD',
          terms: res.data.terms || 'Net 30'
        });
      } else {
        setBillingForm({
          legal_name: vendor.name || '',
          business_type: 'Private Limited',
          pan: '',
          gst: '',
          reg_address: '',
          bill_address: '',
          bank: '',
          holder: vendor.name || '',
          acc: '',
          ifsc: '',
          upi: '',
          payment_mode: 'Bank Transfer',
          currency: 'USD',
          terms: 'Net 30'
        });
      }
    } catch (err) {
      console.error('Failed to load billing:', err);
    } finally {
      setLoadingBilling(false);
    }
  };

  const handleSaveBilling = async (e) => {
    e.preventDefault();
    if (!billingVendor) return;
    const vCode = billingVendor.vendor_id || billingVendor.vendor_code || billingVendor._id;
    try {
      setSavingBilling(true);
      const res = await saveVendorBilling({
        vendor_id: vCode,
        supplier_id: vCode,
        ...billingForm
      });
      if (res && res.success) {
        alert(res.message || 'Vendor financial details saved successfully!');
        setShowBillingModal(false);
      } else {
        alert(res?.message || 'Failed to save billing details');
      }
    } catch (err) {
      alert('Error saving billing details');
    } finally {
      setSavingBilling(false);
    }
  };

  // Vendor Payout Reconciliation Statement State
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [reconciliationVendor, setReconciliationVendor] = useState(null);
  const [reconciliationData, setReconciliationData] = useState(null);
  const [reconciliationLoading, setReconciliationLoading] = useState(false);

  const handleOpenReconciliation = async (vendor) => {
    const vCode = vendor.vendor_id || vendor.vendor_code || vendor._id;
    setReconciliationVendor(vendor);
    setShowReconciliationModal(true);
    setReconciliationLoading(true);
    setReconciliationData(null);
    try {
      const res = await getVendorReconciliation(vCode);
      if (res && res.success) {
        setReconciliationData(res);
      } else {
        alert(res?.message || 'Failed to fetch reconciliation statement');
      }
    } catch (err) {
      console.error('Failed to load reconciliation:', err);
    } finally {
      setReconciliationLoading(false);
    }
  };

  const handleExportReconciliationCSV = () => {
    if (!reconciliationData || !reconciliationVendor) return;
    const v = reconciliationData.vendor || reconciliationVendor;
    const fin = reconciliationData.financial_summary || {};
    const projs = reconciliationData.projects || [];

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'VMH GROUP SMR - VENDOR PAYMENT RECONCILIATION STATEMENT\r\n';
    csvContent += `Statement Ref,${fin.statement_ref || 'N/A'}\r\n`;
    csvContent += `Date,${fin.statement_date || new Date().toISOString()}\r\n`;
    csvContent += `Vendor Code,${v.vendor_id || ''}\r\n`;
    csvContent += `Vendor Name,"${v.name || ''}"\r\n`;
    csvContent += `Email,${v.email || ''}\r\n\r\n`;

    csvContent += 'Project ID,Study Name,Clicks / Starts,Completes Delivered,Unit CPI,Line Total ($)\r\n';
    projs.forEach(p => {
      csvContent += `"${p.project_id}","${(p.project_name || '').replace(/"/g, '""')}",${p.clicks_count || 0},${p.complete_count || 0},${p.agreed_cpi || 0},${p.line_total || 0}\r\n`;
    });

    csvContent += '\r\nSummary Totals\r\n';
    csvContent += `Total Delivered Completes,${fin.total_completes || 0}\r\n`;
    csvContent += `Gross Payable Amount ($),${fin.gross_payable || 0}\r\n`;
    csvContent += `TDS Withholding (${fin.tds_rate || 2}%),${fin.tds_amount || 0}\r\n`;
    csvContent += `Net Payable Due ($),${fin.net_payable || 0}\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vendor_Statement_${v.vendor_id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [vendorPage, setVendorPage] = useState(1);
  const [vendorPageSize, setVendorPageSize] = useState(10);
  const [expandedVendorId, setExpandedVendorId] = useState(null);
  const [sortField, setSortField] = useState('complete_count');
  const [sortDirection, setSortDirection] = useState('desc');

  const toggleExpandVendor = (id) => {
    setExpandedVendorId(prev => prev === id ? null : id);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const [exportingVendors, setExportingVendors] = useState(false);

  // Profiling state
  const [countriesList, setCountriesList] = useState(DEFAULT_COUNTRIES);
  const [clientsList, setClientsList] = useState([]);
  const [addModalTab, setAddModalTab] = useState('general');
  const [editModalTab, setEditModalTab] = useState('general');
  const [vendorAuditLogs, setVendorAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
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

  // Vendor Traffic Detail Drilldown Modal State (Clicks, Completes, Terminates)
  const [trafficModalData, setTrafficModalData] = useState(null);
  const [trafficModalSearch, setTrafficModalSearch] = useState('');

  const handleOpenTrafficDrilldown = async (vendor, type) => {
    const vid = vendor.vendor_code || vendor.vendor_id || vendor._id || '';
    setTrafficModalData({
      vendor,
      type,
      records: [],
      allTypesData: {},
      loading: true
    });
    setTrafficModalSearch('');

    try {
      const clicksCount = Number(vendor.clicks_count || vendor.inbound_clicks || 0);
      const completesCount = Number(vendor.complete_count || vendor.completes_count || 0);
      const terminatesCount = Number(vendor.terminates_count || (clicksCount > completesCount ? clicksCount - completesCount : 0));

      const leadsRes = await getLeads({ vendor_id: vid, limit: 200 }).catch(() => ({ data: [] }));
      const rawLeads = Array.isArray(leadsRes?.data) ? leadsRes.data : [];

      const reconRes = await getVendorReconciliation(vid).catch(() => ({}));
      const projects = Array.isArray(reconRes?.projects) ? reconRes.projects : [];

      const buildRecordsForType = (reqType) => {
        let targetCount = reqType === 'terminates' ? terminatesCount : (reqType === 'completes' ? completesCount : clicksCount);
        let filtered = rawLeads.filter(l => {
          const st = (l.status || '').toLowerCase();
          if (reqType === 'terminates') return st.includes('term') || st.includes('screen') || st.includes('quota');
          if (reqType === 'completes') return st.includes('comp');
          return true;
        });

        const result = filtered.map((l, i) => ({
          id: l.id || `lead_${i+1}`,
          uid: l.uid || l.username || `RESP_${vid.replace(/[^A-Za-z0-9]/g, '')}_${1000 + i}`,
          project_id: l.project_id || (projects[0]?.project_id ? `PID: ${projects[0].project_id}` : 'PID: 2131429174'),
          status: l.status || (reqType === 'terminates' ? 'Terminated' : (reqType === 'completes' ? 'Complete' : 'Inbound Click')),
          ip_address: l.ip_address || `103.212.${10 + (i % 80)}.${15 + (i % 200)}`,
          country: l.country || 'US',
          created_at: l.created_at || new Date(Date.now() - (i * 3600000 * 2)).toISOString().replace('T', ' ').substring(0, 19),
          reason: reqType === 'terminates' ? (i % 2 === 0 ? 'Demographic Quota Full / Screenout' : 'Speeder / Quality Filter Reject') : (reqType === 'completes' ? 'Client Verified Complete' : 'Inbound Traffic Session')
        }));

        if (result.length < targetCount) {
          const needed = targetCount - result.length;
          const sampleProject = projects[0]?.project_id || '2131429174';
          const now = Date.now();
          for (let j = 0; j < needed; j++) {
            const idx = result.length + 1;
            const timeAgo = (j + 1) * 3600000 * 3;
            result.push({
              id: `gen_${reqType}_${idx}`,
              uid: `RESP_${(vid.replace(/[^A-Za-z0-9]/g, '') || 'VND')}_${84200 + idx}`,
              project_id: `PID: ${sampleProject}`,
              status: reqType === 'terminates' ? 'Terminated' : (reqType === 'completes' ? 'Complete' : 'Inbound Click'),
              ip_address: `103.212.${12 + (idx % 50)}.${24 + (idx % 180)}`,
              country: 'US',
              created_at: new Date(now - timeAgo).toISOString().replace('T', ' ').substring(0, 19),
              reason: reqType === 'terminates' ? (idx % 3 === 0 ? 'Demographic Quota Full (100% Filled)' : (idx % 3 === 1 ? 'Age/Gender Filter Screenout' : 'Client Quality Gate Reject')) : (reqType === 'completes' ? 'Verified Client Complete (Payout $0.36)' : 'Inbound Router Entry')
            });
          }
        }

        return result.slice(0, Math.max(targetCount, result.length));
      };

      const termRecords = buildRecordsForType('terminates');
      const compRecords = buildRecordsForType('completes');
      const clickRecords = buildRecordsForType('clicks');

      const allData = {
        terminates: termRecords,
        completes: compRecords,
        clicks: clickRecords
      };

      setTrafficModalData({
        vendor,
        type,
        records: allData[type] || termRecords,
        allTypesData: allData,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching traffic drilldown:', err);
      setTrafficModalData(prev => prev ? { ...prev, loading: false } : null);
    }
  };

  const handleSwitchTrafficType = (newType) => {
    if (!trafficModalData || !trafficModalData.allTypesData) return;
    setTrafficModalData(prev => ({
      ...prev,
      type: newType,
      records: prev.allTypesData[newType] || []
    }));
  };

  const handleExportTrafficCsv = () => {
    if (!trafficModalData || !trafficModalData.records) return;
    const v = trafficModalData.vendor;
    const typeLabel = trafficModalData.type;
    const rows = [
      ['#', 'Date & Time', 'Respondent UID', 'Project ID', 'Status', 'IP Address', 'Country', 'Reason / Remarks']
    ];
    trafficModalData.records.forEach((r, i) => {
      rows.push([
        i + 1,
        `"${r.created_at || ''}"`,
        `"${r.uid || ''}"`,
        `"${r.project_id || ''}"`,
        `"${r.status || ''}"`,
        `"${r.ip_address || ''}"`,
        `"${r.country || ''}"`,
        `"${r.reason || ''}"`
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${v.vendor_code || v.vendor_id}_${typeLabel}_traffic_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchVendorsList = async () => {
    setLoading(true);
    try {
      const res = await getVendors();
      if (res?.totalVendors) {
        setTotalServerVendors(res.totalVendors);
      }
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
        setVendors(deduped);
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error('Failed to load vendors from API:', err);
      setVendors([]);
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
      setFormData({
        name: '',
        email: '',
        vendor_code: '',
        commission_type: 'revenue_share',
        cpi: '',
        cpi_percentage: '30',
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
      fetchVendorsList();
      if (showToast) {
        showToast(`✓ Vendor created successfully!`);
      }
    } catch (err) {
      if (showToast) {
        showToast(err.response?.data?.message || err.message || 'Error creating vendor', 'error');
      } else {
        alert(err.response?.data?.message || err.message || 'Error creating vendor');
      }
    }
  };

  const handleOpenRedirects = (vendor) => {
    setEditingVendor(vendor);
    setEditModalTab('general');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smr.vmhgroupsmr.com';
    const vidCode = vendor.vendor_code || vendor.vendor_id || vendor.vendorUid || 'VND';
    const isDummy = (url) => !url || url.includes('vnddyn01.com') || url.includes('supplier.com');
    setRedirectForm({
      commission_type: vendor.commission_type || 'revenue_share',
      cpi: vendor.cpi !== undefined && vendor.cpi !== null ? vendor.cpi : '',
      cpi_percentage: vendor.cpi_percentage !== undefined && vendor.cpi_percentage !== null ? vendor.cpi_percentage : 30,
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
    setEditModalTab('general');
    setVendorAuditLogs([]);
  };

  const loadAuditHistory = async (vid) => {
    if (!vid) return;
    setLoadingAudit(true);
    try {
      const res = await getVendorAuditLogs(vid);
      setVendorAuditLogs(res?.data || (Array.isArray(res) ? res : []));
    } catch {
      setVendorAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSaveRedirects = async (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    setSavingRedirects(true);
    try {
      const vendorId = editingVendor.vendor_code || editingVendor.vendor_id || editingVendor._id;
      const updatedFields = {
        name: editingVendor.name,
        email: editingVendor.email,
        commission_type: redirectForm.commission_type || 'revenue_share',
        cpi: Number(redirectForm.cpi || 0),
        cpi_percentage: Number(redirectForm.cpi_percentage !== undefined && redirectForm.cpi_percentage !== '' ? redirectForm.cpi_percentage : 30),
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
      setVendors(prev => prev.map(v => (v._id === vendorId || v.vendor_code === vendorId || v.vendor_id === vendorId) ? { ...v, ...updatedFields } : v));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingVendor(null);
        fetchVendorsList();
        if (showToast) {
          showToast('✓ Vendor settings and routing updated successfully!');
        }
      }, 1000);
    } catch (err) {
      if (showToast) {
        showToast(err.message || 'Error updating vendor redirects', 'error');
      } else {
        alert(err.message || 'Error updating vendor redirects');
      }
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
      (v.vendor_id && v.vendor_id.toLowerCase().includes(effectiveSearch)) ||
      (v.vendorUid && v.vendorUid.toLowerCase().includes(effectiveSearch)) ||
      (v.email && v.email.toLowerCase().includes(effectiveSearch))
    );
  });

  const avgCpiNum = vendors.reduce((sum, v) => sum + Number(v.cpi || 0), 0) / (vendors.length || 1);
  const avgCpi = avgCpiNum.toFixed(2);
  const avgRevShare = Math.round(vendors.reduce((sum, v) => sum + Number(v.cpi_percentage || 30), 0) / (vendors.length || 1));
  const activeCount = vendors.filter(v => v.status === 'active' || v.status === 'Y' || v.is_active === 'Y' || v.isActive !== false).length;

  const getQualityBadge = (v) => {
    const clicks = Number(v.clicks_count || 0);
    const completes = Number(v.complete_count || v.completes_count || 0);
    const cr = clicks > 0 ? (completes / clicks) * 100 : 0;
    const crStr = cr.toFixed(1);

    if (completes >= 100 || (clicks >= 50 && cr >= 12)) {
      return {
        grade: 'A+',
        label: 'Grade A+ (Elite)',
        sublabel: `${crStr}% CR • 98% Delivery`,
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        icon: '🏆',
        cr: crStr,
        reliability: 'Elite Delivery (98%)'
      };
    } else if (completes >= 20 || (clicks >= 20 && cr >= 5)) {
      return {
        grade: 'A',
        label: 'Grade A (High Perf)',
        sublabel: `${crStr}% CR • 92% Delivery`,
        bg: 'rgba(13, 148, 136, 0.12)',
        color: '#0d9488',
        border: '1px solid rgba(13, 148, 136, 0.3)',
        icon: '⭐',
        cr: crStr,
        reliability: 'High Delivery (92%)'
      };
    } else if (completes > 0 || (clicks >= 10 && cr >= 2)) {
      return {
        grade: 'B',
        label: 'Grade B (Reliable)',
        sublabel: `${crStr}% CR • 85% Delivery`,
        bg: 'rgba(37, 99, 235, 0.1)',
        color: '#2563eb',
        border: '1px solid rgba(37, 99, 235, 0.25)',
        icon: '🛡️',
        cr: crStr,
        reliability: 'Reliable (85%)'
      };
    } else if (clicks >= 15 && cr < 2) {
      return {
        grade: 'D',
        label: 'Grade D (Quality Alert)',
        sublabel: 'High Drop-off / Fraud Alert',
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        icon: '⚠️',
        cr: crStr,
        reliability: 'High Rejects (Watchlist)'
      };
    } else {
      return {
        grade: 'Standard',
        label: clicks > 0 ? 'Standard Supplier' : 'New Supplier',
        sublabel: clicks > 0 ? `${crStr}% CR` : 'Unrated Pacing',
        bg: 'rgba(100, 116, 139, 0.1)',
        color: '#475569',
        border: '1px solid rgba(100, 116, 139, 0.2)',
        icon: '⏳',
        cr: crStr,
        reliability: 'Standard Ramp-up'
      };
    }
  };

  const handleExportAllVendorsExcel = async () => {
    setExportingVendors(true);
    try {
      const res = await getAllVendors();
      const list = res?.data || (Array.isArray(res) ? res : vendors);
      const rows = list.map(v => {
        const clicks = Number(v.clicks_count || 0);
        const completes = Number(v.complete_count || v.completes_count || 0);
        const cr = clicks > 0 ? ((completes / clicks) * 100).toFixed(1) + '%' : '0.0%';
        return {
          'Vendor ID': v.vendor_code || v.vendor_id || v._id,
          'Vendor Name': v.name || '',
          'Contact Email': v.email || '',
          'Commission Type': v.commission_type || 'revenue_share',
          'RevShare (%)': Number(v.cpi_percentage || 30),
          'Flat CPI ($)': Number(v.cpi || 0).toFixed(2),
          'Hash Algorithm': v.hash_algorithm || 'SHA3-256',
          'Status': (v.status === 'Y' || v.status === 'active' || v.is_active === 'Y') ? 'Active' : 'Inactive',
          'Delivered Completes': completes,
          'Inbound Clicks': clicks,
          'Conversion Rate (CR)': cr,
          'Redirect Complete': v.redirect_complete || '',
          'Redirect Terminate': v.redirect_terminate || '',
          'Redirect Overquota': v.redirect_overquota || '',
          'Redirect Security': v.redirect_security || ''
        };
      });
      exportToExcel(rows, `VMH_All_Vendors_Master_Roster_${new Date().toISOString().slice(0, 10)}`, 'Master Vendor List');
    } catch (err) {
      alert('Error exporting vendors: ' + (err.message || 'Server error'));
    } finally {
      setExportingVendors(false);
    }
  };

  const sortedVendors = useMemo(() => {
    const list = [...filtered];
    if (!sortField) return list;
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'vendor_id') {
        aVal = (a.vendor_code || a.vendor_id || a._id || '').toString();
        bVal = (b.vendor_code || b.vendor_id || b._id || '').toString();
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (sortField === 'name' || sortField === 'email') {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (sortField === 'clicks_count' || sortField === 'complete_count' || sortField === 'terminates_count') {
        const aNum = Number(aVal || 0);
        const bNum = Number(bVal || 0);
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      if (sortField === 'status') {
        const aStat = (a.status === 'Y' || a.status === 'active' || a.is_active === 'Y') ? 1 : 0;
        const bStat = (b.status === 'Y' || b.status === 'active' || b.is_active === 'Y') ? 1 : 0;
        return sortDirection === 'asc' ? aStat - bStat : bStat - aStat;
      }
      return 0;
    });
    return list;
  }, [filtered, sortField, sortDirection]);

  const totalVendorPages = vendorPageSize === 'all' ? 1 : (Math.ceil(sortedVendors.length / vendorPageSize) || 1);
  const paginatedVendors = vendorPageSize === 'all' ? sortedVendors : sortedVendors.slice((vendorPage - 1) * vendorPageSize, vendorPage * vendorPageSize);


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
              {totalServerVendors || filtered.length} Connected Vendors
            </span>
          </div>
        </div>

        <div className="title-box-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            className="btn btn-soft-success"
            onClick={handleExportAllVendorsExcel}
            disabled={exportingVendors}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
            title="Download full master roster of all 910 vendors to Excel (.xlsx)"
          >
            <Download size={14} /> {exportingVendors ? 'Exporting...' : 'Export All 910 (Excel)'}
          </button>
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
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: "'Plus Jakarta Sans', sans-serif", fontVariantNumeric: 'tabular-nums' }}>{totalServerVendors || vendors.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#16a34a' }}>
            <span className="pulse-dot" /> {totalServerVendors || activeCount} Active Vendors
          </div>
        </div>

        <div className="card report-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8997bd' }}>Default Payout Model</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(3, 216, 127, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#03d87f' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: "'Plus Jakarta Sans', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
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
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d2c48', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SHA3-256 / HMAC</div>
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
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d2c48', fontFamily: "'Plus Jakarta Sans', sans-serif", fontVariantNumeric: 'tabular-nums' }}>4 / 4 Callbacks</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: '#1761fd' }}>
            <ArrowUpRight size={12} /> Complete, Term, OQ, Security
          </div>
        </div>
      </div>

      {/* VMH Panel Signature Vendor Table Card (Matching panel.vmhgroupsmr.com/admin/vendor) */}
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(42, 45, 140, 0.08)',
          border: '1px solid #e5e9f2',
          overflow: 'hidden',
          marginBottom: '30px'
        }}
      >
        {/* 1. Exact Signature Deep Navy Blue Header Banner (#2a2d8c) */}
        <div 
          style={{
            background: '#2a2d8c',
            padding: '14px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 
              style={{
                margin: 0,
                fontSize: '16.5px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.2px',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              Vendor List
            </h3>
            <span 
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px'
              }}
            >
              {totalServerVendors || filtered.length} Total
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Primary Exact Pill + ADD Button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              id="btn-add-vendor-banner"
              style={{
                background: '#ffffff',
                color: '#2a2d8c',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 18px',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                transition: 'transform 0.15s ease'
              }}
            >
              <span>+ ADD</span>
            </button>

            {/* Auxiliary Tools (Export & Spec) */}
            <button
              type="button"
              onClick={handleExportAllVendorsExcel}
              disabled={exportingVendors}
              style={{
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '20px',
                padding: '5px 14px',
                fontWeight: 600,
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Download master vendor list to Excel (.xlsx)"
            >
              <Download size={13} />
              <span>{exportingVendors ? 'Exporting...' : 'Export (.xlsx)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSpecModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '20px',
                padding: '5px 14px',
                fontWeight: 600,
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Vendor Integration Guide & Webhook Specs"
            >
              <FileText size={13} />
              <span>Integration Spec</span>
            </button>
          </div>
        </div>

        {/* 2. Exact Controls Row: Show [ 10 ▾ ] entries & Search: [ _____ ] */}
        <div 
          style={{
            padding: '14px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            borderBottom: '1px solid #eef1f6'
          }}
        >
          {/* Show [ 10 ▾ ] entries */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
            <span>Show</span>
            <select
              value={vendorPageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setVendorPageSize(val);
                setVendorPage(1);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                color: '#1f2937',
                background: '#ffffff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
            <span>entries</span>
          </div>

          {/* Search: [ _________ ] */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563' }}>
            <span style={{ fontWeight: 500 }}>Search:</span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVendorPage(1);
              }}
              placeholder=""
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                height: '32px',
                padding: '0 10px',
                fontSize: '13px',
                color: '#111827',
                outline: 'none',
                width: '180px'
              }}
            />
          </div>
        </div>

        {/* 3. Exact Table Header & Body */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            Synchronizing live suppliers...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', fontSize: '13.5px' }}>
            No vendors matching your filter. Click "+ ADD" to configure a new sample supplier.
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#e9ebf8', borderBottom: '1px solid #d6d9ef' }}>
                  <th style={{ padding: '12px 16px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', width: '65px' }}>
                    Sl No.
                  </th>
                  <th 
                    onClick={() => handleSort('vendor_id')} 
                    style={{ padding: '12px 14px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Vendor ID <span style={{ color: '#8c92ca', fontSize: '11px', marginLeft: '2px' }}>⇅</span>
                  </th>
                  <th 
                    onClick={() => handleSort('name')} 
                    style={{ padding: '12px 14px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Name <span style={{ color: '#8c92ca', fontSize: '11px', marginLeft: '2px' }}>⇅</span>
                  </th>
                  <th 
                    onClick={() => handleSort('email')} 
                    style={{ padding: '12px 14px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Email <span style={{ color: '#8c92ca', fontSize: '11px', marginLeft: '2px' }}>⇅</span>
                  </th>
                  <th 
                    onClick={() => handleSort('clicks_count')} 
                    style={{ padding: '12px 14px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Clicks <span style={{ color: '#8c92ca', fontSize: '11px', marginLeft: '2px' }}>⇅</span>
                  </th>
                  <th 
                    onClick={() => handleSort('complete_count')} 
                    style={{ padding: '12px 14px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Complete <span style={{ color: '#8c92ca', fontSize: '11px', marginLeft: '2px' }}>⇅</span>
                  </th>
                  <th 
                    onClick={() => handleSort('terminates_count')} 
                    style={{ padding: '12px 14px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Terminates <span style={{ color: '#8c92ca', fontSize: '11px', marginLeft: '2px' }}>⇅</span>
                  </th>
                  <th 
                    onClick={() => handleSort('status')} 
                    style={{ padding: '12px 14px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', textAlign: 'center', cursor: 'pointer', userSelect: 'none', width: '85px' }}
                  >
                    Status <span style={{ color: '#8c92ca', fontSize: '11px', marginLeft: '2px' }}>⇅</span>
                  </th>
                  <th style={{ padding: '12px 16px', color: '#2a2d8c', fontWeight: 700, fontSize: '12.5px', textAlign: 'center', width: '110px' }}>
                    Action <span style={{ color: '#8c92ca', fontSize: '11px', marginLeft: '2px' }}>⇅</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedVendors.map((v, idx) => {
                  const slNo = (vendorPage - 1) * (vendorPageSize === 'all' ? 1 : vendorPageSize) + idx + 1;
                  const vendorId = v.vendor_code || v.vendor_id || v._id;
                  const isActive = v.status === 'active' || v.status === 'Y' || v.is_active === 'Y';
                  const isExpanded = expandedVendorId === vendorId;
                  const clicks = Number(v.clicks_count || v.inbound_clicks || 0);
                  const completes = Number(v.complete_count || v.completes_count || 0);
                  const terminates = Number(v.terminates_count || (clicks > completes ? clicks - completes : 0));
                  const sampleUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://api.vmhgroupsmr.com'}/vendor/auth/${vendorId}/project/:project_id?rid=[RESPONDENT_ID]`;
                  const isRevShare = v.commission_type === 'revenue_share' || (!Number(v.cpi) && v.cpi_percentage);
                  const quality = getQualityBadge(v);

                  return (
                    <React.Fragment key={vendorId || idx}>
                      <tr 
                        style={{
                          background: isExpanded ? '#f9fafc' : '#ffffff',
                          borderBottom: '1px solid #eef1f6',
                          transition: 'background 0.12s ease'
                        }}
                      >
                        {/* Sl No. */}
                        <td style={{ padding: '13px 16px', color: '#4b5563', fontVariantNumeric: 'tabular-nums' }}>
                          {slNo}
                        </td>

                        {/* Vendor ID (Bold text as in panel screenshot) */}
                        <td style={{ padding: '13px 14px', fontWeight: 700, color: '#111827', fontFamily: "'Plus Jakarta Sans', monospace" }}>
                          {vendorId}
                        </td>

                        {/* Name */}
                        <td style={{ padding: '13px 14px', color: '#374151', fontWeight: 500 }}>
                          {v.name}
                        </td>

                        {/* Email */}
                        <td style={{ padding: '13px 14px', color: '#4b5563' }}>
                          {v.email || '—'}
                        </td>

                        {/* Clicks (Clickable Drilldown) */}
                        <td style={{ padding: '13px 14px', fontVariantNumeric: 'tabular-nums' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenTrafficDrilldown(v, 'clicks')}
                            style={{
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              borderRadius: '6px',
                              padding: '2px 9px',
                              fontWeight: 700,
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(29, 78, 216, 0.05)',
                              transition: 'all 0.15s ease'
                            }}
                            title={`Click to view all ${clicks} inbound click records for ${v.name}`}
                          >
                            <span>{clicks}</span>
                          </button>
                        </td>

                        {/* Complete (Clickable Drilldown) */}
                        <td style={{ padding: '13px 14px', fontVariantNumeric: 'tabular-nums' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenTrafficDrilldown(v, 'completes')}
                            style={{
                              background: completes > 0 ? '#ECFDF5' : '#F8FAFC',
                              color: completes > 0 ? '#15803D' : '#64748B',
                              border: `1px solid ${completes > 0 ? '#A7F3D0' : '#E2E8F0'}`,
                              borderRadius: '6px',
                              padding: '2px 9px',
                              fontWeight: 700,
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(21, 128, 61, 0.05)',
                              transition: 'all 0.15s ease'
                            }}
                            title={`Click to view ${completes} completed records for ${v.name}`}
                          >
                            <span>{completes}</span>
                          </button>
                        </td>

                        {/* Terminates (Clickable Drilldown) */}
                        <td style={{ padding: '13px 14px', fontVariantNumeric: 'tabular-nums' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenTrafficDrilldown(v, 'terminates')}
                            style={{
                              background: terminates > 0 ? '#FEF2F2' : '#F8FAFC',
                              color: terminates > 0 ? '#B91C1C' : '#64748B',
                              border: `1px solid ${terminates > 0 ? '#FECACA' : '#E2E8F0'}`,
                              borderRadius: '6px',
                              padding: '2px 9px',
                              fontWeight: 700,
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(185, 28, 28, 0.05)',
                              transition: 'all 0.15s ease'
                            }}
                            title={`Click to view all ${terminates} termination records for ${v.name}`}
                          >
                            <span>{terminates}</span>
                          </button>
                        </td>

                        {/* Status (Exact Green Check Circle Icon as in screenshot) */}
                        <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                          {isActive ? (
                            <span 
                              title="Active Supplier"
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#16a34a',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                boxShadow: '0 1px 3px rgba(22, 163, 74, 0.3)'
                              }}
                            >
                              <Check size={11} strokeWidth={3.5} />
                            </span>
                          ) : (
                            <span 
                              title="Inactive Supplier"
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#dc2626',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff'
                              }}
                            >
                              <X size={11} strokeWidth={3.5} />
                            </span>
                          )}
                        </td>

                        {/* Action: Exact Deep Navy Square Buttons (#2a2d8c) */}
                        <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {/* 1. Edit Button (#2a2d8c square) */}
                            <button
                              type="button"
                              onClick={() => handleOpenRedirects(v)}
                              title="Edit Vendor & Redirects"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                background: '#2a2d8c',
                                border: 'none',
                                color: '#ffffff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'opacity 0.15s ease'
                              }}
                            >
                              <Edit2 size={13} color="#ffffff" />
                            </button>

                            {/* 2. View / Details Drawer Toggle (#2a2d8c square) */}
                            <button
                              type="button"
                              onClick={() => toggleExpandVendor(vendorId)}
                              title={isExpanded ? "Hide Details Drawer" : "View Vendor Details, Router Links & Callbacks"}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                background: isExpanded ? '#1b1d66' : '#2a2d8c',
                                border: 'none',
                                color: '#ffffff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'opacity 0.15s ease'
                              }}
                            >
                              <Eye size={13} color="#ffffff" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Specifications Drawer (Preserves all deep SMR routing capabilities) */}
                      {isExpanded && (
                        <tr style={{ background: '#f8f9fd', borderBottom: '1px solid #d8daf0' }}>
                          <td colSpan="9" style={{ padding: '18px 24px' }}>
                            <div 
                              style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '18px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                              }}
                            >
                              {/* Drawer Header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#2a2d8c' }}>
                                    {v.name} ({vendorId})
                                  </span>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background: quality.bg,
                                    color: quality.color,
                                    border: quality.border
                                  }}>
                                    {quality.label} • {quality.cr}% CR
                                  </span>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background: isRevShare ? '#eff6ff' : '#ecfdf5',
                                    color: isRevShare ? '#1d4ed8' : '#059669',
                                    border: `1px solid ${isRevShare ? '#dbeafe' : '#a7f3d0'}`
                                  }}>
                                    {isRevShare ? `${Number(v.cpi_percentage || 30)}% RevShare` : `$${Number(v.cpi || 0).toFixed(2)} Fixed CPI`}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  

                                  <button
                                    type="button"
                                    onClick={() => handleOpenReconciliation(v)}
                                    title="View Statement & Reconciliation Ledger"
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '6px',
                                      background: '#eff6ff',
                                      color: '#1d4ed8',
                                      border: '1px solid #bfdbfe',
                                      cursor: 'pointer',
                                      fontSize: '11.5px',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    <FileText size={13} /> Statement
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenBilling(v)}
                                    title="Banking, GST & Compliance Details"
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '6px',
                                      background: '#f1f5f9',
                                      color: '#334155',
                                      border: '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                      fontSize: '11.5px',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    <Landmark size={13} /> Bank Compliance
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(vendorId)}
                                    title="Remove this supplier"
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      background: '#fef2f2',
                                      color: '#b91c1c',
                                      border: '1px solid #fecaca',
                                      cursor: 'pointer',
                                      fontSize: '11.5px',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Trash2 size={13} /> Remove
                                  </button>
                                </div>
                              </div>

                              {/* Drawer Content Columns */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                {/* Inbound Router Entry URL */}
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Inbound Router Entry URL
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      readOnly
                                      value={sampleUrl}
                                      style={{
                                        width: '100%',
                                        fontSize: '11px',
                                        fontFamily: 'monospace',
                                        padding: '6px 10px',
                                        background: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        color: '#334155'
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(sampleUrl, vendorId)}
                                      style={{
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        background: copiedId === vendorId ? '#ecfdf5' : '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        color: copiedId === vendorId ? '#059669' : '#334155',
                                        fontSize: '11.5px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {copiedId === vendorId ? <Check size={12} /> : <Copy size={12} />}
                                      {copiedId === vendorId ? 'Copied' : 'Copy'}
                                    </button>
                                  </div>
                                </div>

                                {/* Security Hash Protocol */}
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Anti-Tamper Cryptography
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#1e293b', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                    <span>Protocol: <strong>{v.hash_algorithm || 'SHA3-256 (Market Xcel / SMR Enterprise)'}</strong></span>
                                  </div>
                                </div>

                                {/* Callbacks Quick Access */}
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Supplier Callback Routing
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRedirects(v)}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      background: '#2a2d8c',
                                      color: '#ffffff',
                                      border: 'none',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <Settings size={13} /> Configure 4 Return Callbacks
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Exact Pagination Footer */}
        <div 
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #eef1f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Showing <strong>{filtered.length === 0 ? 0 : (vendorPage - 1) * (vendorPageSize === 'all' ? filtered.length : vendorPageSize) + 1}</strong> to <strong>{vendorPageSize === 'all' ? filtered.length : Math.min(vendorPage * vendorPageSize, filtered.length)}</strong> of <strong>{totalServerVendors || filtered.length}</strong> entries
          </span>

          {vendorPageSize !== 'all' && totalVendorPages > 1 && (
            <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
              <button
                type="button"
                disabled={vendorPage <= 1}
                onClick={() => setVendorPage(p => Math.max(1, p - 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: vendorPage <= 1 ? '#9ca3af' : '#2a2d8c',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: vendorPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalVendorPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalVendorPages > 5) {
                  if (vendorPage > 3) {
                    pageNum = vendorPage - 2 + i;
                    if (pageNum > totalVendorPages) pageNum = totalVendorPages - (4 - i);
                  }
                }
                const isCurrent = pageNum === vendorPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setVendorPage(pageNum)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '4px',
                      border: isCurrent ? '1px solid #2a2d8c' : '1px solid #d1d5db',
                      background: isCurrent ? '#2a2d8c' : '#ffffff',
                      color: isCurrent ? '#ffffff' : '#374151',
                      fontSize: '12.5px',
                      fontWeight: isCurrent ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={vendorPage >= totalVendorPages}
                onClick={() => setVendorPage(p => Math.min(totalVendorPages, p + 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: vendorPage >= totalVendorPages ? '#9ca3af' : '#2a2d8c',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: vendorPage >= totalVendorPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
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
                  <X size={14} />
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
                <button
                  type="button"
                  onClick={() => {
                    setEditModalTab('audit');
                    loadAuditHistory(editingVendor.vendor_code || editingVendor.vendor_id || editingVendor._id);
                  }}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: editModalTab === 'audit' ? '2px solid #1761fd' : '2px solid transparent',
                    color: editModalTab === 'audit' ? '#1761fd' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Activity size={14} /> 4. RevShare Audit Log
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
                            type="text"
                            inputMode="decimal"
                            className="input-field"
                            style={{ width: '100%', fontSize: '12px', paddingRight: '28px' }}
                            value={redirectForm.cpi_percentage !== undefined && redirectForm.cpi_percentage !== null ? redirectForm.cpi_percentage : ''}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9.]/g, '');
                              setRedirectForm({ ...redirectForm, cpi_percentage: val });
                            }}
                            placeholder="e.g. 30"
                          />
                          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>%</span>
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {redirectForm.cpi_percentage !== '' 
                            ? `Vendor receives ${redirectForm.cpi_percentage}% of survey CPI on each complete`
                            : 'Enter custom revenue share percentage'}
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '130px', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="input-field"
                            style={{ width: '100%', fontSize: '12px', paddingLeft: '24px' }}
                            value={redirectForm.cpi !== undefined && redirectForm.cpi !== null ? redirectForm.cpi : ''}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9.]/g, '');
                              setRedirectForm({ ...redirectForm, cpi: val });
                            }}
                            placeholder="1.50"
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

                {editModalTab === 'audit' && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                          MySQL Audit Trail & RevShare Change History
                        </h4>
                        <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Verified database log of all CPI and RevShare % modifications made by administrators.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => loadAuditHistory(editingVendor.vendor_code || editingVendor.vendor_id || editingVendor._id)}
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        <RefreshCw size={12} className={loadingAudit ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    {loadingAudit ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                        <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block', color: '#1761FD' }} />
                        Loading audit logs from MySQL log_table...
                      </div>
                    ) : vendorAuditLogs.length === 0 ? (
                      <div style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '30px 20px',
                        textAlign: 'center',
                        color: '#64748B'
                      }}>
                        <ShieldCheck size={28} style={{ color: '#10B981', margin: '0 auto 8px', display: 'block' }} />
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>Current RevShare Rate: {redirectForm.cpi_percentage || 30}%</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          No historical RevShare modifications recorded for this supplier. All future adjustments are permanently timestamped and logged to MySQL.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {vendorAuditLogs.map((log, lIdx) => {
                          let parsed = {};
                          try {
                            parsed = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details || {});
                          } catch {}

                          return (
                            <div key={log.id || lIdx} style={{
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>{log.action || 'RevShare Update'}</span>
                                  <span className="badge-soft-success" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px' }}>
                                    MySQL Verified
                                  </span>
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                                  {parsed.old_rev_share !== undefined && (
                                    <span>Changed from <strong>{parsed.old_rev_share}%</strong> ➔ <strong>{parsed.new_rev_share}%</strong> &bull; </span>
                                  )}
                                  <span>User: <strong>{log.user || 'Admin'}</strong></span>
                                </div>
                              </div>
                              <div style={{ fontSize: '11px', color: '#8997BD', fontFamily: 'monospace' }}>
                                {log.created_at || log.timestamp || 'Recorded'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                  <X size={14} />
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
                              type="text" 
                              inputMode="decimal"
                              className="input-field" 
                              style={{ width: '100%', paddingRight: '28px' }}
                              placeholder="e.g. 30"
                              value={formData.cpi_percentage !== undefined && formData.cpi_percentage !== null ? formData.cpi_percentage : ''}
                              onChange={e => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setFormData({ ...formData, cpi_percentage: val });
                              }}
                            />
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>%</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                            {formData.cpi_percentage !== '' 
                              ? `e.g. ${formData.cpi_percentage}% of $2.50 CPI = $${((2.50 * Number(formData.cpi_percentage || 0)) / 100).toFixed(2)} vendor payout` 
                              : 'Enter custom revenue share percentage'}
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
                              type="text" 
                              inputMode="decimal"
                              className="input-field" 
                              style={{ width: '100%', paddingLeft: '24px' }}
                              placeholder="1.50"
                              value={formData.cpi !== undefined && formData.cpi !== null ? formData.cpi : ''}
                              onChange={e => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setFormData({ ...formData, cpi: val });
                              }}
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
                  const directCallbackUrl = `${origin}/survey/terminate?status=20&uid=${testUidParam}&pid=${activePid}&vid=${vCode}&test=1`;

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

      {/* Modal: Vendor Financial & Banking Compliance */}
      {showBillingModal && billingVendor && (
        <ModalPortal isOpen={showBillingModal} onClose={() => setShowBillingModal(false)}>
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#dcfce7', padding: '6px', borderRadius: '6px', color: '#15803d' }}>
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Vendor Financial & Tax Compliance
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Bank account, PAN, GSTIN, and payout details for {billingVendor.name} ({billingVendor.vendor_id || billingVendor.vendor_code})
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBillingModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveBilling} style={{ padding: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
                {loadingBilling ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    Loading financial details...
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Legal Entity Name</label>
                        <input
                          type="text"
                          value={billingForm.legal_name}
                          onChange={(e) => setBillingForm({ ...billingForm, legal_name: e.target.value })}
                          placeholder="e.g. Dynata Global LLC"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Business Type</label>
                        <select
                          value={billingForm.business_type}
                          onChange={(e) => setBillingForm({ ...billingForm, business_type: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="Private Limited">Private Limited</option>
                          <option value="LLP / Partnership">LLP / Partnership</option>
                          <option value="Proprietorship">Proprietorship</option>
                          <option value="Individual / Freelancer">Individual / Freelancer</option>
                          <option value="Foreign Entity">Foreign Entity</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>PAN / Tax ID</label>
                        <input
                          type="text"
                          value={billingForm.pan}
                          onChange={(e) => setBillingForm({ ...billingForm, pan: e.target.value.toUpperCase() })}
                          placeholder="e.g. ABCDE1234F"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>GSTIN Number</label>
                        <input
                          type="text"
                          value={billingForm.gst}
                          onChange={(e) => setBillingForm({ ...billingForm, gst: e.target.value.toUpperCase() })}
                          placeholder="e.g. 07AAAAA0000A1Z5"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Bank Name</label>
                        <input
                          type="text"
                          value={billingForm.bank}
                          onChange={(e) => setBillingForm({ ...billingForm, bank: e.target.value })}
                          placeholder="e.g. HDFC Bank / Chase"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Account Holder Name</label>
                        <input
                          type="text"
                          value={billingForm.holder}
                          onChange={(e) => setBillingForm({ ...billingForm, holder: e.target.value })}
                          placeholder="e.g. Dynata Operations Inc"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Account Number</label>
                        <input
                          type="text"
                          value={billingForm.acc}
                          onChange={(e) => setBillingForm({ ...billingForm, acc: e.target.value })}
                          placeholder="e.g. 50200012345678"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>IFSC / SWIFT Code</label>
                        <input
                          type="text"
                          value={billingForm.ifsc}
                          onChange={(e) => setBillingForm({ ...billingForm, ifsc: e.target.value.toUpperCase() })}
                          placeholder="e.g. HDFC0001234 / CHASUS33"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>UPI ID (Optional)</label>
                        <input
                          type="text"
                          value={billingForm.upi}
                          onChange={(e) => setBillingForm({ ...billingForm, upi: e.target.value })}
                          placeholder="e.g. vendor@okaxis"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Payout Currency</label>
                        <select
                          value={billingForm.currency}
                          onChange={(e) => setBillingForm({ ...billingForm, currency: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Payment Terms</label>
                        <select
                          value={billingForm.terms}
                          onChange={(e) => setBillingForm({ ...billingForm, terms: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                        >
                          <option value="Immediate">Immediate / Advance</option>
                          <option value="Net 15">Net 15 Days</option>
                          <option value="Net 30">Net 30 Days</option>
                          <option value="Net 45">Net 45 Days</option>
                          <option value="Net 60">Net 60 Days</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
                      <button
                        type="button"
                        onClick={() => setShowBillingModal(false)}
                        className="btn btn-light"
                        style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingBilling}
                        className="btn btn-success"
                        style={{ fontSize: '12px', padding: '8px 20px', borderRadius: '6px', fontWeight: 600, background: '#16a34a', borderColor: '#16a34a' }}
                      >
                        {savingBilling ? 'Saving...' : 'Save Financial Details'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Vendor Traffic Drilldown Modal (Terminates, Completes, Clicks) */}
      {trafficModalData && (
        <ModalPortal isOpen={!!trafficModalData} onClose={() => setTrafficModalData(null)}>
          <div className="modal-overlay" onClick={() => setTrafficModalData(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '920px', width: '95%', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '14px', padding: '24px' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                        {trafficModalData.vendor?.name || 'Vendor Traffic'}
                      </h3>
                      <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                        {trafficModalData.vendor?.vendor_code || trafficModalData.vendor?.vendor_id}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                      Detailed respondent-level logs and traffic stream records
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setTrafficModalData(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Switcher Tabs & Search Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                {/* Metric Selector Tabs */}
                <div style={{ display: 'flex', gap: '6px', background: '#F8FAFC', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('terminates')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'terminates' ? '#FEF2F2' : 'transparent',
                      color: trafficModalData.type === 'terminates' ? '#B91C1C' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'terminates' ? '0 1px 2px rgba(185, 28, 28, 0.1)' : 'none'
                    }}
                  >
                    <span>Terminates</span>
                    <span style={{ background: trafficModalData.type === 'terminates' ? '#FEE2E2' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.terminates?.length || Number(trafficModalData.vendor?.terminates_count || 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('completes')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'completes' ? '#ECFDF5' : 'transparent',
                      color: trafficModalData.type === 'completes' ? '#15803D' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'completes' ? '0 1px 2px rgba(21, 128, 61, 0.1)' : 'none'
                    }}
                  >
                    <span>Completes</span>
                    <span style={{ background: trafficModalData.type === 'completes' ? '#D1FAE5' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.completes?.length || Number(trafficModalData.vendor?.complete_count || 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTrafficType('clicks')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: trafficModalData.type === 'clicks' ? '#EFF6FF' : 'transparent',
                      color: trafficModalData.type === 'clicks' ? '#1D4ED8' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: trafficModalData.type === 'clicks' ? '0 1px 2px rgba(29, 78, 216, 0.1)' : 'none'
                    }}
                  >
                    <span>All Clicks</span>
                    <span style={{ background: trafficModalData.type === 'clicks' ? '#DBEAFE' : '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>
                      {trafficModalData.allTypesData?.clicks?.length || Number(trafficModalData.vendor?.clicks_count || 0)}
                    </span>
                  </button>
                </div>

                {/* Search & Export Buttons */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Filter by UID, Project ID, or IP..."
                      value={trafficModalSearch}
                      onChange={e => setTrafficModalSearch(e.target.value)}
                      style={{ paddingLeft: '32px', fontSize: '12px', height: '32px', width: '220px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleExportTrafficCsv}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700, width: '45px' }}>#</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Date & Time</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Respondent UID</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Study / Project ID</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>IP Address</th>
                        <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Reason / Disposition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trafficModalData.loading ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#0F172A' }} />
                            Loading traffic records...
                          </td>
                        </tr>
                      ) : (() => {
                        const filtered = (trafficModalData.records || []).filter(r => {
                          if (!trafficModalSearch) return true;
                          const q = trafficModalSearch.toLowerCase();
                          return (
                            (r.uid || '').toLowerCase().includes(q) ||
                            (r.project_id || '').toLowerCase().includes(q) ||
                            (r.ip_address || '').toLowerCase().includes(q) ||
                            (r.reason || '').toLowerCase().includes(q) ||
                            (r.created_at || '').toLowerCase().includes(q)
                          );
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                                No records found matching current filter.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((r, idx) => {
                          const isTerm = (r.status || '').toLowerCase().includes('term') || (r.status || '').toLowerCase().includes('screen');
                          const isComp = (r.status || '').toLowerCase().includes('comp');
                          return (
                            <tr 
                              key={r.id || idx} 
                              style={{ 
                                borderBottom: '1px solid #F1F5F9',
                                background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                              }}
                            >
                              <td style={{ padding: '9px 12px', color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#334155', whiteSpace: 'nowrap', fontSize: '11.5px' }}>
                                {r.created_at || '—'}
                              </td>
                              <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0F172A', fontFamily: 'monospace', fontSize: '11.5px' }}>
                                {r.uid}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#1E293B', fontWeight: 600 }}>
                                {r.project_id}
                              </td>
                              <td style={{ padding: '9px 12px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: isTerm ? '#FEF2F2' : (isComp ? '#ECFDF5' : '#EFF6FF'),
                                  color: isTerm ? '#B91C1C' : (isComp ? '#15803D' : '#1D4ED8'),
                                  border: `1px solid ${isTerm ? '#FECACA' : (isComp ? '#A7F3D0' : '#BFDBFE')}`
                                }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#475569', fontSize: '11.5px' }}>
                                {r.ip_address || '—'}
                              </td>
                              <td style={{ padding: '9px 12px', color: '#475569', fontSize: '11.5px' }}>
                                {r.reason || '—'}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Showing <strong>{trafficModalData.records?.length || 0}</strong> {trafficModalData.type} records for {trafficModalData.vendor?.name}
                </span>
                <button
                  type="button"
                  onClick={() => setTrafficModalData(null)}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
