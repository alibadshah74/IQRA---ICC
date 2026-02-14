import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    // Single document holding system-wide configuration.
    academicYear: { type: String, trim: true },
    schoolName: { type: String, trim: true },
    schoolMotto: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    timezone: { type: String, trim: true },
    resultPublishMode: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default mongoose.model('Settings', settingsSchema)
