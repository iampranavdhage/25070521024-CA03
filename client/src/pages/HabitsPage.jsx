import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  Flame,
  Plus,
  Check,
  CheckCircle2,
  Circle,
  Calendar,
  TrendingUp,
  Award,
  Edit2,
  Trash2,
} from 'lucide-react';

export const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [todayDate, setTodayDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Study',
    targetDaysPerWeek: 7,
    color: '#ec4899',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/habits');
      if (res.success) {
        setHabits(res.habits || []);
        setTodayDate(res.today);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setFormData({
      name: '',
      description: '',
      category: 'Study',
      targetDaysPerWeek: 7,
      color: '#ec4899',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      category: habit.category || 'Study',
      targetDaysPerWeek: habit.targetDaysPerWeek || 7,
      color: habit.color || '#ec4899',
    });
    setIsModalOpen(true);
  };

  const handleToggleCompletion = async (habitId, dateStr = null) => {
    try {
      await api.post(`/api/habits/${habitId}/toggle`, { date: dateStr || todayDate });
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm('Delete this habit and all associated completion history?')) return;
    try {
      await api.delete(`/api/habits/${habitId}`);
      fetchHabits();
    } catch (err) {
      alert(err.message || 'Error deleting habit');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingHabit) {
        await api.put(`/api/habits/${editingHabit._id}`, formData);
      } else {
        await api.post('/api/habits', formData);
      }
      setIsModalOpen(false);
      fetchHabits();
    } catch (err) {
      alert(err.message || 'Error saving habit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Editorial Kicker */}
      <div style={{ marginBottom: '8px' }}>
        <span className="editorial-kicker">
          [ CHAPTER 07 // HABIT CONTINUITY &amp; DISCIPLINE ]
        </span>
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.3rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#1c1917' }}>
            Academic Habit Matrix
          </h2>
          <p style={{ color: '#57534e', fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans' }}>
            Maintain daily study disciplines, build mathematically calculated streaks, and check-in
          </p>
        </div>

        <button onClick={handleOpenAdd} className="editorial-btn-primary">
          <Plus size={16} /> New Habit Routine
        </button>
      </div>

      {/* Habit Cards */}
      {habits.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {habits.map((habit) => (
            <div
              key={habit._id}
              className="glass-panel"
              style={{
                padding: '24px',
                borderLeft: `4px solid ${habit.color || '#ec4899'}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '18px',
                }}
              >
                {/* Title & Category */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge-y2k badge-pink">{habit.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Target: {habit.targetDaysPerWeek} days/week
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>{habit.name}</h3>
                  {habit.description && (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                      {habit.description}
                    </p>
                  )}
                </div>

                {/* Today's Checkin & Streaks */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <Flame size={20} color="#ec4899" />
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                        {habit.currentStreak}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Best: {habit.longestStreak} days
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#06b6d4' }}>
                      {habit.weeklyPercentage}%
                    </span>
                    <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Weekly</p>
                  </div>

                  {/* Big Checkbox for Today */}
                  <button
                    onClick={() => handleToggleCompletion(habit._id)}
                    style={{
                      background: habit.isCompletedToday
                        ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: habit.isCompletedToday
                        ? '1px solid #10b981'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      padding: '10px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: habit.isCompletedToday ? '#ffffff' : '#cbd5e1',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: habit.isCompletedToday ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Check size={18} />
                    <span>{habit.isCompletedToday ? 'Done Today' : 'Mark Done'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(habit)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: 'none',
                        borderRadius: '6px',
                        width: '30px',
                        height: '30px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                      }}
                      title="Edit Habit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(habit._id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: 'none',
                        borderRadius: '6px',
                        width: '30px',
                        height: '30px',
                        color: '#f87171',
                        cursor: 'pointer',
                      }}
                      title="Delete Habit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 30-Day Dot Matrix Calendar Progress View */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>30-Day Consistency Grid (Past 30 Days)</span>
                  <span>Today</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                  }}
                >
                  {habit.history30Days?.map((d) => (
                    <div
                      key={d.date}
                      onClick={() => handleToggleCompletion(habit._id, d.date)}
                      title={`${d.date}: ${d.completed ? 'Completed' : 'Missed'} (click to toggle)`}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: d.completed ? habit.color || '#ec4899' : 'rgba(255, 255, 255, 0.06)',
                        border: d.date === todayDate ? '1px solid #ffffff' : '1px solid transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: d.completed ? `0 0 8px ${habit.color || '#ec4899'}66` : 'none',
                        transition: 'transform 0.15s',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Flame}
          title="No Habits Registered"
          description="Build powerful daily study habits like coding daily, reviewing lecture notes, or solving DSA problems."
          actionText="Create Habit"
          onAction={handleOpenAdd}
        />
      )}

      {/* CREATE / EDIT HABIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'New Habit Routine'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Solve 1 DSA Problem on LeetCode"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Focus on trees, graphs, or DP before bedtime"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-y2k"
              >
                <option value="Study">Study &amp; Academics</option>
                <option value="Coding">Coding &amp; Projects</option>
                <option value="Reading">Reading &amp; Research</option>
                <option value="Health">Health &amp; Wellness</option>
                <option value="Revision">Revision</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Target (Days/Week)
              </label>
              <input
                type="number"
                min={1}
                max={7}
                value={formData.targetDaysPerWeek}
                onChange={(e) => setFormData({ ...formData, targetDaysPerWeek: Number(e.target.value) })}
                className="input-y2k"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Accent Glow Color
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['#ec4899', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'].map((color) => (
                <div
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '2px solid #ffffff' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-y2k-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-y2k-primary">
              {submitting ? 'Saving to MongoDB...' : editingHabit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HabitsPage;
