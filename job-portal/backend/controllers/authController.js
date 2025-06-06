const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const StudentProfile = require('../models/studentprofile');
const Employer = require('../models/Employer');

// Register User
exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      accountType,
      profileData
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !accountType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const emailToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      accountType,
      verification: { email: false, phone: false },
      emailVerificationToken: emailToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await newUser.save();

    if (accountType === 'student') {
      const { collegeName, course } = profileData || {};
      const student = new StudentProfile({
        userId: savedUser._id,
        collegeName,
        course
      });
      await student.save();
    } else if (accountType === 'employee') {
      const { companyName, designation } = profileData || {};
      const employer = new Employer({
        userId: savedUser._id,
        companyName,
        designation
      });
      await employer.save();
    }

    const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${emailToken}`;
    await sendVerificationEmail(email, verificationLink);

    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = {
      user: {
        id: user.id,
        accountType: user.accountType
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' }, (err, token) => {
      if (err) throw err;

      res.json({
        token,
        message: `Login successful as ${user.accountType}`,
        accountType: user.accountType,
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`
      });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    user.verification.email = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.send('✅ Email verified successfully. You can now log in.');
  } catch (err) {
    console.error('Email verification error:', err.message);
    res.status(500).send('Server error during verification');
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    const resetLink = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: '"Job Portal" <nachiket.fswd@zeetheta.com>',
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Reset link sent to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Serve Reset Password Page (or confirmation)
exports.resetPasswordForm = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send('Invalid or expired token.');
    }

    // Serve HTML form for entering new password
    res.send(`
      <h2>Reset Your Password</h2>
      <form action="/api/auth/reset-password?token=${token}" method="POST">
        <label>New Password:</label><br/>
        <input type="password" name="newPassword" required minlength="6" /><br/><br/>
        <button type="submit">Reset Password</button>
      </form>
    `);
  } catch (err) {
    console.error('Reset password form error:', err);
    res.status(500).send('Server error');
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function
const sendVerificationEmail = async (email, link) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"Job Portal" <nachiket.fswd@zeetheta.com>',
    to: email,
    subject: 'Verify your email',
    html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
