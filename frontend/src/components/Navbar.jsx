import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/global.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/trip", label: "Trip Planner" },
    { path: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="url(#bolt-grad)"
                stroke="none" />
              <defs>
                <linearGradient id="bolt-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00e5a0" />
                  <stop offset="1" stopColor="#00bcd4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span style={styles.logoText}>
            EV<span style={styles.logoAccent}>Drive</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={styles.links}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.link,
                ...(isActive(link.path) ? styles.linkActive : {}),
              }}
            >
              {link.label}
              {isActive(link.path) && <span style={styles.linkDot} />}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={styles.actions}>
          {!token ? (
            <Link to="/login" style={styles.loginBtn}>Login</Link>
          ) : (
            <button onClick={handleLogout} style={styles.loginBtn}>Logout</button>
          )}
          <Link to="/profile" style={styles.ctaBtn}>
            <span>👤</span> Profile
          </Link>

          {/* Mobile hamburger */}
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span style={{ ...styles.bar, ...(menuOpen ? styles.barOpen1 : {}) }} />
            <span style={{ ...styles.bar, ...(menuOpen ? styles.barOpen2 : {}) }} />
            <span style={{ ...styles.bar, ...(menuOpen ? styles.barOpen3 : {}) }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.mobileLink,
                ...(isActive(link.path) ? styles.mobileLinkActive : {}),
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div style={styles.mobileDivider} />
          {!token ? (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} style={{...styles.mobileLink, background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer", fontFamily: "inherit"}}>Logout</button>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: "rgba(7, 13, 26, 0.7)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(0, 229, 160, 0.08)",
    transition: "all 0.3s ease",
    fontFamily: "'Inter', sans-serif",
  },
  navbarScrolled: {
    background: "rgba(7, 13, 26, 0.95)",
    borderBottom: "1px solid rgba(0, 229, 160, 0.18)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
  },
  inner: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 24px",
    height: "66px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,188,212,0.15))",
    border: "1px solid rgba(0,229,160,0.3)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#e0e8f0",
    letterSpacing: "-0.5px",
    fontFamily: "'Outfit', sans-serif",
  },
  logoAccent: {
    color: "#00e5a0",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  link: {
    textDecoration: "none",
    color: "#7a9bbf",
    fontSize: "0.9rem",
    fontWeight: 500,
    padding: "8px 14px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    position: "relative",
  },
  linkActive: {
    color: "#00e5a0",
    background: "rgba(0,229,160,0.08)",
  },
  linkDot: {
    position: "absolute",
    bottom: "4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: "#00e5a0",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  loginBtn: {
    textDecoration: "none",
    color: "#7a9bbf",
    fontSize: "0.88rem",
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
  },
  ctaBtn: {
    textDecoration: "none",
    background: "linear-gradient(135deg, #00c9a7, #00bcd4)",
    color: "#000",
    fontSize: "0.88rem",
    fontWeight: 700,
    padding: "9px 18px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.25s ease",
    boxShadow: "0 4px 12px rgba(0,201,167,0.25)",
  },
  hamburger: {
    display: "none",
    flexDirection: "column",
    gap: "5px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  bar: {
    display: "block",
    width: "22px",
    height: "2px",
    background: "#e0e8f0",
    borderRadius: "2px",
    transition: "all 0.3s ease",
  },
  mobileMenu: {
    borderTop: "1px solid rgba(0,229,160,0.1)",
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    background: "rgba(7, 13, 26, 0.97)",
    backdropFilter: "blur(20px)",
  },
  mobileLink: {
    textDecoration: "none",
    color: "#7a9bbf",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 500,
    transition: "all 0.2s ease",
  },
  mobileLinkActive: {
    color: "#00e5a0",
    background: "rgba(0,229,160,0.08)",
  },
  mobileDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "8px 0",
  },
};
