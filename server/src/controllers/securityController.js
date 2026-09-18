const mongoose = require('mongoose');
const SecurityPolicy = require('../models/SecurityPolicy');
const FraudService = require('../services/fraudService');

let defaultPolicy = {
  policyName: 'Global Enterprise Fraud Policy',
  preScreenEnabled: true,
  dynamicThanksUrl: true,
  excludeDuplicates: true,
  geoLocationValidation: true,
  uniqueIpLimit: 1,
  speederCheck: true,
  speederThresholdPercent: 0.3,
  lhProtection: true,
  excludeGroup: false,
  fraudCops: true,
  browserSecurity: true,
  vpnDetection: true,
  botProtection: true,
  verifyEmail: true,
  rocSecurity: false,
  motionDetection: false,
  textAnalyzer: true,
  offLocationHour: false,
  allowDesktop: true,
  allowMobile: true,
  allowTablet: true,
};

exports.getSecurityPolicy = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let policy = await SecurityPolicy.findOne();
      if (!policy) {
        policy = await SecurityPolicy.create(defaultPolicy);
      }
      return res.json({ success: true, data: policy });
    }
    return res.json({ success: true, data: defaultPolicy });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSecurityPolicy = async (req, res) => {
  try {
    const updates = req.body;
    if (mongoose.connection.readyState === 1) {
      const updated = await SecurityPolicy.findOneAndUpdate({}, updates, { new: true, upsert: true });
      return res.json({ success: true, data: updated, message: 'Security policy updated successfully.' });
    }
    defaultPolicy = { ...defaultPolicy, ...updates };
    return res.json({ success: true, data: defaultPolicy, message: 'Security policy updated in-memory.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.simulateTrafficCheck = async (req, res) => {
  try {
    const { userAgent, allowedDevices, elapsedSeconds, loi = 10 } = req.body;
    const preResult = FraudService.evaluatePreClick({ userAgent, allowedDevices }, defaultPolicy);
    const postResult = FraudService.evaluatePostComplete({
      clickTime: new Date(Date.now() - (elapsedSeconds || 120) * 1000),
      completionTime: new Date(),
      loi,
    }, defaultPolicy);

    return res.json({
      success: true,
      preClickEvaluation: preResult,
      postCompleteEvaluation: postResult,
      finalRecommendation: preResult.passed && postResult.passed ? 'ALLOW_AND_PAY' : 'BLOCK_FRAUD',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
