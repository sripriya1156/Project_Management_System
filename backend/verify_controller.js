const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./src/models/Project');
const Task = require('./src/models/Tasks');
const User = require('./src/models/User');
const projectController = require('./src/controllers/projectController');

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find "Pooja" or the creator of the project
  const user = await User.findOne({ email: 'pooja.mishra@spritflow.com' });
  if (!user) {
    console.log('User Pooja not found to test with.');
    process.exit(0);
  }

  console.log(`Testing for user: ${user.name} (${user._id})`);

  // Mock req/res
  const req = { user };
  const res = {
    status: (code) => {
      console.log(`HTTP Status: ${code}`);
      return {
        json: (data) => {
          console.log(`Data (length: ${data && data.length ? data.length : 0}):`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
        }
      };
    }
  };

  try {
    await projectController.getMyRejectedProjects(req, res);
  } catch (e) {
    console.error('Error in controller:', e);
  }

  process.exit(0);
}

verify().catch(e => { console.error(e); process.exit(1); });
