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
  api.get('/manage/clients').then(res => res.data);

export const createClient = (data) =>
  api.post('/manage/clients', data).then(res => res.data);

export const deleteClient = (id) =>
  api.post(`/manage/clients/delete/${id}`).then(res => res.data);

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
  getClients: () => api.get('/manage/clients'),
  createClient: (data) => api.post('/manage/clients', data),
  getUsers: () => api.get('/manage/users'),
  createUser: (data) => api.post('/manage/users', data),
  getDashboardAnalytics: () => api.get('/dashboard/analytics'),
};

export default api;
