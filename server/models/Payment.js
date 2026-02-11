import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    // Student who made the payment.
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, enum: ['cash', 'online', 'bank'], required: true },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending', index: true },
    // Human-readable invoice reference for receipts.
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
)

paymentSchema.index({ student: 1, paymentDate: -1 })

export default mongoose.model('Payment', paymentSchema)
