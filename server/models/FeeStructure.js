import mongoose from 'mongoose'

const feeStructureSchema = new mongoose.Schema(
  {
    // Class that this fee structure applies to.
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
)

feeStructureSchema.index({ class: 1, dueDate: 1 }, { unique: true })

export default mongoose.model('FeeStructure', feeStructureSchema)
