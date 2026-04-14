import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import LedgerEntry from "./ledger.model.js";
import ReceiptCounter from "./receiptCounter.model.js";

const uploadsRoot = path.join(process.cwd(), "uploads");
const receiptsDir = path.join(uploadsRoot, "receipts");
const reportsDir = path.join(uploadsRoot, "reports");

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

export const formatCurrency = (value) => {
  const n = Number(value || 0);
  return `INR ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export const getCurrentPeriod = (date = new Date()) => {
  return String(date.getFullYear());
};

export const getNextReceiptNumber = async () => {
  const period = getCurrentPeriod();
  const counter = await ReceiptCounter.findOneAndUpdate(
    { period },
    { $inc: { value: 1 } },
    { upsert: true, new: true },
  );

  const serial = String(counter.value).padStart(3, "0");
  return `REC-${period}-${serial}`;
};

export const getLastRunningBalance = async () => {
  const last = await LedgerEntry.findOne().sort({ createdAt: -1 }).lean();
  return last?.runningBalance || 0;
};

export const createLedgerEntry = async ({
  date = new Date(),
  description,
  type,
  amount,
  category = "GENERAL",
  referenceType,
  referenceId = null,
  createdById,
  createdByName,
}) => {
  const normalizedAmount = Number(amount || 0);
  const previousBalance = await getLastRunningBalance();
  const delta = type === "CREDIT" ? normalizedAmount : -normalizedAmount;
  const runningBalance = previousBalance + delta;

  const entry = await LedgerEntry.create({
    date,
    description,
    type,
    amount: normalizedAmount,
    runningBalance,
    category,
    referenceType,
    referenceId,
    createdById,
    createdByName,
  });

  return entry;
};

export const buildReceiptHtml = ({
  payment,
  memberName,
  memberEmail,
  receiptNumber,
  approvedByName,
}) => {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Payment Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; }
        .title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
        .muted { color: #6b7280; }
        .divider { border-top: 1px solid #e5e7eb; margin: 16px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="title">NextEdge Society - Payment Receipt</div>
        <div class="muted">Receipt Number: ${receiptNumber}</div>
        <div class="divider"></div>
        <div class="row"><strong>Member Name</strong><span>${memberName}</span></div>
        <div class="row"><strong>Member Email</strong><span>${memberEmail}</span></div>
        <div class="row"><strong>Amount Paid</strong><span>${formatCurrency(payment.amount)}</span></div>
        <div class="row"><strong>Payment Mode</strong><span>${payment.mode || payment.paymentType || "N/A"}</span></div>
        <div class="row"><strong>Transaction ID</strong><span>${payment.transactionId || "N/A"}</span></div>
        <div class="row"><strong>Date of Payment</strong><span>${new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}</span></div>
        <div class="row"><strong>Date of Approval</strong><span>${new Date(payment.actionedAt || Date.now()).toLocaleDateString()}</span></div>
        <div class="row"><strong>Approved By</strong><span>${approvedByName}</span></div>
        <div class="divider"></div>
        <p class="muted">This is a system generated receipt.</p>
      </div>
    </body>
  </html>`;
};

export const generateReceiptPdf = async ({
  payment,
  memberName,
  memberEmail,
  receiptNumber,
  approvedByName,
}) => {
  const html = buildReceiptHtml({
    payment,
    memberName,
    memberEmail,
    receiptNumber,
    approvedByName,
  });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const fileName = `${receiptNumber}.pdf`;
    const outputPath = path.join(receiptsDir, fileName);
    await page.pdf({ path: outputPath, format: "A4", printBackground: true });

    return {
      fileName,
      outputPath,
      publicUrl: `/uploads/receipts/${fileName}`,
    };
  } finally {
    await browser.close();
  }
};

export const toCsv = (headers, rows) => {
  const escapeCell = (value) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;
  const headerLine = headers.map(escapeCell).join(",");
  const rowLines = rows.map((row) => row.map(escapeCell).join(","));
  return [headerLine, ...rowLines].join("\n");
};

export const sendCsvFile = (res, fileName, headers, rows) => {
  const csv = toCsv(headers, rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  return res.status(200).send(csv);
};

const buildTableHtml = ({ title, columns, rows }) => {
  const head = columns.map((c) => `<th>${c}</th>`).join("");
  const body = rows
    .map(
      (r) => `<tr>${r.map((v) => `<td>${String(v ?? "")}</td>`).join("")}</tr>`,
    )
    .join("");

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111827; padding: 20px; }
        h1 { font-size: 20px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </body>
  </html>`;
};

export const sendPdfTable = async (res, fileName, title, columns, rows) => {
  const html = buildTableHtml({ title, columns, rows });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const filePath = path.join(reportsDir, fileName);
    await page.pdf({ path: filePath, format: "A4", printBackground: true });
    const buffer = fs.readFileSync(filePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    return res.status(200).send(buffer);
  } finally {
    await browser.close();
  }
};
