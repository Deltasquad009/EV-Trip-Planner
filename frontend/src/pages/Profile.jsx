import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import storage from "../utils/storage";
import { getTripHistory } from "../services/tripService";

const achievements = [
  { icon: '🏆', title: 'Long Hauler', desc: 'Completed a 400+ km trip', checkFn: (trips) => trips.some(t => t.distance > 400) },
  { icon: '⚡', title: 'Fast Planner', desc: 'Planned 5+ trips', checkFn: (trips) => trips.length >= 5 },
  { icon: '🌱', title: 'Green Pioneer', desc: 'Saved 100+ kg CO₂', checkFn: (trips) => {
    const totalKm = trips.reduce((a, t) => a + (t.distance || 0), 0);
    return (totalKm * 0.12) > 100; // ~120g CO₂ saved per km vs petrol
  }},
  { icon: '🗺️', title: 'Explorer', desc: 'Planned 10+ unique routes', checkFn: (trips) => {
    const routes = new Set(trips.map(t => `${t.start}-${t.destination}`));
    return routes.size >= 10;
  }},
  { icon: '🔋', title: 'Efficiency Pro', desc: 'Arrived with 50%+ battery', checkFn: (trips) => trips.some(t => t.batteryRemaining > 50) },
  { icon: '🌍', title: 'Cross Country', desc: 'Plan a 1000+ km route', checkFn: (trips) => trips.some(t => t.distance > 1000) },
];

