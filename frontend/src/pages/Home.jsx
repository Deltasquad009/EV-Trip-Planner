import { useState, useEffect, useRef, Suspense } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Car3D from "../components/Car3D";
import "../styles/global.css";

const stats = [
  { value: "50+", label: "EV Models" },
  { value: "10K+", label: "Routes Planned" },
  { value: "500+", label: "Charging Stations" },
  { value: "98%", label: "Accuracy" },
];

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Smart Route Planning",
    desc: "Optimized EV-friendly routes with real road data via OpenRouteService API.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Battery Intelligence",
    desc: "Real-time consumption estimates based on distance, elevation, and driving conditions.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Weather Impact",
    desc: "Live weather conditions at your starting point affect your energy calculation in real-time.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Smart Charging Stops",
    desc: "Auto-detect charging needs and locate the best stations along your route.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Energy Breakdown",
    desc: "Full analysis: base consumption, elevation penalty, and weather impact — all visualized.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Live Map Navigation",
    desc: "Dark-themed map with route, charging stations, and step-by-step turn directions.",
  },
];

const steps = [
  { num: "01", title: "Enter Your Route", desc: "Set your origin and destination. We handle the rest." },
  { num: "02", title: "Choose Your EV", desc: "Select from 50+ EV models with precise battery specs." },
  { num: "03", title: "Drive Confident", desc: "Get your full route with energy data and charging stops." },
];

const testimonials = [
  { name: "Priya S.", role: "Tesla Model 3 owner", text: "\"Finally an EV planner that actually understands battery range. The weather impact feature is a game changer.\"" },
  { name: "Rahul M.", role: "Tata Nexon EV owner", text: "\"Planned a Bangalore–Goa trip in 2 minutes. Every charging stop was spot on. Incredible tool.\"" },
  { name: "Ananya K.", role: "MG ZS EV owner", text: "\"The arrival battery prediction is scarily accurate. I trust this app now more than the car's own estimate.\"" },
];

// Animated counter hook
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start) + suffix);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

