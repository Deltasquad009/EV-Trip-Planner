import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { getEVModels, planTrip, seedEVModels } from "../services/tripService";
import "../styles/global.css";

// ─── Custom Icons ─────────────────────────────────────────────────────────────
const createSVGIcon = (svgContent, size = [36, 36], anchor = [18, 36]) =>
  L.divIcon({ html: svgContent, className: "", iconSize: size, iconAnchor: anchor });

const startIcon = createSVGIcon(`
  <div style="position:relative;width:36px;height:36px">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(0,229,160,0.2);animation:pulse-ev 1.5s ease-in-out infinite"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:linear-gradient(135deg,#00e5a0,#00c9a7);display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(0,229,160,0.6)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>
    </div>
  </div>
  <style>@keyframes pulse-ev{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.6);opacity:0}}</style>
`);

const endIcon = createSVGIcon(`
  <div style="position:relative;width:36px;height:36px">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(0,188,212,0.2);animation:pulse-ev2 1.8s ease-in-out infinite"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:linear-gradient(135deg,#00bcd4,#0097a7);display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(0,188,212,0.6)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="11" r="3" fill="white"/></svg>
    </div>
  </div>
  <style>@keyframes pulse-ev2{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.7);opacity:0}}</style>
`);

const chargerIcon = createSVGIcon(`
  <div style="position:relative;width:32px;height:32px">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(245,158,11,0.2);animation:pulse-ev3 2s ease-in-out infinite"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(245,158,11,0.5)">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white"/></svg>
    </div>
  </div>
  <style>@keyframes pulse-ev3{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.8);opacity:0}}</style>
`, [32, 32], [16, 32]);

// ─── Map Fly-To ────────────────────────────────────────────────────────────────
function MapFlyTo({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates?.length > 0) {
      const latLngs = coordinates.map(([lng, lat]) => [lat, lng]);
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 13 });
    }
  }, [coordinates, map]);
  return null;
}

