import Event from "./event.model.js";
import Registration from "./registration.model.js";
import Member from "../members/member.model.js";
import Admin from "../Admin/admin.model.js";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Get event's effective start date (UTC).
 */
function getEventStartDate(event) {
  const d = event.eventStartDate || event.date;
  return d ? new Date(d) : null;
}

/**
 * Server-side validation: can the current user/guest register for this event?
 * Returns { allowed, message }.
 */
function canRegister(event, now, { userId = null, email = null, isMember = false }) {
  const start = getEventStartDate(event);
  const regStart = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
  const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : null;

  if (!start || start <= now) {
    return { allowed: false, message: "Event has already started." };
  }
  if (!regStart || !regEnd) {
    return { allowed: false, message: "Registration window is not set for this event." };
  }
  if (now < regStart) {
    return { allowed: false, message: "Registration is not open yet." };
  }
  if (now > regEnd) {
    return { allowed: false, message: "Registration has closed." };
  }

  const accessType = event.accessType || "public";
  if (accessType === "members") {
    if (!isMember || !userId) {
      return { allowed: false, message: "Members only event. Please log in as a member." };
    }
  } else {
    if (!email && !userId) {
      return { allowed: false, message: "Email is required for registration." };
    }
  }

  return { allowed: true };
}

// Anti-spam: honeypot must be empty; confirmWord must match (case-insensitive)
const CONFIRM_WORD = "EVENT";

function validateAntiSpam(body) {
  if (body.website && String(body.website).trim() !== "") {
    return { ok: false, message: "Invalid request." };
  }
  const word = (body.confirmWord || "").trim();
  if (word.toLowerCase() !== CONFIRM_WORD.toLowerCase()) {
    return { ok: false, message: "Please type the word correctly to confirm you're human." };
  }
  return { ok: true };
}

/**
 * POST /api/events/:eventId/register
 * Body: { name, email } for public; optional name for members.
 * Anti-spam: body.website must be empty, body.confirmWord must match "EVENT".
 */
export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const now = new Date();
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const isMember = !!req.member;
    const userId = req.member?.id || null;
    const email = (req.body?.email || "").trim().toLowerCase() || (req.member?.email || null);
    const name = (req.body?.name || "").trim() || null;

    // Anti-spam for guest registrations (members are already authenticated)
    if (!isMember) {
      const spam = validateAntiSpam(req.body || {});
      if (!spam.ok) {
        return res.status(400).json({ success: false, message: spam.message });
      }
    }

    const { allowed, message } = canRegister(event, now, {
      userId,
      email: email || undefined,
      isMember,
    });
    if (!allowed) {
      return res.status(400).json({ success: false, message });
    }

    // Duplicate check: by userId if member, else by email for public
    let existing = null;
    if (userId) {
      existing = await Registration.findOne({ eventId, userId });
    } else if (email) {
      existing = await Registration.findOne({ eventId, email });
    }
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this event.",
      });
    }

    const registration = await Registration.create({
      eventId,
      userId: userId || undefined,
      name: name || undefined,
      email: email || undefined,
      registrationTimestamp: now,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      registration: {
        _id: registration._id,
        eventId: registration.eventId,
        registrationTimestamp: registration.registrationTimestamp,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this event.",
      });
    }
    console.error("Register for event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register.",
    });
  }
};

/**
 * Optional middleware: attach req.member if Bearer token is valid member (no 401 if missing).
 */
export const optionalMemberAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }
    const token = authHeader.split(" ")[1];
    if (!token) return next();
    const decoded = verifyAccessToken(token);
    const validRoles = ["MEMBER", "ADMIN", "CLUB_HEAD", "TREASURER"];
    if (!validRoles.includes(decoded.role?.toUpperCase())) return next();
    
    // Hybrid Check
    let user = await Member.findById(decoded.id);
    if (!user) {
      user = await Admin.findById(decoded.id);
    }

    if (!user || !user.isActive) return next();
    
    req.member = { 
      id: user._id, 
      email: user.email || user.username, 
      role: user.role?.toUpperCase() || 'MEMBER' 
    };
    next();
  } catch (e) {
    next();
  }
};

/**
 * GET /api/events/:eventId/register/status
 * Returns { registered: boolean, message? }.
 * For members: identify by userId; for public: optional query ?email=...
 */
export const getRegistrationStatus = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const userId = req.member?.id || null;
    const email = (req.query.email || "").trim().toLowerCase();

    let registered = false;
    if (userId) {
      const r = await Registration.findOne({ eventId, userId });
      registered = !!r;
    } else if (email) {
      const r = await Registration.findOne({ eventId, email });
      registered = !!r;
    }

    res.json({ success: true, registered });
  } catch (error) {
    console.error("Get registration status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get status.",
    });
  }
};

/**
 * GET /api/events/:eventId/registrations (Admin only)
 * Returns list of registrations for the event: email, registrationTimestamp, type (member|guest).
 */
export const getEventRegistrations = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const list = await Registration.find({ eventId })
      .populate("userId", "email")
      .sort({ registrationTimestamp: -1 })
      .lean();

    const registrations = list.map((r) => ({
      _id: r._id,
      name: r.name || "—",
      email: r.userId?.email || r.email || "—",
      type: r.userId ? "member" : "guest",
      registrationTimestamp: r.registrationTimestamp,
    }));

    res.json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    console.error("Get event registrations error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load registrations.",
    });
  }
};
