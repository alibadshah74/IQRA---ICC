import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Class from '../models/Class.js'

const safeUserFields =
  'fullName email username role isActive rollNumber guardianName children assignedClasses createdBy lastLogin createdAt updatedAt'

const sendSuccess = (res, message, data = null, status = 200) =>
  res.status(status).json({ success: true, message, data })

const sendError = (res, status, message) => res.status(status).json({ success: false, message, data: null })

const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

const buildUserSearchFilter = (q) => {
  if (!q) return {}
  const regex = new RegExp(q.trim(), 'i')
  return { $or: [{ fullName: regex }, { email: regex }, { username: regex }] }
}

const sanitizeUser = (user) => {
  if (!user) return null
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user }
  delete obj.password
  delete obj.__v
  return obj
}

// Admin-only: create teacher/student/parent credentials.
export const registerUser = async (req, res) => {
  try {
    // Permission: only admins can create user accounts.
    if (req.user?.role !== 'admin') {
      return sendError(res, 403, 'Access denied. Admins only.')
    }

    const {
      fullName,
      email,
      username,
      password,
      role,
      assignedClasses,
      children,
      classId,
      rollNumber,
      guardianName,
    } = req.body

    if (!fullName || !email || !username || !password || !role) {
      return sendError(res, 400, 'Missing required fields.')
    }

    if (!['teacher', 'student', 'parent'].includes(role)) {
      return sendError(res, 400, 'Admin can only create teacher, student, or parent accounts.')
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username.trim()

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    }).lean()

    if (existing) {
      return sendError(res, 409, 'A user with this email or username already exists.')
    }

    let normalizedAssignedClasses = Array.isArray(assignedClasses) ? assignedClasses : []
    if (classId) normalizedAssignedClasses = [classId]

    if (role === 'student' && normalizedAssignedClasses.length === 0) {
      return sendError(res, 400, 'Student must be assigned to at least one class.')
    }

    if (normalizedAssignedClasses.length > 0) {
      const classCount = await Class.countDocuments({ _id: { $in: normalizedAssignedClasses } })
      if (classCount !== normalizedAssignedClasses.length) {
        return sendError(res, 400, 'One or more assigned classes are invalid.')
      }
    }

    let normalizedChildren = Array.isArray(children) ? children : []
    if (role === 'parent' && normalizedChildren.length > 0) {
      const childCount = await User.countDocuments({
        _id: { $in: normalizedChildren },
        role: 'student',
      })
      if (childCount !== normalizedChildren.length) {
        return sendError(res, 400, 'One or more children are invalid students.')
      }
    }

    if (role !== 'parent') {
      normalizedChildren = []
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUserPayload = {
      fullName: fullName.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      role,
      createdBy: req.user._id,
    }

    if (role === 'teacher' || role === 'student') {
      newUserPayload.assignedClasses = normalizedAssignedClasses
    }

    if (role === 'parent') {
      newUserPayload.children = normalizedChildren
    }

    if (role === 'student') {
      newUserPayload.rollNumber = rollNumber?.trim()
      newUserPayload.guardianName = guardianName?.trim()
    }

    const user = await User.create(newUserPayload)

    return sendSuccess(res, 'User registered successfully.', sanitizeUser(user), 201)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'Duplicate email or username.')
    }
    return sendError(res, 500, 'Failed to register user.')
  }
}

// Public: validate credentials and return access data.
export const loginUser = async (req, res) => {
  try {
    const { email, username, identifier,  userId, password } = req.body
    const loginId = (email || username || userId || identifier || '').trim()

    if (!loginId || !password) {
      return sendError(res, 400, 'Email/username and password are required.')
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return sendError(res, 500, 'JWT secret not configured.')
    }

    const lookup = loginId.includes('@')
      ? { email: loginId.toLowerCase() }
      : { username: loginId }

    const user = await User.findOne(lookup).select('+password')
    if (!user) {
      return sendError(res, 401, 'Invalid credentials.')
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account is deactivated.')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials.')
    }

    user.lastLogin = new Date()
    await user.save()

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES || '7d',
    })

    return sendSuccess(res, 'Login successful.', {
      token,
      user: sanitizeUser(user),
      role: user.role,
    })
  } catch (error) {
    return sendError(res, 500, 'Login failed.')
  }
}

// Client discards token; optional server-side invalidation not implemented.
export const logoutUser = async (req, res) => {
  return sendSuccess(res, 'Logged out successfully.')
}

// Return current authenticated user (requires protect middleware).
export const getMe = async (req, res) => {
  if (!req.user) {
    return sendError(res, 401, 'Not authenticated.')
  }
  return sendSuccess(res, 'Profile fetched.', sanitizeUser(req.user))
}

