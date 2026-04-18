import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Search, Briefcase, User, Calendar, ChevronRight, Clock, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * ProjectSchedule Component
 * Displays all system projects in a detailed grid for administrators.
 */
const ProjectSchedule = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      setProjects(response.data || []);
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(proj =>
    proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (proj.manager?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#64748b' }}>Synchronizing Project Nodes...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header Section */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>Project Schedule</h1>
        <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, marginTop: '8px' }}>Comprehensive timeline and status overview of all enterprise nodes.</p>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by project name or manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 48px',
              borderRadius: '16px',
              border: '1px solid #f1f5f9',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#1e293b',
              outline: 'none',
              background: '#f8fafc',
              transition: '0.2s'
            }}
          />
        </div>
        <div style={{
          background: '#1a237e',
          color: 'white',
          padding: '14px 24px',
          borderRadius: '16px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          marginLeft: '50px'
        }}>
          <Briefcase size={18} color="white" />
          {filteredProjects.length} Active Nodes
        </div>
      </div>

      {/* Project Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {filteredProjects.map((project) => (
          <ProjectCard key={project._id} project={project} onClick={() => navigate(`/project/${project._id}`)} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: '32px',
          border: '2px dashed #f1f5f9'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 700 }}>No projects matching your search query.</p>
        </div>
      )}
    </div>
  );
};

/**
 * ProjectCard Sub-component
 */
const ProjectCard = ({ project, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'Overdue': return '#ef4444';
      case 'Pending': return '#8b5cf6';
      default: return '#f59e0b'; // Active / In Progress
    }
  };

  const accentColor = getStatusColor(project.status);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid #f1f5f9',
        transition: '0.3s',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{
          padding: '6px 12px',
          background: accentColor,
          color: 'white',
          borderRadius: '8px',
          fontSize: '0.65rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {project.status || 'Active'}
        </div>
        <ChevronRight size={18} color="#cbd5e1" />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', minHeight: '3rem' }}>{project.projectName}</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ 
            width: '32px', height: '32px', borderRadius: '10px', 
            background: project.manager?.name ? ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][project.manager.name.length % 5] : '#f8fafc', 
            border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', color: project.manager?.name ? 'white' : '#1a237e', fontWeight: 800, fontSize: '0.8rem' 
        }}>
          {project.manager?.name ? project.manager.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>Project Lead</p>
          <p style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, margin: 0 }}>{project.manager?.name || 'Unassigned'}</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>EXECUTION PROGRESS</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>{project.progress || 0}%</span>
        </div>
        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '100%', width: `${project.progress || 0}%`, background: `linear-gradient(90deg, ${accentColor}, #dbeafe)`, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
          <Clock size={14} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Due {new Date(project.endDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectSchedule;
