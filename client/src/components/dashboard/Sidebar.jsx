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
        ? "bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500"
        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-indigo-400" : "group-hover:text-white"}`} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
  </Link>
);

const DashboardSidebar = () => {
  const { memberLogout } = useAuth();
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
    <div className="w-64 bg-[#0f0f0f] border-r border-gray-800 flex flex-col hidden md:flex h-screen">
      {/* Brand */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            N
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            NextEdge
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={location.pathname === item.path}
          />
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-800 mt-auto bg-[#0a0a0a]/50">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
