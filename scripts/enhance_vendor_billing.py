with open('client/src/pages/VendorsPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
if 'getVendorBilling' not in code:
    code = code.replace(
        "import { getVendors, createVendor, updateVendor, deleteVendor, getClients } from '../services/api';",
        "import { getVendors, createVendor, updateVendor, deleteVendor, getClients, getVendorBilling, saveVendorBilling } from '../services/api';"
    )

if 'Landmark,' not in code:
    code = code.replace(
        "  BarChart3,\n",
        "  BarChart3,\n  Landmark,\n  CreditCard,\n"
    )

# 2. Add state & handlers
billing_state = """  const [showBillingModal, setShowBillingModal] = useState(false);
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
"""

if 'handleOpenBilling' not in code:
    code = code.replace(
        "  const [vendorPage, setVendorPage] = useState(1);",
        billing_state + "\n  const [vendorPage, setVendorPage] = useState(1);"
    )

# 3. Add Bank action button in vendor table row
bank_btn = """                          <button
                            className="btn btn-soft-success btn-sm"
                            onClick={() => handleOpenBilling(v)}
                            title="Vendor Banking, GST/PAN & Financial Compliance (supplier_billing_details)"
                            style={{ padding: '4px 7px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', border: 'none' }}
                          >
                            <Landmark size={13} />
                          </button>"""

if 'handleOpenBilling(v)' not in code:
    code = code.replace(
        """                          <button
                            className="btn btn-soft-primary btn-sm"
                            onClick={() => handleOpenRedirects(v)}""",
        bank_btn + """\n                          <button
                            className="btn btn-soft-primary btn-sm"
                            onClick={() => handleOpenRedirects(v)}"""
    )

# 4. Add Billing Modal
billing_modal = """
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
"""

if 'Modal: Vendor Financial & Banking Compliance' not in code:
    code = code.replace(
        "    </div>\n  );\n}",
        billing_modal + "\n    </div>\n  );\n}"
    )

with open('client/src/pages/VendorsPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("VendorsPage successfully updated with Financial Compliance & Banking Modal!")
