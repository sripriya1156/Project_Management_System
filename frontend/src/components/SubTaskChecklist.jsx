import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { CheckCircle2, Circle, Clock, MessageSquare, Trash2, Plus } from 'lucide-react';
import CircularProgressBar from './CircularProgressBar';

const SubTaskChecklist = ({ taskId, isManager, onUpdate }) => {
  const [subTasks, setSubTasks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newSubTask, setNewSubTask] = useState({ title: '', description: '', priority: 'medium' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSubTasks();
  }, [taskId]);

  const fetchSubTasks = async () => {
    try {
      const res = await API.get(`/subtasks/task/${taskId}`);
      setSubTasks(res.data.subTasks);
      setProgress(res.data.progress);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching subtasks", err);
    }
  };

  const handleStatusChange = async (subTaskId, currentStatus, newStatus) => {
    const allowed = {
      'pending': ['in_progress'],
      'in_progress': ['done', 'pending'],
      'done': ['in_progress']
    };

    if (newStatus !== currentStatus && !allowed[currentStatus]?.includes(newStatus)) {
      if (currentStatus === 'pending' && newStatus === 'done') {
        alert("Only In-Progress tasks can be marked as Done.");
      }
      return;
    }

    const previousSubTasks = [...subTasks];
    const previousProgress = progress;

    // Optimistic Update
    const updatedSubTasks = subTasks.map(st => st._id === subTaskId ? { ...st, status: newStatus } : st);
    setSubTasks(updatedSubTasks);
    
    const doneCount = updatedSubTasks.filter(st => st.status === 'done').length;
    setProgress(updatedSubTasks.length > 0 ? Math.round((doneCount / updatedSubTasks.length) * 100) : 0);

    try {
      await API.patch(`/subtasks/${subTaskId}/status`, { status: newStatus });
      if (onUpdate) onUpdate();
    } catch (err) {
      setSubTasks(previousSubTasks);
      setProgress(previousProgress);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleAddSubTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/subtasks', { ...newSubTask, taskId });
      setNewSubTask({ title: '', description: '', priority: 'medium' });
      setShowForm(false);
      fetchSubTasks();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add subtask");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subtask?")) return;
    try {
      await API.delete(`/subtasks/${id}`);
      fetchSubTasks();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading task flow...</div>;

  return (
    <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>Subtasks Overview</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CircularProgressBar progress={progress} size={36} strokeWidth={4} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>{progress}%</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {subTasks.map((st) => (
          <div key={st._id} style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px', 
            padding: '12px', 
            borderRadius: '12px', 
            background: st.status === 'done' ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-color)',
            border: st.status === 'done' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 900, 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    background: st.status === 'done' ? '#10b981' : st.status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                    color: '#fff',
                    textTransform: 'uppercase'
                  }}>
                    {st.status.replace('_', ' ')}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', textDecoration: st.status === 'done' ? 'line-through' : 'none' }}>
                    {st.title}
                  </span>
                </div>
                {st.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>{st.description}</p>}
              </div>

              {isManager && (
                <button 
                  onClick={() => handleDelete(st._id)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer', padding: '5px' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => handleStatusChange(st._id, st.status, 'pending')}
                  disabled={st.status === 'pending'}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: st.status === 'pending' ? '#f59e0b' : '#f1f5f9', color: st.status === 'pending' ? 'white' : '#64748b', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Wait
                </button>
                <button 
                  onClick={() => handleStatusChange(st._id, st.status, 'in_progress')}
                  disabled={st.status === 'in_progress'}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: st.status === 'in_progress' ? '#3b82f6' : '#f1f5f9', color: st.status === 'in_progress' ? 'white' : '#64748b', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Work
                </button>
                <button 
                  onClick={() => handleStatusChange(st._id, st.status, 'done')}
                  disabled={st.status === 'done'}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: st.status === 'done' ? '#10b981' : '#f1f5f9', color: st.status === 'done' ? 'white' : '#64748b', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {st.userId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <Circle size={8} fill={st.status === 'done' ? '#10b981' : '#f59e0b'} stroke="none" /> {st.userId.name.split(' ')[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isManager && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '2px dashed var(--border-color)', color: 'var(--text-muted)', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
          >
            <Plus size={18} /> Add To-Do Point
          </button>
        )}

        {showForm && (
          <form onSubmit={handleAddSubTask} style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <input 
              placeholder="Subtask Title" 
              required 
              value={newSubTask.title} 
              onChange={e => setNewSubTask({ ...newSubTask, title: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', marginBottom: '10px' }}
            />
            <textarea 
              placeholder="Description (Optional)" 
              value={newSubTask.description} 
              onChange={e => setNewSubTask({ ...newSubTask, description: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', marginBottom: '10px', minHeight: '80px' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>PRIORITY</label>
                <select 
                  value={newSubTask.priority} 
                  onChange={e => setNewSubTask({ ...newSubTask, priority: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>DUE DATE</label>
                <input 
                  type="date" 
                  required
                  value={newSubTask.dueDate || ''} 
                  onChange={e => setNewSubTask({ ...newSubTask, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Create Subtask</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '10px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubTaskChecklist;
