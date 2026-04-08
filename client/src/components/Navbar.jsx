import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut } from "lucide-react";
import logo from "../assets/logo.png";
import { NavLink, Link } from "react-router-dom";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SunIcon } from "./ui/sun";
import { MoonIcon } from "./ui/moon";
import { useAuth } from "../context/AuthContext";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  // Initialize dark mode from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, isMember, logout, memberLogout } = useAuth();
  const { user } = useAuthStore();

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Dark mode toggle with localStorage persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Responsive menu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  // Scroll listener
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const scrolled = window.scrollY > 10;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled((prev) => {
            if (prev !== scrolled) return scrolled;
            return prev;
          });
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Clubs", href: "/clubs" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    if (isAuthenticated) await logout();
    else await memberLogout();
    setMenuOpen(false);
  };
  gsap.registerPlugin(ScrollTrigger);
  const navRef = useRef([]);
  navRef.current = [];

  return (
    <nav
      className={`
        fixed z-50 left-1/2 -translate-x-1/2
        transition-all duration-300 ease-in-out 
       
        ${
          isScrolled
            ? `
    top-6 w-[80%]
    rounded-full
    bg-white/20 dark:bg-black/30
    backdrop-blur-xl saturate-150
    border border-white/30 dark:border-white/10
    shadow-[0_8px_32px_rgba(0,0,0,0.12)]
  `
            : `
    top-0 w-full
    bg-white/10 dark:bg-black/20
    backdrop-blur-lg
    border-b border-white/20 dark:border-white/10
  `
        }
      `}
      ref={navRef}
    >
      <div
        className={`
          flex items-center justify-between 
          transition-all duration-300 ease-in-out    
          ${isScrolled ? "px-[2vw]" : "px-[6vw]"} 
        `}
      >
        {/* Logo + Brand */}
        <div className="flex items-center ">
          <img
            src={logo}
            alt="NextEdge"
            className={`transition-transform duration-300 ease-in-out ${
              isScrolled ? "scale-75" : "scale-100"
            }`}
            width="70"
            height="70"
          />
          <span
            className={`
    text-lg md:text-xl font-semibold text-black/90 dark:text-white/90
    select-none transition-all duration-300 ease-in-out
    whitespace-nowrap
    ${
      isScrolled
        ? "scale-90 text-sm max-w-[160px] truncate"
        : "scale-100 max-w-none"
    }
  `}
          >
            NextEdge Society
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-900 dark:text-white">
          {navLinks.map(({ label, href }) => (
            <NavLink
              key={label}
              to={href}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `
    group relative px-4 py-2 rounded-full text-sm font-medium
    transition-all duration-300

    ${
      isActive
        ? "bg-white/40 dark:bg-white/15 text-blue-600 dark:text-blue-400 backdrop-blur-md shadow-sm"
        : "text-gray-900/90 dark:text-white/90 hover:bg-white/30 dark:hover:bg-white/10 hover:backdrop-blur-md hover:shadow-sm"
    }
    `
              }
            >
              {label}

              {/* underline */}
              <span
                className="
      absolute left-1/2 -bottom-1 h-[2px] w-0
      bg-blue-500
      transition-all duration-300
      group-hover:w-4 group-hover:left-[calc(50%-0.5rem)]
      group-[.active]:w-4 group-[.active]:left-[calc(50%-0.5rem)]
    "
              />
            </NavLink>
          ))}
          {isAuthenticated || isMember ? (
            <Link
              to={isAuthenticated ? "/admin/events" : "/member/dashboard"}
              className="
    ml-2 px-5 py-2 rounded-full
    bg-blue-600 text-white
    font-semibold text-sm
    shadow-lg shadow-blue-600/30
    hover:bg-blue-500 hover:scale-[1.05]
    transition-all duration-300
  "
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/member-login"
              className="
    ml-2 px-5 py-2 rounded-full
    bg-blue-600 text-white
    font-semibold text-sm
    shadow-lg shadow-blue-600/30
    hover:bg-blue-500 hover:scale-[1.05]
    transition-all duration-300
  "
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center md:gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="rounded-full p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition focus:outline-none"
          >
            {darkMode ? (
              <SunIcon className="text-yellow-400" />
            ) : (
              <div className="flex gap-4">
                <MoonIcon className="text-gray-700 dark:text-gray-300" />
              </div>
            )}
          </button>



          {/* Logout Button (Only when authenticated) */}
          {(isAuthenticated || isMember) && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
          )}

          {/* Hamburger menu */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="
    md:hidden relative w-10 h-10
    rounded-full
    bg-white/60 dark:bg-gray-900/60
    backdrop-blur-md
    border border-white/30 dark:border-gray-700/30
    shadow-md
    flex items-center justify-center
    transition-all duration-300
    hover:scale-105
    active:scale-95
  "
          >
            <span
              className={`
      absolute w-5 h-[2px] bg-gray-900 dark:bg-white transition-all duration-300
      ${menuOpen ? "rotate-45" : "-translate-y-1.5"}
    `}
            />
            <span
              className={`
      absolute w-5 h-[2px] bg-gray-900 dark:bg-white transition-all duration-300
      ${menuOpen ? "opacity-0" : ""}
    `}
            />
            <span
              className={`
      absolute w-5 h-[2px] bg-gray-900 dark:bg-white transition-all duration-300
      ${menuOpen ? "-rotate-45" : "translate-y-1.5"}
    `}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {/* Mobile Menu */}
      <div
        className={`
    md:hidden
    absolute left-0 top-full w-full
    transition-all duration-300 ease-out
    ${
      menuOpen
        ? "opacity-100 translate-y-0 pointer-events-auto"
        : "opacity-0 -translate-y-2 pointer-events-none"
    }
  `}
      >
        <div
          className="
      mx-4 mt-3
      rounded-2xl
      bg-white/80 dark:bg-gray-900/80
      backdrop-blur-xl
      border border-white/30 dark:border-gray-700/30
      shadow-2xl
      overflow-hidden
    "
        >
          <div className="flex flex-col px-5 py-4 space-y-1 font-medium text-gray-900 dark:text-white">
            {navLinks.map(({ label, href }, index) => (
              <Link
                key={label}
                to={href}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: `${index * 40}ms` }}
                className="
            px-3 py-2 rounded-lg
            transition-all duration-300
            hover:bg-blue-50 dark:hover:bg-gray-800
            hover:text-blue-600 dark:hover:text-blue-400
          "
              >
                {label}
              </Link>
            ))}

            {isAuthenticated || isMember ? (
              <>
                <Link
                  to={isAuthenticated ? "/admin/events" : "/member/dashboard"}
                  onClick={() => setMenuOpen(false)}
                  className="
              mt-2 px-4 py-2
              bg-blue-600 text-white
              rounded-lg text-center
              hover:bg-blue-700
              transition
            "
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="
              mt-1 px-4 py-2
              text-left rounded-lg
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition
            "
                >
                  Logout
                </button>
              </>
            ) : (
                <Link
                  to="/member-login"
                  onClick={() => setMenuOpen(false)}
                  className="
              mt-2 px-4 py-2
              bg-blue-600 text-white
              rounded-lg text-center
              hover:bg-blue-700
              transition
            "
                >
                  Login
                </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
