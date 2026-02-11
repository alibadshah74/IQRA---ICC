/**
 * Middleware layer for IQRA School Management System.
 * Named exports for authentication, authorization, scope, error handling, and not-found.
 */

export { authenticate } from './auth.middleware.js'
export { authenticate as protect } from './auth.middleware.js'
export { authorize } from './authorize.middleware.js'
export { requireDataScope, requireClassScope } from './scope.middleware.js'
export { errorHandler } from './errorHandler.middleware.js'
export { notFound } from './notFound.middleware.js'
