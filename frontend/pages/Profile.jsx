import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function Profile() {
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex.j@example.com",
    memberSince: "Dec 2024",
    avatar: "AJ",
    avatarUrl: "/avatar.png",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const name = parsedUser.name || "EV Driver";
        const email = parsedUser.email || "";
        
        let initials = "EV";
        if (name) {
          const nameParts = name.trim().split(" ");
          initials = nameParts[0].charAt(0).toUpperCase();
          if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          }
        }

        setUser(prev => ({
          ...prev,
          name,
          email,
          avatar: initials,
          avatarUrl: "" // Reset to blank to show the dynamic avatar initials
        }));
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUser({ ...user, avatarUrl: url });
    }
  };

  const [preferences, setPreferences] = useState({
    defaultEV: "Tesla Model 3 Long Range",
    costRate: 8, // ₹ per kWh
    distanceUnit: "km",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePrefChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically save to the backend
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.wrapper}>
        
        {/* Header / Avatar Section */}
        <div style={s.headerCard}>
          <div style={s.headerBg}>
             <div style={s.headerOrb1} />
             <div style={s.headerOrb2} />
          </div>
          <div style={s.avatarContainer}>
            <div style={s.avatarWrap}>
              <div style={{
                ...s.avatar,
                backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
                {!user.avatarUrl && user.avatar}
              </div>
              {isEditing && (
                <label style={s.avatarEditLabel}>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display: "none"}} />
                  📷
                </label>
              )}
            </div>
            <div style={s.userInfo}>
              <h1 style={s.userName}>{user.name}</h1>
              <p style={s.userEmail}>{user.email}</p>
              <div style={s.memberBadge}>Member since {user.memberSince}</div>
            </div>
            {!isEditing && (
              <button style={s.editBtn} onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        <div style={s.grid}>
          {/* Settings Form */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h2 style={s.cardTitle}>⚙️ Account Settings</h2>
            </div>
            
            <form onSubmit={handleSave} style={s.form}>
              
              <div style={s.sectionTitle}>Personal Details</div>
              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.label}>Full Name</label>
                  <input 
                    name="name"
                    value={user.name} 
                    onChange={handleUserChange}
                    disabled={!isEditing}
                    style={isEditing ? s.inputEditing : s.inputDisabled} 
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    value={user.email} 
                    onChange={handleUserChange}
                    disabled={!isEditing}
                    style={isEditing ? s.inputEditing : s.inputDisabled} 
                  />
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.sectionTitle}>Trip Preferences</div>
              <div style={s.formGroup}>
                <label style={s.label}>Default EV Model</label>
                <select 
                  name="defaultEV"
                  value={preferences.defaultEV}
                  onChange={handlePrefChange}
                  disabled={!isEditing}
                  style={isEditing ? s.inputEditing : s.inputDisabled}
                >
                  <option value="Tesla Model 3 Long Range">Tesla Model 3 Long Range</option>
                  <option value="Tata Nexon EV Max">Tata Nexon EV Max</option>
                  <option value="Hyundai Ioniq 5">Hyundai Ioniq 5</option>
                  <option value="MG ZS EV">MG ZS EV</option>
                </select>
              </div>

              <div style={s.formGrid}>
                 <div style={s.formGroup}>
                  <label style={s.label}>Default Electricity Rate (₹/kWh)</label>
                  <input 
                    name="costRate"
                    type="number"
                    step="0.5"
                    value={preferences.costRate} 
                    onChange={handlePrefChange}
                    disabled={!isEditing}
                    style={isEditing ? s.inputEditing : s.inputDisabled} 
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Distance Unit</label>
                  <select 
                    name="distanceUnit"
                    value={preferences.distanceUnit}
                    onChange={handlePrefChange}
                    disabled={!isEditing}
                    style={isEditing ? s.inputEditing : s.inputDisabled}
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="miles">Miles (mi)</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div style={s.formActions}>
                  <button type="button" style={s.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" style={s.saveBtn}>Save Changes</button>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar Stats */}
          <div style={s.sidebar}>
            <div style={s.card}>
               <h2 style={s.cardTitle}>📊 Lifetime Stats</h2>
               
               <div style={s.statList}>
                  <div style={s.statItem}>
                    <div style={s.statIconBox}>🗺️</div>
                    <div style={s.statDetails}>
                      <div style={s.statValue}>12</div>
                      <div style={s.statLabel}>Trips Planned</div>
                    </div>
                  </div>
                  
                  <div style={s.statItem}>
                    <div style={{...s.statIconBox, background: "rgba(0, 188, 212, 0.1)", color: "#00bcd4"}}>🛣️</div>
                    <div style={s.statDetails}>
                      <div style={s.statValue}>1,840 km</div>
                      <div style={s.statLabel}>Total Distance</div>
                    </div>
                  </div>
                  
                  <div style={s.statItem}>
                    <div style={{...s.statIconBox, background: "rgba(167, 139, 250, 0.1)", color: "#a78bfa"}}>⚡</div>
                    <div style={s.statDetails}>
                      <div style={s.statValue}>240 kWh</div>
                      <div style={s.statLabel}>Energy Consumed</div>
                    </div>
                  </div>
               </div>
            </div>

            <div style={s.dangerZone}>
               <h3 style={s.dangerTitle}>Danger Zone</h3>
               <p style={s.dangerText}>Once you delete your account, there is no going back. Please be certain.</p>
               <button style={s.deleteBtn}>Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "var(--bg-deep)", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" },
  wrapper: { maxWidth: "1100px", margin: "0 auto", padding: "90px 24px 60px" },
  
  // Header
  headerCard: {
    position: "relative",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "20px",
    overflow: "hidden",
    marginBottom: "24px",
  },
  headerBg: {
    height: "120px",
    background: "linear-gradient(135deg, rgba(0,229,160,0.1), rgba(0,188,212,0.1))",
    position: "relative",
    borderBottom: "1px solid rgba(0,229,160,0.2)",
  },
  headerOrb1: {
    position: "absolute", width: "200px", height: "200px",
    background: "rgba(0,229,160,0.15)", borderRadius: "50%",
    filter: "blur(40px)", top: "-50px", left: "10%",
  },
  headerOrb2: {
    position: "absolute", width: "250px", height: "250px",
    background: "rgba(0,188,212,0.15)", borderRadius: "50%",
    filter: "blur(50px)", bottom: "-80px", right: "5%",
  },
  avatarContainer: {
    padding: "0 32px 32px",
    display: "flex",
    alignItems: "flex-end",
    gap: "24px",
    marginTop: "-40px",
    position: "relative",
    zIndex: 2,
    flexWrap: "wrap",
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: "100px", height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #00c9a7, #00bcd4)",
    border: "4px solid #070d1a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "2.5rem", fontWeight: 800, color: "#000",
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 10px 30px rgba(0,201,167,0.3)",
  },
  avatarEditLabel: {
    position: "absolute", bottom: "-4px", right: "-4px",
    background: "#070d1a", border: "2px solid #00e5a0",
    borderRadius: "50%", width: "32px", height: "32px",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: "0.9rem",
    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
  },
  userInfo: { flex: 1, paddingTop: "46px" },
  userName: { fontSize: "1.6rem", fontWeight: 800, color: "#e0e8f0", fontFamily: "'Outfit', sans-serif", marginBottom: "4px", letterSpacing: "-0.5px" },
  userEmail: { fontSize: "0.95rem", color: "#7a9bbf", marginBottom: "12px" },
  memberBadge: {
    display: "inline-block",
    background: "rgba(0,229,160,0.1)",
    border: "1px solid rgba(0,229,160,0.2)",
    color: "#00e5a0", fontSize: "0.75rem", fontWeight: 600,
    padding: "4px 12px", borderRadius: "100px",
  },
  editBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#a0b8c8", padding: "10px 18px", borderRadius: "10px",
    fontSize: "0.88rem", fontWeight: 600, cursor: "pointer",
    transition: "all 0.2s", alignSelf: "flex-end",
  },

  // Grid
  grid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" },
  
  // Cards
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px", padding: "28px",
    backdropFilter: "blur(12px)",
  },
  cardHeader: { marginBottom: "24px" },
  cardTitle: { fontSize: "1.1rem", fontWeight: 800, color: "#e0e8f0", fontFamily: "'Outfit', sans-serif" },
  
  // Form
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionTitle: { fontSize: "0.85rem", fontWeight: 700, color: "#00e5a0", textTransform: "uppercase", letterSpacing: "1px", margin: "10px 0 4px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.8rem", fontWeight: 600, color: "#7a9bbf" },
  inputDisabled: {
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,0.02)", border: "1px solid transparent",
    borderRadius: "10px", color: "#a0b8c8", fontSize: "0.95rem",
    outline: "none", cursor: "not-allowed", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
  },
  inputEditing: {
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,229,160,0.3)",
    borderRadius: "10px", color: "#e0e8f0", fontSize: "0.95rem",
    outline: "none", transition: "all 0.2s", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
    boxShadow: "0 0 0 2px rgba(0,229,160,0.1)",
  },
  divider: { height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0" },
  formActions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" },
  cancelBtn: {
    background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
    color: "#a0b8c8", padding: "10px 20px", borderRadius: "10px",
    fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
  },
  saveBtn: {
    background: "linear-gradient(135deg, #00c9a7, #00bcd4)", border: "none",
    color: "#000", padding: "10px 24px", borderRadius: "10px",
    fontSize: "0.9rem", fontWeight: 800, cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,201,167,0.3)",
  },

  // Sidebar
  sidebar: { display: "flex", flexDirection: "column", gap: "24px" },
  statList: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" },
  statItem: { display: "flex", alignItems: "center", gap: "14px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" },
  statIconBox: {
    width: "44px", height: "44px", borderRadius: "12px",
    background: "rgba(0, 229, 160, 0.1)", color: "#00e5a0",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
  },
  statDetails: { display: "flex", flexDirection: "column", gap: "2px" },
  statValue: { fontSize: "1.1rem", fontWeight: 800, color: "#e0e8f0", fontFamily: "'Outfit', sans-serif" },
  statLabel: { fontSize: "0.75rem", color: "#7a9bbf", fontWeight: 500 },

  dangerZone: {
    background: "rgba(2ef, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "16px", padding: "20px",
  },
  dangerTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#ef4444", marginBottom: "8px" },
  dangerText: { fontSize: "0.8rem", color: "#fca5a5", lineHeight: 1.5, marginBottom: "16px", opacity: 0.8 },
  deleteBtn: {
    width: "100%", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#ef4444", padding: "10px", borderRadius: "8px",
    fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
  },
};
