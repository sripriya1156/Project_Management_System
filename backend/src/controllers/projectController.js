const Project = require('../models/Project');
const Project_Members = require('../models/Project_Members');
const Task = require('../models/Tasks');
const SubTask = require('../models/SubTask');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../services/activityLogger');

exports.createProject = async (req, res) => {
  try {
    const { projectName, description, endDate, managerId } = req.body;

    const project = new Project({
      projectName,
      description,
      endDate,
      createdBy: req.user._id,
      manager: managerId || req.user._id,
      managerStatus: (managerId && managerId.toString() !== req.user._id.toString()) ? 'pending' : 'accepted'
    });
    await project.save();

    if (managerId && managerId.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: managerId,
        message: `You have been assigned as the Project Manager for "${projectName}". Please accept or reject this role.`
      });
      console.log("MANAGER NOTIFIED:", managerId);
    }

    const projectmember = await Project_Members.create({
      user: req.user._id,
      project: project._id,
      role: 'Admin'
    });

    await logActivity(req.user._id, 'project_created', 'Project', project._id, `Created project "${projectName}"`);
    if (managerId && managerId !== req.user._id.toString()) {
      await logActivity(req.user._id, 'hr_assigned', 'Project', project._id, `Assigned HR role to user ${managerId}`);
    }

    res.status(201).json(project);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createProjectWithAssignments = async (req, res) => {
  try {
    const { projectName, description, endDate, assignments, managerId } = req.body;

    const project = new Project({
      projectName,
      description,
      endDate,
      createdBy: req.user._id,
      manager: managerId || req.user._id,
      managerStatus: (managerId && managerId.toString() !== req.user._id.toString()) ? 'pending' : 'accepted'
    });
    await project.save();

    if (managerId && managerId !== req.user._id.toString()) {
      await Notification.create({
        user: managerId,
        message: `You have been assigned as the Project Manager for "${projectName}". Please accept or reject this role.`
      });
    }

    await Project_Members.create({
      user: req.user._id,
      project: project._id,
      role: 'Admin'
    });

    if (assignments && assignments.length > 0) {
      for (let assignment of assignments) {
        await Project_Members.create({
          user: assignment.userId,
          project: project._id,
          role: 'Member'
        });

        if (assignment.taskTitle) {
          await Task.create({
            title: assignment.taskTitle,
            description: assignment.taskDescription || "Assigned during project creation.",
            dueDate: assignment.taskDueDate || endDate,
            priority: assignment.taskPriority || 'Medium',
            user: assignment.userId,
            project: project._id
          });
        }
      }
    }

    res.status(201).json({ message: "Project created with assignments!", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during creation" });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    if (!rawEmail) return res.status(400).json({ message: "Email is required" });

    const email = String(rawEmail).toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.status == "Completed") {
      return res.status(400).send({ message: "Project is Completed! No Changes are allowed!" });
    }

    if (req.user.role !== 'Admin' && project.manager.toString() !== req.user._id.toString() && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Admins or Project Managers only.' });
    }

    if (new Date(project.endDate) < new Date()) {
      return res.status(400).json({ message: 'Cannot add members after project deadline' });
    }
    const existing = await Project_Members.findOne({
      project: project._id,
      user: user._id
    });

    if (existing) {
      return res.status(400).json({ message: "User already a member" });
    }

    const projectMember = await Project_Members.create({
      user: user._id,
      project: project._id
    });

    res.status(201).json({ message: "Member added successfully", projectMember });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && project.manager.toString() !== req.user._id.toString() && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Admins or Project Managers only.' });
    }

    if (new Date(project.endDate) < new Date()) {
      return res.status(400).json({ message: 'Cannot remove members after project deadline' });
    }

    if (project.manager.toString() === req.params.memberId || project.createdBy.toString() === req.params.memberId) {
      return res.status(400).json({ message: 'Cannot remove the Project Manager or Creator' });
    }

    const member = await Project_Members.findOneAndDelete({ project: project._id, user: req.params.memberId });
    if (!member) return res.status(404).json({ message: 'Member not found in project' });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignTask = async (req, res) => {
  console.log("=== assignTask CALLED ===");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("User:", req.user?._id, "Role:", req.user?.role);

  const { title, description, dueDate, priority } = req.body;
  if (!title || !description || !dueDate || !priority) {
    console.log("Missing fields:", { title, description, dueDate, priority });
    return res.status(400).send({ message: "please provide required data!!" });
  }
  try {
    const project = await Project.findById(req.params.projectid);
    const user = await User.findById(req.params.memberid);
    if (!project || !user) {
      return res.status(404).send({ message: "data not found!" });
    }

    // Check Authorization: Only Admin or Project Manager/Creator can assign tasks
    const isAdmin = req.user.role === 'Admin';
    const isManager = project.manager && project.manager.toString() === req.user._id.toString();
    const isCreator = project.createdBy && project.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isManager && !isCreator) {
      return res.status(403).json({ message: "Access denied. Only Admins or the Project Manager can assign tasks." });
    }

    if (project.status == "Completed") {
      return res.status(400).send({ message: "Project is Completed! No Changes are allowed!" });
    }

    const taskDate = new Date(dueDate);
    const projDate = new Date(project.endDate);
    taskDate.setHours(0,0,0,0);
    projDate.setHours(0,0,0,0);

    if (taskDate > projDate) {
      return res.status(400).send({ message: "Task due date cannot be beyond the project due date" });
    }

    // User will be added to project members only when they accept the task
    const task = await Task.create({
      title: title,
      description: description,
      dueDate: dueDate,
      priority: priority,
      user: user._id,
      project: project._id
    });

    // Notify the assigned user
    await Notification.create({
      user: user._id,
      message: `You have been assigned a new task: "${title}" in project "${project.projectName}". Please accept or reject it.`
    });

    res.status(201).send({ message: `Task is assigned to ${user.name}` });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "internal server error" });
  }
};

