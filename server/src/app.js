import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";

import eventRoutes from "./events/event.routes.js";
import adminRoutes from "./Admin/admin.routes.js";
import contactRoutes from "./contacts/contact.routes.js";
import memberRoutes from "./members/member.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";
import paymentRoutes from "./payments/payment.routes.js";
import documentRoutes from "./documents/document.routes.js";
import auditRoutes from "./audit/audit.routes.js";
import attendanceRoutes from "./attendance/attendance.routes.js";
import financeRoutes from "./finance/finance.routes.js";

const app = express();

// Parse cookies early so auth and other middleware can use them
app.use(cookieParser());

// Security headers
app.use(helmet());

// CORS with credentials support
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/finance", financeRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
  });
});

export default app;
