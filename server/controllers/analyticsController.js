const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Note = require('../models/Note');
const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const ActivityLog = require('../models/ActivityLog');

// Helper to format date as YYYY-MM-DD
const formatDateStr = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// GET DASHBOARD OVERVIEW STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Concurrently fetch counts and recent items
    const [
      totalCourses,
      totalSubjects,
      totalNotes,
      tasks,
      studySessions,
      habits,
      recentNotes,
      recentCourses,
      recentActivities,
    ] = await Promise.all([
      Course.countDocuments({ userId }),
      Subject.countDocuments({ userId }),
      Note.countDocuments({ userId }),
      Task.find({ userId }),
      StudySession.find({ userId, isCompleted: true }),
      Habit.find({ userId, isArchived: false }),
      Note.find({ userId })
        .populate('subjectId', 'subjectName subjectCode color')
        .sort({ updatedAt: -1 })
        .limit(5),
      Course.find({ userId }).sort({ updatedAt: -1 }).limit(4),
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(8),
    ]);

    // Tasks breakdown
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = tasks
      .filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Study Hours (Total and this week)
    const totalStudyMinutes = studySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const weeklySessions = studySessions.filter((s) => new Date(s.createdAt) >= oneWeekAgo);
    const weeklyStudyMinutes = weeklySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const weeklyStudyHours = (weeklyStudyMinutes / 60).toFixed(1);

    // Habit completion for today
    const todayStr = formatDateStr(now);
    const todayHabitCompletions = await HabitCompletion.countDocuments({
      userId,
      date: todayStr,
      completed: true,
    });

    const habitCompletionRate =
      habits.length > 0 ? Math.round((todayHabitCompletions / habits.length) * 100) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        totalSubjects,
        totalNotes,
        totalTasks: tasks.length,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        taskCompletionRate,
        totalStudyHours: Number(totalStudyHours),
        weeklyStudyHours: Number(weeklyStudyHours),
        activeHabits: habits.length,
        todayHabitsCompleted: todayHabitCompletions,
        habitCompletionRate,
      },
      upcomingDeadlines,
      recentNotes,
      recentCourses,
      recentActivities,
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]', error);
    return res.status(500).json({ success: false, message: 'Error retrieving dashboard statistics.' });
  }
};

// GET IN-DEPTH ANALYTICS
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.session.userId;

    const [courses, subjects, notes, tasks, studySessions, habits, habitCompletions] =
      await Promise.all([
        Course.find({ userId }),
        Subject.find({ userId }),
        Note.find({ userId }),
        Task.find({ userId }),
        StudySession.find({ userId, isCompleted: true }),
        Habit.find({ userId, isArchived: false }),
        HabitCompletion.find({ userId, completed: true }),
      ]);

    // Daily study hours for the last 7 days
    const last7Days = [];
    const dailyStudyMinutesMap = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDateStr(d);
      last7Days.push({
        date: dStr,
        day: dayNames[d.getDay()],
        minutes: 0,
        hours: 0,
      });
      dailyStudyMinutesMap[dStr] = 0;
    }

    studySessions.forEach((s) => {
      const sDateStr = formatDateStr(s.createdAt);
      if (dailyStudyMinutesMap[sDateStr] !== undefined) {
        dailyStudyMinutesMap[sDateStr] += s.durationMinutes || 0;
      }
    });

    const weeklyStudyChart = last7Days.map((item) => {
      const mins = dailyStudyMinutesMap[item.date] || 0;
      return {
        ...item,
        minutes: mins,
        hours: Number((mins / 60).toFixed(1)),
      };
    });

    // Task distribution by priority
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    tasks.forEach((t) => {
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    });

    // Subject breakdown with notes count
    const subjectBreakdown = await Promise.all(
      subjects.map(async (subj) => {
        const count = notes.filter((n) => String(n.subjectId) === String(subj._id)).length;
        return {
          name: subj.subjectName,
          code: subj.subjectCode,
          color: subj.color,
          notesCount: count,
        };
      })
    );

    // Productivity Score (Calculated locally from task completion %, habit consistency %, and study time)
    const taskScore = tasks.length > 0 ? (tasks.filter((t) => t.status === 'completed').length / tasks.length) * 40 : 25;
    const habitScore = habits.length > 0 ? (habitCompletions.length / (habits.length * 7 || 1)) * 30 : 20;
    const studyHoursTotal = studySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / 60;
    const studyScore = Math.min(30, studyHoursTotal * 5);
    const productivityScore = Math.min(100, Math.round(taskScore + habitScore + studyScore));

    return res.status(200).json({
      success: true,
      metrics: {
        totalCourses: courses.length,
        totalSubjects: subjects.length,
        totalNotes: notes.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'completed').length,
        totalStudyHours: Number((studyHoursTotal).toFixed(1)),
        totalFocusSessions: studySessions.length,
        activeHabits: habits.length,
        totalHabitCheckins: habitCompletions.length,
        productivityScore,
      },
      weeklyStudyChart,
      priorityCounts,
      subjectBreakdown,
    });
  } catch (error) {
    console.error('[Analytics Error]', error);
    return res.status(500).json({ success: false, message: 'Error retrieving analytics.' });
  }
};
