import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, User, MessageSquare, Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DashboardNavbar = () => {
  const { member } = useAuth();
  
  // Initialize dark mode from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  return (
    <header className="h-20 bg-card border-b border-border flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 shadow-sm transition-colors">
      {/* Search Input */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-400 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-background text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Search Member Dashboard..."
          />
        </div>
        
        {/* Mobile menu toggle (Simplified for now) */}
        <button className="md:hidden text-muted-foreground p-2 hover:bg-muted rounded-lg transition-colors">
           <Menu className="w-6 h-6"/>
        </button>
      </div>

      {/* Right Navbar Section */}
      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 bg-muted/50 border border-border rounded-xl text-foreground hover:bg-muted transition-all"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>

        {/* Notifications and Messages */}
        <div className="flex items-center space-x-2 md:space-x-4 bg-muted/30 p-1.5 rounded-xl border border-border">
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-card"></span>
          </button>
          
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <Link to="/member/profile" className="flex items-center space-x-3 group pl-2">
          <div className="text-right hidden sm:block overflow-hidden max-w-[120px]">
            <p className="text-sm font-bold text-foreground truncate">{member?.name || member?.email || "User"}</p>
            <p className="text-[10px] text-indigo-500 font-medium tracking-wider uppercase">{member?.role || "Member"}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-lg text-white border-2 border-indigo-700 shadow-md group-hover:scale-105 transition-transform duration-300">
            {member?.name ? member.name.charAt(0).toUpperCase() : "U"}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default DashboardNavbar;
