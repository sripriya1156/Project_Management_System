import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ShieldCheck, Users, BarChart3, ArrowRight, CheckCircle2, Star, Globe, Zap, Eye, CheckCircle } from 'lucide-react';
import "../App.css";

function Landing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="auth-container" style={{ background: '#ffffff', overflowX: 'hidden' }}>
      {/* Navbar */}
      <header className="auth-header" style={{ padding: '20px 50px', background: 'rgba(248, 243, 243, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="auth-header-title" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e3a8a' }}>
          Spritflow
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <button className="auth-link" onClick={() => navigate('/login')} style={{ fontWeight: '600', fontSize: '0.9rem' }}>Log In</button>
          <button
            className="hub-btn primary"
            onClick={() => navigate('/signup')}
            style={{ padding: '10px 24px', borderRadius: '8px', background: '#1e3a8a', fontSize: '0.9rem', width: 'auto', height: 'auto' }}
          >
            {isLoggedIn ? 'Sign In' : 'Get Started'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 50px', display: 'flex', alignItems: 'center', gap: '50px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ flex: 1 }}>
          <div style={{ background: '#aac3f7ff', color: '#166534', padding: '6px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
            <Zap size={14} /> ACCELERATE IN SPRITFLOW
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '900', color: '#1e3a8a', lineHeight: '1', marginBottom: '30px', letterSpacing: '-2px' }}>
            Drive Your Projects to Success
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#64748b', marginBottom: '40px', lineHeight: '1.6', maxWidth: '540px' }}>
            Spritflow provides the fluidity teams need to move from chaos to clarity. Manage tasks, people, and deadlines in one kinetic stream.
          </p>
          <button
            className="hub-btn primary"
            onClick={() => navigate('/signup')}
            style={{ padding: '18px 36px', fontSize: '1.1rem', borderRadius: '12px', background: '#1e3a8a', width: 'auto' }}
          >
            {isLoggedIn ? 'Sign In' : 'Get Started'}
          </button>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <img
            src="/logo.jpg"
            alt="Spritflow Dashboard Illustration"
            style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 50px', textAlign: 'center', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '15px' }}>Precision-Engineered Features</h2>
        <p style={{ color: '#64748b', marginBottom: '60px', fontSize: '1.1rem' }}>Every tool in Spritflow is built to remove friction and enhance your team's natural velocity.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#ffffff', padding: '40px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#e0e7ff', color: '#4338ca', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '15px' }}>Role-Based Access</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>Secure your workflow with granular permissions. Give the right people access to exactly what they need, no more, no less.</p>
          </div>

          <div style={{ background: '#ffffff', padding: '40px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#d1fae5', color: '#059669', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '15px' }}>Team Collaboration</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>Contextual chat and file sharing baked directly into tasks. Eliminate the noise and keep conversations focused on outcomes.</p>
          </div>

          <div style={{ background: '#ffffff', padding: '40px', borderRadius: '20px', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#ccfbf1', color: '#0d9488', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
              <BarChart3 size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '15px' }}>Real-time Tracking</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>Live updates across all boards. See progress as it happens with kinetic charts that reflect the actual heartbeat of your project.</p>
          </div>
        </div>
      </section>

      {/* Designed for Human Flow */}
      <section style={{ padding: '100px 50px', display: 'flex', alignItems: 'center', gap: '80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ flex: 1 }}>
          <img
            src="/human_flow.png"
            alt="Futuristic Dashboard Interface"
            style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '25px' }}>Designed for Human Flow</h2>
          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.7', marginBottom: '30px' }}>
            Spritflow is built on the principle that software should adapt to people, not the other way around. Our interface uses spatial cues and tonal shifts to guide your eye effortlessly to what matters most.
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              "Reduced cognitive load with intentional white space.",
              "Asymmetrical layouts that mirror natural thinking patterns.",
              "Kinetic motion that provides instant tactile feedback."
            ].map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', color: '#334155', fontWeight: '600' }}>
                <CheckCircle2 color="#10b981" size={22} /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Efficiency Section */}
      <section style={{ background: '#1e3a8a', padding: '120px 50px', color: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '80px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '20px' }}>SPRITFLOW METRICS</div>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '30px', lineHeight: '1.1' }}>Efficiency Meets Transparency</h2>
            <p style={{ color: '#93c5fd', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' }}>
              We don't just optimize workflows; we visualize momentum. Our data reflects the real heartbeat of 50,000+ teams moving in sync.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ height: '2px', width: '40px', background: '#93c5fd' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#93c5fd', letterSpacing: '1px' }}>LIVE ECOSYSTEM PULSE</span>
            </div>
          </div>

          <div style={{ flex: 1.5, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { label: 'FASTER DELIVERY', value: '35%', icon: <Zap size={20} /> },
              { label: 'VISIBILITY', value: 'Full', icon: <Eye size={20} /> },
              { label: 'TASKS DONE', value: '1.2M', icon: <CheckCircle size={20} /> },
              { label: 'APP RATING', value: '4.9/5', icon: <Star size={20} /> },
              { label: 'SATISFACTION', value: '99%', icon: <Users size={20} /> },
              { label: 'GLOBAL TEAMS', value: '50k+', icon: <Globe size={20} /> },
            ].map((stat, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '30px 20px', textAlign: 'left' }}>
                <div style={{ color: '#93c5fd', marginBottom: '15px' }}>{stat.icon}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '5px' }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#93c5fd', letterSpacing: '1px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready Section */}
      <section style={{ padding: '120px 50px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '32px', padding: '80px 40px', boxShadow: '0 40px 100px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '20px' }}>Ready to find your flow?</h2>
          <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '45px', maxWidth: '500px', margin: '0 auto 45px' }}>
            Join 50,000+ teams who have replaced chaos with Spritflow's kinetic workspace.
          </p>
          <button
            className="hub-btn primary"
            onClick={() => navigate('/login')}
            style={{ margin: '0 auto 25px', padding: '20px 48px', fontSize: '1.1rem', borderRadius: '12px', background: '#1e3a8a', width: 'auto', display: 'block' }}
          >
            {isLoggedIn ? 'Sign In' : 'Get Started'}
          </button>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px' }}>
            NO CREDIT CARD REQUIRED • 14-DAY FREE TRIAL
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 50px 40px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e3a8a', marginBottom: '20px' }}>Spritflow</div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>© 2024 SPRITFLOW INC. ALL RIGHTS RESERVED.</p>
          </div>
          <div style={{ display: 'flex', gap: '60px' }}>
            <div>
              <h4 style={{ color: '#1e3a8a', fontWeight: '700', marginBottom: '20px' }}>PRODUCT</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Features</li>
                <li>Integrations</li>
                <li>Pricing</li>
                <li>Updates</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#1e3a8a', fontWeight: '700', marginBottom: '20px' }}>COMPANY</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>News</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#1e3a8a', fontWeight: '700', marginBottom: '20px' }}>RESOURCES</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Community</li>
                <li>Support</li>
                <li>Help Center</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: '700' }}>
          <div style={{ display: 'flex', gap: '30px' }}>
            <span>PRIVACY POLICY</span>
            <span>TERMS OF SERVICE</span>
          </div>
          <div style={{ display: 'flex', gap: '30px' }}>
            <span>TWITTER</span>
            <span>LINKEDIN</span>
            <span>GITHUB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
