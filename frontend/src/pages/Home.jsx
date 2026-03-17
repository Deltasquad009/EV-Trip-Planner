import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/global.css";

const features = [
  { icon: "🗺️", title: "Smart Route Planning", desc: "Get optimized EV-friendly routes calculated with real road data via OpenRouteService API." },
  { icon: "🔋", title: "Battery Tracking", desc: "Real-time battery consumption estimates accounting for distance, elevation, and driving style." },
  { icon: "🌤️", title: "Weather Impact", desc: "Live weather conditions at your starting point affect your energy consumption calculation." },
  { icon: "⚡", title: "Charging Stops", desc: "Auto-detect if charging is needed and locate nearby chargers along your route." },
  { icon: "📊", title: "Energy Breakdown", desc: "Detailed analysis of base energy, elevation penalty, and weather impact on your trip." },
  { icon: "🛰️", title: "Live Map View", desc: "Beautiful dark-mode map with your route, charging stations, and turn-by-turn waypoints." },
];

const steps = [
  { num: "01", title: "Enter Your Route", desc: "Type your starting location and destination" },
  { num: "02", title: "Choose Your EV", desc: "Select from our database of EV models" },
  { num: "03", title: "Get Your Plan", desc: "Receive your optimized route with energy & charging data" },
];

const stats = [
  { value: "50+", label: "EV Models" },
  { value: "10K+", label: "Routes Planned" },
  { value: "500+", label: "Charging Stations" },
  { value: "98%", label: "Accuracy Rate" },
];

