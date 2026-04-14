# PRD: Treasurer Dashboard — Club Management System

**Document Status:** Draft v1.0  
**Version:** 1.0  
**Last Updated:** April 2026  
**Author(s):** [Your Name]

---

## 1. Overview & Problem Statement

### Background

College and university clubs operate with surprisingly complex finances — membership fee collection, event-based fund requests, expense tracking, and institutional reporting — yet most clubs manage this entirely through informal tools: WhatsApp threads, shared Excel sheets, cash handoffs, and verbal approvals. There is no audit trail, no real-time visibility, and no accountability structure.

The Treasurer Dashboard is a dedicated financial management panel within the Club Management System, designed to bring structure, transparency, and control to club finances.

### Problem

Clubs currently face the following pain points:

- **No centralized financial visibility.** The Treasurer has no real-time view of collected vs. pending fees, current balance, or outstanding obligations.
- **Manual, error-prone payment verification.** Members submit payment screenshots over WhatsApp or in person. There is no structured approval workflow, and no persistent record of who verified what and when.
- **No formal fund request chain.** Club Heads request funds verbally or via chat. These requests are untracked, unapproved, and unauditable.
- **Closing balance is always stale.** Without automatic ledger updates after each transaction, the running balance is only as accurate as the last manual update.
- **Expense records are fragmented.** Event spending is recorded informally, making it impossible to generate a breakdown by category or event for institutional review.
- **No automated receipts.** Members who pay receive no formal acknowledgment — no PDF receipt, no transaction ID, no confirmation trail.
- **Zero proactive notifications.** Pending approvals pile up silently. There is no alerting mechanism when a payment is submitted, a fund is requested, or a fee deadline passes.
- **Reports require manual consolidation.** Producing a financial summary for administration means pulling data from multiple sources — a slow, inconsistent, and unreliable process.

### Solution

The Treasurer Dashboard replaces this fragmented system with a single, role-aware financial control panel. It provides the Treasurer with real-time balance tracking, a structured approval workflow for payments and fund requests, an auto-updating ledger, expense recording, analytics, PDF receipt generation, and an in-app notification system. Club Heads and Members interact with the system through their own role-scoped views, feeding into the Treasurer's dashboard as the financial source of truth.

### Scope

This PRD covers the Treasurer-facing dashboard and the backend workflows that support it, within a college/university Club Management System. Three primary actors interact with this system: **Treasurer**, **Club Head**, and **Member**.

---

## 2. Goals & Success Metrics

### Primary Goals

1. Give the Treasurer a single dashboard to manage all club financial activity without leaving the system.
2. Eliminate untracked informal payment approvals — every transaction must pass through an auditable workflow.
3. Reduce time-to-approval for member payments from days to minutes.
4. Ensure the running balance is always accurate and auto-updated after every transaction.
5. Give Club Heads a self-service mechanism to request funds with a visible approval status at every stage.
6. Make end-of-semester financial reporting a one-click export rather than a manual consolidation effort.
7. Automatically generate professional PDF receipts upon payment approval.
8. Alert relevant actors in real-time when their action is required.

### Success Metrics

| Metric | Target |
|---|---|
| Payment approval coverage | 100% of approved payments have a ledger entry and PDF receipt |
| Balance accuracy | Closing balance always auto-derived from ledger — zero manual calculations |
| Fee collection visibility | Collection rate (% members paid) visible on overview screen at all times |
| Audit trail completeness | Every financial action timestamped and attributed to a named user |
| Dashboard load time | Key financial summary renders in under 2 seconds |
| Report export time | Full financial report exports in under 30 seconds |
| Fund request cycle time | Tracked and displayed; target under 48 hours from submission to decision |

---

## 3. User Roles & Personas

Three roles interact with the Treasurer Dashboard. Each has a distinct scope of access and a different set of responsibilities.

### Role 1 — Treasurer

**Who:** An elected or appointed club officer responsible for managing club finances for the academic year.

