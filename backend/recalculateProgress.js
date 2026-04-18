require('dotenv').config();
const mongoose = require('mongoose');

const connectdb = require('./src/config/db');
const Project = require('./src/models/Project');
const Project_Members = require('./src/models/Project_Members');
const Task = require('./src/models/Tasks');
const SubTask = require('./src/models/SubTask');

async function recalculate() {
  await connectdb();
  console.log('Connected to DB');

  const projects = await Project.find();
  for (let project of projects) {
    const members = await Project_Members.find({ project: project._id });
    const projectTasks = await Task.find({ project: project._id });
    const taskIds = projectTasks.map(t => t._id);
    
    let totalMemberProgress = 0;
    let activeMembersCount = 0;

    for (let member of members) {
      const userSubTasks = await SubTask.find({ taskId: { $in: taskIds }, userId: member.user });
      const totalST = userSubTasks.length;
      
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
      const totalTasksCount = projectTasks.length;
      const completedTasksCount = projectTasks.filter(t => t.status === 'Completed').length;
      project.progress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    }
    
    if (project.progress === 100) {
      project.status = 'Completed';
    } else if (project.progress > 0) {
       if (project.status === 'Pending') project.status = 'Active';
    }

    await project.save();
    console.log(`Project "${project.projectName}" updated to ${project.progress}%`);
  }

  console.log('Done!');
  process.exit(0);
}

recalculate().catch(err => {
  console.error(err);
  process.exit(1);
});
