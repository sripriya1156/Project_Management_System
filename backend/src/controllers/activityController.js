const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');
const Project_Members = require('../models/Project_Members');

exports.getProjectLogs = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify access
    if (req.user.role !== 'Admin') {
      const isMember = await Project_Members.exists({ project: projectId, user: req.user._id });
      const project = await Project.findById(projectId);
      if (!isMember && (!project || project.manager.toString() !== req.user._id.toString())) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const logs = await ActivityLog.find({ 
      $or: [
        { entityType: 'Project', entityId: projectId },
        { entityType: 'Task', entityId: { $in: await getProjectTaskIds(projectId) } } // Assuming tasks are linked directly. But for simplicity, we can fetch all tasks for this project.
      ]
    }).populate('userId', 'name email').sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const Task = require('../models/Tasks');
async function getProjectTaskIds(projectId) {
  const tasks = await Task.find({ project: projectId }, '_id');
  return tasks.map(t => t._id);
}
