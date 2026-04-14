import mongoose from "mongoose";
import Member from "../members/member.model.js";
import Payment from "../payments/payment.model.js";
import Notification from "../notifications/notification.model.js";
import { uploadBuffer } from "../events/uploadToImageKit.js";
import LedgerEntry from "./ledger.model.js";
import FundRequest from "./fundRequest.model.js";
import Expense from "./expense.model.js";
import {
  createLedgerEntry,
  generateReceiptPdf,
  getCurrentPeriod,
  getNextReceiptNumber,
  sendCsvFile,
  sendPdfTable,
} from "./finance.service.js";

const approvedStatuses = ["APPROVED", "Approved"];
const pendingStatuses = ["SUBMITTED", "PENDING_REVIEW", "CLARIFICATION_NEEDED", "Pending", "Pending Review", "Clarification Needed"];
const MAX_FINANCE_UPLOAD_BYTES = 5 * 1024 * 1024;

const normalizeStatusInput = (status = "") => String(status).trim().toUpperCase();

const getActorName = (req) => req.member?.email || "System";

const pushPaymentAudit = (payment, status, note, req) => {
  const item = {
    status,
    note: note || null,
    actedById: req.member?.id,
    actedByName: getActorName(req),
    actedAt: new Date(),
  };
  payment.auditTrail = Array.isArray(payment.auditTrail) ? [...payment.auditTrail, item] : [item];
};

