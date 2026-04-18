const Task = require('../models/Tasks');
const Project = require('../models/Project');
const Project_Members = require('../models/Project_Members');
const Notification = require('../models/Notification');
const { logActivity } = require('../services/activityLogger');

exports.reassignTask = async (req, res) => {
  try {
    const { newUserId } = req.body;
    if (!newUserId) return res.status(400).json({ message: "New user ID is required" });

    const task = await Task.findById(req.params.taskId).populate('project');
    if (!task || !task.project) return res.status(404).json({ message: "Task or Project not found" });
    
    if (req.user.role !== 'Admin' && task.project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Admins or Project Managers only." });
    }

    const isMember = await Project_Members.exists({ project: task.project._id, user: newUserId });
    if (!isMember) {
      await Project_Members.create({
        user: newUserId,
        project: task.project._id,
        role: 'Member'
      });
    }

    task.user = newUserId;
    task.status = 'pending';
    await task.save();
    
    // Notify the newly assigned user
    await Notification.create({
      user: newUserId,
      message: `You have been reassigned to task "${task.title}" in project "${task.project.projectName}". Please accept or reject it.`,
      type: 'reassignment'
    });
    
    await logActivity(req.user._id, 'task_assigned', 'Task', task._id, `Reassigned task to user ${newUserId}`);
    res.status(200).json({ message: "Task reassigned successfully", task });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    // Return all non-pending, non-rejected tasks assigned to user
    const tasks = await Task.find({
      user: req.user._id,
      status: { $in: ['Accepted', 'In Progress', 'Under Review', 'Completed'] }
    })
      .populate('project', 'projectName status endDate')
      .sort({ dueDate: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id, status: 'pending' }).populate('project', 'projectName description');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = 'Accepted';
    await task.save();

    // Auto-add user to project members if not already a member
    if (task.project) {
      const isMember = await Project_Members.exists({ project: task.project, user: req.user._id });
      if (!isMember) {
        await Project_Members.create({
          user: req.user._id,
          project: task.project,
          role: 'Member'
        });
      }
    }

    await logActivity(req.user._id, 'task_accepted', 'Task', task._id, `Accepted task "${task.title}"`);

    const project = await Project.findById(task.project);
    if (project) {
      // Notify the manager (or creator if no manager accepted yet)
      const notifyUser = (project.managerStatus === 'accepted' && project.manager) ? project.manager : project.createdBy;
      await Notification.create({
        user: notifyUser,
        message: `Task "${task.title}" in project "${project.projectName}" was accepted by ${req.user.name}.`
      });
    }

    res.status(200).json({ message: "Task accepted", task });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = 'Rejected';
    await task.save();

    await logActivity(req.user._id, 'task_rejected', 'Task', task._id, `Rejected task "${task.title}"`);

    const project = await Project.findById(task.project);
    if (project) {
      const notifyUserId = project.managerStatus === 'accepted' ? project.manager : project.createdBy;
      await Notification.create({
        user: notifyUserId,
        message: `task "${task.title}" of "${project.projectName}" project was rejected by ${req.user.name}`
      });
    }

    res.status(200).json({ message: "Task rejected", task });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.taskId).populate('project');
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check Authorization: Assigned User, Manager, or Admin
    const isAssignedUser = task.user.toString() === req.user._id.toString();
    const isManager = task.project && task.project.manager.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isAssignedUser && !isManager && !isAdmin) {
      return res.status(403).json({ message: "Access denied. Only the assigned user or manager can update status." });
    }

    if (!['pending', 'Accepted', 'In Progress', 'Under Review', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    task.status = status;
    await task.save();

    await logActivity(req.user._id, 'task_status_updated', 'Task', task._id, `Updated status of "${task.title}" to ${status}`);
    
    res.status(200).json({ message: "Task status updated", task });
  } catch (err) {
    console.error("Error updating task status", err);
    res.status(500).json({ message: "Server error" });
  }
};
