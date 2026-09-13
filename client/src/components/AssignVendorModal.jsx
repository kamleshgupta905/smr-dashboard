import React, { useEffect, useState } from 'react';
import { X, Link2, Copy, Check, Share2 } from 'lucide-react';
import { ZampliaAPI, ManagementAPI } from '../services/api';

export default function AssignVendorModal({ survey, surveyId, onClose }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const currentId = survey?.SurveyId || survey?.survey_id || (typeof survey === 'string' || typeof survey === 'number' ? survey : surveyId);
  const currentName = survey?.Name || survey?.survey_name || `Survey #${currentId}`;
  const currentCpi = survey?.CPI || survey?.cpi || 0;
  const currentLoi = survey?.LOI || survey?.loi || 15;

  useEffect(() => {
    ManagementAPI.getVendors()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setVendors(Array.isArray(list) ? list : []);
        if (list.length > 0) {
          setSelectedVendor(list[0].vendor_code || list[0].vendorUid || list[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedVendor || !currentId) return;

    setLoading(true);
    setStatusMsg('');
    try {
      const res = await ZampliaAPI.generateLink(currentId, selectedVendor);
      if (res.data?.success) {
        const link = res.data.signedLiveLink || res.data.liveLink;
        setGeneratedLink(link);
        setStatusMsg('✓ Zamplia Live Entry Link generated successfully!');
      } else {
        setStatusMsg(res.data?.message || 'Failed to generate link from Zamplia.');
      }
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} color="#00C851" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Assign Vendor & Generate Live Link
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="modal-body">
            <div style={{ 
              background: '#F8FAFC', 
              padding: '14px 16px', 
              borderRadius: '8px', 
              marginBottom: '18px', 
              border: '1px solid var(--border-color)' 
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Survey Target:</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {currentName}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--text-body)' }}>
                <span>PID: <strong style={{ color: '#0F172A' }}>{currentId}</strong></span>
                <span>CPI: <strong style={{ color: '#00C851' }}>${Number(currentCpi).toFixed(2)}</strong></span>
                <span>LOI: <strong>{currentLoi} min</strong></span>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#0F172A' }}>
                Select Vendor / Panel Partner:
              </label>
              <select
                className="input-field"
                style={{ width: '100%' }}
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                required
              >
                {vendors.length === 0 ? (
                  <option value="SAMPLE_VENDOR_1">Default Sample Vendor (No vendors saved yet)</option>
                ) : (
                  vendors.map((v) => (
                    <option key={v._id || v.vendor_code} value={v.vendor_code || v._id}>
                      {v.name} ({v.vendor_code || v._id})
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '15px', height: '15px' }} /> Requesting Zamplia Live Link...
                </>
              ) : (
                <>
                  <Link2 size={15} /> Generate Signed Entry Link
                </>
              )}
            </button>

            {statusMsg && (
              <div style={{ 
                marginTop: '12px', 
                fontSize: '13px', 
                fontWeight: 600,
                color: statusMsg.startsWith('✓') ? '#00C851' : '#DC2626',
                textAlign: 'center'
              }}>
                {statusMsg}
              </div>
            )}

            {generatedLink && (
              <div style={{ marginTop: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Target Vendor Live URL (HMAC Signed):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="input-field"
                    style={{ fontSize: '12px', fontFamily: 'monospace', width: '100%' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCopy}
                  >
                    {copied ? <Check size={16} color="#00C851" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
