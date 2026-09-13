const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  projectId: { type: String, required: true, index: true },
  vendorId: { type: String, required: true, index: true },
  uid: { type: String, required: true, index: true },
  ipAddress: { type: String, default: '' },
  country: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Complete', 'Terminates', 'Quota Full', 'Screenout', 'Quality Terminate'],
    default: 'Pending',
    index: true,
  },
  clickTime: { type: Date, default: Date.now },
  completionTime: { type: Date },
  loiMinutes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
