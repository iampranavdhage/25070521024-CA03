const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      match: [/^[a-zA-Z0-9_.-]+$/, 'Username can only contain alphanumeric characters, dots, dashes, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    courseDegree: {
      type: String,
      required: [true, 'Course or degree is required'],
      trim: true,
    },
    branchDept: {
      type: String,
      required: [true, 'Branch or department is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Current academic year is required'],
      trim: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    termsAccepted: {
      type: Boolean,
      required: [true, 'Terms and conditions must be accepted'],
      default: true,
    },
    securityQuestion: {
      type: String,
      default: 'What was your first school name or favorite subject?',
    },
    securityAnswerHash: {
      type: String,
      default: '',
    },
    preferences: {
      theme: { type: String, default: 'dark-y2k' },
      pomodoroFocusTime: { type: Number, default: 25 },
      pomodoroShortBreak: { type: Number, default: 5 },
      pomodoroLongBreak: { type: Number, default: 15 },
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to verify security answer
userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  if (!this.securityAnswerHash) return false;
  return bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswerHash);
};

// Sanitize user object when returned to client (never expose passwordHash or securityAnswerHash)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.securityAnswerHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
