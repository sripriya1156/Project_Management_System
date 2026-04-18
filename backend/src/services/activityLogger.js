const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async (userId, actionType, entityType, entityId, description) => {
  try {
    await ActivityLog.create({
      userId,
      actionType,
      entityType,
      entityId,
      description
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};