function MapFocusController({ focusedLocation }) {
  const map = useMap();
  useEffect(() => {
    if (focusedLocation) {
      map.flyTo(focusedLocation, 15, { duration: 1.2 });
    }
  }, [focusedLocation, map]);
  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TripPlanner() {
  const [evModels, setEvModels] = useState([]);
  const [form, setForm] = useState({ start: "", destination: "", evModelId: "", batteryPercent: 100 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [costRate, setCostRate] = useState(8); // ₹ per kWh
  const [mapLayer, setMapLayer] = useState("dark");
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [activeNavStep, setActiveNavStep] = useState(null);

  useEffect(() => { fetchModels(); }, []);

  const fetchModels = async () => {
    try {
      const models = await getEVModels();
      setEvModels(models);
      if (models.length > 0) setForm(f => ({ ...f, evModelId: models[0]._id }));
    } catch {
      setError("Could not load EV models.");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try { await seedEVModels(); await fetchModels(); }
    catch { setError("Failed to seed EV models."); }
    finally { setSeeding(false); }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode using Nominatim API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error("Failed to fetch address");
          
          const data = await res.json();
          const address = data.address || {};
          const locationName = address.city || address.town || address.village || address.suburb || "Current Location";
          const state = address.state || "";
          const friendlyName = state ? `${locationName}, ${state}` : locationName;
          
          setForm(prev => ({ ...prev, start: friendlyName }));
        } catch (err) {
          console.error("Geocoding failed:", err);
          setForm(prev => ({ ...prev, start: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` }));
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setLocLoading(false);
        setError("Failed to access location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true); setFocusedLocation(null);
    try {
      const data = await planTrip(form);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to plan trip.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const text = `🚗 EV Trip Plan: ${result.start} → ${result.destination}\n📍 Distance: ${result.distance_km} km\n⏱ Duration: ${result.duration_hr} hrs\n🔋 Battery left: ${result.energy.batteryRemaining}%\n⚡ Charging stops: ${result.energy.chargingStops}\nPlanned with EVDrive 🌿`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartNavigation = () => {
    if (!result?.directions?.length) return;
    setActiveNavStep(0);
    const loc = result.directions[0].location;
    if (loc) setFocusedLocation([loc[1], loc[0]]);
  };

  const handleNavNext = () => {
    if (activeNavStep < result.directions.length - 1) {
      const nextStep = activeNavStep + 1;
      setActiveNavStep(nextStep);
      const loc = result.directions[nextStep].location;
      if (loc) setFocusedLocation([loc[1], loc[0]]);
    }
  };

  const handleNavPrev = () => {
    if (activeNavStep > 0) {
      const prevStep = activeNavStep - 1;
      setActiveNavStep(prevStep);
      const loc = result.directions[prevStep].location;
      if (loc) setFocusedLocation([loc[1], loc[0]]);
    }
  };

  const handleNavExit = () => {
    setActiveNavStep(null);
    setFocusedLocation(null);
  };

  const getNavIcon = (step) => {
    if (!step) return "";
    if (step.modifier.includes("left")) return "⬅️";
    if (step.modifier.includes("right")) return "➡️";
    if (step.type === "arrive") return "📍";
    if (step.type === "roundabout") return "🔄";
    return "⬆️";
  };

  const routeCoords = result?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];
  const selectedModel = evModels.find(m => m._id === form.evModelId);
  const chargingCost = result ? (parseFloat(result.energy.totalEnergy) * costRate).toFixed(0) : 0;
  const tollCost = result?.estimatedTolls || 0;
  const totalCost = result ? (parseInt(chargingCost) + parseInt(tollCost)).toLocaleString("en-IN") : null;

  const batteryColor = (pct) => {
    if (pct >= 60) return "#00e5a0";
    if (pct >= 30) return "#ffb74d";
    return "#ff4d4d";
  };

  const sliderBg = () => {
    const pct = form.batteryPercent;
    if (pct >= 60) return "#00e5a0";
    if (pct >= 30) return "#ffb74d";
    return "#ff4d4d";
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.layout}>
        {/* ── LEFT PANEL ─────────────────────────────────────────── */}
        <div style={s.panel}>
          {/* Form Card */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>
              <span style={s.cardTitleIcon}>🗺️</span> Plan Your Trip
            </h2>

            {evModels.length === 0 && (
              <div style={s.seedBox}>
                <p style={s.seedText}>No EV models found. Seed to get started.</p>
                <button onClick={handleSeed} disabled={seeding} style={s.seedBtn}>
                  {seeding ? "⏳ Seeding..." : "🌱 Seed EV Models"}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={s.form}>
              {/* Start */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Starting Location</label>
                <div style={s.inputWrap}>
                  <span style={{ ...s.inputDot, background: "#00e5a0" }} />
                  <input name="start" value={form.start} onChange={handleChange}
                    placeholder="e.g., Bangalore" required style={{...s.input, paddingRight: "44px"}} />
                  <button 
                    type="button" 
                    onClick={handleGetLocation} 
                    title="Use Current Location"
                    disabled={locLoading}
                    style={{
                      position: "absolute", right: "6px", background: "rgba(0,229,160,0.1)", 
                      border: "1px solid rgba(0,229,160,0.3)", borderRadius: "6px",
                      cursor: locLoading ? "wait" : "pointer", 
                      fontSize: "1rem", padding: "4px 6px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {locLoading ? <span style={{fontSize: "0.8rem", animation: "spin 1s linear infinite"}}>⏳</span> : "📍"}
                  </button>
                </div>
              </div>

              {/* Destination */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Destination</label>
                <div style={s.inputWrap}>
                  <span style={{ ...s.inputDot, background: "#00bcd4" }} />
                  <input name="destination" value={form.destination} onChange={handleChange}
                    placeholder="e.g., Mysore" required style={s.input} />
                </div>
              </div>

              {/* EV Model */}
              <div style={s.fieldGroup}>
                <label style={s.label}>EV Model</label>
                <select name="evModelId" value={form.evModelId} onChange={handleChange}
                  required style={s.input}>
                  {evModels.map(m => (
                    <option key={m._id} value={m._id}>{m.name} — {m.batteryCapacity} kWh</option>
                  ))}
                </select>
              </div>

              {/* EV Specs */}
              {selectedModel && (
                <div style={s.specsRow}>
                  <div style={s.specChip}>🔋 {selectedModel.batteryCapacity} kWh</div>
                  <div style={s.specChip}>⚡ {selectedModel.efficiency} Wh/km</div>
                  <div style={s.specChip}>🛣️ ~{selectedModel.range} km</div>
                </div>
              )}

              {/* Battery Slider */}
              <div style={s.fieldGroup}>
                <div style={s.sliderHeader}>
                  <label style={s.label}>Current Battery</label>
                  <span style={{ ...s.sliderVal, color: sliderBg() }}>
                    {form.batteryPercent}%
                  </span>
                </div>
                <div style={s.sliderTrack}>
                  <div style={{
                    ...s.sliderFill,
                    width: `${form.batteryPercent}%`,
                    background: `linear-gradient(90deg, ${form.batteryPercent < 30 ? "#ff4d4d, #ff944d" : form.batteryPercent < 60 ? "#ffb74d, #ffd54f" : "#00c9a7, #00e5a0"})`,
                  }} />
                </div>
                <input name="batteryPercent" type="range" min="10" max="100" step="5"
                  value={form.batteryPercent} onChange={handleChange} style={s.slider} />
              </div>

              {/* Cost Rate */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Electricity Rate (₹/kWh)</label>
                <input type="number" value={costRate} min="1" max="30" step="0.5"
                  onChange={e => setCostRate(parseFloat(e.target.value))} style={s.input} />
              </div>

              {error && <div style={s.errorBox}>⚠️ {error}</div>}

              <button type="submit" disabled={loading || evModels.length === 0} style={s.btn}>
                {loading ? (
                  <><span style={s.spinner} />Calculating Route...</>
                ) : (
                  <>⚡ Plan Trip</>
                )}
              </button>
            </form>
          </div>

          {/* Results Card */}
          {result && (
            <div style={s.resultsCard}>
              {/* Header with share */}
              <div style={s.resultsHeader}>
                <h2 style={s.cardTitle}>
                  <span style={s.cardTitleIcon}>📊</span> Trip Results
                </h2>
                <button onClick={handleShare} style={s.shareBtn}>
                  {copied ? "✓ Copied!" : "📋 Share"}
                </button>
              </div>

              {/* Stats Grid */}
              <div style={s.resultGrid}>
                {[
                  { label: "Distance", value: `${result.distance_km} km`, icon: "📍" },
                  { label: "Duration", value: `${result.duration_hr} hrs`, icon: "⏱" },
                  { label: "Energy Used", value: `${result.energy.totalEnergy} kWh`, icon: "⚡" },
                  { label: "Total Cost", value: `₹${totalCost}`, icon: "💰", highlight: true },
                  { label: "Battery Left", value: `${result.energy.batteryRemaining}%`, icon: "🔋",
                    color: batteryColor(result.energy.batteryRemaining) },
                  { label: "Charge Stops", value: result.energy.chargingStops, icon: "🔌" },
                ].map((item, i) => (
                  <div key={i} style={s.resultItem}>
                    <div style={s.resultIcon}>{item.icon}</div>
                    <div style={s.resultLabel}>{item.label}</div>
                    <div style={{ ...s.resultValue, color: item.color || (item.highlight ? "#f59e0b" : "#00e5a0") }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Battery Bar */}
              <div style={s.batterySection}>
                <div style={s.batteryHeader}>
                  <span style={s.batteryLabel}>Battery Remaining After Trip</span>
                  <span style={{ ...s.batteryPct, color: batteryColor(result.energy.batteryRemaining) }}>
                    {result.energy.batteryRemaining}%
                  </span>
                </div>
                <div style={s.batteryTrack}>
                  <div style={{
                    ...s.batteryFill,
                    width: `${Math.max(result.energy.batteryRemaining, 0)}%`,
                    background: result.energy.batteryRemaining < 15
                      ? "linear-gradient(90deg,#ff4d4d,#ff944d)"
                      : "linear-gradient(90deg,#00c9a7,#00e5a0)",
                  }} />
                </div>
              </div>

              {/* Detailed Cost Breakdown */}
              <div style={s.breakdown}>
                <div style={s.breakdownTitle}>💳 Detailed Cost Estimate</div>
                <div style={s.breakdownRow}>
                  <span>⚡ Charging Cost ({costRate} ₹/kWh)</span>
                  <span style={s.breakdownVal}>₹{(parseFloat(chargingCost)).toLocaleString("en-IN")}</span>
                </div>
                <div style={s.breakdownRow}>
                  <span>🛣️ Estimated Highway Tolls</span>
                  <span style={s.breakdownVal}>₹{(parseFloat(tollCost)).toLocaleString("en-IN")}</span>
                </div>
                <div style={{...s.breakdownRow, borderBottom: "none", paddingTop: "8px", marginTop: "4px", borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                  <span style={{color: "#00e5a0", fontWeight: 700}}>Total Trip Cost</span>
                  <span style={{color: "#00e5a0", fontWeight: 800, fontSize: "0.95rem"}}>₹{totalCost}</span>
                </div>
              </div>

              {/* Charging Timeline */}
              {result.chargingStations?.length > 0 && (
                <div style={s.timeline}>
                  <div style={{...s.timelineTitle, display: "flex", justifyContent: "space-between"}}>
                    <span>⚡ Charging Journey</span>
                    {focusedLocation && (
                      <button 
                        onClick={() => setFocusedLocation(null)}
                        style={s.resetMapBtn}
                      >
                        🔄 Reset Map
                      </button>
                    )}
                  </div>
                  <div style={s.timelineSteps}>
                    <div style={s.tlStep}>
                      <div style={{ ...s.tlDot, background: "#00e5a0" }} />
                      <div style={s.tlText} onClick={() => {
                        const [lng, lat] = result.coordinates[0];
                        setFocusedLocation([lat, lng]);
                      }}>
                        <span style={{...s.tlMain, cursor: "pointer"}}>🚗 Start: {result.start}</span>
                        <span style={s.tlSub}>Battery: {form.batteryPercent}%</span>
                      </div>
                    </div>
                    {result.chargingStations.map((station, i) => {
                      const isOffline = station.status === "Offline";
                      const statusColor = station.status === "Available" ? "#00e5a0" : station.status === "Occupied" ? "#f59e0b" : "#ff4d4d";
                      const statusBg = station.status === "Available" ? "rgba(0,229,160,0.15)" : station.status === "Occupied" ? "rgba(245,158,11,0.15)" : "rgba(255,77,77,0.15)";
                      const statusIcon = station.status === "Available" ? "🟢" : station.status === "Occupied" ? "🟠" : "🔴";

                      return (
                        <div key={i} style={{...s.tlStep, opacity: isOffline ? 0.6 : 1}}>
                          <div style={s.tlLine} />
                          <div style={{ ...s.tlDot, background: isOffline ? "#5a6b7c" : "#f59e0b" }} />
                          <div style={s.tlText} onClick={() => setFocusedLocation([station.lat, station.lng])}>
                            <span style={{
                              ...s.tlMain, 
                              cursor: "pointer", 
                              color: focusedLocation?.[0] === station.lat ? "#f59e0b" : (isOffline ? "#7a9bbf" : "#e0e8f0"),
                              textDecoration: isOffline ? "line-through" : "none"
                            }}>
                              🔌 {station.name}
                            </span>
                            <span style={s.tlSub}>
                              {station.power} • {station.connectorType}
                              {station.status && (
                                <span style={{
                                  marginLeft: "8px", padding: "2px 6px", borderRadius: "4px",
                                  fontSize: "0.65rem", fontWeight: "bold",
                                  background: statusBg, color: statusColor,
                                  textDecoration: "none", display: "inline-block"
                                }}>
                                  {statusIcon} {station.status}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    <div style={s.tlStep}>
                      <div style={s.tlLine} />
                      <div style={{ ...s.tlDot, background: "#00bcd4" }} />
                      <div style={s.tlText} onClick={() => {
                        const [lng, lat] = result.coordinates[result.coordinates.length - 1];
                        setFocusedLocation([lat, lng]);
                      }}>
                        <span style={{...s.tlMain, cursor: "pointer"}}>🏁 Arrive: {result.destination}</span>
                        <span style={s.tlSub}>Battery: {result.energy.batteryRemaining}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Turn-by-Turn Navigation */}
              {result.directions?.length > 0 && (
                <div style={s.directionsContainer}>
                  <div 
                    style={s.directionsHeader} 
                    onClick={() => setShowDirections(!showDirections)}
                  >
                    <span>🧭 Turn-by-Turn Directions</span>
                    <span>{showDirections ? "▲" : "▼"}</span>
                  </div>
                  
                  {showDirections && (
                    <div style={s.directionsList}>
                      <button onClick={handleStartNavigation} style={s.startNavBtn}>
                        🚗 Start Driving Mode
                      </button>
                      {result.directions.map((step, i) => (
                        <div key={i} style={s.dirStep}>
                          <div style={s.dirIcon}>{getNavIcon(step)}</div>
                          <div style={s.dirText}>
                            <div style={s.dirInstruction}>{step.instruction}</div>
                            {step.distance_km > 0 && (
                              <div style={s.dirDistance}>{step.distance_km} km</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Energy Breakdown */}
              <div style={s.breakdown}>
                <div style={s.breakdownTitle}>🔬 Energy Breakdown</div>
                {[
                  ["Base Consumption", `${result.energy.baseEnergy} kWh`],
                  ["Elevation Penalty", `${result.energy.elevationPenalty} kWh`],
                  [`Weather (+${result.energy.weatherFactor}%)`, `${result.energy.weatherPenalty} kWh`],
                ].map(([k, v], i) => (
                  <div key={i} style={s.breakdownRow}>
                    <span>{k}</span><span style={s.breakdownVal}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Weather */}
              {result.weather && (
                <div style={s.weatherCard}>
                  <div style={s.breakdownTitle}>🌤️ Weather at Origin</div>
                  {[
                    ["Temperature", `${result.weather.temperature}°C`],
                    ["Wind Speed", `${result.weather.windSpeed_kmh} km/h`],
                    ["Condition", result.weather.description],
                  ].map(([k, v], i) => (
                    <div key={i} style={s.breakdownRow}>
                      <span>{k}</span><span style={s.breakdownVal}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Charging Stations List */}
              {result.chargingStations?.length > 0 && (
                <div style={s.stationsList}>
                  <div style={s.breakdownTitle}>🔌 Nearby Charging Stations</div>
                  {result.chargingStations.map((s2, i) => (
                    <div key={i} style={s.stationCard}>
                      <div style={s.stationName}>📍 {s2.name}</div>
                      <div style={s.stationMeta}>
                        <span style={s.stationChip}>{s2.power}</span>
                        <span style={s.stationChip}>{s2.connectorType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.energy.needsCharging && result.chargingStations?.length === 0 && (
                <div style={s.warnBox}>
                  ⚠️ Charging needed but no stations found. Add an OpenChargeMap API key for live station data.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MAP PANEL ──────────────────────────────────────────── */}
        <div style={s.mapWrapper}>
          {activeNavStep !== null && result?.directions && (
            <div style={s.navOverlay}>
              <div style={s.navTopBar}>
                <div style={s.navIconTop}>{getNavIcon(result.directions[activeNavStep])}</div>
                <div style={s.navInfoTop}>
                  <div style={s.navDistTop}>{result.directions[activeNavStep].distance_km} km</div>
                  <div style={s.navInstTop}>{result.directions[activeNavStep].instruction}</div>
                </div>
              </div>
              <div style={s.navControls}>
                <button style={s.navBtn} onClick={handleNavPrev} disabled={activeNavStep === 0}>◀ Prev</button>
                <button style={s.navBtnExit} onClick={handleNavExit}>Exit</button>
                <button style={s.navBtn} onClick={handleNavNext} disabled={activeNavStep === result.directions.length - 1}>Next ▶</button>
              </div>
            </div>
          )}

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            minZoom={3}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%", background: "transparent" }}
            zoomControl={false}
          >
            {/* Dynamic tile layer based on selected map style */}
            {mapLayer === "dark" && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                noWrap={true}
              />
            )}
            {mapLayer === "satellite" && (
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a>, Maxar, GeoEye, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                noWrap={true}
              />
            )}
            {mapLayer === "street" && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                noWrap={true}
              />
            )}
            {mapLayer === "terrain" && (
              <TileLayer
                attribution='Map data &copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                noWrap={true}
              />
            )}

            {routeCoords.length > 0 && (
              <>
                <MapFlyTo coordinates={result.coordinates} />
                <MapFocusController focusedLocation={focusedLocation} />

                {/* Glow shadow polyline */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: "rgba(0,229,160,0.2)", weight: 14, opacity: 1 }}
                />
                {/* Main route polyline */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: "#00e5a0", weight: 4, opacity: 0.95, lineCap: "round", lineJoin: "round" }}
                />

                {/* Start marker */}
                <Marker position={routeCoords[0]} icon={startIcon}>
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", color: "#0a0f1e" }}>
                      <strong>🚗 Start</strong><br />
                      {result.start}
                    </div>
                  </Popup>
                </Marker>

                {/* End marker */}
                <Marker position={routeCoords[routeCoords.length - 1]} icon={endIcon}>
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", color: "#0a0f1e" }}>
                      <strong>🏁 Destination</strong><br />
                      {result.destination}<br />
                      <span style={{ color: "#00e5a0", fontWeight: 600 }}>
                        Battery: {result.energy.batteryRemaining}%
                      </span>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Charging stations */}
            {result?.chargingStations?.map((st, i) =>
              st.lat && st.lng ? (
                <Marker key={i} position={[st.lat, st.lng]} icon={chargerIcon}>
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", color: "#0a0f1e" }}>
                      <strong>⚡ {st.name}</strong><br />
                      Power: {st.power}<br />
                      Connector: {st.connectorType}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>

          {/* Map Overlays */}
          {!result && (
            <div style={s.mapOverlay}>
              <div style={s.mapOverlayBox}>
                <div style={s.mapOverlayIcon}>🗺️</div>
                <div style={s.mapOverlayTitle}>Ready to Navigate</div>
                <div style={s.mapOverlayText}>Enter your trip details to see the optimized route here</div>
              </div>
            </div>
          )}

          {/* Route Info Badge (when result is available) */}
          {result && (
            <div style={s.routeBadge}>
              <div style={s.routeBadgeItem}>
                <span style={s.routeBadgeVal}>{result.distance_km} km</span>
                <span style={s.routeBadgeLabel}>Distance</span>
              </div>
              <div style={s.routeBadgeDivider} />
              <div style={s.routeBadgeItem}>
                <span style={s.routeBadgeVal}>{result.duration_hr} hrs</span>
                <span style={s.routeBadgeLabel}>Duration</span>
              </div>
              <div style={s.routeBadgeDivider} />
              <div style={s.routeBadgeItem}>
                <span style={{ ...s.routeBadgeVal, color: batteryColor(result.energy.batteryRemaining) }}>
                  {result.energy.batteryRemaining}%
                </span>
                <span style={s.routeBadgeLabel}>Battery Left</span>
              </div>
            </div>
          )}

          {/* Map Layer Toggle */}
          <div style={s.layerToggle}>
            {[
              { id: "dark",      icon: "🌑", label: "Dark" },
              { id: "satellite", icon: "🛰️", label: "Satellite" },
              { id: "street",    icon: "🗺️", label: "Street" },
              { id: "terrain",   icon: "⛰️", label: "Terrain" },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setMapLayer(layer.id)}
                style={{
                  ...s.layerBtn,
                  ...(mapLayer === layer.id ? s.layerBtnActive : {}),
                }}
                title={layer.label}
              >
                <span style={s.layerBtnIcon}>{layer.icon}</span>
                <span style={s.layerBtnLabel}>{layer.label}</span>
              </button>
            ))}
          </div>

          {/* Map Legend */}
          <div style={s.legend}>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#00e5a0" }} /> Route</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#00e5a0", boxShadow: "0 0 6px #00e5a0" }} /> Start</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#00bcd4", boxShadow: "0 0 6px #00bcd4" }} /> End</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }} /> Charger</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#070d1a 0%,#0a0f1e 50%,#080d1c 100%)",
    color: "#e0e8f0",
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  layout: {
    display: "flex",
    gap: "20px",
    padding: "80px 20px 24px",
    maxWidth: "1500px",
    margin: "0 auto",
    height: "calc(100vh - 20px)",
  },
  panel: {
    width: "400px",
    flexShrink: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    paddingRight: "4px",
    scrollbarWidth: "thin",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(0,229,160,0.12)",
    borderRadius: "18px",
    padding: "22px",
    backdropFilter: "blur(12px)",
  },
  resultsCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(0,229,160,0.12)",
    borderRadius: "18px",
    padding: "22px",
    backdropFilter: "blur(12px)",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#00e5a0",
    margin: "0 0 18px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cardTitleIcon: { fontSize: "1.1rem" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#7ab8d4",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
  },
  inputWrap: { position: "relative", display: "flex", alignItems: "center", gap: "0" },
  inputDot: {
    position: "absolute",
    left: "12px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "10px 14px 10px 30px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(0,229,160,0.15)",
    borderRadius: "10px",
    color: "#e0e8f0",
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "'Inter',sans-serif",
    boxSizing: "border-box",
  },
  specsRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  specChip: {
    background: "rgba(0,229,160,0.07)",
    border: "1px solid rgba(0,229,160,0.15)",
    borderRadius: "100px",
    padding: "5px 12px",
    fontSize: "0.76rem",
    color: "#00e5a0",
    fontWeight: 600,
  },
  sliderHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sliderVal: { fontSize: "0.9rem", fontWeight: 700 },
  sliderTrack: {
    height: "6px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "100px",
    overflow: "hidden",
    margin: "6px 0",
  },
  sliderFill: { height: "100%", borderRadius: "100px", transition: "width 0.3s ease" },
  slider: { width: "100%", accentColor: "#00e5a0", cursor: "pointer", margin: "0" },
  seedBox: {
    background: "rgba(255,200,0,0.06)",
    border: "1px solid rgba(255,200,0,0.18)",
    borderRadius: "10px",
    padding: "14px",
    textAlign: "center",
    marginBottom: "14px",
  },
  seedText: { color: "#ffd700", fontSize: "0.83rem", margin: "0 0 10px" },
  seedBtn: {
    background: "linear-gradient(135deg,#f7971e,#ffd200)",
    border: "none", borderRadius: "8px",
    padding: "8px 20px", color: "#000",
    fontWeight: 700, fontSize: "0.83rem", cursor: "pointer",
  },
  errorBox: {
    background: "rgba(255,77,77,0.1)",
    border: "1px solid rgba(255,77,77,0.25)",
    borderRadius: "8px", padding: "10px 14px",
    color: "#ff7070", fontSize: "0.83rem",
  },
  btn: {
    marginTop: "6px",
    background: "linear-gradient(135deg,#00c9a7,#00bcd4)",
    border: "none", borderRadius: "12px",
    padding: "13px", color: "#000",
    fontWeight: 800, fontSize: "0.95rem",
    cursor: "pointer", letterSpacing: "0.3px",
    transition: "all 0.25s ease",
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px",
    fontFamily: "'Inter',sans-serif",
  },
  spinner: {
    width: "16px", height: "16px",
    border: "2px solid rgba(0,0,0,0.3)",
    borderTop: "2px solid #000",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  // Results
  resultsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  shareBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "6px 14px",
    color: "#a0b8c8",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Inter',sans-serif",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "16px",
  },
  resultItem: {
    background: "rgba(0,229,160,0.04)",
    borderRadius: "12px",
    padding: "12px",
    border: "1px solid rgba(0,229,160,0.1)",
  },
  resultIcon: { fontSize: "1rem", marginBottom: "4px" },
  resultLabel: { fontSize: "0.68rem", color: "#7ab8d4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" },
  resultValue: { fontSize: "1.1rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif" },
  batterySection: { marginBottom: "16px" },
  batteryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  batteryLabel: { fontSize: "0.75rem", color: "#7ab8d4", fontWeight: 600 },
  batteryPct: { fontSize: "0.88rem", fontWeight: 800 },
  batteryTrack: {
    height: "10px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "100px",
    overflow: "hidden",
  },
  batteryFill: { height: "100%", borderRadius: "100px", transition: "width 0.8s ease" },
  // Timeline
  timeline: {
    background: "rgba(245,158,11,0.04)",
    border: "1px solid rgba(245,158,11,0.12)",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "12px",
  },
  timelineTitle: { fontSize: "0.8rem", fontWeight: 700, color: "#f59e0b", marginBottom: "14px" },
  resetMapBtn: { 
    background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.3)", 
    borderRadius: "6px", color: "#00e5a0", fontSize: "0.7rem", fontWeight: 600, 
    padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" 
  },
  timelineSteps: { display: "flex", flexDirection: "column", gap: "0" },
  tlStep: { display: "flex", alignItems: "flex-start", gap: "12px", paddingBottom: "12px", position: "relative" },
  tlLine: {
    position: "absolute", left: "7px", top: "-12px",
    width: "2px", height: "12px",
    background: "rgba(255,255,255,0.1)",
  },
  tlDot: { width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0, marginTop: "2px" },
  tlText: { display: "flex", flexDirection: "column", gap: "2px" },
  tlMain: { fontSize: "0.83rem", fontWeight: 600, color: "#e0e8f0" },
  tlSub: { fontSize: "0.73rem", color: "#7a9bbf" },
  // Breakdown
  breakdown: {
    background: "rgba(255,255,255,0.02)",
    borderRadius: "10px", padding: "12px", marginBottom: "10px",
  },
  weatherCard: {
    background: "rgba(0,188,212,0.04)",
    border: "1px solid rgba(0,188,212,0.12)",
    borderRadius: "10px", padding: "12px", marginBottom: "10px",
  },
  breakdownTitle: { fontSize: "0.78rem", fontWeight: 700, color: "#00bcd4", marginBottom: "10px" },
  breakdownRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: "0.8rem", color: "#a0b8c8",
    padding: "5px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  breakdownVal: { color: "#e0e8f0", fontWeight: 600 },
  stationsList: {
    background: "rgba(0,229,160,0.04)",
    border: "1px solid rgba(0,229,160,0.12)",
    borderRadius: "10px", padding: "12px",
  },
  stationCard: { padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  stationName: { fontSize: "0.83rem", fontWeight: 600, color: "#e0e8f0", marginBottom: "4px" },
  stationMeta: { display: "flex", gap: "6px" },
  stationChip: {
    background: "rgba(0,229,160,0.08)",
    border: "1px solid rgba(0,229,160,0.15)",
    borderRadius: "100px",
    padding: "2px 10px",
    fontSize: "0.7rem", color: "#00e5a0", fontWeight: 600,
  },
  warnBox: {
    background: "rgba(255,167,38,0.08)",
    border: "1px solid rgba(255,167,38,0.2)",
    borderRadius: "8px", padding: "10px 14px",
    color: "#ffb74d", fontSize: "0.8rem",
  },
  // Map
  mapWrapper: {
    flex: 1,
    height: "100%",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(0,229,160,0.15)",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,229,160,0.1)",
  },
  mapOverlay: {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, pointerEvents: "none",
    background: "rgba(7,13,26,0.2)",
  },
  mapOverlayBox: {
    background: "rgba(7,13,26,0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0,229,160,0.2)",
    borderRadius: "16px",
    padding: "28px 36px",
    textAlign: "center",
  },
  mapOverlayIcon: { fontSize: "2.5rem", marginBottom: "12px" },
  mapOverlayTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#e0e8f0", marginBottom: "6px" },
  mapOverlayText: { fontSize: "0.85rem", color: "#7a9bbf" },
  routeBadge: {
    position: "absolute", top: "16px", right: "16px",
    background: "rgba(7,13,26,0.88)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0,229,160,0.2)",
    borderRadius: "12px",
    padding: "10px 18px",
    display: "flex", gap: "0",
    alignItems: "center",
    zIndex: 1000,
  },
  routeBadgeItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: "0 14px", gap: "2px" },
  routeBadgeVal: { fontSize: "1rem", fontWeight: 800, color: "#00e5a0", fontFamily: "'Outfit',sans-serif" },
  routeBadgeLabel: { fontSize: "0.65rem", color: "#7a9bbf", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 },
  routeBadgeDivider: { width: "1px", height: "30px", background: "rgba(255,255,255,0.1)" },
  legend: {
    position: "absolute", bottom: "24px", left: "16px",
    background: "rgba(7,13,26,0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
    display: "flex", flexDirection: "column", gap: "6px",
    zIndex: 1000,
  },
  legendItem: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.73rem", color: "#a0b8c8", fontWeight: 500 },
  legendDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  // Directions
  directionsContainer: {
    background: "rgba(255,255,255,0.02)", borderRadius: "10px", marginTop: "10px", padding: "0"
  },
  directionsHeader: {
    padding: "12px", cursor: "pointer", display: "flex", justifyContent: "space-between",
    color: "#00e5a0", fontWeight: "bold", border: "1px solid rgba(0,229,160,0.1)", borderRadius: "10px",
    background: "rgba(0,229,160,0.05)", transition: "all 0.2s"
  },
  directionsList: {
    maxHeight: "350px", overflowY: "auto", padding: "8px 16px", marginTop: "4px"
  },
  dirStep: {
    display: "flex", alignItems: "flex-start", gap: "10px", borderBottom: "1px dashed rgba(255,255,255,0.05)",
    padding: "10px 0"
  },
  dirIcon: {
    fontSize: "1.1rem"
  },
  dirText: {
    display: "flex", flexDirection: "column", gap: "2px"
  },
  dirInstruction: {
    color: "#e0e8f0", fontSize: "0.85rem", lineHeight: "1.3"
  },
  dirDistance: {
    color: "#7a9bbf", fontSize: "0.75rem", fontWeight: "bold"
  },
  startNavBtn: {
    width: "100%", padding: "12px", background: "rgba(0,229,160,0.15)", color: "#00e5a0",
    border: "1px solid rgba(0,229,160,0.4)", borderRadius: "8px", fontWeight: "bold",
    cursor: "pointer", marginBottom: "10px", transition: "all 0.2s"
  },
  // Active Navigation Overlay
  navOverlay: {
    position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", width: "90%", maxWidth: "450px",
    background: "rgba(10,18,34,0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,229,160,0.4)",
    borderRadius: "16px", zIndex: 2000, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
  },
  navTopBar: {
    display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px",
    background: "linear-gradient(135deg, rgba(0,229,160,0.1) 0%, rgba(0,188,212,0.05) 100%)",
    borderBottom: "1px solid rgba(255,255,255,0.05)"
  },
  navIconTop: {
    fontSize: "2.5rem", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px"
  },
  navInfoTop: { display: "flex", flexDirection: "column", gap: "4px" },
  navDistTop: { fontSize: "1.2rem", fontWeight: "800", color: "#00bcd4" },
  navInstTop: { fontSize: "1.1rem", color: "#fff", lineHeight: "1.3", fontWeight: "500" },
  navControls: {
    display: "flex", justifyContent: "space-between", padding: "12px 20px", gap: "10px",
    background: "rgba(0,0,0,0.2)"
  },
  navBtn: {
    padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "600", transition: "all 0.2s",
    flex: 1
  },
  navBtnExit: {
    padding: "8px 16px", background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.3)",
    borderRadius: "8px", color: "#ff4d4d", cursor: "pointer", fontWeight: "bold",
  },
  // Map layer toggle
  layerToggle: {
    position: "absolute",
    bottom: "24px",
    right: "16px",
    display: "flex",
    gap: "6px",
    zIndex: 1000,
    background: "rgba(7,13,26,0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "6px",
  },
  layerBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  },
  layerBtnActive: {
    background: "rgba(0,229,160,0.12)",
    border: "1px solid rgba(0,229,160,0.35)",
    boxShadow: "0 0 10px rgba(0,229,160,0.15)",
  },
  layerBtnIcon: { fontSize: "1rem", lineHeight: 1 },
  layerBtnLabel: { fontSize: "0.62rem", color: "#a0b8c8", fontWeight: 600, letterSpacing: "0.3px" },
};