export default function Profile() {
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [user, setUser] = useState(() => ({
    name: storage.getItem('userName') || 'Driver',
    email: storage.getItem('userEmail') || '',
    vehicle: 'Not set',
    joined: 'N/A',
    memberLevel: 'FREE',
  }));

  useEffect(() => {
    // Re-sync from storage every mount (catches post-login navigation)
    setUser(u => ({
      ...u,
      name: storage.getItem('userName') || u.name,
      email: storage.getItem('userEmail') || u.email,
    }));
    setTimeout(() => setLoaded(true), 100);

    // Fetch real trip history
    fetchTripHistory();
  }, []);

  const fetchTripHistory = async () => {
    try {
      setTripsLoading(true);
      const data = await getTripHistory();
      setTrips(data || []);
    } catch (err) {
      console.error("Failed to fetch trip history:", err);
      setTrips([]);
    } finally {
      setTripsLoading(false);
    }
  };

  // Calculate real stats from trip data
  const realStats = {
    totalTrips: trips.length,
    totalDistance: trips.reduce((a, t) => a + (t.distance || 0), 0),
    totalEnergy: trips.reduce((a, t) => a + (t.energyUsed || 0), 0),
    totalChargingStops: trips.reduce((a, t) => a + (t.chargingStops || 0), 0),
    co2Saved: (trips.reduce((a, t) => a + (t.distance || 0), 0) * 0.12).toFixed(1), // kg
    avgEfficiency: trips.length > 0
      ? (trips.reduce((a, t) => a + (t.batteryRemaining || 0), 0) / trips.length).toFixed(0)
      : 0,
  };

  const stats = [
    { label: 'Total Trips', value: realStats.totalTrips.toString(), unit: '', icon: '🗺️' },
    { label: 'Total Distance', value: realStats.totalDistance.toLocaleString('en-IN'), unit: 'km', icon: '📏' },
    { label: 'CO₂ Saved', value: realStats.co2Saved, unit: 'kg', icon: '🌱' },
    { label: 'Charging Stops', value: realStats.totalChargingStops.toString(), unit: '', icon: '⚡' },
    { label: 'Energy Used', value: realStats.totalEnergy.toFixed(1), unit: 'kWh', icon: '🔋' },
    { label: 'Avg Battery Left', value: realStats.avgEfficiency, unit: '%', icon: '📊' },
  ];

  // Evaluate achievements against real data
  const evaluatedAchievements = achievements.map(a => ({
    ...a,
    earned: a.checkFn(trips),
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#050811;font-family:'Inter',sans-serif;color:#e8eaf6}
        .pp{min-height:100vh;padding:100px 48px 60px;position:relative;overflow:hidden}
        .pp-bg1{position:fixed;width:800px;height:800px;background:radial-gradient(circle,rgba(125,249,255,0.08) 0%,transparent 70%);top:-300px;right:-200px;border-radius:50%;pointer-events:none;z-index:0}
        .pp-bg2{position:fixed;width:600px;height:600px;background:radial-gradient(circle,rgba(176,38,255,0.08) 0%,transparent 70%);bottom:-200px;left:-100px;border-radius:50%;pointer-events:none;z-index:0}
        .pp-inner{max-width:1100px;margin:0 auto;position:relative;z-index:1}

        /* HERO HEADER */
        .profile-hero{background:rgba(15,22,50,0.8);backdrop-filter:blur(24px);border-radius:24px;padding:40px;border:1px solid rgba(125,249,255,0.1);margin-bottom:24px;display:flex;gap:36px;align-items:center;position:relative;overflow:hidden;opacity:${loaded?1:0};transform:translateY(${loaded?0:'20px'});transition:all .5s ease}
        .profile-hero::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(125,249,255,0.04) 0%,rgba(176,38,255,0.03) 100%);border-radius:24px;pointer-events:none}
        .profile-hero::after{content:'';position:absolute;top:-100px;right:-100px;width:350px;height:350px;background:radial-gradient(circle,rgba(176,38,255,0.1) 0%,transparent 70%);border-radius:50%}
        .avatar-wrap{position:relative;flex-shrink:0}
        .avatar-ring{width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#7DF9FF,#B026FF);display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:0 0 30px rgba(125,249,255,0.3),0 0 60px rgba(176,38,255,0.15);position:relative;z-index:1}
        .avatar-badge{position:absolute;bottom:-4px;right:-4px;background:linear-gradient(135deg,#7DF9FF,#59d8de);border-radius:999px;padding:4px 10px;font-family:'Space Grotesk',sans-serif;font-size:0.58rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#050811;z-index:2;box-shadow:0 0 12px rgba(125,249,255,0.4)}
        .hero-info{flex:1;position:relative;z-index:1}
        .hero-name{font-family:'Space Grotesk',sans-serif;font-size:2.2rem;font-weight:700;letter-spacing:-0.03em;color:#fff;margin-bottom:4px}
        .hero-email{font-size:0.9rem;color:rgba(232,234,246,0.5);margin-bottom:14px}
        .hero-tags{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
        .htag{display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:999px;font-size:0.72rem;font-weight:500}
        .htag-cyan{background:rgba(125,249,255,0.08);color:#7DF9FF;border:1px solid rgba(125,249,255,0.2)}
        .htag-pro{background:linear-gradient(135deg,rgba(176,38,255,0.2),rgba(125,249,255,0.1));color:#e5b5ff;border:1px solid rgba(176,38,255,0.3)}
        .hero-actions{display:flex;gap:12px}
        .btn-edit{padding:10px 22px;border-radius:999px;background:rgba(125,249,255,0.08);color:#7DF9FF;border:1px solid rgba(125,249,255,0.2);font-size:0.875rem;font-weight:500;cursor:pointer;transition:all .25s;font-family:'Inter',sans-serif}
        .btn-edit:hover{background:rgba(125,249,255,0.15)}
        .btn-save{padding:10px 22px;border-radius:999px;background:linear-gradient(135deg,#7DF9FF,#59d8de);color:#050811;border:none;font-size:0.875rem;font-weight:700;cursor:pointer;transition:all .25s;font-family:'Space Grotesk',sans-serif;box-shadow:0 0 16px rgba(125,249,255,0.3)}
        .btn-save:hover{transform:translateY(-1px);box-shadow:0 0 24px rgba(125,249,255,0.45)}
        .hero-stat{text-align:center}
        .hero-stat-val{font-family:'Space Grotesk',sans-serif;font-size:1.8rem;font-weight:700;color:#7DF9FF;text-shadow:0 0 16px rgba(125,249,255,0.4);line-height:1}
        .hero-stat-lbl{font-size:0.7rem;color:rgba(232,234,246,0.4);margin-top:4px;letter-spacing:0.05em}
        .hero-stats-row{display:flex;gap:40px}
        .hero-divider{width:1px;background:rgba(125,249,255,0.08);align-self:stretch}

        /* TABS */
        .tabs-bar{display:flex;gap:4px;margin-bottom:24px;background:rgba(15,22,50,0.7);backdrop-filter:blur(16px);border-radius:14px;padding:6px;border:1px solid rgba(125,249,255,0.08);width:fit-content;opacity:${loaded?1:0};transition:opacity .6s ease .2s}
        .tab-btn{padding:10px 22px;border-radius:10px;font-family:'Space Grotesk',sans-serif;font-size:0.85rem;font-weight:500;cursor:pointer;transition:all .25s;border:none;background:transparent;color:rgba(232,234,246,0.5)}
        .tab-btn.active{background:rgba(125,249,255,0.12);color:#7DF9FF;box-shadow:0 0 12px rgba(125,249,255,0.1)}
        .tab-btn:hover:not(.active){color:rgba(232,234,246,0.8)}

        /* CONTENT GRID */
        .profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;opacity:${loaded?1:0};transition:opacity .6s ease .3s}
        .pc{background:rgba(15,22,50,0.8);backdrop-filter:blur(20px);border-radius:20px;padding:28px;border:1px solid rgba(125,249,255,0.1);transition:border-color .3s}
        .pc:hover{border-color:rgba(125,249,255,0.18)}
        .pc-full{grid-column:1/-1}
        .pc-title{font-family:'Space Grotesk',sans-serif;font-size:0.6rem;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#7DF9FF;margin-bottom:22px}

        /* INFO ROWS */
        .info-row{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
        .info-row:last-child{border-bottom:none}
        .info-icon{width:34px;height:34px;border-radius:10px;background:rgba(125,249,255,0.07);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .info-label{font-family:'Space Grotesk',sans-serif;font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:rgba(125,249,255,0.6);margin-bottom:2px}
        .info-value{font-size:0.925rem;color:rgba(232,234,246,0.85);font-weight:500}
        .fi-edit{background:transparent;border:none;border-bottom:1px solid rgba(125,249,255,0.3);color:#fff;font-size:0.925rem;font-family:'Inter',sans-serif;padding:2px 0;outline:none;width:100%;transition:border-color .3s}
        .fi-edit:focus{border-bottom-color:#7DF9FF}

        /* STATS GRID */
        .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .stat-tile{background:rgba(125,249,255,0.04);border-radius:14px;padding:18px;border:1px solid rgba(125,249,255,0.07);transition:all .25s;cursor:default}
        .stat-tile:hover{background:rgba(125,249,255,0.07);border-color:rgba(125,249,255,0.15)}
        .st-icon{font-size:22px;margin-bottom:10px}
        .st-lbl{font-family:'Space Grotesk',sans-serif;font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:#7DF9FF;margin-bottom:4px}
        .st-val{font-family:'Space Grotesk',sans-serif;font-size:1.6rem;font-weight:700;color:#fff;text-shadow:0 0 14px rgba(125,249,255,0.3)}
        .st-unit{font-size:0.75rem;color:rgba(232,234,246,0.4);margin-left:3px}

        /* ACHIEVEMENTS */
        .ach-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .ach-item{background:rgba(125,249,255,0.04);border-radius:14px;padding:18px;border:1px solid rgba(125,249,255,0.07);transition:all .25s;text-align:center}
        .ach-item.earned{border-color:rgba(125,249,255,0.15);background:rgba(125,249,255,0.07)}
        .ach-item:hover{transform:translateY(-3px)}
        .ach-icon{font-size:28px;margin-bottom:10px}
        .ach-title{font-family:'Space Grotesk',sans-serif;font-size:0.8rem;font-weight:600;color:#fff;margin-bottom:4px}
        .ach-desc{font-size:0.72rem;color:rgba(232,234,246,0.45);line-height:1.5}
        .ach-locked{font-size:0.65rem;color:rgba(232,234,246,0.25);margin-top:6px}

        /* TRIP HISTORY */
        .trip-list{display:flex;flex-direction:column;gap:12px}
        .trip-item{background:rgba(125,249,255,0.04);border-radius:14px;padding:18px;border:1px solid rgba(125,249,255,0.07);transition:all .25s}
        .trip-item:hover{border-color:rgba(125,249,255,0.15)}
        .trip-route{font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:600;color:#fff;margin-bottom:6px}
        .trip-meta{display:flex;gap:16px;flex-wrap:wrap}
        .trip-meta-item{font-size:0.75rem;color:rgba(232,234,246,0.5)}
        .trip-meta-item span{color:#7DF9FF;font-weight:600}

        /* LOADING */
        .loading-text{color:rgba(232,234,246,0.4);font-size:0.85rem;text-align:center;padding:40px 0}
        .empty-state{text-align:center;padding:40px 20px;color:rgba(232,234,246,0.4)}
        .empty-state-icon{font-size:48px;margin-bottom:16px}
        .empty-state-text{font-size:0.9rem;margin-bottom:8px}
        .empty-state-sub{font-size:0.78rem;color:rgba(232,234,246,0.3)}

        /* VEHICLE CARD */
        .vehicle-card{background:linear-gradient(135deg,rgba(125,249,255,0.06) 0%,rgba(176,38,255,0.04) 100%);border-radius:16px;padding:24px;border:1px solid rgba(125,249,255,0.12);display:flex;align-items:center;gap:20px}
        .vc-icon{font-size:40px}
        .vc-name{font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:4px}
        .vc-sub{font-size:0.8rem;color:rgba(232,234,246,0.5)}
        .vc-badges{display:flex;gap:8px;margin-top:10px}
        .vc-badge{padding:3px 10px;border-radius:999px;font-size:0.68rem;font-weight:500;background:rgba(125,249,255,0.08);color:#7DF9FF;border:1px solid rgba(125,249,255,0.15)}

        @media(max-width:900px){.profile-grid{grid-template-columns:1fr}.stats-grid{grid-template-columns:repeat(2,1fr)}.ach-grid{grid-template-columns:repeat(2,1fr)}.profile-hero{flex-direction:column;text-align:center}.hero-stats-row{justify-content:center}}
        @media(max-width:640px){.pp{padding:90px 20px 40px}.stats-grid{grid-template-columns:1fr}.ach-grid{grid-template-columns:1fr}}
      `}</style>

      <Navbar />
      <div className="pp">
        <div className="pp-bg1" /><div className="pp-bg2" />
        <div className="pp-inner">

          {/* HERO */}
          <div className="profile-hero">
            <div className="avatar-wrap">
              <div className="avatar-ring">👤</div>
              {trips.length >= 5 && <div className="avatar-badge">⭐ ACTIVE</div>}
            </div>
            <div className="hero-info">
              <h1 className="hero-name">{user.name}</h1>
              <div className="hero-email">{user.email}</div>
              <div className="hero-tags">
                <div className="htag htag-cyan">🗺️ {realStats.totalTrips} trips planned</div>
                <div className="htag htag-cyan">📏 {realStats.totalDistance.toLocaleString('en-IN')} km traveled</div>
                <div className="htag htag-cyan">🌱 {realStats.co2Saved} kg CO₂ saved</div>
              </div>
              <div className="hero-actions">
                {editMode ? (
                  <button className="btn-save" onClick={() => setEditMode(false)}>Save Changes</button>
                ) : (
                  <button className="btn-edit" onClick={() => setEditMode(true)}>✏ Edit Profile</button>
                )}
              </div>
            </div>
            <div className="hero-divider" />
            <div className="hero-stats-row">
              {[
                [realStats.totalTrips.toString(), 'Trips'],
                [`${(realStats.totalDistance / 1000).toFixed(1)}K`, 'Km'],
                [`${realStats.co2Saved}`, 'CO₂ Saved (kg)'],
              ].map(([v, l]) => (
                <div className="hero-stat" key={l}>
                  <div className="hero-stat-val">{v}</div>
                  <div className="hero-stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TABS */}
          <div className="tabs-bar">
            {['overview', 'history', 'achievements', 'settings'].map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="profile-grid">
              {/* Personal Info */}
              <div className="pc">
                <div className="pc-title">Personal Information</div>
                {[
                  { icon: '👤', label: 'Full Name', field: 'name' },
                  { icon: '📧', label: 'Email', field: 'email' },
                ].map(({ icon, label, field }) => (
                  <div className="info-row" key={field}>
                    <div className="info-icon">{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="info-label">{label}</div>
                      {editMode
                        ? <input className="fi-edit" value={user[field]} onChange={e => setUser(u => ({ ...u, [field]: e.target.value }))} />
                        : <div className="info-value">{user[field]}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lifetime Stats */}
              <div className="pc">
                <div className="pc-title">Lifetime Statistics {tripsLoading && '(Loading...)'}</div>
                <div className="stats-grid">
                  {stats.map((s, i) => (
                    <div className="stat-tile" key={i}>
                      <div className="st-icon">{s.icon}</div>
                      <div className="st-lbl">{s.label}</div>
                      <div className="st-val">{s.value}<span className="st-unit">{s.unit}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TRIP HISTORY — Real Data */}
          {activeTab === 'history' && (
            <div style={{ background: 'rgba(15,22,50,0.8)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 28, border: '1px solid rgba(125,249,255,0.1)' }}>
              <div className="pc-title">Trip History</div>
              {tripsLoading ? (
                <div className="loading-text">Loading your trips...</div>
              ) : trips.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🗺️</div>
                  <div className="empty-state-text">No trips planned yet</div>
                  <div className="empty-state-sub">Plan your first trip to see it here!</div>
                </div>
              ) : (
                <div className="trip-list">
                  {trips.map((trip, i) => (
                    <div className="trip-item" key={trip._id || i}>
                      <div className="trip-route">{trip.start} → {trip.destination}</div>
                      <div className="trip-meta">
                        <div className="trip-meta-item">📏 <span>{trip.distance?.toFixed(1)} km</span></div>
                        <div className="trip-meta-item">⏱ <span>{trip.duration?.toFixed(1)} hrs</span></div>
                        <div className="trip-meta-item">🔋 <span>{trip.energyUsed?.toFixed(1)} kWh</span></div>
                        <div className="trip-meta-item">⚡ <span>{trip.chargingStops} stops</span></div>
                        <div className="trip-meta-item">🚗 <span>{trip.evModel}</span></div>
                        {trip.createdAt && (
                          <div className="trip-meta-item">📅 <span>{new Date(trip.createdAt).toLocaleDateString('en-IN')}</span></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div style={{ background: 'rgba(15,22,50,0.8)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 28, border: '1px solid rgba(125,249,255,0.1)' }}>
              <div className="pc-title">Achievements & Badges {tripsLoading && '(Loading...)'}</div>
              <div className="ach-grid">
                {evaluatedAchievements.map((a, i) => (
                  <div className={`ach-item ${a.earned ? 'earned' : ''}`} key={i} style={{ opacity: a.earned ? 1 : 0.5 }}>
                    <div className="ach-icon">{a.icon}</div>
                    <div className="ach-title">{a.title}</div>
                    <div className="ach-desc">{a.desc}</div>
                    {!a.earned && <div className="ach-locked">🔒 Not yet earned</div>}
                    {a.earned && <div style={{ color: '#00f5a0', fontSize: '0.65rem', marginTop: 6 }}>✓ Earned</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ background: 'rgba(15,22,50,0.8)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 28, border: '1px solid rgba(125,249,255,0.1)' }}>
              <div className="pc-title">Account Settings</div>
              {[['🔔', 'Push Notifications', 'Charging station alerts & route updates'], ['🌙', 'Dark Mode', 'Always on'], ['🌍', 'Units', 'Metric (km, °C)'], ['🔒', 'Two-Factor Auth', 'Not configured']].map(([icon, t, d]) => (
                <div className="info-row" key={t}>
                  <div className="info-icon">{icon}</div>
                  <div style={{ flex: 1 }}><div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: 2 }}>{t}</div><div style={{ fontSize: '0.78rem', color: 'rgba(232,234,246,0.45)' }}>{d}</div></div>
                  <div style={{ width: 44, height: 24, borderRadius: 999, background: t === 'Dark Mode' ? 'linear-gradient(135deg,#7DF9FF,#59d8de)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: t === 'Dark Mode' ? 'flex-end' : 'flex-start', padding: '0 3px', cursor: 'pointer', transition: 'all .25s', flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px rgba(0,0,0,0.3)' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 28, padding: '18px 20px', background: 'rgba(255,82,82,0.06)', borderRadius: 14, border: '1px solid rgba(255,82,82,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#ff5252', marginBottom: 2 }}>Delete Account</div><div style={{ fontSize: '0.78rem', color: 'rgba(232,234,246,0.4)' }}>Permanently remove your account and all data.</div></div>
                <button style={{ padding: '8px 18px', borderRadius: 999, background: 'rgba(255,82,82,0.1)', color: '#ff5252', border: '1px solid rgba(255,82,82,0.2)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500 }}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
