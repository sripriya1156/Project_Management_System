import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Briefcase, ShieldCheck, CheckCircle, Clock, Zap, Plus, ArrowRight, MoreHorizontal,
  Activity, XCircle, MessageSquare, AlertCircle, ChevronRight
} from "lucide-react";

// Main Routing Component
const Dashboard = () => {
  const userRole = localStorage.getItem("role") || "Employee";

  if (userRole === "Admin") {
    return <AdminDashboard />;
  } else {
    return <EmployeeDashboard />;
  }
};

// --- ADMIN DASHBOARD VIEW ---
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeProjects: [],
    completedProjects: [],
    rejectedProjects: [],
    pendingApprovals: [],
    allUsers: [],
    schedule: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projRes, managedRes, pendingRes, rejectedRes, workloadRes, usersRes] = await Promise.all([
        API.get('/projects/my-projects-admin').catch(() => ({ data: [] })),
        API.get('/projects/my-managed-projects').catch(() => ({ data: [] })),
        API.get('/projects/my-pending-managed-projects').catch(() => ({ data: [] })),
        API.get('/projects/my-rejected-projects').catch(() => ({ data: [] })),
        API.get('/users/workload').catch(() => ({ data: [] })),
        API.get('/users?limit=5').catch(() => ({ data: [] }))
      ]);

      const allProjs = [...(projRes.data || []), ...(managedRes.data || [])];
      const uniqueProjs = Array.from(new Map(allProjs.map(p => [p._id, p])).values());
      const active = uniqueProjs.filter(p => p.status !== 'Completed');
      const completed = uniqueProjs.filter(p => p.status === 'Completed');
      const sortedSchedule = [...uniqueProjs].sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 5);

      setData({
        activeProjects: active,
        completedProjects: completed,
        rejectedProjects: rejectedRes.data || [],
        pendingApprovals: pendingRes.data || [],
        allUsers: workloadRes.data || [],
        recentUsers: usersRes.data || [],
        schedule: sortedSchedule
      });
    } catch (err) {
      console.error("Dashboard data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Establishing Node Presence...</div>;

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Operational Overview</h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>Global enterprise ecosystem monitoring.</p>
        </div>
        <button onClick={() => navigate('/create-project')} style={{ background: '#1a237e', color: 'white', padding: '12px 28px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>
          <Plus size={18} style={{ marginRight: '6px' }} /> Create New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <StatCard icon={<Zap size={20} />} label="ACTIVE PROJECTS" value={data.activeProjects.length} status="ON TRACK" bgColor="#fffaf4" color="#f59e0b" progress={75} onClick={() => navigate('/active-projects')} />
        <StatCard icon={<CheckCircle size={20} />} label="COMPLETED PROJECTS" value={data.completedProjects.length} status="SUCCESS" bgColor="#f4fdfa" color="#10b981" progress={100} onClick={() => navigate('/completed-projects')} />
        <StatCard icon={<XCircle size={20} />} label="REJECTED PROJECTS" value={data.rejectedProjects.length} status="REQUIRES ACTION" bgColor="#fff5f5" color="#ef4444" progress={0} onClick={() => navigate('/rejected-projects')} />
        <StatCard icon={<MoreHorizontal size={20} />} label="PENDING APPROVALS" value={data.pendingApprovals.length} status="ATTENTION" bgColor="#f7f5ff" color="#8b5cf6" progress={40} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', marginBottom: '48px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>Project Schedule</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ paddingBottom: '16px' }}>Project Name</th>
                <th style={{ paddingBottom: '16px' }}>Lead</th>
                <th style={{ paddingBottom: '16px' }}>Status</th>
                <th style={{ paddingBottom: '16px', textAlign: 'right' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {data.schedule.map(proj => (
                <tr key={proj._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px 0' }}>
                    <p style={{ fontWeight: 700, margin: 0, color: '#1e293b', fontSize: '0.95rem' }}>{proj.projectName}</p>
                  </td>
                  <td style={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>{proj.manager?.name || 'Unassigned'}</td>
                  <td>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 900, 
                      textTransform: 'uppercase', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      background: 
                        proj.status === 'Completed' ? '#10b981' : 
                        proj.status === 'Overdue' ? '#ef4444' : 
                        proj.status === 'Pending' ? '#8b5cf6' : 
                        '#f59e0b', 
                      color: 'white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                    }}>
                      {proj.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{new Date(proj.endDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>Resource Load</h3>
          <div style={{ flex: 1 }}>
            {(data.recentUsers || []).map((user, index) => (
              <div 
                key={user._id} 
                onClick={() => navigate('/user-management')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '12px', 
                  margin: '0 -12px 8px -12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6], 
                  color: 'white', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  fontWeight: 800, 
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, margin: 0, fontSize: '0.95rem', color: '#1e293b' }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: 600 }}>{user.specialization?.length > 0 ? user.specialization.join(", ") : "No specialization"}</p>
                </div>
                <ArrowRight size={14} color="#cbd5e1" />
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/user-management')} 
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: '#f8fafc', 
              borderRadius: '12px', 
              border: '1px solid #f1f5f9', 
              fontWeight: 800, 
              color: '#475569', 
              marginTop: '16px', 
              cursor: 'pointer', 
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              transition: '0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.border = '1px solid #e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.border = '1px solid #f1f5f9'}
          >
            View All Members <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- EMPLOYEE DASHBOARD VIEW ---
const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    projects: [],
    managedProjects: [],
    completedProjects: [],
    rejectedProjects: [],
    tasks: [],
    notifications: []
  });
  const userName = localStorage.getItem("userName") || "User";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const sortTasks = (tasks) => {
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    return [...tasks].sort((a, b) => {
      const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateDiff !== 0) return dateDiff;
      return priorityOrder[a.priority] - (priorityOrder[b.priority] || 4);
    });
  };

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, managedRes, rejectedRes, tasksRes, notifsRes] = await Promise.all([
        API.get('/projects/my-projects').catch(() => ({ data: [] })),
        API.get('/projects/my-managed-projects').catch(() => ({ data: [] })),
        API.get('/projects/my-rejected-projects').catch(() => ({ data: [] })),
        API.get('/tasks/my-tasks').catch(() => ({ data: [] })),
        API.get('/notifications/all').catch(() => ({ data: [] }))
      ]);

      setData({
        projects: (projectsRes.data || []).filter(p => p.status !== 'Completed'),
        managedProjects: managedRes.data || [],
        completedProjects: (projectsRes.data || []).filter(p => p.status === 'Completed'),
        rejectedProjects: rejectedRes.data || [],
        tasks: sortTasks(tasksRes.data || []),
        notifications: (notifsRes.data || []).slice(0, 5)
      });
    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Establishing Personal Node...</div>;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-1.5px' }}>
          Hello, {userName.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, marginTop: '6px' }}>
          Today is {today}
        </p>
      </div>

      {/* Top Stat Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '48px' }}>
        <StatTile title="ACTIVE PROJECTS" value={data.projects.length} icon={<Briefcase size={18} />} bgColor="#fffaf4" accentColor="#f59e0b" onClick={() => navigate('/active-projects')} />
        <StatTile title="MANAGED PROJECTS" value={data.managedProjects.length} icon={<ShieldCheck size={18} />} bgColor="#f7f5ff" accentColor="#8b5cf6" onClick={() => navigate('/managed-projects')} />
        <StatTile title="COMPLETED PROJECTS" value={data.completedProjects.length} icon={<CheckCircle size={18} />} bgColor="#f4fdfa" accentColor="#10b981" onClick={() => navigate('/completed-projects')} />
        <StatTile title="REJECTED PROJECTS" value={data.rejectedProjects.length} icon={<XCircle size={18} />} bgColor="#fff5f5" accentColor="#ef4444" onClick={() => navigate('/rejected-projects')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Active Projects</h2>
            <button onClick={() => navigate('/active-projects')} style={{ color: '#3b82f6', fontWeight: 800, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>View All</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            {data.projects.slice(0, 4).map(proj => (
              <ProjectCardMockup key={proj._id} project={proj} onClick={() => navigate(`/project/${proj._id}`)} />
            ))}
            {data.projects.length === 0 && <div style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '2px dashed #f1f5f9', textAlign: 'center', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>No active projects.</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Completed Projects</h2>
            <button onClick={() => navigate('/completed-projects')} style={{ color: '#10b981', fontWeight: 800, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>View All</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {data.completedProjects.slice(0, 2).map(proj => (
              <ProjectCardMockup key={proj._id} project={proj} statusColor="#10b981" onClick={() => navigate(`/project/${proj._id}`)} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Tasks in Order</h3>
              <ArrowRight size={18} color="#cbd5e1" style={{ cursor: 'pointer' }} onClick={() => navigate('/tasks-in-order')} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.tasks.slice(0, 5).map(task => (
                <div key={task._id} style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ minWidth: '20px', height: '20px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', backgroundColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#3b82f6' }}></div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>{task.title}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                        color: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#3b82f6',
                        background: task.priority === 'High' ? '#fff5f5' : task.priority === 'Medium' ? '#fffaf4' : '#f4faff'
                      }}>
                        {task.priority || "Medium"}
                      </span>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase',
                        color: task.status === 'Completed' ? '#166534' : task.status === 'Overdue' || task.status === 'Rejected' ? '#991b1b' : task.status === 'Accepted' ? '#5b21b6' : task.status === 'In Progress' ? '#92400e' : '#475569',
                        background: task.status === 'Completed' ? '#f0fdf4' : task.status === 'Overdue' || task.status === 'Rejected' ? '#fef2f2' : task.status === 'Accepted' ? '#f5f3ff' : task.status === 'In Progress' ? '#fffbeb' : '#f8fafc'
                      }}>
                        {task.status || "Pending"}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px' }}>
                        <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/tasks-in-order')} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'transparent', color: '#94a3b8', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>
                + Add New Task
              </button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Alerts</h3>
              <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}>Clear All</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.notifications.length > 0 ? data.notifications.map(notif => (
                <div key={notif._id} style={{ display: 'flex', gap: '14px', opacity: notif.isRead ? 0.6 : 1 }}>
                  <div style={{ minWidth: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {notif.type === 'Warning' ? <AlertCircle size={16} color="#ef4444" /> : <MessageSquare size={16} color="#3b82f6" />}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0', lineHeight: 1.4 }}>{notif.message}</p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              )) : <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontWeight: 700, fontSize: '0.8rem' }}>Node workspace quiet.</div>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

// --- CUSTOM SUB-COMPONENTS ---

const StatCard = ({ icon, label, value, status, bgColor, color, progress, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      background: bgColor || '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', position: 'relative',
      cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={onClick ? (e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)';
    } : undefined}
    onMouseLeave={onClick ? (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    } : undefined}
  >
    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: color, border: '1px solid #f1f5f9' }}>
      {icon}
    </div>
    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>{label}</p>
    <h4 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{value.toString().padStart(2, '0')}</h4>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 900, color, background: `${color}10`, padding: '4px 10px', borderRadius: '6px' }}>{status}</span>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800 }}>{progress}% rate</span>
    </div>
  </div>
);

const StatTile = ({ title, value, icon, bgColor, accentColor, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      background: bgColor, padding: '24px', borderRadius: '20px', position: 'relative', 
      border: '1px solid rgba(0,0,0,0.01)', cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={onClick ? (e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.03)';
    } : undefined}
    onMouseLeave={onClick ? (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    } : undefined}
  >
    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: accentColor, border: '1px solid rgba(0,0,0,0.03)' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, margin: '0 0 12px 0', letterSpacing: '0.5px' }}>{title}</p>
      <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>{value.toString().padStart(2, '0')}</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, margin: 0 }}>System Node Activity</p>
    </div>
  </div>
);

const ProjectCardMockup = ({ project, onClick, statusColor }) => {
  const accent = statusColor || (project.status === 'Completed' ? '#10b981' : '#f59e0b');

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', cursor: 'pointer',
        padding: '24px', transition: '0.2s', display: 'flex', flexDirection: 'column', gap: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ 
          background: 
            project.status === 'Completed' ? '#f0fdf4' : 
            project.status === 'Overdue' ? '#fef2f2' : 
            project.status === 'Pending' ? '#f5f3ff' : 
            '#fffbeb', 
          color: 
            project.status === 'Completed' ? '#166534' : 
            project.status === 'Overdue' ? '#991b1b' : 
            project.status === 'Pending' ? '#5b21b6' : 
            '#f59e0b', 
          padding: '6px 14px', 
          borderRadius: '8px', 
          fontSize: '0.65rem', 
          fontWeight: 900, 
          textTransform: 'uppercase', 
        }}>{project.status || 'Active'}</div>
        <ChevronRight size={18} color="#94a3b8" />
      </div>

      <div style={{ flex: 1, marginTop: '8px' }}>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.3 }}>{project.projectName}</h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontWeight: 600 }}>{project.description || "Execution Node - Tracking scope."}</p>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            {(project.members || []).slice(0, 3).map((m, i) => (
              <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5], border: '2px solid #fff', marginLeft: i > 0 ? '-10px' : 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>{m.initials || m.name?.charAt(0) || "U"}</div>
            ))}
            {(project.members || []).length > 3 && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', border: '2px solid #fff', marginLeft: '-10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>+{(project.members || []).length - 3}</div>
            )}
            {(project.members || []).length === 0 && (
               <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Unassigned</div>
            )}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>{project.progress || 0}% Done</span>
        </div>
        
        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${project.progress || 0}%`, height: '100%', background: accent, borderRadius: '10px' }} />
        </div>
        
        {project.endDate && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', marginTop: '4px' }}>
              <Clock size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Due: {new Date(project.endDate).toLocaleDateString()}</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
