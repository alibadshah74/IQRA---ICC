import { Router } from 'express'
import { getNotices } from '../controllers/notices.controller.js'

const noticesRoutes = Router()

noticesRoutes.get('/', getNotices)

export default noticesRoutes
