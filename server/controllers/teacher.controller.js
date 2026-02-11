import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Class from '../models/Class.js'
import Subject from '../models/Subject.js'
import Routine from '../models/Routine.js'
import Exam from '../models/Exam.js'
import Result from '../models/Result.js'
import Material from '../models/Material.js'
import { uploadToImageKit, isImageKitConfigured } from '../config/imagekit.js'

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

const requireTeacher = (req, res) => {
  if (req.user?.role !== 'teacher') {
    sendError(res, 403, 'Access denied. Teachers only.')
    return false
  }
  return true
}

const getTeacherClassIds = async (teacherId) => {
  const teacher = await User.findById(teacherId).select('assignedClasses')
  const directClasses = teacher?.assignedClasses?.map((id) => id.toString()) || []
  const classTeacherDocs = await Class.find({ classTeacher: teacherId }).select('_id')
  const classTeacherIds = classTeacherDocs.map((doc) => doc._id.toString())
  return Array.from(new Set([...directClasses, ...classTeacherIds]))
}

const isTeacherAssignedToClass = async (teacherId, classId) => {
  const classIds = await getTeacherClassIds(teacherId)
  return classIds.includes(classId.toString())
}

// Teacher dashboard: classes, subjects, and student count.
export const getTeacherDashboard = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const teacherId = req.user._id
    const classIds = await getTeacherClassIds(teacherId)

    const [classes, subjects, studentsCount, examsCount, routineCount, materialsCount] = await Promise.all([
      Class.find({ _id: { $in: classIds }, isActive: true }).select('className section classTeacher').lean(),
      Subject.find({ teacher: teacherId, isActive: true }).select('subjectName class').lean(),
      classIds.length
        ? User.countDocuments({ role: 'student', assignedClasses: { $in: classIds }, isActive: true })
        : 0,
      classIds.length ? Exam.countDocuments({ class: { $in: classIds }, isActive: true }) : 0,
      classIds.length ? Routine.countDocuments({ class: { $in: classIds }, isActive: true }) : 0,
      Material.countDocuments({ teacher: teacherId, isActive: true }),
    ])

    return sendSuccess(res, 'Teacher dashboard fetched successfully.', {
      classCount: classes.length,
      subjectCount: subjects.length,
      studentsCount,
      examsCount,
      routineCount,
      materialsCount,
      classes,
      subjects,
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch teacher dashboard.')
  }
}

// Teacher-only: get students within assigned classes.
export const getMyStudents = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const teacherId = req.user._id
    const classIds = await getTeacherClassIds(teacherId)

    if (classIds.length === 0) {
      return sendSuccess(res, 'No assigned classes found.', {
        items: [],
        pagination: { page: 1, limit: 0, total: 0, pages: 1 },
      })
    }

    const { page, limit, skip } = getPagination(req)
    const { q, isActive } = req.query
    const filter = { role: 'student', assignedClasses: { $in: classIds } }

    if (q) {
      const regex = new RegExp(q.trim(), 'i')
      filter.$or = [{ fullName: regex }, { email: regex }, { username: regex }, { rollNumber: regex }]
    }

    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive === 'true'
    } else {
      filter.isActive = true
    }

    const [total, students] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select(safeUserFields)
        .populate('assignedClasses', 'className section')
        .sort({ fullName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Students fetched successfully.', {
      items: students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch students.')
  }
}

// Teacher-only: create a student in assigned class.
export const createStudent = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const { fullName, email, username, password, classId, rollNumber, guardianName } = req.body

    if (!fullName || !email || !username || !password || !classId) {
      return sendError(res, 400, 'Full name, email, username, password, and class id are required.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, classId)
    if (!assigned) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }],
    }).lean()

    if (existing) {
      return sendError(res, 409, 'A user with this email or username already exists.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const student = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password: hashedPassword,
      role: 'student',
      assignedClasses: [classId],
      rollNumber: rollNumber?.trim(),
      guardianName: guardianName?.trim(),
      createdBy: req.user._id,
      isActive: true,
    })

    return sendSuccess(res, 'Student created successfully.', student, 201)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'Duplicate email or username.')
    }
    return sendError(res, 500, 'Failed to create student.')
  }
}

