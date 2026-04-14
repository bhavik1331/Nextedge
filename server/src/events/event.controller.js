import Event from "./event.model.js";
import { uploadBuffer } from "./uploadToImageKit.js";
import imagekit from "../config/imagekit.js";
import { isValidYoutubeUrl } from "../utils/youtube.js";
import { sendEmail } from "../utils/mailer.js";
import Member from "../members/member.model.js";

/** Normalize event for API: ensure eventStartDate and date; use UTC. */
function normalizeEvent(event) {
  if (!event) return null;
  const doc = event.toObject ? event.toObject() : { ...event };
  const start = doc.eventStartDate || doc.date;
  if (start) {
    doc.eventStartDate = new Date(start);
    doc.date = doc.date || doc.eventStartDate;
  }
  if (doc.registrationStartDate)
    doc.registrationStartDate = new Date(doc.registrationStartDate);
  if (doc.registrationEndDate)
    doc.registrationEndDate = new Date(doc.registrationEndDate);
  doc.accessType = doc.accessType || "public";
  return doc;
}

// CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    let coverImage = undefined;

    // Handle single cover image upload
    if (req.files?.coverImage && req.files.coverImage.length > 0) {
      const file = req.files.coverImage[0];
      const fileName = `event_cover_${Date.now()}_${Math.floor(
        Math.random() * 1000,
      )}`;
      console.log("Uploading cover image:", fileName);
      const result = await uploadBuffer(file.buffer, "events/covers", fileName);
      console.log("Cover upload result:", result);
      coverImage = {
        url: result.url,
        publicId: result.fileId,
      };
    }

    // Validate YouTube URL if provided
    if (
      req.body.youtubeVideoUrl &&
      !isValidYoutubeUrl(req.body.youtubeVideoUrl)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid YouTube URL" });
    }

    const eventStartDate = req.body.eventStartDate || req.body.date;
    const registrationStartDate =
      req.body.registrationStartDate || eventStartDate;
    const registrationEndDate = req.body.registrationEndDate || eventStartDate;
    const accessType = req.body.accessType === "members" ? "members" : "public";

    if (!eventStartDate) {
      return res.status(400).json({
        success: false,
        message: "Event start date (eventStartDate or date) is required",
      });
    }

    const eventData = {
      title: req.body.title,
      description: req.body.description,
      date: eventStartDate,
      eventStartDate,
      registrationStartDate,
      registrationEndDate,
      accessType,
      location: req.body.location,
      youtubeVideoUrl: req.body.youtubeVideoUrl || undefined,
      images: [],
      createdBy: req.member?.id || req.admin?.id,
    };

    if (coverImage) eventData.coverImage = coverImage;

    const event = await Event.create(eventData);

    // Send email notification to all members about the new event
    try {
      const members = await Member.find().select("email");
      if (members && members.length > 0) {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0056b3; padding: 20px; text-align: center; color: white;">
              <h2 style="margin: 0;">New Event Created!</h2>
            </div>
            <div style="padding: 20px;">
              <h3 style="color: #0056b3;">${eventData.title}</h3>
              <p>${eventData.description}</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(eventStartDate).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${eventData.location || "TBA"}</p>
              </div>
              <br>
              <p>Check out our portal for more details and to register!</p>
              <br>
              <p style="margin: 0;">Best regards,</p>
              <p style="margin: 0; font-weight: bold;">NextEdge Society Team</p>
            </div>
          </div>
        `;

        const emailPromises = members.map((member) => {
          if (member.email) {
            return sendEmail({
              to: member.email,
              subject: `New Event: ${eventData.title}`,
              html: htmlContent,
            }).catch((e) =>
              console.error(
                `Failed sending new event email to ${member.email}`,
              ),
            );
          }
        });
        await Promise.all(emailPromises);
      }
    } catch (emailError) {
      console.error("Error sending new event email notifications:", emailError);
    }

    res.status(201).json({ success: true, event: normalizeEvent(event) });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL EVENTS
export const getAllEvents = async (req, res) => {
  const events = await Event.find().sort({
    date: 1,
    eventStartDate: 1,
    createdAt: 1,
  });
  res.json({ success: true, events: events.map(normalizeEvent) });
};

// GET UPCOMING EVENTS
export const getUpcomingEvents = async (req, res) => {
  const now = new Date();
  const events = await Event.find({
    $or: [{ date: { $gte: now } }, { eventStartDate: { $gte: now } }],
  }).sort({ date: 1, eventStartDate: 1 });

  res.json({ success: true, events: events.map(normalizeEvent) });
};

// GET PAST EVENTS
export const getPastEvents = async (req, res) => {
  const now = new Date();
  const events = await Event.find({
    $or: [{ date: { $lt: now } }, { eventStartDate: { $lt: now } }],
  }).sort({ date: -1, eventStartDate: -1 });

  res.json({ success: true, events: events.map(normalizeEvent) });
};

// GET SINGLE EVENT
export const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json({ success: true, event: normalizeEvent(event) });
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) return res.status(404).json({ message: "Event not found" });

  // Delete cover image
  if (event.coverImage?.publicId) {
    try {
      await imagekit.deleteFile(event.coverImage.publicId);
    } catch (deleteError) {
      console.error("Error deleting cover image from ImageKit:", deleteError);
    }
  }

  // Delete gallery images
  for (const img of event.images) {
    try {
      await imagekit.deleteFile(img.publicId);
    } catch (deleteError) {
      console.error(
        "Error deleting image from ImageKit during event deletion:",
        deleteError,
      );
    }
  }

  await event.deleteOne();
  res.json({ success: true, message: "Event deleted" });
};

// UPDATE EVENT DETAILS
export const updateEvent = async (req, res) => {
  try {
    // Validate YouTube URL if provided
    let youtubeVideoUrl = req.body.youtubeVideoUrl;
    if (youtubeVideoUrl && !isValidYoutubeUrl(youtubeVideoUrl)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid YouTube URL" });
    }

    const update = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      youtubeVideoUrl: youtubeVideoUrl,
    };
    if (req.body.eventStartDate != null) {
      update.eventStartDate = req.body.eventStartDate;
      update.date = req.body.eventStartDate;
    } else if (req.body.date != null) {
      update.date = req.body.date;
      update.eventStartDate = req.body.date;
    }
    if (req.body.registrationStartDate != null)
      update.registrationStartDate = req.body.registrationStartDate;
    if (req.body.registrationEndDate != null)
      update.registrationEndDate = req.body.registrationEndDate;
    if (req.body.accessType != null)
      update.accessType =
        req.body.accessType === "members" ? "members" : "public";

    const event = await Event.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ success: true, event: normalizeEvent(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD MEDIA TO EVENT
export const addEventMedia = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    console.log("Adding media to event:", req.params.id);
    console.log("Files received:", req.files ? Object.keys(req.files) : "none");

    if (req.files?.images) {
      console.log("Processing", req.files.images.length, "images");
      for (const file of req.files.images) {
        const fileName = `event_image_${Date.now()}_${Math.floor(
          Math.random() * 1000,
        )}`;
        console.log("Uploading image:", fileName);
        const result = await uploadBuffer(
          file.buffer,
          "events/images",
          fileName,
        );
        console.log("Upload result:", result);
        event.images.push({
          url: result.url,
          publicId: result.fileId,
        });
      }
    }

    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    console.error("Error in addEventMedia:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE SINGLE MEDIA
export const deleteEventMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const publicId = decodeURIComponent(req.params.publicId);

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if image
    const imageIndex = event.images.findIndex(
      (img) => img.publicId === publicId,
    );

    if (imageIndex !== -1) {
      // delete image from imagekit
      try {
        await imagekit.deleteFile(publicId);
      } catch (deleteError) {
        console.error("Error deleting image from ImageKit:", deleteError);
        // Continue with database removal even if ImageKit deletion fails
      }

      // remove from db
      event.images.splice(imageIndex, 1);
    } else {
      return res.status(404).json({ message: "Media not found" });
    }

    await event.save();

    res.json({ success: true, message: "Media deleted" });
  } catch (error) {
    console.error("DELETE MEDIA ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete media",
      error: error.message,
    });
  }
};

// GET ALL EVENT IMAGES FOR GALLERY
export const getAllEventImages = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({ date: { $lt: now } })
      .select("title description date location images")
      .sort({ date: -1 }); // Most recent first

    // Flatten all images with event context
    const gallery = [];

    events.forEach((event) => {
      if (event.images && event.images.length > 0) {
        event.images.forEach((image) => {
          gallery.push({
            url: image.url,
            publicId: image.publicId,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location || "Location TBA",
            eventDescription: event.description || "",
          });
        });
      }
    });

    res.json({
      success: true,
      count: gallery.length,
      images: gallery,
    });
  } catch (error) {
    console.error("GET GALLERY IMAGES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gallery images",
      error: error.message,
    });
  }
};
