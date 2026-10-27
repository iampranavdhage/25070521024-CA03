import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Lock,
  LogOut,
  Trash2,
  CheckCircle,
  AlertCircle,
  Settings,
  ShieldAlert,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    phone: user?.phone || '',
    collegeName: user?.collegeName || '',
    courseDegree: user?.courseDegree || '',
    branchDept: user?.branchDept || '',
    academicYear: user?.academicYear || '1st Year',
    dob: user?.dob ? user.dob.split('T')[0] : '',
    securityQuestion: user?.securityQuestion || 'What was your first school name or favorite subject?',
    securityAnswer: '',
  });

  // Password Change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Status messages
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (profileMsg) setProfileMsg('');
    if (profileError) setProfileError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    setSubmittingProfile(true);

    try {
      const res = await api.put('/api/auth/profile', formData);
      if (res.success && res.user) {
        updateUser(res.user);
        setProfileMsg('Academic profile updated successfully in MongoDB!');
      } else {
        setProfileError(res.message || 'Update failed.');
      }
    } catch (err) {
      setProfileError(err.message || 'Error updating profile.');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError('New passwords do not match.');
    }
    if (passwordForm.newPassword.length < 6) {
      return setPasswordError('Password must be at least 6 characters.');
    }

    setSubmittingPassword(true);
    try {
      const res = await api.put('/api/auth/change-password', passwordForm);
      if (res.success) {
        setPasswordMsg('Password changed successfully in MongoDB!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(res.message || 'Password change failed.');
      }
    } catch (err) {
      setPasswordError(err.message || 'Error updating password.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) return setDeleteError('Please enter your password to confirm.');

    setDeleting(true);
    setDeleteError('');
    try {
      const res = await api.delete('/api/auth/account', { password: deletePassword });
      if (res.success) {
        await logout();
        navigate('/login');
      } else {
        setDeleteError(res.message || 'Deletion failed.');
      }
    } catch (err) {
      setDeleteError(err.message || 'Error deleting account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Student Profile &amp; Settings</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Manage your personal identity, college credentials, password, and security parameters
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {/* Left Column: Academic & Personal Profile */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#c084fc" /> Personal &amp; Academic Details
          </h3>

          {profileMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.88rem',
              }}
            >
              <CheckCircle size={16} /> <span>{profileMsg}</span>
            </div>
          )}

          {profileError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.88rem',
              }}
            >
              <AlertCircle size={16} /> <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleProfileChange}
                className="input-y2k"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleProfileChange}
                  className="input-y2k"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  className="input-y2k"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                College / University
              </label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleProfileChange}
                className="input-y2k"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Degree / Course
                </label>
                <input
                  type="text"
                  name="courseDegree"
                  value={formData.courseDegree}
                  onChange={handleProfileChange}
                  className="input-y2k"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Branch / Dept
                </label>
                <input
                  type="text"
                  name="branchDept"
                  value={formData.branchDept}
                  onChange={handleProfileChange}
                  className="input-y2k"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Academic Year
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleProfileChange}
                  className="input-y2k"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year (Final)">4th Year (Final)</option>
                  <option value="Postgraduate Year 1">Postgraduate Year 1</option>
                  <option value="Postgraduate Year 2">Postgraduate Year 2</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleProfileChange}
                  className="input-y2k"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingProfile}
              className="btn-y2k-primary"
              style={{ marginTop: '10px', padding: '12px' }}
            >
              {submittingProfile ? 'Saving Changes to MongoDB...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column: Password & Account Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Change Password Card */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="#06b6d4" /> Change Password
            </h3>

            {passwordMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.88rem',
                }}
              >
                <CheckCircle size={16} /> <span>{passwordMsg}</span>
              </div>
            )}

            {passwordError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.88rem',
                }}
              >
                <AlertCircle size={16} /> <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Verify your current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input-y2k"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input-y2k"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input-y2k"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="btn-y2k-cyan"
                style={{ marginTop: '8px', padding: '12px' }}
              >
                {submittingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone: Delete Account */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(25, 12, 18, 0.6)',
            }}
          >
            <h4 style={{ fontSize: '1.05rem', color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} /> Danger Zone: Permanent Account Deletion
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '16px' }}>
              Deleting your account permanently wipes all your registered courses, subjects, notes, tasks, study schedules, and activity logs from MongoDB.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn-danger"
              style={{ fontSize: '0.85rem' }}
            >
              <Trash2 size={16} /> Delete Account &amp; All Data
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Permanent Account Deletion"
      >
        <form onSubmit={handleDeleteAccount}>
          <p style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '16px' }}>
            Warning: This action is irreversible. Enter your password to confirm total removal of your academic record.
          </p>

          {deleteError && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px' }}>
              {deleteError}
            </p>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="input-y2k"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn-y2k-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="btn-danger"
            >
              {deleting ? 'Deleting Data...' : 'Permanently Delete'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
