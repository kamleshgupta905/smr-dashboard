/**
 * =========================================================================
 * VMH GROUP'S SMR DASHBOARD — GOOGLE APPS SCRIPT DATABASE CONNECTOR
 * =========================================================================
 * 
 * Instructions:
 * 1. Open a new Google Sheet (or go to https://sheets.new).
 * 2. In Google Sheets menu, click: Extensions > Apps Script.
 * 3. Delete any code in the editor, paste this entire file, and click Save (Ctrl + S).
 * 4. Click: Deploy > New Deployment.
 * 5. In "Select type" gear icon, choose: Web app.
 * 6. Set Description: "SMR Dashboard Connector".
 * 7. Set "Execute as": "Me (your email)".
 * 8. Set "Who has access": "Anyone" (crucial for web app callbacks).
 * 9. Click "Deploy", authorize permissions when prompted, and copy the Web App URL.
 * 10. Paste the Web App URL into the "Google Sheet" modal in your SMR Dashboard!
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
  if (!sheet) {
    return jsonResponse({ success: false, message: 'Sheet not found: ' + sheetName });
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return jsonResponse({ success: true, data: [] });
  }

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

    // 1. Connection Test Ping
    if (action === 'testConnection') {
      return jsonResponse({
        success: true,
        message: 'Google Sheet connected successfully to VMH SMR Dashboard!',
        sheetTitle: ss.getName(),
        sheetUrl: ss.getUrl(),
        timestamp: new Date().toISOString()
      });
    }

    // 2. Add Demand Client
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
      return jsonResponse({ success: true, message: 'Client saved to Google Sheet successfully' });
    }

    // 3. Add Supply Vendor
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
      return jsonResponse({ success: true, message: 'Vendor saved to Google Sheet successfully' });
    }

    // 4. Add Campaign Project
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
      return jsonResponse({ success: true, message: 'Project saved to Google Sheet successfully' });
    }

    // 5. Add User
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
      return jsonResponse({ success: true, message: 'User saved to Google Sheet successfully' });
    }

    // 6. Log Activity / Router Test
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

    // 7. Full Synchronization (Sync All Catalogs at Once)
    if (action === 'syncAll') {
      var clientCount = 0;
      var vendorCount = 0;
      var projectCount = 0;

      if (Array.isArray(payload.clients) && payload.clients.length > 0) {
        var sC = ss.getSheetByName('Clients');
        payload.clients.forEach(function(c) {
          sC.appendRow([
            c._id || '',
            c.client_name || '',
            c.client_code || '',
            c.country || '',
            c.currency || 'USD',
            c.apiType || '',
            c.status || 'active',
            new Date().toISOString()
          ]);
          clientCount++;
        });
      }

      if (Array.isArray(payload.vendors) && payload.vendors.length > 0) {
        var sV = ss.getSheetByName('Vendors');
        payload.vendors.forEach(function(v) {
          sV.appendRow([
            v._id || '',
            v.name || '',
            v.vendor_code || v.vendorUid || '',
            v.email || '',
            Number(v.cpi || 0).toFixed(2),
            v.status || 'active',
            new Date().toISOString()
          ]);
          vendorCount++;
        });
      }

      if (Array.isArray(payload.projects) && payload.projects.length > 0) {
        var sP = ss.getSheetByName('Projects');
        payload.projects.forEach(function(p) {
          sP.appendRow([
            p.project_id || '',
            p.project_name || '',
            p.client_name || '',
            Number(p.cpi || 0).toFixed(2),
            Number(p.target_completes || 500),
            Number(p.loi || 12),
            Number(p.ir || 80),
            p.status || 'active',
            new Date().toISOString()
          ]);
          projectCount++;
        });
      }

      return jsonResponse({
        success: true,
        message: 'Synchronized ' + clientCount + ' clients, ' + vendorCount + ' vendors, and ' + projectCount + ' projects to Google Sheet.'
      });
    }

    return jsonResponse({ success: false, message: 'Unrecognized action: ' + action });

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
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

  var colors = {
    'Clients': '#1E3A8A',
    'Vendors': '#065F46',
    'Projects': '#1E40AF',
    'Users': '#5B21B6',
    'ActivityLogs': '#374151'
  };

  for (var name in sheetDefs) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(sheetDefs[name]);
      
      // Styling header row
      var range = sheet.getRange(1, 1, 1, sheetDefs[name].length);
      range.setFontWeight('bold')
           .setFontColor('#FFFFFF')
           .setBackground(colors[name] || '#1E293B');
      sheet.setFrozenRows(1);
    }
  }

  // Remove default 'Sheet1' if empty and extra sheets exist
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
