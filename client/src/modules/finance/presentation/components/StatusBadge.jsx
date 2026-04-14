import React from "react";
import { STATUS_COLORS } from "../../domain/finance.constants";

const StatusBadge = ({ status }) => {
  const key = String(status || "");
  const className = STATUS_COLORS[key] || STATUS_COLORS[key.toUpperCase()] || "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      {key.replaceAll("_", " ")}
    </span>
  );
};

export default StatusBadge;
