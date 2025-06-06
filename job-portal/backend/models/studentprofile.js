const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institution: String,
  degree: String,
  fieldOfStudy: String,
  yearOfStudy: Number,
  graduationYear: Number,
  skills: [String],
  experiences: [{
    title: String,
    organization: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    url: String,
    skills: [String]
  }],
  documents: [{
    type: String,
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    jobTypes: [String],
    locations: [String],
    remotePreference: String,
    industryPreferences: [String]
  }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
