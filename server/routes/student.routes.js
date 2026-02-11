import { Router } from 'express'
import { protect, authorize } from '../middlewares/index.js'
import * as studentController from '../controllers/student.controller.js'

const studentRoutes = Router()

studentRoutes.use(protect, authorize('student'))

studentRoutes.get('/dashboard', studentController.getStudentDashboard)

studentRoutes.get('/results', studentController.getMyExamResults)
studentRoutes.get('/routine', studentController.getMyClassRoutine)
studentRoutes.get('/subjects', studentController.getMySubjects)
studentRoutes.get('/materials', studentController.getMyMaterials)

studentRoutes.get('/payments', studentController.getMyPayments)

export default studentRoutes
