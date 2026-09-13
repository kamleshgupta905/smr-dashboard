const mongoose = require('mongoose');

const vendorEntryLinkSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, index: true },
  projectId: { type: String, required: true, index: true },
  entryLink: { type: String, required: true },
  liveUrl: { type: String, default: '' },
  signedLiveLink: { type: String, default: '' },
}, { timestamps: true });

vendorEntryLinkSchema.index({ vendorId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('VendorEntryLink', vendorEntryLinkSchema);
