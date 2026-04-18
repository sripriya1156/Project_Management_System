const Notification = require('../models/Notification');
const Project = require('../models/Project');
const Project_Members = require('../models/Project_Members');

exports.getNotifications = async (req, res) => {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    await Notification.deleteMany({ user: req.user._id, createdAt: { $lt: fifteenDaysAgo } });

    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ message: "Notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.status(200).json({ count: unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
