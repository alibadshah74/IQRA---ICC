import { Router } from 'express'
import authRoutes from './auth.routes.js'
import adminRoutes from './admin.routes.js'
import teacherRoutes from './teacher.routes.js'
import studentRoutes from './student.routes.js'
import parentRoutes from './parent.routes.js'
import eventsRoutes from './events.routes.js'
import galleryRoutes from './gallery.routes.js'
import noticesRoutes from './notices.routes.js'
import settingsRoutes from './settings.routes.js'

const router = Router()

router.get('/health', (req, res) => res.json({ success: true, message: 'ok' }))

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/teacher', teacherRoutes)
router.use('/student', studentRoutes)
router.use('/parent', parentRoutes)
router.use('/events', eventsRoutes)
router.use('/gallery', galleryRoutes)
router.use('/notices', noticesRoutes)
router.use('/settings', settingsRoutes)

export default router
