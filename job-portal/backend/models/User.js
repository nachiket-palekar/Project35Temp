const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: String,
  lastName: String,
  phone: String,
  verification: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false }
  },
  accountType: { type: String, enum: ['student', 'employer', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
resetPasswordExpires: { type: Date },

});

module.exports = mongoose.model('User', userSchema);
