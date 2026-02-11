import User from '../models/User.js'
import Result from '../models/Result.js'
import Payment from '../models/Payment.js'
import Routine from '../models/Routine.js'
import Subject from '../models/Subject.js'
import Class from '../models/Class.js'

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

const requireParent = (req, res) => {
  if (req.user?.role !== 'parent') {
    sendError(res, 403, 'Access denied. Parents only.')
    return false
  }
  return true
}

const getParentChildrenIds = async (parentId) => {
  const parent = await User.findById(parentId).select('children')
  return parent?.children?.map((id) => id.toString()) || []
}

const ensureChildAccess = async (parentId, childId) => {
  const childIds = await getParentChildrenIds(parentId)
  return childIds.includes(childId.toString())
}

// Parent dashboard summary across children.
export const getParentDashboard = async (req, res) => {
  try {
    if (!requireParent(req, res)) return

    const childIds = await getParentChildrenIds(req.user._id)

    const [resultCount, paymentCount] = await Promise.all([
      childIds.length ? Result.countDocuments({ student: { $in: childIds }, isActive: true }) : 0,
      childIds.length ? Payment.countDocuments({ student: { $in: childIds } }) : 0,
    ])

    return sendSuccess(res, 'Parent dashboard fetched successfully.', {
      childrenCount: childIds.length,
      resultCount,
      paymentCount,
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch parent dashboard.')
  }
}

// Parent-only: list children for this parent.
export const getChildrenList = async (req, res) => {
  try {
    if (!requireParent(req, res)) return

    const childIds = await getParentChildrenIds(req.user._id)
    if (childIds.length === 0) {
      return sendSuccess(res, 'No children assigned.', [])
    }

    const children = await User.find({ _id: { $in: childIds }, role: 'student' })
      .select(`${safeUserFields} assignedClasses`)
      .lean()

    return sendSuccess(res, 'Children fetched successfully.', children)
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch children.')
  }
}

// Parent-only: view a child's exam results.
export const getChildExamResults = async (req, res) => {
  try {
    if (!requireParent(req, res)) return

    const childId = req.params.childId || req.query.childId || req.body.childId
    if (!childId) {
      return sendError(res, 400, 'Child id is required.')
    }

    const allowed = await ensureChildAccess(req.user._id, childId)
    if (!allowed) {
      return sendError(res, 403, 'Not authorized to view this child results.')
    }

    const { page, limit, skip } = getPagination(req)
    const { examId, subjectId } = req.query

    const filter = { student: childId, isActive: true }
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

    return sendSuccess(res, 'Child exam results fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch child results.')
  }
}

// Parent-only: view a child's routine.
export const getChildRoutine = async (req, res) => {
  try {
    if (!requireParent(req, res)) return

    const childId = req.params.childId || req.query.childId || req.body.childId
    if (!childId) {
      return sendError(res, 400, 'Child id is required.')
    }

    const allowed = await ensureChildAccess(req.user._id, childId)
    if (!allowed) {
      return sendError(res, 403, 'Not authorized to view this child routine.')
    }

    const child = await User.findById(childId).select('assignedClasses')
    const classIds = child?.assignedClasses?.map((id) => id.toString()) || []
    const requestedClassId = req.query.classId || req.body.classId
    const classId = requestedClassId || classIds[0]

    if (!classId) {
      return sendError(res, 400, 'Class id is required to fetch routine.')
    }

    if (requestedClassId && !classIds.includes(requestedClassId.toString())) {
      return sendError(res, 403, 'Child is not assigned to this class.')
    }

    const routine = await Routine.find({ class: classId, isActive: true })
      .populate('subject', 'subjectName')
      .populate('teacher', safeUserFields)
      .sort({ day: 1, startTime: 1 })
      .lean()

    return sendSuccess(res, 'Child routine fetched successfully.', routine)
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch child routine.')
  }
}

// Parent-only: view a child's payments.
export const getChildPayments = async (req, res) => {
  try {
    if (!requireParent(req, res)) return

    const childId = req.params.childId || req.query.childId || req.body.childId
    if (!childId) {
      return sendError(res, 400, 'Child id is required.')
    }

    const allowed = await ensureChildAccess(req.user._id, childId)
    if (!allowed) {
      return sendError(res, 403, 'Not authorized to view this child payments.')
    }

    const { page, limit, skip } = getPagination(req)
    const { status, startDate, endDate } = req.query

    const filter = { student: childId }
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

    return sendSuccess(res, 'Child payments fetched successfully.', {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch child payments.')
  }
}

// Parent-only: view a child's subjects.
export const getChildSubjects = async (req, res) => {
  try {
    if (!requireParent(req, res)) return

    const childId = req.params.childId || req.query.childId || req.body.childId
    if (!childId) {
      return sendError(res, 400, 'Child id is required.')
    }

    const allowed = await ensureChildAccess(req.user._id, childId)
    if (!allowed) {
      return sendError(res, 403, 'Not authorized to view this child subjects.')
    }

    const child = await User.findById(childId).select('assignedClasses')
    const classIds = child?.assignedClasses?.map((id) => id.toString()) || []
    const classId = classIds[0]

    if (!classId) {
      return sendError(res, 400, 'Class id is required to fetch subjects.')
    }

    const subjects = await Subject.find({ class: classId, isActive: true })
      .populate('teacher', safeUserFields)
      .lean()

    const classInfo = await Class.findById(classId).select('className section').lean()

    return sendSuccess(res, 'Child subjects fetched successfully.', {
      classInfo,
      subjects,
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch child subjects.')
  }
}

