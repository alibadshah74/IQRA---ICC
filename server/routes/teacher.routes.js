import { Router } from 'express'
import { protect, authorize } from '../middlewares/index.js'
import { upload } from '../middlewares/upload.middleware.js'
import * as teacherController from '../controllers/teacher.controller.js'

const teacherRoutes = Router()

teacherRoutes.use(protect, authorize('teacher'))

teacherRoutes.get('/dashboard', teacherController.getTeacherDashboard)

teacherRoutes.get('/students', teacherController.getMyStudents)
teacherRoutes.post('/students', teacherController.createStudent)
teacherRoutes.put('/students/:id', teacherController.updateStudent)
teacherRoutes.patch('/students/:id/disable', teacherController.disableStudent)

teacherRoutes.get('/classes', teacherController.getMyClasses)
teacherRoutes.get('/subjects', teacherController.getMySubjects)
teacherRoutes.post('/subjects', teacherController.createSubject)
teacherRoutes.put('/subjects/:id', teacherController.updateSubject)
teacherRoutes.patch('/subjects/:id/disable', teacherController.disableSubject)

teacherRoutes.get('/routines', teacherController.getMyRoutines)
teacherRoutes.post('/routines', teacherController.createRoutine)
teacherRoutes.put('/routines/:id', teacherController.updateRoutine)
teacherRoutes.patch('/routines/:id/disable', teacherController.disableRoutine)

teacherRoutes.get('/exams', teacherController.getMyExams)
teacherRoutes.post('/exams', teacherController.createExam)
teacherRoutes.put('/exams/:id', teacherController.updateExam)
teacherRoutes.patch('/exams/:id/disable', teacherController.disableExam)

teacherRoutes.get('/results', teacherController.getMyResults)
teacherRoutes.post('/results', teacherController.createResult)
teacherRoutes.put('/results/:id', teacherController.updateResult)
teacherRoutes.patch('/results/:id/disable', teacherController.disableResult)

teacherRoutes.get('/materials', teacherController.getMyMaterials)
teacherRoutes.post('/materials', upload.single('file'), teacherController.createMaterial)
teacherRoutes.put('/materials/:id', upload.single('file'), teacherController.updateMaterial)
teacherRoutes.patch('/materials/:id/disable', teacherController.disableMaterial)

export default teacherRoutes
