import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ClubePage from "./pages/ClubePage";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import AdminEventsPage from "./pages/AdminEventsPage";
import AdminEventListPage from "./pages/AdminEventListPage";
import AdminEventRegistrationsPage from "./pages/AdminEventRegistrationsPage";
import AdminContactPage from "./pages/AdminContactPage";
import AdminMembersPage from "./pages/AdminMembersPage";
import AdminLogin from "./pages/AdminLogin";
import MemberLogin from "./pages/MemberLogin";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import MemberPaymentsPage from "./pages/MemberPaymentsPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import AdminDocumentsPage from "./pages/AdminDocumentsPage";
import RoleGuard from "./components/RoleGuard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MemberDashboardLayout from "./layouts/MemberDashboardLayout";
import DashboardOverview from "./pages/member/DashboardOverview";
import MemberEvents from "./pages/member/MemberEvents";
import MemberAttendance from "./pages/member/MemberAttendance";
import MemberPayments from "./pages/member/MemberPayments";
import MemberProfile from "./pages/member/MemberProfile";

const Layout = () => {
  return (
    <AuthProvider>
      <LayoutContent />
    </AuthProvider>
  );
};

const LayoutContent = () => {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/clubs" element={<ClubePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:eventId" element={<EventDetail />} />
      
      {/* Utility Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/member-login" element={<MemberLogin />} />

      {/* CORE ADMIN ROUTES */}
      <Route element={<RoleGuard requiredRole={['ADMIN', 'CLUB_HEAD']} />}>
        <Route path="/admin/events" element={<AdminEventListPage />} />
        <Route path="/admin/event-form" element={<AdminEventsPage />} />
        <Route path="/admin/events/:eventId/registrations" element={<AdminEventRegistrationsPage />} />
        <Route path="/admin/members" element={<AdminMembersPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
      </Route>

      {/* SUPER ADMIN OR TREASURER ROUTES */}
      <Route element={<RoleGuard requiredRole={['ADMIN', 'TREASURER']} />}>
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/documents" element={<AdminDocumentsPage />} />
      </Route>

      <Route element={<RoleGuard requiredRole="ADMIN" />}>
        <Route path="/admin/contacts" element={<AdminContactPage />} />
      </Route>

      {/* MEMBER SPECIFIC ROUTE (Will be allowed for Admin contextual view too per Guard logic) */}
      <Route element={<RoleGuard requiredRole="MEMBER" />}>
        <Route element={<MemberDashboardLayout />}>
          <Route path="/member/dashboard" element={<DashboardOverview />} />
          <Route path="/member/events" element={<MemberEvents />} />
          <Route path="/member/attendance" element={<MemberAttendance />} />
          <Route path="/member/payments" element={<MemberPayments />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/notifications" element={<div>Notifications Page (Coming Soon)</div>} />
        </Route>
      </Route>

      {/* 404 Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
