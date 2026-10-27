const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['REGISTER', 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'COMPLETE'],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Auth', 'Course', 'Subject', 'Note', 'Task', 'StudySession', 'Habit', 'Profile'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

// Helper function to log activity conveniently
activityLogSchema.statics.log = async function ({ userId, action, entityType, entityId, title, description }) {
  try {
    return await this.create({
      userId,
      action,
      entityType,
      entityId: entityId || null,
      title,
      description: description || '',
    });
  } catch (err) {
    console.error('[ActivityLog Error]', err.message);
  }
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
