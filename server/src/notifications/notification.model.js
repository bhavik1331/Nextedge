import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    eventName: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    venue: {
      type: String,
    },
    recipientType: {
      type: String,
      enum: ['SINGLE', 'BULK'],
      required: true,
    },
    recipientEmail: {
      type: String, // Store email for single, or null for bulk
    },
    senderRole: {
      type: String,
    },
    clubName: {
      type: String, // Which club sent it
      default: 'NextEdge Society',
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
