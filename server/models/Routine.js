import mongoose from 'mongoose'

const routineSchema = new mongoose.Schema(
  {
    // Class schedule entry for a specific day/time.
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
)

routineSchema.index({ class: 1, day: 1, startTime: 1, endTime: 1, isActive: 1 }, { unique: true })

export default mongoose.model('Routine', routineSchema)
