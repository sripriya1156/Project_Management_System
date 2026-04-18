import {BrowserRouter,Routes,Route} from "react-router-dom";

import Login from "./models/login";
import Signup from "./models/signup";
import Dashboard from "./models/dashboard";
import CreateProject from "./models/createproject";
import AdminPanel from "./models/AdminPanel";
import ProjectDetails from "./models/ProjectDetails";
import Landing from "./models/Landing";
import Layout from "./components/Layout";
import ForgotPassword from "./models/ForgotPassword";
import ResetPassword from "./models/ResetPassword";
import SubTaskAssignment from "./models/SubTaskAssignment";
import MySubTasks from "./models/MySubTasks";
import ProjectListView from "./models/ProjectListView";
import TasksInOrderView from "./models/TasksInOrderView";
import UserManagement from "./models/UserManagement";
import ProjectSchedule from "./models/ProjectSchedule";
import Inbox from "./models/Inbox";

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Landing/>} />
<Route path="/login" element={<Login/>} />
<Route path="/signup" element={<Signup/>} />
<Route path="/forgot-password" element={<ForgotPassword/>} />
<Route path="/reset-password/:token" element={<ResetPassword/>} />

{/* Protected Routes inside Layout */}
<Route element={<Layout />}>
  <Route path="/dashboard" element={<Dashboard/>} />
  <Route path="/create-project" element={<CreateProject/>} />
  <Route path="/admin" element={<AdminPanel/>} />
  <Route path="/my-subtasks" element={<MySubTasks />} />
  
  <Route path="/active-projects" element={<ProjectListView type="active" />} />
  <Route path="/managed-projects" element={<ProjectListView type="managed" />} />
  <Route path="/rejected-projects" element={<ProjectListView type="rejected" />} />
  <Route path="/completed-projects" element={<ProjectListView type="completed" />} />
  <Route path="/tasks-in-order" element={<TasksInOrderView />} />
  <Route path="/user-management" element={<UserManagement />} />
  <Route path="/project-schedule" element={<ProjectSchedule />} />
  <Route path="/inbox" element={<Inbox />} />
</Route>

<Route path="/project/:id" element={<ProjectDetails/>} />
<Route path="/project/:id/assign-subtasks" element={<SubTaskAssignment />} />

</Routes>


</BrowserRouter>

);

}

export default App;