import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: { type: String, required: true, unique: true, trim: true, index: true },
    // Store hashed password; hashing handled in controller/service layer.
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'parent'],
      required: true,
      index: true,
    },
    // Student-specific fields.
    rollNumber: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // Parent-only relationship to child user accounts (enforced at controller layer).
    children: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    // Teacher class assignments (enforced at controller layer).
    assignedClasses: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }], default: [] },
    // Admin who created this user record.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ fullName: 1 })

export default mongoose.model('User', userSchema)
