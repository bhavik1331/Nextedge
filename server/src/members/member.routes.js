import express from "express";
import {
  login,
  refreshAccessToken,
  logout,
  verifyMember,
  getAllMembers,
  createMember,
  updateRole,
  getDashboardStats,
  updateProfile,
  uploadAvatar,
} from "./member.controller.js";
import upload from "../events/upload.js";
import { authenticateMember } from "./member.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.get("/verify", authenticateMember, verifyMember);
router.get("/dashboard-stats", authenticateMember, getDashboardStats);
router.put("/profile", authenticateMember, updateProfile);
router.post(
  "/avatar",
  authenticateMember,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  uploadAvatar,
);

// Protected elevated endpoints
router.get(
  "/",
  authenticateMember,
  authorizeRole("ADMIN", "CLUB_HEAD", "TREASURER"),
  getAllMembers,
);
router.post(
  "/",
  authenticateMember,
  authorizeRole("ADMIN", "CLUB_HEAD"),
  createMember,
);
router.put("/:id/role", authenticateMember, authorizeRole("ADMIN"), updateRole);

export default router;
