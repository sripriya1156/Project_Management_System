# Project Management System

A full-stack project management application built using the MERN stack (MongoDB, Express.js, React, Node.js). It enables structured workflows for project creation, task assignment, and collaboration using role-based access control.

---

## Overview

This system helps teams manage projects from creation to completion with authentication, task workflows, notifications, and progress tracking.

---

## Features

### Authentication and Authorization

- JWT-based authentication  
- Role-based access (Admin and User)  
- Secure password reset via email  
- Protected API routes  

### Project Management

- Create and assign projects  
- Manager approval workflow (Pending → Active)  
- Manager reassignment support  
- Project lifecycle tracking (Pending, Active, Completed, Overdue)  
- Progress tracking based on tasks  

### Task and Subtask System

- Task assignment with priority levels  
- Task workflow:  
  Pending → Assigned → Accepted → In Progress → Under Review → Completed  
- Subtask breakdown  
- Member-specific task views  
- Subtask checklist with comments  

### Notification System

- Centralized notification inbox  
- Read/unread tracking  
- Multiple notification types  
- Automatic cleanup of old notifications  

### Deadline and Escalation Engine

- Background scheduler  
- Deadline-based reminders  
- Overdue detection  
- Escalation alerts for inactivity  
- Auto-rejection after inactivity  

### Dashboard

- Project and task overview  
- Progress tracking  
- Activity logs  

---

## Tech Stack

- Frontend: React, Vite, Axios  
- Backend: Node.js, Express.js  
- Database: MongoDB  
- Authentication: JWT, bcrypt  
- Email: Nodemailer  

---

## Project Structure

Project_Management_System/

- backend/
  - server.js  
  - src/
    - config/
    - controllers/
    - middleware/
    - models/
    - routes/
    - services/

- frontend/
  - src/
    - components/
    - context/
    - models/
    - services/

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)  
- MongoDB (local or Atlas)  
- npm  

---

### Clone the Repository

git clone https://github.com/sripriya1156/Project_Management_System.git  
cd Project_Management_System  

---

### Backend Setup

cd backend  
npm install  

Create a `.env` file:

PORT=5000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  
EMAIL_USER=your_email@gmail.com  
EMAIL_PASS=your_app_password  

Run backend:

npm run dev  

---

### Frontend Setup

cd frontend  
npm install  
npm run dev  

---

## Local Development

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  

---

## API Routes

- POST /api/register  
- POST /api/login  
- /api/projects  
- /api/tasks  
- /api/subtasks  
- /api/notifications  
- /api/dashboard  

---

## User Roles

### Admin

- Create projects  
- Assign managers  
- Manage users  

### User / Manager

- Accept or reject assignments  
- Manage tasks and subtasks  
- Track progress  

---

## Environment Variables

- PORT  
- MONGO_URI  
- JWT_SECRET  
- EMAIL_USER  
- EMAIL_PASS  

---
