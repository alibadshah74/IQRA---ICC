import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema(
  {
    // Result record per student, exam, and subject.
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    marks: { type: Number, required: true, min: 0 },
    grade: { type: String, trim: true },
    // Teacher/Admin who published the result.
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
)

resultSchema.index({ student: 1, exam: 1, subject: 1 }, { unique: true })

export default mongoose.model('Result', resultSchema)
