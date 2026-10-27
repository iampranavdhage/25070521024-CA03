const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Note = require('../models/Note');
const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      confirmPassword,
      phone,
      collegeName,
      courseDegree,
      branchDept,
      academicYear,
      dob,
      termsAccepted,
      securityQuestion,
      securityAnswer,
    } = req.body;

    // Required fields validation
    if (!fullName || !username || !email || !password || !confirmPassword || !collegeName || !courseDegree || !branchDept || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate username
    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken. Please choose another.',
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Hash security answer if provided
    let securityAnswerHash = '';
    if (securityAnswer) {
      securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), salt);
    }

    // Create user in MongoDB
    const user = await User.create({
      fullName: fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      phone: phone ? phone.trim() : '',
      collegeName: collegeName.trim(),
      courseDegree: courseDegree.trim(),
      branchDept: branchDept.trim(),
      academicYear: academicYear.trim(),
      dob: dob ? new Date(dob) : null,
      termsAccepted: Boolean(termsAccepted),
      securityQuestion: securityQuestion || 'What was your first school name or favorite subject?',
      securityAnswerHash,
    });

    // Auto-login: assign session
    req.session.userId = user._id;
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // default 24h

    // Log Activity
    await ActivityLog.log({
      userId: user._id,
      action: 'REGISTER',
      entityType: 'Auth',
      entityId: user._id,
      title: 'Account Created',
      description: `Welcome to UNSTOP, ${user.fullName}! Your academic workspace is ready.`,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to UNSTOP.',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[Signup Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query by username or email
    const user = await User.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
      });
    }

    // Verify bcrypt hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
      });
    }

    // Establish session
    req.session.userId = user._id;

    // Remember Me: 30 days vs 24 hours
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    }

    // Log activity
    await ActivityLog.log({
      userId: user._id,
      action: 'LOGIN',
      entityType: 'Auth',
      entityId: user._id,
      title: 'Logged In',
      description: `User signed in from session. Remember Me: ${rememberMe ? 'Active (30 days)' : 'Standard (24 hrs)'}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (userId) {
      await ActivityLog.log({
        userId,
        action: 'LOGOUT',
        entityType: 'Auth',
        entityId: userId,
        title: 'Logged Out',
        description: 'Session ended safely.',
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Could not log out. Please try again.',
        });
      }
      res.clearCookie('unstop_sid');
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during logout.',
    });
  }
};

// GET CURRENT LOGGED IN USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session invalid or user not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile.',
    });
  }
};

// FORGOT PASSWORD - STEP 1: GET SECURITY QUESTION FOR IDENTIFIER
exports.getSecurityQuestion = async (req, res) => {
  try {
    const { identifier } = req.query;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide your username or email.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this username or email.',
      });
    }

    return res.status(200).json({
      success: true,
      username: user.username,
      securityQuestion: user.securityQuestion || 'What was your first school name or favorite subject?',
      hasSecurityAnswer: Boolean(user.securityAnswerHash),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// FORGOT PASSWORD - STEP 2: RESET PASSWORD LOCAL RECOVERY WORKFLOW
exports.resetPassword = async (req, res) => {
  try {
    const { identifier, securityAnswer, newPassword, confirmPassword } = req.body;

    if (!identifier || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.',
      });
    }

    // If user has a security answer configured, verify it
    if (user.securityAnswerHash) {
      if (!securityAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Please answer your security recovery question.',
        });
      }
      const isAnswerCorrect = await user.compareSecurityAnswer(securityAnswer);
      if (!isAnswerCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect security answer. Password reset denied.',
        });
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await ActivityLog.log({
      userId: user._id,
      action: 'UPDATE',
      entityType: 'Auth',
      entityId: user._id,
      title: 'Password Reset',
      description: 'Account password was reset via local security verification.',
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const {
      fullName,
      username,
      phone,
      collegeName,
      courseDegree,
      branchDept,
      academicYear,
      dob,
      preferences,
      securityQuestion,
      securityAnswer,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if new username is requested and available
    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await User.findOne({ username: cleanUsername });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Username is already taken.' });
      }
      user.username = cleanUsername;
    }

    if (fullName) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (collegeName) user.collegeName = collegeName.trim();
    if (courseDegree) user.courseDegree = courseDegree.trim();
    if (branchDept) user.branchDept = branchDept.trim();
    if (academicYear) user.academicYear = academicYear.trim();
    if (dob) user.dob = new Date(dob);
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (securityQuestion) user.securityQuestion = securityQuestion;
    if (securityAnswer) {
      const salt = await bcrypt.genSalt(10);
      user.securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), salt);
    }

    await user.save();

    await ActivityLog.log({
      userId,
      action: 'UPDATE',
      entityType: 'Profile',
      entityId: userId,
      title: 'Profile Updated',
      description: 'Academic and personal details were updated.',
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error updating profile.' });
  }
};

// CHANGE PASSWORD (AUTHENTICATED)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all password fields.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(userId);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await ActivityLog.log({
      userId,
      action: 'UPDATE',
      entityType: 'Auth',
      entityId: userId,
      title: 'Password Changed',
      description: 'Password was updated successfully from user settings.',
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error changing password.' });
  }
};

// DELETE ACCOUNT (AND ALL USER DATA)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide password to confirm deletion.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Account deletion aborted.' });
    }

    // Clean up all user associated collections
    await Promise.all([
      Course.deleteMany({ userId }),
      Subject.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      StudySession.deleteMany({ userId }),
      Habit.deleteMany({ userId }),
      HabitCompletion.deleteMany({ userId }),
      ActivityLog.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    req.session.destroy(() => {
      res.clearCookie('unstop_sid');
      return res.status(200).json({
        success: true,
        message: 'Account and all associated academic data have been permanently deleted.',
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting account.' });
  }
};
