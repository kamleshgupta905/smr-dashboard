const mongoose = require('mongoose');

const securityPolicySchema = new mongoose.Schema({
  policyName: { type: String, default: 'Default Enterprise Policy' },
  // Pre Screen & Thanks URL
  preScreenEnabled: { type: Boolean, default: true },
  dynamicThanksUrl: { type: Boolean, default: true },

  // Set-up Fraud Screening
  excludeDuplicates: { type: Boolean, default: true },
  geoLocationValidation: { type: Boolean, default: true },
  uniqueIpLimit: { type: Number, default: 1 },
  speederCheck: { type: Boolean, default: true },
  speederThresholdPercent: { type: Number, default: 0.3 },
  lhProtection: { type: Boolean, default: true },
  excludeGroup: { type: Boolean, default: false },

  // Security / Fraud Cops Suite
  fraudCops: { type: Boolean, default: true },
  browserSecurity: { type: Boolean, default: true },
  vpnDetection: { type: Boolean, default: true },
  botProtection: { type: Boolean, default: true },
  verifyEmail: { type: Boolean, default: true },
  rocSecurity: { type: Boolean, default: false },
  motionDetection: { type: Boolean, default: false },
  textAnalyzer: { type: Boolean, default: true },
  offLocationHour: { type: Boolean, default: false },

  // Device Filter
  allowDesktop: { type: Boolean, default: true },
  allowMobile: { type: Boolean, default: true },
  allowTablet: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SecurityPolicy', securityPolicySchema);
