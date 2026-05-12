import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, ShieldCheck, XCircle, ListTodo,
  Settings, HelpCircle, LogOut, Plus, Search, Bell, Sun, Moon,
  MessageSquare, User, CheckCircle, Calendar, PlusCircle, Users
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("role") || "Employee";

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [location.pathname]);

  const fetchCounts = async () => {
    try {
      const [pmRes, taskRes, unreadRes] = await Promise.all([
        API.get('/projects/my-pending-managed-projects'),
        API.get('/tasks/pending'),
        API.get('/notifications/unread-count')
      ]);
      setPendingCount((pmRes.data?.length || 0) + (taskRes.data?.length || 0));
      setUnreadNotifCount(unreadRes.data?.count || 0);
    } catch (err) {
      console.error("Error fetching counts", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate('/login');
  };

  const commonItems = [
    { name: 'Inbox', path: '/inbox', icon: Bell, badge: (pendingCount + unreadNotifCount) }
  ];

  const navItems = userRole === 'Admin' ? [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Project', path: '/create-project', icon: PlusCircle }, 
    ...commonItems,
    { name: 'User Management', path: '/user-management', icon: Users },
    { name: 'Active Projects', path: '/active-projects', icon: Briefcase }, 
    { name: 'Completed Projects', path: '/completed-projects', icon: CheckCircle },
    { name: 'Project Schedule', path: '/project-schedule', icon: Calendar },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ...commonItems,
    { name: 'Active Projects', path: '/active-projects', icon: Briefcase }, 
    { name: 'Managed Projects', path: '/managed-projects', icon: ShieldCheck },
    { name: 'Completed Projects', path: '/completed-projects', icon: CheckCircle },
    { name: 'Rejected Projects', path: '/rejected-projects', icon: XCircle },
    { name: 'Tasks in Order', path: '/tasks-in-order', icon: ListTodo },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', color: '#1a237e' }}>
      
      {/* Sidebar - Reduced Width Vibrant Indigo Theme */}
      <aside className="responsive-sidebar" style={{ 
        width: '280px', 
        backgroundColor: '#121e78', 
        color: '#fff',
        display: 'flex', 
        flexDirection: 'column', 
        padding: '0', 
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: '10px 0 50px rgba(0,0,0,0.1)'
      }}>
        
        {/* Branding - Reduced Spacing */}
        <div style={{ padding: '40px 32px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
             <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: 0 }}>P</p>
          </div>
          <div>
             <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>ProjectFlow</h2>
             <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', margin: '1px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ENTERPRISE SUITE</p>
          </div>
        </div>

        {/* Navigation - Tighter Fit */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name} style={{ position: 'relative' }}>
                  {isActive && (
                    <div style={{ 
                      position: 'absolute', left: '-12px', top: '8px', bottom: '8px', 
                      width: '5px', backgroundColor: 'white', borderRadius: '0 8px 8px 0',
                      boxShadow: '0 0 10px white'
                    }} />
                  )}
                  <button 
                    onClick={() => navigate(item.path)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      width: '100%', 
                      padding: '12px 20px', 
                      borderRadius: '12px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                      fontWeight: isActive ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                      fontSize: '0.9rem'
                    }}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ opacity: isActive ? 1 : 0.7 }} />
                    <span style={{ flex: 1 }}>{item.name}</span>
                    {item.badge > 0 && (
                      <span style={{ 
                        background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 900,
                        padding: '2px 8px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Area - Logout Button and Settings */}
        <div style={{ padding: '0 16px 40px 16px' }}>
           <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                 onClick={() => navigate('/settings')}
                 style={{ 
                   display: 'flex', alignItems: 'center', gap: '12px', width: '100%', 
                   padding: '12px 20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 500,
                   cursor: 'pointer'
                 }}>
                 <Settings size={18} /> Settings
              </button>
              <button 
                 onClick={handleLogout}
                 style={{ 
                   display: 'flex', alignItems: 'center', gap: '12px', width: '100%', 
                   padding: '12px 20px', color: '#fb7185', fontSize: '0.9rem', fontWeight: 800,
                   cursor: 'pointer', background: 'rgba(251, 113, 133, 0.05)', borderRadius: '12px'
                 }}>
                 <LogOut size={18} strokeWidth={3} /> Sign Out
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="responsive-main-content" style={{ flex: 1, marginLeft: '280px' }}>
        
        {/* Top Header */}
        <header className="responsive-header" style={{ 
          height: '80px', 
          background: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 40px',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky',
          top: 0,
          zIndex: 900
        }}>
          <div className="responsive-hide">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0a1629', margin: 0 }}>
               {location.pathname === '/dashboard' ? 'Node Overview' : 
                navItems.find(i => i.path === location.pathname)?.name || 'Project System'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div 
                  onClick={() => navigate('/inbox')}
                  style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Bell size={20} color="#94a3b8" />
                  {unreadNotifCount > 0 && (
                    <div style={{ 
                      position: 'absolute', top: '-5px', right: '-5px', width: '8px', height: '8px', 
                      background: '#ef4444', borderRadius: '50%', border: '2px solid white' 
                    }} />
                  )}
                </div>
                <Settings size={20} color="#94a3b8" />
                <button 
                   onClick={toggleTheme}
                   style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
                   {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #f1f5f9', paddingLeft: '24px' }}>
                 <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0a1629', margin: 0 }}>{userName}</p>
                   <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, fontWeight: 700 }}>Management</p>
                 </div>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3b82f6', fontWeight: 800, fontSize: '1rem' }}>
                    {userName.charAt(0)}
                 </div>
              </div>
          </div>
        </header>

        <main className="responsive-padding-small" style={{ padding: '40px', background: '#f4f7fe', minHeight: 'calc(100vh - 80px)' }}>
          <Outlet />
        </main>
        
        {/* Mobile Bottom Nav */}
        <div className="hub-bottom-nav responsive-show" style={{ display: 'none' }}>
          {navItems.slice(0, 5).map(item => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.name} 
                className={`hub-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Layout;
