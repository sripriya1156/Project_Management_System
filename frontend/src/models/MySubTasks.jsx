import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, User, ClipboardList, ArrowRight, MessageSquare, Plus } from 'lucide-react';
import API from '../services/api';

const MySubTasks = () => {
  const navigate = useNavigate();
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMySubTasks();
  }, []);

  const fetchMySubTasks = async () => {
    try {
      const res = await API.get('/subtasks/my-subtasks');
      setSubTasks(res.data);
    } catch (err) {
      console.error("Error fetching subtasks", err);
      setMessage('Failed to load your subtasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subTaskId, newStatus, currentStatus) => {
    // Flow check (redundant with UI but safe)
    const allowed = {
      'pending': ['in_progress'],
      'in_progress': ['done', 'pending'],
      'done': ['in_progress']
    };

    if (newStatus !== currentStatus && !allowed[currentStatus]?.includes(newStatus)) {
      alert("Invalid status transition.");
      return;
    }

    const previousSubTasks = [...subTasks];
    // Optimistic Update
    setSubTasks(subTasks.map(st => st._id === subTaskId ? { ...st, status: newStatus } : st));

    try {
      await API.patch(`/subtasks/${subTaskId}/status`, { status: newStatus });
    } catch (err) {
      setSubTasks(previousSubTasks);
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  if (loading) return <div className="loading-container">Loading your subtasks...</div>;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { color: '#f59e0b', icon: <Clock size={16} />, label: 'WAITING', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'in_progress': return { color: '#3b82f6', icon: <Plus size={16} style={{ transform: 'rotate(45deg)' }} />, label: 'WORKING', bg: 'rgba(59, 130, 246, 0.1)' };
      case 'done': return { color: '#10b981', icon: <CheckCircle size={16} />, label: 'COMPLETED', bg: 'rgba(16, 185, 129, 0.1)' };
      default: return { color: '#64748b', icon: null, label: status, bg: '#f1f5f9' };
    }
  };

  return (
    <div className="my-subtasks-container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Task Orchestrator</h1>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Manage your operational lifecycle</p>
        </div>
        <div style={{ padding: '12px 24px', background: 'var(--panel-bg)', borderRadius: '24px', fontSize: '0.9rem', fontWeight: 800, border: '1px solid var(--border-color)', display: 'flex', gap: '15px' }}>
          <span style={{ color: '#f59e0b' }}>{subTasks.filter(st => st.status === 'pending').length} WAITING</span>
          <span style={{ color: '#3b82f6' }}>{subTasks.filter(st => st.status === 'in_progress').length} ACTIVE</span>
          <span style={{ color: '#10b981' }}>{subTasks.filter(st => st.status === 'done').length} DONE</span>
        </div>
      </div>

      {message && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>{message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
        {subTasks.length > 0 ? (
          subTasks.map(st => {
            const config = getStatusConfig(st.status);
            return (
              <div key={st._id} style={{ 
                background: 'var(--panel-bg)', 
                borderRadius: '32px', 
                padding: '35px', 
                border: '1px solid var(--border-color)', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Visual indicator bar */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: config.color }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: config.bg, color: config.color, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                        {config.icon} {config.label}
                      </div>
                      <span 
                        onClick={() => navigate(`/project/${st.taskId?.project?._id}`)}
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        {st.taskId?.project?.projectName} <ArrowRight size={14} /> {st.taskId?.title}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.7px' }}>{st.title}</h3>
                    <p style={{ margin: '12px 0 0 0', fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '700px' }}>{st.description}</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '6px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <button 
                        onClick={() => handleStatusChange(st._id, 'pending', st.status)}
                        disabled={st.status === 'pending'}
                        style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: st.status === 'pending' ? '#f59e0b' : 'transparent', color: st.status === 'pending' ? 'white' : '#64748b', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        Wait
                      </button>
                      <button 
                        onClick={() => handleStatusChange(st._id, 'in_progress', st.status)}
                        disabled={st.status === 'in_progress'}
                        style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: st.status === 'in_progress' ? '#3b82f6' : 'transparent', color: st.status === 'in_progress' ? 'white' : '#64748b', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        Work
                      </button>
                      <button 
                        onClick={() => handleStatusChange(st._id, 'done', st.status)}
                        disabled={st.status === 'done' || st.status === 'pending'}
                        title={st.status === 'pending' ? 'Must start work before finishing' : ''}
                        style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: st.status === 'done' ? '#10b981' : 'transparent', color: st.status === 'done' ? 'white' : '#64748b', fontSize: '0.75rem', fontWeight: 800, cursor: (st.status === 'done' || st.status === 'pending') ? 'not-allowed' : 'pointer', opacity: st.status === 'pending' ? 0.5 : 1, transition: 'all 0.2s' }}
                      >
                        Finish
                      </button>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 900, 
                      color: st.priority === 'high' ? '#ef4444' : st.priority === 'medium' ? '#f59e0b' : '#10b981', 
                      background: st.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : st.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      letterSpacing: '0.5px'
                    }}>
                      {st.priority.toUpperCase()} PRIORITY
                    </div>
                  </div>
                </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>
                    <Clock size={16} /> Due: {st.dueDate ? new Date(st.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                  <div style={{ width: '1px', height: '15px', background: 'var(--border-color)' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    <MessageSquare size={16} /> {st.comments?.length || 0} Comments
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/project/${st.taskId?.project?._id}`)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  View Details <ArrowRight size={14} />
                </button>
              </div>
                </div>
              );
            })
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--panel-bg)', borderRadius: '32px', border: '2px dashed var(--border-color)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(90, 50, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
              <ClipboardList size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>No Assigned Subtasks</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>You don't have any subtasks assigned yet. When a manager assigns you micro-tasks, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubTasks;
