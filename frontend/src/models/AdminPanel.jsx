import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function AdminPanel() {
  const [projects, setProjects] = useState([]);
  const [emailToPromote, setEmailToPromote] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects/my-projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load projects.");
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/access_providing', 
        { email: emailToPromote },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setMessage(res.data.message);
      setEmailToPromote('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="glass-panel">
      <h2>Admin Panel</h2>
      
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>Grant Admin Access</h3>
        {message && <p style={{ color: 'blue' }}>{message}</p>}
        <form onSubmit={handleGrantAccess}>
          <input 
            type="email" 
            placeholder="User Email" 
            value={emailToPromote} 
            onChange={(e) => setEmailToPromote(e.target.value)} 
            required
          />
          <button type="submit" style={{ marginLeft: '10px' }}>Promote to Admin</button>
        </form>
      </div>

      <div style={{ padding: '15px', border: '1px solid #ccc' }}>
        <h3>My Projects</h3>
        {projects.length === 0 ? (
          <p>No projects created yet.</p>
        ) : (
          <ul>
            {projects.map(project => (
              <li key={project._id} style={{ margin: '10px 0' }}>
                <strong>{project.projectName}</strong>
                <button 
                  style={{ marginLeft: '10px' }} 
                  onClick={() => navigate(`/project/${project._id}`)}
                >
                  Manage Project
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button style={{ marginTop: '20px' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
}

export default AdminPanel;
