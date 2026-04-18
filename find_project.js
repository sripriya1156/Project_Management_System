const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Project = require('./backend/src/models/Project');

async function findProject() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/management_system');
  const project = await Project.findOne();
  if (project) {
    console.log("PROJECT_ID:" + project._id);
  } else {
    console.log("NO_PROJECT_FOUND");
  }
  await mongoose.disconnect();
}

findProject().catch(err => {
  console.error(err);
  process.exit(1);
});
