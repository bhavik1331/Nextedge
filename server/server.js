import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { setupCronJobs } from "./src/jobs/cronJobs.js";

const port = 3000;

// Connect to the database
connectDB();

// Initialize scheduled tasks
setupCronJobs();

app.listen(port, () => {
  console.log("Backend listening on 3000");
});
