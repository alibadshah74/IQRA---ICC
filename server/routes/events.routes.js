import { Router } from 'express'
import { protect, authorize } from '../middlewares/index.js'
import { getActiveEvents } from '../controllers/events.controller.js'

const eventsRoutes = Router()

eventsRoutes.use(protect, authorize('admin', 'teacher', 'student', 'parent'))

eventsRoutes.get('/active', getActiveEvents)

export default eventsRoutes
