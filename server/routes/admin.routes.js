import { Router } from 'express'
import { protect, authorize } from '../middlewares/index.js'
import { upload } from '../middlewares/upload.middleware.js'
import * as authController from '../controllers/auth.controller.js'
import * as adminController from '../controllers/admin.controller.js'

const adminRoutes = Router()

adminRoutes.use(protect, authorize('admin'))

adminRoutes.get('/users', authController.getAllUsers)
adminRoutes.get('/users/:id', authController.getUserById)
adminRoutes.post('/users', authController.registerUser)
adminRoutes.put('/users/:id', authController.updateUser)
adminRoutes.patch('/users/:id/deactivate', authController.deactivateUser)

adminRoutes.get('/dashboard/stats', adminController.getAdminDashboardStats)

adminRoutes.get('/classes', adminController.getClasses)
adminRoutes.post('/classes', adminController.createClass)
adminRoutes.put('/classes/:id', adminController.updateClass)
adminRoutes.patch('/classes/:id/disable', adminController.disableClass)
adminRoutes.get('/subjects', adminController.getSubjects)
adminRoutes.post('/subjects', adminController.createSubject)
adminRoutes.put('/subjects/:id', adminController.updateSubject)
adminRoutes.patch('/subjects/:id/disable', adminController.disableSubject)

adminRoutes.get('/routines', adminController.getRoutines)
adminRoutes.post('/routines', adminController.createRoutine)
adminRoutes.put('/routines/:id', adminController.updateRoutine)
adminRoutes.patch('/routines/:id/disable', adminController.disableRoutine)

adminRoutes.get('/exams', adminController.getExams)
adminRoutes.post('/exams', adminController.createExam)
adminRoutes.put('/exams/:id', adminController.updateExam)
adminRoutes.patch('/exams/:id/disable', adminController.disableExam)

adminRoutes.get('/results', adminController.fetchAllExamResults)
adminRoutes.get('/payments', adminController.fetchAllPayments)
adminRoutes.get('/events', adminController.fetchAllEvents)
adminRoutes.post('/events', adminController.createEvent)
adminRoutes.put('/events/:id', adminController.updateEvent)
adminRoutes.patch('/events/:id/disable', adminController.disableEvent)

adminRoutes.post('/gallery', upload.single('file'), adminController.createGalleryItem)

adminRoutes.get('/notices', adminController.fetchNotices)
adminRoutes.post('/notices', upload.single('file'), adminController.createNotice)
adminRoutes.put('/notices/:id', upload.single('file'), adminController.updateNotice)
adminRoutes.delete('/notices/:id', adminController.deleteNotice)

adminRoutes.get('/settings', adminController.getSettings)
adminRoutes.put('/settings', adminController.updateSettings)

export default adminRoutes
