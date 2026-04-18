import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Briefcase, ShieldCheck, XCircle, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectListView = ({ type }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem('userId');
  const [reassignModal, setReassignModal] = useState({ show: false, project: null, newManagerId: '' });
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, [type]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const endpoints = {
        active: '/projects/my-projects',
        managed: '/projects/my-managed-projects',
        rejected: '/projects/my-rejected-projects',
        completed: '/projects/my-projects'
      };
      
      const res = await API.get(endpoints[type]);
      
      let filtered = res.data;
      if (type === 'completed') {
        filtered = res.data.filter(p => p.status === 'Completed');
      } else if (type === 'active') {
        filtered = res.data.filter(p => p.status !== 'Completed');
      }

      setProjects(filtered);
    } catch (err) {
      console.error(`Error fetching ${type} projects`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReassign = async (project) => {
    setReassignModal({ show: true, project, newManagerId: '' });
    try {
      const res = await API.get('/users/workload');
      setAllUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleReassignManager = async () => {
    try {
      await API.put(`/projects/${reassignModal.project._id}/reassign-manager`, { newManagerId: reassignModal.newManagerId });
      setReassignModal({ show: false, project: null, newManagerId: '' });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error reassigning manager');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'Overdue': return '#ef4444';
      case 'Pending': return '#8b5cf6';
      case 'Active':
      case 'In Progress': 
      case 'Accepted': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  const titleMap = {
    active: { title: 'Active Projects', icon: Briefcase, color: '#f59e0b' },
    managed: { title: 'Managed Projects', icon: ShieldCheck, color: '#8b5cf6' },
    completed: { title: 'Completed Projects', icon: CheckCircle, color: '#10b981' },
    rejected: { title: 'Rejected Projects', icon: XCircle, color: '#ef4444' }
  };

  const { title, icon: Icon, color } = titleMap[type] || titleMap.active;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading {title}...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '12px', background: `${color}15`, color: color, borderRadius: '12px' }}>
          <Icon size={24} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h2>
      </div>

      {projects.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No projects found in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {projects.map(project => {
            const isRejected = type === 'rejected';
            return (
              <div 
                key={project._id} 
                onClick={!isRejected ? () => navigate(`/project/${project._id}`) : undefined}
                style={{ 
                  background: 'white', 
                  borderRadius: '24px', 
                  padding: '25px', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                  cursor: !isRejected ? 'pointer' : 'default',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid #f1f5f9'
                }}
                onMouseEnter={!isRejected ? (e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                } : undefined}
                onMouseLeave={!isRejected ? (e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                } : undefined}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                  background: `${getStatusColor(project.status)}15`, 
                  color: getStatusColor(project.status),
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {project.status}
                </span>
                <ChevronRight size={20} color="#94a3b8" />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>{project.projectName}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {project.description}
              </p>

              {isRejected && !project.isTaskRejection && (String(project.createdBy) === currentUserId || localStorage.getItem('role') === 'Admin') && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenReassign(project); }}
                  style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', marginBottom: '20px', transition: '0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                >
                  ↺ Reassign Manager
                </button>
              )}

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex' }}>
                    {project.members?.slice(0, 4).map((member, idx) => (
                      <div 
                        key={member._id} 
                        title={member.name}
                        style={{ 
                          width: '28px', height: '28px', borderRadius: '50%', 
                          background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5], 
                          color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center',
                          fontSize: '0.65rem', fontWeight: 800, border: '2px solid white', 
                          marginLeft: idx > 0 ? '-10px' : 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {member.initials}
                      </div>
                    ))}
                    {(project.members?.length || 0) > 4 && (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', fontWeight: 800, border: '2px solid white', marginLeft: '-10px' }}>
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{project.progress || 0}% Done</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${project.progress || 0}%`, background: getStatusColor(project.status), borderRadius: '4px' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', color: '#64748b', fontSize: '0.8rem' }}>
                <Clock size={14} />
                <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* REASSIGN MANAGER MODAL */}
      {reassignModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem' }}>↺</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Reassign Manager</h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '28px', fontWeight: 600 }}>
              The role for <strong style={{ color: '#ef4444' }}>"{reassignModal.project?.projectName}"</strong> was rejected. Select a new manager:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select
                value={reassignModal.newManagerId}
                onChange={e => setReassignModal(prev => ({ ...prev, newManagerId: e.target.value }))}
                style={{ padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: 600, fontSize: '0.9rem', width: '100%' }}
              >
                <option value="">Select new manager...</option>
                {allUsers
                  .filter(u => !(reassignModal.project?.rejectedManagers || []).includes(u._id) && u.role !== 'Admin')
                  .map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))
                }
              </select>

              <button
                onClick={handleReassignManager}
                disabled={!reassignModal.newManagerId}
                style={{
                  padding: '16px', borderRadius: '16px', border: 'none',
                  background: reassignModal.newManagerId ? '#ef4444' : '#f1f5f9',
                  color: reassignModal.newManagerId ? 'white' : '#94a3b8',
                  fontWeight: 800, cursor: reassignModal.newManagerId ? 'pointer' : 'default',
                  fontSize: '0.95rem', transition: '0.2s'
                }}
              >
                Confirm Reassignment
              </button>

              <button
                onClick={() => setReassignModal({ show: false, project: null, newManagerId: '' })}
                style={{ padding: '14px', borderRadius: '16px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectListView;
