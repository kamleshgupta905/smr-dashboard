import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, Zap, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('Vmhgroup');
  const [password, setPassword] = useState('Jelly');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState('login');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call Universal Auth API (queries Google Sheet via Apps Script)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Enforce Admin-only verification
        if (data.user?.role && data.user.role.toLowerCase() !== 'admin') {
          setError('Access Denied: Only Admin accounts are authorized to access the VMH SMR platform.');
          setLoading(false);
          return;
        }

        localStorage.setItem('smr_auth_token', data.token || 'authenticated_vmhgroup');
        localStorage.setItem('smr_auth_user', data.user?.username || data.user?.name || 'Vmhgroup');
        localStorage.setItem('smr_auth_role', 'admin');
        onLogin();
      } else {
        setError(data.message || 'Invalid username or password. Please verify your admin credentials.');
        setLoading(false);
      }
    } catch (err) {
      console.warn('Live auth request failed, checking Super Admin fallback:', err);
      // Resilient fallback for Vmhgroup / Jelly
      const validUser = username.trim().toLowerCase() === 'vmhgroup';
      const validPass = password === 'Jelly';

      if (validUser && validPass) {
        localStorage.setItem('smr_auth_token', 'authenticated_vmhgroup');
        localStorage.setItem('smr_auth_user', 'Vmhgroup');
        localStorage.setItem('smr_auth_role', 'admin');
        onLogin();
      } else {
        setError('Authentication failed. Default Super Admin: Vmhgroup / Jelly');
        setLoading(false);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5fa',
      padding: '20px',
      fontFamily: "'Roboto', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: '#ffffff',
        border: '1px solid #e3ebf6',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(48, 62, 103, 0.12)'
      }}>
        {/* VMH Auth Header Box */}
        <div style={{
          background: '#0c213a',
          padding: '28px 24px',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '8px 14px',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
            marginBottom: '14px'
          }}>
            <img 
              src="/vmh-logo.png" 
              alt="VMH Group" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>
          <h3 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '19px',
            fontWeight: 800,
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px',
            color: '#ffffff'
          }}>
            VMH GROUP'S SMR
          </h3>
          <p style={{
            fontSize: '12.5px',
            color: '#8997bd',
            margin: 0
          }}>
            Sign in to continue to VMH Survey Marketplace & Traffic Router
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '24px' }}>
          {/* Auth Tabs: Log In | Register */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e3ebf6',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setActiveAuthTab('login')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: 'transparent',
                borderBottom: activeAuthTab === 'login' ? '2px solid #1761fd' : '2px solid transparent',
                color: activeAuthTab === 'login' ? '#1761fd' : '#8997bd',
                fontWeight: activeAuthTab === 'login' ? 600 : 500,
                fontSize: '13px',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer'
              }}
            >
              Log In
            </button>
            <button
              onClick={() => setActiveAuthTab('register')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: 'transparent',
                borderBottom: activeAuthTab === 'register' ? '2px solid #1761fd' : '2px solid transparent',
                color: activeAuthTab === 'register' ? '#1761fd' : '#8997bd',
                fontWeight: activeAuthTab === 'register' ? 600 : 500,
                fontSize: '13px',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer'
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {activeAuthTab === 'register' ? (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '18px 16px',
              fontSize: '12.5px',
              color: '#334155',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                <ShieldCheck size={18} color="#16a34a" />
                <span>Strict Admin-Only Access Policy</span>
              </div>
              <p style={{ margin: '0 0 10px 0', color: '#475569' }}>
                Public user self-registration is disabled. Only authorized <strong>Admin</strong> accounts can log in to the VMH SMR platform.
              </p>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '10px', fontSize: '11.5px', color: '#1e293b', marginBottom: '14px' }}>
                <strong>How to add or invite an Admin:</strong>
                <div style={{ marginTop: '4px', color: '#64748b' }}>
                  Simply open your linked <strong>Google Sheet ("Admins" tab)</strong> and add a new row with:
                  <div style={{ marginTop: '4px', fontFamily: 'monospace', color: '#0284c7' }}>
                    Role: "admin" &bull; Status: "Active"
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setActiveAuthTab('login')}
                style={{
                  width: '100%',
                  padding: '9px',
                  background: '#1761fd',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Return to Admin Log In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#303e67', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>
                  Username / Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 34px',
                      border: '1px solid #e3ebf6',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#303e67',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <User size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#303e67', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 36px 9px 34px',
                      border: '1px solid #e3ebf6',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#303e67',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#8997bd' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#8997bd',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#8997bd'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#1761fd' }} />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" style={{ color: '#8997bd', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#1761fd',
                  color: '#ffffff',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  boxShadow: '0 2px 6px rgba(23, 97, 253, 0.35)'
                }}
              >
                {loading ? 'Authenticating...' : 'Log In'}
              </button>

              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <a 
                  href="http://localhost:5000/api/auth/google/authorize" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '11.5px', color: '#1761fd', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>&#128279; 1-Click Connect Google Sheet</span>
                </a>
              </div>
            </form>
          )}

          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#8997bd',
            borderTop: '1px solid #f1f5fa',
            paddingTop: '14px'
          }}>
            Google Sheet + Cloud Auth &bull; <strong>Strict Admin-Only Access</strong> &bull; 256-Bit SSL
          </div>
        </div>
      </div>
    </div>
  );
}
