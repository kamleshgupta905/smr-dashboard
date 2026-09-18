const crypto = require('crypto');

/**
 * Enterprise Hashing Service
 * Implements:
 * 1. SHA3-256 (Market Xcel official standard per Redirect URL Hashing Guide)
 * 2. HMAC-SHA256 (Zamplia & Industry Standard)
 */
class HashingService {
  /**
   * Market Xcel SHA3-256 Hash Generator
   * Formula: hash = sha3-256(baseUrl + secretKey)
   * Final URL: baseUrl &hash=hash
   * @param {string} baseUrl - Complete redirect URL without the hash parameter
   * @param {string} secretKey - Client's S2S authentication secret token
   * @returns {{ hash: string, finalUrl: string }}
   */
  static generateSha3Hash(baseUrl, secretKey) {
    if (!baseUrl || !secretKey) {
      return { hash: '', finalUrl: baseUrl || '' };
    }

    // Clean URL: remove any trailing &hash= or ?hash= if accidentally present
    const cleanBaseUrl = baseUrl.replace(/([&?])hash=[^&]*/, '').replace(/([&?])$/, '');
    
    // Compute SHA3-256 digest
    const hash = crypto.createHash('sha3-256').update(cleanBaseUrl + secretKey).digest('hex');
    
    // Append hash as the last parameter
    const sep = cleanBaseUrl.includes('?') ? '&' : '?';
    const finalUrl = `${cleanBaseUrl}${sep}hash=${hash}`;

    return { hash, finalUrl };
  }

  /**
   * Verify an incoming redirect URL against its SHA3-256 hash
   * @param {string} fullUrlWithHash 
   * @param {string} secretKey 
   * @returns {boolean}
   */
  static verifySha3Hash(fullUrlWithHash, secretKey) {
    try {
      const urlObj = new URL(fullUrlWithHash);
      const incomingHash = urlObj.searchParams.get('hash');
      if (!incomingHash) return false;

      // Reconstruct base URL without hash parameter
      urlObj.searchParams.delete('hash');
      const reconstructedBaseUrl = urlObj.toString();

      const expectedHash = crypto.createHash('sha3-256').update(reconstructedBaseUrl + secretKey).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(expectedHash));
    } catch {
      return false;
    }
  }

  /**
   * HMAC-SHA256 Signature Generator (Zamplia / Custom)
   * @param {string} data 
   * @param {string} secretKey 
   * @returns {string}
   */
  static signHmacSha256(data, secretKey) {
    if (!data || !secretKey) return '';
    return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
  }

  /**
   * Verify HMAC-SHA256 signature with timing-safe comparison
   * @param {string} data 
   * @param {string} signature 
   * @param {string} secretKey 
   * @returns {boolean}
   */
  static verifyHmacSha256(data, signature, secretKey) {
    try {
      const expected = this.signHmacSha256(data, secretKey);
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }
}

module.exports = HashingService;
