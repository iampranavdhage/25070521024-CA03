const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Study', 'Coding', 'Reading', 'Health', 'Revision', 'General'],
      default: 'Study',
    },
    targetDaysPerWeek: {
      type: Number,
      default: 7,
      min: 1,
      max: 7,
    },
    color: {
      type: String,
      default: '#ec4899', // neon pink default
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

habitSchema.index({ userId: 1, isArchived: 1 });

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;