// Admin-only: list all users with pagination and filters.
export const getAllUsers = async (req, res) => {
  try {
    // Permission: only admins can list users.
    if (req.user?.role !== 'admin') {
      return sendError(res, 403, 'Access denied. Admins only.')
    }

    const { page, limit, skip } = getPagination(req)
    const { role, isActive, q } = req.query

    const filter = { ...buildUserSearchFilter(q) }
    if (role) filter.role = role
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true'

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select(safeUserFields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    return sendSuccess(res, 'Users fetched successfully.', {
      items: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch users.')
  }
}

// Admin-only: get a single user by id.
export const getUserById = async (req, res) => {
  try {
    // Permission: only admins can view a user by id.
    if (req.user?.role !== 'admin') {
      return sendError(res, 403, 'Access denied. Admins only.')
    }

    const userId = req.params.id || req.params.userId || req.query.userId
    if (!userId) {
      return sendError(res, 400, 'User id is required.')
    }

    const user = await User.findById(userId).select(safeUserFields)
    if (!user) {
      return sendError(res, 404, 'User not found.')
    }

    return sendSuccess(res, 'User fetched successfully.', user)
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch user.')
  }
}

// Admin-only: update a user (role-aware).
export const updateUser = async (req, res) => {
  try {
    // Permission: only admins can update users.
    if (req.user?.role !== 'admin') {
      return sendError(res, 403, 'Access denied. Admins only.')
    }

    const userId = req.params.id || req.params.userId || req.body.userId
    if (!userId) {
      return sendError(res, 400, 'User id is required.')
    }

    const existingUser = await User.findById(userId)
    if (!existingUser) {
      return sendError(res, 404, 'User not found.')
    }

    const updates = {}
    const {
      fullName,
      email,
      username,
      role,
      isActive,
      assignedClasses,
      children,
      password,
      rollNumber,
      guardianName,
      classId,
    } = req.body

    if (fullName) updates.fullName = fullName.trim()
    if (email) updates.email = email.toLowerCase().trim()
    if (username) updates.username = username.trim()
    if (typeof rollNumber !== 'undefined') updates.rollNumber = rollNumber?.trim()
    if (typeof guardianName !== 'undefined') updates.guardianName = guardianName?.trim()

    if (typeof isActive !== 'undefined') updates.isActive = !!isActive

    if (role) {
      if (!['admin', 'teacher', 'student', 'parent'].includes(role)) {
        return sendError(res, 400, 'Invalid role provided.')
      }
      updates.role = role
    }

    let normalizedAssignedClasses = Array.isArray(assignedClasses) ? assignedClasses : null
    if (classId) normalizedAssignedClasses = [classId]
    if (normalizedAssignedClasses) {
      const classCount = await Class.countDocuments({ _id: { $in: normalizedAssignedClasses } })
      if (classCount !== normalizedAssignedClasses.length) {
        return sendError(res, 400, 'One or more assigned classes are invalid.')
      }
      updates.assignedClasses = normalizedAssignedClasses
    }

    let normalizedChildren = Array.isArray(children) ? children : null
    if (normalizedChildren) {
      const childCount = await User.countDocuments({
        _id: { $in: normalizedChildren },
        role: 'student',
      })
      if (childCount !== normalizedChildren.length) {
        return sendError(res, 400, 'One or more children are invalid students.')
      }
      updates.children = normalizedChildren
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10)
    }

    // If role changes, keep fields aligned to that role.
    const effectiveRole = role || existingUser.role
    if (effectiveRole === 'parent') {
      updates.assignedClasses = []
    } else if (effectiveRole === 'teacher' || effectiveRole === 'student') {
      updates.children = []
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select(safeUserFields)

    return sendSuccess(res, 'User updated successfully.', updatedUser)
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 409, 'Duplicate email or username.')
    }
    return sendError(res, 500, 'Failed to update user.')
  }
}

// Admin-only: deactivate a user.
export const deactivateUser = async (req, res) => {
  try {
    // Permission: only admins can deactivate users.
    if (req.user?.role !== 'admin') {
      return sendError(res, 403, 'Access denied. Admins only.')
    }

    const userId = req.params.id || req.params.userId || req.body.userId
    if (!userId) {
      return sendError(res, 400, 'User id is required.')
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true, runValidators: true },
    ).select(safeUserFields)

    if (!user) {
      return sendError(res, 404, 'User not found.')
    }

    return sendSuccess(res, 'User deactivated successfully.', user)
  } catch (error) {
    return sendError(res, 500, 'Failed to deactivate user.')
  }
}
