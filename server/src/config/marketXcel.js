module.exports = {
  baseUrl: process.env.MARKETXCEL_BASE_URL || 'https://api.marketxcel.co.in',
  crmBaseUrl: process.env.MARKETXCEL_CRM_URL || 'https://crm.marketxcel.co.in',
  defaultSupplierId: process.env.MARKETXCEL_SUPPLIER_ID || '7353212849',
  defaultToken: process.env.MARKETXCEL_TOKEN || 'mx_token_secure_demo',
  defaultSecretKey: process.env.MARKETXCEL_SECRET_KEY || 'mx_secret_sha3_key_2026',
  endpoints: {
    projects: '/webservices/supplier/send_supplier_data',
    country: '/webservices/supplier/get_master_data/country',
    language: '/webservices/supplier/get_master_data/language',
    question: '/webservices/supplier/get_master_data/question',
    s2sCallback: '/webservices/callback/updateRespondentStatus',
  },
  timeout: 10000,
};
