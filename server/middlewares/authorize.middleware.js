const VALID_ROLES = ['admin', 'teacher', 'student', 'parent']

/**
 * Role-based authorization middleware factory.
 * Restricts route access to the given allowed roles.
 * Use after authenticate middleware (expects req.user).
 *
 * @param {...string} allowedRoles - One or more roles that may access the route (e.g. 'admin', 'teacher')
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/users', authenticate, authorize('admin'), getUsers)
 * router.get('/classes', authenticate, authorize('admin', 'teacher'), getClasses)
 */
export function authorize(...allowedRoles) {
  const allowed = allowedRoles.length ? allowedRoles : VALID_ROLES
  const invalid = allowed.filter((r) => !VALID_ROLES.includes(r))
  if (invalid.length > 0) {
    throw new Error(`authorize(): invalid role(s): ${invalid.join(', ')}. Valid: ${VALID_ROLES.join(', ')}`)
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'UNAUTHORIZED',
      })
    }

    const role = req.user.role
    if (!allowed.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
        code: 'FORBIDDEN',
      })
    }

    next()
  }
}
