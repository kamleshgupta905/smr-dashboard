const mongoose = require('mongoose');
const Client = require('../models/Client');
const marketXcelService = require('../services/marketXcelService');
const zampliaService = require('../services/zampliaService');
const S2sService = require('../services/s2sService');
const HashingService = require('../services/hashingService');

// In-memory fallback default clients
let inMemoryClients = [
  {
    _id: 'cl_zamplia_01',
    id: 1,
    client_name: 'Zamplia Market Research (Demand)',
    client_code: 'ZAMP_GLOBAL',
    country: 'United States',
    currency: 'USD',
    apiType: 'zamplia',
    apiUrl: 'https://developer.zamplia.com/docs/category/supply-api',
    supplierId: 'ZAMP-SUP-2026',
    apiToken: 'ZAMP-SECURE-KEY',
    hashAlgorithm: 'hmac-sha256',
    secretKey: 'zamplia_hmac_secret_production',
    s2sEnabled: true,
    s2sEndpoint: 'https://api.zamplia.com/api/v1/callbacks/status',
    redirectUrls: {
      complete: 'http://localhost:5000/redirects/c/ZAMP_GLOBAL/complete?rid=[identifier]&hash=[hash]',
      terminate: 'http://localhost:5000/redirects/c/ZAMP_GLOBAL/terminate?rid=[identifier]&hash=[hash]',
      overquota: 'http://localhost:5000/redirects/c/ZAMP_GLOBAL/quotafull?rid=[identifier]&hash=[hash]',
      qualityTerminate: 'http://localhost:5000/redirects/c/ZAMP_GLOBAL/quality_terminate?rid=[identifier]&hash=[hash]',
    },
    is_active: 'Y',
    totalCompletes: 1420,
    totalRevenue: 4970.00,
  },
  {
    _id: 'cl_marketxcel_02',
    id: 2,
    client_name: 'Market Xcel Data Matrix Pvt Ltd',
    client_code: 'MX_DEMAND',
    country: 'India',
    currency: 'USD',
    apiType: 'marketxcel',
    apiUrl: 'https://api.marketxcel.co.in/webservices/supplier/send_supplier_data',
    supplierId: '7353212849',
    apiToken: 'mx_token_live_2026',
    hashAlgorithm: 'sha3-256',
    secretKey: 'mx_secret_sha3_key_2026',
    s2sEnabled: true,
    s2sEndpoint: 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus',
    redirectUrls: {
      complete: 'http://localhost:5000/redirects/c/MX_DEMAND/complete?rid=[identifier]&hash=[hash]',
      terminate: 'http://localhost:5000/redirects/c/MX_DEMAND/terminate?rid=[identifier]&hash=[hash]',
      overquota: 'http://localhost:5000/redirects/c/MX_DEMAND/quotafull?rid=[identifier]&hash=[hash]',
      qualityTerminate: 'http://localhost:5000/redirects/c/MX_DEMAND/quality_terminate?rid=[identifier]&hash=[hash]',
    },
    is_active: 'Y',
    totalCompletes: 856,
    totalRevenue: 2890.50,
  },
  {
    _id: 'cl_german_03',
    id: 3,
    client_name: 'German Automotive Insights GmbH',
    client_code: 'DE_AUTO_GMBH',
    country: 'Germany',
    currency: 'EUR',
    apiType: 'custom',
    apiUrl: 'https://api.insights-munich.de/v2/demand/projects',
    supplierId: 'DE-PARTNER-771',
    apiToken: 'de_bearer_munich_spec',
    hashAlgorithm: 'sha3-256',
    secretKey: 'german_sha3_secret_token_99',
    s2sEnabled: true,
    s2sEndpoint: 'https://api.insights-munich.de/v2/s2s/updateStatus',
    redirectUrls: {
      complete: 'http://localhost:5000/redirects/c/DE_AUTO_GMBH/complete?rid=[identifier]&hash=[hash]',
      terminate: 'http://localhost:5000/redirects/c/DE_AUTO_GMBH/terminate?rid=[identifier]&hash=[hash]',
      overquota: 'http://localhost:5000/redirects/c/DE_AUTO_GMBH/quotafull?rid=[identifier]&hash=[hash]',
      qualityTerminate: 'http://localhost:5000/redirects/c/DE_AUTO_GMBH/quality_terminate?rid=[identifier]&hash=[hash]',
    },
    is_active: 'Y',
    totalCompletes: 512,
    totalRevenue: 3328.00,
  }
];

