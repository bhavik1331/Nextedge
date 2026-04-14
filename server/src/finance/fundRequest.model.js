import mongoose from "mongoose";

const fundRequestSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      required: true,
      trim: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    amountRequested: {
      type: Number,
      required: true,
      min: 0,
    },
    amountReleased: {
      type: Number,
      default: null,
      min: 0,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    requiredByDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
        "RELEASED",
      ],
      default: "PENDING_APPROVAL",
    },
    treasurerNotes: {
      type: String,
      default: null,
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
    requestedById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    requestedByName: {
      type: String,
      required: true,
      trim: true,
    },
    decidedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    decidedByName: {
      type: String,
      default: null,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
    releasedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const FundRequest = mongoose.model("FundRequest", fundRequestSchema);

export default FundRequest;
