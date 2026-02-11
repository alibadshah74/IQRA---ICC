import User from '../models/User.js'
import Class from '../models/Class.js'
import Subject from '../models/Subject.js'
import Routine from '../models/Routine.js'
import Exam from '../models/Exam.js'
import Result from '../models/Result.js'
import Payment from '../models/Payment.js'
import Event from '../models/Event.js'
import Settings from '../models/Settings.js'

const safeUserFields = 'fullName email username role isActive rollNumber guardianName assignedClasses'

const sendSuccess = (res, message, data = null, status = 200) =>
  res.status(status).json({ success: true, message, data })

const sendError = (res, status, message) => res.status(status).json({ success: false, message, data: null })

const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

const buildTextSearch = (q, fields) => {
  if (!q) return {}
  const regex = new RegExp(q.trim(), 'i')
  return { $or: fields.map((field) => ({ [field]: regex })) }
}

const normalizeHexColor = (value) => {
  if (!value) return null
  const hex = value.trim()
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(hex)) {
    if (hex.length === 4) {
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    }
    return hex
  }
  return null
}

const sanitizeColorTheme = (value) => normalizeHexColor(value) || '#2563eb'

const requireAdmin = (req, res) => {
  if (req.user?.role !== 'admin') {
    sendError(res, 403, 'Access denied. Admins only.')
    return false
  }
  return true
}

// Admin-only: dashboard summary stats.
export const getAdminDashboardStats = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const [activeStudents, activeTeachers, activeParents, totalClasses, totalExams, totalPayments] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      User.countDocuments({ role: 'parent', isActive: true }),
      Class.countDocuments({ isActive: true }),
      Exam.countDocuments({ isActive: true }),
      Payment.countDocuments({}),
    ])

    return sendSuccess(res, 'Admin dashboard stats fetched successfully.', {
      activeStudents,
      activeTeachers,
      activeParents,
      totalClasses,
      totalExams,
      totalPayments,
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch dashboard stats.')
  }
}

// Admin-only: list classes.
export const getClasses = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { q, isActive } = req.query
    const filter = { ...buildTextSearch(q, ['className', 'section']) }
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true'

    const [total, classes] = await Promise.all([
      Class.countDocuments(filter),
      Class.find(filter)
        .populate('classTeacher', safeUserFields)
        .sort({ className: 1, section: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    const classIds = classes.map((cls) => cls._id)
    const studentCounts = classIds.length
      ? await User.aggregate([
          { $match: { role: 'student', isActive: true, assignedClasses: { $in: classIds } } },
          { $unwind: '$assignedClasses' },
          { $match: { assignedClasses: { $in: classIds } } },
          { $group: { _id: '$assignedClasses', count: { $sum: 1 } } },
        ])
      : []

    const countMap = new Map(studentCounts.map((entry) => [entry._id.toString(), entry.count]))

    const items = classes.map((cls) => ({
      ...cls,
      studentsCount: countMap.get(cls._id.toString()) || 0,
    }))

    return sendSuccess(res, 'Classes fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch classes.')
  }
}

// Admin-only: create class.
export const createClass = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { className, section, classTeacher } = req.body
    if (!className) {
      return sendError(res, 400, 'Class name is required.')
    }

    if (classTeacher) {
      const teacherExists = await User.exists({ _id: classTeacher, role: 'teacher' })
      if (!teacherExists) {
        return sendError(res, 400, 'Assigned class teacher is invalid.')
      }
    }

    const created = await Class.create({
      className: className.trim(),
      section: section?.trim(),
      classTeacher: classTeacher || undefined,
      isActive: true,
    })

    const populated = await Class.findById(created._id).populate('classTeacher', safeUserFields)
    return sendSuccess(res, 'Class created successfully.', populated, 201)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'A class with this name and section already exists.')
    }
    return sendError(res, 500, 'Failed to create class.')
  }
}

