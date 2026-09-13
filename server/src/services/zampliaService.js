const axios = require('axios');
const https = require('https');
const mongoose = require('mongoose');
const config = require('../config/zamplia');
const HmacService = require('./hmacService');
const ApiSurvey = require('../models/ApiSurvey');

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
  }

  async request(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return {
        success: true,
        data: response.data?.result?.data ?? response.data?.result ?? response.data,
      };
    } catch (error) {
      console.error(`Zamplia API [${endpoint}] Error:`, error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: [],
      };
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

  async getEntryLinkWithQualifications(surveyId, transactionId, answers = {}, ipAddress) {
    const linkRes = await this.generateLink(surveyId, ipAddress, transactionId);
    if (!linkRes.success || !linkRes.data?.[0]?.LiveLink) {
      return linkRes;
    }

    let liveLink = linkRes.data[0].LiveLink;
    if (Object.keys(answers).length > 0) {
      const sep = liveLink.includes('?') ? '&' : '?';
      const queryString = new URLSearchParams(answers).toString();
      liveLink += `${sep}${queryString}`;
      linkRes.data[0].LiveLink = liveLink;
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
