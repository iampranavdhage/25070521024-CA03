import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('dueDate');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    subjectId: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, search, sortOrder]);

  const fetchMetadata = async () => {
    try {
      const [cRes, sRes] = await Promise.all([api.get('/api/courses'), api.get('/api/subjects')]);
      if (cRes.success) setCourses(cRes.courses);
      if (sRes.success) setSubjects(sRes.subjects);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (search) params.search = search;
      if (sortOrder) params.sort = sortOrder;

      const res = await api.get('/api/tasks', params);
      if (res.success) {
        setTasks(res.tasks);
        if (res.counts) setCounts(res.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      courseId: courses[0]?._id || '',
      subjectId: subjects[0]?._id || '',
      priority: 'medium',
      dueDate: '',
      status: 'pending',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      courseId: task.courseId?._id || task.courseId || '',
      subjectId: task.subjectId?._id || task.subjectId || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (taskId) => {
    try {
      await api.patch(`/api/tasks/${taskId}/toggle`);
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Error deleting task');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/api/tasks', formData);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Error saving task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Editorial Kicker */}
      <div style={{ marginBottom: '8px' }}>
        <span className="editorial-kicker">
          [ CHAPTER 05 // DELIVERABLES &amp; TASKS ]
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
            Academic Tasks &amp; Deadlines
          </h2>
          <p style={{ color: '#57534e', fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans' }}>
            Track coursework deliverables, lab submissions, study goals, and exam countdowns
          </p>
        </div>

        <button onClick={handleOpenAdd} className="editorial-btn-primary">
          <Plus size={16} /> Add New Task
        </button>
      </div>

      {/* Status Counters Tab Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div
          onClick={() => setStatusFilter('all')}
          className="glass-panel"
          style={{
            padding: '16px',
            cursor: 'pointer',
            border: statusFilter === 'all' ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>All Tasks</span>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{counts.total}</h4>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className="glass-panel"
          style={{
            padding: '16px',
            cursor: 'pointer',
            border: statusFilter === 'pending' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Pending</span>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{counts.pending}</h4>
        </div>

        <div
          onClick={() => setStatusFilter('in-progress')}
          className="glass-panel"
          style={{
            padding: '16px',
            cursor: 'pointer',
            border: statusFilter === 'in-progress' ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#06b6d4' }}>In Progress</span>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06b6d4' }}>{counts.inProgress}</h4>
        </div>

        <div
          onClick={() => setStatusFilter('completed')}
          className="glass-panel"
          style={{
            padding: '16px',
            cursor: 'pointer',
            border: statusFilter === 'completed' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Completed</span>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{counts.completed}</h4>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Search tasks..."
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

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-y2k"
            style={{ width: 'auto' }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-y2k"
            style={{ width: 'auto' }}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="newest">Recently Created</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {tasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => (
            <div
              key={task._id}
              className="glass-panel"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                borderLeft:
                  task.priority === 'urgent'
                    ? '4px solid #ef4444'
                    : task.priority === 'high'
                    ? '4px solid #f59e0b'
                    : '4px solid #06b6d4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                {/* Complete checkbox */}
                <button
                  onClick={() => handleToggleStatus(task._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: task.status === 'completed' ? '#10b981' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  title={task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle size={22} color="#10b981" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                <div style={{ minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: task.status === 'completed' ? '#94a3b8' : '#ffffff',
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                      {task.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {task.subjectId && (
                      <span style={{ color: task.subjectId.color || '#06b6d4' }}>
                        {task.subjectId.subjectCode} — {task.subjectId.subjectName}
                      </span>
                    )}
                    {task.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges and actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  className={`badge-y2k ${
                    task.priority === 'urgent'
                      ? 'badge-pink'
                      : task.priority === 'high'
                      ? 'badge-amber'
                      : task.priority === 'medium'
                      ? 'badge-cyan'
                      : 'badge-purple'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  onClick={() => handleOpenEdit(task)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    borderRadius: '6px',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                  title="Edit Task"
                >
                  <Edit2 size={15} />
                </button>

                <button
                  onClick={() => handleDelete(task._id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: 'none',
                    borderRadius: '6px',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f87171',
                    cursor: 'pointer',
                  }}
                  title="Delete Task"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Found"
          description={
            statusFilter !== 'all' || search
              ? 'No tasks match current filter criteria.'
              : 'Keep track of all assignments, homework, and academic deliverables directly in MongoDB.'
          }
          actionText="Add Task"
          onAction={handleOpenAdd}
        />
      )}

      {/* CREATE / EDIT TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Dijkstra Algorithm in C++"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Include submission portal details, assignment requirements, notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-y2k"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-y2k"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-y2k"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-y2k"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Associated Subject
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="input-y2k"
              >
                <option value="">-- Optional --</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectCode} — {s.subjectName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-y2k-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-y2k-primary">
              {submitting ? 'Saving to MongoDB...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
