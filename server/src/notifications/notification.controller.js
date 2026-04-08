import { sendEmail } from '../utils/mailer.js';
import Member from '../members/member.model.js'; // Assuming you have a member model to fetch users from
import Notification from './notification.model.js';

// Function to generate an HTML email template for events
const generateEventEmailTemplate = (eventName, date, time, venue, customizedMessage) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0056b3; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">NextEdge Society</h2>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: #0056b3;">New Event: ${eventName}</h3>
        <p>${customizedMessage}</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${time}</p>
          <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${venue}</p>
        </div>
        <p style="margin-top: 20px;">We hope to see you there!</p>
        <br>
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0; font-weight: bold;">NextEdge Society Team</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777;">
        &copy; ${new Date().getFullYear()} NextEdge Society. All rights reserved.
      </div>
    </div>
  `;
};

// @desc    Send a single notification
// @route   POST /api/notifications/send
// @access  Admin only
export const sendSingleNotification = async (req, res, next) => {
  try {
    const { email, subject, message, eventName, date, time, venue, clubName } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide email, subject, and message' });
    }

    const htmlContent = generateEventEmailTemplate(
      eventName || 'Special Event', 
      date || 'TBA', 
      time || 'TBA', 
      venue || 'TBA', 
      message
    );

    // 1. Send Email
    await sendEmail({
      to: email,
      subject: subject,
      html: htmlContent,
    });

    // 2. Save to Database for In-App Inbox
    await Notification.create({
      subject,
      message,
      eventName,
      date,
      time,
      venue,
      recipientType: 'SINGLE',
      recipientEmail: email,
      clubName: clubName || 'NextEdge Society'
    });

    res.status(200).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send bulk notification to all members
// @route   POST /api/notifications/send-bulk
// @access  Admin only
export const sendBulkNotification = async (req, res, next) => {
  try {
    const { subject, message, eventName, date, time, venue, clubName } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide subject and message' });
    }

    // Fetch all members from the database
    const members = await Member.find().select('email');
    
    if (!members || members.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found to send notifications' });
    }

    const htmlContent = generateEventEmailTemplate(
      eventName || 'Special Event', 
      date || 'TBA', 
      time || 'TBA', 
      venue || 'TBA', 
      message
    );

    // 1. Save to Database for In-App Inbox (Save once for all as BULK)
    await Notification.create({
      subject,
      message,
      eventName,
      date,
      time,
      venue,
      recipientType: 'BULK',
      clubName: clubName || 'NextEdge Society'
    });

    // 2. Send Emails concurrently
    const emailPromises = members.map(member => {
      if (member.email) {
         return sendEmail({
           to: member.email,
           subject: subject,
           html: htmlContent,
         }).catch(err => {
           console.error(`Failed to send email to ${member.email}:`, err);
           return null; 
         });
      }
      return null;
    });

    await Promise.all(emailPromises);

    res.status(200).json({ 
      success: true, 
      message: `Bulk notification process completed for ${members.length} members`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications for a member
// @route   GET /api/notifications/my-notifications
// @access  Member only
export const getMyNotifications = async (req, res, next) => {
  try {
    const email = req.member?.email; // Use req.member from authenticateMember

    if (!email) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Fetch notifications either sent to this email specifically or sent to ALL (BULK)
    const notifications = await Notification.find({
      $or: [
        { recipientEmail: email },
        { recipientType: 'BULK' }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};
