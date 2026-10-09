const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Vendor = require('../models/Vendor');
const VendorEntryLink = require('../models/VendorEntryLink');
const zampliaService = require('../services/zampliaService');
const marketXcelService = require('../services/marketXcelService');
const S2sService = require('../services/s2sService');
const HashingService = require('../services/hashingService');
const FraudService = require('../services/fraudService');

/**
 * High-speed Inbound Vendor Authentication and Click Router
 * Route: GET /vendor/auth/:vendor_id/project/:project_id
 */
exports.handleVendorClick = async (req, res) => {
  try {
    const { vendor_id, project_id } = req.params;
    const uid = req.query.uid || req.query.rid || req.query.transaction_id || `usr_${Date.now()}`;
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // 1. Run Pre-Click Fraud Screening
    const fraudEval = FraudService.evaluatePreClick({
      userAgent,
      ipAddress,
      allowedDevices: 'Desktop,Mobile,Tablet',
    });

    if (!fraudEval.passed) {
      console.warn(`[Router Blocked] UID=${uid}, Reason=${fraudEval.reason}`);
      return res.status(403).send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #DC2626;">Survey Access Restricted</h2>
          <p>${fraudEval.reason}</p>
        </div>
      `);
    }

    // 2. Asynchronously log lead session
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

    // 3. Find Survey Entry URL
    let targetUrl = '';
    const linkRecord = await VendorEntryLink.findOne({ vendorId: vendor_id, projectId: project_id }).catch(() => null);
    if (linkRecord?.liveUrl || linkRecord?.entryLink) {
      targetUrl = linkRecord.liveUrl || linkRecord.entryLink;
    }

    // If Market Xcel project (starts with MX-)
    if (!targetUrl && String(project_id).startsWith('MX-')) {
      const mxProjects = await marketXcelService.getAllocatedProjects();
      const match = mxProjects.data.find(p => p.survey_id === project_id);
      targetUrl = match?.entry_live_url || match?.entry_test_url;
    }

    // If Zamplia survey ID (numeric)
    if (!targetUrl && !isNaN(project_id)) {
      const genRes = await zampliaService.generateLink(project_id, ipAddress, uid);
      targetUrl = genRes.data?.[0]?.SignedLiveLink || genRes.data?.[0]?.LiveLink;
    }

    // Fallback sandbox destination if external link not active yet
    if (!targetUrl) {
      targetUrl = `http://localhost:5000/redirects/c/MX_DEMAND/complete?rid=${uid}&auth=1`;
    }

    // Replace dynamic UID placeholder if present
    let finalUrl = targetUrl
      .replace(/\[#UID#\]/g, uid)
      .replace(/\[identifier\]/g, uid)
      .replace(/\[RESPONDENT_ID\]/g, uid)
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
    const incomingHash = req.query.hash;
    const clientId = req.params.client_id || 'MX_DEMAND';

    if (!uid) return res.status(400).send('Missing participant identifier (uid/rid)');

    // 1. Speeder Check
    const lead = await Lead.findOne({ uid }).sort({ createdAt: -1 });
    let isSpeeder = false;
    if (lead) {
      const postEval = FraudService.evaluatePostComplete({
        clickTime: lead.clickTime || lead.createdAt,
        completionTime: new Date(),
        loi: 10,
      });
      if (postEval.isSpeeder) {
        isSpeeder = true;
      }
    }

    const finalStatus = isSpeeder ? 4 : 1; // 1 = Complete, 4 = Quality Terminate (Speeder)

    // 2. Dispatch Real-Time S2S Server-to-Server Callback
    S2sService.sendMarketXcelStatus({
      respondentId: uid,
      status: finalStatus,
    }).catch(console.error);

    // 3. Update Lead in Database
    if (lead) {
      lead.status = isSpeeder ? 'Quality Terminate (Speeder)' : 'Complete';
      lead.completionTime = new Date();
      await lead.save().catch(console.error);
    }

    // 4. Determine Vendor Destination URL
    let destinationUrl = `https://smr.vmhgroupsmr.com/survey/callback?status=10&uid=${uid}`;
    const vendor = lead ? await Vendor.findOne({ vendorUid: lead.vendorId }) : null;

    if (vendor) {
      if (finalStatus === 1) {
        vendor.completeCount = (vendor.completeCount || 0) + 1;
        destinationUrl = vendor.redirectSuccess || destinationUrl;
      } else {
        vendor.terminatesCount = (vendor.terminatesCount || 0) + 1;
        destinationUrl = vendor.redirectScreenout || vendor.redirectTerminate || destinationUrl;
      }
      await vendor.save().catch(console.error);
    }

    // 5. Apply SHA3-256 Hashing if required
    let finalRedirectUrl = destinationUrl
      .replace(/\[#UID#\]/g, uid)
      .replace(/\[identifier\]/g, uid)
      .replace(/\[RESPONDENT_ID\]/g, uid)
      .replace(/vmhgroupss/g, uid)
      .replace(/vmhgroups/g, uid);

    if (!finalRedirectUrl.includes(uid)) {
      const sep = finalRedirectUrl.includes('?') ? '&' : '?';
      finalRedirectUrl += `${sep}uid=${encodeURIComponent(uid)}`;
    }

    const { finalUrl: hashedUrl } = HashingService.generateSha3Hash(finalRedirectUrl, 'mx_secret_sha3_key_2026');

    return res.redirect(302, hashedUrl);
  } catch (error) {
    console.error('Complete Redirect Error:', error);
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
    if (!uid) return res.status(400).send('Missing participant identifier');

    // Dispatch S2S status 2 (Terminate)
    S2sService.sendMarketXcelStatus({ respondentId: uid, status: 2 }).catch(console.error);

    Lead.findOneAndUpdate({ uid }, { status: 'Terminate', completionTime: new Date() }).catch(console.error);

    let redirectUrl = `https://smr.vmhgroupsmr.com/survey/callback?status=20&uid=${uid}`;
    const lead = await Lead.findOne({ uid });
    if (lead) {
      const vendor = await Vendor.findOne({ vendorUid: lead.vendorId });
      if (vendor?.redirectTerminate) {
        redirectUrl = vendor.redirectTerminate.replace(/\[#UID#\]/g, uid).replace(/vmhgroups/g, uid);
      }
    }

    return res.redirect(302, redirectUrl);
  } catch (error) {
    return res.status(500).send('Error processing terminate redirect.');
  }
};

/**
 * Handle QuotaFull Callback
 * Route: GET /redirects/c/:client_id/quotafull
 */
exports.handleQuotaFull = async (req, res) => {
  try {
    const uid = req.query.username || req.query.uid || req.query.rid;
    if (!uid) return res.status(400).send('Missing participant identifier');

    // Dispatch S2S status 3 (OverQuota)
    S2sService.sendMarketXcelStatus({ respondentId: uid, status: 3 }).catch(console.error);

    Lead.findOneAndUpdate({ uid }, { status: 'OverQuota', completionTime: new Date() }).catch(console.error);

    let redirectUrl = `https://smr.vmhgroupsmr.com/survey/callback?status=30&uid=${uid}`;
    const lead = await Lead.findOne({ uid });
    if (lead) {
      const vendor = await Vendor.findOne({ vendorUid: lead.vendorId });
      if (vendor?.redirectQuotafull) {
        redirectUrl = vendor.redirectQuotafull.replace(/\[#UID#\]/g, uid).replace(/vmhgroups/g, uid);
      }
    }

    return res.redirect(302, redirectUrl);
  } catch (error) {
    return res.status(500).send('Error processing quotafull redirect.');
  }
};

/**
 * Handle Quality / Security Terminate Callback
 * Route: GET /redirects/c/:client_id/quality_terminate
 */
exports.handleQualityTerminate = async (req, res) => {
  try {
    const uid = req.query.username || req.query.uid || req.query.rid;
    if (!uid) return res.status(400).send('Missing participant identifier');

    // Dispatch S2S status 4 (Security Terminate)
    S2sService.sendMarketXcelStatus({ respondentId: uid, status: 4 }).catch(console.error);

    Lead.findOneAndUpdate({ uid }, { status: 'Security Terminate', completionTime: new Date() }).catch(console.error);

    return res.status(403).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #DC2626;">Session Terminated</h2>
        <p>Security validation failed. Respondent identifier: ${uid}</p>
      </div>
    `);
  } catch (error) {
    return res.status(500).send('Error processing security terminate.');
  }
};

/**
 * Internal Live Traffic Ledger
 * Route: GET /api/router/leads?limit=100
 * Returns the most recent vendor clicks with outcomes — backs the
 * "Internal Live Traffic" reconciliation tab. Falls back to a
 * realistic sample when MongoDB is offline so the UI stays testable.
 */
exports.getRecentLeads = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);

    if (mongoose.connection.readyState === 1) {
      const leads = await Lead.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return res.json({
        success: true,
        source: 'mongodb',
        data: leads.map((l) => ({
          LeadId: l._id,
          SurveyId: l.projectId,
          VendorCode: l.vendorId,
          SupplierTransactionId: l.uid,
          EventDate: l.clickTime || l.createdAt,
          Status: l.status,
          DurationMinutes: l.completionTime && l.clickTime
            ? Math.round((new Date(l.completionTime) - new Date(l.clickTime)) / 60000)
            : null,
          IpAddress: l.ipAddress,
        })),
      });
    }

    // Offline fallback sample so the ledger UI works without MongoDB
    const now = Date.now();
    const sample = [
      { status: 'Complete', mins: 13, vendor: 'VND-DYN-01', survey: '90142' },
      { status: 'Pending', mins: null, vendor: 'VND-CNT-02', survey: '90144' },
      { status: 'Terminates', mins: 4, vendor: 'VND-PS-03', survey: 'MX-896' },
      { status: 'Quality Terminate', mins: 2, vendor: 'VND-DYN-01', survey: '90145' },
      { status: 'Complete', mins: 18, vendor: 'VND-LCD-04', survey: '90142' },
      { status: 'Quota Full', mins: 6, vendor: 'VND-CNT-02', survey: 'MX-896' },
      { status: 'Complete', mins: 11, vendor: 'VND-TLN-05', survey: '90144' },
      { status: 'Pending', mins: null, vendor: 'VND-DYN-01', survey: '90142' },
    ].map((row, i) => ({
      LeadId: `demo_${now}_${i}`,
      SurveyId: row.survey,
      VendorCode: row.vendor,
      SupplierTransactionId: `TXN_${row.survey}_${String(9000 + i)}`,
      EventDate: new Date(now - (i + 1) * 9 * 60000).toISOString(),
      Status: row.status,
      DurationMinutes: row.mins,
      IpAddress: '103.21.58.' + (10 + i),
    }));

    return res.json({ success: true, source: 'in_memory_sample', data: sample });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 1-Click Interactive Test Simulator Endpoint
 * Route: POST /api/router/simulate-test
 * Allows instant verification of Complete, Terminate, Overquota, and Security Terminate
 */
exports.simulateTestRouting = async (req, res) => {
  try {
    const {
      projectId = 'MX-896',
      vendorId = 'SAMPLE_VENDOR_1',
      testUid = `TEST_${Date.now()}`,
      status = 1, // 1: Complete, 2: Terminate, 3: OverQuota, 4: Security
      secretKey = 'mx_secret_sha3_key_2026',
    } = req.body;

    // 1. Build Base Return URL
    const statusNames = { 1: 'complete', 2: 'terminate', 3: 'overquota', 4: 'quality_terminate' };
    const statusName = statusNames[status] || 'complete';
    const baseUrl = `http://localhost:5000/redirects/c/MX_DEMAND/${statusName}?rid=${testUid}&auth=1`;

    // 2. Generate SHA3-256 Hashing per Market Xcel Spec
    const { hash, finalUrl } = HashingService.generateSha3Hash(baseUrl, secretKey);

    // 3. Fire real or simulated S2S Callback
    const s2sResult = await S2sService.sendMarketXcelStatus({
      respondentId: testUid,
      status: Number(status),
    });

    return res.json({
      success: true,
      testUid,
      statusRequested: status,
      statusLabel: statusName.toUpperCase(),
      baseUrl,
      generatedSha3Hash: hash,
      finalRedirectUrlWithHash: finalUrl,
      s2sCallbackResult: s2sResult,
      message: `Test simulation for status [${statusName.toUpperCase()}] executed with SHA3-256 signature!`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
