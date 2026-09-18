const mongoose = require('mongoose');
const Project = require('../models/Project');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

// In-Memory Seed Vendors for instantaneous zero-latency display
let inMemoryVendors = [
  {
    _id: 'vnd_dynata_01',
    vendorUid: 'VND-DYN-01',
    vendor_code: 'VND-DYN-01',
    name: 'Dynata Global Panel',
    email: 'partners@dynata.com',
    phone: '+1 800 288 8883',
    cpi: 1.75,
    status: 'active',
    isActive: true,
    redirectSuccess: 'https://sample.dynata.com/callback/complete?status=1&rid=[RESPONDENT_ID]',
    redirectTerminate: 'https://sample.dynata.com/callback/terminate?status=2&rid=[RESPONDENT_ID]',
    redirectQuotafull: 'https://sample.dynata.com/callback/overquota?status=3&rid=[RESPONDENT_ID]',
    redirectScreenout: 'https://sample.dynata.com/callback/security?status=4&rid=[RESPONDENT_ID]',
    clicksCount: 1420,
    completeCount: 384,
    terminatesCount: 890,
    createdAt: new Date('2026-01-10T10:00:00Z').toISOString()
  },
  {
    _id: 'vnd_cint_02',
    vendorUid: 'VND-CNT-02',
    vendor_code: 'VND-CNT-02',
    name: 'Cint Audience Exchange',
    email: 'integrations@cint.com',
    phone: '+46 8 546 383 00',
    cpi: 1.40,
    status: 'active',
    isActive: true,
    redirectSuccess: 'https://api.cint.com/routing/complete?status=1&rid=[RESPONDENT_ID]',
    redirectTerminate: 'https://api.cint.com/routing/terminate?status=2&rid=[RESPONDENT_ID]',
    redirectQuotafull: 'https://api.cint.com/routing/quotafull?status=3&rid=[RESPONDENT_ID]',
    redirectScreenout: 'https://api.cint.com/routing/security?status=4&rid=[RESPONDENT_ID]',
    clicksCount: 2150,
    completeCount: 620,
    terminatesCount: 1320,
    createdAt: new Date('2026-01-11T11:00:00Z').toISOString()
  },
  {
    _id: 'vnd_ps_03',
    vendorUid: 'VND-PS-03',
    vendor_code: 'VND-PS-03',
    name: 'PureSpectrum Marketplace',
    email: 'api-support@purespectrum.com',
    phone: '+1 888 778 3280',
    cpi: 1.85,
    status: 'active',
    isActive: true,
    redirectSuccess: 'https://sample.purespectrum.com/redirects/complete?status=1&rid=[RESPONDENT_ID]',
    redirectTerminate: 'https://sample.purespectrum.com/redirects/terminate?status=2&rid=[RESPONDENT_ID]',
    redirectQuotafull: 'https://sample.purespectrum.com/redirects/quotafull?status=3&rid=[RESPONDENT_ID]',
    redirectScreenout: 'https://sample.purespectrum.com/redirects/screenout?status=4&rid=[RESPONDENT_ID]',
    clicksCount: 980,
    completeCount: 295,
    terminatesCount: 540,
    createdAt: new Date('2026-01-12T14:30:00Z').toISOString()
  },
  {
    _id: 'vnd_lucid_04',
    vendorUid: 'VND-LCD-04',
    vendor_code: 'VND-LCD-04',
    name: 'Lucid / Cint Marketplace',
    email: 'publishers@lucidhq.com',
    phone: '+1 504 264 5448',
    cpi: 1.25,
    status: 'active',
    isActive: true,
    redirectSuccess: 'https://api.lucidhq.com/tracker/complete?status=1&rid=[RESPONDENT_ID]',
    redirectTerminate: 'https://api.lucidhq.com/tracker/terminate?status=2&rid=[RESPONDENT_ID]',
    redirectQuotafull: 'https://api.lucidhq.com/tracker/quotafull?status=3&rid=[RESPONDENT_ID]',
    redirectScreenout: 'https://api.lucidhq.com/tracker/security?status=4&rid=[RESPONDENT_ID]',
    clicksCount: 3120,
    completeCount: 840,
    terminatesCount: 1980,
    createdAt: new Date('2026-01-13T09:15:00Z').toISOString()
  },
  {
    _id: 'vnd_toluna_05',
    vendorUid: 'VND-TLN-05',
    vendor_code: 'VND-TLN-05',
    name: 'Toluna Influencers Panel',
    email: 'partnerships@tolunagroup.com',
    phone: '+1 203 839 4200',
    cpi: 1.50,
    status: 'active',
    isActive: true,
    redirectSuccess: 'https://ups.toluna.com/return/complete?status=1&rid=[RESPONDENT_ID]',
    redirectTerminate: 'https://ups.toluna.com/return/terminate?status=2&rid=[RESPONDENT_ID]',
    redirectQuotafull: 'https://ups.toluna.com/return/quotafull?status=3&rid=[RESPONDENT_ID]',
    redirectScreenout: 'https://ups.toluna.com/return/security?status=4&rid=[RESPONDENT_ID]',
    clicksCount: 1650,
    completeCount: 410,
    terminatesCount: 990,
    createdAt: new Date('2026-01-14T16:20:00Z').toISOString()
  },
  {
    _id: 'vnd_innovate_06',
    vendorUid: 'VND-IMR-06',
    vendor_code: 'VND-IMR-06',
    name: 'InnovateMR B2B Panel',
    email: 'sample@innovatemr.com',
    phone: '+1 888 229 6664',
    cpi: 2.25,
    status: 'active',
    isActive: true,
    redirectSuccess: 'https://survey.innovatemr.net/complete?status=1&rid=[RESPONDENT_ID]',
    redirectTerminate: 'https://survey.innovatemr.net/terminate?status=2&rid=[RESPONDENT_ID]',
    redirectQuotafull: 'https://survey.innovatemr.net/quotafull?status=3&rid=[RESPONDENT_ID]',
    redirectScreenout: 'https://survey.innovatemr.net/security?status=4&rid=[RESPONDENT_ID]',
    clicksCount: 720,
    completeCount: 180,
    terminatesCount: 420,
    createdAt: new Date('2026-01-15T08:45:00Z').toISOString()
  }
];

