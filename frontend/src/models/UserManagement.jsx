import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Search, Mail, Shield, Briefcase, Calendar, Users, ChevronRight } from "lucide-react";

/**
 * UserManagement Component
 * Displays system users with search and filtering capabilities.
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users?limit=100');
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.specialization || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#64748b' }}>Accessing User Nodes...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header Section */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>User Management</h1>
        <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, marginTop: '8px' }}>Manage and monitor all active directory participants.</p>
      </div>

      {/* Global Filter Bar */}
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
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', right: '9px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, email, or specialized skill..."
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
          background: '#121e78',
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
          <Users size={18} color="white" />
          {filteredUsers.length} Users Found
        </div>
      </div>

      {/* User Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {filteredUsers.map((user, index) => (
          <UserCard key={user._id} user={user} index={index} />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: '32px',
          border: '2px dashed #f1f5f9'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 700 }}>No users match your query node.</p>
        </div>
      )}
    </div>
  );
};

/**
 * UserCard Sub-component
 */
const UserCard = ({ user, index }) => {
  const avatarColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const accent = avatarColors[index % avatarColors.length];

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      border: '1px solid #f1f5f9',
      transition: '0.3s',
      position: 'relative',
      overflow: 'hidden'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = accent + '30';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#f1f5f9';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          background: accent,
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 900,
          boxShadow: `0 8px 20px ${accent}30`
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{
          background: user.role === 'Admin' ? '#f59e0b' : '#3b82f6',
          color: 'white',
          fontSize: '0.6rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '6px'
        }}>
          {user.role}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{user.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <Mail size={12} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user.email}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Core Specialization</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user.specialization?.length > 0 ? user.specialization.map(skill => (
              <span key={skill} style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '5px 12px',
                background: '#f8fafc',
                color: '#475569',
                borderRadius: '8px',
                border: '1px solid #f1f5f9'
              }}>
                {skill}
              </span>
            )) : <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>General Resource</span>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="#94a3b8" />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>
              Member since {new Date(user.dateJoined || Date.now()).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </span>
          </div>
          <ChevronRight size={18} color="#cbd5e1" />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
