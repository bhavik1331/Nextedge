import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      enum: ["ONLINE", "CASH"],
      default: "ONLINE",
    },
    purpose: {
      type: String,
      required: true, // e.g., 'Membership Fee', 'Event Registration'
    },
    transactionId: {
      type: String,
      default: null,
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentType: {
      type: String,
      enum: ["manual", "online"],
      default: "manual",
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
      enum: [
        "SUBMITTED",
        "PENDING_REVIEW",
        "APPROVED",
        "REJECTED",
        "CLARIFICATION_NEEDED",
        "Pending",
        "Approved",
        "Rejected",
        "Pending Review",
        "Clarification Needed",
      ],
      default: "PENDING_REVIEW",
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
    treasurerNote: {
      type: String,
      default: null,
      trim: true,
    },
    approvedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    approvedByName: {
      type: String,
      default: null,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    actionedAt: {
      type: Date,
      default: null,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    receiptNumber: {
      type: String,
      default: null,
      trim: true,
    },
    ledgerEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    auditTrail: [
      {
        status: {
          type: String,
          required: true,
        },
        note: {
          type: String,
          default: null,
          trim: true,
        },
        actedById: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        actedByName: {
          type: String,
          default: null,
          trim: true,
        },
        actedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: {
      type: String,
    },
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
