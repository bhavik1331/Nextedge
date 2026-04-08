import Attendance from "./attendance.model.js";
import Member from "../members/member.model.js";
import Event from "../events/event.model.js";
import mongoose from "mongoose";

/**
 * @desc    Mark attendance for multiple members
 * @route   POST /api/attendance
 * @access  Admin only
 */
export const markAttendance = async (req, res) => {
  try {
    const { event_id, date, records } = req.body; // records: [{ member_id, status, notes }]

    if (!event_id || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0); // Normalize date

    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        const attendance = await Attendance.findOneAndUpdate(
          {
            member: record.member_id,
            event: event_id,
            date: attendanceDate,
          },
          {
            status: record.status || "Present",
            notes: record.notes || "",
            markedBy: req.member.id, // req.member from auth middleware
          },
          { upsert: true, new: true, runValidators: true }
        );
        results.push(attendance);
      } catch (err) {
        errors.push({ member_id: record.member_id, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      count: results.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully processed ${results.length} attendance records`,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to mark attendance" });
  }
};

/**
 * @desc    Get attendance records for an event or date
 * @route   GET /api/attendance
 * @access  Admin only
 */
export const getAttendance = async (req, res) => {
  try {
    const { event_id, date, member_id } = req.query;
    const filter = {};

    if (event_id) filter.event = event_id;
    if (member_id) filter.member = member_id;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      filter.date = d;
    }

    const attendance = await Attendance.find(filter)
      .populate("member", "name email")
      .populate("event", "title date")
      .populate("markedBy", "name username")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch attendance records" });
  }
};

/**
 * @desc    Update a specific attendance record
 * @route   PUT /api/attendance/:id
 * @access  Admin only
 */
export const updateAttendanceRecord = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, notes, markedBy: req.member.id },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record updated",
      record,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to update record" });
  }
};

/**
 * @desc    Get member's own attendance stats and history
 * @route   GET /api/attendance/my
 * @access  Member only
 */
export const getMyAttendance = async (req, res) => {
  try {
    const memberId = req.member.id;

    const history = await Attendance.find({ member: memberId })
      .populate("event", "title date eventStartDate")
      .sort({ date: -1 });

    const total = history.length;
    const present = history.filter(r => r.status === "Present").length;
    const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      stats: {
        total,
        present,
        attendancePercentage,
      },
      history,
    });
  } catch (error) {
    console.error("Get my attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your attendance" });
  }
};

/**
 * @desc    Generate simple summary report
 * @route   GET /api/attendance/report
 * @access  Admin only
 */
export const getAttendanceReport = async (req, res) => {
    try {
        const { event_id } = req.query;
        if(!event_id) return res.status(400).json({success: false, message: "Event ID is required for report"});

        const report = await Attendance.aggregate([
            { $match: { event: new mongoose.Types.ObjectId(event_id) } },
            { $group: {
                _id: "$status",
                count: { $sum: 1 },
                members: { $push: "$member" }
            }}
        ]);

        res.status(200).json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: "Report generation failed" });
    }
}
