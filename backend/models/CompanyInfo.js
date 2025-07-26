const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  vision: {
    type: String,
    default: ''
  },
  mission: {
    type: String,
    default: ''
  },
  toneOfVoice: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Ensure only one company info document exists
companyInfoSchema.index({}, { unique: true });

// Update the updatedAt field before saving
companyInfoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CompanyInfo', companyInfoSchema);
