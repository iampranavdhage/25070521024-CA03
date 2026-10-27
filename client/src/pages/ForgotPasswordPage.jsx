import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Zap, ShieldCheck, KeyRound, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [hasSecurityAnswer, setHasSecurityAnswer] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Look up user & security question
  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      return setError('Please enter your username or email address.');
    }

    try {
      setLoading(true);
      const res = await api.get('/api/auth/forgot-password/question', { identifier });
      if (res.success) {
        setSecurityQuestion(res.securityQuestion);
        setHasSecurityAnswer(res.hasSecurityAnswer);
        setStep(2);
      } else {
        setError(res.message || 'Account not found.');
      }
    } catch (err) {
      setError(err.message || 'Unable to locate account.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify answer & set new password
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    try {
      setLoading(true);
      const res = await api.post('/api/auth/forgot-password/reset', {
        identifier,
        securityAnswer,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setSuccess('Password updated successfully in MongoDB! You can now sign in.');
        setStep(3);
      } else {
        setError(res.message || 'Reset failed.');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
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
        background: '#07070d',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px 36px',
          background: 'rgba(14, 14, 24, 0.85)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(168, 85, 247, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
              marginBottom: '14px',
            }}
          >
            <KeyRound size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            Account Password Recovery
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Local development recovery workflow (verified directly via MongoDB security validation)
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

        {/* STEP 1: Enter username / email */}
        {step === 1 && (
          <form onSubmit={handleLookup}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>
                Enter your Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. aarav_sharma or student@college.edu"
                className="input-y2k"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-y2k-primary"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
            >
              {loading ? 'Verifying Account...' : 'Continue to Security Question'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        {/* STEP 2: Answer question & set new password */}
        {step === 2 && (
          <form onSubmit={handleReset}>
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Security Question:
              </p>
              <p style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 500 }}>
                {securityQuestion}
              </p>
            </div>

            {hasSecurityAnswer && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>
                  Your Security Answer
                </label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Enter the answer you registered with"
                  className="input-y2k"
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input-y2k"
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="input-y2k"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-y2k-outline"
                style={{ flex: 1, padding: '12px' }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-y2k-primary"
                style={{ flex: 2, padding: '12px' }}
              >
                {loading ? 'Saving...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Done */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                marginBottom: '16px',
              }}
            >
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Password Reset Successful!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your new password has been hashed with bcrypt and saved in MongoDB.
            </p>
            <Link to="/login" className="btn-y2k-primary" style={{ display: 'inline-flex', width: '100%' }}>
              Proceed to Sign In
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#94a3b8',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
