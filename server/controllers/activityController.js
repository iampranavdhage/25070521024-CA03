const ActivityLog = require('../models/ActivityLog');

// Get activity logs for logged in user
exports.getActivities = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { action, entityType, limit = 50 } = req.query;

    const query = { userId };
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving activity logs.' });
  }
};

// Clear activity history if desired
exports.clearActivities = async (req, res) => {
  try {
    const userId = req.session.userId;
    await ActivityLog.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: 'Activity history cleared.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error clearing activities.' });
  }
};