function AnimatedStat({ value, label }) {
  const [started, setStarted] = useState(false);
  const ref = useRef();
  const displayValue = useCountUp(started ? value : "0", 1800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={s.statItem}>
      <span style={s.statValue}>{displayValue || value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={s.page}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={s.hero}>
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={s.videoBg}
        >
          <source src="https://videos.pexels.com/video-files/855029/855029-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay to ensure text readability against the video */}
        <div style={s.videoOverlay} />

        {/* Background grid  */}
        <div style={s.gridBg} />

        <div style={s.heroContent}>
          {/* Left */}
          <div style={s.heroLeft}>
            <div style={s.heroBadge}>
              <span style={s.heroBadgeDot} />
              Next-Gen EV Navigation
            </div>
            <h1 style={s.heroTitle}>
              Plan Every Mile.<br />
              <span style={s.heroTitleAccent}>Arrive with Confidence.</span>
            </h1>
            <p style={s.heroSub}>
              Real-time battery predictions, weather-aware routing, and intelligent charging stops — built for serious EV drivers.
            </p>
            <div style={s.heroBtns}>
              <Link to="/trip" style={s.btnPrimary}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Plan a Trip
              </Link>
              <Link to="/register" style={s.btnGhost}>Create Free Account →</Link>
            </div>
            {/* Mini trust badges */}
            <div style={s.trustRow}>
              {["No signup required", "Real-time data", "50+ EV models"].map((t, i) => (
                <div key={i} style={s.trustBadge}>
                  <span style={s.trustCheck}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D Car */}
          <div style={s.heroRight}>
            {/* Glow beneath car */}
            <div style={s.carGlow} />
            <Suspense fallback={<div style={s.carLoading}>Loading 3D…</div>}>
              <Car3D />
            </Suspense>
            {/* Floating data chips */}
            <div style={{ ...s.carChip, top: "12%", right: "-4%" }}>
              <span style={s.chipDot} />
              <div>
                <div style={s.chipVal}>340 km</div>
                <div style={s.chipLabel}>Estimated Range</div>
              </div>
            </div>
            <div style={{ ...s.carChip, bottom: "22%", left: "-2%" }}>
              <span style={{ ...s.chipDot, background: "#22C55E" }} />
              <div>
                <div style={s.chipVal}>82%</div>
                <div style={s.chipLabel}>Battery Healthy</div>
              </div>
            </div>
            <div style={{ ...s.carChip, bottom: "8%", right: "8%" }}>
              <span style={{ ...s.chipDot, background: "#22C55E" }} />
              <div>
                <div style={s.chipVal}>38 km</div>
                <div style={s.chipLabel}>Next Charger</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={s.statsBar}>
          {stats.map((st, i) => (
            <AnimatedStat key={i} value={st.value} label={st.label} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <p style={s.eyebrow}>How It Works</p>
            <h2 style={s.sectionTitle}>Three steps to your perfect route</h2>
          </div>
          <div style={s.stepsRow}>
            {steps.map((step, i) => (
              <div key={i} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
                {i < steps.length - 1 && <div style={s.stepArrowHoriz}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────── */}
      <section style={{ ...s.section, background: "#111111" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <p style={s.eyebrow}>Capabilities</p>
            <h2 style={s.sectionTitle}>Everything you need for smarter EV travel</h2>
          </div>
          <div style={s.featGrid}>
            {features.map((f, i) => (
              <div key={i} style={s.featCard}>
                <div style={s.featIcon}>{f.icon}</div>
                <h3 style={s.featTitle}>{f.title}</h3>
                <p style={s.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BATTERY VISUAL SECTION ───────────────────────────────── */}
      <section style={s.batterySection}>
        <div style={s.sectionInner}>
          <div style={s.batteryLayout}>
            <div style={s.batteryLeft}>
              <p style={s.eyebrow}>Battery Intelligence</p>
              <h2 style={s.sectionTitle}>Know exactly what's in your battery at every point.</h2>
              <p style={s.batteryDesc}>
                Our system calculates your real-time battery consumption using distance, road elevation profile, ambient temperature, wind speed, and your driving style. No guesswork.
              </p>
              <Link to="/trip" style={s.btnPrimary}>Try It Now</Link>
            </div>
            <div style={s.batteryRight}>
              {/* Fake battery dashboard widget */}
              <div style={s.batteryWidget}>
                <div style={s.bwHeader}>
                  <span style={s.bwTitle}>Trip Calculation</span>
                  <span style={s.bwStatus}>● Live</span>
                </div>
                <div style={s.bwRoute}>Bangalore → Mysore</div>

                {/* Big battery display */}
                <div style={s.bwBattery}>
                  <div style={s.bwBatNum}>74<span style={s.bwBatPct}>%</span></div>
                  <div style={s.bwBatLabel}>Estimated at Arrival</div>
                  <div style={s.bwBar}>
                    <div style={{ ...s.bwBarFill, width: "74%", background: "#22C55E" }} />
                  </div>
                </div>

                <div style={s.bwGrid}>
                  {[
                    { l: "Distance", v: "147 km" },
                    { l: "Duration", v: "2.4 hrs" },
                    { l: "Charge Stops", v: "0" },
                    { l: "Weather Impact", v: "+4%" },
                    { l: "Energy Used", v: "18.3 kWh" },
                    { l: "Estimated Cost", v: "₹146" },
                  ].map((item, i) => (
                    <div key={i} style={s.bwItem}>
                      <div style={s.bwItemLabel}>{item.l}</div>
                      <div style={s.bwItemVal}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section style={{ ...s.section, background: "#111111" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <p style={s.eyebrow}>What Drivers Say</p>
            <h2 style={s.sectionTitle}>Trusted by EV owners across India</h2>
          </div>
          <div style={s.testimonialWrap}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ ...s.testimonialCard, opacity: i === activeTestimonial ? 1 : 0.35, transform: i === activeTestimonial ? "scale(1)" : "scale(0.97)", transition: "all 0.5s ease" }}>
                <p style={s.testimonialText}>{t.text}</p>
                <div style={s.testimonialMeta}>
                  <div style={s.testimonialAvatar}>{t.name[0]}</div>
                  <div>
                    <div style={s.testimonialName}>{t.name}</div>
                    <div style={s.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={s.testimonialDots}>
            {testimonials.map((_, i) => (
              <button key={i} style={{ ...s.dot, background: i === activeTestimonial ? "#FFFFFF" : "#2A2A2A" }} onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section style={s.ctaSection}>
        <div style={s.ctaInner}>
          <div style={s.ctaGlow} />
          <h2 style={s.ctaTitle}>Ready to drive smarter?</h2>
          <p style={s.ctaSub}>No credit card. No signup needed. Plan your first EV trip in under a minute.</p>
          <div style={s.ctaBtns}>
            <Link to="/trip" style={s.btnPrimary}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Plan Your Trip
            </Link>
            <Link to="/register" style={s.btnGhost}>Create Account →</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <span style={s.footerLogo}>ConnectX</span>
            <span style={s.footerTagline}>Premium EV Navigation</span>
          </div>
          <div style={s.footerLinks}>
            {[
              { label: "Trip Planner", to: "/trip" },
              { label: "Profile", to: "/profile" },
              { label: "Log In", to: "/login" },
              { label: "Register", to: "/register" },
            ].map((l, i) => (
              <Link key={i} to={l.to} style={s.footerLink}>{l.label}</Link>
            ))}
          </div>
          <p style={s.footerCopy}>© 2026 ConnectX EV Trip Planner. Built for Indian EV drivers.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#0B0B0B", color: "#D1D5DB", fontFamily: "'Inter', sans-serif", overflowX: "hidden" },

  // Hero
  hero: {
    minHeight: "100vh", position: "relative", overflow: "hidden",
    display: "flex", flexDirection: "column", justifyContent: "center",
    paddingTop: "60px",
    background: "#0B0B0B",
  },
  videoBg: {
    position: "absolute",
    top: 0, left: 0, width: "100%", height: "100%",
    objectFit: "cover", zIndex: 0,
    // Removed opacity: browser can hardware-accelerate an opaque video much easier.
  },
  videoOverlay: {
    position: "absolute", inset: 0,
    // Provide the darkening effect purely through the top layer overlay
    background: "linear-gradient(to bottom, rgba(11,11,11,0.6) 0%, rgba(11,11,11,1) 95%)",
    zIndex: 0, pointerEvents: "none",
  },
  gridBg: {
    position: "absolute", inset: "-60px", zIndex: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    maskImage: "radial-gradient(ellipse 70% 80% at 50% 20%, black 20%, transparent 100%)",
    animation: "panGrid 5s linear infinite",
  },
  heroContent: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 80px", maxWidth: "1400px", margin: "0 auto", width: "100%",
    gap: "60px", zIndex: 1, position: "relative", flex: 1,
    minHeight: "calc(100vh - 60px)",
  },
  heroLeft: { flex: "0 0 auto", maxWidth: "540px" },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "10px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "100px", padding: "8px 20px",
    fontSize: "0.78rem", fontWeight: 600, color: "#E5E7EB",
    letterSpacing: "0.8px", marginBottom: "28px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    backdropFilter: "blur(4px)",
  },
  heroBadgeDot: {
    width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E",
    boxShadow: "0 0 8px #22C55E",
    animation: "pulse-badge 2s ease-in-out infinite",
  },
  heroTitle: {
    fontSize: "clamp(2.4rem, 4.5vw, 4rem)", fontWeight: 800, color: "#FFFFFF",
    lineHeight: 1.1, letterSpacing: "-2.5px", marginBottom: "20px",
  },
  heroTitleAccent: { color: "#FFFFFF", opacity: 0.6 },
  heroSub: {
    fontSize: "1rem", color: "#9CA3AF", lineHeight: 1.8,
    marginBottom: "40px", maxWidth: "470px",
  },
  heroBtns: { display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "32px" },
  btnPrimary: {
    textDecoration: "none", background: "#FFFFFF", color: "#0B0B0B",
    fontWeight: 700, fontSize: "0.92rem", padding: "14px 28px",
    borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "8px",
    transition: "all 0.2s ease", letterSpacing: "0.1px",
  },
  btnGhost: {
    textDecoration: "none", background: "transparent",
    border: "1px solid #2A2A2A", color: "#9CA3AF",
    fontSize: "0.9rem", padding: "13px 24px", borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  trustRow: { display: "flex", gap: "20px", flexWrap: "wrap" },
  trustBadge: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "#9CA3AF" },
  trustCheck: { color: "#22C55E", fontWeight: 700 },

  // 3D Car area
  heroRight: {
    flex: 1, height: "560px", position: "relative",
    minWidth: "400px", cursor: "grab",
    alignSelf: "center",
  },
  carGlow: {
    position: "absolute", bottom: "-20px", left: "50%", transform: "translateX(-50%)",
    width: "100%", height: "240px",
    background: "radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 80%)",
    pointerEvents: "none",
  },
  carLoading: {
    position: "absolute", inset: 0, display: "flex",
    alignItems: "center", justifyContent: "center",
    color: "#6B7280", fontSize: "0.85rem",
  },
  carChip: {
    position: "absolute", display: "flex", alignItems: "center", gap: "12px",
    background: "rgba(20,20,22,0.65)", border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
    borderRadius: "12px", padding: "12px 18px",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    zIndex: 10, animation: "chipFloat 4s ease-in-out infinite",
  },
  chipDot: {
    width: "8px", height: "8px", borderRadius: "50%", background: "#FFFFFF",
    flexShrink: 0, boxShadow: "0 0 8px currentColor",
  },
  chipVal: { fontSize: "0.92rem", fontWeight: 700, color: "#FFFFFF" },
  chipLabel: { fontSize: "0.65rem", color: "#9CA3AF", marginTop: "2px" },

  // Stats bar
  statsBar: {
    display: "flex", justifyContent: "center", gap: "0",
    padding: "32px 80px",
    borderTop: "1px solid #1A1A1A",
    zIndex: 1, position: "relative",
    maxWidth: "1400px", margin: "0 auto", width: "100%",
    flexWrap: "wrap",
  },
  statItem: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
    flex: 1, minWidth: "120px",
    padding: "0 40px",
  },
  statValue: { fontSize: "2.4rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-2px", lineHeight: 1 },
  statLabel: { fontSize: "0.72rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 500 },

  // Section base
  section: { padding: "100px 80px", background: "#0B0B0B" },
  sectionInner: { maxWidth: "1200px", margin: "0 auto" },
  sectionHead: { marginBottom: "64px" },
  eyebrow: { fontSize: "0.73rem", fontWeight: 500, color: "#6B7280", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" },
  sectionTitle: { fontSize: "clamp(1.7rem, 3vw, 2.4rem)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-1.5px", maxWidth: "560px", lineHeight: 1.2 },

  // Steps
  stepsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0", position: "relative" },
  stepCard: { padding: "40px 36px", borderLeft: "1px solid #1A1A1A", position: "relative" },
  stepNum: { fontSize: "0.72rem", color: "#6B7280", fontWeight: 600, letterSpacing: "2px", marginBottom: "20px" },
  stepTitle: { fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" },
  stepDesc: { fontSize: "0.87rem", color: "#9CA3AF", lineHeight: 1.7 },
  stepArrowHoriz: {
    position: "absolute", right: "-14px", top: "42px",
    fontSize: "1.1rem", color: "#2A2A2A", zIndex: 1,
  },

  // Features
  featGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0" },
  featCard: {
    padding: "36px 32px", borderTop: "1px solid #1A1A1A", borderLeft: "1px solid #1A1A1A",
    transition: "background 0.25s ease", position: "relative",
  },
  featIcon: {
    color: "#9CA3AF", marginBottom: "18px",
    width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#1A1A1A", borderRadius: "8px", border: "1px solid #2A2A2A",
  },
  featTitle: { fontSize: "0.97rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" },
  featDesc: { fontSize: "0.85rem", color: "#9CA3AF", lineHeight: 1.7 },

  // Battery section
  batterySection: { padding: "100px 80px", background: "#111111" },
  batteryLayout: { display: "flex", gap: "80px", alignItems: "center", flexWrap: "wrap" },
  batteryLeft: { flex: "0 0 400px" },
  batteryDesc: { fontSize: "0.92rem", color: "#9CA3AF", lineHeight: 1.8, margin: "20px 0 36px" },
  batteryRight: { flex: 1, minWidth: "300px" },
  batteryWidget: {
    background: "#0B0B0B", border: "1px solid #1A1A1A", borderRadius: "16px",
    padding: "28px",
  },
  bwHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  bwTitle: { fontSize: "0.85rem", fontWeight: 600, color: "#FFFFFF" },
  bwStatus: { fontSize: "0.72rem", color: "#22C55E", fontWeight: 500 },
  bwRoute: { fontSize: "0.78rem", color: "#6B7280", marginBottom: "24px" },
  bwBattery: { marginBottom: "24px" },
  bwBatNum: { fontSize: "4rem", fontWeight: 800, color: "#22C55E", letterSpacing: "-3px", lineHeight: 1 },
  bwBatPct: { fontSize: "1.6rem", fontWeight: 400 },
  bwBatLabel: { fontSize: "0.72rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", margin: "8px 0 12px" },
  bwBar: { height: "3px", background: "#1A1A1A", borderRadius: "2px", overflow: "hidden" },
  bwBarFill: { height: "100%", borderRadius: "2px", transition: "width 1s ease" },
  bwGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" },
  bwItem: {
    padding: "12px 0", borderBottom: "1px solid #1A1A1A",
    borderRight: "1px solid #1A1A1A",
    paddingRight: "16px", paddingLeft: "4px",
  },
  bwItemLabel: { fontSize: "0.67rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" },
  bwItemVal: { fontSize: "0.92rem", fontWeight: 600, color: "#FFFFFF" },

  // Testimonials
  testimonialWrap: { display: "flex", gap: "20px", flexWrap: "wrap" },
  testimonialCard: {
    flex: 1, minWidth: "260px", background: "#0B0B0B",
    border: "1px solid #1A1A1A", borderRadius: "14px", padding: "28px",
  },
  testimonialText: { fontSize: "0.92rem", color: "#D1D5DB", lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" },
  testimonialMeta: { display: "flex", alignItems: "center", gap: "12px" },
  testimonialAvatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "#1A1A1A", border: "1px solid #2A2A2A",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.9rem", fontWeight: 700, color: "#FFFFFF", flexShrink: 0,
  },
  testimonialName: { fontSize: "0.87rem", fontWeight: 600, color: "#FFFFFF" },
  testimonialRole: { fontSize: "0.73rem", color: "#6B7280" },
  testimonialDots: { display: "flex", gap: "8px", justifyContent: "center", marginTop: "28px" },
  dot: { width: "8px", height: "8px", borderRadius: "50%", border: "none", cursor: "pointer", transition: "background 0.3s ease", padding: 0 },

  // CTA
  ctaSection: { 
    padding: "140px 80px", position: "relative", textAlign: "center", overflow: "hidden",
    background: "linear-gradient(135deg, #0B0B0B 0%, #111822 50%, #0B0B0B 100%)",
    backgroundSize: "200% 200%",
    animation: "aurora 15s ease infinite",
  },
  ctaGlow: {
    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    width: "800px", height: "400px",
    background: "radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 60%)",
    pointerEvents: "none", mixBlendMode: "screen",
  },
  ctaInner: { maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 },
  ctaTitle: { fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-2px", marginBottom: "16px" },
  ctaSub: { fontSize: "1rem", color: "#9CA3AF", lineHeight: 1.7, marginBottom: "40px" },
  ctaBtns: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" },

  // Footer
  footer: { borderTop: "1px solid #1A1A1A", padding: "48px 80px", background: "#0B0B0B" },
  footerInner: { maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" },
  footerBrand: { display: "flex", flexDirection: "column", gap: "4px" },
  footerLogo: { fontSize: "1rem", fontWeight: 800, color: "#FFFFFF" },
  footerTagline: { fontSize: "0.73rem", color: "#6B7280" },
  footerLinks: { display: "flex", gap: "24px", flexWrap: "wrap" },
  footerLink: { textDecoration: "none", color: "#6B7280", fontSize: "0.85rem", transition: "color 0.2s ease" },
  footerCopy: { fontSize: "0.78rem", color: "#6B7280" },
};
