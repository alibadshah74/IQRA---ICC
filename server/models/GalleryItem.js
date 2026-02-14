import mongoose from 'mongoose'

const galleryItemSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true },
    fileType: { type: String, trim: true },
    fileSize: { type: Number },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    isActive: { type: Boolean, default: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

galleryItemSchema.index({ createdAt: -1 })
galleryItemSchema.index({ mediaType: 1 })

export default mongoose.model('GalleryItem', galleryItemSchema)
