import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Authentication middleware.
 * Verifies JWT from Authorization: Bearer <token>, fetches user from DB,
 * attaches user to req.user. Blocks if token is missing, invalid, expired, or user is inactive.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      code: 'NO_TOKEN',
    })
  }

  const parts = authHeader.trim().split(/\s+/)
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Use: Bearer <token>',
      code: 'INVALID_HEADER',
    })
  }

  const token = parts[1]
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      code: 'NO_TOKEN',
    })
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error.',
      code: 'CONFIG_ERROR',
    })
  }

  let decoded
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError'
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token has expired.' : 'Invalid or malformed token.',
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
    })
  }

  if (!decoded?.id) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token payload.',
      code: 'INVALID_TOKEN',
    })
  }

  User.findById(decoded.id)
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token may be invalid.',
          code: 'USER_NOT_FOUND',
        })
      }
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated.',
          code: 'ACCOUNT_DEACTIVATED',
        })
      }
      req.user = user
      next()
    })
    .catch((err) => {
      next(err)
    })
}
