import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'PAYMENT_SUBMITTED',
        'PAYMENT_APPROVED',
        'PAYMENT_REJECTED',
        'FUND_REQUESTED',
        'FUND_APPROVED',
        'FUND_REJECTED',
        'FUND_RELEASED',
        'FEE_REMINDER',
        'CLARIFICATION_REQUESTED',
      ],
      default: null,
    },
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
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    recipientRole: {
      type: String,
      enum: ['ADMIN', 'CLUB_HEAD', 'TREASURER', 'MEMBER'],
      default: null,
    },
    recipientEmail: {
      type: String, // Store email for single, or null for bulk
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
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
