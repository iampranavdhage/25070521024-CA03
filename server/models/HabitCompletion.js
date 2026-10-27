const mongoose = require('mongoose');

const habitCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for fast, timezone-safe daily queries
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so only one record exists per habit per day
habitCompletionSchema.index({ habitId: 1, date: 1 }, { unique: true });
habitCompletionSchema.index({ userId: 1, date: 1 });

const HabitCompletion = mongoose.model('HabitCompletion', habitCompletionSchema);
module.exports = HabitCompletion;