function generateRedirectUrls(clientCode, domain = 'http://localhost:5000') {
  return {
    complete: `${domain}/redirects/c/${clientCode}/complete?rid=[identifier]&hash=[hash]`,
    terminate: `${domain}/redirects/c/${clientCode}/terminate?rid=[identifier]&hash=[hash]`,
    overquota: `${domain}/redirects/c/${clientCode}/quotafull?rid=[identifier]&hash=[hash]`,
    qualityTerminate: `${domain}/redirects/c/${clientCode}/quality_terminate?rid=[identifier]&hash=[hash]`,
  };
}

exports.getClients = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbClients = await Client.find().sort({ createdAt: -1 });
      if (dbClients && dbClients.length > 0) {
        return res.json({ success: true, data: dbClients });
      }
    }
    return res.json({ success: true, data: inMemoryClients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const {
      client_name,
      client_code = `CL_${Date.now().toString().slice(-4)}`,
      country = 'United States',
      currency = 'USD',
      apiType = 'custom',
      apiUrl = '',
      supplierId = '',
      apiToken = '',
      hashAlgorithm = 'sha3-256',
      secretKey = `sec_${Date.now()}`,
      s2sEnabled = true,
      s2sEndpoint = '',
    } = req.body;

    const redirectUrls = generateRedirectUrls(client_code);

    const clientData = {
      client_name,
      client_code,
      country,
      currency,
      apiType,
      apiUrl,
      supplierId,
      apiToken,
      hashAlgorithm,
      secretKey,
      s2sEnabled,
      s2sEndpoint,
      redirectUrls,
      is_active: 'Y',
    };

    if (mongoose.connection.readyState === 1) {
      const created = await Client.create(clientData);
      return res.status(201).json({ success: true, data: created });
    }

    const newClient = { ...clientData, _id: `cl_${Date.now()}`, id: inMemoryClients.length + 1 };
    inMemoryClients.unshift(newClient);
    return res.status(201).json({ success: true, data: newClient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await Client.findByIdAndDelete(id);
    }
    inMemoryClients = inMemoryClients.filter(c => c._id !== id && c.id != id);
    return res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Sync Projects for a specific client
exports.syncClientInventory = async (req, res) => {
  try {
    const { clientCode } = req.params;
    if (clientCode === 'MX_DEMAND' || clientCode?.includes('MX')) {
      const result = await marketXcelService.getAllocatedProjects();
      return res.json({ success: true, client: 'Market Xcel', count: result.data.length, data: result.data });
    } else {
      const result = await zampliaService.getAllocatedSurveys();
      return res.json({ success: true, client: 'Zamplia', count: result.data?.length || 0, data: result.data || [] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Test S2S Webhook Dispatcher live
exports.testS2sCallback = async (req, res) => {
  try {
    const { clientCode = 'MX_DEMAND', respondentId = `TEST_${Date.now()}`, status = 1 } = req.body;
    const result = await S2sService.sendMarketXcelStatus({ respondentId, status });
    return res.json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Test SHA3-256 Hashing live
exports.testHashing = async (req, res) => {
  try {
    const { baseUrl, secretKey, algorithm = 'sha3-256' } = req.body;
    const testUrl = baseUrl || 'https://cluster.marketxcel.co.in/survey/thankyou?auth=1&uid=DEMO_USER_99';
    const testKey = secretKey || 'mx_secret_sha3_key_2026';

    if (algorithm === 'sha3-256') {
      const { hash, finalUrl } = HashingService.generateSha3Hash(testUrl, testKey);
      return res.json({ success: true, algorithm: 'SHA3-256', hash, finalUrl });
    } else {
      const hash = HashingService.signHmacSha256(testUrl, testKey);
      const sep = testUrl.includes('?') ? '&' : '?';
      return res.json({ success: true, algorithm: 'HMAC-SHA256', hash, finalUrl: `${testUrl}${sep}hash=${hash}` });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
