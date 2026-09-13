require('dotenv').config();

const useSandbox = process.env.ZAMPLIA_USE_SANDBOX === 'true';

module.exports = {
  useSandbox,
  baseUrl: useSandbox
    ? (process.env.ZAMPLIA_SANDBOX_BASE_URL || 'https://surveysupplysandbox.zamplia.com/api/v1')
    : (process.env.ZAMPLIA_BASE_URL || 'https://surveysupply.zamplia.com/api/v1'),
  apiKey: useSandbox
    ? (process.env.ZAMPLIA_SANDBOX_API_KEY || 's5YnczOM9ahIKuSdwzKvPyTlBUvBLfqG')
    : (process.env.ZAMPLIA_API_KEY || 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u'),
  hmacSecret: process.env.ZAMPLIA_HMAC_SECRET || '',
  timeout: 30000,
};
