import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  BookOpen,
  FolderKanban,
  FileText,
  CheckSquare,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick Action Modal states
  const [modalType, setModalType] = useState(null); // 'course' | 'subject' | 'note' | 'task'
  const [coursesList, setCoursesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  // Quick form inputs
  const [courseForm, setCourseForm] = useState({ courseName: '', courseCode: '', semester: 'Semester 1', department: '' });
  const [subjectForm, setSubjectForm] = useState({ courseId: '', subjectName: '', subjectCode: '', semester: 'Semester 1' });
  const [noteForm, setNoteForm] = useState({ subjectId: '', title: '', content: '', tags: '' });
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', dueDate: '', subjectId: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchCoursesAndSubjects();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/analytics/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndSubjects = async () => {
    try {
      const [cRes, sRes] = await Promise.all([api.get('/api/courses'), api.get('/api/subjects')]);
      if (cRes.success) setCoursesList(cRes.courses);
      if (sRes.success) setSubjectsList(sRes.subjects);
    } catch (e) {
      console.error(e);
    }
  };

  // Quick action submission
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (modalType === 'course') {
        await api.post('/api/courses', courseForm);
      } else if (modalType === 'subject') {
        await api.post('/api/subjects', subjectForm);
      } else if (modalType === 'note') {
        await api.post('/api/notes', {
          ...noteForm,
          tags: noteForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        });
      } else if (modalType === 'task') {
        await api.post('/api/tasks', taskForm);
      }

      setModalType(null);
      // Reset forms
      setCourseForm({ courseName: '', courseCode: '', semester: 'Semester 1', department: '' });
      setSubjectForm({ courseId: '', subjectName: '', subjectCode: '', semester: 'Semester 1' });
      setNoteForm({ subjectId: '', title: '', content: '', tags: '' });
      setTaskForm({ title: '', priority: 'medium', dueDate: '', subjectId: '' });
      // Refresh
      fetchDashboard();
      fetchCoursesAndSubjects();
    } catch (err) {
      alert(err.message || 'Error creating item');
    } finally {
      setFormSubmitting(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const stats = data?.stats || {
    totalCourses: 0,
    totalSubjects: 0,
    totalNotes: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    taskCompletionRate: 0,
    totalStudyHours: 0,
    weeklyStudyHours: 0,
    activeHabits: 0,
    habitCompletionRate: 0,
  };

  return (
    <div className="page-wrapper">
      {/* Top Banner & Greetings with Swiss Ticker & Coordinates */}
      <div
        className="editorial-card"
        style={{
          padding: '28px 32px',
          marginBottom: '28px',
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          position: 'sticky',
          top: '76px',
          zIndex: 25,
          boxShadow: '0 4px 16px rgba(28,25,23,0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
            <span className="editorial-kicker">[CHAPTER 01 · {today}]</span>
            <span style={{ color: '#d6d3d1' }}>·</span>
            <span style={{ fontSize: '0.72rem', color: '#78716c' }}>
              {user?.collegeName ? `${user.collegeName} • ${user.courseDegree || ''}` : 'ACADEMIC LEDGER'}
            </span>
          </div>
          <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.1rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#1c1917' }}>
            Student Ledger: <span style={{ fontStyle: 'italic', fontWeight: 400 }}>{user?.fullName || 'Academic Scholar'}</span>
          </h2>
          <p style={{ color: '#57534e', fontSize: '0.88rem', marginTop: '4px', fontFamily: 'Plus Jakarta Sans' }}>
            Live records synchronized with local MongoDB Community Server (unstop_db)
          </p>
        </div>

        {/* Quick Actions buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setModalType('course')}
            className="editorial-btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Plus size={14} /> Add Course
          </button>
          <button
            onClick={() => setModalType('subject')}
            className="editorial-btn-outline"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Plus size={14} /> Add Subject
          </button>
          <button
            onClick={() => setModalType('note')}
            className="editorial-btn-outline"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Plus size={14} /> Add Note
          </button>
          <button
            onClick={() => setModalType('task')}
            className="editorial-btn-outline"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      {/* Primary Statistics Grid — Swiss Monospace Index */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* Total Courses */}
        <div className="editorial-card" style={{ padding: '22px', borderLeft: '3px solid #1c1917' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#78716c', letterSpacing: '0.12em' }}>
              01 // COURSES
            </span>
            <BookOpen size={16} color="#78716c" />
          </div>
          <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.6rem', fontStyle: 'italic', fontWeight: 400, color: '#1c1917', lineHeight: 1 }}>
            {stats.totalCourses}
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.74rem', color: '#78716c', marginTop: '6px' }}>
            Enrolled Academic Tracks
          </p>
        </div>

        {/* Total Subjects */}
        <div className="editorial-card" style={{ padding: '22px', borderLeft: '3px solid #c2410c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#c2410c', letterSpacing: '0.12em' }}>
              02 // SUBJECTS
            </span>
            <FolderKanban size={16} color="#c2410c" />
          </div>
          <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.6rem', fontStyle: 'italic', fontWeight: 400, color: '#1c1917', lineHeight: 1 }}>
            {stats.totalSubjects}
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.74rem', color: '#78716c', marginTop: '6px' }}>
            Curriculum Units
          </p>
        </div>

        {/* Total Notes */}
        <div className="editorial-card" style={{ padding: '22px', borderLeft: '3px solid #15803d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#15803d', letterSpacing: '0.12em' }}>
              03 // NOTES
            </span>
            <FileText size={16} color="#15803d" />
          </div>
          <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.6rem', fontStyle: 'italic', fontWeight: 400, color: '#1c1917', lineHeight: 1 }}>
            {stats.totalNotes}
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.74rem', color: '#78716c', marginTop: '6px' }}>
            Subject Knowledge Documents
          </p>
        </div>

        {/* Task Completion Rate */}
        <div className="editorial-card" style={{ padding: '22px', borderLeft: '3px solid #1d4ed8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#1d4ed8', letterSpacing: '0.12em' }}>
              04 // TASKS
            </span>
            <CheckSquare size={16} color="#1d4ed8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.6rem', fontStyle: 'italic', fontWeight: 400, color: '#1c1917', lineHeight: 1 }}>
              {stats.taskCompletionRate}%
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#78716c' }}>
              ({stats.completedTasks}/{stats.totalTasks})
            </span>
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.74rem', color: '#78716c', marginTop: '6px' }}>
            {stats.pendingTasks} Pending In Queue
          </p>
        </div>

        {/* Study Hours */}
        <div className="editorial-card" style={{ padding: '22px', borderLeft: '3px solid #b45309' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#b45309', letterSpacing: '0.12em' }}>
              05 // STUDY HOURS
            </span>
            <Clock size={16} color="#b45309" />
          </div>
          <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.6rem', fontStyle: 'italic', fontWeight: 400, color: '#1c1917', lineHeight: 1 }}>
            {stats.totalStudyHours}h
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.74rem', color: '#78716c', marginTop: '6px' }}>
            {stats.weeklyStudyHours}h Logged This Week
          </p>
        </div>

        {/* Active Habits */}
        <div className="editorial-card" style={{ padding: '22px', borderLeft: '3px solid #78716c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#78716c', letterSpacing: '0.12em' }}>
              06 // HABITS
            </span>
            <Flame size={16} color="#78716c" />
          </div>
          <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.6rem', fontStyle: 'italic', fontWeight: 400, color: '#1c1917', lineHeight: 1 }}>
            {stats.activeHabits}
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.74rem', color: '#78716c', marginTop: '6px' }}>
            {stats.habitCompletionRate}% Completed Today
          </p>
        </div>
      </div>

      {/* Middle Grid: Upcoming Deadlines & Recent Notes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        {/* Upcoming Deadlines */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#f59e0b" />
              Upcoming Academic Deadlines
            </h3>
            <Link to="/tasks" style={{ fontSize: '0.82rem', color: '#22d3ee', textDecoration: 'none' }}>
              View all tasks →
            </Link>
          </div>

          {data?.upcomingDeadlines?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.upcomingDeadlines.map((t) => (
                <div
                  key={t._id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>{t.title}</h5>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`badge-y2k ${t.priority === 'urgent'
                        ? 'badge-pink'
                        : t.priority === 'high'
                          ? 'badge-amber'
                          : 'badge-cyan'
                      }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.88rem', padding: '20px 0', textAlign: 'center' }}>
              No immediate deadlines pending! Add tasks to stay on track.
            </p>
          )}
        </div>

        {/* Recently Added Notes */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#c084fc" />
              Recent Notes
            </h3>
            <Link to="/notes" style={{ fontSize: '0.82rem', color: '#c084fc', textDecoration: 'none' }}>
              Open Notes →
            </Link>
          </div>

          {data?.recentNotes?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recentNotes.map((n) => (
                <div
                  key={n._id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h5 style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.title}
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {n.subjectId?.subjectName || 'General Note'} • {new Date(n.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {n.isPinned && (
                    <span className="badge-y2k badge-purple" style={{ fontSize: '0.7rem' }}>
                      PINNED
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.88rem', padding: '20px 0', textAlign: 'center' }}>
              No notes written yet. Create notes categorized by subject.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Courses & Activity History */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Enrolled Courses Quick View */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#06b6d4" />
              Recent Courses
            </h3>
            <Link to="/courses" style={{ fontSize: '0.82rem', color: '#06b6d4', textDecoration: 'none' }}>
              All Courses →
            </Link>
          </div>

          {data?.recentCourses?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {data.recentCourses.map((c) => (
                <div
                  key={c._id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${c.color || '#a855f7'}33`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: c.color || '#a855f7',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.color || '#c084fc' }}>
                    {c.courseCode}
                  </span>
                  <h5 style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.courseName}
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {c.semester}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.88rem', padding: '20px 0', textAlign: 'center' }}>
              No courses configured. Add your first course to begin!
            </p>
          )}
        </div>

        {/* Live Activity Stream */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#ec4899" />
              Recent MongoDB Activity
            </h3>
            <Link to="/history" style={{ fontSize: '0.82rem', color: '#ec4899', textDecoration: 'none' }}>
              Full History →
            </Link>
          </div>

          {data?.recentActivities?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recentActivities.slice(0, 5).map((act) => (
                <div
                  key={act._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: act.action === 'CREATE' ? '#10b981' : act.action === 'COMPLETE' ? '#06b6d4' : '#a855f7',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 500, margin: 0 }}>
                      {act.title}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.88rem', padding: '20px 0', textAlign: 'center' }}>
              No activities logged yet.
            </p>
          )}
        </div>
      </div>

      {/* QUICK ADD MODAL */}
      <Modal
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
        title={
          modalType === 'course'
            ? 'Add New Course'
            : modalType === 'subject'
              ? 'Add New Subject'
              : modalType === 'note'
                ? 'Create Subject Note'
                : 'Add Academic Task'
        }
      >
        <form onSubmit={handleQuickAdd}>
          {/* COURSE FORM */}
          {modalType === 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={courseForm.courseName}
                  onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                  className="input-y2k"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Course Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS402"
                  value={courseForm.courseCode}
                  onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                  className="input-y2k"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={courseForm.department}
                  onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                  className="input-y2k"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Semester *</label>
                <select
                  value={courseForm.semester}
                  onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                  className="input-y2k"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              </div>
            </div>
          )}

          {/* SUBJECT FORM */}
          {modalType === 'subject' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Select Course *</label>
                <select
                  required
                  value={subjectForm.courseId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
                  className="input-y2k"
                >
                  <option value="">-- Choose Course --</option>
                  {coursesList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Management & Paging"
                  value={subjectForm.subjectName}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                  className="input-y2k"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MMP"
                  value={subjectForm.subjectCode}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                  className="input-y2k"
                />
              </div>
            </div>
          )}

          {/* NOTE FORM */}
          {modalType === 'note' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Associated Subject *</label>
                <select
                  required
                  value={noteForm.subjectId}
                  onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value })}
                  className="input-y2k"
                >
                  <option value="">-- Choose Subject --</option>
                  {subjectsList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectCode} - {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Note Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virtual Memory Architecture"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="input-y2k"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Content</label>
                <textarea
                  rows={5}
                  placeholder="Write your study notes, formulas, concepts..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="input-y2k"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. os, exam, midterm"
                  value={noteForm.tags}
                  onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                  className="input-y2k"
                />
              </div>
            </div>
          )}

          {/* TASK FORM */}
          {modalType === 'task' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Lab Exercise 3"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="input-y2k"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="input-y2k"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="input-y2k"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Subject (Optional)</label>
                <select
                  value={taskForm.subjectId}
                  onChange={(e) => setTaskForm({ ...taskForm, subjectId: e.target.value })}
                  className="input-y2k"
                >
                  <option value="">-- None --</option>
                  {subjectsList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectCode} - {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalType(null)} className="btn-y2k-outline">
              Cancel
            </button>
            <button type="submit" disabled={formSubmitting} className="btn-y2k-primary">
              {formSubmitting ? 'Saving to MongoDB...' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
