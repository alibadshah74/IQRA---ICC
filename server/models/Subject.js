import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true, trim: true },
    // Subject belongs to a class; admins manage assignment.
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    // Assigned teacher (User with role: teacher).
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
)

subjectSchema.index({ class: 1, subjectName: 1 }, { unique: true })
subjectSchema.index({ teacher: 1 })

export default mongoose.model('Subject', subjectSchema)
