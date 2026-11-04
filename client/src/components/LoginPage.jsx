import React, { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (!data.token) {
          setError('Login could not be verified with the server. Please try again.');
          setLoading(false);
          return;
        }

        localStorage.setItem('smr_auth_token', data.token);
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
        setError(data.message || 'Access denied. Check your credentials and try again.');
        setLoading(false);
      }
    } catch (requestError) {
      // Authentication intentionally has no client-side fallback. A session is
      // created only after the API verifies the supplied credentials.
      setError('We could not reach the authentication service. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-panel--form" aria-labelledby="login-title">
        <div className="auth-form-inner">
          <div className="auth-brand auth-brand--mobile">
            <span className="auth-brand-mark" aria-hidden="true">S</span>
            <span>
              <strong>VMH GROUP</strong>
              <small>SMR CONTROL PLANE</small>
            </span>
          </div>

          <div className="auth-eyebrow">Workspace access</div>
          <h1 id="login-title">Welcome back.</h1>
          <p className="auth-intro">
            Sign in to manage live survey supply, routing quality, and partner operations from one calm workspace.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-alert" role="alert">
                <span className="auth-alert-dot" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <label className="auth-field">
              <span className="auth-field-label">Username or email</span>
              <span className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              <span className="auth-field-label">Password</span>
              <span className="auth-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <div className="auth-form-meta">
              <span className="auth-secure-note"><ShieldCheck size={14} /> Secure admin access</span>
              <span className="auth-version">SMR v3.4</span>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              <span>{loading ? 'Verifying access…' : 'Continue to workspace'}</span>
              {!loading && <ArrowRight size={17} aria-hidden="true" />}
              {loading && <span className="auth-loader" aria-hidden="true" />}
            </button>
          </form>

          <p className="auth-footnote">Your session is protected by the VMH identity service.</p>
        </div>
      </section>

      <section className="auth-panel auth-panel--story" aria-label="VMH SMR platform overview">
        <div className="story-topbar">
          <div className="auth-brand">
            <span className="auth-brand-mark" aria-hidden="true">S</span>
            <span>
              <strong>VMH GROUP</strong>
              <small>SMR CONTROL PLANE</small>
            </span>
          </div>
          <span className="story-index">01 / 04</span>
        </div>

        <div className="story-content">
          <div className="story-kicker"><span className="story-kicker-line" /> Live survey operations</div>
          <h2>Make every<br /><em>respondent</em> count.</h2>
          <p>
            One connected command center for the supply marketplace, quality gates, payouts, and the people who keep it moving.
          </p>

          <div className="story-rule" />
          <div className="story-stats" aria-label="Platform highlights">
            <div>
              <strong>LIVE</strong>
              <span>Study inventory</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Routing watch</span>
            </div>
            <div>
              <strong>1</strong>
              <span>Protected workspace</span>
            </div>
          </div>

          <div className="story-note">
            <span className="story-note-icon"><Check size={14} /></span>
            <span><strong>Control without noise.</strong> Clear signals for decisions that matter.</span>
          </div>
        </div>

        <div className="story-footer">
          <span>VMH GROUP'S SURVEY ROUTING &amp; SAMPLE MARKETPLACE</span>
          <span className="story-footer-dot" aria-hidden="true" />
          <span>IN / GLOBAL</span>
        </div>
      </section>
    </main>
  );
}
