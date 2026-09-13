const crypto = require('crypto');
const config = require('../config/zamplia');

class HmacService {
  static generateSignature(params, secret = null) {
    const key = secret || config.hmacSecret;
    if (!key) return '';

    const cleanParams = { ...params };
    delete cleanParams.hash;
    delete cleanParams.signature;
    delete cleanParams.hmac;

    const sortedQuery = Object.keys(cleanParams)
      .sort()
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(cleanParams[k])}`)
      .join('&');

    return crypto.createHmac('sha256', key).update(sortedQuery).digest('hex');
  }

  static verifySignature(params, signature, secret = null) {
    const key = secret || config.hmacSecret;
    if (!key) return true;

    const expected = this.generateSignature(params, key);
    if (!expected || !signature) return false;

    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  static signUrl(url, secret = null) {
    const key = secret || config.hmacSecret;
    if (!key) return url;

    try {
      const parsedUrl = new URL(url);
      const paramsObj = {};
      parsedUrl.searchParams.forEach((val, k) => {
        paramsObj[k] = val;
      });

      const signature = this.generateSignature(paramsObj, key);
      parsedUrl.searchParams.set('hash', signature);
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }
}

module.exports = HmacService;
