const zampliaService = require('../services/zampliaService');
const zampliaDemandService = require('../services/zampliaDemandService');
const marketXcelService = require('../services/marketXcelService');
const HashingService = require('../services/hashingService');
const S2sService = require('../services/s2sService');

/**
 * Master API Explorer & Developer Center Controller
 * Complete coverage of:
 * - 16 Zamplia Supply API V2 Endpoints
 * - 15 Zamplia Demand API V2 Endpoints
 * - 6 Market Xcel Demand API Endpoints & Guides
 * Total = 37 Endpoints
 */

// Market Xcel Master Data Endpoints
exports.getMarketXcelCountries = async (req, res) => {
  try {
    const result = await marketXcelService.getMasterCountries(req.headers.token);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMarketXcelLanguages = async (req, res) => {
  try {
    const result = await marketXcelService.getMasterLanguages(req.headers.token);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMarketXcelQuestions = async (req, res) => {
  try {
    const countryId = req.query.country_id || 229;
    const langId = req.query.language_id || 5;
    const result = await marketXcelService.getMasterQuestions(countryId, langId, req.headers.token);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Zamplia Demand Helper Endpoints (for direct UI actions)
exports.createDemandProject = async (req, res) => {
  try {
    const result = await zampliaDemandService.createProject(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDemandFeasibility = async (req, res) => {
  try {
    const result = await zampliaDemandService.getFeasibility(req.query);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Universal Interactive API Runner
 * Postman-style live test execution for all 37 endpoints across Zamplia Supply, Demand, & Market Xcel
 */
exports.runApiTest = async (req, res) => {
  const startTime = Date.now();
  const { provider = 'marketxcel', endpoint, method = 'GET', params = {}, body = {} } = req.body;

  try {
    let result = null;
    let statusCode = 200;

    // ==========================================
    // 1. MARKET XCEL DEMAND APIS (6 Endpoints)
    // ==========================================
    if (provider === 'marketxcel') {
      if (endpoint === 'send_supplier_data') {
        result = await marketXcelService.getAllocatedProjects();
      } else if (endpoint === 'get_master_data/country') {
        result = await marketXcelService.getMasterCountries();
      } else if (endpoint === 'get_master_data/language') {
        result = await marketXcelService.getMasterLanguages();
      } else if (endpoint === 'get_master_data/question') {
        result = await marketXcelService.getMasterQuestions(params.country_id || 229, params.language_id || 5);
      } else if (endpoint === 'updateRespondentStatus') {
        result = await S2sService.sendMarketXcelStatus({
          respondentId: body.respondentId || 'DEMO_USER_999',
          status: body.status || 1,
        });
      } else if (endpoint === 'redirect_hashing') {
        result = HashingService.generateSha3Hash(
          body.baseUrl || 'https://cluster.marketxcel.co.in/survey/thankyou?auth=1&uid=USER_01',
          body.secretKey || 'mx_secret_sha3_key_2026'
        );
      }
    }

    // ==========================================
    // 2. ZAMPLIA SUPPLY API V2 (16 Endpoints)
    // ==========================================
    else if (provider === 'zamplia_supply') {
      if (endpoint === 'GetAllocatedSurveys') {
        result = await zampliaService.getAllocatedSurveys();
      } else if (endpoint === 'GetTopPickSurveys') {
        result = await zampliaService.getTopPickSurveys();
      } else if (endpoint === 'GetSurveyById') {
        result = await zampliaService.getSurveyById(params.SurveyId || '90142');
      } else if (endpoint === 'GetSurveyTypes') {
        result = await zampliaService.getSurveyTypes();
      } else if (endpoint === 'GetSurveyGlobalStats') {
        result = await zampliaService.getSurveyGlobalStats(params.SurveyId || '90142');
      } else if (endpoint === 'GetSurveyQualifications') {
        result = await zampliaService.getSurveyQualifications(params.SurveyId || '90142');
      } else if (endpoint === 'GetSurveyGroups') {
        result = await zampliaService.getSurveyGroups();
      } else if (endpoint === 'GetLanguages') {
        result = await zampliaService.getLanguages();
      } else if (endpoint === 'GetDemoGraphics') {
        result = await zampliaService.getDemographics();
      } else if (endpoint === 'GetReconciliation') {
        result = await zampliaService.getReconciliation(params.StartDate || '2026-03-01', params.EndDate || '2026-03-15');
      } else if (endpoint === 'GetSurveyQuotas') {
        result = await zampliaService.getSurveyQuotas(params.SurveyId || '90142');
      } else if (endpoint === 'GenerateLink') {
        result = await zampliaService.generateLink(params.SurveyId || '90142', params.IpAddress || '127.0.0.1', params.TransactionId || 'TXN_TEST_01');
      } else if (endpoint === 'entry-link') {
        // Demographics pre-filling in entry link (/docs/SupplyApiV2/entry-link)
        const sampleAnswers = body.answers || { '42': 28, '43': 2, '105': 1 };
        result = await zampliaService.getEntryLinkWithQualifications(
          params.SurveyId || '90142',
          params.TransactionId || 'TXN_PREFILL_01',
          sampleAnswers,
          '127.0.0.1'
        );
      } else if (endpoint === 'GetIndustry') {
        result = await zampliaService.getIndustry();
      } else if (endpoint === 'GetBlockIp') {
        result = await zampliaService.getBlockedIps();
      } else if (endpoint === 'UsersSessionEvents') {
        result = await zampliaService.getUsersSessionEvents(params.SurveyId || '90142');
      }
    }

    // ==========================================
    // 3. ZAMPLIA DEMAND API V2 (15 Endpoints)
    // ==========================================
    else if (provider === 'zamplia_demand') {
      if (endpoint === 'createProjectOnZamplia') {
        result = await zampliaDemandService.createProject(body);
        statusCode = 201;
      } else if (endpoint === 'updateProjectOnZamplia') {
        result = await zampliaDemandService.updateProject(body);
      } else if (endpoint === 'getClientProjectById') {
        result = await zampliaDemandService.getClientProjectById(params.ProjectId || 108422);
      } else if (endpoint === 'getFeasibility') {
        result = await zampliaDemandService.getFeasibility(params);
      } else if (endpoint === 'createUpdateQualsOnZamplia') {
        result = await zampliaDemandService.createUpdateQualsOnZamplia(body);
      } else if (endpoint === 'getAllQualifications') {
        result = await zampliaDemandService.getAllQualifications();
      } else if (endpoint === 'getAllAnswers') {
        result = await zampliaDemandService.getAllAnswers(params.QuestionId || 43, params.LanguageId || 5);
      } else if (endpoint === 'createQuota') {
        result = await zampliaDemandService.createQuota(body);
        statusCode = 201;
      } else if (endpoint === 'getQuota') {
        result = await zampliaDemandService.getQuota(params.SurveyId || params.ProjectId || 108422);
      } else if (endpoint === 'updateInactiveActiveQuota') {
        result = await zampliaDemandService.updateInactiveActiveQuota(body.QuotaId || 20493, body.Status ?? 1);
      } else if (endpoint === 'getGroupSecurityId') {
        result = await zampliaDemandService.getGroupSecurityId(params.GroupName || 'Auto_Exclusion_Group_A');
      } else if (endpoint === 'addGroupSecurityOnStudies') {
        result = await zampliaDemandService.addGroupSecurityOnStudies(body.StudyIds || [108422, 108423], body.GroupSecurityId || 88412);
      } else if (endpoint === 'reconcileParticipantIds') {
        result = await zampliaDemandService.reconcileParticipantIds(body.ProjectId || 108422, body.ParticipantIds || ['USR_01', 'USR_02', 'USR_03']);
      } else if (endpoint === 'getAllLangCode') {
        result = await zampliaDemandService.getAllLangCode();
      } else if (endpoint === 'getCategory') {
        result = await zampliaDemandService.getCategory();
      }
    }

    const latencyMs = Date.now() - startTime;

    return res.status(statusCode).json({
      success: true,
      statusCode,
      latencyMs,
      endpoint,
      method,
      provider,
      executedAt: new Date().toISOString(),
      responsePayload: result || { message: 'Endpoint executed successfully' },
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      statusCode: 500,
      latencyMs,
      endpoint,
      error: error.message,
    });
  }
};
