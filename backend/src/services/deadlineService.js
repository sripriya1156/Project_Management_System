const Project = require('../models/Project');
const Task = require('../models/Tasks');
const Notification = require('../models/Notification');
const { logActivity } = require('./activityLogger');

const AUTO_REJECTION_THRESHOLD = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

/**
 * Exponential Frequency Formula: 2^(8 - daysRemaining)
 * d=7 -> 2/day, d=6 -> 4/day, ... d=1 -> 128/day, d=0 -> 256/day
 */
const getIntervalMs = (daysRemaining) => {
  const count = Math.pow(2, 8 - daysRemaining);
  return (24 * 60 * 60 * 1000) / count;
};

const processDeadlines = async () => {
  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0,0,0,0);

    // 1. Process Projects
    const activeProjects = await Project.find({ status: { $in: ['Active', 'Pending'] } });
    for (let project of activeProjects) {
      if (!project.endDate) continue;
      const endDate = new Date(project.endDate);
      const timeDiff = endDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff < 0) {
        // Overdue! (Only notify if not already marked)
        if (project.status !== 'Overdue') {
          project.status = 'Overdue';
          await project.save();
          await Notification.create({
            user: project.manager || project.createdBy,
            message: `URGENT: Project "${project.projectName}" is OVERDUE!`,
            type: 'escalation',
            priority: 'urgent'
          });
        }
      } else if (daysDiff <= 7) {
        // Exponential Reminders
        const intervalMs = getIntervalMs(daysDiff);
        const lastNotif = await Notification.findOne({
          user: project.manager || project.createdBy,
          type: 'reminder',
          message: new RegExp(project.projectName, 'i')
        }).sort({ createdAt: -1 });

        if (!lastNotif || (now - lastNotif.createdAt >= intervalMs)) {
          await Notification.create({
            user: project.manager || project.createdBy,
            message: `URGENT DEADLINE: Project "${project.projectName}" is due in ${daysDiff} day(s)!`,
            type: 'reminder',
            priority: daysDiff === 0 ? 'urgent' : 'normal'
          });
          console.log(`[Scheduler] Sent project reminder for ${project.projectName} (${daysDiff} days left)`);
        }
      }
    }

    // 2. Process Tasks
    const activeTasks = await Task.find({ status: { $in: ['pending', 'Assigned', 'Accepted', 'In Progress', 'Under Review'] } }).populate('project');
    for (let task of activeTasks) {
      if (!task.dueDate) continue;
      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff < 0) {
        // Overdue!
        if (task.status !== 'Overdue') {
          task.status = 'Overdue';
          task.isOverdue = true;
          await task.save();
          await Notification.create({
            user: task.user,
            message: `URGENT: Task "${task.title}" is OVERDUE!`,
            type: 'escalation',
            priority: 'urgent'
          });

          if (task.project && task.project.manager) {
            await Notification.create({
              user: task.project.manager,
              message: `ESCALATION: Member missed deadline for task "${task.title}".`,
              type: 'escalation',
              priority: 'urgent'
            });
          }
        }
      } else if (daysDiff <= 7) {
        // Exponential Reminders
        const intervalMs = getIntervalMs(daysDiff);
        const lastNotif = await Notification.findOne({
          user: task.user,
          type: 'reminder',
          message: new RegExp(task.title, 'i')
        }).sort({ createdAt: -1 });

        if (!lastNotif || (now - lastNotif.createdAt >= intervalMs)) {
          await Notification.create({
            user: task.user,
            message: `URGENT DEADLINE: Task "${task.title}" is due in ${daysDiff} day(s)!`,
            type: 'reminder',
            priority: daysDiff === 0 ? 'urgent' : 'normal'
          });
          console.log(`[Scheduler] Sent task reminder for ${task.title} (${daysDiff} days left)`);
        }
      }
    }

    // 3. Process Escalations (Timeouts) - throttled by 12 hours
    // To avoid spamming escalations every minute, check for recent escalation first
    const twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000));
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // 3a. HR Timeout (No response in 24 hrs)
    const pendingProjects = await Project.find({ managerStatus: 'pending', updatedAt: { $lt: twentyFourHoursAgo } });
    for (let project of pendingProjects) {
       const recentEsc = await Notification.findOne({
         user: project.createdBy,
         message: new RegExp(project.projectName, 'i'),
         type: 'escalation',
         createdAt: { $gt: twelveHoursAgo }
       });
       if (!recentEsc) {
          await Notification.create({
            user: project.createdBy,
            message: `ESCALATION: HR has not responded to project "${project.projectName}" assignment for over 24 hours.`,
            type: 'escalation',
            priority: 'urgent'
          });
       }
    }

    // 3b. Member Task Timeout (No response to task in 24 hrs)
    const pendingTasks = await Task.find({ status: 'pending', updatedAt: { $lt: twentyFourHoursAgo } }).populate('project');
    for (let task of pendingTasks) {
      if (task.project && task.project.manager) {
          const recentEsc = await Notification.findOne({
            user: task.project.manager,
            message: new RegExp(task.title, 'i'),
            type: 'escalation',
            createdAt: { $gt: twelveHoursAgo }
          });
          if (!recentEsc) {
            await Notification.create({
              user: task.project.manager,
              message: `ESCALATION: Member has not responded to task "${task.title}" assignment for over 24 hours.`,
              type: 'escalation',
              priority: 'urgent'
            });
          }
      }
    }

    // 4. Process Auto-Rejections (Inactivity Threshold: 3 Days)
    const threeDaysAgo = new Date(now.getTime() - AUTO_REJECTION_THRESHOLD);

    // 4a. Auto-Reject Projects (HR Inactivity)
    const timedOutProjects = await Project.find({ managerStatus: 'pending', updatedAt: { $lt: threeDaysAgo } });
    for (let project of timedOutProjects) {
      project.managerStatus = 'rejected';
      if (project.manager && !project.rejectedManagers.includes(project.manager)) {
        project.rejectedManagers.push(project.manager);
      }
      await project.save();
      
      // Log for dashboard accuracy
      await logActivity(project.manager, 'hr_rejected', 'Project', project._id, 'Auto-rejected due to inactivity for 3 days');
      
      // Notify both parties
      await Notification.create({
        user: project.createdBy,
        message: `Project Manager role for "${project.projectName}" was auto-rejected due to no response for 3 days.`,
        type: 'assignment',
        priority: 'urgent'
      });
      await Notification.create({
        user: project.manager,
        message: `Project assignment for "${project.projectName}" was auto-rejected as you haven't responded within 3 days.`,
        type: 'assignment',
        priority: 'normal'
      });
      console.log(`[Scheduler] Auto-rejected project manager for ${project.projectName}`);
    }

    // 4b. Auto-Reject Tasks (Member Inactivity)
    const timedOutTasks = await Task.find({ status: 'pending', updatedAt: { $lt: threeDaysAgo } }).populate('project');
    for (let task of timedOutTasks) {
      task.status = 'Rejected';
      await task.save();
      
      // Log for dashboard accuracy
      await logActivity(task.user, 'task_rejected', 'Task', task._id, 'Auto-rejected due to inactivity for 3 days');
      
      // Notify both parties
      const managerId = (task.project && task.project.manager) || (task.project && task.project.createdBy);
      if (managerId) {
        await Notification.create({
          user: managerId,
          message: `task "${task.title}" of "${task.project ? task.project.projectName : 'Unknown'}" project was auto-rejected as member haven't responded.`,
          type: 'assignment',
          priority: 'urgent'
        });
      }
      await Notification.create({
        user: task.user,
        message: `Task assignment for "${task.title}" was auto-rejected as you haven't responded within 3 days.`,
        type: 'assignment',
        priority: 'normal'
      });
      console.log(`[Scheduler] Auto-rejected task for ${task.title}`);
    }

    // 5. System-wide Notification Cleanup (Delete after 15 days)
    const fifteenDaysAgo = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));
    await Notification.deleteMany({ createdAt: { $lt: fifteenDaysAgo } });

  } catch (err) {
    console.error("Error in processDeadlines daemon: ", err);
  }
};

exports.processDeadlines = processDeadlines;

exports.startDeadlineService = () => {
  console.log("Starting Deadline & Overdue Background Service (1-minute tick)...");
  // Run every 1 minute
  setInterval(processDeadlines, 60 * 1000);
};
