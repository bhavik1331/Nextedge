import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Outlet,
  Navigate,
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
import AdminAttendancePage from "./pages/AdminAttendancePage";
import RoleGuard from "./components/RoleGuard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MemberDashboardLayout from "./layouts/MemberDashboardLayout";
import DashboardOverview from "./pages/member/DashboardOverview";
import MemberEvents from "./pages/member/MemberEvents";
import MemberAttendance from "./pages/member/MemberAttendance";
import MemberPayments from "./pages/member/MemberPayments";
import MemberProfile from "./pages/member/MemberProfile";
import MemberNotifications from "./pages/member/MemberNotifications";
import TreasurerLayout from "./modules/finance/presentation/TreasurerLayout";
import TreasurerOverviewPage from "./modules/finance/presentation/pages/TreasurerOverviewPage";
import TreasurerMemberFeesPage from "./modules/finance/presentation/pages/TreasurerMemberFeesPage";
import TreasurerApprovalsPage from "./modules/finance/presentation/pages/TreasurerApprovalsPage";
import TreasurerPaymentHistoryPage from "./modules/finance/presentation/pages/TreasurerPaymentHistoryPage";
import TreasurerLedgerPage from "./modules/finance/presentation/pages/TreasurerLedgerPage";
import TreasurerFundRequestsPage from "./modules/finance/presentation/pages/TreasurerFundRequestsPage";
import TreasurerExpensesPage from "./modules/finance/presentation/pages/TreasurerExpensesPage";
import TreasurerReportsPage from "./modules/finance/presentation/pages/TreasurerReportsPage";
import TreasurerNotificationsPage from "./modules/finance/presentation/pages/TreasurerNotificationsPage";
import MemberFinancePage from "./modules/finance/presentation/pages/MemberFinancePage";
import ClubHeadFundsPage from "./modules/finance/presentation/pages/ClubHeadFundsPage";
import ClubHeadLayout from "./modules/clubhead/presentation/ClubHeadLayout";
import ClubHeadOverviewPage from "./modules/clubhead/presentation/pages/ClubHeadOverviewPage";
import ClubHeadEventListPage from "./modules/clubhead/presentation/pages/ClubHeadEventListPage";
import ClubHeadEventsPage from "./modules/clubhead/presentation/pages/ClubHeadEventsPage";
import ClubHeadEventRegistrationsPage from "./modules/clubhead/presentation/pages/ClubHeadEventRegistrationsPage";
import ClubHeadMembersPage from "./modules/clubhead/presentation/pages/ClubHeadMembersPage";

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
      <Route
        element={
          <RoleGuard
            requiredRole="ADMIN"
            deniedRedirectByRole={{
              TREASURER: "/treasurer/overview",
              CLUB_HEAD: "/club-head/overview",
            }}
          />
        }
      >
        <Route path="/admin/events" element={<AdminEventListPage />} />
        <Route path="/admin/event-form" element={<AdminEventsPage />} />
        <Route
          path="/admin/events/:eventId/registrations"
          element={<AdminEventRegistrationsPage />}
        />
        <Route path="/admin/members" element={<AdminMembersPage />} />
        <Route
          path="/admin/notifications"
          element={<AdminNotificationsPage />}
        />
        <Route path="/admin/attendance" element={<AdminAttendancePage />} />
      </Route>

      {/* ADMIN ONLY ROUTES */}
      <Route
        element={
          <RoleGuard
            requiredRole="ADMIN"
            deniedRedirectByRole={{
              TREASURER: "/treasurer/overview",
              CLUB_HEAD: "/club-head/overview",
            }}
          />
        }
      >
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/documents" element={<AdminDocumentsPage />} />
      </Route>

      {/* TREASURER DASHBOARD ROUTES */}
      <Route element={<RoleGuard requiredRole={["ADMIN", "TREASURER"]} />}>
        <Route path="/treasurer" element={<TreasurerLayout />}>
          <Route path="overview" element={<TreasurerOverviewPage />} />
          <Route path="member-fees" element={<TreasurerMemberFeesPage />} />
          <Route path="fee-approvals" element={<TreasurerApprovalsPage />} />
          <Route
            path="payment-history"
            element={<TreasurerPaymentHistoryPage />}
          />
          <Route path="ledger" element={<TreasurerLedgerPage />} />
          <Route path="fund-requests" element={<TreasurerFundRequestsPage />} />
          <Route path="expenses" element={<TreasurerExpensesPage />} />
          <Route path="reports" element={<TreasurerReportsPage />} />
          <Route
            path="notifications"
            element={<TreasurerNotificationsPage />}
          />
        </Route>
      </Route>

      <Route
        element={
          <RoleGuard
            requiredRole="CLUB_HEAD"
            deniedRedirectByRole={{
              ADMIN: "/admin/events",
              TREASURER: "/treasurer/overview",
            }}
          />
        }
      >
        <Route path="/club-head" element={<ClubHeadLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<ClubHeadOverviewPage />} />
          <Route path="events" element={<ClubHeadEventListPage />} />
          <Route path="event-form" element={<ClubHeadEventsPage />} />
          <Route
            path="events/:eventId/registrations"
            element={<ClubHeadEventRegistrationsPage />}
          />
          <Route path="members" element={<ClubHeadMembersPage />} />
          <Route path="fund-requests" element={<ClubHeadFundsPage />} />
        </Route>
      </Route>

      <Route
        element={
          <RoleGuard
            requiredRole="ADMIN"
            deniedRedirectByRole={{
              TREASURER: "/treasurer/overview",
              CLUB_HEAD: "/club-head/overview",
            }}
          />
        }
      >
        <Route path="/admin/contacts" element={<AdminContactPage />} />
      </Route>

      {/* MEMBER SPECIFIC ROUTE (Will be allowed for Admin contextual view too per Guard logic) */}
      <Route element={<RoleGuard requiredRole="MEMBER" />}>
        <Route element={<MemberDashboardLayout />}>
          <Route path="/member/dashboard" element={<DashboardOverview />} />
          <Route path="/member/events" element={<MemberEvents />} />
          <Route path="/member/attendance" element={<MemberAttendance />} />
          <Route path="/member/payments" element={<MemberPayments />} />
          <Route path="/member/finance" element={<MemberFinancePage />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route
            path="/member/notifications"
            element={<MemberNotifications />}
          />
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