// Teacher-only: update a student.
export const updateStudent = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const studentId = req.params.id || req.params.studentId || req.body.studentId
    if (!studentId) {
      return sendError(res, 400, 'Student id is required.')
    }

    const student = await User.findById(studentId)
    if (!student || student.role !== 'student') {
      return sendError(res, 404, 'Student not found.')
    }

    const classIds = await getTeacherClassIds(req.user._id)
    const studentClasses = student.assignedClasses?.map((id) => id.toString()) || []
    const hasAccess = studentClasses.some((id) => classIds.includes(id))
    if (!hasAccess) {
      return sendError(res, 403, 'Not authorized to update this student.')
    }

    const updates = {}
    const { fullName, email, username, password, classId, rollNumber, guardianName, isActive } = req.body

    if (fullName) updates.fullName = fullName.trim()
    if (typeof rollNumber !== 'undefined') updates.rollNumber = rollNumber?.trim()
    if (typeof guardianName !== 'undefined') updates.guardianName = guardianName?.trim()
    if (typeof isActive !== 'undefined') updates.isActive = !!isActive

    if (email) updates.email = email.toLowerCase().trim()
    if (username) updates.username = username.trim()

    if (email || username) {
      const duplicate = await User.findOne({
        _id: { $ne: studentId },
        $or: [
          email ? { email: email.toLowerCase().trim() } : null,
          username ? { username: username.trim() } : null,
        ].filter(Boolean),
      }).lean()
      if (duplicate) {
        return sendError(res, 409, 'A user with this email or username already exists.')
      }
    }

    if (classId) {
      if (!classIds.includes(classId.toString())) {
        return sendError(res, 403, 'Not assigned to the selected class.')
      }
      updates.assignedClasses = [classId]
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10)
    }

    const updated = await User.findByIdAndUpdate(studentId, updates, {
      new: true,
      runValidators: true,
    }).select(safeUserFields)

    return sendSuccess(res, 'Student updated successfully.', updated)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'Duplicate email or username.')
    }
    return sendError(res, 500, 'Failed to update student.')
  }
}

// Teacher-only: disable a student.
export const disableStudent = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const studentId = req.params.id || req.params.studentId || req.body.studentId
    if (!studentId) {
      return sendError(res, 400, 'Student id is required.')
    }

    const student = await User.findById(studentId)
    if (!student || student.role !== 'student') {
      return sendError(res, 404, 'Student not found.')
    }

    const classIds = await getTeacherClassIds(req.user._id)
    const studentClasses = student.assignedClasses?.map((id) => id.toString()) || []
    const hasAccess = studentClasses.some((id) => classIds.includes(id))
    if (!hasAccess) {
      return sendError(res, 403, 'Not authorized to disable this student.')
    }

    student.isActive = false
    await student.save()

    return sendSuccess(res, 'Student disabled successfully.', student)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable student.')
  }
}
// Teacher-only: get classes assigned to the teacher.
export const getMyClasses = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const teacherId = req.user._id
    const classIds = await getTeacherClassIds(teacherId)

    const classes = await Class.find({ _id: { $in: classIds }, isActive: true })
      .select('className section classTeacher')
      .lean()

    return sendSuccess(res, 'Classes fetched successfully.', classes)
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch classes.')
  }
}

// Teacher-only: get subjects assigned to the teacher.
export const getMySubjects = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const subjects = await Subject.find({ teacher: req.user._id, isActive: true })
      .select('subjectName class teacher')
      .populate('class', 'className section')
      .lean()

    return sendSuccess(res, 'Subjects fetched successfully.', subjects)
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch subjects.')
  }
}

