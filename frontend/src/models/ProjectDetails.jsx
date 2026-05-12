import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, UserPlus, ClipboardList, CheckCircle2, 
  Clock, Calendar, User, MoreVertical, Search, Send, Plus,
  ChevronRight, AlertCircle, Info, Zap, Layout
} from 'lucide-react';
import API from '../services/api';
import SubTaskChecklist from '../components/SubTaskChecklist';

/**
 * ProjectDetails - Adaptive View
 * Redesigned to match premium UI reference for both Members and Managers.
 */
function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Form State for Assigning Task (Manager View)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assigneeId: ''
  });

  // Modal State for Member Status Update
  const [statusModal, setStatusModal] = useState({ show: false, task: null });
  const [reassignModal, setReassignModal] = useState({ show: false, task: null, newUserId: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, membersRes, tasksRes, usersRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/projects/${id}/members`),
        API.get(`/projects/${id}/tasks`),
        API.get('/users')
      ]);
      setProject(projRes.data);
      setMembers(membersRes.data);
      setTasks(tasksRes.data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      setAllUsers((usersRes.data || []).filter(u => u.role !== 'Admin'));
    } catch (err) {
      console.error("Failed to fetch project details", err);
      setMessage({ type: 'error', text: 'Failed to load project sequence.' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isManagerOrAdmin = project && (
    userRole === 'Admin' || 
    project.manager?._id === userId || 
    project.createdBy === userId
  );

  const myTasks = tasks.filter(t => t.user?._id === userId);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/projects/create/${id}/addMembers/${taskForm.assigneeId}/assign_task`, {
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority
      });
      setMessage({ type: 'success', text: res.data.message });
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'Medium', assigneeId: '' });
      fetchData();
    } catch (err) {
      console.error("Task assign error:", err.response?.data || err.message);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error assigning task. Check console for details.' });
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}/status`, { status: newStatus });
      setStatusModal({ show: false, task: null });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update task state.' });
    }
  };

  const handleReassign = async () => {
    if (!reassignModal.newUserId) return;
    try {
      await API.put(`/tasks/${reassignModal.task._id}/reassign`, { newUserId: reassignModal.newUserId });
      setMessage({ type: 'success', text: `Task reassigned successfully.` });
      setReassignModal({ show: false, task: null, newUserId: '' });
      fetchData();
    } catch (err) {
      console.error('Reassign error:', err.response?.data || err.message);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error reassigning task.' });
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '20px' }}>
      <Zap size={40} className="animate-pulse" color="#3b82f6" />
      <span style={{ fontWeight: 800, color: '#64748b', fontSize: '1.2rem' }}>Reconstructing Node Interface...</span>
    </div>
  );

  if (!project) return <div style={{ padding: '40px', textAlign: 'center' }}>Node not found.</div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      <div className="responsive-padding-small" style={{ padding: '0 40px 60px 40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Top Navbar Simulation */}
        <div className="responsive-stack responsive-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'transparent', padding: '15px 0', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>
            <ArrowLeft size={20} /> Dashboard
          </button>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>Project Details</span>
        </div>
          <div className="responsive-hide" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Search resources..." style={{ padding: '10px 15px 10px 40px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '0.85rem', width: '250px' }} />
            </div>
            <Bell size={20} color="#64748b" style={{ cursor: 'pointer' }} />
          </div>
      </div>

      {message && (
        <div style={{ 
          margin: '0 0 30px 0', 
          padding: '16px 24px', 
          borderRadius: '16px', 
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', 
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
          <button onClick={() => setMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* Header Project Info */}
      <div className="responsive-stack" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>Enterprise Workspace</span>
          <h1 className="responsive-hero-text" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 12px 0', letterSpacing: '-1.5px' }}>{project.projectName}</h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '800px', lineHeight: 1.5, fontWeight: 600 }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px 20px', background: '#ffedd5', color: '#f59e0b', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            {project.status.toUpperCase()}
          </div>
          <button style={{ padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white', cursor: 'pointer' }}><MoreVertical size={20} color="#64748b" /></button>
        </div>
      </div>

      <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', marginBottom: '60px' }}>
        
        {/* LEFT COLUMN: Assign Form (Manager) or My Tasks (Member) */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          {isManagerOrAdmin ? (
            <div id="assign-section">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Assign New Task</h2>
              <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Assignee</label>
                    <select 
                      value={taskForm.assigneeId} 
                      onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})}
                      required
                      style={{ padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 600 }}
                    >
                      <option value="">Select user...</option>
                      {allUsers.map(u => <option key={u._id} value={u._id}>{u.name} {members.some(m => m.user._id === u._id) ? '(member)' : ''}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Due Date</label>
                    <input 
                      type="date" 
                      value={taskForm.dueDate}
                      onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                      max={project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : undefined}
                      required
                      style={{ padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 600 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Task Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Implement API Endpoint"
                    value={taskForm.title}
                    onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                    required
                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 600 }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Description</label>
                  <textarea 
                    placeholder="Describe the scope and requirements..."
                    value={taskForm.description}
                    onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                    required
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 600, minHeight: '120px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Priority</label>
                    <select 
                      value={taskForm.priority}
                      onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                      style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 800 }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <button type="submit" style={{ padding: '16px 32px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '120px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Send size={18} /> Assign Task
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div id="tasks-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Your Tasks</h2>
                <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', cursor: 'pointer' }}>
                  <Layout size={14} /> Filter
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {myTasks.length > 0 ? myTasks.map(task => (
                  <div key={task._id} style={{ 
                    padding: '24px', 
                    borderRadius: '20px', 
                    border: '1px solid #f1f5f9', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px',
                    transition: '0.2s',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc', 
                      display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3b82f6'
                    }}>
                      {task.status === 'Completed' ? <CheckCircle2 size={22} color="#10b981" /> : <Zap size={22} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{task.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        {task.status === 'Completed' && <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#10b981' }}>COMPLETED</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => setStatusModal({ show: true, task })}
                      disabled={task.status === 'Completed'}
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: '10px', 
                        border: '1px solid #f1f5f9', 
                        background: task.status === 'Completed' ? '#f1f5f9' : '#1e3a8a', 
                        color: task.status === 'Completed' ? '#94a3b8' : 'white', 
                        fontWeight: 800, 
                        fontSize: '0.8rem',
                        cursor: task.status === 'Completed' ? 'default' : 'pointer'
                      }}
                    >
                      Update Status
                    </button>
                  </div>
                )) : (
                  <div style={{ padding: '60px', textAlign: 'center', border: '2px dashed #f1f5f9', borderRadius: '24px' }}>
                    <p style={{ color: '#94a3b8', fontWeight: 700 }}>No active tasks assigned to you.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Team Members */}
        <div style={{ background: '#f8fafc', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Team Members</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {members.map((m, idx) => (
              <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'white', borderRadius: '20px', border: '1px solid transparent', transition: '0.2s' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '14px', 
                  background: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][idx % 4],
                  display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 800
                }}>
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{m.user.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{m.user.specialization?.[0] || 'Member'}</p>
                </div>
                <div style={{ padding: '6px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>
                  {m.user._id === project.manager?._id ? 'Owner' : 'Member'}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* BOTTOM SECTION: Task Execution Flow */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Task Execution Flow</h2>
          <div style={{ height: '2px', flex: 1, background: '#f1f5f9' }} />
        </div>

        <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {tasks.map(task => {
            const statusStyle = {
              'Completed': { bar: '#10b981', pill: '#f0fdf4', text: '#166534', label: 'DONE' },
              'In Progress': { bar: '#f59e0b', pill: '#fffbeb', text: '#92400e', label: 'IN PROGRESS' },
              'Accepted': { bar: '#8b5cf6', pill: '#f5f3ff', text: '#5b21b6', label: 'ACCEPTED' },
              'Rejected': { bar: '#ef4444', pill: '#fef2f2', text: '#991b1b', label: 'REJECTED' },
              'Overdue': { bar: '#ef4444', pill: '#fef2f2', text: '#991b1b', label: 'OVERDUE' },
              'default': { bar: '#94a3b8', pill: '#f8fafc', text: '#475569', label: 'PENDING' }
            };
            const style = statusStyle[task.status] || statusStyle.default;

            return (
              <div key={task._id} style={{ 
                background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9',
                display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: style.bar, borderRadius: '4px 0 0 4px' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '4px 10px', background: style.pill, color: style.text, borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900 }}>{style.label}</div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1' }}>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                </div>

                <div style={{ minHeight: '60px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{task.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
                </div>

                {(task.status === 'Accepted' || task.status === 'In Progress' || task.status === 'Completed' || task.status === 'Overdue') && (
                  <div style={{ marginTop: '4px' }}>
                    <SubTaskChecklist taskId={task._id} isManager={project?.manager?._id === userId} onUpdate={fetchData} />
                  </div>
                )}

                <div style={{ paddingTop: '16px', borderTop: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', fontWeight: 800, border: '1px solid #e2e8f0' }}>
                      {task.user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{task.user?.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {task.status === 'Rejected' && isManagerOrAdmin && (
                      <button
                        onClick={() => setReassignModal({ show: true, task, newUserId: '' })}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none',
                          background: '#ef4444', color: 'white', fontWeight: 800,
                          fontSize: '0.72rem', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', gap: '6px'
                        }}
                      >
                        ↺ Reassign
                      </button>
                    )}
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cbd5e1' }}>{task.status === 'Completed' ? 'ARCHIVED' : task.status === 'Rejected' ? 'REJECTED' : 'TRACKING'}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STATUS UPDATE MODAL */}
      {statusModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800 }}>Transition State</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>Update progression for node: <strong>{statusModal.task.title}</strong></p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Accepted', 'In Progress', 'Completed'].map(state => (
                <button 
                  key={state}
                  onClick={() => handleUpdateStatus(statusModal.task._id, state)}
                  style={{
                    padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#f8fafc',
                    fontWeight: 800, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: '0.2s', color: '#1e293b'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                  {state} <ChevronRight size={18} color="#cbd5e1" />
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setStatusModal({ show: false, task: null })}
              style={{ width: '100%', marginTop: '24px', padding: '16px', borderRadius: '16px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: 800, cursor: 'pointer' }}
            >
              Cancel Transition
            </button>
          </div>
        </div>
      )}

      {/* REASSIGN MODAL */}
      {reassignModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem' }}>↺</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Reassign Task</h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '28px', fontWeight: 600 }}>
              Task <strong style={{ color: '#ef4444' }}>"{reassignModal.task.title}"</strong> was rejected. Select a new assignee:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select
                value={reassignModal.newUserId}
                onChange={e => setReassignModal(prev => ({ ...prev, newUserId: e.target.value }))}
                style={{ padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: 600, fontSize: '0.9rem', width: '100%' }}
              >
                <option value="">Select new assignee...</option>
                {allUsers
                  .filter(u => u._id !== reassignModal.task.user?._id && u.role !== 'Admin')
                  .map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} {members.some(m => m.user._id === u._id) ? '(member)' : ''}
                    </option>
                  ))
                }
              </select>

              <button
                onClick={handleReassign}
                disabled={!reassignModal.newUserId}
                style={{
                  padding: '16px', borderRadius: '16px', border: 'none',
                  background: reassignModal.newUserId ? '#ef4444' : '#f1f5f9',
                  color: reassignModal.newUserId ? 'white' : '#94a3b8',
                  fontWeight: 800, cursor: reassignModal.newUserId ? 'pointer' : 'default',
                  fontSize: '0.95rem', transition: '0.2s'
                }}
              >
                Confirm Reassignment
              </button>

              <button
                onClick={() => setReassignModal({ show: false, task: null, newUserId: '' })}
                style={{ padding: '14px', borderRadius: '16px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ProjectDetails;