**Goals:**
- Maintain an accurate, real-time view of the club's financial health
- Approve or reject member payment submissions and club fund requests
- Record expenses and maintain the ledger
- Generate reports and PDF receipts for institutional records

**Permissions:** Full read/write access to all financial modules. Only role that can approve/reject transactions and release funds.

---

### Role 2 — Club Head

**Who:** The head of a sub-club or event committee within the organization.

**Goals:**
- Submit fund requests for upcoming events
- Track the approval status and disbursement of requested funds
- View expense summaries relevant to their club

**Permissions:** Can submit and view fund requests. Cannot access ledger, member fee data, or other clubs' financials.

---

### Role 3 — Member

**Who:** A registered member of the club who owes a membership fee each semester.

**Goals:**
- Submit proof of payment for their membership fee
- View their own payment status and download their receipt once approved

**Permissions:** Can submit payment details and proof. Can view and download their own receipt. No access to club-wide financial data.

---

## 4. Feature Requirements

### 4.1 Financial Overview (Summary Cards)

The Overview is the Treasurer's home screen. It provides an at-a-glance snapshot of the club's current financial state without requiring any navigation.

**Summary Cards (always visible):**

| Card | Description |
|---|---|
| Opening Balance | Balance at the start of the current financial period |
| Closing Balance | Live-updated balance after all debits and credits |
| Total Fees Collected | Cumulative approved membership fee payments |
| Pending Fees | Sum of fees from members whose payment is not yet approved |
| Total Members Paid | Count of members with an approved payment this period |
| Pending Fund Requests | Count and total value of fund requests awaiting decision |

**Behavior:**
- Closing Balance auto-recalculates after every ledger entry (credit or debit).
- Cards use color coding: green for healthy balances, amber for pending items above a configurable threshold, red for overdrawn or critical states.
- Each card is tappable and deep-links to the relevant module (e.g., tapping "Pending Fund Requests" navigates to Fund Request Management filtered to pending).

---

### 4.2 Member Fee Management

A full table of all registered members and their fee status for the current period.

**Table Columns:**

| Column | Type | Notes |
|---|---|---|
| Member Name | String | Linked to member profile |
| Membership ID | String | Unique identifier |
| Fee Amount | Currency | As set by Treasurer for the period |
| Payment Status | Enum | Paid / Pending / Partial |
| Payment Mode | Enum | Online / Cash |
| Date Paid | Date | Null if unpaid |

**Filtering & Sorting:**
- Filter by Payment Status: All / Paid / Pending / Partial
- Filter by Payment Mode: All / Online / Cash
- Sort by any column (ascending/descending)
- Search by Member Name or Membership ID

**Actions available to Treasurer:**
- Manually mark a member as Paid (for cash payments not submitted through the system)
- Send a fee reminder notification to one or all pending members
- Export the current filtered view as CSV

---

### 4.3 Fee Approval Workflow

A structured queue for reviewing and acting on member-submitted payment proofs.

**Member submission flow:**
1. Member logs in and navigates to "Submit Payment"
2. Fills in: Amount, Payment Mode, Transaction ID (if online), Date, and uploads proof (image or PDF, max 5MB)
3. Submission enters the Treasurer's approval queue with status `Pending Review`

**Treasurer approval flow:**
1. Treasurer sees new submission in the queue (with in-app notification)
2. Opens submission detail: views all submitted fields plus uploaded proof (inline image preview or PDF viewer)
3. Takes one of three actions:
   - **Approve** — status updates to `Paid`, ledger credit entry created, PDF receipt generated and delivered to member
   - **Reject** — Treasurer must provide a rejection reason; member is notified with the reason
   - **Request Clarification** — Treasurer adds a note; submission stays in queue with status `Clarification Needed`

**Status lifecycle:**
`Submitted` → `Pending Review` → `Approved` / `Rejected` / `Clarification Needed`

**Audit trail:** Every status change is logged with the acting user, timestamp, and any notes.

---

### 4.4 Payment Ledger (Bank Book)

A chronological, double-entry ledger that serves as the authoritative financial record.

