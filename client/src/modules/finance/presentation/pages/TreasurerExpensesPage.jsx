import React, { useCallback, useEffect, useState } from "react";
import { treasurerUseCases } from "../../application/treasurer.usecases";
import { toCurrency } from "../../domain/finance.constants";
import TablePagination from "../components/TablePagination";

const TreasurerExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  const load = useCallback(async () => {
    const response = await treasurerUseCases.loadExpenses({ page, limit });
    setExpenses(response.expenses || []);
    setPagination(response.pagination || { page: 1, limit, total: 0, pages: 1 });
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const addExpense = async () => {
    const title = window.prompt("Expense title");
    if (!title) return;
    const amount = window.prompt("Amount", "0");
    if (!amount) return;
    const category = window.prompt("Category: EVENT, OPERATIONS, EQUIPMENT, MISC", "EVENT");
    if (!category) return;

    const payload = new FormData();
    payload.append("title", title);
    payload.append("amount", amount);
    payload.append("category", category.toUpperCase());
    payload.append("date", new Date().toISOString());
    payload.append("description", "Recorded from Treasurer expenses quick add");

    await treasurerUseCases.createExpense(payload);
    await load();
  };

  const reverse = async (id) => {
    const reason = window.prompt("Reversal reason");
    if (!reason) return;
    await treasurerUseCases.reverseExpense(id, { reason });
    await load();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expense Tracking</h1>
        <button onClick={addExpense} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add Expense</button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id} className="border-t border-slate-100">
                <td className="px-3 py-2">{e.title}</td>
                <td className="px-3 py-2">{e.category}</td>
                <td className="px-3 py-2">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-3 py-2">{toCurrency(e.amount)}</td>
                <td className="px-3 py-2">{!e.isReversed && <button className="rounded border border-slate-300 px-2 py-1 text-xs" onClick={() => reverse(e._id)}>Reverse</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />
    </section>
  );
};

export default TreasurerExpensesPage;
