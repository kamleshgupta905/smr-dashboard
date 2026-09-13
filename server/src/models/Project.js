const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  clientId: { type: String, default: '' },
  clientName: { type: String, default: '' },
  costPerComplete: { type: Number, default: 0 },
  ir: { type: Number, default: 0 },
  loi: { type: Number, default: 0 },
  maxLimit: { type: Number, default: 0 },
  liveUrl: { type: String, default: '' },
  status: { type: String, enum: ['Live', 'Pause', 'Closed'], default: 'Live' },
  isApiProject: { type: Boolean, default: false },
  zampliaSurveyId: { type: Number },
  completeCount: { type: Number, default: 0 },
  terminateCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