// Teacher-only: create subject for assigned class.
export const createSubject = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const { subjectName, classId } = req.body
    if (!subjectName || !classId) {
      return sendError(res, 400, 'Subject name and class id are required.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, classId)
    if (!assigned) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    const subject = await Subject.create({
      subjectName: subjectName.trim(),
      class: classId,
      teacher: req.user._id,
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

// Teacher-only: update subject.
export const updateSubject = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const subjectId = req.params.id || req.params.subjectId || req.body.subjectId
    if (!subjectId) {
      return sendError(res, 400, 'Subject id is required.')
    }

    const subject = await Subject.findById(subjectId)
    if (!subject) {
      return sendError(res, 404, 'Subject not found.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, subject.class)
    if (!assigned) {
      return sendError(res, 403, 'Not authorized to update this subject.')
    }

    const { subjectName, classId, isActive } = req.body
    if (subjectName) subject.subjectName = subjectName.trim()
    if (typeof isActive !== 'undefined') subject.isActive = !!isActive

    if (classId) {
      const classAssigned = await isTeacherAssignedToClass(req.user._id, classId)
      if (!classAssigned) {
        return sendError(res, 403, 'Not assigned to the selected class.')
      }
      subject.class = classId
    }

    subject.teacher = req.user._id

    await subject.save()

    const populated = await Subject.findById(subject._id)
      .populate('class', 'className section')
      .populate('teacher', safeUserFields)

    return sendSuccess(res, 'Subject updated successfully.', populated)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'Subject already exists for this class.')
    }
    return sendError(res, 500, 'Failed to update subject.')
  }
}

// Teacher-only: disable subject.
export const disableSubject = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const subjectId = req.params.id || req.params.subjectId || req.body.subjectId
    if (!subjectId) {
      return sendError(res, 400, 'Subject id is required.')
    }

    const subject = await Subject.findById(subjectId)
    if (!subject) {
      return sendError(res, 404, 'Subject not found.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, subject.class)
    if (!assigned) {
      return sendError(res, 403, 'Not authorized to disable this subject.')
    }

    subject.isActive = false
    await subject.save()

    return sendSuccess(res, 'Subject disabled successfully.', subject)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable subject.')
  }
}

// Teacher-only: list routines for assigned classes.
export const getMyRoutines = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const teacherId = req.user._id
    const classIds = await getTeacherClassIds(teacherId)

    const { page, limit, skip } = getPagination(req)
    const { classId, isActive } = req.query

    if (classId && !classIds.includes(classId.toString())) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    const filter = { class: { $in: classIds } }
    if (classId) filter.class = classId
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive === 'true'
    } else {
      filter.isActive = true
    }

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

// Teacher-only: create routine slot.
export const createRoutine = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const { classId, day, subjectId, startTime, endTime, room } = req.body
    if (!classId || !day || !subjectId || !startTime || !endTime) {
      return sendError(res, 400, 'Class, day, subject, start time, and end time are required.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, classId)
    if (!assigned) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    const subjectExists = await Subject.exists({ _id: subjectId, class: classId, isActive: true })
    if (!subjectExists) {
      return sendError(res, 400, 'Subject is not valid for this class.')
    }

    const routine = await Routine.create({
      class: classId,
      day,
      subject: subjectId,
      teacher: req.user._id,
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

// Teacher-only: update routine slot.
export const updateRoutine = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const routineId = req.params.id || req.params.routineId || req.body.routineId
    if (!routineId) {
      return sendError(res, 400, 'Routine id is required.')
    }

    const routine = await Routine.findById(routineId)
    if (!routine) {
      return sendError(res, 404, 'Routine not found.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, routine.class)
    if (!assigned) {
      return sendError(res, 403, 'Not authorized to update this routine.')
    }

    const { classId, day, subjectId, startTime, endTime, room, isActive } = req.body

    if (classId) {
      const classAssigned = await isTeacherAssignedToClass(req.user._id, classId)
      if (!classAssigned) {
        return sendError(res, 403, 'Not assigned to the selected class.')
      }
      routine.class = classId
    }

    if (subjectId) {
      const subjectExists = await Subject.exists({ _id: subjectId, class: routine.class, isActive: true })
      if (!subjectExists) {
        return sendError(res, 400, 'Subject is not valid for this class.')
      }
      routine.subject = subjectId
    }

    if (day) routine.day = day
    if (startTime) routine.startTime = startTime
    if (endTime) routine.endTime = endTime
    if (typeof room !== 'undefined') routine.room = room?.trim()
    if (typeof isActive !== 'undefined') routine.isActive = !!isActive

    await routine.save()

    const populated = await Routine.findById(routine._id)
      .populate('class', 'className section')
      .populate('subject', 'subjectName')
      .populate('teacher', safeUserFields)

    return sendSuccess(res, 'Routine updated successfully.', populated)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'This routine slot already exists.')
    }
    return sendError(res, 500, 'Failed to update routine.')
  }
}

// Teacher-only: disable routine slot.
export const disableRoutine = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const routineId = req.params.id || req.params.routineId || req.body.routineId
    if (!routineId) {
      return sendError(res, 400, 'Routine id is required.')
    }

    const routine = await Routine.findById(routineId)
    if (!routine) {
      return sendError(res, 404, 'Routine not found.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, routine.class)
    if (!assigned) {
      return sendError(res, 403, 'Not authorized to disable this routine.')
    }

    routine.isActive = false
    await routine.save()

    return sendSuccess(res, 'Routine disabled successfully.', routine)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable routine.')
  }
}
// Teacher-only: list exams.
export const getMyExams = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const teacherId = req.user._id
    const classIds = await getTeacherClassIds(teacherId)
    const { page, limit, skip } = getPagination(req)
    const { classId, isActive } = req.query

    if (classId && !classIds.includes(classId.toString())) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    const filter = { class: { $in: classIds } }
    if (classId) filter.class = classId
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive === 'true'
    } else {
      filter.isActive = true
    }

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

// Teacher-only: create an exam for assigned class.
export const createExam = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const teacherId = req.user._id
    const { examName, classId, subjectIds, examDate, totalMarks, gradeScale } = req.body

    if (!examName || !classId) {
      return sendError(res, 400, 'Exam name and class id are required.')
    }

    const assigned = await isTeacherAssignedToClass(teacherId, classId)
    if (!assigned) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    if (Array.isArray(subjectIds) && subjectIds.length > 0) {
      const subjectCount = await Subject.countDocuments({
        _id: { $in: subjectIds },
        class: classId,
      })
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
      createdBy: teacherId,
      isActive: true,
    })

    return sendSuccess(res, 'Exam created successfully.', exam, 201)
  } catch (error) {
    return sendError(res, 500, 'Failed to create exam.')
  }
}

