const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../token.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

class GoogleSheetsDirectService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1OhGxwGQGy3FmDFre1F5YcA_pcHxFOtfSTzm7ZEALDXE';
    this.oauth2Client = null;
    this.sheets = null;
    this.initOAuth();
  }

  initOAuth() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.warn('[GoogleSheetsDirect] credentials.json not found in server root.');
      return false;
    }

    try {
      const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
      const config = creds.installed || creds.web;
      
      if (!config) {
        console.error('[GoogleSheetsDirect] Invalid credentials.json format.');
        return false;
      }

      // Default redirect to backend callback on port 5000
      const redirectUri = 'http://localhost:5000/api/auth/google/callback';

      this.oauth2Client = new google.auth.OAuth2(
        config.client_id,
        config.client_secret,
        redirectUri
      );

      // Check if token.json exists
      if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        this.oauth2Client.setCredentials(token);
        this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
        console.log('[GoogleSheetsDirect] Google Sheets API initialized with saved token.json.');
        return true;
      } else {
        console.log('[GoogleSheetsDirect] token.json not found. One-time OAuth authorization required.');
        return false;
      }
    } catch (err) {
      console.error('[GoogleSheetsDirect] Error initializing OAuth2 client:', err.message);
      return false;
    }
  }

  isAuthorized() {
    return !!(this.sheets && fs.existsSync(TOKEN_PATH));
  }

  getAuthUrl() {
    if (!this.oauth2Client) {
      this.initOAuth();
    }
    if (!this.oauth2Client) {
      throw new Error('OAuth2 Client not initialized. Please ensure credentials.json exists.');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES
    });
  }

  async handleCallback(code) {
    if (!this.oauth2Client) {
      this.initOAuth();
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf8');
    this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

    console.log('[GoogleSheetsDirect] token.json saved successfully!');
    
    // Auto-setup Admins sheet tab
    await this.ensureSheetSetup();

    return true;
  }

  /**
   * Ensure 'Admins' sheet tab exists with headers and Super Admin
   */
  async ensureSheetSetup() {
    if (!this.sheets) return;

    try {
      // 1. Get spreadsheet metadata to check existing sheet names
      const meta = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      const sheetsList = meta.data.sheets || [];
      const hasAdminsSheet = sheetsList.some(s => s.properties.title === 'Admins');

      if (!hasAdminsSheet) {
        console.log('[GoogleSheetsDirect] Creating "Admins" tab in spreadsheet...');
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: 'Admins',
                    gridProperties: {
                      rowCount: 100,
                      columnCount: 10
                    }
                  }
                }
              }
            ]
          }
        });
      }

      // 2. Check if headers exist
      const valuesRes = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Admins!A1:I2'
      });

      const rows = valuesRes.data.values || [];
      if (rows.length === 0) {
        console.log('[GoogleSheetsDirect] Writing headers and default Super Admin to "Admins" tab...');
        const headers = ['ID', 'Username', 'Email', 'Password', 'Role', 'Name', 'Status', 'CreatedAt', 'LastLogin'];
        const defaultAdmin = [
          'adm_1001',
          'Vmhgroup',
          'admin@vmhgroupsmr.com',
          'Jelly',
          'admin',
          'VMH Super Admin',
          'Active',
          new Date().toISOString(),
          ''
        ];

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Admins!A1:I2',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers, defaultAdmin]
          }
        });
      }

      console.log('[GoogleSheetsDirect] Admins tab verified and ready.');
    } catch (err) {
      console.error('[GoogleSheetsDirect] Error ensuring sheet setup:', err.message);
    }
  }

  /**
   * Authenticate admin user against Google Sheet directly
   */
  async authenticate(identifier, password) {
    if (!this.isAuthorized()) {
      return {
        configured: false,
        authorized: false,
        message: 'Google Sheets OAuth authorization is pending. Visit /api/auth/google/authorize to connect.'
      };
    }

    try {
      await this.ensureSheetSetup();

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Admins!A1:I1000'
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) {
        return { success: false, message: 'No users found in Google Sheet.' };
      }

      const idLower = identifier.trim().toLowerCase();
      const passClean = password.trim();

      // [0:ID, 1:Username, 2:Email, 3:Password, 4:Role, 5:Name, 6:Status, 7:CreatedAt, 8:LastLogin]
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const uName = String(row[1] || '').trim().toLowerCase();
        const uEmail = String(row[2] || '').trim().toLowerCase();
        const uPass = String(row[3] || '').trim();
        const uRole = String(row[4] || '').trim().toLowerCase();
        const uStatus = String(row[6] || '').trim().toLowerCase();

        if (uName === idLower || uEmail === idLower) {
          // Check password
          if (uPass !== passClean) {
            return { success: false, message: 'Invalid password. Please check your credentials.' };
          }

          // STRICT ADMIN-ONLY SECURITY RULE
          if (uRole !== 'admin') {
            return {
              success: false,
              accessDenied: true,
              message: `Access Denied: Only Admin accounts are authorized to log in. Your role is: ${row[4] || 'user'}`
            };
          }

          // Status check
          if (uStatus !== 'active') {
            return {
              success: false,
              message: 'Account is deactivated. Please contact VMH Super Admin.'
            };
          }

          // Update LastLogin in column 9 (I)
          try {
            const rowIndex = i + 1;
            await this.sheets.spreadsheets.values.update({
              spreadsheetId: this.spreadsheetId,
              range: `Admins!I${rowIndex}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: {
                values: [[new Date().toISOString()]]
              }
            });
          } catch (tErr) {
            // Non-critical
          }

          return {
            success: true,
            user: {
              id: row[0],
              username: row[1],
              email: row[2],
              role: 'admin',
              name: row[5] || row[1],
              status: row[6]
            }
          };
        }
      }

      return { success: false, message: 'User not found in Google Sheet.' };
    } catch (err) {
      console.error('[GoogleSheetsDirect] Authentication error:', err.message);
      return { success: false, error: err.message, message: 'Google Sheets API error: ' + err.message };
    }
  }

  /**
   * Read all users from the Admins sheet tab
   */
  async listUsers() {
    if (!this.isAuthorized()) return [];

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Admins!A2:I1000'
      });

      const rows = response.data.values || [];
      return rows.map(r => ({
        id: r[0],
        username: r[1],
        email: r[2],
        role: r[4],
        name: r[5],
        status: r[6],
        createdAt: r[7],
        lastLogin: r[8]
      }));
    } catch (err) {
      console.error('[GoogleSheetsDirect] Error listing users:', err.message);
      return [];
    }
  }
}

module.exports = new GoogleSheetsDirectService();
