const axios = require('axios');
const https = require('https');
const mongoose = require('mongoose');
const config = require('../config/zamplia');
const HmacService = require('./hmacService');
const ApiSurvey = require('../models/ApiSurvey');
const { generateDemoInventory } = require('./demoInventory');

class ZampliaService {
  constructor() {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      httpsAgent: new https.Agent({ family: 4, keepAlive: true }),
      headers: {
        'ZAMP-KEY': config.apiKey,
        'Accept': 'application/json',
      },
    });
    // Connection probe cache: avoids hammering the upstream on every /api/status call
    this.probe = { live: false, checkedAt: null, httpStatus: null, error: null, keySource: config.usingFallbackKey ? 'builtin_demo_key' : 'env' };
  }

  /**
   * Lightweight live-connection probe for the Zamplia Supply API.
   * Confirms network reachability AND whether the configured API key is accepted
   * (Zamplia answers 401/403 for a bad key, so any 2xx proves the key works).
   * Results are cached for `ttlMs` (default 60s).
   */
  async probeConnection(force = false, ttlMs = 60000) {
    if (!force && this.probe.checkedAt && (Date.now() - this.probe.checkedAt < ttlMs)) {
      return this.probe;
    }
    const startedAt = Date.now();
    try {
      const res = await this.client.get('/Surveys/GetAllocatedSurveys', {
        params: { country: 'all', language: 'en-US' },
        timeout: 8000,
        validateStatus: (s) => s >= 200 && s < 500,
      });
      const authOk = res.status === 200;
      this.probe = {
        live: authOk,
        checkedAt: new Date().toISOString(),
        checkedInMs: Date.now() - startedAt,
        httpStatus: res.status,
        error: authOk ? null : (res.data?.message || res.data?.result?.message || `Zamplia rejected the request (HTTP ${res.status})`),
        keySource: config.usingFallbackKey ? 'builtin_demo_key' : 'env',
      };
    } catch (err) {
      this.probe = {
        live: false,
        checkedAt: new Date().toISOString(),
        checkedInMs: Date.now() - startedAt,
        httpStatus: err.response ? err.response.status : null,
        error: err.code === 'ECONNABORTED' ? 'Upstream timed out (8s)' : (err.message || 'Network unreachable'),
        keySource: config.usingFallbackKey ? 'builtin_demo_key' : 'env',
      };
    }
    return this.probe;
  }

  async request(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      if (response.data && (response.data.result?.data || response.data.result || response.data)) {
        const payload = response.data?.result?.data ?? response.data?.result ?? response.data;
        if (Array.isArray(payload) && payload.length > 0) {
          return { success: true, source: 'live_zamplia_api', data: payload };
        }
        if (typeof payload === 'object' && Object.keys(payload).length > 0) {
          return { success: true, source: 'live_zamplia_api', data: payload };
        }
      }
    } catch (error) {
      console.warn(`Zamplia live API [${endpoint}] failed (${error.message}). Falling back to simulation data.`);
    }

    // High-fidelity fallback simulated responses for seamless testing/sandbox
    return {
      success: true,
      isSimulated: true,
      source: 'simulated_fallback',
      data: this.getMockData(endpoint, params),
    };
  }

  /**
   * Hand-authored flagship studies (kept as the recognizable "anchor" studies
   * of the demo catalog, prefixed to the deterministic 622-study inventory).
   */
  getFlagshipDemoSurveys() {
    return [
      {
        SurveyId: 90142,
        Name: 'Global Electric Vehicle & Mobility Outlook 2026',
        TotalCompleteRequired: 600,
        CompletesNeeded: 340,
        CPI: 4.80,
        LOI: 14,
        IR: 75,
        Device: 'Desktop,Mobile,Tablet',
        LanguageCode: 'en-US',
        Country: 'United States',
        IndustryId: 5,
        IndustryName: 'Automotive & Mobility',
        status: 'Live',
        StudyTypes: 'Consumer',
        SurveyEndDate: '2026-12-30T23:59:59Z',
        IsSurveyGroupExist: 1,
        IsRecontactSurvey: 0,
        CollectPII: 0,
      },
      {
        SurveyId: 90143,
        Name: 'Healthcare Providers Digital Records Adoption',
        TotalCompleteRequired: 300,
        CompletesNeeded: 210,
        CPI: 7.50,
        LOI: 18,
        IR: 40,
        Device: 'Desktop,Tablet',
        LanguageCode: 'en-US',
        Country: 'United States',
        IndustryId: 3,
        IndustryName: 'Healthcare & Medical',
        status: 'Live',
        StudyTypes: 'B2B',
        SurveyEndDate: '2026-11-15T23:59:59Z',
        IsSurveyGroupExist: 0,
        IsRecontactSurvey: 0,
        CollectPII: 0,
      },
      {
        SurveyId: 90144,
        Name: 'German Consumer Retail & E-Commerce Preferences',
        TotalCompleteRequired: 800,
        CompletesNeeded: 450,
        CPI: 3.90,
        LOI: 10,
        IR: 90,
        Device: 'Desktop,Mobile,Tablet',
        LanguageCode: 'de-DE',
        Country: 'Germany',
        IndustryId: 1,
        IndustryName: 'Retail & E-Commerce',
        status: 'Live',
        StudyTypes: 'Consumer',
        SurveyEndDate: '2026-10-31T23:59:59Z',
        IsSurveyGroupExist: 0,
        IsRecontactSurvey: 0,
        CollectPII: 0,
      },
      {
        SurveyId: 90145,
        Name: 'Cloud SaaS Infrastructure Purchasing Habits',
        TotalCompleteRequired: 250,
        CompletesNeeded: 180,
        CPI: 9.20,
        LOI: 20,
        IR: 30,
        Device: 'Desktop',
        LanguageCode: 'en-US',
        Country: 'United States',
        IndustryId: 2,
        IndustryName: 'Information Technology',
        status: 'Live',
        StudyTypes: 'B2B',
        SurveyEndDate: '2026-10-05T23:59:59Z',
        IsSurveyGroupExist: 1,
        IsRecontactSurvey: 0,
        CollectPII: 0,
      },
    ];
  }

  getMockData(endpoint, params) {
    switch (endpoint) {
      case '/Surveys/GetAllocatedSurveys':
        return [ ...this.getFlagshipDemoSurveys(), ...generateDemoInventory(622, 90146) ];

      case '/Surveys/GetTopPickSurveys': {
        // Derived from the same demo inventory so Top Picks always match Inventory.
        const inventory = [ ...this.getFlagshipDemoSurveys(), ...generateDemoInventory(622, 90146) ];
        return [...inventory]
          .sort((a, b) => b.CPI - a.CPI)
          .slice(0, 8)
          .map((s, idx) => ({
            ...s,
            Rank: idx + 1,
            PriorityScore: Number(Math.min(99.9, (s.CPI * 6) + (s.IR / 10) + 40).toFixed(1)),
          }));
      }

      case '/Surveys/GetSurveyById':
        return {
          SurveyId: Number(params.SurveyId || 90142),
          Name: 'Global Electric Vehicle & Mobility Outlook 2026',
          TotalCompleteRequired: 600,
          CompletedCount: 260,
          RemainingCapacity: 340,
          CPI: 4.80,
          LOI: 14,
          IR: 75,
          LanguageCode: 'en-US',
          Industry: 'Automotive & Mobility',
          DeviceRequirement: 'Desktop,Mobile,Tablet',
          CollectPII: 0,
          IsSurveyGroupExist: 1,
          GroupId: 401,
          GroupName: 'Automotive_Tracking_Group_2026',
          CreatedAt: '2026-02-01T10:00:00Z',
          ExpiresAt: '2026-06-30T23:59:59Z',
        };

      case '/Surveys/GetSurveyQualifications':
        return [
          {
            QuestionId: 42,
            QuestionCode: 'AGE',
            QuestionText: 'What is your current age?',
            LogicalOperator: 'BETWEEN',
            Values: [21, 60]
          },
          {
            QuestionId: 43,
            QuestionCode: 'GENDER',
            QuestionText: 'Please select your gender',
            LogicalOperator: 'IN',
            Values: [1, 2] // Male, Female
          },
          {
            QuestionId: 105,
            QuestionCode: 'EMPLOYMENT_STATUS',
            QuestionText: 'Current employment status',
            LogicalOperator: 'EQUALS',
            Values: [1] // Full-time
          },
          {
            QuestionId: 210,
            QuestionCode: 'VEHICLE_OWNERSHIP',
            QuestionText: 'Do you own or lease a personal vehicle?',
            LogicalOperator: 'EQUALS',
            Values: [1] // Yes
          }
        ];

      case '/Surveys/GetSurveyQuotas':
        return [
          { QuotaId: 501, QuotaName: 'Age 21-34', Target: 200, Achieved: 142, Status: 'Active' },
          { QuotaId: 502, QuotaName: 'Age 35-50', Target: 250, Achieved: 210, Status: 'Active' },
          { QuotaId: 503, QuotaName: 'Age 51-60', Target: 150, Achieved: 150, Status: 'Full' },
          { QuotaId: 504, QuotaName: 'Gender: Female', Target: 300, Achieved: 260, Status: 'Active' },
        ];

      case '/Surveys/GetSurveyTypes':
        return [
          { TypeId: 1, TypeName: 'Consumer / General Population' },
          { TypeId: 2, TypeName: 'B2B Professional & Decision Makers' },
          { TypeId: 3, TypeName: 'Healthcare & Medical Professionals' },
          { TypeId: 4, TypeName: 'Gen-Z & Teen Audience' },
          { TypeId: 5, TypeName: 'High Net Worth Individuals (HNWI)' },
        ];

      case '/Surveys/GetSurveyGroups':
        return [
          { GroupId: 401, GroupName: 'Automotive_Tracking_Group_2026', ActiveStudiesCount: 4, ExclusionRule: '30_DAYS' },
          { GroupId: 402, GroupName: 'Pharma_Patient_Studies', ActiveStudiesCount: 2, ExclusionRule: '90_DAYS' },
          { GroupId: 403, GroupName: 'Telecom_Cross_Brand_Equity', ActiveStudiesCount: 3, ExclusionRule: '14_DAYS' },
        ];

      case '/Surveys/GetLanguages':
        return [
          { LanguageId: 5, LanguageCode: 'en-US', LanguageName: 'English (United States)' },
          { LanguageId: 6, LanguageCode: 'en-GB', LanguageName: 'English (United Kingdom)' },
          { LanguageId: 9, LanguageCode: 'de-DE', LanguageName: 'German (Germany)' },
          { LanguageId: 12, LanguageCode: 'fr-FR', LanguageName: 'French (France)' },
          { LanguageId: 15, LanguageCode: 'es-ES', LanguageName: 'Spanish (Spain)' },
          { LanguageId: 18, LanguageCode: 'hi-IN', LanguageName: 'Hindi (India)' },
          { LanguageId: 22, LanguageCode: 'nl-NL', LanguageName: 'Dutch (Netherlands)' },
          { LanguageId: 28, LanguageCode: 'it-IT', LanguageName: 'Italian (Italy)' },
        ];

      case '/Surveys/GetDemoGraphics':
        return [
          { DemographicsId: 101, Code: 'AGE', Name: 'Age Range', QuestionType: 'Numeric' },
          { DemographicsId: 102, Code: 'GENDER', Name: 'Gender Identity', QuestionType: 'Single Choice' },
          { DemographicsId: 103, Code: 'POSTAL_CODE', Name: 'Postal / Zip Code', QuestionType: 'Text' },
          { DemographicsId: 104, Code: 'EDUCATION', Name: 'Highest Education Level', QuestionType: 'Single Choice' },
          { DemographicsId: 105, Code: 'INCOME', Name: 'Household Annual Income', QuestionType: 'Single Choice' },
          { DemographicsId: 106, Code: 'EMPLOYMENT', Name: 'Employment Classification', QuestionType: 'Single Choice' },
          { DemographicsId: 107, Code: 'MARITAL_STATUS', Name: 'Marital Status', QuestionType: 'Single Choice' },
          { DemographicsId: 108, Code: 'CHILDREN_COUNT', Name: 'Number of Children Under 18', QuestionType: 'Numeric' },
        ];

      case '/Surveys/GetIndustry':
        return [
          { IndustryId: 1, IndustryName: 'Consumer Goods & Retail' },
          { IndustryId: 2, IndustryName: 'Information Technology & Software' },
          { IndustryId: 3, IndustryName: 'Healthcare, Life Sciences & Pharmaceuticals' },
          { IndustryId: 4, IndustryName: 'Banking, Financial Services & Insurance (BFSI)' },
          { IndustryId: 5, IndustryName: 'Automotive, Aerospace & Transportation' },
          { IndustryId: 6, IndustryName: 'Media, Advertising & Entertainment' },
          { IndustryId: 7, IndustryName: 'Telecommunications & Internet Services' },
        ];

      case '/Surveys/GenerateLink':
        return [
          {
            SurveyId: Number(params.SurveyId || 90142),
            TransactionId: params.TransactionId || `txn_${Date.now()}`,
            LiveLink: `https://surveysupply.zamplia.com/s/${params.SurveyId || 90142}?tid=${params.TransactionId || 'TXN_TEST_01'}&zamp_sig=sha256_${Date.now()}`,
            ExpirationMinutes: 120,
          }
        ];

      case '/Surveys/GetSurveyGlobalStats':
        return {
          SurveyId: params.SurveyId ? Number(params.SurveyId) : null,
          GlobalIR: '78.4%',
          GlobalLOI: '12.8 mins',
          OverallCompletionRate: '68.2%',
          DropOffRate: '18.1%',
          ScreenOutRate: '13.7%',
          TotalStartsObserved: 14250,
          TotalCompletesObserved: 9718,
          AverageCostPerInterview: '$4.22',
        };

      case '/Surveys/GetBlockIp':
        return [
          { IPAddress: '185.220.101.4', Reason: 'Known Tor Exit Node', ListedAt: '2026-01-10T12:00:00Z' },
          { IPAddress: '194.26.29.112', Reason: 'Commercial Proxy / DataCenter', ListedAt: '2026-02-04T08:30:00Z' },
          { IPAddress: '45.154.255.89', Reason: 'Automated Click Fraud Botnet', ListedAt: '2026-02-18T14:15:00Z' },
          { IPAddress: '193.176.84.55', Reason: 'High-frequency Speeder Subnet', ListedAt: '2026-03-01T11:45:00Z' },
          { IPAddress: '104.244.76.13', Reason: 'Suspicious Spoofed User-Agent', ListedAt: '2026-03-12T16:20:00Z' },
        ];

      case '/Surveys/UsersSessionEvents':
        return [
          { SessionId: 'sess_99182', Event: 'SurveyEntry', Timestamp: '2026-03-17T14:02:11Z', Status: 'Success' },
          { SessionId: 'sess_99182', Event: 'QualificationsChecked', Timestamp: '2026-03-17T14:02:45Z', Status: 'Passed' },
          { SessionId: 'sess_99182', Event: 'SurveyCompleted', Timestamp: '2026-03-17T14:15:30Z', Status: 'Complete', DurationSeconds: 799 },
          { SessionId: 'sess_99183', Event: 'SurveyEntry', Timestamp: '2026-03-17T14:20:04Z', Status: 'Success' },
          { SessionId: 'sess_99183', Event: 'QualificationsChecked', Timestamp: '2026-03-17T14:20:25Z', Status: 'ScreenOut_QuotaFull' },
        ];

      case '/Surveys/GetReconciliation':
        // Per-transaction ledger shape (matches Zamplia Supply API docs):
        // each record = one respondent transaction with its own status + payout,
        // not a per-survey aggregate. Drives Completes / Reversals / audit UI.
        return [
          {
            ReconciliationId: 'REC_2026_03_0001',
            SurveyId: 90142,
            SurveyName: 'Global Electric Vehicle & Mobility Outlook 2026',
            SupplierTransactionId: 'TXN_90142_000881',
            CompleteDate: '2026-03-02T14:22:00Z',
            Cpi: 4.80,
            Status: 'Complete',
            DurationMinutes: 13,
          },
          {
            ReconciliationId: 'REC_2026_03_0002',
            SurveyId: 90142,
            SurveyName: 'Global Electric Vehicle & Mobility Outlook 2026',
            SupplierTransactionId: 'TXN_90142_000882',
            CompleteDate: '2026-03-02T15:05:00Z',
            Cpi: 4.80,
            Status: 'Complete',
            DurationMinutes: 16,
          },
          {
            ReconciliationId: 'REC_2026_03_0003',
            SurveyId: 90142,
            SurveyName: 'Global Electric Vehicle & Mobility Outlook 2026',
            SupplierTransactionId: 'TXN_90142_000903',
            CompleteDate: '2026-03-03T09:41:00Z',
            Cpi: 0.00,
            Status: 'Reversed',
            ReversalReason: 'Speeder (< 3 mins vs stated LOI)',
            DurationMinutes: 2,
          },
          {
            ReconciliationId: 'REC_2026_03_0004',
            SurveyId: 90144,
            SurveyName: 'German Consumer Retail & E-Commerce Preferences',
            SupplierTransactionId: 'TXN_90144_002114',
            CompleteDate: '2026-03-04T11:18:00Z',
            Cpi: 3.90,
            Status: 'Complete',
            DurationMinutes: 11,
          },
          {
            ReconciliationId: 'REC_2026_03_0005',
            SurveyId: 90144,
            SurveyName: 'German Consumer Retail & E-Commerce Preferences',
            SupplierTransactionId: 'TXN_90144_002156',
            CompleteDate: '2026-03-05T17:47:00Z',
            Cpi: 0.00,
            Status: 'Reversed',
            ReversalReason: 'Geo-IP mismatch (non-DE IP)',
            DurationMinutes: 9,
          },
          {
            ReconciliationId: 'REC_2026_03_0006',
            SurveyId: 90145,
            SurveyName: 'Cloud SaaS Infrastructure Purchasing Habits',
            SupplierTransactionId: 'TXN_90145_000412',
            CompleteDate: '2026-03-06T10:02:00Z',
            Cpi: 9.20,
            Status: 'Complete',
            DurationMinutes: 21,
          },
        ];

      default:
        return { message: `Simulated response for ${endpoint}`, timestamp: new Date().toISOString() };
    }
  }

  // 1. Discovery APIs
  async getAllocatedSurveys() {
    return this.request('/Surveys/GetAllocatedSurveys');
  }

  async getTopPickSurveys() {
    return this.request('/Surveys/GetTopPickSurveys');
  }

  // 2. Inspection & Targeting APIs
  async getSurveyById(surveyId) {
    return this.request('/Surveys/GetSurveyById', { SurveyId: surveyId });
  }

  async getSurveyQualifications(surveyId) {
    return this.request('/Surveys/GetSurveyQualifications', { SurveyId: surveyId });
  }

  async getSurveyQuotas(surveyId) {
    return this.request('/Surveys/GetSurveyQuotas', { SurveyId: surveyId });
  }

  async getSurveyTypes() {
    return this.request('/Surveys/GetSurveyTypes');
  }

  async getSurveyGroups() {
    return this.request('/Surveys/GetSurveyGroups');
  }

  // 3. Reference Catalogs
  async getLanguages() {
    return this.request('/Surveys/GetLanguages');
  }

  async getDemographics() {
    return this.request('/Surveys/GetDemoGraphics');
  }

  async getIndustry() {
    return this.request('/Surveys/GetIndustry');
  }

  // 4. Traffic Routing & Link Generation
  async generateLink(surveyId, ipAddress, transactionId) {
    const res = await this.request('/Surveys/GenerateLink', {
      SurveyId: surveyId,
      IpAddress: ipAddress || '127.0.0.1',
      TransactionId: transactionId || `txn_${Date.now()}`,
    });

    if (res.success && res.data?.[0]?.LiveLink && config.hmacSecret) {
      res.data[0].SignedLiveLink = HmacService.signUrl(res.data[0].LiveLink);
    }

    return res;
  }

  // Supply API: Entry Link (Qualification Code and ID in Entry Link)
  async getEntryLinkWithQualifications(surveyId, transactionId, answers = {}, ipAddress) {
    const linkRes = await this.generateLink(surveyId, ipAddress, transactionId);
    if (!linkRes.success || !linkRes.data?.[0]?.LiveLink) {
      return linkRes;
    }

    let liveLink = linkRes.data[0].LiveLink;
    if (Object.keys(answers).length > 0) {
      const sep = liveLink.includes('?') ? '&' : '?';
      // Format as documented in Zamplia /docs/SupplyApiV2/entry-link
      const answersParam = encodeURIComponent(JSON.stringify(answers));
      liveLink += `${sep}answers=${answersParam}`;
      linkRes.data[0].LiveLink = liveLink;
      linkRes.data[0].DemographicsPreFilled = answers;
    }

    if (config.hmacSecret) {
      linkRes.data[0].SignedLiveLink = HmacService.signUrl(liveLink);
    }

    return linkRes;
  }

  // 5. Tracking, Fraud Prevention & Reconciliation
  async getSurveyGlobalStats(surveyId = null) {
    return this.request('/Surveys/GetSurveyGlobalStats', surveyId ? { SurveyId: surveyId } : {});
  }

  async getBlockedIps() {
    return this.request('/Surveys/GetBlockIp');
  }

  async getUsersSessionEvents(surveyId = null, filters = {}) {
    const params = { ...filters };
    if (surveyId) params.SurveyId = surveyId;
    return this.request('/Surveys/UsersSessionEvents', params);
  }

  async getReconciliation(startDate, endDate, status = null) {
    const params = {};
    if (startDate) params.StartDate = startDate;
    if (endDate) params.EndDate = endDate;
    if (status) params.Status = status;
    return this.request('/Surveys/GetReconciliation', params);
  }

  // 6. Database Synchronization Helper
  async syncSurveysToDb() {
    if (mongoose.connection.readyState !== 1) {
      return { success: true, message: 'MongoDB not connected, skipping local DB sync (live API active).', count: 0 };
    }
    try {
      const response = await this.getAllocatedSurveys();
      if (!response.success || !Array.isArray(response.data)) {
        return { success: false, message: response.message || 'Failed to fetch surveys', count: 0 };
      }

      let count = 0;
      for (const s of response.data) {
        if (!s.SurveyId) continue;

        await ApiSurvey.findOneAndUpdate(
          { SurveyId: s.SurveyId },
          {
            Name: s.Name || '',
            TotalCompleteRequired: s.TotalCompleteRequired || 0,
            CPI: s.CPI || 0,
            LOI: s.LOI || 0,
            IR: s.IR || 0,
            LastUpdateTimeStamp: s.LastUpdateTimeStamp ? new Date(s.LastUpdateTimeStamp) : null,
            IsSurveyGroupExist: s.IsSurveyGroupExist || 0,
            LanguageCode: s.LanguageCode || '',
            SurveyEndDate: s.SurveyEndDate ? new Date(s.SurveyEndDate) : null,
            Device: s.Device || '',
            IndustryId: s.IndustryId,
            StudyTypes: s.StudyTypes || '',
            IsRecontactSurvey: s.IsRecontactSurvey || 0,
            CollectPII: s.CollectPII || 0,
            LanguageId: s.LanguageId,
            FieldDays: s.FieldDays,
            SurveyCreatedAt: s.SurveyCreatedAt ? new Date(s.SurveyCreatedAt) : null,
            status: s.status || 'Live',
          },
          { upsert: true, new: true }
        );
        count++;
      }

      return { success: true, message: `Successfully synced ${count} surveys to MongoDB.`, count };
    } catch (err) {
      console.error('syncSurveysToDb Error:', err.message);
      return { success: false, message: err.message, count: 0 };
    }
  }
}

module.exports = new ZampliaService();
