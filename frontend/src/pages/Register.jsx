import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import storage from "../utils/storage";
import "../styles/global.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
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
      <Link to="/" style={s.backLink}>← ConnectX</Link>

      <div style={s.layout}>
        {/* Left panel */}
        <div style={s.leftPanel}>
          <div style={s.leftContent}>
            <p style={s.eyebrow}>EV Trip Planner</p>
            <h2 style={s.leftTitle}>Drive further.<br />Worry less.</h2>
            <p style={s.leftSub}>
              Create your account and get access to unlimited trip planning, battery predictions, and smart charging suggestions.
            </p>
            <div style={s.perks}>
              {[
                "Unlimited trip planning",
                "Save trip history",
                "Personalized EV profiles",
                "Smart charging alerts",
              ].map((p, i) => (
                <div key={i} style={s.perk}>
                  <span style={s.perkCheck}>–</span>
                  <span style={s.perkText}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div style={s.rightPanel}>
          <div style={s.card}>
            <div style={s.cardHead}>
              <h1 style={s.title}>Create account</h1>
              <p style={s.sub}>
                <span style={s.mutedText}>Already have one? </span>
                <Link to="/login" style={s.link}>Sign in</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} style={s.form}>
              {[
                { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
                { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
                { label: "Password", name: "password", type: "password", placeholder: "Min. 8 characters" },
              ].map((field) => (
                <div key={field.name} style={s.fieldGroup}>
                  <label style={s.label}>{field.label}</label>
                  <input
                    type={field.type} name={field.name}
                    value={form[field.name]} onChange={handleChange}
                    placeholder={field.placeholder} required
                    minLength={field.name === "password" ? 8 : undefined}
                    style={s.input}
                  />
                </div>
              ))}

              {error && <div style={s.error}>{error}</div>}

              <button type="submit" disabled={loading} style={s.btn}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p style={s.terms}>
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", background: "#0B0B0B", fontFamily: "'Inter', sans-serif" },
  backLink: {
    position: "fixed", top: "24px", left: "28px",
    textDecoration: "none", color: "#9CA3AF",
    fontSize: "0.85rem", zIndex: 100,
  },
  layout: { display: "flex", width: "100%", minHeight: "100vh" },

  // Left
  leftPanel: {
    flex: 1, background: "#111111", borderRight: "1px solid #1A1A1A",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "80px 60px",
  },
  leftContent: { maxWidth: "400px" },
  eyebrow: { fontSize: "0.72rem", color: "#6B7280", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "20px" },
  leftTitle: { fontSize: "2.6rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "20px" },
  leftSub: { fontSize: "0.9rem", color: "#9CA3AF", lineHeight: 1.8, marginBottom: "40px" },
  perks: { display: "flex", flexDirection: "column", gap: "14px" },
  perk: { display: "flex", alignItems: "center", gap: "12px" },
  perkCheck: { color: "#6B7280", fontSize: "1rem", lineHeight: 1, flexShrink: 0 },
  perkText: { fontSize: "0.9rem", color: "#D1D5DB", fontWeight: 400 },

  // Right
  rightPanel: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "80px 48px", background: "#0B0B0B",
  },
  card: { width: "100%", maxWidth: "420px" },
  cardHead: { marginBottom: "32px" },
  title: { fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.8px", marginBottom: "10px" },
  sub: { fontSize: "0.85rem", color: "#9CA3AF" },
  mutedText: { color: "#6B7280" },
  link: { color: "#FFFFFF", textDecoration: "none", fontWeight: 500 },
  form: { display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" },
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
  terms: { textAlign: "center", fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.6 },
};
