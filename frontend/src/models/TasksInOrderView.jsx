import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ListTodo, Clock, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TasksInOrderView = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get('/tasks/my-tasks');
      const sortedTasks = sortTasks(res.data);
      setTasks(sortedTasks);
    } catch (err) {
      console.error("Error fetching tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const sortTasks = (taskList) => {
    const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    return [...taskList].sort((a, b) => {
      // Primary: Due Date (Earliest First)
      if (new Date(a.dueDate) < new Date(b.dueDate)) return -1;
      if (new Date(a.dueDate) > new Date(b.dueDate)) return 1;
      
      // Secondary: Priority (High > Medium > Low)
      return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Tasks...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '12px', background: '#3b82f615', color: '#3b82f6', borderRadius: '12px' }}>
          <ListTodo size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Tasks in Order</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Sorted by deadline and priority</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {tasks.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No pending tasks found for you.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task._id}
              onClick={() => navigate(`/project/${task.project._id}`)}
              style={{ 
                background: 'white', 
                borderRadius: '20px', 
                padding: '20px 25px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.01)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,10,30,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ padding: '10px', borderRadius: '50%', background: '#f8fafc', color: task.status === 'Completed' ? '#10b981' : '#64748b' }}>
                <CheckCircle2 size={24} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{task.title}</h3>
                   <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{task.project?.projectName}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
              </div>

              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '4px 10px', 
                  background: `${getPriorityColor(task.priority)}15`, 
                  color: getPriorityColor(task.priority), 
                  borderRadius: '6px', 
                  fontSize: '0.7rem', 
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  {task.priority} Priority
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#64748b', fontSize: '0.8rem' }}>
                  <Clock size={14} />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksInOrderView;
