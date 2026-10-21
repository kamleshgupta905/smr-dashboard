with open('client/src/pages/BidsPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
if 'getBidOptions' not in code:
    code = code.replace(
        "import { getBids, createBid, updateBidStatus, deleteBid, getClients, convertBidToProject } from '../services/api';",
        "import { getBids, createBid, updateBidStatus, deleteBid, getClients, convertBidToProject, getBidOptions, addBidOption, deleteBidOption } from '../services/api';"
    )

if 'Layers,' not in code:
    code = code.replace(
        "  Users\n} from 'lucide-react';",
        "  Users,\n  Layers,\n  ListPlus\n} from 'lucide-react';"
    )

# 2. Add state and handlers
opt_state = """  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedBidForOptions, setSelectedBidForOptions] = useState(null);
  const [bidOptions, setBidOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [addingOption, setAddingOption] = useState(false);

  const handleOpenOptions = async (bid) => {
    setSelectedBidForOptions(bid);
    setShowOptionsModal(true);
    setLoadingOptions(true);
    try {
      const res = await getBidOptions(bid.id);
      if (res && res.success) {
        setBidOptions(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load bid options:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleAddOption = async (e) => {
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
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await deleteBidOption(optionId);
      setBidOptions(prev => prev.filter(o => o.id !== optionId));
    } catch (err) {
      alert('Failed to delete option');
    }
  };
"""

if 'handleOpenOptions' not in code:
    code = code.replace(
        "  const [form, setForm] = useState({",
        opt_state + "\n  const [form, setForm] = useState({"
    )

# 3. Add Tiers button in table row actions
tier_btn = """                          <button
                            onClick={() => handleOpenOptions(b)}
                            className="btn btn-soft-secondary btn-sm"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                            title="Manage Multi-tier Pricing & Sample Quotas (bid_options)"
                          >
                            <Layers size={12} />
                            <span>Tiers</span>
                          </button>"""

if 'handleOpenOptions(b)' not in code:
    code = code.replace(
        """                          {b.status === 'Won' && (""",
        tier_btn + """\n                          {b.status === 'Won' && ("""
    )

# 4. Add ModalPortal for Bid Options Tiers
opt_modal = """
      {/* Modal: Bid Options & Pricing Tiers */}
      {showOptionsModal && selectedBidForOptions && (
        <ModalPortal isOpen={showOptionsModal} onClose={() => setShowOptionsModal(false)}>
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
              maxWidth: '560px',
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
                  <div style={{ background: '#e0e7ff', padding: '6px', borderRadius: '6px', color: '#4f46e5' }}>
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Pricing Tiers & Options
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Bid: {selectedBidForOptions.bid_name || selectedBidForOptions.name} (MySQL bid_options)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOptionsModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Add new tier option form */}
                <form onSubmit={handleAddOption} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
                </form>

                {/* Options List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                  {loadingOptions ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                      Loading options from bid_options table...
                    </div>
                  ) : bidOptions.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                      No tier options created yet. Add sample quotas or alternative pricing above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {bidOptions.map((opt) => (
                        <div
                          key={opt.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            borderBottom: '1px solid #f8fafc',
                            background: '#ffffff'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                              {opt.option_name}
                            </div>
                            {opt.value && (
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                {opt.value}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(opt.id)}
                            className="btn btn-soft-danger btn-sm"
                            style={{ padding: '3px 6px', borderRadius: '4px', border: 'none', background: '#fee2e2', color: '#dc2626' }}
                            title="Remove Tier Option"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
"""

if 'Modal: Bid Options & Pricing Tiers' not in code:
    code = code.replace(
        "    </div>\n  );\n}",
        opt_modal + "\n    </div>\n  );\n}"
    )

with open('client/src/pages/BidsPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("BidsPage enhanced with multi-tier bid_options management!")
