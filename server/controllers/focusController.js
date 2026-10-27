const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');
const ActivityLog = require('../models/ActivityLog');

// Get focus history and metrics
exports.getFocusStats = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Retrieve all completed focus sessions
    const completedSessions = await StudySession.find({
      userId,
      isCompleted: true,
      sessionType: { $in: ['focus', 'pomodoro'] },
    })
      .populate('subjectId', 'subjectName subjectCode color')
      .sort({ createdAt: -1 });

    // Calculate total minutes
    const totalMinutes = completedSessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Calculate today's focus minutes
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySessions = completedSessions.filter((s) => new Date(s.createdAt) >= startOfToday);
    const todayMinutes = todaySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

    return res.status(200).json({
      success: true,
      totalSessions: completedSessions.length,
      totalMinutes,
      totalHours: Number(totalHours),
      todayMinutes,
      recentHistory: completedSessions.slice(0, 15),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving focus statistics.' });
  }
};

// Record completed focus session in MongoDB
exports.recordCompletedSession = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { subjectId, durationMinutes, sessionType, notes } = req.body;

    let resolvedSubject = null;
    let courseId = null;

    if (subjectId) {
      resolvedSubject = await Subject.findOne({ _id: subjectId, userId });
      if (resolvedSubject) courseId = resolvedSubject.courseId;
    }

    const duration = Number(durationMinutes) || 25;
    const title = resolvedSubject
      ? `Focus Session: ${resolvedSubject.subjectName}`
      : 'Pomodoro Focus Session';

    const session = await StudySession.create({
      userId,
      subjectId: subjectId || null,
      courseId: courseId || null,
      title,
      sessionType: sessionType || 'focus',
      durationMinutes: duration,
      startTime: new Date(Date.now() - duration * 60 * 1000),
      endTime: new Date(),
      goals: 'Completed Pomodoro timer session',
      notes: notes ? notes.trim() : '',
      isCompleted: true,
    });

    await ActivityLog.log({
      userId,
      action: 'COMPLETE',
      entityType: 'StudySession',
      entityId: session._id,
      title: `Finished ${duration}m Focus Session`,
      description: resolvedSubject
        ? `Studied ${resolvedSubject.subjectName} (${resolvedSubject.subjectCode})`
        : 'Completed focused study sprint',
    });

    const populated = await StudySession.findById(session._id).populate(
      'subjectId',
      'subjectName subjectCode color'
    );

    return res.status(201).json({
      success: true,
      message: 'Focus session saved to MongoDB.',
      session: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error saving focus session.' });
  }
};
