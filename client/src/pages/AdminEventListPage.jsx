import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios.js";
import AdminEventTable from "./AdminEventTable";
import AdminEventEditModal from "./AdminEventEditModal";
import { Calendar, PlusCircle, MessageSquare, Users, Bell, UserCheck } from "lucide-react";

const AdminEventListPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const res = await api.get("/events");
    const list = res.data.events || [];
    const now = new Date();
    const getStart = (e) => new Date(e.eventStartDate || e.date);
    const upcoming = list.filter((e) => getStart(e) >= now).sort((a, b) => getStart(a) - getStart(b));
    const past = list.filter((e) => getStart(e) < now).sort((a, b) => getStart(b) - getStart(a));
    setEvents([...upcoming, ...past]);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:mt-14 p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all events
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/event-form"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            Create Event
          </Link>
          <Link
            to="/admin/members"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Users className="w-5 h-5" />
            Members
          </Link>
          <button
            onClick={() => navigate("/admin/contacts")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            View Contacts
          </button>
          <Link
            to="/admin/notifications"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Bell className="w-5 h-5" />
            Send Notification
          </Link>
          <Link
            to="/admin/attendance"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <UserCheck className="w-5 h-5" />
            Attendance
          </Link>
        </div>
      </div>

      <AdminEventTable
        events={events}
        onEdit={setSelectedEvent}
        onDelete={fetchEvents}
      />

      {selectedEvent && (
        <AdminEventEditModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={fetchEvents}
        />
      )}
    </div>
  );
};

export default AdminEventListPage;
