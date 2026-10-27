import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import {
  History,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  FolderKanban,
  FileText,
  CheckSquare,
  Clock,
  Flame,
  User,
  Filter,
  Trash2,
} from 'lucide-react';

export const HistoryPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [filterAction, filterEntity]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterAction) params.action = filterAction;
      if (filterEntity) params.entityType = filterEntity;

      const res = await api.get('/api/activities', params);
      if (res.success) {
        setActivities(res.activities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear your activity audit trail? (Your actual courses, notes, and tasks will remain)')) return;
    try {
      await api.delete('/api/activities');
      fetchActivities();
    } catch (e) {
      alert(e.message || 'Error clearing history');
    }
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'Course':
        return <BookOpen size={16} color="#a855f7" />;
      case 'Subject':
        return <FolderKanban size={16} color="#06b6d4" />;
      case 'Note':
        return <FileText size={16} color="#c084fc" />;
      case 'Task':
        return <CheckSquare size={16} color="#10b981" />;
      case 'StudySession':
        return <Clock size={16} color="#fbbf24" />;
      case 'Habit':
        return <Flame size={16} color="#ec4899" />;
      case 'Auth':
      case 'Profile':
      default:
        return <User size={16} color="#3b82f6" />;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Activity History &amp; Audit Log</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Chronological audit log of all academic actions, sessions, and database changes
          </p>
        </div>

        {activities.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn-danger"
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <Trash2 size={15} /> Clear History
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} /> Filter Audit Stream:
        </span>

        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="input-y2k"
          style={{ width: 'auto' }}
        >
          <option value="">All Entities</option>
          <option value="Course">Courses</option>
          <option value="Subject">Subjects</option>
          <option value="Note">Notes</option>
          <option value="Task">Tasks</option>
          <option value="StudySession">Study Sessions</option>
          <option value="Habit">Habits</option>
          <option value="Auth">Authentication</option>
          <option value="Profile">Profile</option>
        </select>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="input-y2k"
          style={{ width: 'auto' }}
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="COMPLETE">Complete</option>
          <option value="LOGIN">Login</option>
          <option value="REGISTER">Register</option>
        </select>
      </div>

      {/* Activities Timeline */}
      {activities.length > 0 ? (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {activities.map((act) => (
              <div
                key={act._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getEntityIcon(act.entityType)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {act.title}
                    </h4>
                    <span
                      className={`badge-y2k ${
                        act.action === 'CREATE'
                          ? 'badge-purple'
                          : act.action === 'COMPLETE'
                          ? 'badge-emerald'
                          : act.action === 'DELETE'
                          ? 'badge-pink'
                          : 'badge-cyan'
                      }`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {act.action}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {act.description && (
                    <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px' }}>
                      {act.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No Activity Logs Found"
          description="Every time you create courses, take notes, mark tasks complete, or finish Pomodoro focus sessions, it will be audited here."
        />
      )}
    </div>
  );
};

export default HistoryPage;
