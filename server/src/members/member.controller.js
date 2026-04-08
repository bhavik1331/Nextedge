import mongoose from "mongoose";
import Member from "./member.model.js";
import {
  generateTokens,
  verifyRefreshToken,
  generateAccessToken,
} from "../utils/jwt.js";
import { AuditLog } from "../audit/audit.model.js";
import Registration from "../events/registration.model.js";
import Payment from "../payments/payment.model.js";
import { uploadBuffer } from "../events/uploadToImageKit.js";
import imagekit from "../config/imagekit.js";
import Notification from "../notifications/notification.model.js";

const MEMBER_REFRESH_COOKIE = "memberRefreshToken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const member = await Member.findOne({ email: email.toLowerCase() }).select("+password");
    if (!member) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (!member.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const valid = await member.comparePassword(password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      id: member._id,
      email: member.email,
      role: member.role,
    };
    const { accessToken, refreshToken } = generateTokens(payload);

    res.cookie(MEMBER_REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAMESITE || "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      member: member.toSafeObject(),
    });
  } catch (error) {
    console.error("Member login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies[MEMBER_REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded.role || decoded.role.toUpperCase() !== "MEMBER") {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const member = await Member.findById(decoded.id);
    if (!member || !member.isActive) {
      return res.status(403).json({
        success: false,
        message: "Member not found or inactive",
      });
    }

    const payload = {
      id: member._id,
      email: member.email,
      role: member.role,
    };
    const accessToken = generateAccessToken(payload);

    res.status(200).json({
      success: true,
      accessToken,
      member: member.toSafeObject(),
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || "Invalid refresh token",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie(MEMBER_REFRESH_COOKIE, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAMESITE || "lax",
    });
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

export const verifyMember = async (req, res) => {
  try {
    const member = await Member.findById(req.member.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }
    res.status(200).json({
      success: true,
      member: member.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * GET /api/members (Admin only) - List all members
 */
export const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 }).lean();
    const list = members.map((m) => ({
      _id: m._id,
      name: m.name,
      email: m.email,
      role: m.role,
      isActive: m.isActive,
      createdAt: m.createdAt,
    }));
    res.json({ success: true, members: list });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load members",
    });
  }
};

/**
 * POST /api/members (Admin only) - Create a new member account
 * Body: { email, password }
 */
export const createMember = async (req, res) => {
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    const name = (req.body?.name || "").trim();
    const password = req.body?.password;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters",
      });
    }

    const existing = await Member.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A member with this email already exists",
      });
    }

    const member = await Member.create({ name, email, password });
    
    // Audit Log Entry
    await AuditLog.create({
      action: 'MEMBER_CREATED',
      performedBy: req.member.id,
      targetUser: member._id,
      details: { email }
    });

    res.status(201).json({
      success: true,
      message: "Member account created. Share the login details with them.",
      member: member.toSafeObject(),
    });
  } catch (error) {
    console.error("Create member error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create member",
    });
  }
};

/**
 * PUT /api/members/:id/role (Admin only) - Change member role limit
 * Body: { role }
 */
export const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["ADMIN", "CLUB_HEAD", "TREASURER", "MEMBER"];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const previousRole = member.role;
    member.role = role;
    await member.save();

    // Securely log the Audit History
    await AuditLog.create({
      action: 'ROLE_UPDATE',
      performedBy: req.member.id,
      targetUser: member._id,
      details: { previousRole, newRole: role }
    });

    res.json({
      success: true,
      message: `Successfully promoted member to ${role}.`,
      member: member.toSafeObject()
    });
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update role" });
  }
};

/**
 * GET /api/members/dashboard-stats
 * Returns summary stats for the logged-in member.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const memberId = req.member.id;

    // 1. Total Events Joined
    const totalEventsJoined = await Registration.countDocuments({ userId: memberId });

    // 2. Attendance Percentage
    const attendanceStats = await Registration.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(memberId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
        },
      },
    ]);

    let attendancePercentage = 0;
    if (attendanceStats.length > 0 && attendanceStats[0].total > 0) {
      attendancePercentage = Math.round((attendanceStats[0].attended / attendanceStats[0].total) * 100);
    }

    // 3. Pending Payments
    const pendingPayments = await Payment.countDocuments({ 
      memberId: memberId,
      status: "Pending" 
    });

    // 4. Recent Notifications
    const email = req.member.email;
    const recentNotificationsCount = await Notification.countDocuments({
      $or: [
        { recipientEmail: email },
        { recipientType: 'BULK' }
      ]
    });

    res.status(200).json({
      success: true,
      stats: {
        totalEventsJoined,
        attendancePercentage,
        pendingPayments,
        recentNotificationsCount
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: true, // Returning success true but with 0s if it fails or just handle error
      message: "Failed to load dashboard stats",
      stats: {
        totalEventsJoined: 0,
        attendancePercentage: 0,
        pendingPayments: 0,
        recentNotificationsCount: 0
      }
    });
  }
};

/**
 * PUT /api/members/profile
 * Updates the profile of the logged-in member.
 * Body: { name, bio, description, skills }
 */
export const updateProfile = async (req, res) => {
  try {
    const memberId = req.member.id;
    const { name, bio, description, skills } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    if (name) member.name = name.trim();
    if (bio !== undefined) member.bio = bio.trim();
    if (description !== undefined) member.description = description.trim();
    if (skills !== undefined) {
      member.skills = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : []);
    }

    await member.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      member: member.toSafeObject(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

/**
 * POST /api/members/avatar
 * Uploads a profile picture for the logged-in member.
 */
export const uploadAvatar = async (req, res) => {
  try {
    const memberId = req.member.id;
    
    if (!req.files || !req.files.avatar || req.files.avatar.length === 0) {
      return res.status(400).json({ success: false, message: "No avatar image provided." });
    }

    const file = req.files.avatar[0];
    const fileName = `member_avatar_${memberId}_${Date.now()}`;
    
    // Upload to ImageKit
    const result = await uploadBuffer(file.buffer, "members/avatars", fileName);
    
    const member = await Member.findByIdAndUpdate(
      memberId, 
      { avatar: result.url }, 
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully.",
      member: member.toSafeObject(),
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ success: false, message: "Failed to upload avatar." });
  }
};