// Admin-only: update class.
export const updateClass = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const classId = req.params.id || req.params.classId || req.body.classId
    if (!classId) {
      return sendError(res, 400, 'Class id is required.')
    }

    const updates = {}
    const { className, section, classTeacher, isActive } = req.body

    if (className) updates.className = className.trim()
    if (typeof section !== 'undefined') updates.section = section?.trim()
    if (typeof isActive !== 'undefined') updates.isActive = !!isActive

    if (typeof classTeacher !== 'undefined') {
      if (!classTeacher) {
        updates.classTeacher = undefined
      } else {
        const teacherExists = await User.exists({ _id: classTeacher, role: 'teacher' })
        if (!teacherExists) {
          return sendError(res, 400, 'Assigned class teacher is invalid.')
        }
        updates.classTeacher = classTeacher
      }
    }

    const updated = await Class.findByIdAndUpdate(classId, updates, {
      new: true,
      runValidators: true,
    }).populate('classTeacher', safeUserFields)

    if (!updated) {
      return sendError(res, 404, 'Class not found.')
    }

    return sendSuccess(res, 'Class updated successfully.', updated)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'A class with this name and section already exists.')
    }
    return sendError(res, 500, 'Failed to update class.')
  }
}

// Admin-only: disable class.
export const disableClass = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const classId = req.params.id || req.params.classId || req.body.classId
    if (!classId) {
      return sendError(res, 400, 'Class id is required.')
    }

    const updated = await Class.findByIdAndUpdate(
      classId,
      { isActive: false },
      { new: true, runValidators: true },
    ).populate('classTeacher', safeUserFields)

    if (!updated) {
      return sendError(res, 404, 'Class not found.')
    }

    return sendSuccess(res, 'Class disabled successfully.', updated)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable class.')
  }
}

// Admin-only: list subjects.
export const getSubjects = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { classId, teacherId, q, isActive } = req.query

    const filter = { ...buildTextSearch(q, ['subjectName']) }
    if (classId) filter.class = classId
    if (teacherId) filter.teacher = teacherId
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true'

    const [total, subjects] = await Promise.all([
      Subject.countDocuments(filter),
      Subject.find(filter)
        .populate('class', 'className section')
        .populate('teacher', safeUserFields)
        .sort({ subjectName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Subjects fetched successfully.', {
      items: subjects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch subjects.')
  }
}

// Admin-only: create subject.
export const createSubject = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { subjectName, classId, teacherId } = req.body
    if (!subjectName || !classId) {
      return sendError(res, 400, 'Subject name and class id are required.')
    }

    const classExists = await Class.exists({ _id: classId })
    if (!classExists) {
      return sendError(res, 400, 'Class not found.')
    }

    if (teacherId) {
      const teacherExists = await User.exists({ _id: teacherId, role: 'teacher' })
      if (!teacherExists) {
        return sendError(res, 400, 'Assigned teacher is invalid.')
      }
    }

    const subject = await Subject.create({
      subjectName: subjectName.trim(),
      class: classId,
      teacher: teacherId || undefined,
      isActive: true,
    })

    const populated = await Subject.findById(subject._id)
      .populate('class', 'className section')
      .populate('teacher', safeUserFields)

    return sendSuccess(res, 'Subject created successfully.', populated, 201)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'Subject already exists for this class.')
    }
    return sendError(res, 500, 'Failed to create subject.')
  }
}

// Admin-only: update subject.
export const updateSubject = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const subjectId = req.params.id || req.params.subjectId || req.body.subjectId
    if (!subjectId) {
      return sendError(res, 400, 'Subject id is required.')
    }

    const updates = {}
    const { subjectName, classId, teacherId, isActive } = req.body

    if (subjectName) updates.subjectName = subjectName.trim()
    if (typeof isActive !== 'undefined') updates.isActive = !!isActive

    if (classId) {
      const classExists = await Class.exists({ _id: classId })
      if (!classExists) {
        return sendError(res, 400, 'Class not found.')
      }
      updates.class = classId
    }

    if (typeof teacherId !== 'undefined') {
      if (!teacherId) {
        updates.teacher = undefined
      } else {
        const teacherExists = await User.exists({ _id: teacherId, role: 'teacher' })
        if (!teacherExists) {
          return sendError(res, 400, 'Assigned teacher is invalid.')
        }
        updates.teacher = teacherId
      }
    }

    const updated = await Subject.findByIdAndUpdate(subjectId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('class', 'className section')
      .populate('teacher', safeUserFields)

    if (!updated) {
      return sendError(res, 404, 'Subject not found.')
    }

    return sendSuccess(res, 'Subject updated successfully.', updated)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'Subject already exists for this class.')
    }
    return sendError(res, 500, 'Failed to update subject.')
  }
}

