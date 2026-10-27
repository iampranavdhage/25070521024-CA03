import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const PlannerPage = () => {
  const [sessions, setSessions] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    sessionType: 'focus',
    dayOfWeek: selectedDay,
    startTime: '',
    durationMinutes: 45,
    subjectId: '',
    goals: '',
    notes: '',
    examDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMetadata();
    fetchSchedule();
  }, []);

  const fetchMetadata = async () => {
    try {
      const res = await api.get('/api/subjects');
      if (res.success) setSubjects(res.subjects);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/planner');
      if (res.success) {
        setSessions(res.sessions || []);
        setUpcomingDeadlines(res.upcomingDeadlines || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSession(null);
    setFormData({
      title: '',
      sessionType: 'focus',
      dayOfWeek: selectedDay,
      startTime: '',
      durationMinutes: 45,
      subjectId: subjects[0]?._id || '',
      goals: '',
      notes: '',
      examDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      sessionType: session.sessionType,
      dayOfWeek: session.dayOfWeek || selectedDay,
      startTime: session.startTime ? new Date(session.startTime).toISOString().slice(11, 16) : '',
      durationMinutes: session.durationMinutes || 45,
      subjectId: session.subjectId?._id || session.subjectId || '',
      goals: session.goals || '',
      notes: session.notes || '',
      examDate: session.examDate ? session.examDate.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study session?')) return;
    try {
      await api.delete(`/api/planner/${id}`);
      fetchSchedule();
    } catch (err) {
      alert(err.message || 'Error deleting session');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSession) {
        await api.put(`/api/planner/${editingSession._id}`, formData);
      } else {
        await api.post('/api/planner', formData);
      }
      setIsModalOpen(false);
      fetchSchedule();
    } catch (err) {
      alert(err.message || 'Error saving session');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter sessions by selected day
  const daySessions = sessions.filter(
    (s) => (s.dayOfWeek && s.dayOfWeek.toLowerCase() === selectedDay.toLowerCase()) || !s.dayOfWeek
  );

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
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Study Planner &amp; Schedule</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Plan daily study sessions, revision blocks, and exam timelines
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-y2k-primary">
          <Plus size={18} /> Schedule Study Block
        </button>
      </div>

      {/* Weekday Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '24px',
        }}
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const count = sessions.filter((s) => s.dayOfWeek === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="glass-panel"
              style={{
                padding: '12px 18px',
                cursor: 'pointer',
                border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 16, 28, 0.6)',
                borderRadius: '12px',
                minWidth: '120px',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              <p style={{ fontSize: '0.95rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#ffffff' : '#94a3b8' }}>
                {day}
              </p>
              <span style={{ fontSize: '0.72rem', color: isSelected ? '#22d3ee' : '#64748b' }}>
                {count} {count === 1 ? 'block' : 'blocks'}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Day's Scheduled Sessions */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#06b6d4" />
            Study Blocks for {selectedDay} ({daySessions.length})
          </h3>

          {daySessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {daySessions.map((s) => (
                <div
                  key={s._id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderLeft: `4px solid ${s.subjectId?.color || '#a855f7'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="badge-y2k badge-purple" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>
                        {s.sessionType} • {s.durationMinutes} mins
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{s.title}</h4>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          borderRadius: '6px',
                          width: '28px',
                          height: '28px',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: 'none',
                          borderRadius: '6px',
                          width: '28px',
                          height: '28px',
                          color: '#f87171',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {s.subjectId && (
                    <p style={{ fontSize: '0.82rem', color: s.subjectId.color || '#22d3ee', fontWeight: 600, marginBottom: '6px' }}>
                      Subject: {s.subjectId.subjectCode} — {s.subjectId.subjectName}
                    </p>
                  )}

                  {s.goals && (
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      🎯 <strong>Goal:</strong> {s.goals}
                    </p>
                  )}

                  {s.notes && (
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Notes: {s.notes}
                    </p>
                  )}

                  {s.examDate && (
                    <p style={{ fontSize: '0.78rem', color: '#ec4899', marginTop: '8px', fontWeight: 600 }}>
                      ⚡ Exam Target: {new Date(s.examDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title={`No study blocks scheduled for ${selectedDay}`}
              description="Schedule study sessions, revision goals, or exam preparation times."
              actionText="Schedule Block"
              onAction={handleOpenAdd}
            />
          )}
        </div>

        {/* Right Sidebar: Upcoming Deadlines & Exam Dates */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            Upcoming Exam &amp; Task Deadlines
          </h3>

          <div className="glass-panel" style={{ padding: '20px' }}>
            {upcomingDeadlines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingDeadlines.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h5 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{t.title}</h5>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Due: {new Date(t.dueDate).toLocaleDateString()} • {t.subjectId?.subjectName || 'Coursework'}
                      </p>
                    </div>
                    <span
                      className={`badge-y2k ${
                        t.priority === 'urgent' ? 'badge-pink' : t.priority === 'high' ? 'badge-amber' : 'badge-cyan'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.88rem', textAlign: 'center', padding: '20px 0' }}>
                No upcoming exam or task deadlines pending.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSession ? 'Edit Study Session' : 'Schedule Study Session'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Session Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Graph Algorithms Practice & Review"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Day of Week
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="input-y2k"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                min={15}
                max={240}
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="input-y2k"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Associated Subject
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="input-y2k"
              >
                <option value="">-- General / Self Study --</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectCode} — {s.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Session Type
              </label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="input-y2k"
              >
                <option value="focus">Deep Focus</option>
                <option value="pomodoro">Pomodoro Sprint</option>
                <option value="exam-prep">Exam Preparation</option>
                <option value="review">Revision &amp; Notes</option>
                <option value="assignment">Assignment Lab</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Study Goals / Objectives
            </label>
            <input
              type="text"
              placeholder="e.g. Solve 5 problems on Dynamic Programming"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Exam Date (Optional)
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="input-y2k"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Session Notes
              </label>
              <input
                type="text"
                placeholder="Chapter 4, Section 2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-y2k"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-y2k-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-y2k-primary">
              {submitting ? 'Saving to MongoDB...' : editingSession ? 'Update Block' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlannerPage;
