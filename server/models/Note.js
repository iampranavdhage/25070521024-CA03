const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Associated subject is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#1e1b4b', // deep indigo/purple
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ userId: 1, subjectId: 1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