// Admin-only: disable subject.
export const disableSubject = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const subjectId = req.params.id || req.params.subjectId || req.body.subjectId
    if (!subjectId) {
      return sendError(res, 400, 'Subject id is required.')
    }

    const updated = await Subject.findByIdAndUpdate(
      subjectId,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .populate('class', 'className section')
      .populate('teacher', safeUserFields)

    if (!updated) {
      return sendError(res, 404, 'Subject not found.')
    }

    return sendSuccess(res, 'Subject disabled successfully.', updated)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable subject.')
  }
}

// Admin-only: list routines.
export const getRoutines = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { classId, teacherId, isActive } = req.query

    const filter = {}
    if (classId) filter.class = classId
    if (teacherId) filter.teacher = teacherId
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true'

    const [total, routines] = await Promise.all([
      Routine.countDocuments(filter),
      Routine.find(filter)
        .populate('class', 'className section')
        .populate('subject', 'subjectName')
        .populate('teacher', safeUserFields)
        .sort({ day: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Routines fetched successfully.', {
      items: routines,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch routines.')
  }
}

// Admin-only: create routine slot.
export const createRoutine = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { classId, day, subjectId, teacherId, startTime, endTime, room } = req.body
    if (!classId || !day || !subjectId || !teacherId || !startTime || !endTime) {
      return sendError(res, 400, 'Class, day, subject, teacher, start time, and end time are required.')
    }

    const classExists = await Class.exists({ _id: classId })
    if (!classExists) {
      return sendError(res, 400, 'Class not found.')
    }

    const subjectExists = await Subject.exists({ _id: subjectId, class: classId })
    if (!subjectExists) {
      return sendError(res, 400, 'Subject is not valid for this class.')
    }

    const teacherExists = await User.exists({ _id: teacherId, role: 'teacher' })
    if (!teacherExists) {
      return sendError(res, 400, 'Teacher is invalid.')
    }

    const routine = await Routine.create({
      class: classId,
      day,
      subject: subjectId,
      teacher: teacherId,
      startTime,
      endTime,
      room: room?.trim(),
      isActive: true,
    })

    const populated = await Routine.findById(routine._id)
      .populate('class', 'className section')
      .populate('subject', 'subjectName')
      .populate('teacher', safeUserFields)

    return sendSuccess(res, 'Routine slot created successfully.', populated, 201)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'This routine slot already exists.')
    }
    return sendError(res, 500, 'Failed to create routine slot.')
  }
}

// Admin-only: update routine slot.
export const updateRoutine = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const routineId = req.params.id || req.params.routineId || req.body.routineId
    if (!routineId) {
      return sendError(res, 400, 'Routine id is required.')
    }

    const existingRoutine = await Routine.findById(routineId)
    if (!existingRoutine) {
      return sendError(res, 404, 'Routine not found.')
    }

    const updates = {}
    const { classId, day, subjectId, teacherId, startTime, endTime, room, isActive } = req.body

    if (classId) {
      const classExists = await Class.exists({ _id: classId })
      if (!classExists) {
        return sendError(res, 400, 'Class not found.')
      }
      updates.class = classId
    }

    if (subjectId) {
      const effectiveClassId = classId || existingRoutine.class
      const subjectExists = await Subject.exists({ _id: subjectId, class: effectiveClassId })
      if (!subjectExists) {
        return sendError(res, 400, 'Subject is invalid for this class.')
      }
      updates.subject = subjectId
    }

    if (teacherId) {
      const teacherExists = await User.exists({ _id: teacherId, role: 'teacher' })
      if (!teacherExists) {
        return sendError(res, 400, 'Teacher is invalid.')
      }
      updates.teacher = teacherId
    }

    if (day) updates.day = day
    if (startTime) updates.startTime = startTime
    if (endTime) updates.endTime = endTime
    if (typeof room !== 'undefined') updates.room = room?.trim()
    if (typeof isActive !== 'undefined') updates.isActive = !!isActive

    const updated = await Routine.findByIdAndUpdate(routineId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('class', 'className section')
      .populate('subject', 'subjectName')
      .populate('teacher', safeUserFields)

    return sendSuccess(res, 'Routine updated successfully.', updated)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'This routine slot already exists.')
    }
    return sendError(res, 500, 'Failed to update routine.')
  }
}