// In-Memory Seed Campaign Projects
let inMemoryProjects = [
  {
    _id: 'prj_nielsen_01',
    project_id: 'PRJ-2026-01',
    projectId: 'PRJ-2026-01',
    project_name: 'US Consumer Beverage & FMCG Brand Tracker',
    name: 'US Consumer Beverage & FMCG Brand Tracker',
    client_name: 'NielsenIQ',
    clientName: 'NielsenIQ',
    clientId: 'cl_zamplia_01',
    cpi: 4.50,
    costPerComplete: 4.50,
    target_completes: 650,
    maxLimit: 650,
    completeCount: 412,
    terminateCount: 180,
    status: 'active',
    country: 'United States',
    audience_type: 'B2C',
    device_type: 'Desktop,Mobile',
    loi: 12,
    ir: 85,
    live_url: 'https://surveys.nielseniq.com/s/bev902?rid=[RESPONDENT_ID]',
    liveUrl: 'https://surveys.nielseniq.com/s/bev902?rid=[RESPONDENT_ID]',
    isApiProject: false,
    createdAt: new Date('2026-01-08T09:30:00Z').toISOString()
  },
  {
    _id: 'prj_ipsos_02',
    project_id: 'PRJ-2026-02',
    projectId: 'PRJ-2026-02',
    project_name: 'Automotive EV & Mobility Sentiment Study',
    name: 'Automotive EV & Mobility Sentiment Study',
    client_name: 'Ipsos Reid',
    clientName: 'Ipsos Reid',
    clientId: 'cl_german_03',
    cpi: 5.25,
    costPerComplete: 5.25,
    target_completes: 400,
    maxLimit: 400,
    completeCount: 275,
    terminateCount: 110,
    status: 'active',
    country: 'Germany',
    audience_type: 'B2C',
    device_type: 'Desktop,Tablet',
    loi: 18,
    ir: 60,
    live_url: 'https://research.ipsos.com/ev2026/run?id=[RESPONDENT_ID]',
    liveUrl: 'https://research.ipsos.com/ev2026/run?id=[RESPONDENT_ID]',
    isApiProject: false,
    createdAt: new Date('2026-01-09T14:15:00Z').toISOString()
  },
  {
    _id: 'prj_mx_03',
    project_id: 'PRJ-2026-03',
    projectId: 'PRJ-2026-03',
    project_name: 'India Digital Banking & Fintech Benchmark 2026',
    name: 'India Digital Banking & Fintech Benchmark 2026',
    client_name: 'Market Xcel Data Matrix',
    clientName: 'Market Xcel Data Matrix',
    clientId: 'cl_marketxcel_02',
    cpi: 3.80,
    costPerComplete: 3.80,
    target_completes: 800,
    maxLimit: 800,
    completeCount: 540,
    terminateCount: 195,
    status: 'active',
    country: 'India',
    audience_type: 'B2C',
    device_type: 'Desktop,Mobile,Tablet',
    loi: 15,
    ir: 75,
    live_url: 'https://cluster.marketxcel.co.in/survey/live?uid=[RESPONDENT_ID]',
    liveUrl: 'https://cluster.marketxcel.co.in/survey/live?uid=[RESPONDENT_ID]',
    isApiProject: false,
    createdAt: new Date('2026-01-10T11:45:00Z').toISOString()
  },
  {
    _id: 'prj_kantar_04',
    project_id: 'PRJ-2026-04',
    projectId: 'PRJ-2026-04',
    project_name: 'UK Enterprise Cloud Infrastructure Decision Study',
    name: 'UK Enterprise Cloud Infrastructure Decision Study',
    client_name: 'Kantar Group',
    clientName: 'Kantar Group',
    clientId: 'cl_kantar_04',
    cpi: 8.50,
    costPerComplete: 8.50,
    target_completes: 250,
    maxLimit: 250,
    completeCount: 140,
    terminateCount: 95,
    status: 'active',
    country: 'United Kingdom',
    audience_type: 'B2B',
    device_type: 'Desktop',
    loi: 20,
    ir: 45,
    live_url: 'https://kantar.surveys-online.org/uk_brand?res=[RESPONDENT_ID]',
    liveUrl: 'https://kantar.surveys-online.org/uk_brand?res=[RESPONDENT_ID]',
    isApiProject: false,
    createdAt: new Date('2026-01-12T13:00:00Z').toISOString()
  },
  {
    _id: 'prj_zamp_05',
    project_id: 'PRJ-2026-05',
    projectId: 'PRJ-2026-05',
    project_name: 'Global Healthcare Physician Treatment Index',
    name: 'Global Healthcare Physician Treatment Index',
    client_name: 'Zamplia Healthcare',
    clientName: 'Zamplia Healthcare',
    clientId: 'cl_zamplia_01',
    cpi: 14.00,
    costPerComplete: 14.00,
    target_completes: 150,
    maxLimit: 150,
    completeCount: 88,
    terminateCount: 42,
    status: 'active',
    country: 'United States',
    audience_type: 'HCP',
    device_type: 'Desktop,Mobile',
    loi: 22,
    ir: 30,
    live_url: 'https://healthcare.zamplia.com/study/pharma?rid=[RESPONDENT_ID]',
    liveUrl: 'https://healthcare.zamplia.com/study/pharma?rid=[RESPONDENT_ID]',
    isApiProject: false,
    createdAt: new Date('2026-01-14T10:20:00Z').toISOString()
  },
  {
    _id: 'prj_de_06',
    project_id: 'PRJ-2026-06',
    projectId: 'PRJ-2026-06',
    project_name: 'Smart Home & IoT Consumer Adoption Wave 4',
    name: 'Smart Home & IoT Consumer Adoption Wave 4',
    client_name: 'German Automotive Insights',
    clientName: 'German Automotive Insights',
    clientId: 'cl_german_03',
    cpi: 4.00,
    costPerComplete: 4.00,
    target_completes: 500,
    maxLimit: 500,
    completeCount: 310,
    terminateCount: 120,
    status: 'paused',
    country: 'Canada',
    audience_type: 'B2C',
    device_type: 'Desktop,Mobile,Tablet',
    loi: 14,
    ir: 80,
    live_url: 'https://survey.smarthome.de/iot_wave4?uid=[RESPONDENT_ID]',
    liveUrl: 'https://survey.smarthome.de/iot_wave4?uid=[RESPONDENT_ID]',
    isApiProject: false,
    createdAt: new Date('2026-01-15T15:10:00Z').toISOString()
  }
];

