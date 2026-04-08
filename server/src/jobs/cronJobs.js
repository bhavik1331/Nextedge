import cron from 'node-cron';
import { sendEmail } from '../utils/mailer.js';
import Event from '../events/event.model.js'; // Assuming you have an Event model
import Member from '../members/member.model.js';

// Setup cron job to run every day at 8:00 AM
// "0 8 * * *" means 08:00 on every day of every month
export const setupCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily cron job for event reminders...');
    
    try {
      // Find events that are happening tomorrow
      // Calculate date range for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Assuming your Event model has 'date' field stored as Date
      const upcomingEvents = await Event.find({
        date: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        }
      });

      if (!upcomingEvents || upcomingEvents.length === 0) {
        console.log('No events tomorrow.');
        return;
      }

      // Fetch all members to send reminders
      const members = await Member.find().select('email');

      if (!members || members.length === 0) {
        console.log('No members found to send reminders to.');
        return;
      }

      for (const event of upcomingEvents) {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #0056b3;">Reminder: Upcoming Event Tomorrow!</h2>
            <h3>${event.name || event.title}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.time || 'TBA'}</p>
            <p><strong>Venue:</strong> ${event.venue || 'TBA'}</p>
            <br>
            <p>We look forward to seeing you there!</p>
            <p>- NextEdge Society Team</p>
          </div>
        `;

        // Send to all members
        const emailPromises = members.map(member => 
          sendEmail({
            to: member.email,
            subject: `REMINDER: ${event.name || event.title} is Tomorrow!`,
            html: htmlContent
          }).catch(err => console.error(`Failed to send reminder to ${member.email}:`, err))
        );

        await Promise.all(emailPromises);
        console.log(`Sent reminders for event: ${event.name || event.title}`);
      }

    } catch (error) {
      console.error('Error in daily cron job:', error);
    }
  });
  
  console.log('Cron jobs configured successfully.');
};
