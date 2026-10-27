const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const ActivityLog = require('../models/ActivityLog');

// Helper to format date as YYYY-MM-DD in local time
const formatDateStr = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate streak from sorted date strings (descending)
const calculateStreaks = (datesSet) => {
  if (datesSet.size === 0) return { currentStreak: 0, longestStreak: 0 };

  const todayStr = formatDateStr(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  // Check current streak
  let currentStreak = 0;
  let checkDate = new Date();

  // If today isn't done yet, check if yesterday was done to keep streak alive
  if (!datesSet.has(todayStr)) {
    if (datesSet.has(yesterdayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      currentStreak = 0;
      checkDate = null;
    }
  }

  if (checkDate) {
    while (true) {
      const dStr = formatDateStr(checkDate);
      if (datesSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  const sortedDates = Array.from(datesSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevTime = null;

  for (const dStr of sortedDates) {
    const curTime = new Date(dStr).getTime();
    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curTime - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevTime = curTime;
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
};

// Get all habits with calculated streaks, weekly stats, and recent completions
exports.getHabits = async (req, res) => {
  try {
    const userId = req.session.userId;
    const habits = await Habit.find({ userId, isArchived: false }).sort({ createdAt: -1 }).lean();

    const todayStr = formatDateStr(new Date());

    // Generate array of past 7 days strings
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(formatDateStr(d));
    }

    // Generate array of past 30 days strings for calendar grid
    const past30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past30Days.push(formatDateStr(d));
    }

    const habitsWithMetrics = await Promise.all(
      habits.map(async (habit) => {
        // Find all completions for this habit
        const completions = await HabitCompletion.find({
          userId,
          habitId: habit._id,
          completed: true,
        }).lean();

        const datesSet = new Set(completions.map((c) => c.date));
        const { currentStreak, longestStreak } = calculateStreaks(datesSet);

        // Weekly completions
        const weeklyCompletedCount = past7Days.filter((d) => datesSet.has(d)).length;
        const weeklyPercentage = Math.round((weeklyCompletedCount / 7) * 100);

        // Completed today?
        const isCompletedToday = datesSet.has(todayStr);

        // Completion map for past 30 days
        const history30Days = past30Days.map((d) => ({
          date: d,
          completed: datesSet.has(d),
        }));

        return {
          ...habit,
          currentStreak,
          longestStreak,
          weeklyCompletedCount,
          weeklyPercentage,
          isCompletedToday,
          history30Days,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: habitsWithMetrics.length,
      today: todayStr,
      habits: habitsWithMetrics,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving habits.' });
  }
};

// Create a habit
exports.createHabit = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, description, category, targetDaysPerWeek, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Habit name is required.' });
    }

    const habit = await Habit.create({
      userId,
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category || 'Study',
      targetDaysPerWeek: Number(targetDaysPerWeek) || 7,
      color: color || '#ec4899',
    });

    await ActivityLog.log({
      userId,
      action: 'CREATE',
      entityType: 'Habit',
      entityId: habit._id,
      title: `New Habit: ${habit.name}`,
      description: `Category: ${habit.category} | Target: ${habit.targetDaysPerWeek} days/week`,
    });

    return res.status(201).json({
      success: true,
      message: 'Habit created successfully.',
      habit: {
        ...habit.toObject(),
        currentStreak: 0,
        longestStreak: 0,
        weeklyPercentage: 0,
        isCompletedToday: false,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating habit.' });
  }
};

// Toggle completion for a habit on a given date (defaults to today)
exports.toggleCompletion = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { date, notes } = req.body;

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found.' });
    }

    const targetDate = date || formatDateStr(new Date());

    const existing = await HabitCompletion.findOne({
      userId,
      habitId: habit._id,
      date: targetDate,
    });

    let completed = false;

    if (existing) {
      if (existing.completed) {
        existing.completed = false;
        await existing.save();
        completed = false;
      } else {
        existing.completed = true;
        await existing.save();
        completed = true;
      }
    } else {
      await HabitCompletion.create({
        userId,
        habitId: habit._id,
        date: targetDate,
        completed: true,
        notes: notes || '',
      });
      completed = true;
    }

    if (completed) {
      await ActivityLog.log({
        userId,
        action: 'COMPLETE',
        entityType: 'Habit',
        entityId: habit._id,
        title: `Habit Check-in: ${habit.name}`,
        description: `Marked complete for ${targetDate}`,
      });
    }

    // Recompute streaks
    const allCompletions = await HabitCompletion.find({
      userId,
      habitId: habit._id,
      completed: true,
    }).lean();

    const datesSet = new Set(allCompletions.map((c) => c.date));
    const streaks = calculateStreaks(datesSet);

    return res.status(200).json({
      success: true,
      completed,
      date: targetDate,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      message: completed ? `Habit marked done for ${targetDate}!` : `Habit unchecked for ${targetDate}.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error toggling habit.' });
  }
};

// Update habit
exports.updateHabit = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, description, category, targetDaysPerWeek, color } = req.body;

    const habit = await Habit.findOne({ _id: req.params.id, userId });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found.' });
    }

    if (name) habit.name = name.trim();
    if (description !== undefined) habit.description = description.trim();
    if (category) habit.category = category;
    if (targetDaysPerWeek !== undefined) habit.targetDaysPerWeek = Number(targetDaysPerWeek);
    if (color) habit.color = color;

    await habit.save();

    return res.status(200).json({
      success: true,
      message: 'Habit updated successfully.',
      habit,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating habit.' });
  }
};

// Delete habit and completions
exports.deleteHabit = async (req, res) => {
  try {
    const userId = req.session.userId;
    const habit = await Habit.findOne({ _id: req.params.id, userId });

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found.' });
    }

    await HabitCompletion.deleteMany({ habitId: habit._id, userId });
    await Habit.findByIdAndDelete(habit._id);

    await ActivityLog.log({
      userId,
      action: 'DELETE',
      entityType: 'Habit',
      entityId: habit._id,
      title: `Deleted Habit: ${habit.name}`,
      description: 'Habit and past completion logs were removed.',
    });

    return res.status(200).json({
      success: true,
      message: 'Habit deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting habit.' });
  }
};