// Teacher-only: update an exam within assigned scope.
export const updateExam = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const examId = req.params.id || req.params.examId || req.body.examId
    if (!examId) {
      return sendError(res, 400, 'Exam id is required.')
    }

    const exam = await Exam.findById(examId)
    if (!exam) {
      return sendError(res, 404, 'Exam not found.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, exam.class)
    if (!assigned) {
      return sendError(res, 403, 'Not authorized to update this exam.')
    }

    const { examName, subjectIds, examDate, totalMarks, gradeScale, isActive } = req.body

    if (examName) exam.examName = examName.trim()
    if (examDate) exam.examDate = new Date(examDate)
    if (typeof totalMarks !== 'undefined') exam.totalMarks = totalMarks
    if (typeof gradeScale !== 'undefined') exam.gradeScale = gradeScale?.trim()
    if (typeof isActive !== 'undefined') exam.isActive = !!isActive

    if (Array.isArray(subjectIds)) {
      const subjectCount = await Subject.countDocuments({
        _id: { $in: subjectIds },
        class: exam.class,
      })
      if (subjectCount !== subjectIds.length) {
        return sendError(res, 400, 'One or more subjects are invalid for this class.')
      }
      exam.subjects = subjectIds
    }

    await exam.save()

    return sendSuccess(res, 'Exam updated successfully.', exam)
  } catch (error) {
    return sendError(res, 500, 'Failed to update exam.')
  }
}

// Teacher-only: disable an exam.
export const disableExam = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const examId = req.params.id || req.params.examId || req.body.examId
    if (!examId) {
      return sendError(res, 400, 'Exam id is required.')
    }

    const exam = await Exam.findById(examId)
    if (!exam) {
      return sendError(res, 404, 'Exam not found.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, exam.class)
    if (!assigned) {
      return sendError(res, 403, 'Not authorized to disable this exam.')
    }

    exam.isActive = false
    await exam.save()

    return sendSuccess(res, 'Exam disabled successfully.', exam)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable exam.')
  }
}

