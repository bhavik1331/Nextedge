import express from "express";
import {
  markAttendance,
  getAttendance,
  updateAttendanceRecord,
  getMyAttendance,
  getAttendanceReport
} from "./attendance.controller.js";
import { authenticateMember } from "../members/member.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

// Member-only route: View their own attendance and percentage
router.get("/my", authenticateMember, getMyAttendance);

// Admin-level routes: Mark, Fetch, and Update attendance
router.use(authenticateMember, authorizeRole("ADMIN", "CLUB_HEAD", "TREASURER"));

router.post("/", markAttendance);
router.get("/", getAttendance);
router.get("/report", getAttendanceReport);
router.put("/:id", updateAttendanceRecord);

export default router;
