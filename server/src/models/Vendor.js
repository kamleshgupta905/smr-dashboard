const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  vendorUid: { type: String, unique: true, index: true },
  redirectSuccess: { type: String, default: '' },
  redirectTerminate: { type: String, default: '' },
  redirectQuotafull: { type: String, default: '' },
  redirectScreenout: { type: String, default: '' },
  cpi: { type: Number, default: 0 },
  clicksCount: { type: Number, default: 0 },
  completeCount: { type: Number, default: 0 },
  terminatesCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
