const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'project_created', 
      'hr_assigned', 
      'hr_reassigned', 
      'hr_accepted', 
      'hr_rejected',
      'task_assigned',
      'task_accepted',
      'task_rejected',
      'task_completed',
      'task_status_changed',
      'escalation_triggered',
      'project_completed',
      'subtask_created',
      'subtask_status_changed',
      'subtask_deleted',
      'subtask_comment_added'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Project', 'Task', 'SubTask']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
