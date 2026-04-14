import mongoose from "mongoose";

const ledgerEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    runningBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      default: "GENERAL",
      trim: true,
    },
    referenceType: {
      type: String,
      enum: ["PAYMENT", "FUND_RELEASE", "EXPENSE", "MANUAL", "REVERSAL"],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdByName: {
      type: String,
      trim: true,
    },
    isReversed: {
      type: Boolean,
      default: false,
    },
    reversalEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    reversalReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const LedgerEntry = mongoose.model("LedgerEntry", ledgerEntrySchema);

export default LedgerEntry;
