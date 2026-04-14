import React, { useCallback, useEffect, useMemo, useState } from "react";
import { treasurerUseCases } from "../../application/treasurer.usecases";
import { toCurrency } from "../../domain/finance.constants";
import StatusBadge from "../components/StatusBadge";
import TablePagination from "../components/TablePagination";

const TreasurerMemberFeesPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", mode: "", search: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await treasurerUseCases.loadMemberFees(filters));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(
    () => Math.max(Math.ceil(rows.length / limit), 1),
    [rows.length, limit],
  );
  const currentPage = Math.min(page, pages);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return rows.slice(start, start + limit);
  }, [rows, currentPage, limit]);

  const markPaid = async (memberId) => {
    const amount = window.prompt("Enter paid amount", "500");
    if (!amount) return;
    await treasurerUseCases.markMemberPaid(memberId, { amount, mode: "CASH" });
    await load();
  };

  const remind = async (memberId) => {
    await treasurerUseCases.sendReminder(memberId);
    window.alert("Reminder sent");
  };

  const exportCsv = async () => {
    const blob = await treasurerUseCases.exportMemberFees(filters);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `member-fees-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <p>Loading member fee records...</p>;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Member Fee Management</h1>
        <button
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          onClick={exportCsv}
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) =>
            setFilters((s) => ({ ...s, status: e.target.value }))
          }
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={filters.mode}
          onChange={(e) => setFilters((s) => ({ ...s, mode: e.target.value }))}
        >
          <option value="">All Modes</option>
          <option value="ONLINE">Online</option>
          <option value="CASH">Cash</option>
        </select>
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search by name or membership ID"
          value={filters.search}
          onChange={(e) =>
            setFilters((s) => ({ ...s, search: e.target.value }))
          }
        />
        <button
          className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
          onClick={load}
        >
          Apply Filters
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Member</th>
              <th className="px-3 py-2">Membership ID</th>
              <th className="px-3 py-2">Fee</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Mode</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => (
              <tr key={row.memberId} className="border-t border-slate-100">
                <td className="px-3 py-2">{row.memberName}</td>
                <td className="px-3 py-2">{row.membershipId}</td>
                <td className="px-3 py-2">{toCurrency(row.feeAmount)}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.paymentStatus} />
                </td>
                <td className="px-3 py-2">{row.paymentMode || "-"}</td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    className="rounded bg-slate-900 px-2 py-1 text-xs text-white"
                    onClick={() => markPaid(row.memberId)}
                  >
                    Mark Paid
                  </button>
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => remind(row.memberId)}
                  >
                    Remind
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={currentPage}
        pages={pages}
        total={rows.length}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />
    </section>
  );
};

export default TreasurerMemberFeesPage;