**Ledger Columns:**

| Column | Description |
|---|---|
| Date | Date of transaction |
| Description | Auto-generated or manually entered narrative |
| Debit (−) | Money out (expenses, released funds) |
| Credit (+) | Money in (approved fees, other income) |
| Running Balance | Auto-calculated after each entry |

**Entry triggers (automatic):**
- Treasurer approves a member payment → Credit entry created
- Treasurer releases a fund request → Debit entry created
- Treasurer records an expense → Debit entry created

**Manual entries:**
- Treasurer can add manual entries (e.g., bank interest, miscellaneous income) with a description and category tag.

**Behavior:**
- Running balance recalculates in real-time after every entry.
- Ledger is read-only to Club Heads and Members.
- Entries cannot be deleted — only a reversal entry can be added (with reason), preserving audit integrity.
- Full ledger exportable as PDF or CSV.

---

### 4.5 Payment History Log

A complete, immutable log of all payment-related activity in the system.

**Log Columns:**

| Column | Description |
|---|---|
| Member Name | Who made the payment |
| Amount | Payment amount |
| Mode | Online / Cash |
| Transaction ID | As submitted by member (nullable for cash) |
| Approval Status | Approved / Rejected / Pending / Clarification Needed |
| Approved/Rejected By | Treasurer name |
| Date Submitted | When member submitted |
| Date Actioned | When Treasurer approved/rejected |

**Behavior:**
- Filterable by status, mode, date range, and member name
- Sortable by any column
- Exportable as CSV or PDF
- Each row expandable to show full submission detail and uploaded proof

---

### 4.6 Fund Request Management

A workflow for Club Heads to request event funding and for the Treasurer to approve, reject, or release those funds.

**Club Head submission:**
- Club Head submits a request with: Club Name, Event Name, Amount Requested, Purpose/Description, Required By Date
- Request enters the Treasurer queue with status `Pending Approval`

**Treasurer actions:**
- **Approve** — Marks funds as committed; does not yet affect ledger
- **Reject** — Must provide reason; Club Head notified
- **Release Funds** — Confirms disbursement; creates Debit entry in ledger; generates fund release record

**Request record fields:**

| Field | Type |
|---|---|
| Club Name | String |
| Event Name | String |
| Amount Requested | Currency |
| Amount Released | Currency (may differ if partially released) |
| Approval Status | Pending / Approved / Rejected / Released |
| Requested By | Club Head name |
| Request Date | Date |
| Decision Date | Date |
| Treasurer Notes | Text |

**Status lifecycle:**
`Submitted` → `Pending Approval` → `Approved` → `Released` / `Rejected`

---

### 4.7 Expense Tracking

Allows the Treasurer to record club expenditures that may not flow through the fund request process (e.g., direct purchases, reimbursements).

**Expense Entry Fields:**

| Field | Type | Required |
|---|---|---|
| Expense Title | String | Yes |
| Amount | Currency | Yes |
| Date | Date | Yes |
| Category | Enum (Event, Operations, Equipment, Misc) | Yes |
| Description | Text | No |
| Receipt/Proof | File upload (image/PDF) | No |

**Behavior:**
- Each saved expense automatically creates a Debit entry in the Payment Ledger.
- Expenses are categorized and feed into the Expense Breakdown chart in Reports.
- Treasurer can edit or mark an expense as reversed (creates corresponding Credit entry).
- Filterable by category, date range, and amount.

---

### 4.8 Reports & Analytics

A dedicated reporting section with charts and exportable summaries.

**Charts:**

| Chart | Type | Description |
|---|---|---|
| Monthly Fee Collection | Bar chart | Total fees collected per month in the current academic year |
| Expense Breakdown | Pie/Donut chart | Expenses split by category |
| Net Balance Trend | Line chart | Closing balance plotted over time |
| Fee Collection Rate | Progress/Gauge | % of members paid vs. total members |
| Fund Requests Summary | Grouped bar | Requested vs. Released per club |

