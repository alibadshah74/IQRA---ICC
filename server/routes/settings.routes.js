import { Router } from 'express'
import { getPublicSettings } from '../controllers/settings.controller.js'

const settingsRoutes = Router()

settingsRoutes.get('/', getPublicSettings)

export default settingsRoutes