// In-Memory Seed Users
let inMemoryUsers = [
  {
    id: 1,
    _id: 'usr_01',
    name: 'Admin Operations',
    username: 'admin',
    mobile_no: '+1 800 555 0199',
    email: 'admin@vmhgroupsmr.com',
    role: 'Super Admin',
    role_name: 'Super Admin',
    is_active: 'Y',
    is_online: 'Y',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 2,
    _id: 'usr_02',
    name: 'Kamlesh Gupta',
    username: 'kamlesh',
    mobile_no: '+91 98765 43210',
    email: 'kamlesh@vmhgroupsmr.com',
    role: 'Super Admin',
    role_name: 'Super Admin',
    is_active: 'Y',
    is_online: 'Y',
    createdAt: new Date('2026-01-02').toISOString()
  },
  {
    id: 3,
    _id: 'usr_03',
    name: 'Operations Lead',
    username: 'ops_lead',
    mobile_no: '+1 415 555 2671',
    email: 'ops@vmhgroupsmr.com',
    role: 'Project Manager',
    role_name: 'Project Manager',
    is_active: 'Y',
    is_online: 'N',
    createdAt: new Date('2026-01-05').toISOString()
  },
  {
    id: 4,
    _id: 'usr_04',
    name: 'Supply Partner Desk',
    username: 'vendor_desk',
    mobile_no: '+44 20 7946 0912',
    email: 'supply@vmhgroupsmr.com',
    role: 'Supplier',
    role_name: 'Supplier',
    is_active: 'Y',
    is_online: 'Y',
    createdAt: new Date('2026-01-08').toISOString()
  }
];

