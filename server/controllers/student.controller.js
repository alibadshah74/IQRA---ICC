import User from '../models/User.js'
import Class from '../models/Class.js'
import Subject from '../models/Subject.js'
import Result from '../models/Result.js'
import Payment from '../models/Payment.js'
import Routine from '../models/Routine.js'
import Material from '../models/Material.js'

const safeUserFields = 'fullName email username role isActive rollNumber guardianName'

const sendSuccess = (res, message, data = null, status = 200) =>
  res.status(status).json({ success: true, message, data })

const sendError = (res, status, message) => res.status(status).json({ success: false, message, data: null })

const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

const requireStudent = (req, res) => {
  if (req.user?.role !== 'student') {
    sendError(res, 403, 'Access denied. Students only.')
    return false
  }
  return true
}

const getStudentClassIds = async (studentId) => {
  const student = await User.findById(studentId).select('assignedClasses')
  return student?.assignedClasses?.map((id) => id.toString()) || []
}

// Student dashboard summary.
export const getStudentDashboard = async (req, res) => {
  try {
    if (!requireStudent(req, res)) return

    const studentId = req.user._id
    const classIds = await getStudentClassIds(studentId)

    const [classes, subjects, resultCount, paymentCount, materialCount] = await Promise.all([
      classIds.length
        ? Class.find({ _id: { $in: classIds }, isActive: true }).select('className section').lean()
        : [],
      classIds.length
        ? Subject.find({ class: { $in: classIds }, isActive: true }).select('subjectName class teacher').lean()
        : [],
      Result.countDocuments({ student: studentId, isActive: true }),
      Payment.countDocuments({ student: studentId }),
      classIds.length ? Material.countDocuments({ class: { $in: classIds }, isActive: true }) : 0,
    ])

    return sendSuccess(res, 'Student dashboard fetched successfully.', {
      classCount: classes.length,
      subjectCount: subjects.length,
      resultCount,
      paymentCount,
      materialCount,
      classes,
      subjects,
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch student dashboard.')
  }
}

// Student-only: view own exam results.
export const getMyExamResults = async (req, res) => {
  try {
    if (!requireStudent(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { examId, subjectId } = req.query

    const filter = { student: req.user._id, isActive: true }
    if (examId) filter.exam = examId
    if (subjectId) filter.subject = subjectId

    const [total, items] = await Promise.all([
      Result.countDocuments(filter),
      Result.find(filter)
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

// Student-only: view class routine.
export const getMyClassRoutine = async (req, res) => {
  try {
    if (!requireStudent(req, res)) return

    const classIds = await getStudentClassIds(req.user._id)
    const requestedClassId = req.query.classId || req.body.classId
    const classId = requestedClassId || classIds[0]

    if (!classId) {
      return sendError(res, 400, 'Class id is required for routine.')
    }

    if (!classIds.includes(classId.toString())) {
      return sendError(res, 403, 'Not authorized to view this class routine.')
    }

    const routine = await Routine.find({ class: classId, isActive: true })
      .populate('subject', 'subjectName')
      .populate('teacher', safeUserFields)
      .sort({ day: 1, startTime: 1 })
      .lean()

    return sendSuccess(res, 'Class routine fetched successfully.', routine)
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch routine.')
  }
}

// Student-only: view subjects in assigned class.
export const getMySubjects = async (req, res) => {
  try {
    if (!requireStudent(req, res)) return

    const classIds = await getStudentClassIds(req.user._id)
    const requestedClassId = req.query.classId || req.body.classId
    const classId = requestedClassId || classIds[0]

    if (!classId) {
      return sendError(res, 400, 'Class id is required to fetch subjects.')
    }

    if (!classIds.includes(classId.toString())) {
      return sendError(res, 403, 'Not authorized to view subjects for this class.')
    }

    const subjects = await Subject.find({ class: classId, isActive: true })
      .select('subjectName class teacher')
      .populate('teacher', safeUserFields)
      .populate('class', 'className section')
      .lean()

    return sendSuccess(res, 'Subjects fetched successfully.', subjects)
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch subjects.')
  }
}

// Student-only: view own payments.
export const getMyPayments = async (req, res) => {
  try {
    if (!requireStudent(req, res)) return

    const { page, limit, skip } = getPagination(req)
    const { status, startDate, endDate } = req.query

    const filter = { student: req.user._id }
    if (status) filter.status = status
    if (startDate || endDate) {
      filter.paymentDate = {}
      if (startDate) filter.paymentDate.$gte = new Date(startDate)
      if (endDate) filter.paymentDate.$lte = new Date(endDate)
    }

    const [total, items] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.find(filter).sort({ paymentDate: -1 }).skip(skip).limit(limit).lean(),
    ])

    return sendSuccess(res, 'Payments fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch payments.')
  }
}

// Student-only: view study materials for assigned classes.
export const getMyMaterials = async (req, res) => {
  try {
    if (!requireStudent(req, res)) return

    const classIds = await getStudentClassIds(req.user._id)
    const { page, limit, skip } = getPagination(req)

    const filter = { class: { $in: classIds }, isActive: true }

    const [total, items] = await Promise.all([
      Material.countDocuments(filter),
      Material.find(filter)
        .populate('class', 'className section')
        .populate('subject', 'subjectName')
        .populate('teacher', safeUserFields)
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