// Admin-only: disable routine slot.
export const disableRoutine = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const routineId = req.params.id || req.params.routineId || req.body.routineId
    if (!routineId) {
      return sendError(res, 400, 'Routine id is required.')
    }

    const updated = await Routine.findByIdAndUpdate(
      routineId,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .populate('class', 'className section')
      .populate('subject', 'subjectName')
      .populate('teacher', safeUserFields)

    if (!updated) {
      return sendError(res, 404, 'Routine not found.')
    }

    return sendSuccess(res, 'Routine disabled successfully.', updated)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable routine.')
  }
}

// Admin-only: list exams.
export const getExams = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { classId, isActive } = req.query

    const filter = {}
    if (classId) filter.class = classId
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true'

    const [total, exams] = await Promise.all([
      Exam.countDocuments(filter),
      Exam.find(filter)
        .populate('class', 'className section')
        .populate('subjects', 'subjectName')
        .populate('createdBy', safeUserFields)
        .sort({ examDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Exams fetched successfully.', {
      items: exams,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch exams.')
  }
}

// Admin-only: create exam.
export const createExam = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { examName, classId, subjectIds, examDate, totalMarks, gradeScale } = req.body
    if (!examName || !classId) {
      return sendError(res, 400, 'Exam name and class id are required.')
    }

    const classExists = await Class.exists({ _id: classId })
    if (!classExists) {
      return sendError(res, 400, 'Class not found.')
    }

    if (Array.isArray(subjectIds) && subjectIds.length > 0) {
      const subjectCount = await Subject.countDocuments({ _id: { $in: subjectIds }, class: classId })
      if (subjectCount !== subjectIds.length) {
        return sendError(res, 400, 'One or more subjects are invalid for this class.')
      }
    }

    const exam = await Exam.create({
      examName: examName.trim(),
      class: classId,
      subjects: Array.isArray(subjectIds) ? subjectIds : [],
      examDate: examDate ? new Date(examDate) : undefined,
      totalMarks: typeof totalMarks === 'number' ? totalMarks : undefined,
      gradeScale: gradeScale?.trim(),
      createdBy: req.user._id,
      isActive: true,
    })

    const populated = await Exam.findById(exam._id)
      .populate('class', 'className section')
      .populate('subjects', 'subjectName')
      .populate('createdBy', safeUserFields)

    return sendSuccess(res, 'Exam created successfully.', populated, 201)
  } catch (error) {
    return sendError(res, 500, 'Failed to create exam.')
  }
}

