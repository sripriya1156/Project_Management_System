import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" or "error"

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            setMessageType("error");
            return;
        }
        try {
            const res = await API.post(`/reset-password/${token}`, { password });
            setMessage(res.data.message);
            setMessageType("success");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || "Error resetting password");
            setMessageType("error");
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
                    <h2 className="auth-title">Reset Password</h2>
                    <p className="auth-subtitle">Enter your new password below</p>
                    {message && (
                        <p style={{ 
                            textAlign: 'center', 
                            color: messageType === "success" ? '#10b981' : '#ef4444', 
                            fontWeight: '700', 
                            marginBottom: '20px',
                            background: messageType === "success" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            padding: '12px',
                            borderRadius: '12px'
                        }}>
                            {message}
                        </p>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <label className="auth-label">NEW PASSWORD</label>
                            <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">CONFIRM NEW PASSWORD</label>
                            <input className="auth-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                        <button type="submit" className="auth-btn">Reset Password</button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ResetPassword;
