const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  status: String,
  documents: [{
    type: String,
    documentId: { type: mongoose.Schema.Types.ObjectId }
  }],
  answers: [{
    questionId: String,
    answer: String
  }],
  notes: String,
  appliedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  externalReference: String
});

module.exports = mongoose.model('Application', applicationSchema);
