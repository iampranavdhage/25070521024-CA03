import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  FolderKanban,
  User,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    description: '',
    semester: 'Semester 1',
    department: '',
    instructor: '',
    color: '#a855f7',
  });
  const [submitting, setSubmitting] = useState(false);

  // Detail view modal
  const [detailCourse, setDetailCourse] = useState(null);
  const [courseSubjects, setCourseSubjects] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, [search, selectedSemester, sortOrder]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedSemester) params.semester = selectedSemester;
      if (sortOrder) params.sort = sortOrder;

      const res = await api.get('/api/courses', params);
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      courseName: '',
      courseCode: '',
      description: '',
      semester: 'Semester 1',
      department: '',
      instructor: '',
      color: '#a855f7',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      description: course.description || '',
      semester: course.semester,
      department: course.department,
      instructor: course.instructor || '',
      color: course.color || '#a855f7',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (courseId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this course and its associated subjects and notes?')) return;

    try {
      await api.delete(`/api/courses/${courseId}`);
      fetchCourses();
    } catch (err) {
      alert(err.message || 'Error deleting course');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCourse) {
        await api.put(`/api/courses/${editingCourse._id}`, formData);
      } else {
        await api.post('/api/courses', formData);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      alert(err.message || 'Error saving course');
    } finally {
      setSubmitting(false);
    }
  };

  const openCourseDetails = async (course) => {
    try {
      const res = await api.get(`/api/courses/${course._id}`);
      if (res.success) {
        setDetailCourse(res.course);
        setCourseSubjects(res.subjects || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Editorial Kicker */}
      <div style={{ marginBottom: '8px' }}>
        <span className="editorial-kicker">
          [ CHAPTER 02 // CURRICULUM ARCHITECTURE ]
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
            Courses &amp; Curriculum ({courses.length})
          </h2>
          <p style={{ color: '#57534e', fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans' }}>
            Structured academic degree programs, semester tracks, and linked subject matrices
          </p>
        </div>

        <button onClick={handleOpenAdd} className="editorial-btn-primary">
          <Plus size={16} /> Add New Course
        </button>
      </div>

      {/* Sticky Search & Filter Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by course name, code, or department..."
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
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="input-y2k"
            style={{ width: 'auto' }}
          >
            <option value="">All Semesters</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 4">Semester 4</option>
            <option value="Semester 5">Semester 5</option>
            <option value="Semester 6">Semester 6</option>
            <option value="Semester 7">Semester 7</option>
            <option value="Semester 8">Semester 8</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-y2k"
            style={{ width: 'auto' }}
          >
            <option value="newest">Recently Added</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="code_asc">Course Code</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {courses.map((course) => (
            <div
              key={course._id}
              onClick={() => openCourseDetails(course)}
              className="glass-panel"
              style={{
                padding: '24px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: course.color || '#a855f7',
                }}
              />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, monospace',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: course.color || '#c084fc',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {course.courseCode}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => handleOpenEdit(course, e)}
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
                      title="Edit Course"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(course._id, e)}
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
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                  {course.courseName}
                </h3>

                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.86rem',
                    marginBottom: '16px',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {course.description || 'No description provided.'}
                </p>
              </div>

              {/* Meta details footer */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#64748b',
                }}
              >
                <span>{course.department} • {course.semester}</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#06b6d4',
                    fontWeight: 600,
                  }}
                >
                  <FolderKanban size={14} /> {course.subjectCount || 0} Subjects
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Courses Found"
          description={
            search || selectedSemester
              ? 'No courses matched your search or semester filter.'
              : 'You have not added any courses yet. Add your enrolled college courses to organize subjects and notes.'
          }
          actionText="Add Course"
          onAction={handleOpenAdd}
        />
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.courseCode}` : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Course Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Database Management Systems"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS302"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="input-y2k"
              />
            </div>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Department *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-y2k"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Instructor (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Prof. Alan Turing"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
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
              placeholder="Overview of syllabus, prerequisites, credit units..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Accent Color
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {['#a855f7', '#06b6d4', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'].map((color) => (
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
                    boxShadow: formData.color === color ? `0 0 10px ${color}` : 'none',
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
              {submitting ? 'Saving to MongoDB...' : editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL: SHOWS COURSE INFO & LINKED SUBJECTS */}
      <Modal
        isOpen={Boolean(detailCourse)}
        onClose={() => setDetailCourse(null)}
        title={detailCourse ? `${detailCourse.courseCode} — ${detailCourse.courseName}` : 'Course Details'}
        maxWidth="680px"
      >
        {detailCourse && (
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: '20px',
              }}
            >
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '12px' }}>
                {detailCourse.description || 'No detailed syllabus description.'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <span><strong>Department:</strong> {detailCourse.department}</span>
                <span><strong>Semester:</strong> {detailCourse.semester}</span>
                {detailCourse.instructor && <span><strong>Instructor:</strong> {detailCourse.instructor}</span>}
                <span><strong>Added on:</strong> {new Date(detailCourse.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', color: '#06b6d4', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderKanban size={16} /> Subjects Under This Course ({courseSubjects.length})
            </h4>

            {courseSubjects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {courseSubjects.map((s) => (
                  <div
                    key={s._id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(16, 16, 28, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color || '#22d3ee' }}>
                        {s.subjectCode}
                      </span>
                      <h5 style={{ fontSize: '0.9rem', color: '#ffffff', margin: '2px 0 0 0' }}>
                        {s.subjectName}
                      </h5>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {s.credits} Credits • {s.semester}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                No subjects created under this course yet. Go to the Subjects page to add units.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CoursesPage;