**Exportable Reports:**
- Full Ledger Report (PDF / CSV)
- Fee Collection Report — all members, status, amounts (PDF / CSV)
- Expense Summary Report (PDF)
- Fund Request Report (PDF)
- Custom date-range financial summary (PDF)

**Behavior:**
- All charts are interactive (hover tooltips, click-to-filter).
- Date range selector applies across all charts simultaneously.
- Reports are generated server-side to ensure accuracy regardless of client state.

---

### 4.9 Document Generation (PDF Receipts)

Automatically generates a professional PDF receipt for every approved payment.

**Receipt contents:**
- Club name and logo
- Receipt number (auto-incremented, unique)
- Member name and Membership ID
- Amount paid
- Payment mode and Transaction ID
- Date of payment and date of approval
- Approved by (Treasurer name)
- Digital signature placeholder or stamp
- Footer with club contact details

**Behavior:**
- Receipt is generated server-side (using a library such as PDFKit or Puppeteer) immediately upon approval.
- Receipt is stored and linked to the payment record permanently.
- Member receives an in-app notification with a download link.
- Treasurer can download any receipt from the Payment History log at any time.
- Receipts are numbered sequentially per financial period (e.g., REC-2024-001, REC-2024-002).

---

### 4.10 Notifications

An in-app notification system that keeps all actors informed of actions requiring their attention.

**Notification triggers:**

| Event | Recipient |
|---|---|
| Member submits a payment | Treasurer |
| Club Head submits a fund request | Treasurer |
| Payment is approved | Member |
| Payment is rejected (with reason) | Member |
| Fund request is approved | Club Head |
| Fund request is rejected (with reason) | Club Head |
| Funds are released | Club Head |
| Fee deadline is approaching (configurable days before) | All members with Pending status |
| Clarification requested on a payment submission | Member |

**Behavior:**
- Notifications appear in a bell icon in the top navigation bar with an unread count badge.
- Each notification links directly to the relevant record.
- Notifications are marked read individually or all-at-once.
- Notification history is retained for the current academic period.
- Future enhancement: email delivery of notifications (out of scope for v1).

---

## 5. Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (TypeScript), TailwindCSS |
| Charts | Recharts (preferred) or Chart.js |
| Backend | Node.js with Express.js (or NestJS for larger teams) |
| Database | MongoDB |
| PDF Generation | PDFKit (Node.js) or Puppeteer (headless Chrome) |
| File Storage | Local storage (dev) / AWS S3 or Cloudinary (production) |
| Authentication | JWT with role-based access control (RBAC) |
| API Style | RESTful JSON API |

### Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────┐
│               React Frontend                │
│  (Treasurer Dashboard / Member Views)       │
└──────────────────────┬──────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────┐
│             Node.js / Express               │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Auth    │ │ Finance  │ │Notification │ │
│  │ Service  │ │ Service  │ │  Service    │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
│  ┌──────────┐ ┌──────────┐                 │
│  │  PDF     │ │  File    │                 │
│  │ Service  │ │ Service  │                 │
│  └──────────┘ └──────────┘                 │
└──────────────────────┬──────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────┐             ┌────────▼───────┐
│   MongoDB    │             │  File Storage  │
│  (Primary DB)│             │  (S3 / Local)  │
└──────────────┘             └────────────────┘
```

### Role-Based Access Control

| Module | Treasurer | Club Head | Member |
|---|---|---|---|
| Financial Overview | Full access | No access | No access |
| Member Fee Management | Full access | No access | Own record only |
| Fee Approval Workflow | Approve/Reject | No access | Submit only |
| Payment Ledger | Full access | Read only (own club) | No access |
| Payment History | Full access | No access | Own records only |
| Fund Request Management | Approve/Reject/Release | Submit + view own | No access |
| Expense Tracking | Full access | No access | No access |
| Reports & Analytics | Full access | Limited (own club) | No access |
| PDF Receipts | Download all | No access | Own receipt only |
| Notifications | All | Relevant only | Relevant only |

---

## 6. Data Models

### User
```
User {
  id: UUID
  name: String
  email: String (unique)
  passwordHash: String
  role: Enum [TREASURER, CLUB_HEAD, MEMBER]
  membershipId: String (nullable, for Members)
  clubId: UUID (nullable, for Club Heads)
  createdAt: DateTime
}
```

### Payment
```
Payment {
  id: UUID
  memberId: UUID → User
  amount: Decimal
  mode: Enum [ONLINE, CASH]
  transactionId: String (nullable)
  proofFileUrl: String (nullable)
  status: Enum [SUBMITTED, PENDING_REVIEW, APPROVED, REJECTED, CLARIFICATION_NEEDED]
  rejectionReason: String (nullable)
  treasurerNote: String (nullable)
  approvedById: UUID → User (nullable)
  receiptUrl: String (nullable)
  receiptNumber: String (nullable)
  submittedAt: DateTime
  actionedAt: DateTime (nullable)
}
```

### LedgerEntry
```
LedgerEntry {
  id: UUID
  date: Date
  description: String
  type: Enum [CREDIT, DEBIT]
  amount: Decimal
  runningBalance: Decimal
  referenceType: Enum [PAYMENT, FUND_RELEASE, EXPENSE, MANUAL]
  referenceId: UUID (nullable)
  createdById: UUID → User
  createdAt: DateTime
  isReversed: Boolean (default: false)
  reversalEntryId: UUID (nullable)
}
```

### FundRequest
```
FundRequest {
  id: UUID
  clubId: UUID → Club
  requestedById: UUID → User
  eventName: String
  amountRequested: Decimal
  amountReleased: Decimal (nullable)
  purpose: String
  requiredByDate: Date
  status: Enum [SUBMITTED, APPROVED, REJECTED, RELEASED]
  treasurerNotes: String (nullable)
  rejectionReason: String (nullable)
  decidedById: UUID → User (nullable)
  submittedAt: DateTime
  decidedAt: DateTime (nullable)
  releasedAt: DateTime (nullable)
}
```

### Expense
```
Expense {
  id: UUID
  title: String
  amount: Decimal
  date: Date
  category: Enum [EVENT, OPERATIONS, EQUIPMENT, MISC]
  description: String (nullable)
  receiptFileUrl: String (nullable)
  recordedById: UUID → User
  ledgerEntryId: UUID → LedgerEntry
  isReversed: Boolean (default: false)
  createdAt: DateTime
}
```

### Notification
```
Notification {
  id: UUID
  recipientId: UUID → User
  type: Enum [PAYMENT_SUBMITTED, PAYMENT_APPROVED, PAYMENT_REJECTED,
              FUND_REQUESTED, FUND_APPROVED, FUND_REJECTED, FUND_RELEASED,
              FEE_REMINDER, CLARIFICATION_REQUESTED]
  message: String
  referenceId: UUID (nullable)
  isRead: Boolean (default: false)
  createdAt: DateTime
}
```

### Club
```
Club {
  id: UUID
  name: String
  headId: UUID → User
  createdAt: DateTime
}
```

---

## 7. API Contracts

All endpoints are prefixed with `/api/v1`. All requests require a valid JWT Bearer token unless marked `[Public]`. Role restrictions are noted per endpoint.

### Authentication
```
POST   /auth/login              [Public]   Authenticate user, return JWT
POST   /auth/logout                        Invalidate token
GET    /auth/me                            Return current user profile
```

### Financial Overview
```
GET    /dashboard/overview      [TREASURER]   Return all summary card values
```

### Members & Fees
```
GET    /members                 [TREASURER]   List all members with fee status
                                              Query: ?status=paid|pending|partial
                                              Query: ?mode=online|cash
                                              Query: ?search=string