// Admin-only: update exam.
export const updateExam = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const examId = req.params.id || req.params.examId || req.body.examId
    if (!examId) {
      return sendError(res, 400, 'Exam id is required.')
    }

    const existingExam = await Exam.findById(examId)
    if (!existingExam) {
      return sendError(res, 404, 'Exam not found.')
    }

    const updates = {}
    const { examName, classId, subjectIds, examDate, totalMarks, gradeScale, isActive } = req.body

    if (examName) updates.examName = examName.trim()
    if (typeof totalMarks !== 'undefined') updates.totalMarks = totalMarks
    if (typeof gradeScale !== 'undefined') updates.gradeScale = gradeScale?.trim()
    if (typeof isActive !== 'undefined') updates.isActive = !!isActive

    if (classId) {
      const classExists = await Class.exists({ _id: classId })
      if (!classExists) {
        return sendError(res, 400, 'Class not found.')
      }
      updates.class = classId
    }

    if (Array.isArray(subjectIds)) {
      const effectiveClassId = classId || existingExam.class
      const subjectCount = await Subject.countDocuments({
        _id: { $in: subjectIds },
        class: effectiveClassId,
      })
      if (subjectCount !== subjectIds.length) {
        return sendError(res, 400, 'One or more subjects are invalid for this class.')
      }
      updates.subjects = subjectIds
    }

    if (examDate) updates.examDate = new Date(examDate)

    const updated = await Exam.findByIdAndUpdate(examId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('class', 'className section')
      .populate('subjects', 'subjectName')
      .populate('createdBy', safeUserFields)

    return sendSuccess(res, 'Exam updated successfully.', updated)
  } catch (error) {
    return sendError(res, 500, 'Failed to update exam.')
  }
}

// Admin-only: disable exam.
export const disableExam = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const examId = req.params.id || req.params.examId || req.body.examId
    if (!examId) {
      return sendError(res, 400, 'Exam id is required.')
    }

    const updated = await Exam.findByIdAndUpdate(
      examId,
      { isActive: false },
      { new: true, runValidators: true },
    )
      .populate('class', 'className section')
      .populate('subjects', 'subjectName')
      .populate('createdBy', safeUserFields)

    if (!updated) {
      return sendError(res, 404, 'Exam not found.')
    }

    return sendSuccess(res, 'Exam disabled successfully.', updated)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable exam.')
  }
}

// Admin-only: view all exam results.
export const fetchAllExamResults = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { examId, studentId, subjectId, isActive } = req.query

    const filter = {}
    if (examId) filter.exam = examId
    if (studentId) filter.student = studentId
    if (subjectId) filter.subject = subjectId
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true'

    const [total, items] = await Promise.all([
      Result.countDocuments(filter),
      Result.find(filter)
        .populate('student', safeUserFields)
        .populate({
          path: 'exam',
          select: 'examName class examDate totalMarks gradeScale',
          populate: { path: 'class', select: 'className section' },
        })
        .populate('subject', 'subjectName class')
        .populate('publishedBy', safeUserFields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Exam results fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch exam results.')
  }
}

// Admin-only: view all payments.
export const fetchAllPayments = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { studentId, status, startDate, endDate } = req.query

    const filter = {}
    if (studentId) filter.student = studentId
    if (status) filter.status = status
    if (startDate || endDate) {
      filter.paymentDate = {}
      if (startDate) filter.paymentDate.$gte = new Date(startDate)
      if (endDate) filter.paymentDate.$lte = new Date(endDate)
    }

    const [total, items] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.find(filter)
        .populate('student', safeUserFields)
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Payments fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch payments.')
  }
}

// Admin-only: view all events.
export const fetchAllEvents = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { startDate, endDate, isActive } = req.query

    const filter = {}
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true'
    if (startDate || endDate) {
      filter.startDate = {}
      if (startDate) filter.startDate.$gte = new Date(startDate)
      if (endDate) filter.startDate.$lte = new Date(endDate)
    }

    const [total, items] = await Promise.all([
      Event.countDocuments(filter),
      Event.find(filter)
        .populate('createdBy', safeUserFields)
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Events fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch events.')
  }
}

// Admin-only: create an event.
export const createEvent = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { title, description, startDate, endDate, colorTheme, isActive } = req.body
    if (!title || !startDate || !endDate) {
      return sendError(res, 400, 'Title, start date, and end date are required.')
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return sendError(res, 400, 'Invalid start or end date.')
    }
    if (end < start) {
      return sendError(res, 400, 'End date must be on or after start date.')
    }

    const event = await Event.create({
      title: title.trim(),
      description: description?.trim(),
      startDate: start,
      endDate: end,
      colorTheme: sanitizeColorTheme(colorTheme),
      isActive: typeof isActive !== 'undefined' ? !!isActive : true,
      createdBy: req.user._id,
    })

    const populated = await Event.findById(event._id).populate('createdBy', safeUserFields)
    return sendSuccess(res, 'Event created successfully.', populated, 201)
  } catch (error) {
    return sendError(res, 500, 'Failed to create event.')
  }
}

