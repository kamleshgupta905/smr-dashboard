with open('client/src/pages/BidsPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add Rocket to lucide-react import
if 'Rocket' not in code:
    code = code.replace("Trash2,", "Trash2,\n  Rocket,")

# Add convertBidToProject to api imports
if 'convertBidToProject' not in code:
    code = code.replace(
        "import { getBids, createBid, updateBidStatus, deleteBid, getClients } from '../services/api';",
        "import { getBids, createBid, updateBidStatus, deleteBid, getClients, convertBidToProject } from '../services/api';"
    )

# Add handleConvertToProject
handler_code = """  const handleConvertToProject = async (b) => {
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
  };\n\n"""

if "handleConvertToProject" not in code:
    code = code.replace("  const handleDelete = async (id) => {", handler_code + "  const handleDelete = async (id) => {")

# Update table action buttons
old_btn = """                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="btn btn-soft-danger btn-sm"
                          style={{ padding: '4px 8px', borderRadius: '4px' }}
                          title="Delete Bid"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>"""

new_btn = """                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => handleConvertToProject(b)}
                            style={{ 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              cursor: 'pointer'
                            }}
                            title="Convert Bid to Project / Study (Laravel replicate)"
                          >
                            <Rocket size={12} />
                            <span>Convert to Project</span>
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="btn btn-soft-danger btn-sm"
                            style={{ padding: '4px 8px', borderRadius: '4px' }}
                            title="Delete Bid"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>"""

if old_btn in code:
    code = code.replace(old_btn, new_btn)

with open('client/src/pages/BidsPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("Updated BidsPage.jsx with Convert to Project feature!")