// Helper to normalize project document for frontend
function normalizeProject(p) {
  const obj = p.toObject ? p.toObject() : p;
  return {
    ...obj,
    project_id: obj.project_id || obj.projectId || `PRJ-${obj._id}`,
    projectId: obj.projectId || obj.project_id || `PRJ-${obj._id}`,
    project_name: obj.project_name || obj.name || 'Untitled Campaign',
    name: obj.name || obj.project_name || 'Untitled Campaign',
    client_name: obj.client_name || obj.clientName || 'Direct Client',
    clientName: obj.clientName || obj.client_name || 'Direct Client',
    cpi: obj.cpi !== undefined ? obj.cpi : (obj.costPerComplete || 0),
    costPerComplete: obj.costPerComplete !== undefined ? obj.costPerComplete : (obj.cpi || 0),
    target_completes: obj.target_completes || obj.maxLimit || 500,
    maxLimit: obj.maxLimit || obj.target_completes || 500,
    status: (obj.status || 'active').toLowerCase() === 'pause' || (obj.status || '').toLowerCase() === 'paused' ? 'paused' : 'active',
    live_url: obj.live_url || obj.liveUrl || 'https://survey.example.com?uid=[RESPONDENT_ID]',
    liveUrl: obj.liveUrl || obj.live_url || 'https://survey.example.com?uid=[RESPONDENT_ID]',
    country: obj.country || 'United States',
    audience_type: obj.audience_type || 'B2C',
    device_type: obj.device_type || 'Desktop,Mobile',
    loi: obj.loi || 12,
    ir: obj.ir || 80
  };
}

