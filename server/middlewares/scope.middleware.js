/**
 * Data scope / ownership middlewares.
 * Prevents horizontal privilege escalation:
 * - Students: only their own data
 * - Parents: only their child's data
 * - Admin: bypasses all scope restrictions
 * - Teachers: restricted by requireClassScope (assigned classes only)
 */

/**
 * Require that the requested user resource belongs to the current user (student self or parent's child).
 * Use on routes that have a user/student id in params (e.g. GET /students/:studentId).
 *
 * @param {Object} options
 * @param {string} [options.userIdParam='studentId'] - Name of the route param holding the target user id
 * @returns {Function} Express middleware
 */
export function requireDataScope(options = {}) {
  const userIdParam = options.userIdParam || 'studentId'

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'UNAUTHORIZED',
      })
    }

    const targetId = req.params[userIdParam]
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: `Missing resource identifier: ${userIdParam}`,
        code: 'MISSING_PARAM',
      })
    }

    const role = req.user.role
    const currentId = req.user._id.toString()

    if (role === 'admin') {
      return next()
    }

    if (role === 'student') {
      if (targetId !== currentId) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own data.',
          code: 'FORBIDDEN_SCOPE',
        })
      }
      return next()
    }

    if (role === 'parent') {
      const children = req.user.children || []
      const childIds = children.map((c) => (c && c.toString ? c.toString() : String(c)))
      if (!childIds.includes(targetId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only access data for your linked children.',
          code: 'FORBIDDEN_SCOPE',
        })
      }
      return next()
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.',
      code: 'FORBIDDEN_SCOPE',
    })
  }
}

/**
 * Require that the requested class belongs to the teacher's assigned classes (or admin bypass).
 * Use on routes that have a class id in params (e.g. GET /classes/:classId/subjects).
 *
 * @param {Object} options
 * @param {string} [options.classIdParam='classId'] - Name of the route param holding the class id
 * @returns {Function} Express middleware
 */
export function requireClassScope(options = {}) {
  const classIdParam = options.classIdParam || 'classId'

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'UNAUTHORIZED',
      })
    }

    const role = req.user.role
    if (role === 'admin') {
      return next()
    }

    const targetClassId = req.params[classIdParam]
    if (!targetClassId) {
      return res.status(400).json({
        success: false,
        message: `Missing resource identifier: ${classIdParam}`,
        code: 'MISSING_PARAM',
      })
    }

    if (role === 'teacher') {
      const assigned = req.user.assignedClasses || []
      const assignedIds = assigned.map((c) => (c && c.toString ? c.toString() : String(c)))
      if (!assignedIds.includes(targetClassId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only access data for your assigned classes.',
          code: 'FORBIDDEN_SCOPE',
        })
      }
      return next()
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.',
      code: 'FORBIDDEN_SCOPE',
    })
  }
}
