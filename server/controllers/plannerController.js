const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// Get all planner sessions (daily/weekly schedule & upcoming events)
exports.getSchedule = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { dayOfWeek, startDate, endDate, sessionType } = req.query;

    const query = { userId };
    if (dayOfWeek) query.dayOfWeek = dayOfWeek;
    if (sessionType) query.sessionType = sessionType;

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const sessions = await StudySession.find(query)
      .populate('subjectId', 'subjectName subjectCode color')
      .populate('courseId', 'courseName courseCode color')
      .sort({ startTime: 1, dayOfWeek: 1 });

    // Also fetch upcoming task deadlines for planner integration
    const upcomingDeadlines = await Task.find({
      userId,
      status: { $ne: 'completed' },
      dueDate: { $gte: new Date() },
    })
      .populate('subjectId', 'subjectName subjectCode color')
      .sort({ dueDate: 1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      sessions,
      upcomingDeadlines,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving planner schedule.' });
  }
};

// Create a planner session / schedule block
exports.createSession = async (req, res) => {
  try {
    const userId = req.session.userId;
    const {
      title,
      sessionType,
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes,
      subjectId,
      courseId,
      goals,
      notes,
      examDate,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Session title is required.' });
    }

    let resolvedCourseId = courseId;
    if (subjectId && !resolvedCourseId) {
      const subject = await Subject.findOne({ _id: subjectId, userId });
      if (subject) resolvedCourseId = subject.courseId;
    }

    const session = await StudySession.create({
      userId,
      title: title.trim(),
      sessionType: sessionType || 'focus',
      dayOfWeek: dayOfWeek || '',
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : null,
      durationMinutes: Number(durationMinutes) || 45,
      subjectId: subjectId || null,
      courseId: resolvedCourseId || null,
      goals: goals ? goals.trim() : '',
      notes: notes ? notes.trim() : '',
      examDate: examDate ? new Date(examDate) : null,
      isCompleted: false,
    });

    await ActivityLog.log({
      userId,
      action: 'CREATE',
      entityType: 'StudySession',
      entityId: session._id,
      title: `Scheduled Session: ${session.title}`,
      description: `${session.durationMinutes} mins scheduled for ${session.dayOfWeek || 'upcoming session'}.`,
    });

    const populated = await StudySession.findById(session._id)
      .populate('subjectId', 'subjectName subjectCode color')
      .populate('courseId', 'courseName courseCode color');

    return res.status(201).json({
      success: true,
      message: 'Study session scheduled.',
      session: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error scheduling session.' });
  }
};

// Update planner session
exports.updateSession = async (req, res) => {
  try {
    const userId = req.session.userId;
    const session = await StudySession.findOne({ _id: req.params.id, userId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const {
      title,
      sessionType,
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes,
      subjectId,
      courseId,
      goals,
      notes,
      examDate,
      isCompleted,
    } = req.body;

    if (title) session.title = title.trim();
    if (sessionType) session.sessionType = sessionType;
    if (dayOfWeek !== undefined) session.dayOfWeek = dayOfWeek;
    if (startTime) session.startTime = new Date(startTime);
    if (endTime !== undefined) session.endTime = endTime ? new Date(endTime) : null;
    if (durationMinutes !== undefined) session.durationMinutes = Number(durationMinutes);
    if (subjectId !== undefined) session.subjectId = subjectId || null;
    if (courseId !== undefined) session.courseId = courseId || null;
    if (goals !== undefined) session.goals = goals.trim();
    if (notes !== undefined) session.notes = notes.trim();
    if (examDate !== undefined) session.examDate = examDate ? new Date(examDate) : null;
    if (isCompleted !== undefined) session.isCompleted = Boolean(isCompleted);

    await session.save();

    const populated = await StudySession.findById(session._id)
      .populate('subjectId', 'subjectName subjectCode color')
      .populate('courseId', 'courseName courseCode color');

    return res.status(200).json({
      success: true,
      message: 'Session updated.',
      session: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating session.' });
  }
};

// Delete session
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.session.userId;
    const session = await StudySession.findOne({ _id: req.params.id, userId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    await StudySession.findByIdAndDelete(session._id);

    return res.status(200).json({
      success: true,
      message: 'Session removed from schedule.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting session.' });
  }
};
