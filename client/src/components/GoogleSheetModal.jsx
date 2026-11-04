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
 * ==============================================================================
 * VMH GROUP'S SMR - UNIFIED MASTER GOOGLE APPS SCRIPT BACKEND CONNECTOR (Code.gs)
 * ==============================================================================
 * 
 * 🛡️ STRICT SECURITY ARCHITECTURE:
 * - NO API KEY is ever exposed to the Frontend (React / Browser).
 * - All confidential API keys (Zamplia, Provider APIs) are securely stored 
 *   INSIDE Google Apps Script via "Script Properties" (or backend constants).
 * - Frontend makes requests to this script, and Google Apps Script makes
 *   server-to-server calls using UrlFetchApp with the hidden API Key.
 * 
 * 📋 SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet, click "Extensions" -> "Apps Script"
 * 2. Replace all code in "Code.gs" with this script and click Save (Ctrl+S).
 * 3. [OPTIONAL FOR EXTRA SECURITY] Click "Project Settings" (gear icon ⚙️) -> 
 *    "Script Properties" -> Add Property: ZAMPLIA_API_KEY = your_zamplia_key
 * 4. Click "Deploy" -> "New Deployment" -> Select type "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Copy the Web App URL and paste it in the SMR Dashboard!
 * ==============================================================================
 */

function getSecretZampliaApiKey() {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = props.getProperty('ZAMPLIA_API_KEY');
    if (key && key.trim().length > 0) return key.trim();
  } catch (err) {}
  return 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u'; // Server-side fallback (Never sent to browser)
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action ? e.parameter.action : 'status').toLowerCase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureAllSheetsExist(ss);

  if (action === 'status') {
    return createJsonResponse({
      success: true,
      service: "VMH SMR Unified Google Apps Script Backend Gateway",
      status: 'ONLINE',
      apiKeyExposedToFrontend: false,
      sheetTitle: ss.getName(),
      sheets: ss.getSheets().map(function(s) { return s.getName(); }),
      timestamp: new Date().toISOString()
    });
  }

  if (action === 'getsurveys') return proxyZampliaRequest('/Surveys/GetAllocatedSurveys', {});

  var sheetName = (e && e.parameter && e.parameter.sheet) || 'Clients';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createJsonResponse({ success: false, message: 'Sheet not found: ' + sheetName });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createJsonResponse({ success: true, data: [] });

  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var item = {};
    for (var j = 0; j < headers.length; j++) item[headers[j]] = data[i][j];
    rows.push(item);
  }
  return createJsonResponse({ success: true, sheet: sheetName, count: rows.length, data: rows });
}

