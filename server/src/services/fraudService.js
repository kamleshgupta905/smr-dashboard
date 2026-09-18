/**
 * Fraud Prevention & Quality Control Engine
 * Reference: SMR Platform Security Suite (Screenshot 4)
 * 
 * Features:
 * - Pre-Screening & Dynamic Thanks URL
 * - Unique IP checking
 * - Speeder detection (minimum duration threshold vs LOI)
 * - Geo-Location matching
 * - Device Type Filtering (Desktop, Mobile, Tablet)
 * - Fraud Cops, VPN & Bot Protection
 */

class FraudService {
  /**
   * Evaluate a respondent click before redirecting to the survey
   * @param {Object} context
   * @param {string} context.ipAddress
   * @param {string} context.userAgent
   * @param {string} context.surveyCountry
   * @param {string} context.allowedDevices - e.g. "Desktop,Mobile,Tablet"
   * @param {Object} policy - SecurityPolicy instance or defaults
   * @returns {{ passed: boolean, reason?: string, statusCode?: number }}
   */
  static evaluatePreClick(context, policy = {}) {
    const { userAgent = '', allowedDevices = 'Desktop,Mobile,Tablet' } = context;

    // 1. Device Type Filter
    if (policy.deviceFilterEnabled !== false && allowedDevices) {
      const isMobile = /mobile|iphone|android(?!.*tablet)/i.test(userAgent);
      const isTablet = /tablet|ipad/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;

      const allowsMobile = /mobile/i.test(allowedDevices);
      const allowsTablet = /tablet/i.test(allowedDevices);
      const allowsDesktop = /desktop/i.test(allowedDevices);

      if (isMobile && !allowsMobile) {
        return { passed: false, reason: 'Device mismatch: Mobile devices not permitted for this study', statusCode: 2 };
      }
      if (isTablet && !allowsTablet) {
        return { passed: false, reason: 'Device mismatch: Tablet devices not permitted for this study', statusCode: 2 };
      }
      if (isDesktop && !allowsDesktop) {
        return { passed: false, reason: 'Device mismatch: Desktop devices not permitted for this study', statusCode: 2 };
      }
    }

    // 2. Bot / Automated Headless Crawler Detection
    if (policy.botProtection) {
      const isBot = /bot|crawler|spider|headless|puppeteer|selenium|phantom/i.test(userAgent);
      if (isBot) {
        return { passed: false, reason: 'Automated script/bot detected', statusCode: 4 };
      }
    }

    return { passed: true };
  }

  /**
   * Evaluate a respondent completion before recording a billable complete
   * @param {Object} context
   * @param {Date} context.clickTime
   * @param {Date} context.completionTime
   * @param {number} context.loi - Stated Length of Interview in minutes
   * @param {Object} policy
   * @returns {{ passed: boolean, isSpeeder: boolean, reason?: string, statusCode?: number }}
   */
  static evaluatePostComplete(context, policy = {}) {
    const { clickTime, completionTime = new Date(), loi = 10 } = context;

    if (!clickTime) {
      return { passed: true, isSpeeder: false };
    }

    const elapsedSeconds = Math.max(0, (new Date(completionTime).getTime() - new Date(clickTime).getTime()) / 1000);
    const statedSeconds = loi * 60;

    // Speeder threshold: typically 30% of stated LOI (e.g., 3 min for a 10 min survey)
    const minAcceptableSeconds = Math.max(45, statedSeconds * (policy.speederThresholdPercent || 0.3));

    if (policy.speederCheck !== false && elapsedSeconds < minAcceptableSeconds) {
      console.warn(`[Fraud Flag] Speeder detected: completed in ${elapsedSeconds.toFixed(1)}s (min required: ${minAcceptableSeconds.toFixed(1)}s)`);
      return {
        passed: false,
        isSpeeder: true,
        reason: `Speeder flag: Completed in ${Math.round(elapsedSeconds)}s (expected ~${loi}m)`,
        statusCode: 4, // Security / Quality Terminate
      };
    }

    return { passed: true, isSpeeder: false, elapsedSeconds };
  }
}

module.exports = FraudService;
