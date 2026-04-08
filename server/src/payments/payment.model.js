import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: true, // e.g., 'Membership Fee', 'Event Registration'
    },
    paymentType: {
      type: String,
      enum: ['manual', 'online'],
      default: 'manual',
    },
    proofUrl: {
      type: String, // from ImageKit usually
    },
    proofPublicId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String, // future extension
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    notes: {
      type: String,
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
