/**
 * One-time migration: Fix projects where managerStatus='accepted' but status='Pending'
 * Run once with: node fixProjectStatus.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const connectdb = require('./src/config/db');
const Project = require('./src/models/Project');
const Project_Members = require('./src/models/Project_Members');

async function fixProjectStatuses() {
  await connectdb();
  console.log('Connected to DB');

  // Fix: all projects where manager accepted but status is still Pending
  const result = await Project.updateMany(
    { managerStatus: 'accepted', status: 'Pending' },
    { $set: { status: 'Active' } }
  );

  console.log(`Fixed ${result.modifiedCount} project(s) → status set to Active`);

  // Also ensure managers are in Project_Members for these projects
  const fixedProjects = await Project.find({ managerStatus: 'accepted' });
  let membersAdded = 0;

  for (const project of fixedProjects) {
    const exists = await Project_Members.findOne({ project: project._id, user: project.manager });
    if (!exists) {
      await Project_Members.create({ user: project.manager, project: project._id, role: 'Member' });
      membersAdded++;
      console.log(`Added manager ${project.manager} to Project_Members for project "${project.projectName}"`);
    }
  }

  console.log(`Added ${membersAdded} manager(s) to Project_Members`);
  console.log('Migration complete!');
  process.exit(0);
}

fixProjectStatuses().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
