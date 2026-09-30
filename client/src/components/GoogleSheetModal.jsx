import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  UploadCloud, 
  Link, 
  ShieldCheck,
  Code
} from 'lucide-react';
import ModalPortal from './ModalPortal';
import { GoogleSheetAPI } from '../services/api';

const SCRIPT_SOURCE_CODE = `/**
 * VMH GROUP'S SMR DASHBOARD — GOOGLE APPS SCRIPT DATABASE CONNECTOR
 * Extensions > Apps Script > Paste & Deploy as Web App (Anyone)
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'status';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheetsExist(ss);

  if (action === 'status') {
    return jsonResponse({
      success: true,
      service: 'VMH SMR Google Sheet Database Connector',
      sheetTitle: ss.getName(),
      sheets: ss.getSheets().map(function(s) { return s.getName(); }),
      timestamp: new Date().toISOString()
    });
  }

  var sheetName = (e && e.parameter && e.parameter.sheet) || 'Clients';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return jsonResponse({ success: false, message: 'Sheet not found: ' + sheetName });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse({ success: true, data: [] });

  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      item[headers[j]] = data[i][j];
    }
    rows.push(item);
  }
  return jsonResponse({ success: true, sheet: sheetName, count: rows.length, data: rows });
}

function doPost(e) {
  try {
    var contents = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var payload = JSON.parse(contents);
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    ensureSheetsExist(ss);

    if (action === 'testConnection') {
      return jsonResponse({
        success: true,
        message: 'Google Sheet connected successfully to VMH SMR Dashboard!',
        sheetTitle: ss.getName(),
        sheetUrl: ss.getUrl()
      });
    }

    if (action === 'addClient') {
      var sheet = ss.getSheetByName('Clients');
      var c = payload.data || {};
      sheet.appendRow([
        c._id || ('cl_' + new Date().getTime()),
        c.client_name || '',
        c.client_code || '',
        c.country || 'United States',
        c.currency || 'USD',
        c.apiType || 'marketxcel',
        c.status || 'active',
        new Date().toISOString()
      ]);
      return jsonResponse({ success: true, message: 'Client saved to Google Sheet' });
    }

    if (action === 'addVendor') {
      var sheet = ss.getSheetByName('Vendors');
      var v = payload.data || {};
      sheet.appendRow([
        v._id || ('vnd_' + new Date().getTime()),
        v.name || '',
        v.vendor_code || v.vendorUid || '',
        v.email || '',
        Number(v.cpi || 0).toFixed(2),
        v.status || 'active',
        new Date().toISOString()
      ]);
      return jsonResponse({ success: true, message: 'Vendor saved to Google Sheet' });
    }

    if (action === 'addProject') {
      var sheet = ss.getSheetByName('Projects');
      var p = payload.data || {};
      sheet.appendRow([
        p.project_id || ('PRJ-' + new Date().getTime()),
        p.project_name || '',
        p.client_name || '',
        Number(p.cpi || 0).toFixed(2),
        Number(p.target_completes || 500),
        Number(p.loi || 12),
        Number(p.ir || 80),
        p.status || 'active',
        new Date().toISOString()
      ]);
      return jsonResponse({ success: true, message: 'Project saved to Google Sheet' });
    }

    if (action === 'addUser') {
      var sheet = ss.getSheetByName('Users');
      var u = payload.data || {};
      sheet.appendRow([
        u.id || new Date().getTime(),
        u.name || '',
        u.username || '',
        u.email || '',
        u.mobile_no || '',
        u.role || 'Admin',
        u.status || 'active',
        new Date().toISOString()
      ]);
      return jsonResponse({ success: true, message: 'User saved to Google Sheet' });
    }

    if (action === 'logActivity') {
      var sheet = ss.getSheetByName('ActivityLogs');
      var a = payload.data || {};
      sheet.appendRow([
        new Date().toISOString(),
        a.eventType || 'TEST_ROUTING',
        a.projectId || a.surveyId || '',
        a.vendorId || '',
        a.statusLabel || 'Complete (1)',
        a.details || ''
      ]);
      return jsonResponse({ success: true, message: 'Activity logged to Google Sheet' });
    }

    if (action === 'syncAll') {
      if (Array.isArray(payload.clients)) {
        var sC = ss.getSheetByName('Clients');
        payload.clients.forEach(function(c) {
          sC.appendRow([c._id, c.client_name, c.client_code, c.country, c.currency, c.apiType, c.status, new Date().toISOString()]);
        });
      }
      if (Array.isArray(payload.vendors)) {
        var sV = ss.getSheetByName('Vendors');
        payload.vendors.forEach(function(v) {
          sV.appendRow([v._id, v.name, v.vendor_code, v.email, v.cpi, v.status, new Date().toISOString()]);
        });
      }
      if (Array.isArray(payload.projects)) {
        var sP = ss.getSheetByName('Projects');
        payload.projects.forEach(function(p) {
          sP.appendRow([p.project_id, p.project_name, p.client_name, p.cpi, p.target_completes, p.loi, p.ir, p.status, new Date().toISOString()]);
        });
      }
      return jsonResponse({ success: true, message: 'All items synchronized to Google Sheet!' });
    }

    return jsonResponse({ success: false, message: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function ensureSheetsExist(ss) {
  var sheetDefs = {
    'Clients': ['ID', 'Client Name', 'Client Code', 'Country', 'Currency', 'API Type', 'Status', 'Updated At'],
    'Vendors': ['ID', 'Vendor Name', 'Vendor Code', 'Contact Email', 'Base CPI ($)', 'Status', 'Updated At'],
    'Projects': ['Project ID', 'Project Name', 'Client Name', 'Revenue CPI ($)', 'Target Completes', 'LOI (min)', 'IR (%)', 'Status', 'Updated At'],
    'Users': ['User ID', 'Full Name', 'Username', 'Email', 'Mobile No', 'Role', 'Status', 'Updated At'],
    'ActivityLogs': ['Timestamp', 'Event Type', 'Project / Survey ID', 'Vendor Code', 'Outcome Status', 'Details / Link']
  };
  var colors = { 'Clients': '#1E3A8A', 'Vendors': '#065F46', 'Projects': '#1E40AF', 'Users': '#5B21B6', 'ActivityLogs': '#374151' };

  for (var name in sheetDefs) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(sheetDefs[name]);
      var range = sheet.getRange(1, 1, 1, sheetDefs[name].length);
      range.setFontWeight('bold').setFontColor('#FFFFFF').setBackground(colors[name] || '#1E293B');
      sheet.setFrozenRows(1);
    }
  }
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

export default function GoogleSheetModal({ isOpen, onClose }) {
  const [scriptUrl, setScriptUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const saved = GoogleSheetAPI.getScriptUrl();
    if (saved) {
      setScriptUrl(saved);
      // Auto test connection if URL is already saved
      GoogleSheetAPI.testConnection(saved)
        .then(res => setTestResult(res))
        .catch(() => {});
    }
  }, []);

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (!scriptUrl.trim()) return;
    GoogleSheetAPI.setScriptUrl(scriptUrl.trim());
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) {
      alert('Please paste your Google Apps Script Web App URL first.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await GoogleSheetAPI.testConnection(scriptUrl.trim());
      setTestResult(res);
      GoogleSheetAPI.setScriptUrl(scriptUrl.trim());
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message || 'Failed to connect. Please verify script permissions (Who has access: Anyone).'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncAll = async () => {
    if (!scriptUrl.trim()) {
      alert('Please connect your Google Sheet first.');
      return;
    }
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await GoogleSheetAPI.syncAllData();
      setSyncMessage(res.message || 'All platform data synchronized to Google Sheet successfully!');
    } catch (err) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SCRIPT_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
          {/* Header */}
          <div className="modal-header" style={{ borderBottom: '1px solid #e3ebf6', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#1d2c48' }}>
                  Google Sheets Database Connector
                </h3>
                <small style={{ color: '#8997bd' }}>
                  Sync Clients, Vendors, Projects, Users & Live Routing logs directly to Google Sheets via Apps Script
                </small>
              </div>
            </div>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#8997bd', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body" style={{ padding: '20px 0 0 0' }}>
            {/* Connection Status Banner */}
            {testResult?.success ? (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#10B981" />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#065F46' }}>Connected to Google Sheet:</strong>
                    <span style={{ fontSize: '13px', color: '#047857', marginLeft: '6px', fontWeight: 700 }}>
                      {testResult.sheetTitle || 'SMR Database Spreadsheet'}
                    </span>
                  </div>
                </div>
                <span className="badge-soft-success" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                  Live Real-Time Sync Active
                </span>
              </div>
            ) : (
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link size={18} color="#64748B" />
                  <span style={{ fontSize: '12.5px', color: '#475569' }}>
                    Paste your Google Apps Script Web App URL below to link your spreadsheet.
                  </span>
                </div>
                <a 
                  href="https://sheets.new" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#047857',
                    textDecoration: 'none'
                  }}
                >
                  Create New Sheet <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* URL Input Form */}
            <form onSubmit={handleSaveUrl} style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: '#1d2c48' }}>
                Google Apps Script Web App URL:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  className="input-field"
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF'
                  }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTestConnection}
                  disabled={testing}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                >
                  <RefreshCw size={13} className={testing ? 'sync-spin' : ''} />
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '12px', fontWeight: 700 }}
                >
                  Save & Connect
                </button>
              </div>
            </form>

            {/* Test Error Banner */}
            {testResult && !testResult.success && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#B91C1C',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} color="#DC2626" />
                <span>{testResult.error || testResult.message || 'Connection failed.'}</span>
              </div>
            )}

            {/* 1-Click Sync All Button */}
            <div style={{
              background: '#F1F5F9',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: '13px', color: '#1E293B' }}>
                  Sync All Current Platform Inventory to Sheet
                </strong>
                <small style={{ color: '#64748B' }}>
                  Pushes all Demand Clients, Supply Vendors, and Campaign Projects into dedicated tabs.
                </small>
              </div>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSyncAll}
                disabled={syncing || !scriptUrl.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#047857',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '8px 14px',
                  borderRadius: '6px'
                }}
              >
                <UploadCloud size={15} className={syncing ? 'sync-spin' : ''} />
                {syncing ? 'Syncing to Sheet...' : 'Push All to Sheet'}
              </button>
            </div>

            {syncMessage && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#065F46',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>{syncMessage}</span>
              </div>
            )}

            {/* Step-by-Step Setup Guide & Script Code */}
            <div style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div 
                onClick={() => setShowCode(!showCode)}
                style={{
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  color: '#334155'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={15} color="#2563EB" /> 4-Step Google Apps Script Setup Guide (Code.gs)
                </span>
                <span style={{ fontSize: '11px', color: '#2563EB' }}>
                  {showCode ? 'Hide Code ▲' : 'View & Copy Code ▼'}
                </span>
              </div>

              {showCode && (
                <div style={{ padding: '16px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
                  <ol style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                    <li>Open your Google Sheet, then click <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Paste the script below into the code editor and press <strong>Save (Ctrl+S)</strong>.</li>
                    <li>Click <strong>Deploy &gt; New Deployment</strong>, choose type <strong>Web app</strong>.</li>
                    <li>Set <em>Execute as: <strong>Me</strong></em> and <em>Who has access: <strong>Anyone</strong></em>, then click <strong>Deploy</strong>.</li>
                    <li>Copy your Web App URL and paste it in the box above!</li>
                  </ol>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleCopyCode}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}
                    >
                      {copiedCode ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
                      {copiedCode ? 'Copied to Clipboard!' : 'Copy Script Code'}
                    </button>
                  </div>

                  <pre style={{
                    background: '#0F172A',
                    color: '#38BDF8',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    margin: 0
                  }}>
                    {SCRIPT_SOURCE_CODE}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
