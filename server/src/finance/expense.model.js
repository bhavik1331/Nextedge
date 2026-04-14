import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ["EVENT", "OPERATIONS", "EQUIPMENT", "MISC"],
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    receiptFileUrl: {
      type: String,
      default: null,
    },
    receiptFileId: {
      type: String,
      default: null,
    },
    recordedById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    recordedByName: {
      type: String,
      required: true,
      trim: true,
    },
    ledgerEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isReversed: {
      type: Boolean,
      default: false,
    },
    reversedAt: {
      type: Date,
      default: null,
    },
    reversalReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
