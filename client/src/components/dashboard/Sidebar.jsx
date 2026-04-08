import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  CreditCard,
  Bell,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link
    to={path}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
      active
        ? "bg-indigo-600/10 text-indigo-500 border-l-4 border-indigo-500 shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-indigo-500" : "group-hover:text-indigo-500"}`} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto text-indigo-500" />}
  </Link>
);

const DashboardSidebar = () => {
  const { member, memberLogout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/member/dashboard" },
    { icon: Calendar, label: "Events", path: "/member/events" },
    { icon: UserCheck, label: "Attendance", path: "/member/attendance" },
    { icon: CreditCard, label: "Payments", path: "/member/payments" },
    { icon: Bell, label: "Notifications", path: "/member/notifications" },
    { icon: User, label: "My Profile", path: "/member/profile" },
  ];

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await memberLogout();
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col hidden md:flex h-screen transition-colors">
      {/* Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 text-white">
            N
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            NextEdge
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
        <p className="px-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 ml-1">Member Tools</p>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={location.pathname === item.path}
          />
        ))}

        {/* Admin Tools Section */}
        {(member?.role === 'ADMIN' || member?.role === 'CLUB_HEAD') && (
          <div className="pt-6 mt-6 border-t border-border">
            <p className="px-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4 ml-1">Manage Squad</p>
            <SidebarItem
               icon={UserCheck}
               label="Mark Attendance"
               path="/admin/attendance"
               active={location.pathname === "/admin/attendance"}
            />
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-border mt-auto bg-muted/20">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
