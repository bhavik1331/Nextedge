import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/treasurer/overview", label: "Overview" },
  { to: "/treasurer/member-fees", label: "Member Fees" },
  { to: "/treasurer/fee-approvals", label: "Fee Approvals" },
  { to: "/treasurer/payment-history", label: "Payment History" },
  { to: "/treasurer/ledger", label: "Payment Ledger" },
  { to: "/treasurer/fund-requests", label: "Fund Requests" },
  { to: "/treasurer/expenses", label: "Expenses" },
  { to: "/treasurer/reports", label: "Reports" },
  { to: "/treasurer/notifications", label: "Notifications" },
];

const TreasurerLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 h-fit sticky top-24">
          <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Treasurer Panel
          </p>
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="rounded-xl border border-slate-200 bg-white p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TreasurerLayout;
