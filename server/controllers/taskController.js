const Task = require('../models/Task');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const ActivityLog = require('../models/ActivityLog');

// Get all tasks for user with filter & sort
exports.getTasks = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { status, priority, courseId, subjectId, search, sort } = req.query;

    const query = { userId };
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (courseId) query.courseId = courseId;
    if (subjectId) query.subjectId = subjectId;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { dueDate: 1, createdAt: -1 };
    if (sort === 'priority') sortOption = { priority: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const tasks = await Task.find(query)
      .populate('courseId', 'courseName courseCode color')
      .populate('subjectId', 'subjectName subjectCode color')
      .sort(sortOption);

    // Calculate counts
    const totalCount = await Task.countDocuments({ userId });
    const pendingCount = await Task.countDocuments({ userId, status: 'pending' });
    const inProgressCount = await Task.countDocuments({ userId, status: 'in-progress' });
    const completedCount = await Task.countDocuments({ userId, status: 'completed' });

    return res.status(200).json({
      success: true,
      tasks,
      counts: {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving tasks.' });
  }
};

// Create a task
exports.createTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, description, courseId, subjectId, priority, dueDate, status } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    // Verify course & subject if provided
    let verifiedCourseId = null;
    let verifiedSubjectId = null;

    if (courseId) {
      const course = await Course.findOne({ _id: courseId, userId });
      if (course) verifiedCourseId = course._id;
    }

    if (subjectId) {
      const subject = await Subject.findOne({ _id: subjectId, userId });
      if (subject) {
        verifiedSubjectId = subject._id;
        if (!verifiedCourseId) verifiedCourseId = subject.courseId;
      }
    }

    const task = await Task.create({
      userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      courseId: verifiedCourseId,
      subjectId: verifiedSubjectId,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || 'pending',
    });

    await ActivityLog.log({
      userId,
      action: 'CREATE',
      entityType: 'Task',
      entityId: task._id,
      title: `Added Task: ${task.title}`,
      description: `Priority: ${task.priority}${task.dueDate ? ` | Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}`,
    });

    const populated = await Task.findById(task._id)
      .populate('courseId', 'courseName courseCode color')
      .populate('subjectId', 'subjectName subjectCode color');

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating task.' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, description, courseId, subjectId, priority, dueDate, status } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (courseId !== undefined) task.courseId = courseId || null;
    if (subjectId !== undefined) task.subjectId = subjectId || null;

    if (status) {
      const prevStatus = task.status;
      task.status = status;
      if (status === 'completed' && prevStatus !== 'completed') {
        task.completedAt = new Date();
        await ActivityLog.log({
          userId,
          action: 'COMPLETE',
          entityType: 'Task',
          entityId: task._id,
          title: `Completed Task: ${task.title}`,
          description: 'Great job completing this academic task!',
        });
      } else if (status !== 'completed') {
        task.completedAt = null;
      }
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('courseId', 'courseName courseCode color')
      .populate('subjectId', 'subjectName subjectCode color');

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating task.' });
  }
};

// Toggle task status
exports.toggleStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const task = await Task.findOne({ _id: req.params.id, userId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (task.status === 'completed') {
      task.status = 'pending';
      task.completedAt = null;
    } else {
      task.status = 'completed';
      task.completedAt = new Date();
      await ActivityLog.log({
        userId,
        action: 'COMPLETE',
        entityType: 'Task',
        entityId: task._id,
        title: `Completed Task: ${task.title}`,
        description: 'Task marked as done.',
      });
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('courseId', 'courseName courseCode color')
      .populate('subjectId', 'subjectName subjectCode color');

    return res.status(200).json({
      success: true,
      message: `Task marked as ${task.status}.`,
      task: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error toggling task.' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    const task = await Task.findOne({ _id: req.params.id, userId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await Task.findByIdAndDelete(task._id);

    await ActivityLog.log({
      userId,
      action: 'DELETE',
      entityType: 'Task',
      entityId: task._id,
      title: `Deleted Task: ${task.title}`,
      description: 'Task was removed.',
    });

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting task.' });
  }
};
