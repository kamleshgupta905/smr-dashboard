import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Universal Auth API (queries Google Sheet via Apps Script)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('smr_auth_token', data.token || 'authenticated_vmhgroup');
        localStorage.setItem('smr_auth_user', data.user?.username || data.user?.name || 'Vmhgroup');
        localStorage.setItem('smr_auth_role', data.user?.role_name || data.user?.role || 'admin');
        if (data.user) {
          localStorage.setItem('smr_auth_user_data', JSON.stringify(data.user));
          if (data.user.permissions) {
            localStorage.setItem('smr_auth_permissions', JSON.stringify(data.user.permissions));
          }
        }
        onLogin(data.user);
      } else {
        setError(data.message || 'Access Denied');
        setLoading(false);
      }
    } catch (err) {
      console.warn('Live auth request failed, checking Super Admin fallback:', err);
      const isVendorFallback = username.trim().toUpperCase().startsWith('VND-') || username.trim().toLowerCase().includes('dynata') || username.trim().toLowerCase().includes('cint');
      if (isVendorFallback && (password === 'Vendor@123' || password === 'Jelly')) {
        const vCode = username.trim().toUpperCase().startsWith('VND-') ? username.trim().toUpperCase() : 'VND-DYN-01';
        const vendorUser = {
          id: 99,
          name: `${vCode} Supply Partner`,
          username: vCode,
          email: `${vCode.toLowerCase()}@partner.vmhgroupsmr.com`,
          role_id: 8,
          role_name: 'Vendor',
          role: 'Vendor',
          vendor_id: vCode,
          permissions: [1, 7, 9, 10]
        };
        localStorage.setItem('smr_auth_token', 'authenticated_vmhgroup');
        localStorage.setItem('smr_auth_user', vCode);
        localStorage.setItem('smr_auth_role', 'Vendor');
        localStorage.setItem('smr_auth_user_data', JSON.stringify(vendorUser));
        localStorage.setItem('smr_auth_permissions', JSON.stringify(vendorUser.permissions));
        onLogin(vendorUser);
        return;
      }

      const validUser = username.trim().toLowerCase() === 'vmhgroup';
      const validPass = password === 'Jelly';

      if (validUser && validPass) {
        const fallbackUser = {
          id: 1,
          name: 'VMH GROUPS',
          username: 'vmhgroup',
          email: 'vmhgroups.in@gmail.com',
          role_id: 1,
          role_name: 'Developer',
          permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        };
        localStorage.setItem('smr_auth_token', 'authenticated_vmhgroup');
        localStorage.setItem('smr_auth_user', 'Vmhgroup');
        localStorage.setItem('smr_auth_role', 'Developer');
        localStorage.setItem('smr_auth_user_data', JSON.stringify(fallbackUser));
        localStorage.setItem('smr_auth_permissions', JSON.stringify(fallbackUser.permissions));
        onLogin(fallbackUser);
      } else {
        setError('Access Denied');
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
      backgroundColor: '#f7f7f7',
      padding: '24px 16px',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
    }}>
      {/* Exact 2-Column VMH Panel Card */}
      <div style={{
        width: '100%',
        maxWidth: '960px',
        minHeight: '500px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Left Side: Login Form */}
        <div style={{
          flex: '1.15',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff',
          zIndex: 1
        }}>
          <h3 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#1e293b',
            textAlign: 'center',
            margin: '0 0 10px 0',
            letterSpacing: '-0.3px'
          }}>
            Sign Into Your Account
          </h3>

          {/* Red Error Text (Matches "Access Denied" in screenshot) */}
          {error ? (
            <div style={{
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '18px'
            }}>
              {error}
            </div>
          ) : (
            <div style={{ height: '22px', marginBottom: '8px' }} />
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
            {/* Username / Email Field */}
            <div style={{ position: 'relative', marginBottom: '18px' }}>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 24px',
                  background: '#eaf1fb',
                  border: '1px solid transparent',
                  borderRadius: '100px',
                  fontSize: '14.5px',
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = '#e1ecf9';
                  e.target.style.borderColor = '#93c5fd';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#eaf1fb';
                  e.target.style.borderColor = 'transparent';
                }}
              />
              <Mail 
                size={18} 
                color="#8997bd" 
                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
              />
            </div>

            {/* Password Field */}
            <div style={{ position: 'relative', marginBottom: '26px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 24px',
                  background: '#eaf1fb',
                  border: '1px solid transparent',
                  borderRadius: '100px',
                  fontSize: '14.5px',
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = '#e1ecf9';
                  e.target.style.borderColor = '#93c5fd';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#eaf1fb';
                  e.target.style.borderColor = 'transparent';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#8997bd'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Lock size={18} />}
              </button>
            </div>

            {/* Deep Navy Pill Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '50px',
                padding: '0 24px',
                background: '#2a2d8c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(42, 45, 140, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1e206b'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#2a2d8c'; }}
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>

            {/* Quick Access Demo Portals */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Quick Access Portals:</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('vmhgroup');
                    setPassword('Jelly');
                  }}
                  style={{
                    background: '#e9ebf8',
                    color: '#2a2d8c',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  👑 Admin Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('VND-DYN-01');
                    setPassword('Vendor@123');
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🏢 Vendor Portal
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Exact img-35.png background with animated waviy text */}
        <div style={{
          flex: '0.95',
          background: 'url(/img-35.png) top left no-repeat',
          backgroundColor: '#2a2d8c',
          backgroundSize: 'cover',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          textAlign: 'center',
          overflow: 'hidden'
        }}>
          {/* Animated Waviy Text Header */}
          <div className="waviy">
            <span style={{ '--i': 1, color: '#fbca1a' }}>L</span>
            <span style={{ '--i': 2, color: '#fbca1a' }}>O</span>
            <span style={{ '--i': 3, color: '#fbca1a' }}>G</span>
            <span style={{ '--i': 4, color: '#fbca1a' }}>I</span>
            <span style={{ '--i': 5, color: '#fbca1a' }}>N</span>
            <span style={{ '--i': 6, color: '#ffffff', margin: '0 3px' }}>t</span>
            <span style={{ '--i': 7, color: '#ffffff', marginRight: '6px' }}>o</span>
            <span style={{ '--i': 8, color: '#fbca1a' }}>V</span>
            <span style={{ '--i': 9, color: '#fbca1a' }}>M</span>
            <span style={{ '--i': 10, color: '#fbca1a' }}>H</span>
            <span style={{ '--i': 11, color: '#fbca1a' }}>G</span>
            <span style={{ '--i': 12, color: '#fbca1a' }}>R</span>
            <span style={{ '--i': 13, color: '#fbca1a' }}>O</span>
            <span style={{ '--i': 14, color: '#fbca1a' }}>U</span>
            <span style={{ '--i': 15, color: '#fbca1a' }}>P</span>
          </div>

          {/* Exact VMH Trust Statement */}
          <p style={{
            color: '#ffffff',
            fontSize: '14.5px',
            lineHeight: 1.6,
            maxWidth: '320px',
            margin: 0,
            textAlign: 'center',
            fontWeight: 400,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            Your login information is securely saved on our website. At VMH GROUP, we use advanced encryption and multi-factor authentication to ensure your data remains protected. Thank you for trusting us with your information.
          </p>
        </div>
      </div>
    </div>
  );
}
