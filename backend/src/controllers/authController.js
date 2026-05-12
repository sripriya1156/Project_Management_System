const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const getWhitelist = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../../whitelist.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading Employee's List:", err);
    return [];
  }
};

exports.login = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const email = String(rawEmail).toLowerCase().trim();

    const whitelist = getWhitelist();
    if (!whitelist.includes(email)) {
      return res.status(401).json({ message: "Email is not in the Employee's list." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email" });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "10h" });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        experience: user.dateJoined ? new Date().getFullYear() - user.dateJoined.getFullYear() : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email: rawEmail, password, confirmpassword, specialization } = req.body || {};

    if (!rawEmail) {
      return res.status(400).send({ message: "Email is required." });
    }

    const email = String(rawEmail).toLowerCase().trim();

    const whitelist = getWhitelist();
    if (!whitelist.includes(email)) {
      return res.status(401).send({ message: "Email is not in the Employee's list." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send({ message: 'email is already exists' });
    }

    if (name && email && password && password == confirmpassword) {
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hash, specialization: specialization || [] });
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "10h" });
      res.status(200).send({
        message: 'user is created',
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role || 'Member' }
      });
    } else {
      res.status(401).send({ message: 'invalid data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email: rawEmail } = req.body;
  try {
    if (!rawEmail) return res.status(400).json({ message: "Email is required." });
    const email = String(rawEmail).toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // For security, do not log the reset URL or credentials in production
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      to: user.email,
      from: `Spritflow <${process.env.EMAIL_USER}>`,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `${resetUrl}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    console.log(`Attempting to send reset email to: ${user.email}`);
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to: ${user.email}`);
      res.status(200).json({ message: "Reset link sent to your email!" });
    } catch (err) {
      console.error('Email send failed:', err.message);
      if (err.code === 'EAUTH') {
        console.error('Authentication Error: Check EMAIL_USER and EMAIL_PASS.');
      }
      res.status(500).json({ message: `Failed to send email: ${err.message}` });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
