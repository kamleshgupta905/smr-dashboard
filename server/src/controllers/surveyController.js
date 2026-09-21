const mongoose = require('mongoose');
const zampliaService = require('../services/zampliaService');
const marketXcelService = require('../services/marketXcelService');
const ApiSurvey = require('../models/ApiSurvey');
const VendorEntryLink = require('../models/VendorEntryLink');

// In-memory cache fallback for when MongoDB is not running
let lastCachedSurveys = [];

// Get All Allocated Surveys (supporting Zamplia, Market Xcel, and Multi-channel)
exports.getSurveys = async (req, res) => {
  try {
    const tab = req.query.tab || 'allocated';
    const sourceFilter = req.query.source || 'all';

    if (tab === 'top_picks') {
      const topPicksRes = await zampliaService.getTopPickSurveys();
      return res.json({ success: true, data: topPicksRes.data || [] });
    }

    // Fetch Market Xcel Projects
    let mxSurveys = [];
    let mxRes = null;
    try {
      mxRes = await marketXcelService.getAllocatedProjects();
      if (mxRes.success && Array.isArray(mxRes.data)) {
        mxSurveys = mxRes.data.map(p => ({
          ...p,
          client: 'Market Xcel',
          clientCode: 'MX_DEMAND',
          cpi: parseFloat(p.cost_per_interview || p.cpi || 2.70),
          loi: parseInt(p.length_of_interview || p.loi || 10, 10),
          ir: parseInt(p.incidence_rate || p.ir || 90, 10),
          country: p.survey_country || 'United States',
          status: p.survey_status || 'Live',
        }));
      }
    } catch (e) {
      console.warn('Market Xcel fetch error:', e.message);
    }

    if (sourceFilter === 'marketxcel') {
      return res.json({ success: true, data: mxSurveys, source: 'marketxcel' });
    }

    // Try live Zamplia API
    const apiRes = await zampliaService.getAllocatedSurveys();
    let zampliaSurveys = [];
    const zampliaLive = apiRes.success && apiRes.source === 'live_zamplia_api';
    if (apiRes.success && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      zampliaSurveys = apiRes.data.map(s => ({
        ...s,
        client: 'Zamplia',
        clientCode: 'ZAMP_GLOBAL',
        device_type: s.device_type || 'Desktop,Mobile,Tablet',
      }));
      lastCachedSurveys = zampliaSurveys;
      if (mongoose.connection.readyState === 1) {
        zampliaService.syncSurveysToDb().catch(console.error);
      }
    } else if (lastCachedSurveys.length > 0) {
      zampliaSurveys = lastCachedSurveys;
    }

    if (sourceFilter === 'zamplia') {
      return res.json({ success: true, data: zampliaSurveys, source: 'zamplia' });
    }

    // Combined multi-client inventory
    const combined = [...mxSurveys, ...zampliaSurveys];
    return res.json({
      success: true,
      data: combined,
      source: 'multi_client_marketplace',
      // Explicit data-provenance flags so the UI can show a "Live" vs "Demo data" badge
      dataSources: {
        zamplia: zampliaLive ? 'live' : 'simulated',
        marketXcel: (mxRes && mxRes.source === 'live_marketxcel_api') ? 'live' : 'simulated',
      },
      simulated: !zampliaLive,
      total: combined.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Sync Surveys with Zamplia
exports.syncSurveys = async (req, res) => {
  try {
    const result = await zampliaService.syncSurveysToDb();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Top Pick Surveys
exports.getTopPicks = async (req, res) => {
  try {
    const result = await zampliaService.getTopPickSurveys();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Survey Details
exports.getSurveyDetails = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const [details, quals, quotas, stats] = await Promise.all([
      zampliaService.getSurveyById(surveyId),
      zampliaService.getSurveyQualifications(surveyId),
      zampliaService.getSurveyQuotas(surveyId),
      zampliaService.getSurveyGlobalStats(surveyId),
    ]);

    return res.json({
      success: true,
      data: {
        survey: details.data?.[0] || details.data || null,
        qualifications: quals.data || [],
        quotas: quotas.data || [],
        stats: stats.data?.[0] || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Qualifications Modal
exports.getQualifications = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const result = await zampliaService.getSurveyQualifications(surveyId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Quotas Modal
exports.getQuotas = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const result = await zampliaService.getSurveyQuotas(surveyId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Global Stats
exports.getGlobalStats = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const result = await zampliaService.getSurveyGlobalStats(surveyId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Generate Link for Vendor
exports.generateLink = async (req, res) => {
  try {
    const { surveyId, vendorId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const transactionId = vendorId || `txn_${Date.now()}`;

    const linkResult = await zampliaService.generateLink(surveyId, ipAddress, transactionId);

    if (linkResult.success && linkResult.data?.[0]?.LiveLink) {
      const liveLink = linkResult.data[0].LiveLink;
      const signedLink = linkResult.data[0].SignedLiveLink || liveLink;

      if (mongoose.connection.readyState === 1) {
        await VendorEntryLink.findOneAndUpdate(
          { vendorId: String(vendorId), projectId: String(surveyId) },
          { entryLink: liveLink, liveUrl: liveLink, signedLiveLink: signedLink },
          { upsert: true, new: true }
        ).catch(console.error);
      }

      return res.json({
        success: true,
        liveLink,
        signedLiveLink: signedLink,
        message: 'Vendor entry link generated successfully.',
      });
    }

    return res.status(400).json({
      success: false,
      message: linkResult.message || 'Failed to generate link from Zamplia.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Reconciliation
exports.getReconciliation = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const result = await zampliaService.getReconciliation(startDate, endDate, status);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Reference Data (Languages, Demographics, Industry, Blocked IPs, Survey Groups, Categories)
exports.getReferenceData = async (req, res) => {
  try {
    const zampliaDemandService = require('../services/zampliaDemandService');
    const [languages, industries, surveyTypes, blockedIps, demographics, surveyGroups, categories] = await Promise.all([
      zampliaService.getLanguages(),
      zampliaService.getIndustry(),
      zampliaService.getSurveyTypes(),
      zampliaService.getBlockedIps(),
      zampliaService.getDemographics(),
      zampliaService.getSurveyGroups(),
      zampliaDemandService.getCategory(),
    ]);

    const defaultLanguages = [
      { LanguageId: 1, LanguageCode: 'en-US', Name: 'English (United States)', NativeName: 'English' },
      { LanguageId: 2, LanguageCode: 'en-GB', Name: 'English (United Kingdom)', NativeName: 'English' },
      { LanguageId: 3, LanguageCode: 'en-CA', Name: 'English (Canada)', NativeName: 'English' },
      { LanguageId: 4, LanguageCode: 'en-AU', Name: 'English (Australia)', NativeName: 'English' },
      { LanguageId: 5, LanguageCode: 'es-ES', Name: 'Spanish (Spain)', NativeName: 'Español' },
      { LanguageId: 6, LanguageCode: 'es-US', Name: 'Spanish (United States)', NativeName: 'Español' },
      { LanguageId: 7, LanguageCode: 'fr-FR', Name: 'French (France)', NativeName: 'Français' },
      { LanguageId: 8, LanguageCode: 'de-DE', Name: 'German (Germany)', NativeName: 'Deutsch' },
      { LanguageId: 9, LanguageCode: 'it-IT', Name: 'Italian (Italy)', NativeName: 'Italiano' },
      { LanguageId: 10, LanguageCode: 'hi-IN', Name: 'Hindi (India)', NativeName: 'हिन्दी' },
      { LanguageId: 11, LanguageCode: 'ja-JP', Name: 'Japanese (Japan)', NativeName: '日本語' },
      { LanguageId: 12, LanguageCode: 'pt-BR', Name: 'Portuguese (Brazil)', NativeName: 'Português' },
    ];

    const defaultIndustries = [
      { IndustryId: 1, Name: 'Technology & Software', Code: 'TECH' },
      { IndustryId: 2, Name: 'Healthcare & Pharmaceuticals', Code: 'HEALTH' },
      { IndustryId: 3, Name: 'Banking & Financial Services', Code: 'FIN' },
      { IndustryId: 4, Name: 'Retail & Consumer Goods (FMCG)', Code: 'RETAIL' },
      { IndustryId: 5, Name: 'Automotive & Transportation', Code: 'AUTO' },
      { IndustryId: 6, Name: 'Telecommunications', Code: 'TELCO' },
      { IndustryId: 7, Name: 'Media & Entertainment', Code: 'MEDIA' },
      { IndustryId: 8, Name: 'Education & Academic Research', Code: 'EDU' },
      { IndustryId: 9, Name: 'Hospitality, Travel & Tourism', Code: 'TRAVEL' },
      { IndustryId: 10, Name: 'Manufacturing & Industrial', Code: 'MFG' },
    ];

    const defaultSurveyTypes = [
      { SurveyTypeId: 1, Name: 'Standard Consumer Panel', Description: 'General population consumer opinion research' },
      { SurveyTypeId: 2, Name: 'B2B / Professional', Description: 'Business decision makers and enterprise professionals' },
      { SurveyTypeId: 3, Name: 'Healthcare Professionals (HCP)', Description: 'Licensed doctors, nurses, and medical specialists' },
      { SurveyTypeId: 4, Name: 'Product Concept & Packaging', Description: 'Product usability, taste-test, or feature feedback' },
      { SurveyTypeId: 5, Name: 'Brand Health & Advertising Recall', Description: 'Campaign measurement and brand sentiment' },
    ];

    return res.json({
      success: true,
      data: {
        languages: (languages.data && languages.data.length > 0) ? languages.data : defaultLanguages,
        industries: (industries.data && industries.data.length > 0) ? industries.data : defaultIndustries,
        surveyTypes: (surveyTypes.data && surveyTypes.data.length > 0) ? surveyTypes.data : defaultSurveyTypes,
        blockedIps: blockedIps.data || [],
        demographics: demographics.data || [],
        surveyGroups: surveyGroups.data || [],
        categories: categories.data || [],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
