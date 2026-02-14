import mongoose from 'mongoose'

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true },
    fileType: { type: String, trim: true },
    fileSize: { type: Number },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

noticeSchema.index({ createdAt: -1 })

export default mongoose.model('Notice', noticeSchema)
