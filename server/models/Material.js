import mongoose from 'mongoose'

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true },
    fileType: { type: String, trim: true },
    fileSize: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
)

materialSchema.index({ class: 1, teacher: 1, isActive: 1 })

export default mongoose.model('Material', materialSchema)
