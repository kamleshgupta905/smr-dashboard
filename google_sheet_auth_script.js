/**
 * ==============================================================================
 * VMH GROUP'S SMR - Google Sheet Database Authentication Script (Code.gs)
 * ==============================================================================
 * 
 * QUICK SETUP INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Name your spreadsheet: "VMH SMR Database"
 * 3. Go to "Extensions" -> "Apps Script"
 * 4. Paste this entire code into the "Code.gs" editor (replace any existing code)
 * 5. Click "Save" (disk icon)
 * 6. Click "Deploy" (blue button top right) -> "New Deployment"
 * 7. Click gear icon (Select type) -> choose "Web App"
 * 8. Configuration:
 *    - Description: "VMH SMR Auth Web App"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (REQUIRED so the login page/server can verify logins)
 * 9. Click "Deploy", approve Google permissions (Click Advanced -> Go to VMH SMR Auth -> Allow)
 * 10. Copy the generated "Web app URL" (looks like: https://script.google.com/macros/s/AKfycbx.../exec)
 * 11. Add to server/.env:
 *     GOOGLE_SHEET_AUTH_URL=https://script.google.com/macros/s/AKfycbx.../exec
 * ==============================================================================
 */

const SHEET_NAME = 'Admins';

/**
 * Ensures the 'Admins' sheet exists and has proper headers & default admin
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    
    // Headers
    const headers = [
      'ID',
      'Username',
      'Email',
      'Password',
      'Role',
      'Name',
      'Status',
      'CreatedAt',
      'LastLogin'
    ];
    sheet.appendRow(headers);
    
    // Format header row (VMH Navy Blue + White text)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0c213a');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // Auto-seed default Super Admin
    sheet.appendRow([
      'adm_1001',
      'Vmhgroup',
      'admin@vmhgroupsmr.com',
      'Jelly',
      'admin',
      'VMH Super Admin',
      'Active',
      new Date().toISOString(),
      ''
    ]);

    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Auto-resize columns
    for (let c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }
  }
  
  return sheet;
}

/**
 * Handle POST Requests from SMR Client or Server
 */
function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (pErr) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = (postData.action || 'login').toLowerCase();

    if (action === 'login') {
      return handleLogin(postData);
    } else if (action === 'register') {
      return handleRegister(postData);
    } else if (action === 'verify') {
      return handleVerify(postData);
    } else if (action === 'list') {
      return handleListUsers();
    }

    return createResponse({
      success: false,
      message: 'Invalid action requested: ' + action
    });
  } catch (err) {
    return createResponse({
      success: false,
      message: 'Server error in Apps Script: ' + err.toString()
    });
  }
}

/**
 * Handle GET Requests (Health check & direct testing in browser)
 */
function doGet(e) {
  getOrCreateSheet();
  return createResponse({
    success: true,
    service: "VMH GROUP'S SMR Google Sheet Auth API",
    status: 'ONLINE',
    admin_restriction_enabled: true,
    timestamp: new Date().toISOString()
  });
}

/**
 * Authenticate User:
 * STRICT RULE: ONLY role === 'admin' and status === 'active' can log in!
 */
function handleLogin(data) {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  
  if (rows.length <= 1) {
    return createResponse({ 
      success: false, 
      message: 'No users found in Google Sheet database.' 
    });
  }

  const identifier = (data.identifier || data.username || data.email || '').trim().toLowerCase();
  const password = (data.password || '').trim();

  if (!identifier || !password) {
    return createResponse({ 
      success: false, 
      message: 'Username/Email and Password are required.' 
    });
  }

  // Row columns:
  // [0: ID, 1: Username, 2: Email, 3: Password, 4: Role, 5: Name, 6: Status, 7: CreatedAt, 8: LastLogin]
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const uName = String(row[1] || '').trim().toLowerCase();
    const uEmail = String(row[2] || '').trim().toLowerCase();
    const uPass = String(row[3] || '').trim();
    const uRole = String(row[4] || '').trim().toLowerCase();
    const uStatus = String(row[6] || '').trim().toLowerCase();

    // Check if Username or Email matches
    if (uName === identifier || uEmail === identifier) {
      
      // 1. Password check
      if (uPass !== password) {
        return createResponse({ 
          success: false, 
          message: 'Invalid password. Please check your credentials.' 
        });
      }

      // 2. STRICT ADMIN-ONLY SECURITY RULE:
      // Only users with role === 'admin' are permitted to log into the SMR dashboard!
      if (uRole !== 'admin') {
        return createResponse({ 
          success: false, 
          accessDenied: true,
          message: 'Access Denied: Only Admin accounts are authorized to log in to VMH SMR platform. Your role is: ' + row[4] 
        });
      }

      // 3. Status check
      if (uStatus !== 'active') {
        return createResponse({ 
          success: false, 
          message: 'Your admin account has been deactivated. Please contact VMH Super Admin.' 
        });
      }

      // Record last login time into Column 9 (LastLogin)
      try {
        sheet.getRange(i + 1, 9).setValue(new Date().toISOString());
      } catch (tErr) {
        // Ignore timestamp update error
      }

      return createResponse({
        success: true,
        message: 'Admin authentication successful',
        user: {
          id: row[0],
          username: row[1],
          email: row[2],
          role: 'admin',
          name: row[5] || row[1],
          status: row[6],
          lastLogin: new Date().toISOString()
        }
      });
    }
  }

  return createResponse({ 
    success: false, 
    message: 'User not found in Google Sheet database. Please verify username/email.' 
  });
}

/**
 * Register a new Admin in Google Sheet
 */
function handleRegister(data) {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  
  const username = (data.username || '').trim();
  const email = (data.email || '').trim();
  const password = (data.password || '').trim();
  const role = (data.role || 'admin').trim().toLowerCase();
  const name = (data.name || username).trim();

  if (!username || !password) {
    return createResponse({ 
      success: false, 
      message: 'Username and Password are required to register.' 
    });
  }

  // Check if username or email already exists
  for (let i = 1; i < rows.length; i++) {
    const existingName = String(rows[i][1] || '').trim().toLowerCase();
    const existingEmail = String(rows[i][2] || '').trim().toLowerCase();
    
    if (existingName === username.toLowerCase()) {
      return createResponse({ 
        success: false, 
        message: 'Username "' + username + '" is already registered in Google Sheet.' 
      });
    }
    if (email && existingEmail === email.toLowerCase()) {
      return createResponse({ 
        success: false, 
        message: 'Email "' + email + '" is already registered in Google Sheet.' 
      });
    }
  }

  const newId = 'adm_' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  sheet.appendRow([
    newId,
    username,
    email,
    password,
    role,
    name,
    'Active',
    now,
    ''
  ]);

  return createResponse({
    success: true,
    message: 'New admin registered successfully in Google Sheet.',
    user: {
      id: newId,
      username: username,
      email: email,
      role: role,
      name: name
    }
  });
}

/**
 * List all users from Google Sheet (excluding password)
 */
function handleListUsers() {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const users = [];

  for (let i = 1; i < rows.length; i++) {
    users.push({
      id: rows[i][0],
      username: rows[i][1],
      email: rows[i][2],
      role: rows[i][4],
      name: rows[i][5],
      status: rows[i][6],
      createdAt: rows[i][7],
      lastLogin: rows[i][8]
    });
  }

  return createResponse({
    success: true,
    total: users.length,
    users: users
  });
}

/**
 * Helper to build JSON ContentOutput
 */
function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
