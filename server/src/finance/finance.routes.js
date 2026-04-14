import express from "express";
import upload from "../events/upload.js";
import { authenticateMember } from "../members/member.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import {
  addManualLedgerEntry,
  approveFundRequest,
  approvePayment,
  createExpense,
  exportLedger,
  exportMemberFeesCsv,
  exportPayments,
  getFundRequestById,
  getMemberFees,
  getMyPayments,
  getOverview,
  getPaymentById,
  getReceipt,
  listExpenses,
  listFundRequests,
  listMyFundRequests,
  listLedger,
  listMyNotifications,
  listPayments,
  markAllNotificationsRead,
  markMemberPaid,
  markNotificationRead,
  rejectFundRequest,
  rejectPayment,
  releaseFundRequest,
  reportExpenses,
  reportFeeCollection,
  reportFundRequests,
  reportLedger,
  reportSummary,
  requestPaymentClarification,
  reverseExpense,
  reverseLedgerEntry,
  sendFeeReminder,
  submitFundRequest,
  submitPayment,
  updateExpense,
} from "./finance.controller.js";

const router = express.Router();

const treasurerGuard = [
  authenticateMember,
  authorizeRole("TREASURER", "ADMIN"),
];
const clubHeadGuard = [authenticateMember, authorizeRole("CLUB_HEAD", "ADMIN")];
const memberGuard = [
  authenticateMember,
  authorizeRole("MEMBER", "TREASURER", "CLUB_HEAD", "ADMIN"),
];

router.get("/overview", ...treasurerGuard, getOverview);

router.get("/members", ...treasurerGuard, getMemberFees);
router.patch("/members/:id/fee-status", ...treasurerGuard, markMemberPaid);
router.post("/members/:id/reminder", ...treasurerGuard, sendFeeReminder);
router.get("/members/export", ...treasurerGuard, exportMemberFeesCsv);

router.post(
  "/payments",
  ...memberGuard,
  upload.fields([
    { name: "proofFile", maxCount: 1 },
    { name: "proofImage", maxCount: 1 },
  ]),
  submitPayment,
);
router.get("/payments/member/me", ...memberGuard, getMyPayments);
router.get("/payments", ...treasurerGuard, listPayments);
router.get("/payments/export", ...treasurerGuard, exportPayments);
router.get("/payments/:id", ...treasurerGuard, getPaymentById);
router.patch("/payments/:id/approve", ...treasurerGuard, approvePayment);
router.patch("/payments/:id/reject", ...treasurerGuard, rejectPayment);
router.patch(
  "/payments/:id/clarify",
  ...treasurerGuard,
  requestPaymentClarification,
);
router.get("/payments/:id/receipt", authenticateMember, getReceipt);

router.get("/ledger", ...treasurerGuard, listLedger);
router.get("/ledger/export", ...treasurerGuard, exportLedger);
router.post("/ledger/manual-entry", ...treasurerGuard, addManualLedgerEntry);
router.post("/ledger/:id/reverse", ...treasurerGuard, reverseLedgerEntry);

router.post("/fund-requests", ...clubHeadGuard, submitFundRequest);
router.get("/fund-requests", ...treasurerGuard, listFundRequests);
router.get("/fund-requests/mine", ...clubHeadGuard, listMyFundRequests);
router.get("/fund-requests/:id", authenticateMember, getFundRequestById);
router.patch(
  "/fund-requests/:id/approve",
  ...treasurerGuard,
  approveFundRequest,
);
router.patch("/fund-requests/:id/reject", ...treasurerGuard, rejectFundRequest);
router.patch(
  "/fund-requests/:id/release",
  ...treasurerGuard,
  releaseFundRequest,
);

router.post(
  "/expenses",
  ...treasurerGuard,
  upload.fields([{ name: "receiptFile", maxCount: 1 }]),
  createExpense,
);
router.get("/expenses", ...treasurerGuard, listExpenses);
router.patch("/expenses/:id", ...treasurerGuard, updateExpense);
router.post("/expenses/:id/reverse", ...treasurerGuard, reverseExpense);

router.get("/reports/fee-collection", ...treasurerGuard, reportFeeCollection);
router.get("/reports/expenses", ...treasurerGuard, reportExpenses);
router.get("/reports/fund-requests", ...treasurerGuard, reportFundRequests);
router.get("/reports/ledger", ...treasurerGuard, reportLedger);
router.get("/reports/summary", ...treasurerGuard, reportSummary);

router.get("/notifications", authenticateMember, listMyNotifications);
router.patch(
  "/notifications/:id/read",
  authenticateMember,
  markNotificationRead,
);
router.patch(
  "/notifications/read-all",
  authenticateMember,
  markAllNotificationsRead,
);

export default router;
