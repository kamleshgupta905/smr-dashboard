import React, { useState } from 'react';
import { 
  Code2, Play, ExternalLink, Copy, Check, Terminal, Globe, 
  ShieldCheck, Send, CheckCircle2, AlertCircle, RefreshCw, Key, Filter, Search, Layers, Box
} from 'lucide-react';
import { runUniversalApiTest } from '../services/api';

export default function ApiDeveloperCenterPage() {
  const [activeTab, setActiveTab] = useState('all'); // all, zamplia_supply, zamplia_demand, marketxcel
  const [selectedApi, setSelectedApi] = useState('zamp_allocated');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [customParams, setCustomParams] = useState({});
  const [customBody, setCustomBody] = useState('');

  const apiCatalog = {
    // ============================================================
    // 1. ZAMPLIA SUPPLY API V2 (16 Endpoints - /docs/category/supply-api)
    // ============================================================
    zamp_allocated: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetAllocatedSurveys',
      name: 'Get Allocated Surveys',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetAllocatedSurveys',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Accept': 'application/json' },
      description: 'Returns real-time list of all surveys currently allocated to your supplier account with IR, LOI, and CPI.'
    },
    zamp_top_picks: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetTopPickSurveys',
      name: 'Get Top Pick Surveys',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetTopPickSurveys',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Returns top-earning high-CPI surveys prioritized for maximum vendor conversion and throughput.'
    },
    zamp_by_id: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetSurveyById',
      name: 'Get Survey By Id',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetSurveyById?SurveyId=90142',
      params: { SurveyId: '90142' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Retrieves complete metadata, remaining quota slots, and operational status for a single SurveyId.'
    },
    zamp_types: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetSurveyTypes',
      name: 'Get Survey Types',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetSurveyTypes',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Retrieves taxonomy of study types (Consumer Gen-Pop, B2B Decision Maker, Healthcare HCP, etc.).'
    },
    zamp_global_stats: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetSurveyGlobalStats',
      name: 'Get Survey Global Stats',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetSurveyGlobalStats?SurveyId=90142',
      params: { SurveyId: '90142' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Global conversion statistics across the Zamplia marketplace including observed IR, average LOI, and drop-off rate.'
    },
    zamp_quals: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetSurveyQualifications',
      name: 'Get Survey Qualifications',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetSurveyQualifications?SurveyId=90142',
      params: { SurveyId: '90142' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Demographic qualification rules (Age, Gender, Zip, Income) and logic operators required to enter the survey.'
    },
    zamp_groups: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetSurveyGroups',
      name: 'Get Survey Groups',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetSurveyGroups',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Exclusion group capping IDs to prevent respondents from taking duplicate or competitor surveys within set time windows.'
    },
    zamp_languages: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetLanguages',
      name: 'Get Languages',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetLanguages',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Catalog of supported localized language IDs and ISO language-country codes (en-US, de-DE, etc.).'
    },
    zamp_demographics: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetDemoGraphics',
      name: 'Get DemoGraphics',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetDemoGraphics',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Official Zamplia standard demographic questions taxonomy used for profiling respondents.'
    },
    zamp_reconciliation: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetReconciliation',
      name: 'Get Reconciliation',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetReconciliation?StartDate=2026-03-01&EndDate=2026-03-15',
      params: { StartDate: '2026-03-01', EndDate: '2026-03-15' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Audit report of billable validated completes, deductions, reversals, and reasons for reversals.'
    },
    zamp_quotas: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetSurveyQuotas',
      name: 'Get Survey Quotas',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetSurveyQuotas?SurveyId=90142',
      params: { SurveyId: '90142' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Quota bucket capacities, achieved completes, and real-time open/full state per demographic segment.'
    },
    zamp_generate_link: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GenerateLink',
      name: 'Generate Link',
      method: 'POST',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GenerateLink',
      params: { SurveyId: '90142', TransactionId: 'TXN_TEST_01', IpAddress: '127.0.0.1' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Generates authenticated, live signed survey entry URL with cryptographic session tracking.'
    },
    zamp_entry_link: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'entry-link',
      name: 'Qualification Code & ID in Entry Link',
      method: 'POST',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/entry-link',
      body: {
        SurveyId: '90142',
        TransactionId: 'TXN_PREFILL_01',
        answers: { '42': 28, '43': 2, '105': 1 }
      },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Dynamic pre-filling of respondent demographics into survey entry URL via answers query parameter (/docs/SupplyApiV2/entry-link).'
    },
    zamp_industry: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetIndustry',
      name: 'Get Industry',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetIndustry',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Standard industry verticals and sector categorization catalog.'
    },
    zamp_blocked_ips: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'GetBlockIp',
      name: 'Get Block Ip',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/GetBlockIp',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Global fraud blacklist of banned IP addresses, compromised proxies, and botnet networks.'
    },
    zamp_session_events: {
      provider: 'zamplia_supply',
      category: 'Zamplia Supply API V2',
      endpoint: 'UsersSessionEvents',
      name: 'Users Session Events',
      method: 'GET',
      url: 'https://surveysupply.zamplia.com/api/v1/Surveys/UsersSessionEvents?SurveyId=90142',
      params: { SurveyId: '90142' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Diagnostic audit log of respondent journey events (Entry, Screener, Completion, Dropout stage).'
    },

    // ============================================================
    // 2. ZAMPLIA DEMAND API V2 (15 Endpoints - /docs/category/demand-api)
    // ============================================================
    zamp_demand_create_project: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'createProjectOnZamplia',
      name: 'createProject',
      method: 'POST',
      url: 'https://api.zamplia.com/api/suppliers/createProjectOnZamplia',
      body: {
        ProjectName: 'Global Smartphone Consumer Sentiment 2026',
        LOI: 12,
        IR: 85,
        TotalCompleteRequired: 500,
        CPI: 3.50,
        StudyType: 'Consumer',
        CountryId: 229,
        LanguageId: 5,
        SurveyUrl: 'https://buyer-survey.com/start?id=[%RESPONDENT_ID%]'
      },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Creates a new survey research project on the Zamplia marketplace and begins buying sample.'
    },
    zamp_demand_update_project: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'updateProjectOnZamplia',
      name: 'updateProject',
      method: 'POST',
      url: 'https://api.zamplia.com/api/suppliers/updateProjectOnZamplia',
      body: {
        ProjectId: 108422,
        ProjectName: 'Updated Smartphone Consumer Sentiment',
        CPI: 3.85,
        TotalCompleteRequired: 750,
        Status: 'Active'
      },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Updates project parameters such as CPI, required completes, status (Active/Paused/Closed), or project name.'
    },
    zamp_demand_get_project: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'getClientProjectById',
      name: 'getClientProjectById',
      method: 'GET',
      url: 'https://api.zamplia.com/api/suppliers/getClientProjectById?ProjectId=108422',
      params: { ProjectId: '108422' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Fetches real-time buyer study progress, completes achieved, pacing, and remaining target capacity.'
    },
    zamp_demand_feasibility: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'getFeasibility',
      name: 'getfeasibility',
      method: 'GET',
      url: 'https://api.zamplia.com/api/suppliers/getFeasibility?LOI=12&IR=80&SampleSize=500&CountryId=229',
      params: { LOI: 12, IR: 80, SampleSize: 500, CountryId: 229 },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Calculates marketplace feasibility score, recommended CPI, and projected completion time before launching a study.'
    },
    zamp_demand_create_quals: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'createUpdateQualsOnZamplia',
      name: 'createUpdateQualsOnZamplia',
      method: 'POST',
      url: 'https://api.zamplia.com/api/suppliers/createUpdateQualsOnZamplia',
      body: {
        ProjectId: 108422,
        Qualifications: [
          { QuestionId: 42, QuestionCode: 'AGE', LogicalOperator: 'BETWEEN', AnswerIds: [18, 65] },
          { QuestionId: 43, QuestionCode: 'GENDER', LogicalOperator: 'EQUALS', AnswerIds: [1, 2] },
          { QuestionId: 105, QuestionCode: 'EMPLOYMENT', LogicalOperator: 'IN', AnswerIds: [1, 2, 3] }
        ]
      },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Attaches qualification questions, boolean operators, and allowed answer IDs to target specific respondents.'
    },
    zamp_demand_all_quals: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'getAllQualifications',
      name: 'getAllQualifications',
      method: 'GET',
      url: 'https://api.zamplia.com/api/suppliers/getAllQualifications',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Retrieves complete catalog of all profiling questions available for study qualification and targeting.'
    },
    zamp_demand_all_answers: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'getAllAnswers',
      name: 'getAllAnswers',
      method: 'GET',
      url: 'https://api.zamplia.com/api/suppliers/getAllAnswers?QuestionId=43&LanguageId=5',
      params: { QuestionId: 43, LanguageId: 5 },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Fetches valid answer option codes and localized answer text for a specific qualification question ID.'
    },
    zamp_demand_create_quota: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'createQuota',
      name: 'createQuota',
      method: 'POST',
      url: 'https://api.zamplia.com/api/suppliers/createQuota',
      body: {
        ProjectId: 108422,
        QuotaName: 'Females Aged 25-34',
        TargetCount: 150,
        Conditions: [
          { QuestionId: 43, AnswerIds: [2] },
          { QuestionId: 42, Range: [25, 34] }
        ]
      },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Defines demographic quota constraints to control sample composition and prevent over-delivery.'
    },
    zamp_demand_get_quota: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'getQuota',
      name: 'getQuota',
      method: 'GET',
      url: 'https://api.zamplia.com/api/suppliers/getQuota?SurveyId=108422',
      params: { SurveyId: '108422' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Returns all quotas defined for a project along with target count and achieved completes.'
    },
    zamp_demand_update_quota: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'updateInactiveActiveQuota',
      name: 'updateInactiveActiveQuota',
      method: 'POST',
      url: 'https://api.zamplia.com/api/suppliers/updateInactiveActiveQuota',
      body: { QuotaId: 20493, Status: 1 },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Dynamically pauses or re-opens a specific quota bucket without pausing the entire project.'
    },
    zamp_demand_group_security: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'getGroupSecurityId',
      name: 'getGroupSecurityId',
      method: 'GET',
      url: 'https://api.zamplia.com/api/suppliers/getGroupSecurityId?GroupName=Auto_Exclusion_Group_A',
      params: { GroupName: 'Auto_Exclusion_Group_A' },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Fetches or creates a Group Security identifier used to enforce cross-study participant exclusions.'
    },
    zamp_demand_add_group_sec: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'addGroupSecurityOnStudies',
      name: 'addGroupSecurityOnStudies',
      method: 'POST',
      url: 'https://api.zamplia.com/api/suppliers/addGroupSecurityOnStudies',
      body: { StudyIds: [108422, 108423], GroupSecurityId: 88412 },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Applies group security exclusions across multiple research projects simultaneously.'
    },
    zamp_demand_reconcile: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'reconcileParticipantIds',
      name: 'reconcileParticipantIds',
      method: 'POST',
      url: 'https://api.zamplia.com/api/suppliers/reconcileParticipantIds',
      body: { ProjectId: 108422, ParticipantIds: ['USR_101', 'USR_102', 'USR_103'] },
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY', 'Content-Type': 'application/json' },
      description: 'Buyer confirms validated billable participant IDs with Zamplia for final invoice reconciliation.'
    },
    zamp_demand_lang_codes: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'getAllLangCode',
      name: 'getAllLangCode',
      method: 'GET',
      url: 'https://api.zamplia.com/api/suppliers/getAllLangCode',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Retrieves all supported language code identifiers available for demand study creation.'
    },
    zamp_demand_categories: {
      provider: 'zamplia_demand',
      category: 'Zamplia Demand API (Buyers)',
      endpoint: 'getCategory',
      name: 'getCategory',
      method: 'GET',
      url: 'https://api.zamplia.com/api/suppliers/getCategory',
      headers: { 'ZAMP-KEY': 'ZAMP-SECURE-KEY' },
      description: 'Retrieves available research study categories (Consumer, Tech, Healthcare, BFSI, Auto) for targeting.'
    },

    // ============================================================
    // 3. MARKET XCEL DEMAND APIS & GUIDES (6 Endpoints)
    // ============================================================
    mx_projects: {
      provider: 'marketxcel',
      category: 'Market Xcel Demand API',
      endpoint: 'send_supplier_data',
      name: 'send_supplier_data (Allocated Projects)',
      method: 'GET',
      url: 'https://api.marketxcel.co.in/webservices/supplier/send_supplier_data',
      headers: { 'Supplierid': '7353212849', 'token': 'mx_token_live_2026' },
      description: 'Retrieves all ongoing active survey projects allocated to your supplier account.'
    },
    mx_country: {
      provider: 'marketxcel',
      category: 'Market Xcel Demand API',
      endpoint: 'get_master_data/country',
      name: 'get_master_data/country',
      method: 'GET',
      url: 'https://api.marketxcel.co.in/webservices/supplier/get_master_data/country',
      headers: { 'token': 'mx_token_live_2026' },
      description: 'Retrieves global country IDs, 2-letter ISO short codes, and 3-letter ISO alpha-3 codes.'
    },
    mx_language: {
      provider: 'marketxcel',
      category: 'Market Xcel Demand API',
      endpoint: 'get_master_data/language',
      name: 'get_master_data/language',
      method: 'GET',
      url: 'https://api.marketxcel.co.in/webservices/supplier/get_master_data/language',
      headers: { 'token': 'mx_token_live_2026' },
      description: 'Returns supported language codes (French, Dutch, English, German, Hindi, etc.).'
    },
    mx_question: {
      provider: 'marketxcel',
      category: 'Market Xcel Demand API',
      endpoint: 'get_master_data/question',
      name: 'get_master_data/question (Control Types)',
      method: 'GET',
      url: 'https://api.marketxcel.co.in/webservices/supplier/get_master_data/question?country_id=229&language_id=5',
      params: { country_id: 229, language_id: 5 },
      headers: { 'token': 'mx_token_live_2026' },
      description: 'Profiling questions library and Control Types: 1=Single Choice, 2=Multi Choice, 4=Open Text, 6/0=Numeric/Other.'
    },
    mx_s2s: {
      provider: 'marketxcel',
      category: 'Market Xcel Demand API',
      endpoint: 'updateRespondentStatus',
      name: 'updateRespondentStatus (S2S Callback)',
      method: 'POST',
      url: 'https://api.marketxcel.co.in/webservices/callback/updateRespondentStatus',
      headers: { 'X-Api-Key': 'YOUR_S2S_API_KEY', 'Content-Type': 'application/json' },
      body: { respondentId: 'DEMO_USER_999', status: 1 },
      description: 'Direct server-to-server webhook: status 1=Complete, 2=Terminate, 3=OverQuota, 4=Security.'
    },
    mx_hashing: {
      provider: 'marketxcel',
      category: 'Market Xcel Demand API',
      endpoint: 'redirect_hashing',
      name: 'SHA3-256 Redirect URL Hashing Guide',
      method: 'POST',
      url: 'https://crm.marketxcel.co.in/cron/redirecthashing_guide',
      headers: { 'Content-Type': 'application/json' },
      body: {
        baseUrl: 'https://cluster.marketxcel.co.in/survey/thankyou?auth=1&uid=USER_01',
        secretKey: 'mx_secret_sha3_key_2026'
      },
      description: 'Tamper-proof SHA3-256 redirect hashing: hash("sha3-256", baseUrl + secretKey).'
    },
  };

  const currentApi = apiCatalog[selectedApi] || apiCatalog.zamp_allocated;

  // Sync custom inputs when API changes
  const handleSelectApi = (key) => {
    setSelectedApi(key);
    const apiObj = apiCatalog[key];
    setCustomParams(apiObj.params ? { ...apiObj.params } : {});
    setCustomBody(apiObj.body ? JSON.stringify(apiObj.body, null, 2) : '');
    setResponse(null);
  };

  // Filter APIs by category tab and search query
  const filteredApiKeys = Object.keys(apiCatalog).filter((key) => {
    const api = apiCatalog[key];
    if (activeTab === 'zamplia_supply' && api.provider !== 'zamplia_supply') return false;
    if (activeTab === 'zamplia_demand' && api.provider !== 'zamplia_demand') return false;
    if (activeTab === 'marketxcel' && api.provider !== 'marketxcel') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        api.name.toLowerCase().includes(q) ||
        api.endpoint.toLowerCase().includes(q) ||
        api.category.toLowerCase().includes(q) ||
        api.description.toLowerCase().includes(q) ||
        api.method.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRunTest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      let parsedBody = {};
      if (customBody.trim()) {
        try {
          parsedBody = JSON.parse(customBody);
        } catch (e) {
          parsedBody = currentApi.body || {};
        }
      } else if (currentApi.body) {
        parsedBody = currentApi.body;
      }

      const res = await runUniversalApiTest({
        provider: currentApi.provider,
        endpoint: currentApi.endpoint,
        method: currentApi.method,
        params: Object.keys(customParams).length > 0 ? customParams : (currentApi.params || {}),
        body: parsedBody,
      });
      setResponse(res);
    } catch (err) {
      setResponse({
        success: false,
        statusCode: 500,
        error: err.response?.data?.message || err.message,
        executedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = () => {
    let curl = `curl -X ${currentApi.method} "${currentApi.url}"`;
    Object.entries(currentApi.headers || {}).forEach(([k, v]) => {
      curl += ` \\\n  -H "${k}: ${v}"`;
    });
    if (currentApi.body) {
      curl += ` \\\n  -d '${customBody || JSON.stringify(currentApi.body)}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const counts = {
    all: Object.keys(apiCatalog).length,
    zamplia_supply: Object.values(apiCatalog).filter(a => a.provider === 'zamplia_supply').length,
    zamplia_demand: Object.values(apiCatalog).filter(a => a.provider === 'zamplia_demand').length,
    marketxcel: Object.values(apiCatalog).filter(a => a.provider === 'marketxcel').length,
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Dastone Page Title Box */}
      <div className="page-title-box">
        <div>
          <div className="breadcrumb-trail">
            <span className="link">VMH</span>
            <span className="separator">/</span>
            <span className="link">Developer</span>
            <span className="separator">/</span>
            <span className="current">API Sandbox</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 className="page-title">
              Universal API Explorer & Developer Center
            </h4>
            <span className="badge-soft-primary" style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Terminal size={12} />
              37 Endpoints Active
            </span>
            <span className="badge-soft-success" style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span className="pulse-dot" />
              Sandbox Ready
            </span>
          </div>
        </div>

        <div className="title-box-actions">
          <button 
            className="btn btn-soft-primary" 
            onClick={copyCurl}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: '4px'
            }}
          >
            {copied ? <Check size={14} color="#03d87f" /> : <Copy size={14} />}
            {copied ? 'cURL Copied!' : 'Copy cURL Snippet'}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Category Tabs */}
        <div className="timeframe-group">
          {[
            { id: 'all', label: `All APIs (${counts.all})`, icon: Layers },
            { id: 'zamplia_supply', label: `Zamplia Supply (${counts.zamplia_supply})`, icon: Box },
            { id: 'zamplia_demand', label: `Zamplia Demand (${counts.zamplia_demand})`, icon: Globe },
            { id: 'marketxcel', label: `Market Xcel (${counts.marketxcel})`, icon: Code2 },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`timeframe-btn ${active ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '12px'
                }}
              >
                <Icon size={13} color={active ? '#1761fd' : '#8997bd'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div style={{
          position: 'relative',
          minWidth: '280px',
          maxWidth: '380px',
          flex: '1'
        }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
          <input 
            type="text"
            className="input-control"
            placeholder="Search by endpoint, method, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '34px',
              height: '34px',
              fontSize: '12px'
            }}
          />
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px' }}>
        {/* Left Sidebar: API Catalog */}
        <div className="report-card" style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 240px)',
          minHeight: '650px',
          padding: 0,
          margin: 0
        }}>
          <div className="report-card-header">
            <h4 className="report-card-title">
              <Layers size={14} color="#1761fd" /> Endpoint Catalog ({filteredApiKeys.length})
            </h4>
            <span style={{ fontSize: '11px', color: '#8997bd' }}>Select to test</span>
          </div>

          <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {filteredApiKeys.map(key => {
              const api = apiCatalog[key];
              const isSelected = selectedApi === key;
              const isPost = api.method === 'POST';
              return (
                <div
                  key={key}
                  onClick={() => handleSelectApi(key)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    background: isSelected ? '#EFF6FF' : 'transparent',
                    border: isSelected ? '1px solid #BFDBFE' : '1px solid transparent',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isPost ? '#ECFDF5' : '#EFF6FF',
                      color: isPost ? '#059669' : '#2563EB',
                      border: `1px solid ${isPost ? '#A7F3D0' : '#BFDBFE'}`
                    }}>
                      {api.method}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 500 }}>
                      {api.provider === 'zamplia_supply' ? 'Supply V2' : api.provider === 'zamplia_demand' ? 'Demand V2' : 'Market Xcel'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#1D4ED8' : '#1E293B', marginBottom: '2px' }}>
                    {api.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    /{api.endpoint}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Interactive Playground */}
        <div className="report-card custom-scrollbar" style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 240px)',
          minHeight: '650px',
          overflowY: 'auto',
          margin: 0,
          padding: 0
        }}>
          {/* Top Bar: URL & Execute Button */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e3ebf6', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className={currentApi.method === 'POST' ? 'badge-soft-success' : 'badge-soft-primary'} style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '11px'
              }}>
                {currentApi.method}
              </span>
              <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                {currentApi.name}
              </h2>
              <span style={{
                background: '#E2E8F0',
                color: '#475569',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 600,
                marginLeft: 'auto'
              }}>
                {currentApi.category}
              </span>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: '#64748B', lineHeight: '1.4' }}>
              {currentApi.description}
            </p>

            {/* URL Input with Send Button */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                flex: 1,
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {currentApi.url}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleRunTest}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                }}
              >
                {loading ? <RefreshCw size={14} className="spinner" /> : <Play size={14} />}
                {loading ? 'Executing...' : 'Run Test'}
              </button>
            </div>
          </div>

          {/* Configuration & Response Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', flex: 1, overflow: 'hidden' }}>
            {/* Request Configuration */}
            <div className="custom-scrollbar" style={{ padding: '16px', borderRight: '1px solid #E2E8F0', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '12.5px', fontWeight: 700, margin: '0 0 10px 0', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Request Headers
              </h3>
              <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                {Object.entries(currentApi.headers || {}).map(([hk, hv]) => (
                  <div key={hk} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', padding: '4px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B', fontFamily: 'monospace' }}>{hk}</span>
                    <span style={{ color: '#0F172A', fontWeight: 600, fontFamily: 'monospace' }}>{hv}</span>
                  </div>
                ))}
              </div>

              {/* Query Parameters */}
              {currentApi.params && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '12.5px', fontWeight: 700, margin: '0 0 8px 0', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Query Parameters
                  </h3>
                  {Object.entries(customParams).map(([pk, pv]) => (
                    <div key={pk} style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '3px' }}>
                        {pk}
                      </label>
                      <input 
                        type="text"
                        value={pv}
                        onChange={(e) => setCustomParams({ ...customParams, [pk]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Request Body Editor */}
              {currentApi.method === 'POST' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '12.5px', fontWeight: 700, margin: 0, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      JSON Request Body
                    </h3>
                    <button
                      onClick={() => setCustomBody(JSON.stringify(currentApi.body || {}, null, 2))}
                      style={{ border: 'none', background: 'transparent', color: '#2563EB', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Reset Default
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={customBody || JSON.stringify(currentApi.body || {}, null, 2)}
                    onChange={(e) => setCustomBody(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '11.5px',
                      fontFamily: 'monospace',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      color: '#0F172A',
                      lineHeight: '1.4'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Response Console */}
            <div className="custom-scrollbar-dark" style={{ padding: '16px', background: '#0F172A', color: '#F8FAFC', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={15} color="#38BDF8" />
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94A3B8' }}>
                    Live Response Console
                  </span>
                </div>

                {response && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: response.statusCode >= 200 && response.statusCode < 300 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: response.statusCode >= 200 && response.statusCode < 300 ? '#34D399' : '#F87171',
                      border: `1px solid ${response.statusCode >= 200 && response.statusCode < 300 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                    }}>
                      Status: {response.statusCode || 200}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#38BDF8',
                      background: 'rgba(56, 189, 248, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {response.latencyMs || 24} ms
                    </span>
                  </div>
                )}
              </div>

              {response ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(response.responsePayload || response, null, 2));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      style={{
                        border: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#CBD5E1',
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copied ? <Check size={12} color="#34D399" /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre style={{
                    margin: 0,
                    fontSize: '11.5px',
                    fontFamily: 'monospace',
                    color: '#34D399',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '12px',
                    borderRadius: '8px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    flex: 1
                  }}>
                    {JSON.stringify(response.responsePayload || response, null, 2)}
                  </pre>
                </div>
              ) : (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  <Play size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                    No Request Executed Yet
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', maxWidth: '320px', lineHeight: '1.4' }}>
                    Click <strong>"Run Test"</strong> above to send live request with active parameters and inspect raw JSON payloads.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