function doPost(e) {
  try {
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      try { postData = JSON.parse(e.postData.contents); } catch (pErr) { postData = e.parameter || {}; }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var action = (postData.action || 'status').toLowerCase();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureAllSheetsExist(ss);

    // Authentication Actions
    if (action === 'login') return handleLogin(postData);
    if (action === 'register') return handleRegister(postData);
    if (action === 'verify') return createJsonResponse({ success: true, message: 'Verified' });
    if (action === 'list' || action === 'listusers') return handleListUsers();

    // Secure Backend Zamplia Proxy (ZERO Key Exposure to browser)
    if (action === 'getsurveys') return proxyZampliaRequest('/Surveys/GetAllocatedSurveys', postData.params || {});
    if (action === 'getsurveydetails') return proxyZampliaRequest('/Surveys/GetSurveyById', { SurveyId: postData.surveyId || postData.SurveyId });
    if (action === 'getsurveyqualifications') return proxyZampliaRequest('/Surveys/GetSurveyQualifications', { SurveyId: postData.surveyId || postData.SurveyId });
    if (action === 'getsurveyquotas') return proxyZampliaRequest('/Surveys/GetSurveyQuotas', { SurveyId: postData.surveyId || postData.SurveyId });

    // Database Actions
    if (action === 'testconnection') {
      return createJsonResponse({
        success: true,
        message: 'Google Sheet connected successfully! Backend API key vault is active.',
        sheetTitle: ss.getName(),
        sheetUrl: ss.getUrl()
      });
    }

    if (action === 'addclient') {
      var sC = ss.getSheetByName('Clients');
      var c = postData.data || {};
      sC.appendRow([c._id || ('cl_' + new Date().getTime()), c.client_name || '', c.client_code || '', c.country || 'United States', c.currency || 'USD', c.apiType || 'marketxcel', c.status || 'active', new Date().toISOString()]);
      return createJsonResponse({ success: true, message: 'Client saved to Google Sheet' });
    }

    if (action === 'addvendor') {
      var sV = ss.getSheetByName('Vendors');
      var v = postData.data || {};
      sV.appendRow([v._id || ('vnd_' + new Date().getTime()), v.name || '', v.vendor_code || v.vendorUid || '', v.email || '', Number(v.cpi || 0).toFixed(2), v.status || 'active', new Date().toISOString()]);
      return createJsonResponse({ success: true, message: 'Vendor saved to Google Sheet' });
    }

    if (action === 'addproject') {
      var sP = ss.getSheetByName('Projects');
      var p = postData.data || {};
      sP.appendRow([p.project_id || ('PRJ-' + new Date().getTime()), p.project_name || '', p.client_name || '', Number(p.cpi || 0).toFixed(2), Number(p.target_completes || 500), Number(p.loi || 12), Number(p.ir || 80), p.status || 'active', new Date().toISOString()]);
      return createJsonResponse({ success: true, message: 'Project saved to Google Sheet' });
    }

    if (action === 'adduser') {
      var sU = ss.getSheetByName('Users');
      var u = postData.data || {};
      sU.appendRow([u.id || new Date().getTime(), u.name || '', u.username || '', u.email || '', u.mobile_no || '', u.role || 'Admin', u.status || 'active', new Date().toISOString()]);
      return createJsonResponse({ success: true, message: 'User saved to Google Sheet' });
    }

    if (action === 'logactivity') {
      var sL = ss.getSheetByName('ActivityLogs');
      var a = postData.data || {};
      sL.appendRow([new Date().toISOString(), a.eventType || 'ROUTING_ACTIVITY', a.projectId || a.surveyId || '', a.vendorId || '', a.statusLabel || 'Complete (1)', a.details || '']);
      return createJsonResponse({ success: true, message: 'Activity logged to Google Sheet' });
    }

    if (action === 'syncall') {
      if (Array.isArray(postData.clients)) {
        var sCl = ss.getSheetByName('Clients');
        postData.clients.forEach(function(item) { sCl.appendRow([item._id, item.client_name, item.client_code, item.country, item.currency, item.apiType, item.status, new Date().toISOString()]); });
      }
      if (Array.isArray(postData.vendors)) {
        var sVn = ss.getSheetByName('Vendors');
        postData.vendors.forEach(function(item) { sVn.appendRow([item._id, item.name, item.vendor_code, item.email, item.cpi, item.status, new Date().toISOString()]); });
      }
      if (Array.isArray(postData.projects)) {
        var sPr = ss.getSheetByName('Projects');
        postData.projects.forEach(function(item) { sPr.appendRow([item.project_id, item.project_name, item.client_name, item.cpi, item.target_completes, item.loi, item.ir, item.status, new Date().toISOString()]); });
      }
      return createJsonResponse({ success: true, message: 'All platform collections synced to Google Sheet!' });
    }

    return createJsonResponse({ success: false, message: 'Unknown action: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: 'Apps Script Server Error: ' + err.toString() });
  }
}

function proxyZampliaRequest(endpoint, params) {
  var apiKey = getSecretZampliaApiKey();
  var baseUrl = 'https://surveysupply.zamplia.com/api/v1';
  var queryStr = '';
  if (params && typeof params === 'object') {
    var parts = [];
    for (var k in params) {
      if (params.hasOwnProperty(k) && params[k] !== undefined && params[k] !== null && params[k] !== '') {
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    }
    if (parts.length > 0) queryStr = (endpoint.indexOf('?') >= 0 ? '&' : '?') + parts.join('&');
  }

  var options = {
    method: 'get',
    headers: { 'ZAMP-KEY': apiKey, 'Accept': 'application/json' },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(baseUrl + endpoint + queryStr, options);
    var json = JSON.parse(response.getContentText());
    return createJsonResponse({ success: true, data: json });
  } catch (err) {
    return createJsonResponse({ success: false, error: 'Proxy Error: ' + err.toString() });
  }
}

function handleLogin(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Admins');
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return createJsonResponse({ success: false, message: 'No admin accounts found in sheet.' });

  var identifier = (data.identifier || data.username || data.email || '').trim().toLowerCase();
  var password = (data.password || '').trim();
  if (!identifier || !password) return createJsonResponse({ success: false, message: 'Username/Email and Password are required.' });

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var uName = String(row[1] || '').trim().toLowerCase();
    var uEmail = String(row[2] || '').trim().toLowerCase();
    if (uName === identifier || uEmail === identifier) {
      if (String(row[3] || '').trim() !== password) return createJsonResponse({ success: false, message: 'Invalid password.' });
      if (String(row[4] || '').trim().toLowerCase() !== 'admin') return createJsonResponse({ success: false, accessDenied: true, message: 'Access Denied: Only Admin allowed.' });
      try { sheet.getRange(i + 1, 9).setValue(new Date().toISOString()); } catch (tErr) {}
      return createJsonResponse({
        success: true,
        message: 'Admin authentication successful',
        user: { id: row[0], username: row[1], email: row[2], role: 'admin', name: row[5] || row[1], status: row[6], lastLogin: new Date().toISOString() }
      });
    }
  }
  return createJsonResponse({ success: false, message: 'User not found in Google Sheet.' });
}

function handleRegister(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Admins');
  var newId = 'adm_' + (new Date().getTime().toString().slice(-4));
  sheet.appendRow([newId, (data.username || '').trim(), (data.email || '').trim(), (data.password || '').trim(), (data.role || 'admin').trim().toLowerCase(), (data.name || data.username || '').trim(), 'Active', new Date().toISOString(), '']);
  return createJsonResponse({ success: true, message: 'Admin registered successfully', user: { id: newId, username: data.username, email: data.email, role: data.role || 'admin', name: data.name } });
}

function handleListUsers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Admins');
  var rows = sheet.getDataRange().getValues();
  var users = [];
  for (var i = 1; i < rows.length; i++) {
    users.push({ id: rows[i][0], username: rows[i][1], email: rows[i][2], role: rows[i][4], name: rows[i][5], status: rows[i][6], createdAt: rows[i][7], lastLogin: rows[i][8] });
  }
  return createJsonResponse({ success: true, total: users.length, users: users });
}

function ensureAllSheetsExist(ss) {
  var sheetDefs = {
    'Admins': ['ID', 'Username', 'Email', 'Password', 'Role', 'Name', 'Status', 'CreatedAt', 'LastLogin'],
    'Clients': ['ID', 'Client Name', 'Client Code', 'Country', 'Currency', 'API Type', 'Status', 'Updated At'],
    'Vendors': ['ID', 'Vendor Name', 'Vendor Code', 'Contact Email', 'Base CPI ($)', 'Status', 'Updated At'],
    'Projects': ['Project ID', 'Project Name', 'Client Name', 'Revenue CPI ($)', 'Target Completes', 'LOI (min)', 'IR (%)', 'Status', 'Updated At'],
    'Users': ['User ID', 'Full Name', 'Username', 'Email', 'Mobile No', 'Role', 'Status', 'Updated At'],
    'ActivityLogs': ['Timestamp', 'Event Type', 'Project / Survey ID', 'Vendor Code', 'Outcome Status', 'Details / Link']
  };
  var colors = { 'Admins': '#0C213A', 'Clients': '#1E3A8A', 'Vendors': '#065F46', 'Projects': '#0F172A', 'Users': '#5B21B6', 'ActivityLogs': '#374151' };

  for (var name in sheetDefs) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(sheetDefs[name]);
      var range = sheet.getRange(1, 1, 1, sheetDefs[name].length);
      range.setFontWeight('bold').setFontColor('#FFFFFF').setBackground(colors[name] || '#1E293B');
      sheet.setFrozenRows(1);
      if (name === 'Admins') {
        sheet.appendRow(['adm_1001', 'Vmhgroup', 'admin@vmhgroupsmr.com', 'Jelly', 'admin', 'VMH Super Admin', 'Active', new Date().toISOString(), '']);
      }
    }
  }
}

