import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    registrationTimestamp: {
      type: Date,
      default: () => new Date(),
    },
    status: {
      type: String,
      enum: ["Registered", "Attended", "Absent"],
      default: "Registered",
    },
  },
  { timestamps: true }
);

// One registration per user per event (userId for members, email for public guests)
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true, sparse: true });
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true, sparse: true });

export default mongoose.model("Registration", registrationSchema);
