const axios = require('axios');
const mxConfig = require('../config/marketXcel');

/**
 * Server-to-Server (S2S) Real-Time Status Dispatcher
 * Directly notifies Demand Clients (Market Xcel / German Client / Custom)
 * when a respondent finishes or drops a survey.
 * 
 * Status Codes:
 * 1: Complete (Successfully completed survey)
 * 2: Terminate (Screened out / Disqualified)
 * 3: OverQuota (Quota full)
 * 4: Security Terminate (Failed fraud / security checks)
 */
class S2sService {
  /**
   * Dispatch S2S Status Update to Market Xcel
   * @param {Object} options
   * @param {string} options.respondentId
   * @param {number} options.status - 1, 2, 3, or 4
   * @param {string} [options.apiKey]
   * @param {string} [options.endpointUrl]
   * @returns {Promise<{ success: boolean, statusCode?: number, data?: any, message?: string }>}
   */
  static async sendMarketXcelStatus({ respondentId, status, apiKey, endpointUrl }) {
    const url = endpointUrl || `${mxConfig.baseUrl}${mxConfig.endpoints.s2sCallback}`;
    const token = apiKey || mxConfig.defaultToken;

    console.log(`[S2S] Dispatching to Market Xcel: UID=${respondentId}, Status=${status} -> ${url}`);

    try {
      const response = await axios.post(
        url,
        {
          respondentId: String(respondentId),
          status: Number(status),
        },
        {
          headers: {
            'X-Api-Key': token,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      return {
        success: true,
        statusCode: response.status,
        data: response.data,
        message: 'S2S status callback delivered successfully.',
      };
    } catch (error) {
      console.warn(`[S2S Warning] Callback delivery to ${url}: ${error.message}`);
      // Return simulated success in sandbox/demo mode if external server is unreachable
      return {
        success: false,
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || error.message,
        simulated: true,
        details: {
          respondentId,
          status,
          targetUrl: url,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Generic S2S Webhook Dispatcher (for German Client / Custom Buyers)
   * @param {Object} options
   */
  static async dispatchGenericWebhook({ webhookUrl, apiKey, payload }) {
    if (!webhookUrl) return { success: false, message: 'No webhook URL provided' };

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
          'X-Api-Key': apiKey || undefined,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      });

      return {
        success: true,
        statusCode: response.status,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = S2sService;
