const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ['focus', 'pomodoro', 'exam-prep', 'review', 'assignment', 'lecture', 'general'],
      default: 'focus',
    },
    dayOfWeek: {
      type: String, // 'Monday', 'Tuesday', ...
      default: '',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 25,
    },
    goals: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    examDate: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

studySessionSchema.index({ userId: 1, startTime: -1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);
module.exports = StudySession;
