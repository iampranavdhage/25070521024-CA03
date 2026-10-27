const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Note = require('../models/Note');
const ActivityLog = require('../models/ActivityLog');

// Get all courses for current user with subject counts
exports.getCourses = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { search, semester, department, sort } = req.query;

    const query = { userId };

    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    if (semester) {
      query.semester = semester;
    }

    if (department) {
      query.department = department;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name_asc') sortOption = { courseName: 1 };
    if (sort === 'name_desc') sortOption = { courseName: -1 };
    if (sort === 'code_asc') sortOption = { courseCode: 1 };

    const courses = await Course.find(query).sort(sortOption).lean();

    // Attach subject count to each course
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const subjectCount = await Subject.countDocuments({ userId, courseId: course._id });
        return {
          ...course,
          subjectCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: coursesWithCounts.length,
      courses: coursesWithCounts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving courses.' });
  }
};

// Get single course by ID with subjects
exports.getCourseById = async (req, res) => {
  try {
    const userId = req.session.userId;
    const course = await Course.findOne({ _id: req.params.id, userId });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const subjects = await Subject.find({ userId, courseId: course._id }).sort({ subjectName: 1 });

    return res.status(200).json({
      success: true,
      course,
      subjects,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching course details.' });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { courseName, courseCode, description, semester, department, instructor, color } = req.body;

    if (!courseName || !courseCode || !semester || !department) {
      return res.status(400).json({
        success: false,
        message: 'Course name, code, semester, and department are required.',
      });
    }

    const course = await Course.create({
      userId,
      courseName: courseName.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      description: description ? description.trim() : '',
      semester: semester.trim(),
      department: department.trim(),
      instructor: instructor ? instructor.trim() : '',
      color: color || '#a855f7',
    });

    await ActivityLog.log({
      userId,
      action: 'CREATE',
      entityType: 'Course',
      entityId: course._id,
      title: `Created Course: ${course.courseCode}`,
      description: `${course.courseName} (${course.department}, Sem ${course.semester})`,
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course: { ...course.toObject(), subjectCount: 0 },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating course.' });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { courseName, courseCode, description, semester, department, instructor, color } = req.body;

    const course = await Course.findOne({ _id: req.params.id, userId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (courseName) course.courseName = courseName.trim();
    if (courseCode) course.courseCode = courseCode.trim().toUpperCase();
    if (description !== undefined) course.description = description.trim();
    if (semester) course.semester = semester.trim();
    if (department) course.department = department.trim();
    if (instructor !== undefined) course.instructor = instructor.trim();
    if (color) course.color = color;

    await course.save();

    await ActivityLog.log({
      userId,
      action: 'UPDATE',
      entityType: 'Course',
      entityId: course._id,
      title: `Updated Course: ${course.courseCode}`,
      description: `Updated details for ${course.courseName}`,
    });

    const subjectCount = await Subject.countDocuments({ userId, courseId: course._id });

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course: { ...course.toObject(), subjectCount },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating course.' });
  }
};

// Delete course and cascade
exports.deleteCourse = async (req, res) => {
  try {
    const userId = req.session.userId;
    const course = await Course.findOne({ _id: req.params.id, userId });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Cascade delete subjects & notes under this course
    const subjects = await Subject.find({ courseId: course._id, userId });
    const subjectIds = subjects.map((s) => s._id);

    await Note.deleteMany({ subjectId: { $in: subjectIds }, userId });
    await Subject.deleteMany({ courseId: course._id, userId });
    await Course.findByIdAndDelete(course._id);

    await ActivityLog.log({
      userId,
      action: 'DELETE',
      entityType: 'Course',
      entityId: course._id,
      title: `Deleted Course: ${course.courseCode}`,
      description: `Course ${course.courseName} and its associated subjects/notes were removed.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Course and related subjects/notes deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting course.' });
  }
};
