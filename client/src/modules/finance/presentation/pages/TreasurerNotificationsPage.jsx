import React, { useEffect, useState } from "react";
import { treasurerUseCases } from "../../application/treasurer.usecases";

const TreasurerNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    setNotifications(await treasurerUseCases.loadNotifications());
  };

  useEffect(() => {
    load();
  }, []);

  const read = async (id) => {
    await treasurerUseCases.markNotificationRead(id);
    await load();
  };

  const readAll = async () => {
    await treasurerUseCases.markAllNotificationsRead();
    await load();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={readAll}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <article
            key={n._id}
            className={`rounded-lg border p-3 ${n.isRead ? "border-slate-200 bg-slate-50" : "border-blue-200 bg-blue-50"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{n.subject}</p>
                <p className="text-sm text-slate-600">{n.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <button
                  className="rounded bg-slate-900 px-2 py-1 text-xs text-white"
                  onClick={() => read(n._id)}
                >
                  Read
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TreasurerNotificationsPage;
