const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  client_name: { type: String, required: true },
  client_code: { type: String, unique: true, index: true },
  country: { type: String, default: 'United States' },
  currency: { type: String, default: 'USD' },
  apiType: { 
    type: String, 
    enum: ['marketxcel', 'zamplia', 'custom'], 
    default: 'custom' 
  },
  apiUrl: { type: String, default: '' },
  supplierId: { type: String, default: '' },
  apiToken: { type: String, default: '' },
  
  // Security & Hashing specification (SHA3-256 vs HMAC-SHA256)
  hashAlgorithm: { 
    type: String, 
    enum: ['sha3-256', 'hmac-sha256', 'none'], 
    default: 'sha3-256' 
  },
  secretKey: { type: String, default: 'mx_secret_demo_key_2026' },

  // Server-to-Server (S2S) Callback Settings
  s2sEnabled: { type: Boolean, default: true },
  s2sEndpoint: { type: String, default: 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus' },
  s2sApiKey: { type: String, default: '' },

  // Our platform redirect URLs provided to this client
  redirectUrls: {
    complete: { type: String, default: '' },
    terminate: { type: String, default: '' },
    overquota: { type: String, default: '' },
    qualityTerminate: { type: String, default: '' },
  },

  is_active: { type: String, default: 'Y' },
  totalCompletes: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
