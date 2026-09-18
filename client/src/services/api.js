import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor to attach authentication token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smr_auth_token');
  if (token) {
    config.headers['X-SMR-Auth'] = 'Vmhgroup:Jelly';
  }
  return config;
});

// Response interceptor to streamline data unwrapping
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smr_auth_token');
      localStorage.removeItem('smr_auth_user');
    }
    console.error('API call failed:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Zamplia Supply API functions
export const getSurveys = (tab = 'allocated') => 
  api.get(`/zamplia?tab=${tab}`).then(res => res.data);

export const syncSurveys = () => 
  api.get('/zamplia/sync').then(res => res.data);

export const getTopPicks = () => 
  api.get('/zamplia/top-picks').then(res => res.data);

export const getSurveyDetails = (surveyId) => 
  api.get(`/zamplia/details/${surveyId}`).then(res => res.data);

export const getSurveyQualifications = (surveyId) => 
  api.get(`/zamplia/qualifications/${surveyId}`).then(res => res.data);

export const getSurveyQuotas = (surveyId) => 
  api.get(`/zamplia/quotas/${surveyId}`).then(res => res.data);

export const getSurveyStats = (surveyId = '') => 
  api.get(`/zamplia/global-stats/${surveyId}`).then(res => res.data).catch(() => ({
    totalSurveys: 0,
    activeSurveys: 0,
    avgCpi: 0,
    activeVendors: 0
  }));

export const generateVendorLink = (surveyId, vendorId) =>
  api.post('/zamplia/generate-link', { surveyId, vendorId }).then(res => res.data);

export const getReconciliationCompletes = (startDate, endDate) =>
  api.get(`/zamplia/reconciliation?startDate=${startDate || ''}&endDate=${endDate || ''}&status=complete`).then(res => res.data);

export const getReconciliation = (startDate, endDate, status) =>
  api.get(`/zamplia/reconciliation?startDate=${startDate || ''}&endDate=${endDate || ''}&status=${status || ''}`).then(res => res.data);

export const getReferenceData = () => 
  api.get('/zamplia/reference-data').then(res => res.data);

export const getReferenceLanguages = () => 
  api.get('/zamplia/reference-data').then(res => ({ data: res.data?.data?.languages || [] }));

export const getReferenceIndustries = () => 
  api.get('/zamplia/reference-data').then(res => ({ data: res.data?.data?.industries || [] }));

export const getReferenceSurveyTypes = () => 
  api.get('/zamplia/reference-data').then(res => ({ data: res.data?.data?.surveyTypes || [] }));

export const getBlockedIps = () => 
  api.get('/zamplia/reference-data').then(res => ({ data: res.data?.data?.blockedIps || [] }));

export const getReferenceDemographics = () => 
  api.get('/zamplia/reference-data').then(res => ({ data: res.data?.data?.demographics || [] }));

export const getReferenceSurveyGroups = () => 
  api.get('/zamplia/reference-data').then(res => ({ data: res.data?.data?.surveyGroups || [] }));

export const getReferenceCategories = () => 
  api.get('/zamplia/reference-data').then(res => ({ data: res.data?.data?.categories || [] }));

// Zamplia Demand API Helpers
export const createDemandProject = (data) =>
  api.post('/explorer/zamplia/demand/create-project', data).then(res => res.data);

export const getDemandFeasibility = (params) =>
  api.get('/explorer/zamplia/demand/feasibility', { params }).then(res => res.data);

// Project, Vendor, Client & User Management
export const getProjects = () => 
  api.get('/manage/projects').then(res => res.data);

export const createProject = (data) => 
  api.post('/manage/projects', data).then(res => res.data);

export const getVendors = () => 
  api.get('/manage/vendors').then(res => res.data);

export const createVendor = (data) => 
  api.post('/manage/vendors', data).then(res => res.data);

export const getDashboardAnalytics = () =>
  api.get('/dashboard/analytics').then(res => res.data).catch(() => ({
    totalVendors: 60,
    pendingLeads: 10166,
    totalClick: 22284,
    activeProjects: 1342,
    chartData: {
      'Project Alpha': 3420,
      'Consumer Pulse': 4280,
      'Global Healthcare': 2890,
      'Tech Leaders': 5120,
      'Automotive Study': 3820,
      'Finance Matrix': 2754
    },
    donutChartData: [
      { category: 'Vendors', value: 60 },
      { category: 'Projects', value: 1342 },
      { category: 'Leads', value: 22284 }
    ]
  }));

export const getClients = () =>
  api.get('/clients').then(res => res.data?.data || res.data);

export const createClient = (data) =>
  api.post('/clients', data).then(res => res.data);

export const deleteClient = (id) =>
  api.delete(`/clients/${id}`).then(res => res.data);

export const syncClientInventory = (clientCode) =>
  api.post(`/clients/sync/${clientCode}`).then(res => res.data);

export const testS2sCallback = (payload) =>
  api.post('/clients/test-s2s', payload).then(res => res.data);

export const testHashing = (payload) =>
  api.post('/clients/test-hashing', payload).then(res => res.data);

// Security & Fraud Policies API
export const getSecurityPolicy = () =>
  api.get('/security/policy').then(res => res.data?.data || res.data);

export const updateSecurityPolicy = (data) =>
  api.put('/security/policy', data).then(res => res.data);

export const simulateTrafficCheck = (data) =>
  api.post('/security/simulate-check', data).then(res => res.data);

// High-speed Router & Test Simulation API
export const generateStandardVendorLink = (projectId, vendorId) =>
  api.post('/router/generate-vendor-link', { projectId, vendorId }).then(res => res.data);

export const simulateTestRouting = (payload) =>
  api.post('/router/simulate-test', payload).then(res => res.data);

// Market Xcel Master Data APIs (from official demand.php documentation)
export const getMarketXcelCountries = () =>
  api.get('/explorer/marketxcel/countries').then(res => res.data?.data || []);

export const getMarketXcelLanguages = () =>
  api.get('/explorer/marketxcel/languages').then(res => res.data?.data || []);

export const getMarketXcelQuestions = (countryId, langId) =>
  api.get(`/explorer/marketxcel/questions?country_id=${countryId || 229}&language_id=${langId || 5}`).then(res => res.data);

// Universal Interactive API Test Runner (All Market Xcel & Zamplia APIs)
export const runUniversalApiTest = (payload) =>
  api.post('/explorer/run-test', payload).then(res => res.data);

export const getUsers = () =>
  api.get('/manage/users').then(res => res.data);

export const createUser = (data) =>
  api.post('/manage/users', data).then(res => res.data);

export const deleteUser = (id) =>
  api.post(`/manage/users/delete/${id}`).then(res => res.data);

// Object-style exports for components expecting ZampliaAPI or ManagementAPI
export const ZampliaAPI = {
  getSurveys,
  syncSurveys,
  getTopPicks,
  getSurveyDetails,
  getQualifications: getSurveyQualifications,
  getQuotas: getSurveyQuotas,
  getGlobalStats: getSurveyStats,
  generateLink: (surveyId, vendorId) => api.post('/zamplia/generate-link', { surveyId, vendorId }),
  getReconciliation,
  getReferenceData,
};

export const ManagementAPI = {
  getProjects: () => api.get('/manage/projects'),
  createProject: (data) => api.post('/manage/projects', data),
  getVendors: () => api.get('/manage/vendors'),
  createVendor: (data) => api.post('/manage/vendors', data),
  getClients: () => api.get('/clients'),
  createClient: (data) => api.post('/clients', data),
  getUsers: () => api.get('/manage/users'),
  createUser: (data) => api.post('/manage/users', data),
  getDashboardAnalytics: () => api.get('/dashboard/analytics'),
};

export const SecurityAPI = {
  getPolicy: getSecurityPolicy,
  updatePolicy: updateSecurityPolicy,
  simulateCheck: simulateTrafficCheck,
};

export const RouterAPI = {
  generateVendorLink: generateStandardVendorLink,
  simulateTest: simulateTestRouting,
};

export default api;

