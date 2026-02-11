import { Router } from 'express'
import { protect, authorize } from '../middlewares/index.js'
import * as authController from '../controllers/auth.controller.js'

const authRoutes = Router()

authRoutes.post('/login', authController.loginUser)
authRoutes.post('/logout', authController.logoutUser)
authRoutes.post('/register', protect, authorize('admin'), authController.registerUser)
authRoutes.get('/me', protect, authController.getMe)

export default authRoutes
