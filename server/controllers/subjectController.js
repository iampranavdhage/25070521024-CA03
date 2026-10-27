const Subject = require('../models/Subject');
const Course = require('../models/Course');
const Note = require('../models/Note');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// Get all subjects for logged-in user
exports.getSubjects = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { courseId, search, semester } = req.query;

    const query = { userId };
    if (courseId) query.courseId = courseId;
    if (semester) query.semester = semester;
    if (search) {
      query.$or = [
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(query)
      .populate('courseId', 'courseName courseCode color')
      .sort({ createdAt: -1 })
      .lean();

    // Attach noteCount and taskCount
    const subjectsWithCounts = await Promise.all(
      subjects.map(async (subj) => {
        const noteCount = await Note.countDocuments({ userId, subjectId: subj._id });
        const taskCount = await Task.countDocuments({ userId, subjectId: subj._id });
        return {
          ...subj,
          noteCount,
          taskCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: subjectsWithCounts.length,
      subjects: subjectsWithCounts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving subjects.' });
  }
};

// Get single subject with its notes and tasks
exports.getSubjectById = async (req, res) => {
  try {
    const userId = req.session.userId;
    const subject = await Subject.findOne({ _id: req.params.id, userId }).populate(
      'courseId',
      'courseName courseCode color department'
    );

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const notes = await Note.find({ userId, subjectId: subject._id }).sort({ isPinned: -1, updatedAt: -1 });
    const tasks = await Task.find({ userId, subjectId: subject._id }).sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      subject,
      notes,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching subject details.' });
  }
};

// Create a subject
exports.createSubject = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { courseId, subjectName, subjectCode, semester, description, color, credits } = req.body;

    if (!courseId || !subjectName || !subjectCode || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Course, subject name, subject code, and semester are required.',
      });
    }

    // Verify course belongs to user
    const course = await Course.findOne({ _id: courseId, userId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    const subject = await Subject.create({
      userId,
      courseId,
      subjectName: subjectName.trim(),
      subjectCode: subjectCode.trim().toUpperCase(),
      semester: semester.trim(),
      description: description ? description.trim() : '',
      color: color || '#06b6d4',
      credits: Number(credits) || 3,
    });

    await ActivityLog.log({
      userId,
      action: 'CREATE',
      entityType: 'Subject',
      entityId: subject._id,
      title: `Added Subject: ${subject.subjectCode}`,
      description: `${subject.subjectName} added under course ${course.courseCode}`,
    });

    const populated = await Subject.findById(subject._id).populate('courseId', 'courseName courseCode color');

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      subject: { ...populated.toObject(), noteCount: 0, taskCount: 0 },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating subject.' });
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { courseId, subjectName, subjectCode, semester, description, color, credits } = req.body;

    const subject = await Subject.findOne({ _id: req.params.id, userId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    if (courseId) {
      const course = await Course.findOne({ _id: courseId, userId });
      if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
      subject.courseId = courseId;
    }

    if (subjectName) subject.subjectName = subjectName.trim();
    if (subjectCode) subject.subjectCode = subjectCode.trim().toUpperCase();
    if (semester) subject.semester = semester.trim();
    if (description !== undefined) subject.description = description.trim();
    if (color) subject.color = color;
    if (credits !== undefined) subject.credits = Number(credits);

    await subject.save();

    await ActivityLog.log({
      userId,
      action: 'UPDATE',
      entityType: 'Subject',
      entityId: subject._id,
      title: `Updated Subject: ${subject.subjectCode}`,
      description: `Updated subject details for ${subject.subjectName}`,
    });

    const populated = await Subject.findById(subject._id).populate('courseId', 'courseName courseCode color');
    const noteCount = await Note.countDocuments({ userId, subjectId: subject._id });
    const taskCount = await Task.countDocuments({ userId, subjectId: subject._id });

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      subject: { ...populated.toObject(), noteCount, taskCount },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating subject.' });
  }
};

// Delete subject and associated notes
exports.deleteSubject = async (req, res) => {
  try {
    const userId = req.session.userId;
    const subject = await Subject.findOne({ _id: req.params.id, userId });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await Note.deleteMany({ subjectId: subject._id, userId });
    await Task.updateMany({ subjectId: subject._id, userId }, { $unset: { subjectId: 1 } });
    await Subject.findByIdAndDelete(subject._id);

    await ActivityLog.log({
      userId,
      action: 'DELETE',
      entityType: 'Subject',
      entityId: subject._id,
      title: `Deleted Subject: ${subject.subjectCode}`,
      description: `Subject ${subject.subjectName} and its notes were removed.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Subject and its notes deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting subject.' });
  }
};
