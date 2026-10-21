with open('client/src/pages/BidsPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
if 'sendBidBookingNotification' not in code:
    code = code.replace(
        "import { getBids, createBid, updateBidStatus, deleteBid, getClients, convertBidToProject, getBidOptions, addBidOption, deleteBidOption } from '../services/api';",
        "import { getBids, createBid, updateBidStatus, deleteBid, getClients, convertBidToProject, getBidOptions, addBidOption, deleteBidOption, sendBidBookingNotification, getTeamMembers } from '../services/api';"
    )

if 'UserCheck,' not in code:
    code = code.replace(
        "  ListPlus\n} from 'lucide-react';",
        "  ListPlus,\n  UserCheck,\n  MailCheck,\n  Cpu\n} from 'lucide-react';"
    )

# 2. Add Booking PM modal state & handlers
booking_state = """  const [teamMembers, setTeamMembers] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingBid, setBookingBid] = useState(null);
  const [bookingPm, setBookingPm] = useState(1);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [converting, setConverting] = useState(false);

  // Structured Tier Form State
  const [tierForm, setTierForm] = useState({
    name: '',
    n: 500,
    loi: 15,
    ir: 80,
    device: 'All Devices',
    client_cpi: 2.50,
    vendor_cpi: 1.75,
    threat_check: true
  });
"""

if 'showBookingModal' not in code:
    code = code.replace(
        "  const [showOptionsModal, setShowOptionsModal] = useState(false);",
        booking_state + "\n  const [showOptionsModal, setShowOptionsModal] = useState(false);"
    )

# Load team members in loadData
if 'getTeamMembers()' not in code:
    code = code.replace(
        "const [bidsRes, clientsRes] = await Promise.all([",
        "const [bidsRes, clientsRes, teamRes] = await Promise.all([\n        getBids(),\n        getClients(),\n        getTeamMembers()\n      ]);\n      if (teamRes && teamRes.success) setTeamMembers(teamRes.data || []);"
    )
    code = code.replace(
        "getBids(),\n        getClients()\n      ]);",
        ""
    )

# 3. Update handleConvertToProject to open modal
old_convert = """  const handleConvertToProject = async (b) => {
    if (!window.confirm(`Convert Bid "${b.bid_name || b.name}" into a live Project / Study?`)) return;
    try {
      const res = await convertBidToProject(b.id);
      if (res && res.success) {
        alert(res.message || 'Bid successfully converted into live Study / Project!');
        await loadData();
      } else {
        alert(res?.message || 'Failed to convert bid');
      }
    } catch (err) {
      console.error('Error converting bid to project:', err);
      alert('Error converting bid to project');
    }
  };"""

new_convert = """  const handleConvertToProject = (b) => {
    setBookingBid(b);
    setBookingPm(teamMembers[0]?.id || 1);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingBid) return;
    try {
      setConverting(true);
      const res = await convertBidToProject(bookingBid.id);
      if (res && res.success) {
        if (sendEmailNotification) {
          try {
            await sendBidBookingNotification({
              bid_id: bookingBid.id,
              pm_user: Number(bookingPm)
            });
          } catch (me) {}
        }
        alert(res.message || 'Bid successfully booked and converted into a live Study!');
        setShowBookingModal(false);
        await loadData();
      } else {
        alert(res?.message || 'Failed to convert bid');
      }
    } catch (err) {
      alert('Error booking project: ' + (err.message || 'Server error'));
    } finally {
      setConverting(false);
    }
  };"""

if 'handleConfirmBooking' not in code:
    code = code.replace(old_convert, new_convert)

# 4. Update handleAddOption to use structured tier form
old_add_option = """  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newOptionName.trim()) return;
    try {
      setAddingOption(true);
      const res = await addBidOption({
        bid_id: selectedBidForOptions.id,
        option_name: newOptionName.trim(),
        value: newOptionValue.trim()
      });
      if (res && res.success) {
        setNewOptionName('');
        setNewOptionValue('');
        const refreshed = await getBidOptions(selectedBidForOptions.id);
        if (refreshed && refreshed.success) {
          setBidOptions(refreshed.data || []);
        }
      }
    } catch (err) {
      alert('Failed to add option');
    } finally {
      setAddingOption(false);
    }
  };"""

new_add_option = """  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!tierForm.name.trim()) return;
    try {
      setAddingOption(true);
      const specString = `N=${tierForm.n} • LOI=${tierForm.loi}m • IR=${tierForm.ir}% • ${tierForm.device} • Client $${tierForm.client_cpi} / Vendor $${tierForm.vendor_cpi}${tierForm.threat_check ? ' • RelevantID Active' : ''}`;
      const res = await addBidOption({
        bid_id: selectedBidForOptions.id,
        option_name: tierForm.name.trim(),
        value: specString
      });
      if (res && res.success) {
        setTierForm({
          name: '',
          n: 500,
          loi: 15,
          ir: 80,
          device: 'All Devices',
          client_cpi: 2.50,
          vendor_cpi: 1.75,
          threat_check: true
        });
        const refreshed = await getBidOptions(selectedBidForOptions.id);
        if (refreshed && refreshed.success) {
          setBidOptions(refreshed.data || []);
        }
      }
    } catch (err) {
      alert('Failed to add option');
    } finally {
      setAddingOption(false);
    }
  };"""

if 'new_add_option' not in code and 'specString' not in code:
    code = code.replace(old_add_option, new_add_option)

# 5. Add Booking Modal Portal & upgrade Tier Form UI in showOptionsModal
old_tier_form = """                <form onSubmit={handleAddOption} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    required
                    placeholder="Tier Name (e.g. Option B - N=1000 @ $2.00)"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    style={{
                      flex: 2,
                      minWidth: '180px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Details / Specifications"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    style={{
                      flex: 2,
                      minWidth: '140px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={addingOption}
                    className="btn btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '6px' }}
                  >
                    {addingOption ? '...' : '+ Add Tier'}
                  </button>
                </form>"""

new_tier_form = """                <form onSubmit={handleAddOption} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14} color="#6366f1" /> Create Quota & Pricing Tier Option
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      required
                      placeholder="Tier Name (e.g. Tier 1 - General Population US)"
                      value={tierForm.name}
                      onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                    <input
                      type="number"
                      placeholder="Sample N"
                      value={tierForm.n}
                      onChange={(e) => setTierForm({ ...tierForm, n: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Sample Target N"
                    />
                    <select
                      value={tierForm.device}
                      onChange={(e) => setTierForm({ ...tierForm, device: e.target.value })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                    >
                      <option value="All Devices">All Devices</option>
                      <option value="Desktop Only">Desktop Only</option>
                      <option value="Mobile Only">Mobile Only</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="LOI (mins)"
                      value={tierForm.loi}
                      onChange={(e) => setTierForm({ ...tierForm, loi: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Length of Interview (mins)"
                    />
                    <input
                      type="number"
                      placeholder="IR (%)"
                      value={tierForm.ir}
                      onChange={(e) => setTierForm({ ...tierForm, ir: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Incidence Rate (%)"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Client CPI ($)"
                      value={tierForm.client_cpi}
                      onChange={(e) => setTierForm({ ...tierForm, client_cpi: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Client Price ($)"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Vendor CPI ($)"
                      value={tierForm.vendor_cpi}
                      onChange={(e) => setTierForm({ ...tierForm, vendor_cpi: Number(e.target.value) })}
                      style={{ padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      title="Vendor Cost ($)"
                    />
                    <button
                      type="submit"
                      disabled={addingOption}
                      className="btn btn-primary"
                      style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', whiteSpace: 'nowrap' }}
                    >
                      {addingOption ? '...' : '+ Save Tier'}
                    </button>
                  </div>
                </form>"""

if 'Create Quota & Pricing Tier Option' not in code and old_tier_form in code:
    code = code.replace(old_tier_form, new_tier_form)

# 6. Add PM Booking Modal before end of return
booking_modal = """
      {/* Modal: Won Bid Project Booking & PM Assignment */}
      {showBookingModal && bookingBid && (
        <ModalPortal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)}>
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
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden'
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
                  <div style={{ background: '#dbeafe', padding: '6px', borderRadius: '6px', color: '#1d4ed8' }}>
                    <Rocket size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Convert Won Bid to Study
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Assign Project Manager & trigger booking notification
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} style={{ padding: '20px' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>
                    {bookingBid.bid_name || bookingBid.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#3b82f6', marginTop: '3px' }}>
                    Client: {bookingBid.client_name || 'Direct Client'} • CPI: ${bookingBid.cpi} • Sample: {bookingBid.sample_size} N
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Assign Project Manager (PM) *
                  </label>
                  <select
                    value={bookingPm}
                    onChange={(e) => setBookingPm(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}
                  >
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (@{m.username}) — {m.role_name || (Number(m.role_id) === 1 ? 'Super Admin' : 'PM')}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={sendEmailNotification}
                    onChange={(e) => setSendEmailNotification(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="sendNotification" style={{ fontSize: '12px', color: '#475569', cursor: 'pointer', margin: 0 }}>
                    Trigger booking confirmation alert to Project Manager (Laravel sendBookingEmail)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="btn btn-light"
                    style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={converting}
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, background: '#2563eb', borderColor: '#2563eb' }}
                  >
                    {converting ? 'Converting...' : 'Launch Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
"""

if 'Modal: Won Bid Project Booking' not in code:
    code = code.replace(
        "    </div>\n  );\n}",
        booking_modal + "\n    </div>\n  );\n}"
    )

with open('client/src/pages/BidsPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("BidsPage successfully upgraded with PM Booking Modal and Structured Quota Tiers!")
