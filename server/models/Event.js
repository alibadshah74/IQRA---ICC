import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    colorTheme: { type: String, trim: true, default: '#2563eb' },
    isActive: { type: Boolean, default: true, index: true },
    // Admin who created the event.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

eventSchema.index({ startDate: 1 })
eventSchema.index({ endDate: 1 })
eventSchema.index({ createdBy: 1 })

export default mongoose.model('Event', eventSchema)
