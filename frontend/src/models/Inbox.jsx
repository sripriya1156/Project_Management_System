import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle, XCircle, Clock, ShieldCheck, 
  Briefcase, Info, AlertCircle, Check, Trash2, ArrowRight
} from 'lucide-react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const Inbox = () => {
  const [activeTab, setActiveTab] = useState('notifications'); // Default to notifications if they are an admin
  const [notifications, setNotifications] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role") || "Employee";

  useEffect(() => {
    fetchData();
    if (userRole !== 'Admin') {
      setActiveTab('approvals');
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }

      const [notifRes, projectRes, taskRes] = await Promise.all([
        API.get('/notifications/all'),
        API.get('/projects/my-pending-managed-projects'),
        API.get('/tasks/pending')
      ]);
      setNotifications(notifRes.data || []);
      setPendingProjects(projectRes.data || []);
      setPendingTasks(taskRes.data || []);
    } catch (err) {
      console.error("Inbox data fetch error", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please sign out and sign in again to view your Inbox.");
      } else {
        setError("Unable to connect to the server. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManagerResponse = async (projectId, status) => {
    try {
      await API.post(`/projects/${projectId}/manager-response`, { status });
      setPendingProjects(prev => prev.filter(p => p._id !== projectId));
      fetchData();
    } catch (err) {
      alert("Error responding to manager invitation");
    }
  };

  const handleTaskResponse = async (taskId, action) => {
    try {
      if (action === 'accept') {
        await API.post(`/tasks/${taskId}/accept`);
      } else {
        await API.post(`/tasks/${taskId}/reject`);
      }
      setPendingTasks(prev => prev.filter(t => t._id !== taskId));
      fetchData();
    } catch (err) {
      alert(`Error ${action}ing task`);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Refreshing Digital Inbox...</div>;

  const totalApprovals = pendingProjects.length + pendingTasks.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#1e293b' }}>
      
      {error && (
        <div style={{ 
          background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', 
          padding: '20px', borderRadius: '16px', marginBottom: '32px', 
          display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 700 
        }}>
          <AlertCircle size={24} />
          <span>{error}</span>
          <button 
            onClick={() => navigate('/login')}
            style={{ marginLeft: 'auto', background: '#b91c1c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>
            Go to Login
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>Global Inbox</h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600, marginTop: '8px' }}>Manage your workspace activity and requests.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('approvals')}
            style={{ 
              padding: '10px 24px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              background: activeTab === 'approvals' ? '#1a237e' : 'white',
              color: activeTab === 'approvals' ? 'white' : '#64748b',
              boxShadow: activeTab === 'approvals' ? '0 10px 20px -5px rgba(26, 35, 126, 0.3)' : 'none'
            }}>
            Approvals {totalApprovals > 0 && <span style={{ marginLeft: '8px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem' }}>{totalApprovals}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            style={{ 
              padding: '10px 24px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              background: activeTab === 'notifications' ? '#1a237e' : 'white',
              color: activeTab === 'notifications' ? 'white' : '#64748b',
              boxShadow: activeTab === 'notifications' ? '0 10px 20px -5px rgba(26, 35, 126, 0.3)' : 'none'
            }}>
            Notifications {unreadCount > 0 && <span style={{ marginLeft: '8px', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem' }}>{unreadCount}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'approvals' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {totalApprovals === 0 && (
            <div style={{ padding: '80px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
              <ShieldCheck size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#1e293b', fontSize: '1.2rem', fontWeight: 800 }}>Clear Workspace</h3>
              <p style={{ color: '#64748b', fontWeight: 600 }}>No pending role or task approvals at this time.</p>
            </div>
          )}

          {/* Project Manager Invitations */}
          {pendingProjects.map(proj => (
            <div key={proj._id} style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', display: 'flex', gap: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', background: '#8b5cf6' }}></div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f7f5ff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8b5cf6' }}>
                <ShieldCheck size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1px' }}>Role Invitation</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>{proj.projectName}</h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{new Date(proj.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  You have been assigned as the **Project Manager** by {proj.createdBy?.name || 'an Admin'}. 
                  {proj.description && ` Project details: ${proj.description}`}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleManagerResponse(proj._id, 'accepted')}
                    style={{ background: '#10b981', color: 'white', padding: '12px 28px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={18} /> Accept Role
                  </button>
                  <button 
                    onClick={() => handleManagerResponse(proj._id, 'rejected')}
                    style={{ background: 'white', color: '#ef4444', padding: '12px 28px', borderRadius: '12px', border: '1px solid #fee2e2', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={18} /> Decline
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Task Assignments */}
          {pendingTasks.map(task => (
            <div key={task._id} style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', display: 'flex', gap: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', background: '#3b82f6' }}></div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f4faff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3b82f6' }}>
                <Briefcase size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>Task Assignment</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>{task.title}</h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  <strong>Project:</strong> {task.project?.projectName || 'General'}<br/>
                  {task.description}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleTaskResponse(task._id, 'accept')}
                    style={{ background: '#3b82f6', color: 'white', padding: '12px 28px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={18} /> Accept Task
                  </button>
                  <button 
                    onClick={() => handleTaskResponse(task._id, 'reject')}
                    style={{ background: 'white', color: '#ef4444', padding: '12px 28px', borderRadius: '12px', border: '1px solid #fee2e2', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #f8fafc', paddingBottom: '24px' }}>
            <div>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Activity</h3>
               <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>
                 <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                 Notifications are automatically pruned after 15 days.
               </p>
            </div>
            <button 
              onClick={markAllAsRead}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              Clear All Notifications
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {notifications.map((notif, idx) => (
              <div 
                key={notif._id} 
                style={{ 
                  display: 'flex', gap: '20px', padding: '24px', 
                  borderBottom: idx === notifications.length - 1 ? 'none' : '1px solid #f8fafc',
                  opacity: notif.isRead ? 0.6 : 1,
                  background: notif.isRead ? 'transparent' : '#f8faff',
                  borderRadius: '16px',
                  margin: '0 -10px',
                  transition: '0.2s'
                }}>
                <div style={{ 
                   minWidth: '48px', height: '48px', borderRadius: '12px', 
                   background: notif.isRead ? '#f1f5f9' : 'white', 
                   display: 'flex', justifyContent: 'center', alignItems: 'center',
                   boxShadow: notif.isRead ? 'none' : '0 4px 10px rgba(0,0,0,0.05)'
                }}>
                  <Info size={22} color="#3b82f6" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0', lineHeight: 1.5 }}>{notif.message}</p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{new Date(notif.createdAt).toLocaleString()}</span>
                    {!notif.isRead && <span style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></span>}
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                 <Bell size={40} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                 <p style={{ color: '#94a3b8', fontWeight: 700 }}>All caught up! No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
