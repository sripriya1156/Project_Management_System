import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await API.post("/forgot-password", { email });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || "Error sending email");
        }
    };

    return (
        <div className="auth-container">
            <header className="auth-header">
                <div className="auth-header-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    Spritflow
                </div>
            </header>
            <main className="auth-main">
                <div className="auth-card">
                    <h2 className="auth-title">Forgot Password</h2>
                    <p className="auth-subtitle">Enter your email to receive a reset link</p>
                    {message && <p style={{ textAlign: 'center', color: '#047660', fontWeight: '600', marginBottom: '20px' }}>{message}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <label className="auth-label">EMAIL ADDRESS</label>
                            <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="****@spritflow.com" required />
                        </div>
                        <button type="submit" className="auth-btn">Send Reset Link</button>
                        <div className="auth-footer">
                            Back to <span className="auth-link" onClick={() => navigate('/login')}>Login</span>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ForgotPassword;
