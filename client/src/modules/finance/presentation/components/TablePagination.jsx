import React from "react";

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const TablePagination = ({ page, pages, total, limit, onPageChange, onLimitChange }) => {
  const safePages = Math.max(Number(pages) || 1, 1);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), safePages);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
      <p className="text-slate-600">
        Total records: <span className="font-semibold text-slate-800">{Number(total) || 0}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-slate-600" htmlFor="page-size-select">
          Rows per page
        </label>
        <select
          id="page-size-select"
          className="rounded border border-slate-300 px-2 py-1"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
        >
          Previous
        </button>
        <span className="min-w-24 text-center text-slate-700">Page {safePage} of {safePages}</span>
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safePages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