// Admin-only: update an event.
export const updateEvent = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const eventId = req.params.id || req.params.eventId || req.body.eventId
    if (!eventId) {
      return sendError(res, 400, 'Event id is required.')
    }

    const existing = await Event.findById(eventId)
    if (!existing) {
      return sendError(res, 404, 'Event not found.')
    }

    const updates = {}
    const { title, description, startDate, endDate, colorTheme, isActive } = req.body

    if (title) updates.title = title.trim()
    if (typeof description !== 'undefined') updates.description = description?.trim()
    if (typeof colorTheme !== 'undefined') updates.colorTheme = sanitizeColorTheme(colorTheme)
    if (typeof isActive !== 'undefined') updates.isActive = !!isActive

    const nextStart = startDate ? new Date(startDate) : existing.startDate
    const nextEnd = endDate ? new Date(endDate) : existing.endDate
    if (startDate && Number.isNaN(nextStart.getTime())) {
      return sendError(res, 400, 'Invalid start date.')
    }
    if (endDate && Number.isNaN(nextEnd.getTime())) {
      return sendError(res, 400, 'Invalid end date.')
    }
    if (nextEnd < nextStart) {
      return sendError(res, 400, 'End date must be on or after start date.')
    }

    if (startDate) updates.startDate = nextStart
    if (endDate) updates.endDate = nextEnd

    const updated = await Event.findByIdAndUpdate(eventId, updates, {
      new: true,
      runValidators: true,
    }).populate('createdBy', safeUserFields)

    return sendSuccess(res, 'Event updated successfully.', updated)
  } catch (error) {
    return sendError(res, 500, 'Failed to update event.')
  }
}

// Admin-only: disable an event.
export const disableEvent = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const eventId = req.params.id || req.params.eventId || req.body.eventId
    if (!eventId) {
      return sendError(res, 400, 'Event id is required.')
    }

    const updated = await Event.findByIdAndUpdate(
      eventId,
      { isActive: false },
      { new: true, runValidators: true },
    ).populate('createdBy', safeUserFields)

    if (!updated) {
      return sendError(res, 404, 'Event not found.')
    }

    return sendSuccess(res, 'Event disabled successfully.', updated)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable event.')
  }
}

// Admin-only: get settings.
export const getSettings = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const settings = await Settings.findOne().lean()
    return sendSuccess(res, 'Settings fetched successfully.', settings || {})
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch settings.')
  }
}

// Admin-only: update settings (single doc upsert).
export const updateSettings = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const {
      schoolName,
      academicYear,
      schoolMotto,
      contactEmail,
      contactPhone,
      timezone,
      resultPublishMode,
    } = req.body

    const updates = {
      updatedBy: req.user._id,
    }

    if (typeof schoolName !== 'undefined') updates.schoolName = schoolName?.trim()
    if (typeof academicYear !== 'undefined') updates.academicYear = academicYear?.trim()
    if (typeof schoolMotto !== 'undefined') updates.schoolMotto = schoolMotto?.trim()
    if (typeof contactEmail !== 'undefined') updates.contactEmail = contactEmail?.trim().toLowerCase()
    if (typeof contactPhone !== 'undefined') updates.contactPhone = contactPhone?.trim()
    if (typeof timezone !== 'undefined') updates.timezone = timezone?.trim()
    if (typeof resultPublishMode !== 'undefined') updates.resultPublishMode = resultPublishMode?.trim()

    const settings = await Settings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }).lean()

    return sendSuccess(res, 'Settings saved successfully.', settings)
  } catch (error) {
    return sendError(res, 500, 'Failed to save settings.')
  }
}
