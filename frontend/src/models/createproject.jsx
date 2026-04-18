import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  FileText, User, Calendar, Plus, Rocket, ChevronDown, CheckCircle, ArrowRight
} from "lucide-react";

const CreateProject = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState({
    projectName: "",
    description: "",
    endDate: "",
    projectManagerId: ""
  });

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users/workload');
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project.projectName || !project.endDate || !project.projectManagerId) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        projectName: project.projectName,
        description: project.description,
        endDate: project.endDate,
        managerId: project.projectManagerId
      };

      await API.post("/projects/create", payload);

      alert("Project initialized successfully!");
      navigate('/dashboard');
    } catch (err) {
      console.error("Project creation error", err);
      alert("Failed to initiate project. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Page Header Area - Scaled Down Fonts */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Project Creation Node</p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1a237e', margin: 0, letterSpacing: '-1.2px' }}>Initiate New Project</h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '12px', fontWeight: 500, maxWidth: '600px', lineHeight: 1.5 }}>
          Configure project parameters, define scope, and mobilize your lead executive for high-impact execution.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Section 1: Project Details */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '48px', boxShadow: '0 8px 30px rgba(26, 35, 126, 0.02)', border: '1px solid rgba(26, 35, 126, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', background: '#f4f7fe', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#1a237e' }}>
              <FileText size={20} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1a237e', margin: 0 }}>1. PROJECT DETAILS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>Project Name</label>
              <input
                required
                name="projectName"
                placeholder="e.g. Q4 Global Expansion Node"
                value={project.projectName}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600, color: '#1a237e' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>Target End Date</label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  name="endDate"
                  type="date"
                  value={project.endDate}
                  onChange={handleInputChange}
                  style={{ width: '90%', padding: '16px 20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600, color: '#1a237e', cursor: 'pointer', marginLeft: '20px' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>Description & Objectives</label>
            <textarea
              required
              name="description"
              placeholder="Detail the strategic objectives and key performance indicators..."
              value={project.description}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600, color: '#1a237e', minHeight: '140px', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Section 2: Project Management */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '48px', boxShadow: '0 8px 30px rgba(26, 35, 126, 0.02)', border: '1px solid rgba(26, 35, 126, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', background: '#f4f7fe', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#1a237e' }}>
              <User size={20} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1a237e', margin: 0 }}>2. PROJECT MANAGEMENT</h2>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>Assign Project Lead</label>
            <div style={{ position: 'relative' }}>
              <select
                required
                name="projectManagerId"
                value={project.projectManagerId}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600, color: '#1a237e', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Select a Lead Executive...</option>
                {users.filter(u => u.role !== 'Admin').map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} | {user.activeProjects?.length || 0} Projects Managing
                  </option>
                ))}
                {users.length > 0 && users.filter(u => u.role !== 'Admin').length === 0 && (
                  <option disabled>No eligible team members found</option>
                )}
                {users.length === 0 && (
                  <option disabled>No other users found in system</option>
                )}
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Area */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '80px' }}>
          <button
            type="submit"
            style={{
              background: '#10b981',
              color: 'white',
              padding: '18px 48px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
              transition: '0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.25)';
            }}
          >
            Create Project <Rocket size={20} />
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateProject;