const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: String,
      required: [true, 'Semester or academic year is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    instructor: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      default: '#a855f7', // neon purple default
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and courseCode
courseSchema.index({ userId: 1, courseCode: 1 });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
