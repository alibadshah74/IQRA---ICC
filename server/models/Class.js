import mongoose from 'mongoose'

const classSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, trim: true },
    section: { type: String, trim: true },
    // Assigned class teacher (User with role: teacher).
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

classSchema.index({ className: 1, section: 1 }, { unique: true })
classSchema.index({ classTeacher: 1 })

export default mongoose.model('Class', classSchema)
