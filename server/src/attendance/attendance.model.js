import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Excused"],
      default: "Present",
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same member, event, and date (ignoring time)
attendanceSchema.index({ member: 1, event: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
