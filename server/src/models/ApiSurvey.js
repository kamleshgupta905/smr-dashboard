const mongoose = require('mongoose');

const apiSurveySchema = new mongoose.Schema({
  SurveyId: { type: Number, required: true, unique: true, index: true },
  Name: { type: String, default: '' },
  TotalCompleteRequired: { type: Number, default: 0 },
  CPI: { type: Number, default: 0 },
  LOI: { type: Number, default: 0 },
  IR: { type: Number, default: 0 },
  LastUpdateTimeStamp: { type: Date },
  IsSurveyGroupExist: { type: Number, default: 0 },
  LanguageCode: { type: String, default: '' },
  SurveyEndDate: { type: Date },
  Device: { type: String, default: '' },
  IndustryId: { type: Number },
  StudyTypes: { type: String, default: '' },
  IsRecontactSurvey: { type: Number, default: 0 },
  CollectPII: { type: Number, default: 0 },
  LanguageId: { type: Number },
  FieldDays: { type: Number },
  SurveyCreatedAt: { type: Date },
  status: { type: String, default: 'Live', index: true },
  isTopPick: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ApiSurvey', apiSurveySchema);
