import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import storage from "../utils/storage";
import "../styles/global.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const token = storage.getItem("token");
  const rawName = storage.getItem("userName") || "";
  const userInitials = rawName
    ? rawName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    storage.removeItem("token");
    storage.removeItem("user");
    storage.removeItem("userName");
    storage.removeItem("userEmail");
    setMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;
  const isTrip = location.pathname === "/trip";

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/trip", label: "Trip Planner" },
  ];

  return (
    <nav style={{ ...s.navbar, ...(scrolled ? s.navbarScrolled : {}) }}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={s.logoText}>ConnectX</span>
        </Link>

        {/* Desktop Links */}
        <div style={s.links}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...s.link,
                color: isActive(link.path) ? "#FFFFFF" : "#9CA3AF",
                borderBottom: isActive(link.path) ? "1px solid #FFFFFF" : "1px solid transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={s.actions}>
          {!token ? (
            <Link to="/login" style={s.ghostBtn}>Log in</Link>
          ) : (
            <button onClick={handleLogout} style={s.ghostBtn}>Log out</button>
          )}
          {token ? (
            <Link to="/profile" style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7DF9FF, #B026FF)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#050811', flexShrink: 0,
              textDecoration: 'none', boxShadow: '0 0 12px rgba(125,249,255,0.35)',
              border: '2px solid rgba(125,249,255,0.3)',
              transition: 'box-shadow 0.25s',
            }} title={rawName}>
              {userInitials}
            </Link>
          ) : (
            <Link to="/register" style={s.solidBtn}>Get Started</Link>
          )}

          {/* Hamburger */}
          <button style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span style={{ ...s.bar, ...(menuOpen ? s.barTop : {}) }} />
            <span style={{ ...s.bar, opacity: menuOpen ? 0 : 1 }} />
            <span style={{ ...s.bar, ...(menuOpen ? s.barBot : {}) }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{ ...s.mobileLink, color: isActive(link.path) ? "#fff" : "#9CA3AF" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div style={s.mobileDivider} />
          {!token ? (
            <>
              <Link to="/login" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/register" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              <Link to="/profile" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} style={{ ...s.mobileLink, background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer", fontFamily: "inherit" }}>Log out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const s = {
  navbar: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
    background: "rgba(11,11,11,0.9)",
    borderBottom: "1px solid #1A1A1A",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  },
  navbarScrolled: {
    background: "rgba(11,11,11,0.98)",
    borderBottom: "1px solid #222",
  },
  inner: {
    maxWidth: "1280px", margin: "0 auto", padding: "0 32px",
    height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  logo: {
    display: "flex", alignItems: "center", gap: "10px",
    textDecoration: "none",
  },
  logoText: {
    fontSize: "1rem", fontWeight: 700, color: "#FFFFFF",
    letterSpacing: "0.3px",
  },
  links: { display: "flex", alignItems: "center", gap: "4px" },
  link: {
    textDecoration: "none", fontSize: "0.88rem", fontWeight: 400,
    padding: "6px 14px", transition: "color 0.2s ease",
    letterSpacing: "0.1px", paddingBottom: "4px",
  },
  actions: { display: "flex", alignItems: "center", gap: "8px" },
  ghostBtn: {
    textDecoration: "none", color: "#9CA3AF", fontSize: "0.87rem",
    fontWeight: 400, padding: "7px 14px", borderRadius: "6px",
    border: "none", background: "none", cursor: "pointer",
    fontFamily: "'Inter', sans-serif", transition: "color 0.2s ease",
  },
  solidBtn: {
    textDecoration: "none",
    background: "#FFFFFF", color: "#0B0B0B",
    fontSize: "0.87rem", fontWeight: 600,
    padding: "8px 18px", borderRadius: "6px",
    transition: "background 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  },
  hamburger: {
    display: "none", flexDirection: "column", gap: "5px",
    background: "none", border: "none", cursor: "pointer", padding: "4px",
  },
  bar: {
    display: "block", width: "20px", height: "1.5px",
    background: "#9CA3AF", borderRadius: "2px", transition: "all 0.25s ease",
  },
  barTop:  { transform: "translateY(6.5px) rotate(45deg)" },
  barBot:  { transform: "translateY(-6.5px) rotate(-45deg)" },
  mobileMenu: {
    borderTop: "1px solid #1A1A1A", padding: "12px 24px 20px",
    display: "flex", flexDirection: "column", gap: "2px",
    background: "rgba(11,11,11,0.98)",
  },
  mobileLink: {
    textDecoration: "none", color: "#9CA3AF", padding: "12px 8px",
    fontSize: "0.95rem", fontWeight: 400, transition: "color 0.2s ease",
    display: "block", borderBottom: "none",
  },
  mobileDivider: { height: "1px", background: "#1A1A1A", margin: "8px 0" },
};
