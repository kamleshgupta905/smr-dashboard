const axios = require('axios');

/**
 * Service to handle authentication with Google Sheet via Google Apps Script Web App
 */
class GoogleSheetAuthService {
  constructor() {
    this.scriptUrl = process.env.GOOGLE_SHEET_AUTH_URL || '';
  }

  getScriptUrl() {
    return process.env.GOOGLE_SHEET_AUTH_URL || this.scriptUrl;
  }

  /**
   * Authenticate credentials against Google Sheet
   * @param {string} identifier - Username or Email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, user?: object, message?: string, accessDenied?: boolean}>}
   */
  async authenticate(identifier, password) {
    const url = this.getScriptUrl();

    if (!url) {
      return {
        configured: false,
        success: false,
        message: 'Google Sheet Auth URL is not configured in environment variables.'
      };
    }

    try {
      console.log(`[GoogleSheetAuth] Verifying credentials for "${identifier}" against Google Sheet Web App...`);
      
      const response = await axios.post(
        url,
        {
          action: 'login',
          identifier: identifier.trim(),
          password: password.trim()
        },
        {
          timeout: 12000,
          maxRedirects: 5,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const data = response.data;

      if (data && data.success) {
        // Enforce strict Admin-only check
        if (data.user && data.user.role && data.user.role.toLowerCase() === 'admin') {
          console.log(`[GoogleSheetAuth] Admin "${identifier}" verified successfully via Google Sheet!`);
          return {
            configured: true,
            success: true,
            user: data.user,
            message: data.message || 'Authentication successful'
          };
        } else {
          console.warn(`[GoogleSheetAuth] Login rejected: User "${identifier}" has non-admin role: ${data.user?.role}`);
          return {
            configured: true,
            success: false,
            accessDenied: true,
            message: 'Access Denied: Only Admin accounts are authorized to access VMH SMR.'
          };
        }
      }

      return {
        configured: true,
        success: false,
        accessDenied: data.accessDenied || false,
        message: data.message || 'Invalid credentials'
      };

    } catch (error) {
      console.error('[GoogleSheetAuth] Error connecting to Google Apps Script:', error.message);
      return {
        configured: true,
        success: false,
        error: error.message,
        message: 'Failed to communicate with Google Sheet Auth service. ' + (error.code === 'ECONNABORTED' ? 'Request timed out.' : error.message)
      };
    }
  }

  /**
   * Health check / Test Google Sheet connection
   */
  async testConnection(customUrl = null) {
    const url = customUrl || this.getScriptUrl();
    if (!url) return { connected: false, message: 'No Google Sheet URL provided' };

    try {
      const response = await axios.get(url, { timeout: 8000, maxRedirects: 5 });
      return {
        connected: true,
        data: response.data
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleSheetAuthService();