PATCH  /members/:id/fee-status  [TREASURER]   Manually update fee status (cash payments)
POST   /members/:id/reminder    [TREASURER]   Send fee reminder notification
GET    /members/export          [TREASURER]   Export member fee table as CSV
```

### Payments
```
POST   /payments                [MEMBER]      Submit payment proof
GET    /payments                [TREASURER]   List all payments (filterable)
GET    /payments/:id            [TREASURER]   Get single payment detail
PATCH  /payments/:id/approve    [TREASURER]   Approve payment
PATCH  /payments/:id/reject     [TREASURER]   Reject payment (requires reason in body)
PATCH  /payments/:id/clarify    [TREASURER]   Request clarification (requires note in body)
GET    /payments/:id/receipt    [TREASURER, MEMBER (own)]   Download PDF receipt
```

### Ledger
```
GET    /ledger                  [TREASURER]   Get full ledger (paginated)
POST   /ledger/manual-entry     [TREASURER]   Add manual ledger entry
POST   /ledger/:id/reverse      [TREASURER]   Create reversal entry (requires reason)
GET    /ledger/export           [TREASURER]   Export ledger as PDF or CSV
```

### Fund Requests
```
POST   /fund-requests           [CLUB_HEAD]   Submit a fund request
GET    /fund-requests           [TREASURER]   List all fund requests (filterable)
GET    /fund-requests/:id       [TREASURER, CLUB_HEAD (own)]   Get request detail
PATCH  /fund-requests/:id/approve   [TREASURER]   Approve fund request
PATCH  /fund-requests/:id/reject    [TREASURER]   Reject fund request (requires reason)
PATCH  /fund-requests/:id/release   [TREASURER]   Mark funds as released
```

### Expenses
```
POST   /expenses                [TREASURER]   Record a new expense
GET    /expenses                [TREASURER]   List expenses (filterable by category, date)
PATCH  /expenses/:id            [TREASURER]   Edit an expense
POST   /expenses/:id/reverse    [TREASURER]   Reverse an expense entry
```

### Reports
```
GET    /reports/fee-collection  [TREASURER]   Fee collection report (PDF/CSV)
GET    /reports/expenses        [TREASURER]   Expense summary report (PDF)
GET    /reports/fund-requests   [TREASURER]   Fund request report (PDF)
GET    /reports/ledger          [TREASURER]   Full ledger report (PDF/CSV)
GET    /reports/summary         [TREASURER]   Custom date-range summary (PDF)
                                              Query: ?from=date&to=date
