const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const connectdb = require('./src/config/db');

// Connect to database
connectdb();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const subTaskRoutes = require('./src/routes/subTaskRoutes');

// Mount Routes (Keeping paths at root level to maintain frontend compatibility)
app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/subtasks', subTaskRoutes);
// app.use('/', authRoutes);
// app.use('/', userRoutes);
// app.use('/', projectRoutes);
// app.use('/', taskRoutes);
// app.use('/', notificationRoutes);
// app.use('/', activityRoutes);
// app.use('/', dashboardRoutes);
// app.use('/', subTaskRoutes);

// Start Background Services
require('./src/services/deadlineService').startDeadlineService();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
