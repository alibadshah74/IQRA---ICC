import { Router } from 'express'
import { getGalleryItems } from '../controllers/gallery.controller.js'

const galleryRoutes = Router()

galleryRoutes.get('/', getGalleryItems)

export default galleryRoutes
