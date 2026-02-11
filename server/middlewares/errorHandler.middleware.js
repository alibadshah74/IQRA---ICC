/**
 * Global error handling middleware.
 * Centralized error handler; sends structured JSON responses.
 * Stack trace included only in development (NODE_ENV !== 'production').
 */

const isDevelopment = process.env.NODE_ENV !== 'production'

/**
 * Normalize common errors to HTTP status and user-facing message.
 */
function getStatusAndMessage(err) {
  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 600) {
    return { statusCode: err.statusCode, message: err.message || 'Request failed.' }
  }
  if (err.name === 'ValidationError') {
    return { statusCode: 400, message: err.message || 'Validation failed.' }
  }
  if (err.name === 'CastError') {
    return { statusCode: 400, message: 'Invalid identifier or data format.' }
  }
  if (err.code === 11000) {
    return { statusCode: 409, message: 'A record with this value already exists.' }
  }
  return { statusCode: 500, message: 'An unexpected error occurred.' }
}

/**
 * Global error handler. Register last, after all routes and other middleware.
 *
 * @param {Error} err - Error object passed from next(err)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  const { statusCode, message } = getStatusAndMessage(err)

  const payload = {
    success: false,
    message: isDevelopment ? (err.message || message) : message,
  }

  if (isDevelopment && err.stack) {
    payload.stack = err.stack
  }

  res.status(statusCode).json(payload)
}
