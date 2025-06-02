import { Link } from "react-router-dom";
import logo from "/assets/logo.png";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = ({ onLogout, userRole }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const navClasses = `fixed w-full z-10 transition-all duration-300 bg-blue-600/80 ${
    !scrolled ? "md:bg-blue-600/60" : ""
  } backdrop-blur-sm`;

  const navLinkStyles =
    "bg-blue-600/20 hover:bg-blue-600/40 text-white/80 hover:text-white px-4 py-1.5 rounded-full transition-all duration-300 text-sm font-medium border-2 border-white/10 hover:border-white/30 hover:shadow-xl hover:scale-105 flex items-center gap-1";

  const logoutStyles =
    "bg-black/80 hover:bg-black text-white/80 hover:text-white px-4 py-1.5 rounded-full transition-all duration-300 text-sm font-medium border-2 border-white/20 hover:border-white/40 hover:shadow-xl hover:scale-105 hover:shadow-black/30 flex items-center gap-1";

  const menuLinks = (
    <>
      {userRole === "admin" && (
        <>
          <Link to="/admin/dashboard" className={navLinkStyles}>
            Dashboard
          </Link>
          <Link to="/admin/issues" className={navLinkStyles}>
            Issues
          </Link>
          <Link to="/admin/users" className={navLinkStyles}>
            Users
          </Link>
        </>
      )}
      {userRole === "employee" && (
        <>
          <Link to="/employee/issues" className={navLinkStyles}>
            My Issues
          </Link>
          <Link to="/employee/profile" className={navLinkStyles}>
            Profile
          </Link>
        </>
      )}
      <Link to="/logout" onClick={onLogout} className={logoutStyles}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Logout
      </Link>
    </>
  );

  return (
    <nav
      className={navClasses}
      style={{
        borderRadius: "20px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        margin: "0.25rem",
        width: "calc(100% - 0.5rem)",
      }}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 pt-1">
            <img
              src={logo}
              alt="JanSahayak Logo"
              className="h-12 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <span className="text-2xl font-semibold text-white">
              JanSahayak
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-4 items-center">
            {menuLinks}
          </div>

          {/* Mobile Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-3 mt-3 mb-4">
            {menuLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
