import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, Key, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import "../App.css";

function Login() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsLoggedIn(true);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/login", form);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);
            localStorage.setItem("userId", res.data.user._id);
            if (res.data.user.name) {
                localStorage.setItem("userName", res.data.user.name);
            }
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Invalid login");
        }
    };

    return (
        <div className="auth-container" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <header className="responsive-header" style={{ padding: '20px 50px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e3a8a', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    Spritflow
                </div>
                {/*
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                    <span style={{ cursor: 'pointer' }}>Features</span>
                    <span style={{ cursor: 'pointer' }}>Solutions</span>
                    <span style={{ cursor: 'pointer' }}>Pricing</span>
                    <button style={{ background: '#f1f5f9', color: '#1e3a8a', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '700' }}>Support</button>
                </div> */}
            </header>

            {/* Main Auth Card */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div className="responsive-grid-2" style={{ maxWidth: '1200px', width: '100%', background: '#fff', borderRadius: '40px', display: 'flex', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.08)' }}>

                    {/* Left Panel */}
                    <div className="responsive-padding-small" style={{
                        flex: 1,
                        background: 'linear-gradient(rgba(30, 58, 138, 0.85), rgba(30, 58, 138, 0.95)), url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop") center/cover',
                        padding: '80px 60px',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h1 className="responsive-hero-text" style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-2px' }}>
                                The kinetic stream of your <span style={{ color: '#10b981' }}>workflow</span>.
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: '#93c5fd', maxWidth: '400px', lineHeight: '1.6' }}>
                                Experience a premium digital workspace designed for authority and effortless collaboration.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: '#10b981', padding: '12px', borderRadius: '12px' }}>
                                <Zap size={24} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>24% Increase in Velocity</div>
                                <div style={{ fontSize: '0.8rem', color: '#93c5fd' }}>Average team performance boost.</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="responsive-padding-small" style={{ flex: 1, padding: '80px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '10px' }}>Welcome Back</h2>
                        <p style={{ color: '#64748b', marginBottom: '45px' }}>Please enter your details to access your workspace.</p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '12px', letterSpacing: '1px' }}>EMAIL ADDRESS</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '35px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e3a8a', letterSpacing: '1px' }}>PASSWORD</label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e3a8a', cursor: 'pointer' }} onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', background: '#1e3a8a', color: '#fff', padding: '18px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: '700', marginBottom: '30px', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                Login to Dashboard
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', marginBottom: '30px' }}>
                                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                                OR CONTINUE WITH
                                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                                <button type="button" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '700', color: '#1e3a8a', cursor: 'pointer' }}>
                                    <Chrome size={18} /> Google
                                </button>
                                <button type="button" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '700', color: '#1e3a8a', cursor: 'pointer' }}>
                                    <Key size={18} /> Single Sign-On
                                </button>
                            </div>

                            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                Don't have an account? <span style={{ color: '#1e3a8a', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign up for free</span>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="responsive-stack responsive-padding-small" style={{ padding: '30px 50px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>
                <div style={{ color: '#1e3a8a', fontSize: '1.1rem', fontWeight: '900' }}>SPRITFLOW</div>
                <div className="responsive-flex-wrap" style={{ display: 'flex', gap: '25px', letterSpacing: '1px' }}>
                    <span style={{ cursor: 'pointer' }}>PRIVACY POLICY</span>
                    <span style={{ cursor: 'pointer' }}>TERMS OF SERVICE</span>
                    <span style={{ cursor: 'pointer' }}>COOKIE SETTINGS</span>
                    <span style={{ cursor: 'pointer' }}>HELP CENTER</span>
                </div>
                <div>© 2024 SPRITFLOW. KINETIC STREAM DESIGN.</div>
            </footer>
        </div>
    );
}

export default Login;