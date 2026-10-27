const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const ActivityLog = require('../models/ActivityLog');

// Get notes with filtering, search, and sorting
exports.getNotes = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { subjectId, courseId, search, tag, sort, pinnedOnly } = req.query;

    const query = { userId };
    if (subjectId) query.subjectId = subjectId;
    if (courseId) query.courseId = courseId;
    if (pinnedOnly === 'true') query.isPinned = true;
    if (tag) query.tags = tag;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { isPinned: -1, updatedAt: -1 };
    if (sort === 'title_asc') sortOption = { isPinned: -1, title: 1 };
    if (sort === 'title_desc') sortOption = { isPinned: -1, title: -1 };
    if (sort === 'oldest') sortOption = { isPinned: -1, createdAt: 1 };
    if (sort === 'newest') sortOption = { isPinned: -1, createdAt: -1 };

    const notes = await Note.find(query)
      .populate('subjectId', 'subjectName subjectCode color courseId')
      .populate('courseId', 'courseName courseCode color')
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving notes.' });
  }
};

// Get single note by ID
exports.getNoteById = async (req, res) => {
  try {
    const userId = req.session.userId;
    const note = await Note.findOne({ _id: req.params.id, userId })
      .populate('subjectId', 'subjectName subjectCode color')
      .populate('courseId', 'courseName courseCode color');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching note.' });
  }
};

// Create a note
exports.createNote = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, content, subjectId, courseId, tags, isPinned, color } = req.body;

    if (!title || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Note title and associated subject are required.',
      });
    }

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Determine courseId if not supplied
    const resolvedCourseId = courseId || subject.courseId;

    // Parse tags array if string
    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const note = await Note.create({
      userId,
      subjectId,
      courseId: resolvedCourseId,
      title: title.trim(),
      content: content || '',
      tags: parsedTags,
      isPinned: Boolean(isPinned),
      color: color || '#1e1b4b',
    });

    await ActivityLog.log({
      userId,
      action: 'CREATE',
      entityType: 'Note',
      entityId: note._id,
      title: `Created Note: ${note.title}`,
      description: `Added note for subject ${subject.subjectName} (${subject.subjectCode})`,
    });

    const populated = await Note.findById(note._id)
      .populate('subjectId', 'subjectName subjectCode color')
      .populate('courseId', 'courseName courseCode color');

    return res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      note: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating note.' });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, content, subjectId, courseId, tags, isPinned, color } = req.body;

    const note = await Note.findOne({ _id: req.params.id, userId });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    if (subjectId) {
      const subject = await Subject.findOne({ _id: subjectId, userId });
      if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
      note.subjectId = subjectId;
      note.courseId = courseId || subject.courseId;
    }

    if (title) note.title = title.trim();
    if (content !== undefined) note.content = content;
    if (isPinned !== undefined) note.isPinned = Boolean(isPinned);
    if (color) note.color = color;

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        note.tags = tags.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        note.tags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    await note.save();

    await ActivityLog.log({
      userId,
      action: 'UPDATE',
      entityType: 'Note',
      entityId: note._id,
      title: `Updated Note: ${note.title}`,
      description: 'Modified note content and details.',
    });

    const populated = await Note.findById(note._id)
      .populate('subjectId', 'subjectName subjectCode color')
      .populate('courseId', 'courseName courseCode color');

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      note: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating note.' });
  }
};

// Toggle pin status
exports.togglePin = async (req, res) => {
  try {
    const userId = req.session.userId;
    const note = await Note.findOne({ _id: req.params.id, userId });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    return res.status(200).json({
      success: true,
      message: note.isPinned ? 'Note pinned.' : 'Note unpinned.',
      isPinned: note.isPinned,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error toggling pin status.' });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.session.userId;
    const note = await Note.findOne({ _id: req.params.id, userId });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    await Note.findByIdAndDelete(note._id);

    await ActivityLog.log({
      userId,
      action: 'DELETE',
      entityType: 'Note',
      entityId: note._id,
      title: `Deleted Note: ${note.title}`,
      description: 'Note was permanently removed.',
    });

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting note.' });
  }
};
