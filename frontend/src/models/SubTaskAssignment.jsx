import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Clock, AlertTriangle, User, ClipboardList, Trash2, MessageSquare } from 'lucide-react';
import API from '../services/api';

const SubTaskAssignment = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]); // Milestones
  const [members, setMembers] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    taskId: '',
    userId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchInitialData();
  }, [projectId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes, membersRes, subTasksRes] = await Promise.all([
        API.get(`/projects/${projectId}`),
        API.get(`/projects/${projectId}/tasks`),
        API.get(`/projects/${projectId}/members`),
        API.get(`/subtasks/project/${projectId}`)
      ]);

      setProject(projRes.data);
      setTasks(tasksRes.data.filter(t => ['Accepted', 'In Progress'].includes(t.status)));
      setMembers(membersRes.data);
      setSubTasks(subTasksRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
      setMessage({ text: 'Failed to load project data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.taskId || !formData.userId) {
      setMessage({ text: 'Please select a milestone and a member.', type: 'error' });
      return;
    }

    try {
      await API.post('/subtasks', formData);
      setMessage({ text: 'Subtask assigned successfully!', type: 'success' });
      setFormData({
        taskId: '',
        userId: '',
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium'
      });
      // Refresh subtasks list
      const res = await API.get(`/subtasks/project/${projectId}`);
      setSubTasks(res.data);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error assigning subtask.', type: 'error' });
    }
  };

  const handleDelete = async (subTaskId) => {
    if (!window.confirm("Are you sure you want to delete this subtask?")) return;
    try {
      await API.delete(`/subtasks/${subTaskId}`);
      setSubTasks(subTasks.filter(st => st._id !== subTaskId));
      setMessage({ text: 'Subtask deleted.', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Error deleting subtask.', type: 'error' });
    }
  };

  if (loading) return <div className="loading-container">Loading subtask manager...</div>;

  return (
    <div className="subtask-manager-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={() => navigate(`/project/${projectId}`)}
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Subtask Orchestrator</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Project: {project?.projectName}</p>
        </div>
      </div>

      {message.text && (
        <div style={{ 
          padding: '15px 20px', 
          borderRadius: '12px', 
          marginBottom: '25px', 
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
        
        {/* Assignment Form */}
        <div style={{ background: 'var(--panel-bg)', borderRadius: '24px', padding: '30px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', position: 'sticky', top: '20px', height: 'fit-content' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <Plus size={22} style={{ color: 'var(--primary)' }} /> Assign New Subtask
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Milestone</label>
              <select 
                className="hub-input" 
                value={formData.taskId} 
                onChange={e => setFormData({...formData, taskId: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
              >
                <option value="">-- Select Milestone --</option>
                {tasks.map(t => <option key={t._id} value={t._id}>{t.title} ({t.status})</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assign To Member</label>
              <select 
                className="hub-input" 
                value={formData.userId} 
                onChange={e => setFormData({...formData, userId: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
              >
                <option value="">-- Select Member --</option>
                {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subtask Title</label>
              <input 
                type="text" 
                className="hub-input" 
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Instructions</label>
              <textarea 
                className="hub-input" 
                placeholder="Provide details..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Due Date</label>
                <input 
                  type="date" 
                  className="hub-input"
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority</label>
                <select 
                  className="hub-input"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="hub-submit-btn"
              style={{ padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', transition: 'all 0.2s' }}
            >
              <ClipboardList size={20} /> Assign Subtask
            </button>
          </form>
        </div>

        {/* Subtasks List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Active Subtasks</h2>
            <div style={{ padding: '4px 12px', background: 'rgba(90, 50, 234, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
              {subTasks.length} TOTAL
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {subTasks.length > 0 ? (
              subTasks.map(st => (
                <div key={st._id} style={{ background: 'var(--panel-bg)', borderRadius: '20px', padding: '20px', border: '1px solid var(--border-color)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {st.status}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          MILESTONE: {st.taskId?.title}
                        </span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{st.title}</h3>
                    </div>
                    <button 
                      onClick={() => handleDelete(st._id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{st.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{st.userId?.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b' }}>
                        <Clock size={14} /> {st.dueDate ? new Date(st.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: st.priority === 'high' ? '#ef4444' : st.priority === 'medium' ? '#f59e0b' : '#10b981', textTransform: 'uppercase' }}>
                        {st.priority}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--panel-bg)', borderRadius: '24px', border: '2px dashed var(--border-color)' }}>
                <ClipboardList size={40} style={{ color: 'var(--text-muted)', marginBottom: '15px', opacity: 0.3 }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No subtasks created for this project yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubTaskAssignment;
