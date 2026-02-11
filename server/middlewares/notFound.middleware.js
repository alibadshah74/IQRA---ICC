/**
 * Not Found (404) middleware.
 * Handles requests to undefined routes with a consistent JSON response.
 * Register after all route definitions, before the global error handler.
 */

export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  })
}
