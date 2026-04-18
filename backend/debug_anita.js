const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./src/models/Project');
const Task = require('./src/models/Tasks');
const User = require('./src/models/User');

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find "Anita Reddy"
  const anita = await User.findOne({ name: /Anita Reddy/i });
  if (!anita) {
    console.log('Anita Reddy not found.');
    // List all users to see names
    const users = await User.find({}, 'name role');
    console.log('All users:', users);
  } else {
    console.log(`Found Anita Reddy: ${anita._id} (${anita.email})`);
    
    // Find her tasks
    const tasks = await Task.find({ user: anita._id }).populate('project');
    console.log(`Found ${tasks.length} tasks for Anita Reddy:`);
    tasks.forEach(t => {
      console.log(` - Title: "${t.title}" | Status: "${t.status}" | Project: "${t.project ? t.project.projectName : 'N/A'}" (${t.project ? t.project._id : 'N/A'})`);
      if (t.project) {
        console.log(`   Project CreatedBy: ${t.project.createdBy} | Manager: ${t.project.manager}`);
      }
    });

    const rejected = await Task.find({ user: anita._id, status: /Rejected/i });
    console.log(`Rejected tasks count (regex): ${rejected.length}`);
  }

  // Find overall rejected tasks in the system
  const allRejected = await Task.find({ status: /Rejected/i }).populate('project');
  console.log(`\nTotal rejected tasks in system: ${allRejected.length}`);
  allRejected.forEach(t => {
      console.log(` - Task "${t.title}" (Status: ${t.status}) in Project "${t.project ? t.project.projectName : 'N/A'}"`);
  });

  process.exit(0);
}

debug().catch(e => { console.error(e); process.exit(1); });