exports.getMyCreatedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('manager', 'name email').populate('rejectedManagers', 'name email specialization');
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isManager = project.manager && project.manager._id.toString() === req.user._id.toString();

    if (!isCreator && !isManager) {
      const isMember = await Project_Members.exists({ project: project._id, user: req.user._id });
      if (!isMember) {
        return res.status(403).json({ message: "Access denied. Only the project creator or members can view this." });
      }
    }

    const enriched = await enrichProjectWithMemberProgress(project);
    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Allow any project member, manager, or admin to view the members list
    if (req.user.role !== 'Admin' && project.manager.toString() !== req.user._id.toString()) {
      const isMember = await Project_Members.exists({ project: project._id, user: req.user._id });
      if (!isMember) {
        return res.status(403).json({ message: "Access denied. Project members, Admins or Project Managers only." });
      }
    }

    const members = await Project_Members.find({ project: req.params.id }).populate('user', 'name email role specialization');
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id }).populate('user', 'name email');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRejectedTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Admins or Project Managers only." });
    }

    const tasks = await Task.find({ project: req.params.id, status: 'Rejected' }).populate('user', 'name');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.managerResponse = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const project = await Project.findOne({ _id: req.params.projectId, manager: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.managerStatus = status;

    if (status === 'accepted') {
      // Activate the project when manager accepts
      project.status = 'Active';

      // Add manager to Project_Members if not already there
      const alreadyMember = await Project_Members.findOne({ project: project._id, user: req.user._id });
      if (!alreadyMember) {
        await Project_Members.create({ user: req.user._id, project: project._id, role: 'Member' });
      }

      // Notify the project creator
      await Notification.create({
        user: project.createdBy,
        message: `Project Manager has accepted the role for project "${project.projectName}". The project is now Active.`
      });
      await logActivity(req.user._id, 'hr_accepted', 'Project', project._id, `Accepted manager role for project "${project.projectName}"`);

    } else {
      // Rejected: push to rejectedManagers and notify creator
      project.rejectedManagers.push(req.user._id);

      await Notification.create({
        user: project.createdBy,
        message: `Project Manager role was rejected for project "${project.projectName}". Please reassign a manager.`,
        type: 'assignment'
      });
      await logActivity(req.user._id, 'hr_rejected', 'Project', project._id, `Rejected manager role for project "${project.projectName}"`);
    }

    await project.save();

    res.status(200).json({ message: `Manager role ${status}`, projectStatus: project.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.reassignManager = async (req, res) => {
  try {
    const { newManagerId } = req.body;
    if (!newManagerId) return res.status(400).json({ message: "New manager ID required" });

    const project = await Project.findOne({ _id: req.params.projectId, createdBy: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found or unauthorized" });

    if (project.rejectedManagers.includes(newManagerId)) {
      return res.status(400).json({ message: "Cannot assign this user. They have previously rejected managing this project." });
    }

    project.manager = newManagerId;
    project.managerStatus = newManagerId === req.user._id ? 'accepted' : 'pending';
    await project.save();

    // Log the reassignment
    await logActivity(req.user._id, 'hr_reassigned', 'Project', project._id, `Reassigned HR role to user ${newManagerId}`);

    if (newManagerId !== req.user._id.toString()) {
      await Notification.create({
        user: newManagerId,
        message: `You have been assigned as the Project Manager for "${project.projectName}". Please accept or reject this role.`
      });
    }

    res.status(200).json({ message: "Manager reassigned successfully", project });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyPendingManagedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ manager: req.user._id, managerStatus: 'pending' })
      .populate('createdBy', 'name email');
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    // Get projects from Project_Members (assigned as a member)
    const memberships = await Project_Members.find({ user: req.user._id }).populate({
      path: 'project',
      populate: { path: 'manager', select: 'name email' }
    });

    // Also include projects where user is the accepted manager (not always in Project_Members)
    const managedProjects = await Project.find({ manager: req.user._id, managerStatus: 'accepted' })
      .populate('manager', 'name email');

    const seen = new Set();
    const allProjects = [];

    for (let m of memberships) {
      if (!m.project) continue;
      const id = m.project._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        allProjects.push(m.project);
      }
    }

    for (let p of managedProjects) {
      const id = p._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        allProjects.push(p);
      }
    }

    const enrichedProjects = [];
    for (let project of allProjects) {
      const projectData = await enrichProjectWithMemberProgress(project);
      enrichedProjects.push(projectData);
    }

    res.status(200).json(enrichedProjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyManagedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ manager: req.user._id, managerStatus: 'accepted' });
    const enrichedProjects = [];

    for (let p of projects) {
      const projectData = await enrichProjectWithMemberProgress(p);
      enrichedProjects.push(projectData);
    }

    res.status(200).json(enrichedProjects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Helper: Calculate member-centric progress and initials
async function enrichProjectWithMemberProgress(project) {
  const members = await Project_Members.find({ project: project._id }).populate('user', 'name');
  const projectTasks = await Task.find({ project: project._id });
  const taskIds = projectTasks.map(t => t._id);

  const enrichedMembers = [];
  let totalMemberProgress = 0;
  let activeMembersCount = 0;

  for (let member of members) {
    const userTasks = projectTasks.filter(t => t.user.toString() === member.user._id.toString());
    let totalProgressForMember = 0;

    if (userTasks.length > 0) {
      for (let task of userTasks) {
        const userSubTasks = await SubTask.find({ taskId: task._id });
        const totalST = userSubTasks.length;
        if (totalST > 0) {
          const doneST = userSubTasks.filter(st => st.status === 'done').length;
          totalProgressForMember += (doneST / totalST) * 100;
        } else {
          // If no subtasks, check the task status itself
          totalProgressForMember += ['Completed', 'Under Review'].includes(task.status) ? 100 : 0;
        }
      }
      totalProgressForMember = totalProgressForMember / userTasks.length;
      totalMemberProgress += totalProgressForMember;
      activeMembersCount++;
    }

    enrichedMembers.push({
      _id: member.user._id,
      name: member.user.name,
      initials: member.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      progress: Math.round(totalProgressForMember)
    });
  }

  let overallProgress = 0;
  if (activeMembersCount > 0) {
    overallProgress = Math.round(totalMemberProgress / activeMembersCount);
  } else {
    const totalTasksCount = projectTasks.length;
    const completedTasksCount = projectTasks.filter(t => t.status === 'Completed').length;
    overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  }

  // Sync with DB if needed (optional but good for consistency)
  if (project.progress !== overallProgress) {
    project.progress = overallProgress;
    if (project.progress === 100) project.status = 'Completed';
    await project.save();
  }

  return {
    ...project.toObject(),
    progress: overallProgress,
    members: enrichedMembers
  };
}

exports.getMyRejectedProjects = async (req, res) => {
  try {
    // 1. Fetch projects where the current user is the CREATOR and the manager rejected the role
    const creatorRejectedProjects = await Project.find({
      createdBy: req.user._id,
      managerStatus: 'rejected'
    });

    // 2. Fetch projects/tasks the current user PERSONALLY rejected from logs
    const filter = {
      actionType: { $in: ['hr_rejected', 'task_rejected'] },
      userId: req.user._id
    };

    const rejectionLogs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const results = [];
    const seenProjectIds = new Set(); // Prevent duplicates

    const addResult = (item) => {
      if (!seenProjectIds.has(item._id.toString())) {
        seenProjectIds.add(item._id.toString());
        results.push(item);
      }
    };

    // Add Creator's Rejected Projects mapping
    for (let proj of creatorRejectedProjects) {
      addResult({
        ...proj.toObject(),
        isRejected: true,
        isTaskRejection: false,
        rejectedBy: proj.rejectedManagers?.length ? proj.rejectedManagers[proj.rejectedManagers.length - 1] : null,
      });
    }

    // Add Personal Rejection Logs mapping
    for (const log of rejectionLogs) {
      let project = null;
      let taskTitle = "";

      if (log.entityType === 'Project') {
        project = await Project.findById(log.entityId);
        if (project && project.managerStatus !== 'rejected') project = null; // Stale log -> do not show if recovered
      } else if (log.entityType === 'Task') {
        const task = await Task.findById(log.entityId).populate('project');
        if (task && task.project && task.status === 'Rejected') { // Enforce task is STILL rejected
          project = task.project;
          taskTitle = task.title;
        } else {
          project = null;
        }
      }

      if (project) {
        addResult({
          ...project.toObject(),
          isRejected: true,
          isTaskRejection: log.actionType === 'task_rejected',
          taskTitle: taskTitle,
          rejectedBy: log.userId,
          manager: log.userId, // Legacy mapping compatibility
          rejectionDate: log.createdAt,
          logId: log._id
        });
      }
    }

    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching rejected projects from logs:', err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).populate('manager', 'name email');
    const enrichedProjects = [];

    for (let p of projects) {
      const projectData = await enrichProjectWithMemberProgress(p);
      enrichedProjects.push(projectData);
    }

    res.status(200).json(enrichedProjects);
  } catch (err) {
    console.error("Error fetching all projects", err);
    res.status(500).json({ message: "Server error" });
  }
};
