import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  FileText,
  CheckSquare,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    subjectName: '',
    subjectCode: '',
    semester: 'Semester 1',
    description: '',
    color: '#06b6d4',
    credits: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  // Subject detail view modal
  const [activeSubject, setActiveSubject] = useState(null);
  const [subjectNotes, setSubjectNotes] = useState([]);
  const [subjectTasks, setSubjectTasks] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [search, selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      if (res.success) setCourses(res.courses);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCourse) params.courseId = selectedCourse;

      const res = await api.get('/api/subjects', params);
      if (res.success) {
        setSubjects(res.subjects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      courseId: courses[0]?._id || '',
      subjectName: '',
      subjectCode: '',
      semester: 'Semester 1',
      description: '',
      color: '#06b6d4',
      credits: 3,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject, e) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setFormData({
      courseId: subject.courseId?._id || subject.courseId,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      semester: subject.semester,
      description: subject.description || '',
      color: subject.color || '#06b6d4',
      credits: subject.credits || 3,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (subjectId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this subject and its associated notes?')) return;
    try {
      await api.delete(`/api/subjects/${subjectId}`);
      fetchSubjects();
    } catch (err) {
      alert(err.message || 'Error deleting subject');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId) return alert('Please select a course for this subject.');

    setSubmitting(true);
    try {
      if (editingSubject) {
        await api.put(`/api/subjects/${editingSubject._id}`, formData);
      } else {
        await api.post('/api/subjects', formData);
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      alert(err.message || 'Error saving subject');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubjectDetail = async (subject) => {
    try {
      const res = await api.get(`/api/subjects/${subject._id}`);
      if (res.success) {
        setActiveSubject(res.subject);
        setSubjectNotes(res.notes || []);
        setSubjectTasks(res.tasks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Editorial Kicker */}
      <div style={{ marginBottom: '8px' }}>
        <span className="editorial-kicker">
          [ CHAPTER 03 // SUBJECT DIRECTORY ]
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
            Subject Directory ({subjects.length})
          </h2>
          <p style={{ color: '#57534e', fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans' }}>
            Curriculum subjects associated with your registered courses and note repositories
          </p>
        </div>

        <button onClick={handleOpenAdd} className="editorial-btn-primary">
          <Plus size={16} /> Add New Subject
        </button>
      </div>

      {/* Sticky Toolbar */}
      <div
        className="editorial-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '74px',
          zIndex: 30,
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          boxShadow: '0 4px 16px rgba(28,25,23,0.04)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search by subject name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-y2k"
            style={{ paddingLeft: '38px' }}
          />
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
          />
        </div>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="input-y2k"
          style={{ width: 'auto' }}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.courseCode} — {c.courseName}
            </option>
          ))}
        </select>
      </div>

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {subjects.map((subj) => (
            <div
              key={subj._id}
              onClick={() => openSubjectDetail(subj)}
              className="glass-panel"
              style={{
                padding: '22px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: subj.color || '#06b6d4',
                }}
              />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, monospace',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: subj.color || '#22d3ee',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {subj.subjectCode}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => handleOpenEdit(subj, e)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: 'none',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        cursor: 'pointer',
                      }}
                      title="Edit Subject"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(subj._id, e)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: 'none',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f87171',
                        cursor: 'pointer',
                      }}
                      title="Delete Subject"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                  {subj.subjectName}
                </h3>

                <p style={{ color: '#06b6d4', fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>
                  Course: {subj.courseId?.courseCode ? `${subj.courseId.courseCode} — ${subj.courseId.courseName}` : 'General'}
                </p>

                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {subj.description || 'No subject summary.'}
                </p>
              </div>

              {/* Counts footer */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ color: '#64748b' }}>{subj.credits || 3} Credits</span>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#c084fc' }}>
                    <FileText size={14} /> {subj.noteCount || 0} Notes
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34d399' }}>
                    <CheckSquare size={14} /> {subj.taskCount || 0} Tasks
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No Subjects Found"
          description="Create subjects linked to your courses to write organized notes and track academic assignments."
          actionText="Add Subject"
          onAction={handleOpenAdd}
        />
      )}

      {/* CREATE / EDIT SUBJECT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? `Edit Subject: ${editingSubject.subjectCode}` : 'Add Subject to Course'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Associated Course *
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="input-y2k"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
            {courses.length === 0 && (
              <p style={{ color: '#ec4899', fontSize: '0.75rem', marginTop: '4px' }}>
                Please create a Course first before adding subjects!
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Subject Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Operating Systems"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="input-y2k"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Subject Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DOS"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                className="input-y2k"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
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
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="input-y2k"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Module outline, textbook references, lab details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Color Theme
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['#06b6d4', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'].map((color) => (
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
            <button type="submit" disabled={submitting} className="btn-y2k-cyan">
              {submitting ? 'Saving to MongoDB...' : editingSubject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL: VIEW SUBJECT NOTES & TASKS */}
      <Modal
        isOpen={Boolean(activeSubject)}
        onClose={() => setActiveSubject(null)}
        title={activeSubject ? `${activeSubject.subjectCode} — ${activeSubject.subjectName}` : 'Subject Notes & Tasks'}
        maxWidth="720px"
      >
        {activeSubject && (
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>
                {activeSubject.description || 'No subject summary.'}
              </p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <span><strong>Course:</strong> {activeSubject.courseId?.courseName}</span>
                <span><strong>Credits:</strong> {activeSubject.credits}</span>
                <span><strong>Semester:</strong> {activeSubject.semester}</span>
              </div>
            </div>

            {/* Notes Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Notes Under This Subject ({subjectNotes.length})
                </h4>
                <Link to="/notes" style={{ fontSize: '0.75rem', color: '#22d3ee' }}>
                  Go to Notes Editor →
                </Link>
              </div>

              {subjectNotes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {subjectNotes.map((note) => (
                    <div
                      key={note._id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(16, 16, 28, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{note.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No notes created for this subject yet.</p>
              )}
            </div>

            {/* Tasks Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={16} /> Tasks &amp; Homework ({subjectTasks.length})
                </h4>
                <Link to="/tasks" style={{ fontSize: '0.75rem', color: '#34d399' }}>
                  Go to Tasks Manager →
                </Link>
              </div>

              {subjectTasks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {subjectTasks.map((task) => (
                    <div
                      key={task._id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(16, 16, 28, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', color: '#ffffff' }}>{task.title}</span>
                      <span
                        className={`badge-y2k ${task.status === 'completed' ? 'badge-emerald' : 'badge-amber'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No tasks assigned to this subject.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubjectsPage;
