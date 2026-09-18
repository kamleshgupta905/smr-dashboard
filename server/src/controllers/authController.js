const User = require('../models/User');
const jwt = require('jsonwebtoken');
const googleSheetAuthService = require('../services/googleSheetAuthService');
const googleSheetsDirectService = require('../services/googleSheetsDirectService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

/**
 * Universal Login:
 * 1. Direct Google Sheets API v4 (using credentials.json / token.json).
 * 2. Google Sheet Apps Script Web App (if GOOGLE_SHEET_AUTH_URL is configured).
 * 3. Default Super Admin Fallback (Vmhgroup / Jelly).
 * 4. Local MongoDB Admin.
 * 
 * STRICT RULE: ONLY users with role === 'admin' can access the platform.
 */
exports.login = async (req, res) => {
  try {
    const identifier = (req.body.username || req.body.email || req.body.identifier || '').trim();
    const password = (req.body.password || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and Password are required.'
      });
    }

    // -------------------------------------------------------------
    // PRIORITY 1: Direct Google Sheets API v4 (via credentials.json)
    // -------------------------------------------------------------
    if (googleSheetsDirectService.isAuthorized()) {
      const directResult = await googleSheetsDirectService.authenticate(identifier, password);

      if (directResult.success) {
        return res.json({
          success: true,
          authSource: 'google_sheets_direct',
          token: generateToken(directResult.user.id || 'gs_' + Date.now()),
          user: {
            id: directResult.user.id,
            name: directResult.user.name || directResult.user.username,
            username: directResult.user.username,
            email: directResult.user.email,
            role: 'admin'
          },
          message: 'Logged in successfully via Google Sheet database (Admin).'
        });
      } else if (directResult.accessDenied) {
        return res.status(403).json({
          success: false,
          accessDenied: true,
          message: directResult.message || 'Access Denied: Only Admin accounts are authorized to log in.'
        });
      } else if (directResult.message && directResult.message.includes('Invalid password')) {
        return res.status(401).json({
          success: false,
          message: directResult.message
        });
      }
    }

    // -------------------------------------------------------------
    // PRIORITY 2: Authenticate via Google Sheet + Apps Script
    // -------------------------------------------------------------
    if (googleSheetAuthService.getScriptUrl()) {
      const sheetResult = await googleSheetAuthService.authenticate(identifier, password);

      if (sheetResult.success) {
        if (sheetResult.user && sheetResult.user.role && sheetResult.user.role.toLowerCase() === 'admin') {
          return res.json({
            success: true,
            authSource: 'google_sheet_webapp',
            token: generateToken(sheetResult.user.id || 'gs_' + Date.now()),
            user: {
              id: sheetResult.user.id,
              name: sheetResult.user.name || sheetResult.user.username,
              username: sheetResult.user.username,
              email: sheetResult.user.email,
              role: 'admin'
            },
            message: 'Logged in successfully via Google Sheet database (Admin).'
          });
        } else {
          return res.status(403).json({
            success: false,
            accessDenied: true,
            message: 'Access Denied: Only Admin accounts are authorized to log in to VMH SMR.'
          });
        }
      } else if (sheetResult.accessDenied) {
        return res.status(403).json({
          success: false,
          accessDenied: true,
          message: sheetResult.message || 'Access Denied: Only Admin accounts are authorized to log in.'
        });
      } else if (!sheetResult.error) {
        return res.status(401).json({
          success: false,
          message: sheetResult.message || 'Invalid username or password in Google Sheet database.'
        });
      }
    }

    // -------------------------------------------------------------
    // PRIORITY 3: Default Super Admin Fallback (Vmhgroup / Jelly)
    // -------------------------------------------------------------
    const isVmhAdmin = identifier.toLowerCase() === 'vmhgroup' && password === 'Jelly';
    const isSmrAdmin = (identifier.toLowerCase() === 'admin@smr.com' || identifier.toLowerCase() === 'admin') && password === 'admin123';

    if (isVmhAdmin || isSmrAdmin) {
      return res.json({
        success: true,
        authSource: 'system_default',
        token: generateToken('vmh_super_admin'),
        user: {
          id: 'adm_super_01',
          name: 'VMH Super Admin',
          username: 'Vmhgroup',
          email: 'admin@vmhgroupsmr.com',
          role: 'admin'
        },
        message: 'Logged in successfully as Super Admin.'
      });
    }

    // -------------------------------------------------------------
    // PRIORITY 4: Local MongoDB User (if MongoDB is connected)
    // -------------------------------------------------------------
    try {
      const user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { name: identifier }]
      });

      if (user && (await user.matchPassword(password))) {
        if (user.role && user.role.toLowerCase() !== 'admin') {
          return res.status(403).json({
            success: false,
            accessDenied: true,
            message: 'Access Denied: Only Admin accounts are authorized to log in to VMH SMR.'
          });
        }

        user.lastLoginAt = new Date();
        await user.save();

        return res.json({
          success: true,
          authSource: 'mongodb',
          token: generateToken(user._id),
          user: { id: user._id, name: user.name, email: user.email, role: 'admin' }
        });
      }
    } catch (dbErr) {
      // Ignore MongoDB lookup errors if offline
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid username or password. Please verify your admin credentials.'
    });

  } catch (error) {
    console.error('[AuthController] Error in login:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get current session user
 */
exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: 'adm_super_01',
      name: 'VMH Super Admin',
      username: 'Vmhgroup',
      email: 'admin@vmhgroupsmr.com',
      role: 'admin'
    }
  });
};

