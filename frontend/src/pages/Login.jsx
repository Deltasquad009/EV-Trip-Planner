import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import storage from "../utils/storage";
import "../styles/global.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("email");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === "email" && form.email) { setStep("password"); return; }
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
      storage.setItem("token", data.token);
      if (data.user) {
        storage.setItem("userName", data.user.name || "");
        storage.setItem("userEmail", data.user.email || "");
      }
      navigate("/trip");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Back link */}
      <Link to="/" style={s.backLink}>← ConnectX</Link>

      <div style={s.container}>
        <div style={s.card}>
          {/* Header */}
          <div style={s.cardHead}>
            <p style={s.eyebrow}>EV Trip Planner</p>
            <h1 style={s.title}>
              {step === "email" ? "Sign in" : "Enter password"}
            </h1>
            <p style={s.sub}>
              {step === "email"
                ? <><span style={s.mutedText}>New here? </span><Link to="/register" style={s.link}>Create an account</Link></>
                : <button style={s.backBtn} onClick={() => setStep("email")}>← Back</button>
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                required style={s.input}
              />
            </div>

            {step === "password" && (
              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} placeholder="Enter your password"
                  required autoFocus style={s.input}
                />
              </div>
            )}

            {error && <div style={s.error}>{error}</div>}

            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <p style={s.guest}>
            <Link to="/trip" style={s.guestLink}>Continue without account →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", background: "#0B0B0B",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
  },
  backLink: {
    position: "fixed", top: "24px", left: "28px",
    textDecoration: "none", color: "#9CA3AF", fontSize: "0.85rem",
    fontWeight: 400, transition: "color 0.2s ease",
    zIndex: 100,
  },
  container: {
    width: "100%", maxWidth: "420px", padding: "24px",
  },
  card: {
    background: "#111111", border: "1px solid #1A1A1A",
    borderRadius: "12px", padding: "48px 40px",
  },
  cardHead: { marginBottom: "32px" },
  eyebrow: { fontSize: "0.72rem", color: "#6B7280", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" },
  title: { fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.8px", marginBottom: "10px" },
  sub: { fontSize: "0.85rem", color: "#9CA3AF" },
  mutedText: { color: "#6B7280" },
  link: { color: "#FFFFFF", textDecoration: "none", fontWeight: 500 },
  backBtn: {
    background: "none", border: "none", color: "#9CA3AF",
    fontSize: "0.85rem", cursor: "pointer", padding: 0,
    fontFamily: "'Inter', sans-serif",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.75rem", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.3px" },
  input: {
    background: "#1A1A1A", border: "1px solid #2A2A2A",
    borderRadius: "8px", padding: "13px 16px",
    fontSize: "0.92rem", color: "#FFFFFF", outline: "none",
    width: "100%", transition: "border-color 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  },
  error: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "8px", padding: "10px 14px",
    color: "#EF4444", fontSize: "0.83rem",
  },
  btn: {
    background: "#FFFFFF", border: "none", borderRadius: "8px",
    padding: "14px", color: "#0B0B0B", fontWeight: 600,
    fontSize: "0.95rem", cursor: "pointer", width: "100%",
    transition: "background 0.2s ease", fontFamily: "'Inter', sans-serif",
    marginTop: "4px",
  },
  guest: { textAlign: "center", marginTop: "4px" },
  guestLink: { color: "#6B7280", fontSize: "0.82rem", textDecoration: "none" },
};
