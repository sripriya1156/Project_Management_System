const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    dateJoined: { type: Date, default: Date.now },
    role: { type: String, required: true, default: 'User', enum: ['Admin', 'User'] },
    specialization: { type: [String], default: [] },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});
const User = mongoose.model('User', UserSchema);

module.exports = User;