/**
 * Initiate Google OAuth 1-Click Authorization
 */
exports.googleAuthorize = async (req, res) => {
  try {
    const authUrl = googleSheetsDirectService.getAuthUrl();
    if (req.query.json === 'true') {
      return res.json({ success: true, authUrl });
    }
    return res.redirect(authUrl);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Handle Google OAuth Callback (Captures token and sets up Admins sheet)
 */
exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code || req.body?.code;
    if (!code) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>VMH SMR &bull; Google OAuth Connect</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5fa; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); text-align: center; max-width: 440px; border: 1px solid #e2e8f0; }
            h3 { color: #0f172a; margin: 0 0 10px 0; }
            p { color: #64748b; font-size: 13px; line-height: 1.4; margin-bottom: 16px; }
            input { width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; font-size: 13px; }
            button { width: 100%; padding: 10px; background: #1761fd; color: #ffffff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
            a.auth-btn { display: block; padding: 10px; background: #0c213a; color: #ffffff; border-radius: 4px; text-decoration: none; font-weight: 600; margin-bottom: 16px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h3>Connect Google Sheet</h3>
            <p>Click below to authorize your Google Sheet with 1 click:</p>
            <a href="/api/auth/google/authorize" class="auth-btn">&#128279; Authorize Google Account</a>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">&mdash; OR PASTE CODE MANUALLY &mdash;</div>
            <form method="GET" action="/api/auth/google/callback">
              <input type="text" name="code" placeholder="Paste Google authorization code here..." required />
              <button type="submit">Verify & Save Token</button>
            </form>
          </div>
        </body>
        </html>
      `);
    }

    await googleSheetsDirectService.handleCallback(code);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VMH SMR &bull; Google Sheet Connected</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5fa; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #ffffff; padding: 36px 32px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); text-align: center; max-width: 480px; border: 1px solid #e2e8f0; }
          h2 { color: #0f172a; margin-top: 14px; margin-bottom: 8px; font-size: 20px; }
          p { color: #64748b; font-size: 13.5px; line-height: 1.5; }
          .badge { display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; margin-bottom: 12px; }
          .btn { display: inline-block; background: #1761fd; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">&#10004; GOOGLE SHEETS CONNECTED</span>
          <h2>VMH SMR Database Ready!</h2>
          <p>Your Google Sheet (<strong>Admins</strong> tab) has been initialized with Super Admin credentials. The platform can now directly read and write authentication data.</p>
          <a href="http://localhost:3000" class="btn">Return to SMR Dashboard</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('[AuthController] Error in Google OAuth callback:', err);
    res.status(500).send(`Error connecting Google Sheet: ${err.message}`);
  }
};

/**
 * Health check & Google Sheet Status
 */
exports.getGoogleSheetStatus = async (req, res) => {
  const directAuthorized = googleSheetsDirectService.isAuthorized();
  const webAppUrl = googleSheetAuthService.getScriptUrl();

  return res.json({
    mode: directAuthorized ? 'direct_oauth' : (webAppUrl ? 'apps_script' : 'fallback'),
    directAuthorized,
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '1OhGxwGQGy3FmDFre1F5YcA_pcHxFOtfSTzm7ZEALDXE',
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID || '1OhGxwGQGy3FmDFre1F5YcA_pcHxFOtfSTzm7ZEALDXE'}/edit`,
    webAppConfigured: !!webAppUrl
  });
};
