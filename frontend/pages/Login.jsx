import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.split}>
        {/* Left panel */}
        <div style={s.leftPanel}>
          <div style={s.leftOrb1} />
          <div style={s.leftOrb2} />
          <div style={s.leftContent}>
            <div style={s.leftIcon}>⚡</div>
            <h2 style={s.leftTitle}>Welcome Back, Driver</h2>
            <p style={s.leftSub}>Log in to access your trip history and saved EV preferences.</p>
            <div style={s.leftStats}>
              {["10K+ Routes", "50+ EV Models", "500+ Chargers"].map((t, i) => (
                <div key={i} style={s.leftStat}>{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div style={s.rightPanel}>
          <div style={s.formCard}>
            <h1 style={s.formTitle}>Sign In</h1>
            <p style={s.formSub}>Don't have an account? <Link to="/register" style={s.formLink}>Register →</Link></p>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Email Address</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉️</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    style={s.input}
                  />
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔒</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    style={s.input}
                  />
                </div>
              </div>

              {error && <div style={s.error}>⚠️ {error}</div>}

              <button type="submit" disabled={loading} style={s.btn}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>

              <Link to="/trip" style={s.guestLink}>Continue without account →</Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "var(--bg-deep)" },
  split: { display: "flex", minHeight: "100vh", paddingTop: "66px" },
  leftPanel: {
    flex: "1",
    background: "linear-gradient(135deg, #070d1a 0%, #0a1628 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 48px",
    position: "relative",
    overflow: "hidden",
    borderRight: "1px solid rgba(0,229,160,0.08)",
  },
  leftOrb1: {
    position: "absolute", width: "350px", height: "350px",
    background: "rgba(0,229,160,0.07)", borderRadius: "50%",
    filter: "blur(80px)", top: "10%", left: "-10%",
    animation: "orb-float 10s ease-in-out infinite",
  },
  leftOrb2: {
    position: "absolute", width: "250px", height: "250px",
    background: "rgba(0,188,212,0.06)", borderRadius: "50%",
    filter: "blur(60px)", bottom: "10%", right: "5%",
    animation: "orb-float 14s ease-in-out infinite",
    animationDelay: "5s",
  },
  leftContent: { position: "relative", zIndex: 1, maxWidth: "400px" },
  leftIcon: { fontSize: "3rem", marginBottom: "20px" },
  leftTitle: {
    fontSize: "2.2rem", fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    color: "#e0e8f0", letterSpacing: "-1px",
    marginBottom: "16px", lineHeight: 1.2,
  },
  leftSub: { fontSize: "1rem", color: "#7a9bbf", lineHeight: 1.7, marginBottom: "36px" },
  leftStats: { display: "flex", flexDirection: "column", gap: "12px" },
  leftStat: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#00e5a0",
    padding: "10px 16px",
    background: "rgba(0,229,160,0.06)",
    border: "1px solid rgba(0,229,160,0.15)",
    borderRadius: "10px",
  },
  rightPanel: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 48px",
  },
  formCard: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(0,229,160,0.12)",
    borderRadius: "20px",
    padding: "42px",
    backdropFilter: "blur(12px)",
  },
  formTitle: {
    fontSize: "1.9rem", fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    color: "#e0e8f0", marginBottom: "6px",
    letterSpacing: "-0.5px",
  },
  formSub: { fontSize: "0.88rem", color: "#7a9bbf", marginBottom: "32px" },
  formLink: { color: "#00e5a0", fontWeight: 600, textDecoration: "none" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "0.77rem", fontWeight: 600,
    color: "#7ab8d4", textTransform: "uppercase", letterSpacing: "0.5px",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "0.9rem",
    zIndex: 1,
    pointerEvents: "none",
  },
  input: {
    paddingLeft: "38px !important",
    width: "100%",
    padding: "12px 16px 12px 40px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(0,229,160,0.15)",
    borderRadius: "10px",
    color: "#e0e8f0",
    fontSize: "0.92rem",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  },
  error: {
    background: "rgba(255,77,77,0.1)",
    border: "1px solid rgba(255,77,77,0.25)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#ff7070",
    fontSize: "0.85rem",
  },
  btn: {
    marginTop: "8px",
    background: "linear-gradient(135deg, #00c9a7, #00bcd4)",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    color: "#000",
    fontWeight: 800,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.25s ease",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.2px",
  },
  guestLink: {
    textAlign: "center",
    fontSize: "0.83rem",
    color: "#7a9bbf",
    textDecoration: "none",
    display: "block",
    marginTop: "4px",
  },
};