export const submitPayment = async (req, res) => {
  try {
    const { amount, mode, transactionId, paymentDate, purpose, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "A valid amount is required." });
    }

    let proofUrl = null;
    let proofPublicId = null;

    const uploaded = req.files?.proofFile?.[0] || req.files?.proofImage?.[0] || null;
    if (uploaded) {
      if (uploaded.size > MAX_FINANCE_UPLOAD_BYTES) {
        return res.status(400).json({ success: false, message: "File size must be 5MB or less." });
      }
      const fileName = `payment_proof_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const result = await uploadBuffer(uploaded.buffer, "payments/proofs", fileName);
      proofUrl = result.url;
      proofPublicId = result.fileId;
    }

    const payment = await Payment.create({
      memberId: req.member.id,
      amount: Number(amount),
      purpose: purpose || "Membership Fee",
      mode: mode || "ONLINE",
      paymentType: mode?.toLowerCase() === "cash" ? "manual" : "online",
      transactionId: transactionId || null,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      proofUrl,
      proofPublicId,
      status: "PENDING_REVIEW",
      notes: notes || null,
      submittedAt: new Date(),
      auditTrail: [
        {
          status: "SUBMITTED",
          note: "Payment submitted by member",
          actedById: req.member.id,
          actedByName: getActorName(req),
          actedAt: new Date(),
        },
      ],
    });

    await Notification.create({
      type: "PAYMENT_SUBMITTED",
      subject: "New payment submitted",
      message: "A member submitted a payment for review.",
      recipientType: "BULK",
      recipientRole: "TREASURER",
      referenceId: payment._id,
      recipientEmail: null,
      senderRole: req.member.role,
    });

    res.status(201).json({ success: true, payment });
  } catch (error) {
    console.error("Submit payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ memberId: req.member.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOverview = async (req, res) => {
  try {
    const period = getCurrentPeriod();
    const periodStart = new Date(`${period}-01-01T00:00:00.000Z`);

    const openingSeed = await LedgerEntry.findOne({ date: { $lt: periodStart } }).sort({ date: -1 }).lean();
    const latest = await LedgerEntry.findOne().sort({ createdAt: -1 }).lean();

    const [
      feesCollected,
      pendingFees,
      membersPaid,
      pendingFundStats,
      totalMembers,
      approvedPaymentsCount,
      pendingPaymentsCount,
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { status: { $in: approvedStatuses } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { status: { $in: pendingStatuses } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.distinct("memberId", { status: { $in: approvedStatuses } }),
      FundRequest.aggregate([
        { $match: { status: { $in: ["SUBMITTED", "PENDING_APPROVAL"] } } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$amountRequested" } } },
      ]),
      Member.countDocuments({ isActive: true }),
      Payment.countDocuments({ status: { $in: approvedStatuses } }),
      Payment.countDocuments({ status: { $in: pendingStatuses } }),
    ]);

    res.json({
      success: true,
      overview: {
        openingBalance: openingSeed?.runningBalance || 0,
        closingBalance: latest?.runningBalance || 0,
        totalFeesCollected: feesCollected[0]?.total || 0,
        pendingFees: pendingFees[0]?.total || 0,
        totalMembersPaid: membersPaid.length,
        pendingFundRequestsCount: pendingFundStats[0]?.count || 0,
        pendingFundRequestsAmount: pendingFundStats[0]?.total || 0,
        feeCollectionRate: totalMembers > 0 ? Math.round((membersPaid.length / totalMembers) * 100) : 0,
        totalMembers,
        approvedPaymentsCount,
        pendingPaymentsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMemberFees = async (req, res) => {
  try {
    const { status, mode, search } = req.query;
    const members = await Member.find({ isActive: true }).select("name email role").sort({ name: 1 }).lean();

    const memberIds = members.map((m) => m._id);
    const payments = await Payment.find({ memberId: { $in: memberIds } }).sort({ createdAt: -1 }).lean();

    const latestByMember = new Map();
    for (const p of payments) {
      if (!latestByMember.has(String(p.memberId))) {
        latestByMember.set(String(p.memberId), p);
      }
    }

    let rows = members.map((m) => {
      const p = latestByMember.get(String(m._id));
      const paymentStatus = p?.status;
      let normalized = "Pending";
      if (approvedStatuses.includes(paymentStatus)) normalized = "Paid";
      else if (["CLARIFICATION_NEEDED", "Clarification Needed"].includes(paymentStatus)) normalized = "Partial";

      return {
        memberId: m._id,
        memberName: m.name,
        membershipId: String(m._id).slice(-6).toUpperCase(),
        feeAmount: p?.amount || 0,
        paymentStatus: normalized,
        paymentMode: p?.mode || p?.paymentType?.toUpperCase() || null,
        datePaid: approvedStatuses.includes(paymentStatus) ? p?.actionedAt || p?.updatedAt : null,
        latestPaymentId: p?._id || null,
      };
    });

    if (status) {
      rows = rows.filter((r) => r.paymentStatus.toLowerCase() === String(status).toLowerCase());
    }

    if (mode) {
      rows = rows.filter((r) => (r.paymentMode || "").toLowerCase() === String(mode).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      rows = rows.filter((r) => r.memberName.toLowerCase().includes(q) || r.membershipId.toLowerCase().includes(q));
    }

    res.json({ success: true, members: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markMemberPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, mode, note } = req.body;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const payment = await Payment.create({
      memberId: member._id,
      amount: Number(amount || 0),
      purpose: "Membership Fee",
      mode: mode || "CASH",
      paymentType: "manual",
      status: "APPROVED",
      submittedAt: new Date(),
      actionedAt: new Date(),
      approvedById: req.member.id,
      approvedByName: getActorName(req),
      notes: note || "Marked paid by treasurer",
      auditTrail: [
        {
          status: "APPROVED",
          note: note || "Marked paid by treasurer",
          actedById: req.member.id,
          actedByName: getActorName(req),
          actedAt: new Date(),
        },
      ],
    });

    const ledgerEntry = await createLedgerEntry({
      description: `Membership fee approved for ${member.name}`,
      type: "CREDIT",
      amount: payment.amount,
      category: "FEE",
      referenceType: "PAYMENT",
      referenceId: payment._id,
      createdById: req.member.id,
      createdByName: getActorName(req),
    });

    payment.ledgerEntryId = ledgerEntry._id;
    await payment.save();

    res.json({ success: true, message: "Member marked as paid.", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendFeeReminder = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    await Notification.create({
      type: "FEE_REMINDER",
      subject: "Membership fee reminder",
      message: "Your membership fee is pending. Please submit payment proof.",
      recipientType: "SINGLE",
      recipientEmail: member.email,
      recipientId: member._id,
      senderRole: req.member.role,
    });

    res.json({ success: true, message: "Reminder sent." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportMemberFeesCsv = async (req, res) => {
  try {
    const { status, mode, search } = req.query;
    const members = await Member.find({ isActive: true }).select("name email role").sort({ name: 1 }).lean();

    const memberIds = members.map((m) => m._id);
    const payments = await Payment.find({ memberId: { $in: memberIds } }).sort({ createdAt: -1 }).lean();

    const latestByMember = new Map();
    for (const p of payments) {
      if (!latestByMember.has(String(p.memberId))) {
        latestByMember.set(String(p.memberId), p);
      }
    }

    let rows = members.map((m) => {
      const p = latestByMember.get(String(m._id));
      const paymentStatus = p?.status;
      let normalized = "Pending";
      if (approvedStatuses.includes(paymentStatus)) normalized = "Paid";
      else if (["CLARIFICATION_NEEDED", "Clarification Needed"].includes(paymentStatus)) normalized = "Partial";

      return {
        memberName: m.name,
        membershipId: String(m._id).slice(-6).toUpperCase(),
        feeAmount: p?.amount || 0,
        paymentStatus: normalized,
        paymentMode: p?.mode || p?.paymentType?.toUpperCase() || "",
        datePaid: approvedStatuses.includes(paymentStatus) ? p?.actionedAt || p?.updatedAt : null,
      };
    });

    if (status) {
      rows = rows.filter((r) => r.paymentStatus.toLowerCase() === String(status).toLowerCase());
    }
    if (mode) {
      rows = rows.filter((r) => (r.paymentMode || "").toLowerCase() === String(mode).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      rows = rows.filter((r) => r.memberName.toLowerCase().includes(q) || r.membershipId.toLowerCase().includes(q));
    }

    const headers = ["Member Name", "Membership ID", "Fee Amount", "Payment Status", "Payment Mode", "Date Paid"];
    const csvRows = rows.map((r) => [
      r.memberName,
      r.membershipId,
      r.feeAmount,
      r.paymentStatus,
      r.paymentMode,
      r.datePaid ? new Date(r.datePaid).toLocaleDateString() : "",
    ]);

    return sendCsvFile(res, `member-fees-${Date.now()}.csv`, headers, csvRows);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const listPayments = async (req, res) => {
  try {
    const { status, mode, from, to, memberName, page = 1, limit = 25 } = req.query;
    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);

    const query = {};
    if (status) {
      const normalized = normalizeStatusInput(status);
      if (normalized === "PENDING") {
        query.status = { $in: ["PENDING_REVIEW", "SUBMITTED", "Pending", "Pending Review"] };
      } else if (normalized === "APPROVED") {
        query.status = { $in: approvedStatuses };
      } else if (normalized === "REJECTED") {
        query.status = { $in: ["REJECTED", "Rejected"] };
      } else {
        query.status = status;
      }
    }

    if (mode) {
      query.mode = String(mode).toUpperCase();
    }

    if (memberName) {
      const members = await Member.find({ name: { $regex: String(memberName), $options: "i" } }).select("_id").lean();
      query.memberId = { $in: members.map((m) => m._id) };
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("memberId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Payment.countDocuments(query),
    ]);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportPayments = async (req, res) => {
  try {
    const format = String(req.query.format || "csv").toLowerCase();
    const { status, mode, from, to, memberName } = req.query;

    const query = {};
    if (status) {
      const normalized = normalizeStatusInput(status);
      if (normalized === "PENDING") {
        query.status = { $in: ["PENDING_REVIEW", "SUBMITTED", "Pending", "Pending Review"] };
      } else if (normalized === "APPROVED") {
        query.status = { $in: approvedStatuses };
      } else if (normalized === "REJECTED") {
        query.status = { $in: ["REJECTED", "Rejected"] };
      } else {
        query.status = status;
      }
    }
    if (mode) query.mode = String(mode).toUpperCase();
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (memberName) {
      const members = await Member.find({ name: { $regex: String(memberName), $options: "i" } }).select("_id").lean();
      query.memberId = { $in: members.map((m) => m._id) };
    }

    const payments = await Payment.find(query)
      .populate("memberId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const columns = [
      "Member Name",
      "Member Email",
      "Amount",
      "Mode",
      "Transaction ID",
      "Status",
      "Approved/Rejected By",
      "Date Submitted",
      "Date Actioned",
    ];
    const rows = payments.map((p) => [
      p.memberId?.name || "",
      p.memberId?.email || "",
      p.amount,
      p.mode || p.paymentType || "",
      p.transactionId || "",
      p.status || "",
      p.approvedByName || "",
      p.submittedAt ? new Date(p.submittedAt).toLocaleString() : new Date(p.createdAt).toLocaleString(),
      p.actionedAt ? new Date(p.actionedAt).toLocaleString() : "",
    ]);

    if (format === "pdf") {
      return sendPdfTable(res, `payment-history-${Date.now()}.pdf`, "Payment History", columns, rows);
    }

    return sendCsvFile(res, `payment-history-${Date.now()}.csv`, columns, rows);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("memberId", "name email role").lean();
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("memberId", "name email role");
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    const alreadyApproved = approvedStatuses.includes(payment.status);
    if (alreadyApproved) {
      return res.status(400).json({ success: false, message: "Payment already approved." });
    }

    payment.status = "APPROVED";
    payment.approvedById = req.member.id;
    payment.approvedByName = getActorName(req);
    payment.actionedAt = new Date();
    payment.rejectionReason = null;

    const receiptNumber = payment.receiptNumber || (await getNextReceiptNumber());
    const receipt = await generateReceiptPdf({
      payment,
      memberName: payment.memberId?.name || "Member",
      memberEmail: payment.memberId?.email || "N/A",
      receiptNumber,
      approvedByName: getActorName(req),
    });

    payment.receiptNumber = receiptNumber;
    payment.receiptUrl = receipt.publicUrl;

    pushPaymentAudit(payment, "APPROVED", req.body?.note || null, req);
    await payment.save();

    const ledgerEntry = await createLedgerEntry({
      description: `Payment approved: ${payment.memberId?.name || "Member"}`,
      type: "CREDIT",
      amount: payment.amount,
      category: "FEE",
      referenceType: "PAYMENT",
      referenceId: payment._id,
      createdById: req.member.id,
      createdByName: getActorName(req),
    });

    payment.ledgerEntryId = ledgerEntry._id;
    await payment.save();

    await Notification.create({
      type: "PAYMENT_APPROVED",
      subject: "Payment approved",
      message: `Your payment has been approved. Receipt number: ${receiptNumber}`,
      recipientType: "SINGLE",
      recipientEmail: payment.memberId?.email,
      recipientId: payment.memberId?._id,
      referenceId: payment._id,
      senderRole: req.member.role,
    });

    res.json({ success: true, message: "Payment approved.", payment });
  } catch (error) {
    console.error("Approve payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const reason = req.body?.reason;
    if (!reason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required." });
    }

    const payment = await Payment.findById(req.params.id).populate("memberId", "name email");
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    payment.status = "REJECTED";
    payment.rejectionReason = reason;
    payment.actionedAt = new Date();
    payment.approvedById = req.member.id;
    payment.approvedByName = getActorName(req);
    pushPaymentAudit(payment, "REJECTED", reason, req);
    await payment.save();

    await Notification.create({
      type: "PAYMENT_REJECTED",
      subject: "Payment rejected",
      message: `Your payment was rejected. Reason: ${reason}`,
      recipientType: "SINGLE",
      recipientEmail: payment.memberId?.email,
      recipientId: payment.memberId?._id,
      referenceId: payment._id,
      senderRole: req.member.role,
    });

    res.json({ success: true, message: "Payment rejected.", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPaymentClarification = async (req, res) => {
  try {
    const note = req.body?.note;
    if (!note) {
      return res.status(400).json({ success: false, message: "Clarification note is required." });
    }

    const payment = await Payment.findById(req.params.id).populate("memberId", "name email");
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    payment.status = "CLARIFICATION_NEEDED";
    payment.treasurerNote = note;
    payment.actionedAt = new Date();
    payment.approvedById = req.member.id;
    payment.approvedByName = getActorName(req);
    pushPaymentAudit(payment, "CLARIFICATION_NEEDED", note, req);
    await payment.save();

    await Notification.create({
      type: "CLARIFICATION_REQUESTED",
      subject: "Payment clarification requested",
      message: note,
      recipientType: "SINGLE",
      recipientEmail: payment.memberId?.email,
      recipientId: payment.memberId?._id,
      referenceId: payment._id,
      senderRole: req.member.role,
    });

    res.json({ success: true, message: "Clarification requested.", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("memberId", "_id email").lean();
    if (!payment || !payment.receiptUrl) {
      return res.status(404).json({ success: false, message: "Receipt not found." });
    }

    const requesterRole = req.member?.role;
    const requesterId = String(req.member?.id || "");
    const ownerId = String(payment.memberId?._id || "");

    const isTreasurer = ["TREASURER", "ADMIN"].includes(requesterRole);
    const isOwner = requesterId && requesterId === ownerId;

    if (!isTreasurer && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    res.json({ success: true, receiptUrl: payment.receiptUrl, receiptNumber: payment.receiptNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listLedger = async (req, res) => {
  try {
    const { from, to, page = 1, limit = 25 } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [entries, total] = await Promise.all([
      LedgerEntry.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      LedgerEntry.countDocuments(query),
    ]);

    res.json({
      success: true,
      entries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportLedger = async (req, res) => {
  try {
    const format = String(req.query.format || "csv").toLowerCase();
    const entries = await LedgerEntry.find({}).sort({ date: 1, createdAt: 1 }).lean();
    const columns = ["Date", "Description", "Type", "Debit", "Credit", "Running Balance", "Category"];
    const rows = entries.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.description,
      e.type,
      e.type === "DEBIT" ? e.amount : "",
      e.type === "CREDIT" ? e.amount : "",
      e.runningBalance,
      e.category || "",
    ]);

    if (format === "pdf") {
      return sendPdfTable(res, `ledger-${Date.now()}.pdf`, "Ledger Export", columns, rows);
    }

    return sendCsvFile(res, `ledger-${Date.now()}.csv`, columns, rows);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addManualLedgerEntry = async (req, res) => {
  try {
    const { description, type, amount, category } = req.body;

    if (!description || !type || !amount) {
      return res.status(400).json({ success: false, message: "Description, type and amount are required." });
    }

    const entry = await createLedgerEntry({
      date: new Date(),
      description,
      type,
      amount,
      category: category || "MANUAL",
      referenceType: "MANUAL",
      referenceId: null,
      createdById: req.member.id,
      createdByName: getActorName(req),
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reverseLedgerEntry = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: "Reversal reason is required." });
    }

    const original = await LedgerEntry.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: "Ledger entry not found." });
    }
    if (original.isReversed) {
      return res.status(400).json({ success: false, message: "Entry already reversed." });
    }

    const reversalType = original.type === "CREDIT" ? "DEBIT" : "CREDIT";
    const reversal = await createLedgerEntry({
      date: new Date(),
      description: `Reversal of ${original.description}`,
      type: reversalType,
      amount: original.amount,
      category: "REVERSAL",
      referenceType: "REVERSAL",
      referenceId: original._id,
      createdById: req.member.id,
      createdByName: getActorName(req),
    });

    original.isReversed = true;
    original.reversalEntryId = reversal._id;
    original.reversalReason = reason;
    await original.save();

    res.json({ success: true, original, reversal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitFundRequest = async (req, res) => {
  try {
    const { clubName, eventName, amountRequested, purpose, requiredByDate } = req.body;
    if (!clubName || !eventName || !amountRequested || !purpose || !requiredByDate) {
      return res.status(400).json({ success: false, message: "All fund request fields are required." });
    }

    const fr = await FundRequest.create({
      clubName,
      eventName,
      amountRequested,
      purpose,
      requiredByDate,
      status: "PENDING_APPROVAL",
      requestedById: req.member.id,
      requestedByName: getActorName(req),
      submittedAt: new Date(),
    });

    await Notification.create({
      type: "FUND_REQUESTED",
      subject: "New fund request",
      message: `${clubName} requested funds for ${eventName}`,
      recipientType: "BULK",
      recipientRole: "TREASURER",
      referenceId: fr._id,
      senderRole: req.member.role,
    });

    res.status(201).json({ success: true, fundRequest: fr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listFundRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
    const query = status ? { status: String(status).toUpperCase() } : {};
    const skip = (parsedPage - 1) * parsedLimit;
    const [fundRequests, total] = await Promise.all([
      FundRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
      FundRequest.countDocuments(query),
    ]);
    res.json({
      success: true,
      fundRequests,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listMyFundRequests = async (req, res) => {
  try {
    const fundRequests = await FundRequest.find({ requestedById: req.member.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, fundRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFundRequestById = async (req, res) => {
  try {
    const fundRequest = await FundRequest.findById(req.params.id).lean();
    if (!fundRequest) {
      return res.status(404).json({ success: false, message: "Fund request not found." });
    }

    const isOwner = String(fundRequest.requestedById) === String(req.member.id);
    const canView = ["TREASURER", "ADMIN"].includes(req.member.role) || isOwner;
    if (!canView) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    res.json({ success: true, fundRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveFundRequest = async (req, res) => {
  try {
    const fr = await FundRequest.findById(req.params.id);
    if (!fr) {
      return res.status(404).json({ success: false, message: "Fund request not found." });
    }
    if (fr.status === "REJECTED") {
      return res.status(400).json({ success: false, message: "Rejected fund request cannot be approved." });
    }

    fr.status = "APPROVED";
    fr.decidedById = req.member.id;
    fr.decidedByName = getActorName(req);
    fr.decidedAt = new Date();
    fr.treasurerNotes = req.body?.note || null;
    await fr.save();

    const approvedAmount = Number(req.body?.approvedAmount || fr.amountRequested || 0);
    if (approvedAmount > 0) {
      const existingReleaseEntry = await LedgerEntry.findOne({
        referenceType: "FUND_RELEASE",
        referenceId: fr._id,
        isReversed: false,
      }).lean();

      if (!existingReleaseEntry) {
        await createLedgerEntry({
          date: new Date(),
          description: `Funds approved for ${fr.eventName}`,
          type: "DEBIT",
          amount: approvedAmount,
          category: "FUND_RELEASE",
          referenceType: "FUND_RELEASE",
          referenceId: fr._id,
          createdById: req.member.id,
          createdByName: getActorName(req),
        });
      }
    }

    await Notification.create({
      type: "FUND_APPROVED",
      subject: "Fund request approved",
      message: `Your request for ${fr.eventName} is approved.`,
      recipientType: "SINGLE",
      recipientId: fr.requestedById,
      referenceId: fr._id,
      senderRole: req.member.role,
    });

    res.json({ success: true, fundRequest: fr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectFundRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required." });
    }

    const fr = await FundRequest.findById(req.params.id);
    if (!fr) {
      return res.status(404).json({ success: false, message: "Fund request not found." });
    }

    fr.status = "REJECTED";
    fr.rejectionReason = reason;
    fr.decidedById = req.member.id;
    fr.decidedByName = getActorName(req);
    fr.decidedAt = new Date();
    await fr.save();

    await Notification.create({
      type: "FUND_REJECTED",
      subject: "Fund request rejected",
      message: reason,
      recipientType: "SINGLE",
      recipientId: fr.requestedById,
      referenceId: fr._id,
      senderRole: req.member.role,
    });

    res.json({ success: true, fundRequest: fr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const releaseFundRequest = async (req, res) => {
  try {
    const { amountReleased, note } = req.body;
    const fr = await FundRequest.findById(req.params.id);
    if (!fr) {
      return res.status(404).json({ success: false, message: "Fund request not found." });
    }
    if (fr.status === "REJECTED") {
      return res.status(400).json({ success: false, message: "Rejected fund request cannot be released." });
    }

    const released = Number(amountReleased || fr.amountRequested);
    fr.status = "RELEASED";
    fr.amountReleased = released;
    fr.treasurerNotes = note || fr.treasurerNotes;
    fr.releasedAt = new Date();
    fr.decidedById = req.member.id;
    fr.decidedByName = getActorName(req);
    fr.decidedAt = new Date();
    await fr.save();

    const existingReleaseEntry = await LedgerEntry.findOne({
      referenceType: "FUND_RELEASE",
      referenceId: fr._id,
      isReversed: false,
    }).lean();

    if (!existingReleaseEntry) {
      await createLedgerEntry({
        date: new Date(),
        description: `Funds released for ${fr.eventName}`,
        type: "DEBIT",
        amount: released,
        category: "FUND_RELEASE",
        referenceType: "FUND_RELEASE",
        referenceId: fr._id,
        createdById: req.member.id,
        createdByName: getActorName(req),
      });
    }

    await Notification.create({
      type: "FUND_RELEASED",
      subject: "Funds released",
      message: `Funds for ${fr.eventName} have been released.`,
      recipientType: "SINGLE",
      recipientId: fr.requestedById,
      referenceId: fr._id,
      senderRole: req.member.role,
    });

    res.json({ success: true, fundRequest: fr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;
    if (!title || !amount || !date || !category) {
      return res.status(400).json({ success: false, message: "Title, amount, date and category are required." });
    }

    let receiptFileUrl = null;
    let receiptFileId = null;
    const uploaded = req.files?.receiptFile?.[0] || null;
    if (uploaded) {
      if (uploaded.size > MAX_FINANCE_UPLOAD_BYTES) {
        return res.status(400).json({ success: false, message: "File size must be 5MB or less." });
      }
      const fileName = `expense_receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const result = await uploadBuffer(uploaded.buffer, "expenses/receipts", fileName);
      receiptFileUrl = result.url;
      receiptFileId = result.fileId;
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      date: new Date(date),
      category: String(category).toUpperCase(),
      description: description || "",
      receiptFileUrl,
      receiptFileId,
      recordedById: req.member.id,
      recordedByName: getActorName(req),
    });

    const ledgerEntry = await createLedgerEntry({
      date: expense.date,
      description: `Expense: ${expense.title}`,
      type: "DEBIT",
      amount: expense.amount,
      category: expense.category,
      referenceType: "EXPENSE",
      referenceId: expense._id,
      createdById: req.member.id,
      createdByName: getActorName(req),
    });

    expense.ledgerEntryId = ledgerEntry._id;
    await expense.save();

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listExpenses = async (req, res) => {
  try {
    const { category, from, to, page = 1, limit = 25 } = req.query;
    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
    const query = {};

    if (category) {
      query.category = String(category).toUpperCase();
    }
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const [expenses, total] = await Promise.all([
      Expense.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
      Expense.countDocuments(query),
    ]);
    res.json({
      success: true,
      expenses,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    const { title, amount, date, category, description } = req.body;
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = Number(amount);
    if (date !== undefined) expense.date = new Date(date);
    if (category !== undefined) expense.category = String(category).toUpperCase();
    if (description !== undefined) expense.description = description;

    await expense.save();
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reverseExpense = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: "Reversal reason is required." });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    if (expense.isReversed) {
      return res.status(400).json({ success: false, message: "Expense already reversed." });
    }

    const reversal = await createLedgerEntry({
      description: `Expense reversal: ${expense.title}`,
      type: "CREDIT",
      amount: expense.amount,
      category: "REVERSAL",
      referenceType: "EXPENSE",
      referenceId: expense._id,
      createdById: req.member.id,
      createdByName: getActorName(req),
    });

    expense.isReversed = true;
    expense.reversedAt = new Date();
    expense.reversalReason = reason;
    await expense.save();

    res.json({ success: true, expense, reversal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reportFeeCollection = async (req, res) => {
  try {
    const rows = await Payment.aggregate([
      { $match: { status: { $in: approvedStatuses } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$actionedAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, monthlyFeeCollection: rows.map((r) => ({ month: r._id, total: r.total, count: r.count })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reportExpenses = async (req, res) => {
  try {
    const rows = await Expense.aggregate([
      { $match: { isReversed: false } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, expenseBreakdown: rows.map((r) => ({ category: r._id, total: r.total })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reportFundRequests = async (req, res) => {
  try {
    const rows = await FundRequest.aggregate([
      {
        $group: {
          _id: "$clubName",
          requested: { $sum: "$amountRequested" },
          released: { $sum: { $ifNull: ["$amountReleased", 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      fundRequestSummary: rows.map((r) => ({ clubName: r._id, requested: r.requested, released: r.released })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reportLedger = async (req, res) => {
  try {
    const entries = await LedgerEntry.find().sort({ date: 1, createdAt: 1 }).lean();
    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reportSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ success: false, message: "from and to are required." });
    }

    const start = new Date(from);
    const end = new Date(to);

    const [creditRow, debitRow] = await Promise.all([
      LedgerEntry.aggregate([
        { $match: { date: { $gte: start, $lte: end }, type: "CREDIT" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      LedgerEntry.aggregate([
        { $match: { date: { $gte: start, $lte: end }, type: "DEBIT" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const credit = creditRow[0]?.total || 0;
    const debit = debitRow[0]?.total || 0;

    res.json({
      success: true,
      summary: {
        from,
        to,
        totalCredit: credit,
        totalDebit: debit,
        net: credit - debit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listMyNotifications = async (req, res) => {
  try {
    const memberObjectId = mongoose.Types.ObjectId.isValid(req.member.id)
      ? new mongoose.Types.ObjectId(req.member.id)
      : null;

    const notifications = await Notification.find({
      $or: [
        { recipientEmail: req.member.email },
        { recipientType: "BULK" },
        ...(memberObjectId ? [{ recipientId: memberObjectId }] : []),
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true }).lean();
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ recipientEmail: req.member.email }, { recipientType: "BULK" }, { recipientId: req.member.id }],
      },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
