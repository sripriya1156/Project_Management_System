import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import "../App.css";

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmpassword: '',
        specialization: [],
    });

    const specializations = [
        'Frontend Development',
        'Backend Development',
        'UI/UX Design',
        'Project Management',
        'Quality Assurance',
        'Data Analysis',
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            const updated = checked
                ? [...form.specialization, value]
                : form.specialization.filter((s) => s !== value);
            setForm({ ...form, specialization: updated });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmpassword) {
            alert("Passwords don't match");
            return;
        }
        try {
            const res = await API.post('/sign', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role || 'Member');
            localStorage.setItem('userId', res.data.user._id);
            localStorage.setItem('userName', res.data.user.name);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Sign up failed');
        }
    };

    return (
        <div className="auth-container" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '20px 50px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e3a8a', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    Spritflow
                </div>
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#1e3a8a', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <ArrowLeft size={18} /> Back to Login
                </button>
            </header>

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ maxWidth: '1200px', width: '100%', background: '#fff', borderRadius: '40px', display: 'flex', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.08)' }}>
                    
                    <div style={{ 
                        flex: 0.8, 
                        background: 'linear-gradient(rgba(30, 58, 138, 0.9), rgba(30, 58, 138, 0.95)), url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop") center/cover', 
                        padding: '60px', 
                        color: '#fff', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between' 
                    }}>
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-1.5px' }}>
                                Join the elite stream of <span style={{ color: '#10b981' }}>excellence</span>.
                            </h1>
                            <p style={{ fontSize: '1.1rem', color: '#93c5fd', lineHeight: '1.6' }}>
                                Create your account and begin your journey toward synchronized project success.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                "Role-based visibility controls",
                                "Kinetic task synchronization",
                                "Real-time team analytics"
                            ].map((feature, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <CheckCircle2 color="#10b981" size={20} />
                                    <span style={{ fontWeight: '600' }}>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1.2, padding: '60px 80px', height: 'auto', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '10px' }}>Create Account</h2>
                        <p style={{ color: '#64748b', marginBottom: '40px' }}>Join 50,000+ professionals today.</p>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '8px', letterSpacing: '1px' }}>FULL NAME</label>
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                    <input name="name" placeholder="John Doe" onChange={handleChange} required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '8px', letterSpacing: '1px' }}>EMAIL ADDRESS</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                    <input name="email" type="email" placeholder="***@spritflow.com" onChange={handleChange} required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '8px', letterSpacing: '1px' }}>PASSWORD</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                    <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '8px', letterSpacing: '1px' }}>CONFIRM</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                    <input name="confirmpassword" type="password" placeholder="••••••••" onChange={handleChange} required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '15px', letterSpacing: '1px' }}>SPECIALIZATIONS</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {specializations.map((spec) => (
                                        <label key={spec} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', cursor: 'pointer', color: '#475569' }}>
                                            <input type="checkbox" value={spec} checked={form.specialization.includes(spec)} onChange={handleChange} style={{ accentColor: '#1e3a8a' }} />
                                            {spec}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" style={{ gridColumn: 'span 2', background: '#1e3a8a', color: '#fff', padding: '18px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: '700', marginTop: '10px', cursor: 'pointer' }}>
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <footer style={{ padding: '30px 50px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>
                <div style={{ color: '#1e3a8a', fontSize: '1.1rem', fontWeight: '900' }}>SPRITFLOW</div>
                <div style={{ display: 'flex', gap: '25px', letterSpacing: '1px' }}>
                    <span style={{ cursor: 'pointer' }}>PRIVACY POLICY</span>
                    <span style={{ cursor: 'pointer' }}>TERMS OF SERVICE</span>
                    <span style={{ cursor: 'pointer' }}>HELP CENTER</span>
                </div>
                <div>© 2024 SPRITFLOW. KINETIC STREAM DESIGN.</div>
            </footer>
        </div>
    );
}

export default Signup;