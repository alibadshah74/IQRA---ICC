import mongoose from 'mongoose'

const examSchema = new mongoose.Schema(
  {
    examName: { type: String, required: true, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    examDate: { type: Date },
    totalMarks: { type: Number, min: 0 },
    gradeScale: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    // Admin or teacher who created the exam.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
)

examSchema.index({ class: 1, examDate: 1 })

export default mongoose.model('Exam', examSchema)