// Teacher-only: list marks/results for assigned classes.
export const getMyResults = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const teacherId = req.user._id
    const classIds = await getTeacherClassIds(teacherId)
    const { page, limit, skip } = getPagination(req)
    const { classId, examId, subjectId, studentId, isActive } = req.query

    if (classId && !classIds.includes(classId.toString())) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    const examFilter = { class: { $in: classIds } }
    if (classId) examFilter.class = classId
    if (examId) examFilter._id = examId

    const examIds = await Exam.find(examFilter).select('_id')
    const allowedExamIds = examIds.map((e) => e._id)

    const filter = { exam: { $in: allowedExamIds } }
    if (subjectId) filter.subject = subjectId
    if (studentId) filter.student = studentId
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive === 'true'
    } else {
      filter.isActive = true
    }

    const [total, items] = await Promise.all([
      Result.countDocuments(filter),
      Result.find(filter)
        .populate('student', safeUserFields)
        .populate('exam', 'examName class examDate totalMarks gradeScale')
        .populate('subject', 'subjectName class')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Results fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch results.')
  }
}

// Teacher-only: create marks.
export const createResult = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const teacherId = req.user._id
    const { studentId, examId, subjectId, marks, grade } = req.body

    if (!studentId || !examId || !subjectId || typeof marks !== 'number') {
      return sendError(res, 400, 'Student, exam, subject, and marks are required.')
    }

    const exam = await Exam.findById(examId)
    if (!exam || !exam.isActive) {
      return sendError(res, 404, 'Exam not found.')
    }

    const assigned = await isTeacherAssignedToClass(teacherId, exam.class)
    if (!assigned) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    if (Array.isArray(exam.subjects) && exam.subjects.length > 0) {
      const subjectInExam = exam.subjects.map((id) => id.toString()).includes(subjectId.toString())
      if (!subjectInExam) {
        return sendError(res, 400, 'Subject is not part of this exam.')
      }
    } else {
      const subjectExists = await Subject.exists({ _id: subjectId, class: exam.class })
      if (!subjectExists) {
        return sendError(res, 400, 'Subject is invalid for this class.')
      }
    }

    const student = await User.findOne({ _id: studentId, role: 'student' }).select('assignedClasses')
    if (!student) {
      return sendError(res, 400, 'Student not found.')
    }
    const studentClasses = student.assignedClasses?.map((id) => id.toString()) || []
    if (!studentClasses.includes(exam.class.toString())) {
      return sendError(res, 400, 'Student is not assigned to this class.')
    }

    const result = await Result.findOneAndUpdate(
      { student: studentId, exam: examId, subject: subjectId },
      {
        $set: {
          marks,
          grade: grade?.trim(),
          publishedBy: teacherId,
          isActive: true,
        },
        $setOnInsert: {
          student: studentId,
          exam: examId,
          subject: subjectId,
        },
      },
      { new: true, upsert: true, runValidators: true },
    )

    return sendSuccess(res, 'Marks saved successfully.', result, 201)
  } catch (error) {
    return sendError(res, 500, 'Failed to save marks.')
  }
}

// Teacher-only: update marks.
export const updateResult = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const resultId = req.params.id || req.params.resultId || req.body.resultId
    if (!resultId) {
      return sendError(res, 400, 'Result id is required.')
    }

    const result = await Result.findById(resultId).populate('exam', 'class')
    if (!result || !result.exam) {
      return sendError(res, 404, 'Result not found.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, result.exam.class)
    if (!assigned) {
      return sendError(res, 403, 'Not authorized to update this result.')
    }

    const { marks, grade, isActive } = req.body
    if (typeof marks !== 'undefined') result.marks = marks
    if (typeof grade !== 'undefined') result.grade = grade?.trim()
    if (typeof isActive !== 'undefined') result.isActive = !!isActive
    result.publishedBy = req.user._id

    await result.save()

    return sendSuccess(res, 'Marks updated successfully.', result)
  } catch (error) {
    return sendError(res, 500, 'Failed to update marks.')
  }
}

