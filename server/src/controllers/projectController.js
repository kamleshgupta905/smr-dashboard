const Project = require('../models/Project');
const Vendor = require('../models/Vendor');
const VendorEntryLink = require('../models/VendorEntryLink');
const zampliaService = require('../services/zampliaService');

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get vendors list
exports.getVendors = async (req, res) => {
  try {
    let vendors = await Vendor.find();
    if (vendors.length === 0) {
      // Seed sample vendors if none exist
      vendors = await Vendor.create([
        { name: 'Toluna Panel', vendorUid: 'v_toluna', cpi: 1.5 },
        { name: 'Cint Audience', vendorUid: 'v_cint', cpi: 1.8 },
        { name: 'Dynata Global', vendorUid: 'v_dynata', cpi: 2.0 },
      ]);
    }
    return res.json({ success: true, data: vendors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create vendor
exports.createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    return res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
