import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    collegeName: '',
    courseDegree: 'B.Tech',
    branchDept: '',
    academicYear: '1st Year',
    dob: '',
    termsAccepted: false,
    securityQuestion: 'What was your first school name or favorite subject?',
    securityAnswer: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: '#64748b' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: '#ef4444' };
    if (score === 3) return { score: 50, label: 'Fair', color: '#f59e0b' };
    if (score === 4) return { score: 75, label: 'Strong', color: '#06b6d4' };
    return { score: 100, label: 'Cyber-Grade', color: '#10b981' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.fullName.trim()) return setError('Full name is required.');
    if (!formData.username.trim()) return setError('Username is required.');
    if (!formData.email.trim()) return setError('Email address is required.');
    if (!formData.password) return setError('Password is required.');
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (!formData.collegeName.trim()) return setError('College name is required.');
    if (!formData.courseDegree.trim()) return setError('Course or degree is required.');
    if (!formData.branchDept.trim()) return setError('Branch or department is required.');
    if (!formData.academicYear.trim()) return setError('Current academic year is required.');
    if (!formData.termsAccepted) {
      return setError('You must agree to the Terms and Conditions.');
    }

    try {
      setLoading(true);
      const res = await signup(formData);
      if (res.success) {
        setSuccessMsg('Account registered successfully! Loading workspace...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
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
        padding: '40px 20px',
        background: 'transparent',
      }}
    >
      <div
        className="editorial-card"
        style={{
          width: '100%',
          maxWidth: '860px',
          padding: '44px',
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '8px',
          boxShadow: '0 12px 32px -4px rgba(28, 25, 23, 0.08)',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span className="editorial-kicker">
              [ REGISTRATION // STUDENT DOSSIER ]
            </span>
          </div>
          <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.3rem', fontWeight: 500, marginBottom: '6px', color: '#1c1917' }}>
            Enroll in <span style={{ fontStyle: 'italic' }}>UNSTOP</span>
          </h2>
          <p style={{ color: '#57534e', fontSize: '0.92rem', fontFamily: 'Plus Jakarta Sans' }}>
            Create your comprehensive student academic record &amp; productivity ledger
          </p>
        </div>

        {/* Error notification */}
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
              marginBottom: '24px',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#34d399',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '24px',
              fontSize: '0.9rem',
            }}
          >
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Account & Credentials */}
          <div style={{ marginBottom: '28px' }}>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#c084fc',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <User size={16} /> 1. Account Credentials &amp; Identity
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {/* 1. Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Full Name <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className="input-y2k"
                  required
                />
              </div>

              {/* 2. Username */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Username <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. aarav_sharma"
                  className="input-y2k"
                  required
                />
              </div>

              {/* 3. Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Email Address <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. aarav@college.edu"
                  className="input-y2k"
                  required
                />
              </div>

              {/* 6. Phone number (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Phone Number <span style={{ color: '#64748b' }}>(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="input-y2k"
                />
              </div>

              {/* 4. Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Password <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="input-y2k"
                    style={{ paddingRight: '40px' }}
                    required
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
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* 5. Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Confirm Password <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="input-y2k"
                    style={{ paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password strength meter */}
            {formData.password && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Password Strength:</span>
                  <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${strength.score}%`,
                      height: '100%',
                      background: strength.color,
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: College & Academic Details */}
          <div style={{ marginBottom: '28px' }}>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#22d3ee',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <GraduationCap size={16} /> 2. College &amp; Academic Information
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {/* 7. College Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  College / University Name <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="e.g. National Institute of Technology"
                  className="input-y2k"
                  required
                />
              </div>

              {/* 8. Course / Degree */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Course or Degree <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <input
                  type="text"
                  name="courseDegree"
                  value={formData.courseDegree}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech / B.Sc / BCA / M.Tech"
                  className="input-y2k"
                  required
                />
              </div>

              {/* 9. Branch / Department */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Branch or Department <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <input
                  type="text"
                  name="branchDept"
                  value={formData.branchDept}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science & Engineering"
                  className="input-y2k"
                  required
                />
              </div>

              {/* 10. Current Academic Year */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Current Academic Year <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="input-y2k"
                  required
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year (Final)">4th Year (Final)</option>
                  <option value="Postgraduate Year 1">Postgraduate Year 1</option>
                  <option value="Postgraduate Year 2">Postgraduate Year 2</option>
                </select>
              </div>

              {/* 11. Date of Birth (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Date of Birth <span style={{ color: '#64748b' }}>(Optional)</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="input-y2k"
                />
              </div>

              {/* Security Answer for Local Recovery */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Recovery Answer <span style={{ color: '#64748b' }}>(First school / Fav subject)</span>
                </label>
                <input
                  type="text"
                  name="securityAnswer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  placeholder="e.g. St. Xavier or Mathematics"
                  className="input-y2k"
                />
              </div>
            </div>
          </div>

          {/* 12. Terms & Conditions Checkbox */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '24px',
            }}
          >
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              style={{ marginTop: '3px', cursor: 'pointer', width: '17px', height: '17px' }}
              required
            />
            <label htmlFor="termsAccepted" style={{ fontSize: '0.85rem', color: '#94a3b8', cursor: 'pointer' }}>
              I agree to the <span style={{ color: '#c084fc', fontWeight: 600 }}>Terms and Conditions</span> and confirm that my academic data will be saved securely in the local MongoDB database.
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-y2k-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            {loading ? 'Creating Account & Saving in MongoDB...' : 'Complete Registration & Open UNSTOP'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#22d3ee', fontWeight: 600, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
