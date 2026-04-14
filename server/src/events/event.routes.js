import express from "express";
import upload from "./upload.js";
import {
  createEvent,
  getAllEvents,
  getUpcomingEvents,
  getPastEvents,
  getEventById,
  deleteEvent,
  updateEvent,
  addEventMedia,
  deleteEventMedia,
  getAllEventImages,
} from "./event.controller.js";
import {
  registerForEvent,
  getRegistrationStatus,
  getEventRegistrations,
  optionalMemberAuth,
} from "./registration.controller.js";
import { authenticateMember } from "../members/member.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();
const eventManagerGuard = [
  authenticateMember,
  authorizeRole("ADMIN", "CLUB_HEAD"),
];

// Protected routes - Admin and Club Head
router.post(
  "/",
  ...eventManagerGuard,
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
  createEvent,
);

// update event details
router.put("/:id", ...eventManagerGuard, updateEvent);

// add images
router.patch(
  "/:id/media",
  ...eventManagerGuard,
  upload.fields([{ name: "images", maxCount: 10 }]),
  addEventMedia,
);
// delete single media
router.delete("/:id/media/:publicId", ...eventManagerGuard, deleteEventMedia);

// delete event
router.delete("/:id", ...eventManagerGuard, deleteEvent);

// Public routes
router.get("/", getAllEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/past", getPastEvents);
router.get("/gallery", getAllEventImages);

// Registration (must be before /:id so :eventId is not consumed by :id)
router.post("/:eventId/register", optionalMemberAuth, registerForEvent);
router.get(
  "/:eventId/register/status",
  optionalMemberAuth,
  getRegistrationStatus,
);
router.get(
  "/:eventId/registrations",
  ...eventManagerGuard,
  getEventRegistrations,
);

router.get("/:id", getEventById);

export default router;