export default function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMouseMove = (e) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      hero.style.setProperty("--mouse-x", `${x}%`);
      hero.style.setProperty("--mouse-y", `${y}%`);
    };
    hero.addEventListener("mousemove", onMouseMove);
    return () => hero.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div style={s.page}>
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section ref={heroRef} style={s.hero}>
        {/* Animated background orbs */}
        <div style={{ ...s.orb, ...s.orb1 }} />
        <div style={{ ...s.orb, ...s.orb2 }} />
        <div style={{ ...s.orb, ...s.orb3 }} />
        <div style={s.heroGrid} />

        <div style={s.heroContent}>
          <div style={s.badge}>
            <span style={s.badgeDot} />
            Next-Gen EV Travel Assistant
          </div>
          <h1 style={s.heroTitle}>
            Drive Further.<br />
            <span className="text-gradient">Charge Smarter.</span>
          </h1>
          <p style={s.heroSub}>
            Plan your electric vehicle trip with real-time battery estimates, weather impact,
            and intelligent charging stop suggestions along your route.
          </p>
          <div style={s.heroBtns}>
            <Link to="/trip" style={s.heroBtn}>
              ⚡ Plan Your Trip
            </Link>
            <Link to="/register" style={s.heroOutlineBtn}>
              Get Started Free →
            </Link>
          </div>

          {/* Floating stats */}
          <div style={s.heroStats}>
            {stats.map((stat, i) => (
              <div key={i} style={s.heroStatItem}>
                <span style={s.heroStatValue}>{stat.value}</span>
                <span style={s.heroStatLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating EV Card mock */}
        <div style={s.heroCard} className="animate-float">
          <div style={s.heroCardHeader}>
            <span style={s.heroCardIcon}>🚗</span>
            <div>
              <div style={s.heroCardTitle}>Bangalore → Mysore</div>
              <div style={s.heroCardSub}>Tesla Model 3 · 100% Battery</div>
            </div>
          </div>
          <div style={s.heroCardStats}>
            <div style={s.heroCardStat}>
              <span style={s.heroCardStatVal}>147 km</span>
              <span style={s.heroCardStatLabel}>Distance</span>
            </div>
            <div style={s.heroCardStat}>
              <span style={s.heroCardStatVal}>2.5 hrs</span>
              <span style={s.heroCardStatLabel}>Duration</span>
            </div>
            <div style={s.heroCardStat}>
              <span style={{ ...s.heroCardStatVal, color: "#00e5a0" }}>78%</span>
              <span style={s.heroCardStatLabel}>Battery Left</span>
            </div>
          </div>
          <div style={s.heroCardBar}>
            <div style={s.heroCardBarFill} />
          </div>
          <div style={s.heroCardStatus}>
            <span style={s.heroCardDot} />
            No charging stop needed
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <span style={s.sectionBadge}>Features</span>
            <h2 style={s.sectionTitle}>Everything You Need for an EV Trip</h2>
            <p style={s.sectionSub}>
              Powered by OpenRouteService, live weather APIs, and a real-time charging network database.
            </p>
          </div>
          <div style={s.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} style={s.featureCard} className="card">
                <div style={s.featureIcon}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section style={{ ...s.section, background: "rgba(0,229,160,0.02)" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <span style={s.sectionBadge}>How It Works</span>
            <h2 style={s.sectionTitle}>Plan in 3 Simple Steps</h2>
          </div>
          <div style={s.stepsRow}>
            {steps.map((step, i) => (
              <div key={i} style={s.step}>
                <div style={s.stepNum}>{step.num}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
                {i < steps.length - 1 && <div style={s.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section style={s.ctaBanner}>
        <div style={s.ctaBannerInner}>
          <h2 style={s.ctaBannerTitle}>Ready to Hit the Road?</h2>
          <p style={s.ctaBannerSub}>Start planning your EV trip right now — no signup required.</p>
          <Link to="/trip" style={s.heroBtn}>⚡ Plan Your Trip Now</Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerLogo}>⚡ EVDrive</span>
          <span style={s.footerText}>© 2026 EV Trip Planner. Built with ❤️ for EV drivers.</span>
          <div style={s.footerLinks}>
            <Link to="/trip" style={s.footerLink}>Trip Planner</Link>
            <Link to="/dashboard" style={s.footerLink}>Dashboard</Link>
            <Link to="/login" style={s.footerLink}>Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "var(--bg-deep)", color: "var(--text-primary)" },
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: "100px 24px 80px",
    position: "relative",
    overflow: "hidden",
    gap: "60px",
    maxWidth: "1400px",
    margin: "0 auto",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  orb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
    animation: "orb-float 12s ease-in-out infinite",
  },
  orb1: {
    width: "400px", height: "400px",
    background: "rgba(0,229,160,0.08)",
    top: "10%", left: "5%",
    animationDelay: "0s",
  },
  orb2: {
    width: "300px", height: "300px",
    background: "rgba(0,188,212,0.07)",
    top: "50%", right: "10%",
    animationDelay: "4s",
  },
  orb3: {
    width: "250px", height: "250px",
    background: "rgba(0,229,160,0.05)",
    bottom: "10%", left: "35%",
    animationDelay: "8s",
  },
  heroGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(rgba(0,229,160,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,229,160,0.04) 1px, transparent 1px)`,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  heroContent: {
    flex: "1",
    minWidth: "300px",
    maxWidth: "600px",
    position: "relative",
    zIndex: 1,
    animation: "slideUp 0.7s ease forwards",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(0,229,160,0.08)",
    border: "1px solid rgba(0,229,160,0.2)",
    borderRadius: "100px",
    padding: "6px 16px",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#00e5a0",
    marginBottom: "24px",
    letterSpacing: "0.3px",
  },
  badgeDot: {
    width: "6px", height: "6px",
    background: "#00e5a0",
    borderRadius: "50%",
    animation: "glow 1.5s ease-in-out infinite",
    boxShadow: "0 0 8px #00e5a0",
  },
  heroTitle: {
    fontSize: "clamp(2.4rem, 5vw, 4rem)",
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: "20px",
    fontFamily: "'Outfit', sans-serif",
    color: "#e0e8f0",
    letterSpacing: "-2px",
  },
  heroSub: {
    fontSize: "1.05rem",
    color: "#7a9bbf",
    lineHeight: 1.7,
    marginBottom: "36px",
    maxWidth: "480px",
  },
  heroBtns: { display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "48px" },
  heroBtn: {
    textDecoration: "none",
    background: "linear-gradient(135deg, #00c9a7, #00bcd4)",
    color: "#000",
    fontWeight: 800,
    fontSize: "1rem",
    padding: "14px 28px",
    borderRadius: "12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 8px 24px rgba(0,201,167,0.35)",
    transition: "all 0.25s ease",
  },
  heroOutlineBtn: {
    textDecoration: "none",
    background: "transparent",
    border: "1px solid rgba(0,229,160,0.3)",
    color: "#00e5a0",
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: "13px 24px",
    borderRadius: "12px",
    transition: "all 0.25s ease",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "28px",
  },
  heroStatItem: { display: "flex", flexDirection: "column", gap: "2px" },
  heroStatValue: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#00e5a0",
    fontFamily: "'Outfit', sans-serif",
  },
  heroStatLabel: { fontSize: "0.75rem", color: "#7a9bbf", fontWeight: 500 },
  heroCard: {
    width: "320px",
    background: "rgba(13,27,42,0.9)",
    border: "1px solid rgba(0,229,160,0.2)",
    borderRadius: "20px",
    padding: "24px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,160,0.08)",
    position: "relative",
    zIndex: 1,
    flexShrink: 0,
  },
  heroCardHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" },
  heroCardIcon: { fontSize: "2rem" },
  heroCardTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#e0e8f0" },
  heroCardSub: { fontSize: "0.78rem", color: "#7a9bbf", marginTop: "2px" },
  heroCardStats: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" },
  heroCardStat: { display: "flex", flexDirection: "column", gap: "2px" },
  heroCardStatVal: { fontSize: "1.15rem", fontWeight: 800, color: "#e0e8f0", fontFamily: "'Outfit', sans-serif" },
  heroCardStatLabel: { fontSize: "0.68rem", color: "#7a9bbf" },
  heroCardBar: {
    height: "6px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "100px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  heroCardBarFill: {
    height: "100%",
    width: "78%",
    background: "linear-gradient(90deg, #00c9a7, #00e5a0)",
    borderRadius: "100px",
  },
  heroCardStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.8rem",
    color: "#00e5a0",
    fontWeight: 600,
  },
  heroCardDot: {
    width: "8px", height: "8px",
    background: "#00e5a0",
    borderRadius: "50%",
    boxShadow: "0 0 6px #00e5a0",
  },
  // Sections
  section: { padding: "80px 24px" },
  sectionInner: { maxWidth: "1200px", margin: "0 auto" },
  sectionHeader: { textAlign: "center", marginBottom: "56px" },
  sectionBadge: {
    display: "inline-block",
    background: "rgba(0,229,160,0.08)",
    border: "1px solid rgba(0,229,160,0.2)",
    borderRadius: "100px",
    padding: "5px 16px",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#00e5a0",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
    fontWeight: 800,
    color: "#e0e8f0",
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: "-1px",
    marginBottom: "14px",
  },
  sectionSub: { fontSize: "1rem", color: "#7a9bbf", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  featureCard: { gap: "0" },
  featureIcon: { fontSize: "2rem", marginBottom: "14px" },
  featureTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#e0e8f0",
    marginBottom: "8px",
  },
  featureDesc: { fontSize: "0.88rem", color: "#7a9bbf", lineHeight: 1.7 },
  // Steps
  stepsRow: {
    display: "flex",
    gap: "0",
    alignItems: "flex-start",
    justifyContent: "center",
    flexWrap: "wrap",
    position: "relative",
  },
  step: {
    flex: "1",
    minWidth: "200px",
    maxWidth: "300px",
    textAlign: "center",
    padding: "32px 24px",
    position: "relative",
  },
  stepNum: {
    fontSize: "3rem",
    fontWeight: 900,
    color: "rgba(0,229,160,0.15)",
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 1,
    marginBottom: "16px",
  },
  stepTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#e0e8f0", marginBottom: "10px" },
  stepDesc: { fontSize: "0.88rem", color: "#7a9bbf", lineHeight: 1.6 },
  stepArrow: {
    position: "absolute",
    right: "-16px",
    top: "50px",
    fontSize: "1.5rem",
    color: "rgba(0,229,160,0.3)",
  },
  // CTA Banner
  ctaBanner: {
    padding: "80px 24px",
    background: "linear-gradient(135deg, rgba(0,229,160,0.05), rgba(0,188,212,0.05))",
    borderTop: "1px solid rgba(0,229,160,0.08)",
    borderBottom: "1px solid rgba(0,229,160,0.08)",
  },
  ctaBannerInner: { textAlign: "center", maxWidth: "600px", margin: "0 auto" },
  ctaBannerTitle: {
    fontSize: "2.2rem",
    fontWeight: 800,
    color: "#e0e8f0",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: "12px",
    letterSpacing: "-1px",
  },
  ctaBannerSub: { fontSize: "1rem", color: "#7a9bbf", marginBottom: "32px" },
  // Footer
  footer: {
    padding: "32px 24px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  footerInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },
  footerLogo: { fontSize: "1.1rem", fontWeight: 800, color: "#00e5a0", fontFamily: "'Outfit', sans-serif" },
  footerText: { fontSize: "0.82rem", color: "#4a6280" },
  footerLinks: { display: "flex", gap: "20px" },
  footerLink: { textDecoration: "none", color: "#7a9bbf", fontSize: "0.85rem", fontWeight: 500 },
};