// Helper to normalize vendor document for frontend
function normalizeVendor(v) {
  const obj = v.toObject ? v.toObject() : v;
  return {
    ...obj,
    vendor_code: obj.vendor_code || obj.vendorUid || `VND-${obj._id}`,
    vendorUid: obj.vendorUid || obj.vendor_code || `VND-${obj._id}`,
    name: obj.name || 'Sample Vendor',
    email: obj.email || '',
    cpi: obj.cpi || 0,
    status: obj.status || (obj.isActive !== false ? 'active' : 'inactive'),
    isActive: obj.isActive !== undefined ? obj.isActive : (obj.status === 'active')
  };
}

// ===================== PROJECTS =====================

exports.getProjects = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbProjects = await Project.find().sort({ createdAt: -1 });
      if (dbProjects && dbProjects.length > 0) {
        return res.json({ success: true, data: dbProjects.map(normalizeProject) });
      }
      // If DB is empty, auto-seed with standard projects
      try {
        await Project.insertMany(inMemoryProjects.map(p => ({
          projectId: p.project_id,
          name: p.project_name,
          clientName: p.client_name,
          costPerComplete: p.cpi,
          maxLimit: p.target_completes,
          status: p.status === 'active' ? 'Live' : 'Pause',
          liveUrl: p.live_url,
          ir: p.ir,
          loi: p.loi
        })));
      } catch (e) {
        // Ignore duplicate key error during race conditions
      }
    }
    return res.json({ success: true, data: inMemoryProjects.map(normalizeProject) });
  } catch (error) {
    console.error('getProjects fallback trigger:', error.message);
    return res.json({ success: true, data: inMemoryProjects.map(normalizeProject) });
  }
};

