const SubTask = require('../models/SubTask');
const Task = require('../models/Tasks');
const Notification = require('../models/Notification');
const Project_Members = require('../models/Project_Members');
const { logActivity } = require('../services/activityLogger');

// Create a SubTask (PM/Admin Only, Task must be Accepted)
exports.createSubTask = async (req, res) => {
  try {
    const { taskId, title, description, dueDate, priority, userId } = req.body;

    const task = await Task.findById(taskId).populate('project');
    if (!task) return res.status(404).json({ message: "Parent task not found" });

    // Guard: Task must be Accepted or In Progress
    if (!['Accepted', 'In Progress'].includes(task.status)) {
      return res.status(400).json({ message: "Subtasks can only be added to Accepted or In Progress tasks" });
    }

    const project = task.project;
    // Role Check: Only Admin or Project Creator/Manager
    if (req.user.role !== 'Admin' && project.manager.toString() !== req.user._id.toString() && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to add subtasks" });
    }

    // Determine target user: custom userId or parent task user
    const targetUserId = userId || task.user;

    // Verify target user is a project member
    const isMember = await Project_Members.exists({ project: project._id, user: targetUserId });
    if (!isMember) {
      return res.status(400).json({ message: "Assigned user is not a member of this project" });
    }

    const subTask = await SubTask.create({
      taskId,
      userId: targetUserId,
      title,
      description,
      dueDate,
      priority
    });

    // Notify User
    await Notification.create({
      user: targetUserId,
      message: `New subtask "${title}" has been assigned to you for project "${project.projectName}"`
    });

    await logActivity(req.user._id, 'subtask_created', 'SubTask', subTask._id, `Added subtask "${title}" to task "${task.title}"`);

    // Update parent task & project because denominator changed
    await updateParentProgress(taskId);

    res.status(201).json(subTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ... existing code ...
// Helper: Update Task and Project Progress
const updateParentProgress = async (taskId) => {
  const subTasks = await SubTask.find({ taskId });
  const total = subTasks.length;
  const done = subTasks.filter(st => st.status === 'done').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const task = await Task.findById(taskId);
  if (!task) return;

  task.progress = progress;
  // Auto-update task status based on subtasks
  if (total > 0) {
    if (progress === 100) {
      task.status = 'Completed';
    } else if (progress > 0 || subTasks.some(st => st.status === 'in_progress')) {
      task.status = 'In Progress';
    } else if (task.status === 'Completed') {
      task.status = 'In Progress'; // Force demotion if a new subtask is added to a completed task
    }
  }
  await task.save();

  // Update Project Progress using member-centric formula: Sum(Member Progress) / Active Members Only
  const project = await require('../models/Project').findById(task.project);
  if (project) {
    const members = await Project_Members.find({ project: project._id });
    const projectTasks = await Task.find({ project: project._id });
    const taskIds = projectTasks.map(t => t._id);
    
    let totalMemberProgress = 0;
    let activeMembersCount = 0;

    for (let member of members) {
      const userSubTasks = await SubTask.find({ taskId: { $in: taskIds }, userId: member.user });
      const totalST = userSubTasks.length;
      
      // Only include members who actually have assigned subtasks in this project
      if (totalST > 0) {
        const doneST = userSubTasks.filter(st => st.status === 'done').length;
        const mProgress = (doneST / totalST) * 100;
        totalMemberProgress += mProgress;
        activeMembersCount++;
      }
    }

    if (activeMembersCount > 0) {
      project.progress = Math.round(totalMemberProgress / activeMembersCount);
    } else {
      // Fallback if no subtasks exist at all: calculate via base Task objects
      const totalTasksCount = projectTasks.length;
      const completedTasksCount = projectTasks.filter(t => t.status === 'Completed').length;
      project.progress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    }
    
    // Auto-update project status if 100%
    if (project.progress === 100) {
      project.status = 'Completed';
    } else if (project.progress > 0) {
      project.status = 'Active';
    }
    await project.save();
  }
};

// Update SubTask Status (Assigned User Only)
exports.updateSubTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const subTask = await SubTask.findById(req.params.id);
    if (!subTask) return res.status(404).json({ message: "Subtask not found" });

    if (subTask.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the assigned user can update status" });
    }

    // Force Flow Check: pending -> in_progress -> done
    const currentStatus = subTask.status;
    const allowedTransitions = {
      'pending': ['in_progress'],
      'in_progress': ['done', 'pending'], // Allow revert to pending for flexibility
      'done': ['in_progress'] // Allow re-opening if needed by PM?
    };

    if (currentStatus !== status && !allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ message: `Cannot change status from ${currentStatus} to ${status}. Expected flow: Pending -> In Progress -> Done.` });
    }

    const oldStatus = subTask.status;
    subTask.status = status;
    await subTask.save();

    await logActivity(req.user._id, 'subtask_status_changed', 'SubTask', subTask._id, `Changed status from ${oldStatus} to ${status}`);

    // Update Progress and Status on Parent Task & Project
    await updateParentProgress(subTask.taskId);

    // Notify PM/Creator if status is Done
    if (status === 'done') {
      const task = await Task.findById(subTask.taskId).populate('project');
      const project = task.project;
      const notifyUserId = project.manager || project.createdBy;
      
      await Notification.create({
        user: notifyUserId,
        message: `Subtask "${subTask.title}" has been completed by ${req.user.name}`
      });
    }

    res.status(200).json(subTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch SubTasks for a Task with Progress
exports.getSubTasksByTask = async (req, res) => {
  try {
    const subTasks = await SubTask.find({ taskId: req.params.taskId }).populate('userId', 'name email');
    
    const total = subTasks.length;
    const done = subTasks.filter(st => st.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    res.status(200).json({
      subTasks,
      progress,
      stats: { total, done }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// New: Fetch all subtasks for the current user
exports.getMySubTasks = async (req, res) => {
  try {
    const subTasks = await SubTask.find({ userId: req.user._id })
      .populate({
        path: 'taskId',
        populate: { path: 'project' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(subTasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// New: Fetch all subtasks in a project (for PMs)
exports.getProjectSubTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId });
    const taskIds = tasks.map(t => t._id);

    const subTasks = await SubTask.find({ taskId: { $in: taskIds } })
      .populate('userId', 'name email')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(subTasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add Comment to SubTask
exports.addSubTaskComment = async (req, res) => {
  try {
    const { text } = req.body;
    const subTask = await SubTask.findById(req.params.id);
    if (!subTask) return res.status(404).json({ message: "Subtask not found" });

    subTask.comments.push({
      user: req.user._id,
      text
    });
    await subTask.save();

    await logActivity(req.user._id, 'subtask_comment_added', 'SubTask', subTask._id, `Added a comment to subtask "${subTask.title}"`);

    res.status(201).json(subTask);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete SubTask (PM Only)
exports.deleteSubTask = async (req, res) => {
  try {
    const subTask = await SubTask.findById(req.params.id).populate('taskId');
    if (!subTask) return res.status(404).json({ message: "Subtask not found" });

    const task = await Task.findById(subTask.taskId).populate('project');
    const project = task.project;

    if (project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete subtask. Only the project manager can perform this action." });
    }

    await SubTask.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'subtask_deleted', 'SubTask', subTask._id, `Deleted subtask "${subTask.title}"`);

    // Update parent task & project because denominator changed
    await updateParentProgress(subTask.taskId);

    res.status(200).json({ message: "Subtask deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
