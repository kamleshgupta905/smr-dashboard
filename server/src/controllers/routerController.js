const Lead = require('../models/Lead');
const Vendor = require('../models/Vendor');
const Project = require('../models/Project');
const VendorEntryLink = require('../models/VendorEntryLink');
const zampliaService = require('../services/zampliaService');

/**
 * High-speed Vendor Authentication and Click Router
 * Route: GET /vendor/auth/:vendor_id/project/:project_id
 */
exports.handleVendorClick = async (req, res) => {
  try {
    const { vendor_id, project_id } = req.params;
    const uid = req.query.uid || req.query.rid || req.query.transaction_id || `usr_${Date.now()}`;
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Asynchronously log lead session
    Lead.create({
      projectId: project_id,
      vendorId: vendor_id,
      uid,
      ipAddress,
      userAgent,
      status: 'Pending',
      clickTime: new Date(),
    }).catch(console.error);

    // Increment vendor clicks count
    Vendor.findOneAndUpdate({ vendorUid: vendor_id }, { $inc: { clicksCount: 1 } }).catch(console.error);

    // Look for generated link in database
    let linkRecord = await VendorEntryLink.findOne({ vendorId: vendor_id, projectId: project_id });

    let targetUrl = linkRecord?.liveUrl || linkRecord?.entryLink;

    // If not found in DB and looks like a Zamplia survey ID, generate dynamically
    if (!targetUrl && !isNaN(project_id)) {
      const genRes = await zampliaService.generateLink(project_id, ipAddress, uid);
      targetUrl = genRes.data?.[0]?.SignedLiveLink || genRes.data?.[0]?.LiveLink;
    }

    if (!targetUrl) {
      return res.status(404).send('<h3>Survey link not found or survey has expired.</h3>');
    }

    // Replace dynamic UID placeholder if present
    let finalUrl = targetUrl
      .replace(/\[#UID#\]/g, uid)
      .replace(/vmhgroupss/g, uid)
      .replace(/vmhgroups/g, uid);

    if (!finalUrl.includes(uid)) {
      const sep = finalUrl.includes('?') ? '&' : '?';
      finalUrl += `${sep}RID=${encodeURIComponent(uid)}`;
    }

    return res.redirect(302, finalUrl);
  } catch (error) {
    console.error('Router Error:', error);
    return res.status(500).send('Error routing to survey.');
  }
};

/**
 * Handle Complete Callback
 * Route: GET /redirects/c/:client_id/complete
 */
exports.handleComplete = async (req, res) => {
  try {
    const uid = req.query.username || req.query.uid || req.query.rid;
    if (!uid) return res.status(400).send('Missing participant identifier');

    const lead = await Lead.findOneAndUpdate(
      { uid },
      { status: 'Complete', completionTime: new Date() },
      { new: true }
    );

    let redirectUrl = 'https://surveyroutervmhgroupsmr.site/survey-complete';

    if (lead) {
      const vendor = await Vendor.findOne({ vendorUid: lead.vendorId });
      if (vendor) {
        vendor.completeCount = (vendor.completeCount || 0) + 1;
        await vendor.save();

        if (vendor.redirectSuccess) {
          redirectUrl = vendor.redirectSuccess.replace(/vmhgroupss/g, uid).replace(/vmhgroups/g, uid);
        }
      }
    }

    return res.redirect(302, redirectUrl);
  } catch (error) {
    return res.status(500).send('Error processing complete redirect.');
  }
};

/**
 * Handle Terminate Callback
 * Route: GET /redirects/c/:client_id/terminate
 */
exports.handleTerminate = async (req, res) => {
  try {
    const uid = req.query.username || req.query.uid || req.query.rid;
    if (uid) {
      await Lead.findOneAndUpdate({ uid }, { status: 'Terminates', completionTime: new Date() });
    }

    let redirectUrl = 'https://surveyroutervmhgroupsmr.site/survey-terminate';
    return res.redirect(302, redirectUrl);
  } catch (error) {
    return res.status(500).send('Error processing terminate redirect.');
  }
};

/**
 * Handle Quota Full Callback
 * Route: GET /redirects/c/:client_id/quotafull
 */
exports.handleQuotaFull = async (req, res) => {
  try {
    const uid = req.query.username || req.query.uid || req.query.rid;
    if (uid) {
      await Lead.findOneAndUpdate({ uid }, { status: 'Quota Full', completionTime: new Date() });
    }

    let redirectUrl = 'https://surveyroutervmhgroupsmr.site/survey-quotafull';
    return res.redirect(302, redirectUrl);
  } catch (error) {
    return res.status(500).send('Error processing quotafull redirect.');
  }
};
