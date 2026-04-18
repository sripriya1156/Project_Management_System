const mongoose = require('mongoose');

const uri = "mongodb+srv://vishnusripriyak_db_user:nQ8vrdUC6xIi4D4S@cluster0.3zxjhtk.mongodb.net/?appName=Cluster0";

async function findProject() {
  await mongoose.connect(uri);
  const collections = await mongoose.connection.db.listCollections().toArray();
  const projectsCol = mongoose.connection.db.collection('projects');
  const project = await projectsCol.findOne();
  if (project) {
    console.log("PROJECT_ID:" + project._id.toString());
  } else {
    console.log("NO_PROJECT_FOUND");
    const count = await projectsCol.countDocuments();
    console.log("PROJECT_COUNT:" + count);
  }
  await mongoose.disconnect();
}

findProject().catch(err => {
  console.error(err);
  process.exit(1);
});