```

### Notifications
```
GET    /notifications           [ALL]         List notifications for current user
PATCH  /notifications/:id/read  [ALL]         Mark notification as read
PATCH  /notifications/read-all  [ALL]         Mark all notifications as read
```

---

## 8. UI/UX Requirements

### Layout

The dashboard uses a standard admin panel layout:

- **Sidebar (fixed left):** Navigation links to all modules, user avatar, role badge, notification bell with unread count
- **Top Bar:** Page title, breadcrumb, search (where applicable), user menu
- **Main Content Area:** Module-specific content — cards, tables, charts, forms

### Sidebar Navigation Items (Treasurer view)
1. Overview
2. Member Fees
3. Fee Approvals (with pending count badge)
4. Payment Ledger
5. Payment History
6. Fund Requests (with pending count badge)
7. Expenses
8. Reports & Analytics
9. Notifications

### Responsive Design
- Desktop-first, with full functionality at 1280px+
- Tablet: sidebar collapses to icon-only; tables horizontally scrollable
- Mobile: sidebar becomes a bottom sheet drawer; cards stack vertically

### Table Standards
- All tables support: column sorting (click header), per-column filtering, row-level actions via dropdown, pagination (25 rows default, configurable to 50/100)
- Bulk actions: select multiple rows → apply action (e.g., send reminder to all pending)
- Empty states: illustrated empty state with a clear call-to-action for each table

### Color & Status Conventions
| Status | Color |
|---|---|
| Paid / Approved / Released | Green |
| Pending / Submitted | Amber |
| Rejected | Red |
| Clarification Needed | Blue |
| Partial | Orange |

### Chart Interactions
- All Recharts charts have hover tooltips with exact values
- Clicking a chart segment filters the adjacent data table
- Charts have a date range selector (This Month / This Quarter / This Year / Custom)

### Forms & Validation
- All forms use inline real-time validation (not submit-time)
- File upload fields show preview thumbnail for images, filename for PDFs
- Confirmation modals required for destructive actions (reject, reverse, delete)
- All forms are keyboard-navigable and screen-reader accessible (ARIA labels)

### Loading & Error States
- Skeleton loaders for all data-fetching components
- Toast notifications for success/error feedback on every action
- Global error boundary with a graceful fallback UI

---

## 9. Non-Functional Requirements

### Performance
- Dashboard overview must load in under 2 seconds on a standard broadband connection
- All API responses must return within 500ms for read operations, 1 second for write operations
- PDF generation must complete within 5 seconds for a single receipt

### Security
- All API endpoints protected by JWT authentication
- Role-based access control enforced server-side (never trust client-side role checks alone)
- Uploaded files (payment proofs, expense receipts) stored with non-guessable URLs; access validated per request
- Passwords hashed with bcrypt (minimum 12 rounds)
- All API communication over HTTPS
- Input sanitization on all user-facing fields to prevent XSS and SQL injection

### Data Integrity
- Ledger entries are immutable — no deletions, only reversals with a reason
- All financial state changes (approvals, rejections, releases) are timestamped and attributed
- Database transactions used for any operation that touches both the Payment table and LedgerEntry table simultaneously

### Scalability
- API designed stateless to support horizontal scaling
- Pagination on all list endpoints (default 25, max 100 per page)
- File uploads streamed directly to object storage (not buffered in application memory)

### Availability
- System should target 99.5% uptime during the academic year
- Database backups automated daily with 30-day retention

### Accessibility
- WCAG 2.1 AA compliance target
- All interactive elements keyboard-navigable
- Color is never the sole indicator of status (always paired with a label or icon)

---

## 10. Out of Scope (v1)

The following items are explicitly excluded from the initial release and may be considered for v2:

- **Email notifications** — v1 supports in-app notifications only; email delivery is a future enhancement
- **SMS notifications** — not in scope
- **Multi-club Treasurer** — v1 assumes one Treasurer per club; a shared treasurer managing multiple clubs is not supported
- **Online payment gateway integration** — the system records and verifies payments but does not process them; actual payment collection happens externally (UPI, bank transfer, etc.)
- **Accounting standards compliance** — the ledger is operational, not a formal accounting ledger (no double-entry bookkeeping, no tax handling)
- **Student/admin portal for institution-level reporting** — the dashboard is club-scoped only
- **Mobile native app** — responsive web only for v1
- **Recurring fee schedules** — fee periods are set manually by the Treasurer
- **Multi-currency support** — single currency (INR assumed) for v1
- **AI-powered anomaly detection or financial forecasting**

---

## 11. Milestones & Timeline

This timeline assumes a small team of 2–3 developers working part-time (student project cadence). Adjust based on actual team capacity.

| Milestone | Deliverables | Estimated Duration |
|---|---|---|
| **M1 — Foundation** | Project setup, auth system, RBAC, DB schema, base layout | Week 1–2 |
| **M2 — Core Finance** | Overview cards, Ledger, Member Fee table, Payment submission | Week 3–4 |
| **M3 — Approval Workflows** | Fee Approval queue, Fund Request workflow, Notification system | Week 5–6 |
| **M4 — Expense & Reports** | Expense tracking, all charts, report exports (CSV) | Week 7–8 |
| **M5 — PDF & Polish** | PDF receipt generation, UI polish, loading/error states, responsive fixes | Week 9–10 |
| **M6 — Testing & Launch** | Integration testing, bug fixes, seed data, deployment | Week 11–12 |

### Priority Order (if timeline compresses)
**Must Have (v1 launch):** Overview, Member Fee table, Fee Approval, Ledger, Fund Requests, Notifications
**Should Have:** Expense Tracking, Payment History, Basic Charts
**Nice to Have:** PDF Receipts, Advanced Reports, CSV Export

---

## 12. Open Questions & Risks

### Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | What is the fee structure — flat fee per semester, or variable per membership tier? | Product / Club Admin | Open |
| 2 | Should partial payments be allowed? If so, how is the ledger entry structured? | Product | Open |
| 3 | What is the file size/type limit for payment proof uploads? | Engineering | Suggested: 5MB, JPG/PNG/PDF |
| 4 | How are financial periods defined — academic semester, calendar year? | Product / Club Admin | Open |
| 5 | Is there a requirement for a second Treasurer sign-off on large fund releases above a threshold? | Product | Open |
| 6 | Will the system need to support multiple clubs under one organization, or is it one instance per club? | Architecture | Open |
| 7 | What ODM library will be used with MongoDB — Mongoose or native driver? | Engineering | Recommendation: Mongoose for schema validation and ease of use |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PDF generation is slow or crashes under load | Medium | Medium | Use a queue-based approach; generate async and notify when ready |
| File storage costs grow unexpectedly | Low | Low | Set file size limits; use compression; clean up rejected submission proofs after 90 days |
| Ledger balance drift due to concurrent writes | Low | High | Use MongoDB multi-document transactions for any operation touching both Payment and LedgerEntry collections |
| Members submit fraudulent payment proofs | Medium | High | Treasurer review is mandatory; proofs stored permanently for dispute resolution |
| Scope creep from stakeholders requesting email/SMS/gateway features | High | Medium | Maintain explicit Out of Scope section; document feature requests for v2 backlog |

---

## Appendix

### A. Glossary

| Term | Definition |
|---|---|
| Treasurer | The club officer with full financial management access in the system |
| Club Head | The head of a sub-club or event committee who can request funds |
| Member | A registered club member who pays membership fees |
| Ledger | The chronological record of all financial transactions |
| Running Balance | The auto-calculated balance after each ledger entry |
| Fund Request | A formal request from a Club Head for event or operational funding |
| Receipt | An auto-generated PDF confirming an approved payment |
| Financial Period | The defined timeframe (e.g., semester) for which fees and balances are tracked |

### B. Technology Recommendations

**Why MongoDB:**
MongoDB's document model maps naturally to the nested and variable-shape data in this system (e.g., payment proofs, treasurer notes, notification payloads). Mongoose provides schema-level validation to enforce data integrity at the application layer. Use transactions (available in MongoDB 4.0+ with replica sets) for any operation that touches both the Payment collection and LedgerEntry collection simultaneously.

**Why Recharts over Chart.js:**
Recharts is React-native and integrates cleanly with component state and TypeScript. Chart.js requires imperative DOM manipulation and is better suited for non-React contexts.

**Why PDFKit over Puppeteer for receipts:**
PDFKit is a lightweight programmatic PDF library with no browser dependency. Puppeteer is more powerful but heavier — better suited for complex HTML-to-PDF conversions. For structured receipts, PDFKit is faster and more predictable.

### C. Suggested Folder Structure (Frontend)

```
src/
  components/
    layout/       # Sidebar, TopBar, Layout wrapper
    ui/           # Reusable: Button, Badge, Modal, Toast, Table, Card
    charts/       # Recharts wrappers per chart type
  pages/
    overview/
    members/
    fee-approvals/
    ledger/
    payment-history/
    fund-requests/
    expenses/
    reports/
    notifications/
  hooks/          # Custom React hooks (useAuth, usePagination, etc.)
  services/       # Axios API client and per-module API functions
  types/          # TypeScript interfaces and enums
  utils/          # Date formatting, currency formatting, file helpers
  store/          # Global state (React Context or Zustand)
```

### D. Suggested Folder Structure (Backend)

```
src/
  modules/
    auth/
    users/
    payments/
    ledger/
    fund-requests/
    expenses/
    reports/
    notifications/
  middleware/     # Auth guard, role guard, error handler
  common/         # Shared DTOs, decorators, pipes
  config/         # Environment config, DB connection
  services/
    pdf/          # PDF generation service
    storage/      # File upload service
    notifications/# Notification dispatch service
```
