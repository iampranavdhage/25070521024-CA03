import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      return setError('Please enter both username/email and password.');
    }

    try {
      setLoading(true);
      const res = await login({ identifier, password, rememberMe });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        background: 'transparent',
      }}
    >
      <div
        className="editorial-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '44px 40px',
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '8px',
          boxShadow: '0 12px 32px -4px rgba(28, 25, 23, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span className="editorial-kicker">
              [ ACCESS // DOSSIER ]
            </span>
          </div>
          <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.1rem', fontWeight: 500, marginBottom: '8px', color: '#1c1917' }}>
            Sign In to <span style={{ fontStyle: 'italic' }}>UNSTOP</span>
          </h2>
          <p style={{ color: '#57534e', fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans' }}>
            Access your courses, knowledge archives, and productivity suite
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '0.88rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.86rem', color: '#1c1917', marginBottom: '8px', fontWeight: 600 }}>
              Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter username or email"
                className="editorial-input"
                style={{ paddingLeft: '40px' }}
                required
              />
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8c827a',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.86rem', color: '#1c1917', marginBottom: '8px', fontWeight: 600 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your password"
                className="editorial-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                required
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8c827a',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8c827a',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me & forgot password */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '26px',
              fontSize: '0.85rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#57534e' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Remember Me</span>
            </label>

            <Link
              to="/forgot-password"
              style={{ color: '#c2410c', textDecoration: 'none', fontWeight: 600 }}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="editorial-btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '0.96rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Ledger'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '26px', fontSize: '0.88rem', color: '#78716c' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#c2410c', fontWeight: 600, textDecoration: 'none' }}>
            Register student dossier
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
