import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../../api/axios";
import { memberFinanceUseCases } from "../../application/member.usecases";
import StatusBadge from "../components/StatusBadge";
import { toCurrency } from "../../domain/finance.constants";
import { useAuthStore } from "../../../../store/authStore";

const ClubHeadFundsPage = () => {
  const [activeTab, setActiveTab] = useState("request");
  const [fundRequests, setFundRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    clubName: "",
    eventId: "",
    amountRequested: "",
    purpose: "",
    requiredByDate: "",
  });

  const load = useCallback(async () => {
    const [myRequests, myPayments, myNotifications, eventsRes] =
      await Promise.all([
        memberFinanceUseCases.loadMyFundRequests(),
        memberFinanceUseCases.loadMyPayments(),
        memberFinanceUseCases.loadMyNotifications(),
        api.get("/events"),
      ]);

    setFundRequests(myRequests || []);
    setPayments(myPayments || []);
    setNotifications(myNotifications || []);

    const allEvents = eventsRes.data?.events || [];
    const currentUserId = String(user?.id || "");

    // createdBy can be an ObjectId string, populated object, or empty for legacy events.
    const myEvents = allEvents.filter((event) => {
      const creatorId =
        typeof event.createdBy === "object" && event.createdBy !== null
          ? String(event.createdBy._id || "")
          : String(event.createdBy || "");
      return creatorId === currentUserId;
    });

    // Fallback for older events without createdBy metadata.
    const source = myEvents.length > 0 ? myEvents : allEvents;
    setClubEvents(source);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    const selectedEvent = clubEvents.find(
      (event) => String(event._id) === String(form.eventId),
    );
    if (!selectedEvent) return;

    await memberFinanceUseCases.submitFundRequest({
      clubName: form.clubName,
      eventName: selectedEvent.title,
      ...form,
      amountRequested: Number(form.amountRequested),
    });
    setForm({
      clubName: "",
      eventId: "",
      amountRequested: "",
      purpose: "",
      requiredByDate: "",
    });
    setActiveTab("history");
    await load();
  };

  const markNotificationRead = async (id) => {
    await memberFinanceUseCases.markNotificationRead(id);
    await load();
  };

  const markAllNotificationsRead = async () => {
    await memberFinanceUseCases.markAllNotificationsRead();
    await load();
  };

  const stats = useMemo(() => {
    const totalRequested = fundRequests.reduce(
      (sum, item) => sum + Number(item.amountRequested || 0),
      0,
    );
    const totalReleased = fundRequests.reduce(
      (sum, item) => sum + Number(item.amountReleased || 0),
      0,
    );
    const pendingCount = fundRequests.filter((item) =>
      ["PENDING_APPROVAL", "SUBMITTED"].includes(
        String(item.status || "").toUpperCase(),
      ),
    ).length;
    const unreadNotifications = notifications.filter((n) => !n.isRead).length;

    return {
      totalRequested,
      totalReleased,
      pendingCount,
      unreadNotifications,
    };
  }, [fundRequests, notifications]);

  const selectedEventDate = useMemo(() => {
    const selectedEvent = clubEvents.find(
      (event) => String(event._id) === String(form.eventId),
    );
    const baseDate = selectedEvent?.eventStartDate || selectedEvent?.date;
    return baseDate ? new Date(baseDate).toLocaleDateString() : null;
  }, [clubEvents, form.eventId]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Club Head Workspace</h1>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded px-3 py-2 text-sm font-medium ${activeTab === "request" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            onClick={() => setActiveTab("request")}
          >
            New Request
          </button>
          <button
            className={`rounded px-3 py-2 text-sm font-medium ${activeTab === "history" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            onClick={() => setActiveTab("history")}
          >
            Request History
          </button>
          <button
            className={`rounded px-3 py-2 text-sm font-medium ${activeTab === "payments" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            onClick={() => setActiveTab("payments")}
          >
            My Payments
          </button>
          <button
            className={`rounded px-3 py-2 text-sm font-medium ${activeTab === "notifications" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Requested
          </p>
          <p className="mt-1 text-lg font-bold">
            {toCurrency(stats.totalRequested)}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Released
          </p>
          <p className="mt-1 text-lg font-bold">
            {toCurrency(stats.totalReleased)}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Pending Requests
          </p>
          <p className="mt-1 text-lg font-bold">{stats.pendingCount}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Unread Notifications
          </p>
          <p className="mt-1 text-lg font-bold">{stats.unreadNotifications}</p>
        </article>
      </div>

      {activeTab === "request" && (
        <form
          className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
          onSubmit={submit}
        >
          <input
            className="rounded border border-slate-300 px-3 py-2"
            placeholder="Club Name"
            value={form.clubName}
            onChange={(e) =>
              setForm((s) => ({ ...s, clubName: e.target.value }))
            }
            required
          />
          <select
            className="rounded border border-slate-300 px-3 py-2"
            value={form.eventId}
            onChange={(e) =>
              setForm((s) => ({ ...s, eventId: e.target.value }))
            }
            required
          >
            <option value="">Select Created Event</option>
            {clubEvents.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
          <input
            className="rounded border border-slate-300 px-3 py-2"
            placeholder="Amount Requested"
            type="number"
            value={form.amountRequested}
            onChange={(e) =>
              setForm((s) => ({ ...s, amountRequested: e.target.value }))
            }
            required
          />
          <input
            className="rounded border border-slate-300 px-3 py-2"
            placeholder="Required By"
            type="date"
            value={form.requiredByDate}
            onChange={(e) =>
              setForm((s) => ({ ...s, requiredByDate: e.target.value }))
            }
            required
          />
          <textarea
            className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
            placeholder="Purpose"
            value={form.purpose}
            onChange={(e) =>
              setForm((s) => ({ ...s, purpose: e.target.value }))
            }
            required
          />
          {selectedEventDate && (
            <p className="text-xs text-slate-500 md:col-span-2">
              Selected event date: {selectedEventDate}
            </p>
          )}
          {clubEvents.length === 0 && (
            <p className="text-sm text-amber-700 md:col-span-2">
              No created events found. Create one first at{" "}
              <Link to="/club-head/event-form" className="underline">
                Club Head Create Event
              </Link>
              .
            </p>
          )}
          <button className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white md:col-span-2">
            Submit Request
          </button>
        </form>
      )}

      {activeTab === "history" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2">Club</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Requested</th>
                <th className="px-3 py-2">Released</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {fundRequests.map((fr) => (
                <tr key={fr._id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{fr.clubName}</td>
                  <td className="px-3 py-2">{fr.eventName}</td>
                  <td className="px-3 py-2">
                    {toCurrency(fr.amountRequested)}
                  </td>
                  <td className="px-3 py-2">
                    {fr.amountReleased ? toCurrency(fr.amountReleased) : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={fr.status} />
                  </td>
                </tr>
              ))}
              {fundRequests.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={5}>
                    No fund requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Purpose</th>
                <th className="px-3 py-2">Mode</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{toCurrency(p.amount)}</td>
                  <td className="px-3 py-2">{p.purpose || "Membership Fee"}</td>
                  <td className="px-3 py-2">
                    {p.mode || p.paymentType || "-"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2">
                    {new Date(
                      p.submittedAt || p.createdAt,
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={5}>
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "notifications" && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Notifications
            </h2>
            <button
              onClick={markAllNotificationsRead}
              className="rounded border border-slate-300 px-3 py-1 text-xs"
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
                      onClick={() => markNotificationRead(n._id)}
                    >
                      Read
                    </button>
                  )}
                </div>
              </article>
            ))}
            {notifications.length === 0 && (
              <p className="text-sm text-slate-500">No notifications.</p>
            )}
          </div>
        </section>
      )}
    </section>
  );
};

export default ClubHeadFundsPage;
