import { Router } from 'express'
import { protect, authorize } from '../middlewares/index.js'
import * as parentController from '../controllers/parent.controller.js'

const parentRoutes = Router()

parentRoutes.use(protect, authorize('parent'))

parentRoutes.get('/dashboard', parentController.getParentDashboard)

parentRoutes.get('/children', parentController.getChildrenList)
parentRoutes.get('/children/:childId/results', parentController.getChildExamResults)
parentRoutes.get('/children/:childId/routine', parentController.getChildRoutine)
parentRoutes.get('/children/:childId/payments', parentController.getChildPayments)
parentRoutes.get('/children/:childId/subjects', parentController.getChildSubjects)

export default parentRoutes
