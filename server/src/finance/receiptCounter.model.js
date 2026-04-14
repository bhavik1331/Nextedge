import mongoose from "mongoose";

const receiptCounterSchema = new mongoose.Schema(
  {
    period: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const ReceiptCounter = mongoose.model("ReceiptCounter", receiptCounterSchema);

export default ReceiptCounter;