// Teacher-only: disable marks.
export const disableResult = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const resultId = req.params.id || req.params.resultId || req.body.resultId
    if (!resultId) {
      return sendError(res, 400, 'Result id is required.')
    }

    const result = await Result.findById(resultId).populate('exam', 'class')
    if (!result || !result.exam) {
      return sendError(res, 404, 'Result not found.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, result.exam.class)
    if (!assigned) {
      return sendError(res, 403, 'Not authorized to disable this result.')
    }

    result.isActive = false
    await result.save()

    return sendSuccess(res, 'Marks disabled successfully.', result)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable marks.')
  }
}
// Teacher-only: list materials.
export const getMyMaterials = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { classId, subjectId, isActive } = req.query

    const filter = { teacher: req.user._id }
    if (classId) filter.class = classId
    if (subjectId) filter.subject = subjectId
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive === 'true'
    } else {
      filter.isActive = true
    }

    const [total, items] = await Promise.all([
      Material.countDocuments(filter),
      Material.find(filter)
        .populate('class', 'className section')
        .populate('subject', 'subjectName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Materials fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch materials.')
  }
}

// Teacher-only: upload study material (Cloudinary).
export const createMaterial = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    if (!isImageKitConfigured) {
      return sendError(res, 500, 'File storage is not configured.')
    }

    const { title, classId, subjectId } = req.body
    if (!title || !classId) {
      return sendError(res, 400, 'Title and class id are required.')
    }

    if (!req.file) {
      return sendError(res, 400, 'File is required.')
    }

    const assigned = await isTeacherAssignedToClass(req.user._id, classId)
    if (!assigned) {
      return sendError(res, 403, 'Not assigned to this class.')
    }

    if (subjectId) {
      const subjectExists = await Subject.exists({ _id: subjectId, class: classId })
      if (!subjectExists) {
        return sendError(res, 400, 'Subject is invalid for this class.')
      }
    }

    const uploadResult = await uploadToImageKit(req.file.buffer, {
      folder: '/iqra/materials',
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
    })

    const material = await Material.create({
      title: title.trim(),
      class: classId,
      subject: subjectId || undefined,
      teacher: req.user._id,
      fileUrl: uploadResult.url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      isActive: true,
    })

    return sendSuccess(res, 'Material uploaded successfully.', material, 201)
  } catch (error) {
    return sendError(res, 500, 'Failed to upload material.')
  }
}

// Teacher-only: update material metadata or file.
export const updateMaterial = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const materialId = req.params.id || req.params.materialId || req.body.materialId
    if (!materialId) {
      return sendError(res, 400, 'Material id is required.')
    }

    const material = await Material.findById(materialId)
    if (!material) {
      return sendError(res, 404, 'Material not found.')
    }

    if (material.teacher.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this material.')
    }

    const { title, classId, subjectId, isActive } = req.body

    if (classId) {
      const assigned = await isTeacherAssignedToClass(req.user._id, classId)
      if (!assigned) {
        return sendError(res, 403, 'Not assigned to this class.')
      }
      material.class = classId
    }

    if (subjectId) {
      const subjectExists = await Subject.exists({ _id: subjectId, class: material.class })
      if (!subjectExists) {
        return sendError(res, 400, 'Subject is invalid for this class.')
      }
      material.subject = subjectId
    }

    if (typeof title !== 'undefined') material.title = title?.trim()
    if (typeof isActive !== 'undefined') material.isActive = !!isActive

    if (req.file) {
      if (!isImageKitConfigured) {
        return sendError(res, 500, 'File storage is not configured.')
      }
      const uploadResult = await uploadToImageKit(req.file.buffer, {
        folder: '/iqra/materials',
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
      })
      material.fileUrl = uploadResult.url
      material.fileName = req.file.originalname
      material.fileType = req.file.mimetype
      material.fileSize = req.file.size
    }

    await material.save()

    return sendSuccess(res, 'Material updated successfully.', material)
  } catch (error) {
    return sendError(res, 500, 'Failed to update material.')
  }
}

// Teacher-only: disable material.
export const disableMaterial = async (req, res) => {
  try {
    if (!requireTeacher(req, res)) return

    const materialId = req.params.id || req.params.materialId || req.body.materialId
    if (!materialId) {
      return sendError(res, 400, 'Material id is required.')
    }

    const material = await Material.findById(materialId)
    if (!material) {
      return sendError(res, 404, 'Material not found.')
    }

    if (material.teacher.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to disable this material.')
    }

    material.isActive = false
    await material.save()

    return sendSuccess(res, 'Material disabled successfully.', material)
  } catch (error) {
    return sendError(res, 500, 'Failed to disable material.')
  }
}

