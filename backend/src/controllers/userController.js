const User = require('../models/User');
const Project = require('../models/Project');
const Project_Members = require('../models/Project_Members');

exports.provideAccess = async (req, res) => {
  const { email: rawEmail } = req.body;
  if (!rawEmail) {
    return res.status(400).send({ message: "Please provide email" });
  }
  try {
    const email = String(rawEmail).toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found!!" });
    }
    user.role = "Admin";
    await user.save();
    res.status(200).send({ message: "Role Changed" });
  } catch (err) {
    res.status(500).send('Internal Server error');
  }
};

exports.getWorkload = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }, 'name email role specialization'); 
    console.log("Workload users found:", users.length);

    const userWorkloads = await Promise.all(users.map(async (user) => {
      // Fetch memberships and managed projects
      const [memberships, managed] = await Promise.all([
        Project_Members.find({ user: user._id }).populate('project'),
        Project.find({ manager: user._id, status: 'Active' })
      ]);

      const activeProjectsMap = new Map();
      
      memberships.forEach(m => {
        if (m.project && m.project.status === 'Active') {
          activeProjectsMap.set(m.project._id.toString(), {
            projectName: m.project.projectName,
            isManager: false
          });
        }
      });
      
      managed.forEach(p => {
        if (p.status === 'Active') {
          activeProjectsMap.set(p._id.toString(), {
            projectName: p.projectName,
            isManager: true
          });
        }
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization || [],
        activeProjects: Array.from(activeProjectsMap.values())
      };
    }));

    res.status(200).json(userWorkloads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const query = {};
    const limit = req.query.limit ? parseInt(req.query.limit) : 0; // 0 = no limit in mongoose
    const users = await User.find(query, 'name email role specialization')
      .limit(limit)
      .lean();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
