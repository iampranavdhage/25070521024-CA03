import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Tag,
  Edit2,
  Trash2,
  Calendar,
  FolderKanban,
  Check,
  Filter,
} from 'lucide-react';

export const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectId: '',
    courseId: '',
    tags: '',
    isPinned: false,
    color: '#1e1b4b',
  });
  const [submitting, setSubmitting] = useState(false);

  // View note modal
  const [viewingNote, setViewingNote] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [search, selectedSubject, selectedCourse, sortOrder, pinnedOnly, selectedTag]);

  const fetchMetadata = async () => {
    try {
      const [cRes, sRes] = await Promise.all([api.get('/api/courses'), api.get('/api/subjects')]);
      if (cRes.success) setCourses(cRes.courses);
      if (sRes.success) setSubjects(sRes.subjects);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedCourse) params.courseId = selectedCourse;
      if (sortOrder) params.sort = sortOrder;
      if (pinnedOnly) params.pinnedOnly = 'true';
      if (selectedTag) params.tag = selectedTag;

      const res = await api.get('/api/notes', params);
      if (res.success) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      subjectId: selectedSubject || subjects[0]?._id || '',
      courseId: selectedCourse || courses[0]?._id || '',
      tags: '',
      isPinned: false,
      color: '#1e1b4b',
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note, e) => {
    e.stopPropagation();
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      subjectId: note.subjectId?._id || note.subjectId,
      courseId: note.courseId?._id || note.courseId,
      tags: note.tags ? note.tags.join(', ') : '',
      isPinned: note.isPinned,
      color: note.color || '#1e1b4b',
    });
    setIsEditorOpen(true);
  };

  const handleTogglePin = async (noteId, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/notes/${noteId}/pin`);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await api.delete(`/api/notes/${noteId}`);
      if (viewingNote?._id === noteId) setViewingNote(null);
      fetchNotes();
    } catch (err) {
      alert(err.message || 'Error deleting note');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId) return alert('Please choose an associated subject.');

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editingNote) {
        await api.put(`/api/notes/${editingNote._id}`, payload);
      } else {
        await api.post('/api/notes', payload);
      }
      setIsEditorOpen(false);
      fetchNotes();
    } catch (err) {
      alert(err.message || 'Error saving note');
    } finally {
      setSubmitting(false);
    }
  };

  // Group notes by Subject for clear organization
  const notesBySubject = subjects.map((subj) => ({
    subject: subj,
    notes: notes.filter((n) => (n.subjectId?._id || n.subjectId) === subj._id),
  }));

  // Also collect all unique tags for filter pills
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  return (
    <div className="page-wrapper">
      {/* Editorial Kicker */}
      <div style={{ marginBottom: '8px' }}>
        <span className="editorial-kicker">
          [ CHAPTER 04 // KNOWLEDGE REPOSITORY ]
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
            Subject Notes Repository ({notes.length})
          </h2>
          <p style={{ color: '#57534e', fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans' }}>
            Structured, subject-wise academic knowledge documents stored securely in MongoDB
          </p>
        </div>

        <button onClick={handleOpenAdd} className="editorial-btn-primary">
          <Plus size={16} /> Create New Note
        </button>
      </div>

      {/* Sticky Toolbar & Filters */}
      <div
        className="editorial-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'sticky',
          top: '74px',
          zIndex: 30,
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          boxShadow: '0 4px 16px rgba(28,25,23,0.04)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search notes by title, markdown content, or tags..."
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

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-y2k"
            style={{ width: 'auto' }}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subjectCode} — {s.subjectName}
              </option>
            ))}
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-y2k"
            style={{ width: 'auto' }}
          >
            <option value="newest">Recently Updated</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="oldest">Oldest</option>
          </select>

          {/* Pinned filter toggle */}
          <button
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className={pinnedOnly ? 'btn-y2k-primary' : 'btn-y2k-outline'}
            style={{ padding: '9px 14px', fontSize: '0.85rem' }}
          >
            <Pin size={15} /> {pinnedOnly ? 'Pinned Only' : 'Show Pinned'}
          </button>
        </div>

        {/* Tag pills bar */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={12} /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className={`badge-y2k ${!selectedTag ? 'badge-purple' : 'badge-cyan'}`}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`badge-y2k ${selectedTag === tag ? 'badge-pink' : 'badge-purple'}`}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {notes.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {notes.map((note) => (
            <div
              key={note._id}
              onClick={() => setViewingNote(note)}
              className="glass-panel"
              style={{
                padding: '22px',
                cursor: 'pointer',
                borderLeft: note.isPinned ? '3px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: note.subjectId?.color || '#06b6d4',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {note.subjectId?.subjectCode || 'General'}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => handleTogglePin(note._id, e)}
                      style={{
                        background: note.isPinned ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        border: 'none',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: note.isPinned ? '#ec4899' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                      title={note.isPinned ? 'Unpin' : 'Pin Note'}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      onClick={(e) => handleOpenEdit(note, e)}
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
                      title="Edit Note"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(note._id, e)}
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
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                  {note.title}
                </h3>

                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.86rem',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {note.content || 'Empty note content.'}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {note.tags.map((t) => (
                      <span key={t} className="badge-y2k badge-purple" style={{ fontSize: '0.68rem' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: '#64748b',
                }}
              >
                <span>{note.subjectId?.subjectName || 'Subject Note'}</span>
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Notes Found"
          description={
            search || selectedSubject
              ? 'No notes match your filters.'
              : 'Keep all your subject notes, revision sheets, and exam highlights neatly stored here in MongoDB.'
          }
          actionText="Create Note"
          onAction={handleOpenAdd}
        />
      )}

      {/* CREATE / EDIT NOTE MODAL */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingNote ? `Edit Note: ${editingNote.title}` : 'Create New Note'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Associated Subject *
            </label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="input-y2k"
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} — {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Note Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Theorem & Asymptotic Analysis"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Note Content *
            </label>
            <textarea
              rows={9}
              required
              placeholder="Write your study notes, formulas, lecture summaries, markdown notes..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-y2k"
              style={{ fontFamily: 'inherit', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. algorithms, complexity, midterm"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-y2k"
              />
            </div>

            <div style={{ paddingTop: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Pin to top</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsEditorOpen(false)} className="btn-y2k-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-y2k-primary">
              {submitting ? 'Saving to MongoDB...' : editingNote ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW NOTE DETAIL MODAL */}
      <Modal
        isOpen={Boolean(viewingNote)}
        onClose={() => setViewingNote(null)}
        title={viewingNote?.title || 'View Note'}
        maxWidth="720px"
      >
        {viewingNote && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                marginBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span className="badge-y2k badge-cyan">
                {viewingNote.subjectId?.subjectCode} — {viewingNote.subjectId?.subjectName}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Updated: {new Date(viewingNote.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <div
              style={{
                background: 'rgba(10, 10, 20, 0.5)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                maxHeight: '400px',
                overflowY: 'auto',
                marginBottom: '18px',
              }}
            >
              {viewingNote.content}
            </div>

            {viewingNote.tags && viewingNote.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {viewingNote.tags.map((t) => (
                  <span key={t} className="badge-y2k badge-purple">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={(e) => {
                  setViewingNote(null);
                  handleOpenEdit(viewingNote, e);
                }}
                className="btn-y2k-primary"
              >
                <Edit2 size={16} /> Edit Note
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotesPage;
