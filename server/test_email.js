import { sendEmail } from './src/utils/mailer.js';

const testEmail = async () => {
  try {
    console.log("Attempting to send test email...");
    await sendEmail({
      to: process.env.GMAIL_USER, // Send email to yourself
      subject: "Test Notification System",
      html: "<h1>It works!</h1><p>Your Gmail configuration is successful.</p>"
    });
    console.log("Test email SUCCESS!");
    process.exit(0);
  } catch (error) {
    console.error("Test email FAILED!");
    process.exit(1);
  }
};

testEmail();
