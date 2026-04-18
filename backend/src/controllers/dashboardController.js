const Project = require('../models/Project');
const Task = require('../models/Tasks');

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({ createdBy: req.user._id });
    const pendingHRApprovals = await Project.countDocuments({ createdBy: req.user._id, managerStatus: 'pending' });
    const rejectedHRProjects = await Project.countDocuments({ createdBy: req.user._id, managerStatus: 'rejected' });

    res.status(200).json({
      totalProjects,
      pendingHRApprovals,
      rejectedHRProjects
    });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching admin dashboard" });
  }
};

exports.getHRDashboard = async (req, res) => {
  try {
    const activeProjects = await Project.countDocuments({ manager: req.user._id, status: 'Active' });
    
    // Fetch task distribution for projects managed by this HR
    const projectsManaged = await Project.find({ manager: req.user._id }, '_id');
    const projectIds = projectsManaged.map(p => p._id);

    const taskDistribution = {
      pending: await Task.countDocuments({ project: { $in: projectIds }, status: 'pending' }),
      assigned: await Task.countDocuments({ project: { $in: projectIds }, status: 'Assigned' }),
      accepted: await Task.countDocuments({ project: { $in: projectIds }, status: 'Accepted' }),
      inProgress: await Task.countDocuments({ project: { $in: projectIds }, status: 'In Progress' }),
      underReview: await Task.countDocuments({ project: { $in: projectIds }, status: 'Under Review' }),
      completed: await Task.countDocuments({ project: { $in: projectIds }, status: 'Completed' }),
      rejected: await Task.countDocuments({ project: { $in: projectIds }, status: 'Rejected' })
    };

    const overdueTasks = await Task.countDocuments({ project: { $in: projectIds }, isOverdue: true });

    res.status(200).json({
      activeProjects,
      taskDistribution,
      overdueTasks
    });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching HR dashboard" });
  }
};
