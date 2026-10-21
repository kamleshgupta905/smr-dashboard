with open('client/src/pages/SurveysPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
if 'Link as LinkIcon' not in code:
    code = code.replace(
        "  Download, Copy\n} from 'lucide-react';",
        "  Download, Copy, Link as LinkIcon, Check\n} from 'lucide-react';"
    )

# 2. Add copiedId state and handler
copy_state = """  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (s) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://api.vmhgroupsmr.com';
    const link = s.entry_live_url || `${origin}/redirect?pid=${s.survey_id}&uid=[RESPONDENT_ID]`;
    try {
      navigator.clipboard.writeText(link);
      setCopiedId(s.survey_id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      prompt("Copy survey entry link:", link);
    }
  };
"""

if 'handleCopyLink' not in code:
    code = code.replace(
        "  const [showBulkModal, setShowBulkModal] = useState(false);",
        "  const [showBulkModal, setShowBulkModal] = useState(false);\n" + copy_state
    )

# 3. Add Copy Link button in action buttons
copy_btn = """                            <button
                              className="btn btn-sm"
                              style={{ 
                                padding: '3px 6px', 
                                fontSize: '11px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px', 
                                borderRadius: '4px', 
                                background: copiedId === s.survey_id ? '#dcfce7' : '#f8fafc',
                                color: copiedId === s.survey_id ? '#15803d' : '#475569',
                                border: '1px solid #cbd5e1',
                                fontWeight: 600, 
                                whiteSpace: 'nowrap' 
                              }}
                              onClick={() => handleCopyLink(s)}
                              title={copiedId === s.survey_id ? "Copied to clipboard!" : "1-Click Fast Copy Live/Test Link"}
                            >
                              {copiedId === s.survey_id ? <Check size={11} /> : <LinkIcon size={11} />}
                              {copiedId === s.survey_id ? 'Copied' : 'Link'}
                            </button>"""

if 'handleCopyLink(s)' not in code:
    code = code.replace(
        """                            <button
                              className="btn btn-soft-info btn-sm"
                              style={{ padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#0891b2', border: '1px solid rgba(6, 182, 212, 0.2)', fontWeight: 600, whiteSpace: 'nowrap' }}
                              onClick={() => openDuplicateModal(s)}
                              title="1-Click Clone / Duplicate Project"
                            >
                              <Copy size={11} /> Clone
                            </button>""",
        copy_btn + """\n                            <button
                              className="btn btn-soft-info btn-sm"
                              style={{ padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#0891b2', border: '1px solid rgba(6, 182, 212, 0.2)', fontWeight: 600, whiteSpace: 'nowrap' }}
                              onClick={() => openDuplicateModal(s)}
                              title="1-Click Clone / Duplicate Project"
                            >
                              <Copy size={11} /> Clone
                            </button>"""
    )

with open('client/src/pages/SurveysPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("SurveysPage enhanced with 1-Click Fast Copy Link!")