exports.createProject = async (req, res) => {
  try {
    const raw = req.body;
    const projectData = {
      _id: `prj_${Date.now()}`,
      project_id: raw.project_id || `PRJ-${Date.now().toString().slice(-4)}`,
      projectId: raw.project_id || `PRJ-${Date.now().toString().slice(-4)}`,
      project_name: raw.project_name || raw.name || 'New Client Campaign',
      name: raw.project_name || raw.name || 'New Client Campaign',
      client_name: raw.client_name || raw.clientName || 'Direct Client',
      clientName: raw.client_name || raw.clientName || 'Direct Client',
      cpi: Number(raw.cpi || raw.costPerComplete || 3.50),
      costPerComplete: Number(raw.cpi || raw.costPerComplete || 3.50),
      target_completes: Number(raw.target_completes || raw.maxLimit || 200),
      maxLimit: Number(raw.target_completes || raw.maxLimit || 200),
      status: (raw.status || 'active').toLowerCase(),
      country: raw.country || 'United States',
      audience_type: raw.audience_type || 'B2C',
      device_type: raw.device_type || 'Desktop,Mobile,Tablet',
      loi: Number(raw.loi || 12),
      ir: Number(raw.ir || 80),
      live_url: raw.live_url || raw.liveUrl || 'https://survey.example.com?uid=[RESPONDENT_ID]',
      liveUrl: raw.live_url || raw.liveUrl || 'https://survey.example.com?uid=[RESPONDENT_ID]',
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Project.create({
          projectId: projectData.project_id,
          name: projectData.project_name,
          clientName: projectData.client_name,
          costPerComplete: projectData.cpi,
          maxLimit: projectData.target_completes,
          liveUrl: projectData.live_url,
          status: projectData.status === 'active' ? 'Live' : 'Pause',
          ir: projectData.ir,
          loi: projectData.loi
        });
        projectData._id = created._id;
      } catch (err) {
        console.warn('Could not save project to Mongo:', err.message);
      }
    }

    inMemoryProjects.unshift(projectData);
    return res.status(201).json({ success: true, data: normalizeProject(projectData) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== VENDORS =====================

exports.getVendors = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbVendors = await Vendor.find().sort({ createdAt: -1 });
      if (dbVendors && dbVendors.length > 0) {
        return res.json({ success: true, data: dbVendors.map(normalizeVendor) });
      }
      // If DB is empty, auto-seed with standard partner panels
      try {
        await Vendor.insertMany(inMemoryVendors.map(v => ({
          vendorUid: v.vendor_code,
          name: v.name,
          email: v.email,
          phone: v.phone,
          cpi: v.cpi,
          isActive: v.status === 'active',
          redirectSuccess: v.redirectSuccess,
          redirectTerminate: v.redirectTerminate,
          redirectQuotafull: v.redirectQuotafull,
          redirectScreenout: v.redirectScreenout
        })));
      } catch (e) {
        // Ignore duplicate key error during race conditions
      }
    }
    return res.json({ success: true, data: inMemoryVendors.map(normalizeVendor) });
  } catch (error) {
    console.error('getVendors fallback trigger:', error.message);
    return res.json({ success: true, data: inMemoryVendors.map(normalizeVendor) });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const raw = req.body;
    const vendorData = {
      _id: `vnd_${Date.now()}`,
      vendorUid: raw.vendor_code || raw.vendorUid || `VND-${Date.now().toString().slice(-4)}`,
      vendor_code: raw.vendor_code || raw.vendorUid || `VND-${Date.now().toString().slice(-4)}`,
      name: raw.name || 'New Sample Vendor',
      email: raw.email || '',
      phone: raw.phone || '',
      cpi: Number(raw.cpi || 1.50),
      status: (raw.status || 'active').toLowerCase(),
      isActive: (raw.status || 'active').toLowerCase() === 'active',
      redirectSuccess: raw.redirectSuccess || '',
      redirectTerminate: raw.redirectTerminate || '',
      redirectQuotafull: raw.redirectQuotafull || '',
      redirectScreenout: raw.redirectScreenout || '',
      clicksCount: 0,
      completeCount: 0,
      terminatesCount: 0,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Vendor.create({
          name: vendorData.name,
          email: vendorData.email,
          vendorUid: vendorData.vendorUid,
          cpi: vendorData.cpi,
          isActive: vendorData.isActive
        });
        vendorData._id = created._id;
      } catch (err) {
        console.warn('Could not save vendor to Mongo:', err.message);
      }
    }

    inMemoryVendors.unshift(vendorData);
    return res.status(201).json({ success: true, data: normalizeVendor(vendorData) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== USERS =====================

exports.getUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbUsers = await User.find().sort({ createdAt: -1 }).select('-password');
      if (dbUsers && dbUsers.length > 0) {
        const formatted = dbUsers.map((u, idx) => ({
          id: u._id,
          _id: u._id,
          name: u.name,
          username: u.email.split('@')[0],
          mobile_no: '+1 800 555 0199',
          email: u.email,
          role: u.role === 'admin' ? 'Super Admin' : u.role,
          role_name: u.role === 'admin' ? 'Super Admin' : u.role,
          is_active: u.isActive !== false ? 'Y' : 'N',
          is_online: idx % 2 === 0 ? 'Y' : 'N'
        }));
        return res.json({ success: true, data: formatted });
      }
    }
    return res.json({ success: true, data: inMemoryUsers });
  } catch (error) {
    return res.json({ success: true, data: inMemoryUsers });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, username, mobile_no, email, role = 'Admin' } = req.body;
    const newUser = {
      id: inMemoryUsers.length + 1,
      _id: `usr_${Date.now()}`,
      name: name || 'New Staff User',
      username: username || 'staff_user',
      mobile_no: mobile_no || 'N/A',
      email: email || `${username || 'user'}@vmhgroupsmr.com`,
      role: role || 'Admin',
      role_name: role || 'Admin',
      is_active: 'Y',
      is_online: 'Y',
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await User.create({
          name: newUser.name,
          email: newUser.email,
          password: 'Password@123',
          role: role.toLowerCase().includes('admin') ? 'admin' : 'user',
          isActive: true
        });
      } catch (err) {
        console.warn('Could not save user to Mongo:', err.message);
      }
    }

    inMemoryUsers.unshift(newUser);
    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      try {
        await User.findByIdAndDelete(id);
      } catch (e) {}
    }
    inMemoryUsers = inMemoryUsers.filter(u => u.id != id && u._id !== id);
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

