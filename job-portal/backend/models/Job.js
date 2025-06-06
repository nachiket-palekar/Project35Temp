const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  description: String,
  requirements: [String],
  jobType: String,
  schedule: {
    type: { type: String },
    hoursPerWeek: Number
  },
  salary: {
    min: Number,
    max: Number,
    currency: String,
    period: String
  },
  applicationProcess: String,
  externalUrl: String,
  source: String,
  sourceId: String,
  postedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  status: String
});

module.exports = mongoose.model('Job', jobSchema);
