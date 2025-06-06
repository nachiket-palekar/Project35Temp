const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: String,
  industry: String,
  description: String,
  logo: String,
  website: String,
  location: String,
  size: String,
  verificationStatus: String,
  subscription: {
    plan: String,
    startDate: Date,
    endDate: Date
  }
});

module.exports = mongoose.model('Employer', employerSchema);
