import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/global.css";

const recentTrips = [
  { from: "Bangalore", to: "Mysore", dist: "147 km", battery: "78%", date: "Mar 14", status: "Completed" },
  { from: "Chennai", to: "Pondicherry", dist: "162 km", battery: "62%", date: "Mar 12", status: "Completed" },
  { from: "Hyderabad", to: "Vijayawada", dist: "274 km", battery: "22%", date: "Mar 10", status: "Charging Needed" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState({ name: "EV Driver" });

  const statCards = [
    { icon: "🗺️", label: "Trips Planned", value: "12", sub: "+3 this week", color: "#00e5a0" },
    { icon: "🛣️", label: "Total Distance", value: "1,840 km", sub: "Lifetime", color: "#00bcd4" },
    { icon: "⚡", label: "Energy Saved", value: "240 kWh", sub: "vs ICE vehicles", color: "#a78bfa" },
    { icon: "🔌", label: "Charging Stops", value: "8", sub: "Avg 1 per long trip", color: "#f59e0b" },
  ];

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.wrapper}>
        {/* Welcome Banner */}
        <div style={s.banner}>
          <div style={s.bannerOrb} />
          <div style={s.bannerContent}>
            <div style={s.bannerLeft}>
              <p style={s.bannerGreeting}>Good day, Driver 👋</p>
              <h1 style={s.bannerTitle}>Your EV Dashboard</h1>
              <p style={s.bannerSub}>Track your trips, energy consumption, and charging history.</p>
            </div>
            <Link to="/trip" style={s.planBtn}>⚡ Plan New Trip</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={s.statsGrid}>
          {statCards.map((card, i) => (
            <div key={i} style={s.statCard}>
              <div style={{ ...s.statIcon, color: card.color }}>{card.icon}</div>
              <div style={s.statValue}>{card.value}</div>
              <div style={s.statLabel}>{card.label}</div>
              <div style={s.statSub}>{card.sub}</div>
              <div style={{ ...s.statBar, background: `${card.color}22` }}>
                <div style={{ ...s.statBarFill, background: card.color, width: `${60 + i * 10}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div style={s.mainGrid}>
          {/* Recent Trips */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h2 style={s.cardTitle}>🕐 Recent Trips</h2>
              <Link to="/trip" style={s.cardAction}>+ New Trip</Link>
            </div>
            <div style={s.tripList}>
              {recentTrips.map((trip, i) => (
                <div key={i} style={s.tripRow}>
                  <div style={s.tripRoute}>
                    <span style={s.tripFrom}>{trip.from}</span>
                    <span style={s.tripArrow}>→</span>
                    <span style={s.tripTo}>{trip.to}</span>
                  </div>
                  <div style={s.tripMeta}>
                    <span style={s.tripDist}>📍 {trip.dist}</span>
                    <span style={s.tripBattery}>🔋 {trip.battery}</span>
                    <span style={s.tripDate}>{trip.date}</span>
                    <span style={{
                      ...s.tripBadge,
                      background: trip.status === "Completed" ? "rgba(0,229,160,0.1)" : "rgba(255,183,77,0.1)",
                      color: trip.status === "Completed" ? "#00e5a0" : "#ffb74d",
                      border: `1px solid ${trip.status === "Completed" ? "rgba(0,229,160,0.2)" : "rgba(255,183,77,0.2)"}`,
                    }}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions + Tips */}
          <div style={s.sideCol}>
            <div style={s.card}>
              <h2 style={s.cardTitle}>⚡ Quick Actions</h2>
              <div style={s.actionsList}>
                {[
                  { icon: "🗺️", label: "Plan a Trip", path: "/trip" },
                  { icon: "🔋", label: "Check EV Models", path: "/trip" },
                  { icon: "📊", label: "View Analytics", path: "/dashboard" },
                  { icon: "👤", label: "Edit Profile", path: "/dashboard" },
                ].map((action, i) => (
                  <Link key={i} to={action.path} style={s.actionItem}>
                    <span style={s.actionIcon}>{action.icon}</span>
                    <span style={s.actionLabel}>{action.label}</span>
                    <span style={s.actionArrow}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Battery Health Card */}
            <div style={s.tipsCard}>
              <h3 style={s.tipsTitle}>💡 EV Tip of the Day</h3>
              <p style={s.tipsText}>
                Keeping your battery between 20%–80% extends its lifespan significantly. Avoid frequent 100% charges for daily use.
              </p>
              <div style={s.tipsStat}>
                <span style={s.tipsStatLabel}>Optimal Range</span>
                <div style={s.tipsBarTrack}>
                  <div style={{ ...s.tipsBarFill, left: "20%", width: "60%" }} />
                  <div style={{ ...s.tipsBarMark, left: "20%" }} />
                  <div style={{ ...s.tipsBarMark, left: "80%" }} />
                </div>
                <div style={s.tipsBarLegend}>
                  <span>0%</span><span>20%</span><span>80%</span><span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "var(--bg-deep)", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" },
  wrapper: { maxWidth: "1300px", margin: "0 auto", padding: "90px 24px 60px" },
  banner: {
    background: "linear-gradient(135deg, rgba(0,229,160,0.08), rgba(0,188,212,0.06))",
    border: "1px solid rgba(0,229,160,0.15)",
    borderRadius: "20px",
    padding: "36px 40px",
    marginBottom: "28px",
    position: "relative",
    overflow: "hidden",
  },
  bannerOrb: {
    position: "absolute", width: "300px", height: "300px",
    background: "rgba(0,229,160,0.06)", borderRadius: "50%",
    filter: "blur(60px)", right: "-50px", top: "-80px",
  },
  bannerContent: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", position: "relative", zIndex: 1 },
  bannerLeft: {},
  bannerGreeting: { fontSize: "0.88rem", color: "#00e5a0", fontWeight: 600, marginBottom: "6px" },
  bannerTitle: { fontSize: "2rem", fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#e0e8f0", letterSpacing: "-1px", marginBottom: "8px" },
  bannerSub: { fontSize: "0.92rem", color: "#7a9bbf" },
  planBtn: {
    textDecoration: "none",
    background: "linear-gradient(135deg, #00c9a7, #00bcd4)",
    color: "#000", fontWeight: 800,
    fontSize: "0.95rem", padding: "13px 24px",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,201,167,0.3)",
    whiteSpace: "nowrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "20px",
    backdropFilter: "blur(10px)",
    transition: "all 0.25s ease",
  },
  statIcon: { fontSize: "1.5rem", marginBottom: "10px" },
  statValue: { fontSize: "1.7rem", fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#e0e8f0", letterSpacing: "-0.5px" },
  statLabel: { fontSize: "0.8rem", fontWeight: 600, color: "#7a9bbf", textTransform: "uppercase", letterSpacing: "0.5px", margin: "4px 0 2px" },
  statSub: { fontSize: "0.75rem", color: "#4a6280", marginBottom: "12px" },
  statBar: { height: "4px", borderRadius: "100px", overflow: "hidden" },
  statBarFill: { height: "100%", borderRadius: "100px", transition: "width 0.8s ease" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px", padding: "24px",
    backdropFilter: "blur(10px)",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  cardTitle: { fontSize: "1rem", fontWeight: 700, color: "#e0e8f0" },
  cardAction: { fontSize: "0.82rem", color: "#00e5a0", fontWeight: 600, textDecoration: "none" },
  tripList: { display: "flex", flexDirection: "column", gap: "0" },
  tripRow: {
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  tripRoute: { display: "flex", alignItems: "center", gap: "8px" },
  tripFrom: { fontSize: "0.92rem", fontWeight: 700, color: "#e0e8f0" },
  tripArrow: { fontSize: "0.85rem", color: "#00e5a0" },
  tripTo: { fontSize: "0.92rem", fontWeight: 600, color: "#a0b8c8" },
  tripMeta: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  tripDist: { fontSize: "0.78rem", color: "#7a9bbf" },
  tripBattery: { fontSize: "0.78rem", color: "#7a9bbf" },
  tripDate: { fontSize: "0.75rem", color: "#4a6280" },
  tripBadge: { fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "100px" },
  sideCol: { display: "flex", flexDirection: "column", gap: "16px" },
  actionsList: { display: "flex", flexDirection: "column", gap: "6px" },
  actionItem: {
    textDecoration: "none",
    display: "flex", alignItems: "center", gap: "12px",
    padding: "11px 14px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    transition: "all 0.2s ease",
  },
  actionIcon: { fontSize: "1rem" },
  actionLabel: { fontSize: "0.88rem", fontWeight: 600, color: "#a0b8c8", flex: 1 },
  actionArrow: { fontSize: "0.85rem", color: "#7a9bbf" },
  tipsCard: {
    background: "rgba(0,229,160,0.04)",
    border: "1px solid rgba(0,229,160,0.12)",
    borderRadius: "16px", padding: "20px",
  },
  tipsTitle: { fontSize: "0.9rem", fontWeight: 700, color: "#00e5a0", marginBottom: "10px" },
  tipsText: { fontSize: "0.83rem", color: "#7a9bbf", lineHeight: 1.65, marginBottom: "16px" },
  tipsStat: {},
  tipsStatLabel: { fontSize: "0.75rem", color: "#7a9bbf", fontWeight: 600, display: "block", marginBottom: "8px" },
  tipsBarTrack: { position: "relative", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "100px", marginBottom: "6px" },
  tipsBarFill: {
    position: "absolute", top: 0, height: "100%",
    background: "linear-gradient(90deg, #00c9a7, #00e5a0)",
    borderRadius: "100px",
  },
  tipsBarMark: { position: "absolute", top: "-2px", width: "2px", height: "12px", background: "rgba(255,255,255,0.4)", borderRadius: "2px" },
  tipsBarLegend: { display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#4a6280" },
};
