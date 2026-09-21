require('dotenv').config();

const useSandbox = process.env.ZAMPLIA_USE_SANDBOX === 'true';

const SANDBOX_FALLBACK_KEY = 's5YnczOM9ahIKuSdwzKvPyTlBUvBLfqG';
const PRODUCTION_FALLBACK_KEY = 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u';

const sandboxKey = process.env.ZAMPLIA_SANDBOX_API_KEY || SANDBOX_FALLBACK_KEY;
const productionKey = process.env.ZAMPLIA_API_KEY || PRODUCTION_FALLBACK_KEY;
const apiKey = useSandbox ? sandboxKey : productionKey;

module.exports = {
  useSandbox,
  baseUrl: useSandbox
    ? (process.env.ZAMPLIA_SANDBOX_BASE_URL || 'https://surveysupplysandbox.zamplia.com/api/v1')
    : (process.env.ZAMPLIA_BASE_URL || 'https://surveysupply.zamplia.com/api/v1'),
  apiKey,
  // True when the built-in demo key is in use instead of an env-provided key.
  // Surfaced via /api/status so operators can tell whether the real key is loaded.
  usingFallbackKey: useSandbox
    ? !process.env.ZAMPLIA_SANDBOX_API_KEY
    : !process.env.ZAMPLIA_API_KEY,
  hmacSecret: process.env.ZAMPLIA_HMAC_SECRET || '',
  timeout: 30000,
};