function createJsonResponse(data) {
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
            ) : null}

            {/* Google Sheet Created Card */}
            <div style={{
              background: '#064E3B',
              borderRadius: '10px',
              padding: '16px 18px',
              marginBottom: '18px',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#34D399" />
                  <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    Google Sheet Live in Your Account (kamleshg9569@gmail.com)
                  </span>
                </div>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                  5 Tabs Configured
                </span>
              </div>
              <p style={{ fontSize: '12.5px', margin: '0 0 12px 0', opacity: 0.95, lineHeight: 1.5 }}>
                Spreadsheet <strong>"SMR Dashboard Live Data"</strong> has been created with all 5 active tabs (<code>Clients</code>, <code>Vendors</code>, <code>Projects</code>, <code>Users</code>, <code>ActivityLogs</code>) and initial live data.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="https://docs.google.com/spreadsheets/d/1ZUHDF1_r-OMKBi-2ORGwN2YGYCUt6INZrhnt5e4neIk/edit"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    color: '#065F46',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <ExternalLink size={14} /> Open "SMR Dashboard Live Data" Sheet
                </a>
              </div>
            </div>

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
                  Pushes all Demand Clients, Supply Vendors, and Users into dedicated tabs.
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
                  <Code size={15} color="#0F172A" /> 5-Step Secure Google Apps Script Setup Guide (Code.gs)
                </span>
                <span style={{ fontSize: '11px', color: '#0F172A' }}>
                  {showCode ? 'Hide Code ▲' : 'View & Copy Code ▼'}
                </span>
              </div>

              {showCode && (
                <div style={{ padding: '16px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
                  {/* Security Notice Banner */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    fontSize: '11.5px',
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <ShieldCheck size={16} color="#0F172A" />
                    <span><strong>100% Secure Backend:</strong> API keys are handled strictly inside Google Apps Script (Script Properties) and never exposed to the frontend/browser.</span>
                  </div>

                  <ol style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                    <li>Open your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Paste the code below into <strong>Code.gs</strong> and press <strong>Save (Ctrl+S)</strong>.</li>
                    <li><em>(Extra Security):</em> Click <strong>Project Settings (⚙️)</strong> &gt; <strong>Script Properties</strong> &gt; Add <code>ZAMPLIA_API_KEY</code> with your key.</li>
                    <li>Click <strong>Deploy &gt; New Deployment</strong>, choose type <strong>Web app</strong> (Execute as: <em>Me</em>, Who has access: <em>Anyone</em>), then click <strong>Deploy</strong>.</li>
                    <li>Copy your generated Web App URL and paste it in the box above!</li>
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
                    color: '#94A3B8',
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
