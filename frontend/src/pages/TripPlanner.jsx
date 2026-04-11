import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { getEVModels, planTrip, seedEVModels, reverseGeocode } from "../services/tripService";
import "../styles/global.css";

// ─── Map Icons (Tesla-style: clean dots, no glow) ─────────────────────────────
// ─── Map Icons (Tesla-style: clean dots, no glow) ─────────────────────────────
const createIcon = (color, size = 14) =>
  L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #0B0B0B;box-shadow:0 0 0 2px ${color}40;"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const startIcon = createIcon("#FFFFFF", 16);
const endIcon = createIcon("#FFFFFF", 16);

// Highly visible pulsing charger icon with lightning bolt
const chargerIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#22C55E;border:3px solid #0B0B0B;box-shadow:0 0 10px #22C55E;display:flex;align-items:center;justify-content:center;">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
           </svg>
         </div>`,
  className: "marker-glow-amber",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// ─── Map Controllers ───────────────────────────────────────────────────────────
function MapFlyTo({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates?.length > 0) {
      const latLngs = coordinates.map(([lng, lat]) => [lat, lng]);
      map.fitBounds(L.latLngBounds(latLngs), { padding: [80, 80], maxZoom: 13 });
    }
  }, [coordinates, map]);
  return null;
}

function MapFocusController({ focusedLocation }) {
  const map = useMap();
  useEffect(() => {
    if (focusedLocation) map.flyTo(focusedLocation, 15, { duration: 1 });
  }, [focusedLocation, map]);
  return null;
}

// ─── Battery state helper ──────────────────────────────────────────────────────
const batteryState = (pct) => {
  if (pct >= 30) return { color: null, label: "Safe" };
  if (pct >= 15) return { color: "#F59E0B", label: "Warning" };
  return { color: "#EF4444", label: "Critical" };
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TripPlanner() {
  const [evModels, setEvModels] = useState([]);
  const [form, setForm] = useState({ start: "", destination: "", evModelId: "", batteryPercent: 100 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [costRate, setCostRate] = useState(8);
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [activeNavStep, setActiveNavStep] = useState(null);
  const [activePanel, setActivePanel] = useState("plan"); // "plan" | "results"
  const [mapStyle, setMapStyle] = useState("dark"); // "dark" | "satellite" | "streets"

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
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setLocLoading(true); setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await reverseGeocode(latitude, longitude);
          setForm(prev => ({ ...prev, start: data.address }));
        } catch {
          setForm(prev => ({ ...prev, start: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` }));
        } finally { setLocLoading(false); }
      },
      (err) => {
        setLocLoading(false);
        if (err.code === 1) setError("Location access denied.");
        else if (err.code === 2) setError("Location unavailable.");
        else setError("Location request timed out.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.batteryPercent <= 20) { setError("Battery too low to plan this trip."); return; }
    setError(""); setResult(null); setLoading(true); setFocusedLocation(null);
    try {
      const data = await planTrip(form);
      setResult(data);
      setActivePanel("results");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to plan trip.");
    } finally { setLoading(false); }
  };

  const handleShare = () => {
    if (!result) return;
    const text = `EV Trip: ${result.start} → ${result.destination}\nDistance: ${result.distance_km} km\nBattery at arrival: ${result.energy.batteryRemaining}%`;
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
      const next = activeNavStep + 1;
      setActiveNavStep(next);
      const loc = result.directions[next].location;
      if (loc) setFocusedLocation([loc[1], loc[0]]);
    }
  };

  const handleNavPrev = () => {
    if (activeNavStep > 0) {
      const prev = activeNavStep - 1;
      setActiveNavStep(prev);
      const loc = result.directions[prev].location;
      if (loc) setFocusedLocation([loc[1], loc[0]]);
    }
  };

  const getNavIcon = (step) => {
    if (!step) return "↑";
    if (step.modifier?.includes("left")) return "←";
    if (step.modifier?.includes("right")) return "→";
    if (step.type === "arrive") return "●";
    return "↑";
  };

  const routeCoords = result?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];
  const selectedModel = evModels.find(m => m._id === form.evModelId);
  const chargingCost = result ? (parseFloat(result.energy.totalEnergy) * costRate).toFixed(0) : 0;
  const tollCost = result?.estimatedTolls || 0;
  const totalCost = result ? (parseInt(chargingCost) + parseInt(tollCost)).toLocaleString("en-IN") : null;
  const arrivalBattery = result?.energy?.batteryRemaining ?? null;
  const arrivalState = arrivalBattery !== null ? batteryState(arrivalBattery) : null;
  const sliderState = batteryState(form.batteryPercent);

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.layout}>

        {/* ── LEFT PANEL ──────────────────────────────────────────── */}
        <div style={s.leftPanel}>

          {/* Panel Tab Switch */}
          {result && (
            <div style={s.tabRow}>
              <button style={{ ...s.tabBtn, ...(activePanel === "plan" ? s.tabBtnActive : {}) }} onClick={() => setActivePanel("plan")}>Plan</button>
              <button style={{ ...s.tabBtn, ...(activePanel === "results" ? s.tabBtnActive : {}) }} onClick={() => setActivePanel("results")}>Results</button>
            </div>
          )}

          {/* ── PLAN PANEL ─────────────────────────────────────── */}
          {activePanel === "plan" && (
            <div style={s.planPanel}>
              <div style={s.planHeader}>
                <p style={s.panelEyebrow}>Trip Settings</p>
                <h2 style={s.panelTitle}>Plan Your Route</h2>
              </div>

              {evModels.length === 0 && (
                <div style={s.seedBox}>
                  <p style={s.seedText}>No EV models found.</p>
                  <button onClick={handleSeed} disabled={seeding} style={s.seedBtn}>
                    {seeding ? "Loading..." : "Load EV Models"}
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} style={s.form}>
                {/* Origin */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Origin</label>
                  <div style={s.inputRow}>
                    <input name="start" value={form.start} onChange={handleChange}
                      placeholder="e.g., Bangalore" required style={s.input} />
                    <button type="button" onClick={handleGetLocation} disabled={locLoading}
                      style={s.locBtn} title="Use current location">
                      {locLoading ? <span style={s.spinner} /> : "◎"}
                    </button>
                  </div>
                </div>

                {/* Destination */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Destination</label>
                  <input name="destination" value={form.destination} onChange={handleChange}
                    placeholder="e.g., Mysore" required style={s.input} />
                </div>

                {/* EV Model */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Vehicle</label>
                  <select name="evModelId" value={form.evModelId} onChange={handleChange} required style={s.input}>
                    {evModels.map(m => (
                      <option key={m._id} value={m._id}>{m.name} — {m.batteryCapacity} kWh</option>
                    ))}
                  </select>
                </div>

                {/* EV Specs */}
                {selectedModel && (
                  <div style={s.specsRow}>
                    <div style={s.spec}><span style={s.specVal}>{selectedModel.batteryCapacity}</span><span style={s.specLabel}>kWh</span></div>
                    <div style={s.specDivider} />
                    <div style={s.spec}><span style={s.specVal}>{selectedModel.efficiency}</span><span style={s.specLabel}>Wh/km</span></div>
                    <div style={s.specDivider} />
                    <div style={s.spec}><span style={s.specVal}>~{selectedModel.range}</span><span style={s.specLabel}>km range</span></div>
                  </div>
                )}

                {/* Battery Slider */}
                <div style={s.fieldGroup}>
                  <div style={s.sliderHeader}>
                    <label style={s.label}>Current Battery</label>
                    <span style={{ ...s.sliderVal, color: sliderState.color || "#FFFFFF" }}>{form.batteryPercent}%</span>
                  </div>
                  <div style={s.sliderTrack}>
                    <div style={{
                      ...s.sliderFill,
                      width: `${form.batteryPercent}%`,
                      background: sliderState.color || "#FFFFFF",
                    }} />
                  </div>
                  <input name="batteryPercent" type="range" min="10" max="100" step="5"
                    value={form.batteryPercent} onChange={handleChange} style={s.slider} />
                </div>

                {/* Low Battery Warning */}
                {form.batteryPercent <= 20 && (
                  <div style={s.warnBox}>
                    <span style={{ color: "#EF4444", fontWeight: 600 }}>Low Battery</span>
                    <span style={s.warnText}> — Trip planning disabled. Please charge to at least 21%.</span>
                  </div>
                )}

                {/* Cost Rate */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Electricity Rate (₹/kWh)</label>
                  <input type="number" value={costRate} min="1" max="30" step="0.5"
                    onChange={e => setCostRate(parseFloat(e.target.value))} style={s.input} />
                </div>

                {error && <div style={s.errorBox}>{error}</div>}

                <button type="submit" disabled={loading || evModels.length === 0 || form.batteryPercent <= 20} style={s.btn}>
                  {loading ? <><span style={s.spinner} /> Calculating...</> : "Start Trip"}
                </button>
              </form>
            </div>
          )}

          {/* ── RESULTS PANEL ──────────────────────────────────── */}
          {activePanel === "results" && result && (
            <div style={s.resultsPanel}>

              {/* Battery — DOMINANT */}
              <div style={s.batteryHero}>
                <div style={s.batteryHeroTop}>
                  <span style={s.batteryHeroLabel}>Battery at Arrival</span>
                  {arrivalState?.color && (
                    <span style={{ ...s.batteryStatus, color: arrivalState.color, borderColor: `${arrivalState.color}30` }}>
                      {arrivalState.label}
                    </span>
                  )}
                </div>
                <div style={{ ...s.batteryHeroNum, color: arrivalState?.color || "#FFFFFF" }}>
                  {arrivalBattery}<span style={s.batteryHeroPct}>%</span>
                </div>
                <div style={s.batteryBar}>
                  <div style={{
                    ...s.batteryBarFill,
                    width: `${Math.max(0, arrivalBattery)}%`,
                    background: arrivalState?.color || "#FFFFFF",
                  }} />
                </div>
                <p style={s.batteryArriveNote}>
                  Arrive with {arrivalBattery}% — {arrivalBattery < 10 ? "Charge immediately upon arrival" : arrivalBattery < 25 ? "Plan a charging stop" : "Comfortable margin"}
                </p>
              </div>

              <div style={s.dividerLine} />

              {/* Key Stats */}
              <div style={s.statsGrid}>
                {[
                  { label: "Distance", value: `${result.distance_km} km` },
                  { label: "Duration", value: `${result.duration_hr} hrs` },
                  { label: "Energy Used", value: `${result.energy.totalEnergy} kWh` },
                  { label: "Total Cost", value: `₹${totalCost}` },
                  { label: "Charge Stops", value: result.energy.chargingStops },
                  { label: "Starting Battery", value: `${form.batteryPercent}%` },
                ].map((item, i) => (
                  <div key={i} style={s.statItem}>
                    <div style={s.statLabel}>{item.label}</div>
                    <div style={s.statValue}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={s.dividerLine} />

              {/* Charging Stations */}
              {result.chargingStations?.length > 0 && (
                <div>
                  <p style={s.sectionLabel}>Charging Stops</p>
                  <div style={s.stationList}>
                    {/* Start */}
                    <div style={s.tlItem}>
                      <div style={s.tlDotWhite} />
                      <div style={s.tlContent}>
                        <div style={s.tlName}>Start — {result.start}</div>
                        <div style={s.tlMeta}>Battery: {form.batteryPercent}%</div>
                      </div>
                    </div>
                    {result.chargingStations.map((station, i) => {
                      const isOffline = station.status === "Offline";
                      const statusColor = station.status === "Available" ? "#22C55E" : station.status === "Occupied" ? "#F59E0B" : "#EF4444";
                      return (
                        <div key={i} style={{ ...s.tlItem, opacity: isOffline ? 0.5 : 1 }}>
                          <div style={s.tlLine} />
                          <div style={{ ...s.tlDotAmber, background: isOffline ? "#6B7280" : "#22C55E" }} />
                          <div style={s.tlContent} onClick={() => setFocusedLocation([station.lat, station.lng])}>
                            <div style={{ ...s.tlName, cursor: "pointer", textDecoration: isOffline ? "line-through" : "none" }}>
                              {station.name}
                            </div>
                            <div style={s.tlMeta}>
                              {station.power} · {station.connectorType}
                              {station.status && (
                                <span style={{ ...s.statusBadge, color: statusColor, borderColor: `${statusColor}30` }}>
                                  {station.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* End */}
                    <div style={s.tlItem}>
                      <div style={s.tlLine} />
                      <div style={s.tlDotWhite} />
                      <div style={s.tlContent}>
                        <div style={s.tlName}>Arrive — {result.destination}</div>
                        <div style={{ ...s.tlMeta, color: arrivalState?.color || "#9CA3AF" }}>Battery: {arrivalBattery}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result.energy.needsCharging && result.chargingStations?.length === 0 && (
                <div style={s.warnBox}>
                  Charging required but no stations found. Add an OpenChargeMap API key for live data.
                </div>
              )}

              <div style={s.dividerLine} />

              {/* Energy + Cost Breakdown */}
              <div>
                <p style={s.sectionLabel}>Energy Breakdown</p>
                <div style={s.breakdownList}>
                  {[
                    ["Base Consumption", `${result.energy.baseEnergy} kWh`],
                    ["Elevation Penalty", `${result.energy.elevationPenalty} kWh`],
                    [`Weather (+${result.energy.weatherFactor}%)`, `${result.energy.weatherPenalty} kWh`],
                    ["Charging", `₹${chargingCost}`],
                    ["Est. Tolls", `₹${tollCost}`],
                  ].map(([k, v], i) => (
                    <div key={i} style={s.breakdownRow}>
                      <span style={s.breakdownKey}>{k}</span>
                      <span style={s.breakdownVal}>{v}</span>
                    </div>
                  ))}
                  <div style={{ ...s.breakdownRow, borderBottom: "none", paddingTop: "10px", borderTop: "1px solid #222" }}>
                    <span style={{ ...s.breakdownKey, color: "#FFFFFF", fontWeight: 600 }}>Total Cost</span>
                    <span style={{ ...s.breakdownVal, color: "#FFFFFF", fontWeight: 700 }}>₹{totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Weather */}
              {result.weather && (
                <>
                  <div style={s.dividerLine} />
                  <div>
                    <p style={s.sectionLabel}>Weather at Origin</p>
                    <div style={s.breakdownList}>
                      {[
                        ["Temperature", `${result.weather.temperature}°C`],
                        ["Wind Speed", `${result.weather.windSpeed_kmh} km/h`],
                        ["Condition", result.weather.description],
                      ].map(([k, v], i) => (
                        <div key={i} style={s.breakdownRow}>
                          <span style={s.breakdownKey}>{k}</span>
                          <span style={s.breakdownVal}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div style={s.dividerLine} />

              {/* Turn-by-Turn */}
              {result.directions?.length > 0 && (
                <div>
                  <button style={s.dirToggle} onClick={() => setShowDirections(!showDirections)}>
                    <span style={s.sectionLabel}>Turn-by-Turn</span>
                    <span style={s.dirToggleArrow}>{showDirections ? "▲" : "▼"}</span>
                  </button>
                  {showDirections && (
                    <div>
                      <button onClick={handleStartNavigation} style={s.navStartBtn}>Start Driving Mode</button>
                      {result.directions.map((step, i) => (
                        <div key={i} style={s.dirStep}>
                          <span style={s.dirIcon}>{getNavIcon(step)}</span>
                          <div>
                            <div style={s.dirInstruction}>{step.instruction}</div>
                            {step.distance_km > 0 && <div style={s.dirDist}>{step.distance_km} km</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Share */}
              <button onClick={handleShare} style={s.shareBtn}>
                {copied ? "Copied to clipboard" : "Share Trip Summary"}
              </button>
            </div>
          )}
        </div>

        {/* ── MAP ─────────────────────────────────────────────────── */}
        <div style={s.mapWrapper}>
          {/* Driving Mode Overlay */}
          {activeNavStep !== null && result?.directions && (
            <div style={s.navOverlay}>
              <div style={s.navTop}>
                <span style={s.navIcon}>{getNavIcon(result.directions[activeNavStep])}</span>
                <div style={s.navInfo}>
                  <div style={s.navDist}>{result.directions[activeNavStep].distance_km} km</div>
                  <div style={s.navInst}>{result.directions[activeNavStep].instruction}</div>
                </div>
              </div>
              <div style={s.navControls}>
                <button style={s.navBtn} onClick={handleNavPrev} disabled={activeNavStep === 0}>← Prev</button>
                <button style={s.navBtnExit} onClick={() => { setActiveNavStep(null); setFocusedLocation(null); }}>Exit</button>
                <button style={s.navBtn} onClick={handleNavNext} disabled={activeNavStep === result.directions.length - 1}>Next →</button>
              </div>
            </div>
          )}

          <MapContainer
            center={[20.5937, 78.9629]} zoom={5}
            minZoom={3}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%", background: "#0B0B0B" }}
            zoomControl={false}
          >
            <TileLayer
              attribution={
                mapStyle === "dark" ? '&copy; <a href="https://carto.com">CARTO</a>' :
                mapStyle === "satellite" ? '&copy; <a href="https://www.esri.com">Esri</a>' :
                '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              }
              url={
                mapStyle === "dark" ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" :
                mapStyle === "satellite" ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" :
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              noWrap={true}
            />

            {routeCoords.length > 0 && (
              <>
                <MapFlyTo coordinates={result.coordinates} />
                <MapFocusController focusedLocation={focusedLocation} />
                
                {/* Route line — Cyberpunk Glowing Energy Flow */}
                {/* 1. Underlying dark shadow track */}
                <Polyline positions={routeCoords} pathOptions={{ color: "#000000", weight: 10, opacity: 0.5, lineCap: "round", lineJoin: "round" }} />
                {/* 2. Cyan pure neon tube */}
                <Polyline positions={routeCoords} pathOptions={{ color: "#06B6D4", className: "route-neon-glow", weight: 6, opacity: 1.0, lineCap: "round", lineJoin: "round" }} />
                {/* Start marker */}
                <Marker position={routeCoords[0]} icon={startIcon}>
                  <Popup><div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", color: "#111" }}><strong>Start</strong><br />{result.start}</div></Popup>
                </Marker>
                {/* End marker */}
                <Marker position={routeCoords[routeCoords.length - 1]} icon={endIcon}>
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", color: "#111" }}>
                      <strong>Destination</strong><br />{result.destination}<br />
                      <span style={{ color: arrivalState?.color || "#22C55E" }}>Battery: {arrivalBattery}%</span>
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
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", color: "#111" }}>
                      <strong>{st.name}</strong><br />{st.power} · {st.connectorType}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>

          {/* Route Status Bar — bottom center */}
          {result && (
            <div style={s.routeBar}>
              <div style={s.routeBarItem}>
                <span style={s.routeBarVal}>{result.distance_km} km</span>
                <span style={s.routeBarLabel}>Distance</span>
              </div>
              <div style={s.routeBarDivider} />
              <div style={s.routeBarItem}>
                <span style={s.routeBarVal}>{result.duration_hr} hrs</span>
                <span style={s.routeBarLabel}>Duration</span>
              </div>
              <div style={s.routeBarDivider} />
              <div style={s.routeBarItem}>
                <span style={{ ...s.routeBarVal, color: arrivalState?.color || "#FFFFFF" }}>{arrivalBattery}%</span>
                <span style={s.routeBarLabel}>At Arrival</span>
              </div>
            </div>
          )}

          {/* Map Legend */}
          <div style={s.legend}>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#E5E7EB" }} /> Route</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#FFFFFF" }} /> Start / End</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#22C55E" }} /> Charger</div>
          </div>

          {/* Map Style Selector */}
          <div style={s.mapStyleBox}>
            <button style={{ ...s.mapStyleBtn, ...(mapStyle === "dark" ? s.mapStyleBtnActive : {}) }} 
              onClick={() => setMapStyle("dark")}>Dark Mode</button>
            <button style={{ ...s.mapStyleBtn, ...(mapStyle === "satellite" ? s.mapStyleBtnActive : {}) }} 
              onClick={() => setMapStyle("satellite")}>Satellite</button>
            <button style={{ ...s.mapStyleBtn, ...(mapStyle === "streets" ? s.mapStyleBtnActive : {}) }} 
              onClick={() => setMapStyle("streets")}>Streets</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh", width: "100vw",
    background: "#0B0B0B", color: "#D1D5DB",
    fontFamily: "'Inter', sans-serif", overflow: "hidden",
  },
  layout: {
    display: "flex", position: "fixed", top: "60px",
    left: 0, right: 0, bottom: 0,
  },

  // Left panel
  leftPanel: {
    width: "400px", flexShrink: 0,
    background: "rgba(10,10,12,0.65)", borderRight: "1px solid rgba(255,255,255,0.05)",
    backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
    overflowY: "auto", scrollbarWidth: "none",
    display: "flex", flexDirection: "column",
    boxShadow: "30px 0 60px rgba(0,0,0,0.6)",
    zIndex: "100",
  },

  // Tab row
  tabRow: {
    display: "flex", padding: "16px 24px 0",
    borderBottom: "1px solid #1A1A1A",
    gap: "0",
  },
  tabBtn: {
    flex: 1, padding: "10px 16px", background: "transparent", border: "none",
    borderBottom: "2px solid transparent", color: "#6B7280",
    cursor: "pointer", fontSize: "0.85rem", fontWeight: 500,
    transition: "all 0.2s ease", fontFamily: "'Inter', sans-serif",
  },
  tabBtnActive: { 
    color: "#FFFFFF", 
    borderBottom: "2px solid #FFFFFF",
    textShadow: "0 0 10px rgba(255,255,255,0.5)"
  },

  // Plan panel
  planPanel: { padding: "28px 24px" },
  planHeader: { marginBottom: "28px" },
  panelEyebrow: { fontSize: "0.7rem", color: "#6B7280", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" },
  panelTitle: { fontSize: "1.6rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.5px" },

  // Results panel
  resultsPanel: { padding: "24px", display: "flex", flexDirection: "column", gap: "0" },

  // Battery Hero
  batteryHero: {
    background: "linear-gradient(145deg, rgba(30,30,30,0.7), rgba(10,10,10,0.9))", borderRadius: "14px",
    padding: "24px", marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 30px rgba(0,0,0,0.5)",
    backdropFilter: "blur(10px)",
  },
  batteryHeroTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  batteryHeroLabel: { fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1.5px" },
  batteryStatus: {
    fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px",
    borderRadius: "4px", border: "1px solid", letterSpacing: "0.5px",
  },
  batteryHeroNum: {
    fontSize: "5rem", fontWeight: 700, lineHeight: 1,
    letterSpacing: "-4px", marginBottom: "16px",
    fontVariantNumeric: "tabular-nums",
  },
  batteryHeroPct: { fontSize: "2rem", fontWeight: 400, letterSpacing: 0 },
  batteryBar: { height: "3px", background: "#1A1A1A", borderRadius: "2px", overflow: "hidden", marginBottom: "12px" },
  batteryBarFill: { height: "100%", borderRadius: "2px", transition: "width 0.8s ease" },
  batteryArriveNote: { fontSize: "0.78rem", color: "#9CA3AF" },

  // Stats grid (2-col)
  statsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "0", marginBottom: "20px",
  },
  statItem: {
    padding: "14px 0", borderBottom: "1px solid #1A1A1A",
    borderRight: "1px solid #1A1A1A",
  },
  statLabel: { fontSize: "0.68rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" },
  statValue: { fontSize: "1.05rem", fontWeight: 600, color: "#FFFFFF" },

  dividerLine: { height: "1px", background: "#1A1A1A", margin: "20px 0" },
  sectionLabel: { fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px", display: "block" },

  // Charging timeline
  stationList: { display: "flex", flexDirection: "column", paddingLeft: "8px" },
  tlItem: { display: "flex", alignItems: "flex-start", gap: "12px", paddingBottom: "14px", position: "relative" },
  tlLine: { position: "absolute", left: "6px", top: "-14px", width: "1px", height: "14px", background: "#2A2A2A" },
  tlDotWhite: { width: "14px", height: "14px", borderRadius: "50%", border: "1.5px solid #FFFFFF", background: "#0B0B0B", flexShrink: 0, marginTop: "2px" },
  tlDotAmber: { width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0, marginTop: "2px" },
  tlContent: { display: "flex", flexDirection: "column", gap: "3px" },
  tlName: { fontSize: "0.85rem", fontWeight: 500, color: "#D1D5DB" },
  tlMeta: { fontSize: "0.73rem", color: "#6B7280", display: "flex", alignItems: "center", gap: "8px" },
  statusBadge: { fontSize: "0.67rem", fontWeight: 500, padding: "2px 6px", borderRadius: "3px", border: "1px solid" },

  // Breakdown
  breakdownList: { display: "flex", flexDirection: "column" },
  breakdownRow: {
    display: "flex", justifyContent: "space-between",
    padding: "9px 0", borderBottom: "1px solid #1A1A1A",
  },
  breakdownKey: { fontSize: "0.82rem", color: "#9CA3AF" },
  breakdownVal: { fontSize: "0.82rem", color: "#D1D5DB", fontWeight: 500 },

  // Directions
  dirToggle: {
    background: "none", border: "none", cursor: "pointer",
    display: "flex", justifyContent: "space-between", width: "100%",
    padding: "0 0 12px", fontFamily: "inherit",
  },
  dirToggleArrow: { color: "#6B7280", fontSize: "0.75rem" },
  navStartBtn: {
    width: "100%", padding: "11px",
    background: "#FFFFFF", color: "#0B0B0B",
    border: "none", borderRadius: "8px", fontWeight: 600,
    cursor: "pointer", marginBottom: "12px", transition: "background 0.2s ease",
    fontFamily: "inherit", fontSize: "0.87rem",
  },
  dirStep: {
    display: "flex", alignItems: "flex-start", gap: "10px",
    borderBottom: "1px solid #1A1A1A", padding: "10px 0",
  },
  dirIcon: { color: "#9CA3AF", fontSize: "0.9rem", width: "16px", flexShrink: 0, marginTop: "2px" },
  dirInstruction: { fontSize: "0.83rem", color: "#D1D5DB", lineHeight: 1.4 },
  dirDist: { fontSize: "0.73rem", color: "#6B7280", marginTop: "3px" },

  // Share
  shareBtn: {
    marginTop: "20px", width: "100%", padding: "12px",
    background: "transparent", border: "1px solid #2A2A2A",
    borderRadius: "8px", color: "#9CA3AF",
    cursor: "pointer", fontSize: "0.85rem", fontWeight: 400,
    transition: "border-color 0.2s ease, color 0.2s ease",
    fontFamily: "inherit",
  },

  // Form elements
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.72rem", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.5px", textTransform: "uppercase" },
  inputRow: { display: "flex", gap: "10px" },
  input: {
    flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "14px 16px",
    color: "#FFFFFF", fontSize: "0.95rem", outline: "none",
    transition: "all 0.2s ease", fontFamily: "inherit",
    width: "100%", boxSizing: "border-box",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
  },
  locBtn: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "0 14px", width: "48px",
    color: "#E5E7EB", cursor: "pointer", fontSize: "1.1rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s ease", flexShrink: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  specsRow: {
    display: "flex", background: "rgba(255,255,255,0.02)", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.05)", padding: "14px 12px",
    gap: "0", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.02)",
  },
  spec: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" },
  specVal: { fontSize: "1rem", fontWeight: 700, color: "#FFFFFF" },
  specLabel: { fontSize: "0.67rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" },
  specDivider: { width: "1px", background: "#2A2A2A", margin: "0 8px" },
  sliderHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sliderVal: { fontSize: "1rem", fontWeight: 700 },
  sliderTrack: {
    height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px",
    overflow: "hidden", margin: "10px 0 6px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
  },
  sliderFill: { height: "100%", borderRadius: "2px", transition: "width 0.3s ease", boxShadow: "0 0 10px currentColor" },
  slider: { width: "100%", accentColor: "#FFFFFF", cursor: "pointer", margin: 0 },
  seedBox: {
    background: "#1A1A1A", border: "1px solid #2A2A2A",
    borderRadius: "8px", padding: "14px", textAlign: "center", marginBottom: "8px",
  },
  seedText: { color: "#9CA3AF", fontSize: "0.83rem", marginBottom: "10px" },
  seedBtn: {
    background: "#FFFFFF", border: "none", borderRadius: "6px",
    padding: "8px 20px", color: "#0B0B0B",
    fontWeight: 600, fontSize: "0.83rem", cursor: "pointer", fontFamily: "inherit",
  },
  warnBox: {
    background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "8px", padding: "10px 14px",
    fontSize: "0.82rem", color: "#9CA3AF",
  },
  warnText: { color: "#9CA3AF" },
  errorBox: {
    background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "8px", padding: "10px 14px",
    color: "#EF4444", fontSize: "0.82rem",
  },
  btn: {
    background: "linear-gradient(90deg, #FFFFFF, #E5E7EB)", border: "none", borderRadius: "8px",
    padding: "16px", color: "#0B0B0B", fontWeight: 700,
    fontSize: "0.95rem", cursor: "pointer", width: "100%",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    fontFamily: "inherit", marginTop: "10px",
    boxShadow: "0 4px 14px rgba(255,255,255,0.2)",
  },
  spinner: {
    width: "14px", height: "14px",
    border: "1.5px solid rgba(0,0,0,0.2)",
    borderTop: "1.5px solid #0B0B0B",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },

  // Map
  mapWrapper: {
    flex: 1, position: "relative",
    background: "#0B0B0B",
  },

  // Route status bar
  routeBar: {
    position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)",
    background: "rgba(17,17,17,0.7)", border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
    borderRadius: "14px", padding: "12px 24px",
    display: "flex", gap: "0", alignItems: "center",
    zIndex: 1000, whiteSpace: "nowrap",
  },
  routeBarItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px", gap: "3px" },
  routeBarVal: { fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.3px" },
  routeBarLabel: { fontSize: "0.6rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 },
  routeBarDivider: { width: "1px", height: "28px", background: "#1A1A1A" },

  // Legend
  legend: {
    position: "absolute", bottom: "32px", right: "24px",
    background: "rgba(17,17,17,0.7)", border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    borderRadius: "12px", padding: "12px 18px",
    display: "flex", flexDirection: "column", gap: "8px",
    zIndex: 1000,
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "10px", fontSize: "0.75rem", color: "#E5E7EB", fontWeight: 500 },
  legendDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, boxShadow: "0 0 8px currentColor" },

  // Map Style Toggle
  mapStyleBox: {
    position: "absolute", top: "24px", right: "24px",
    background: "rgba(10,10,12,0.8)", border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    borderRadius: "10px", padding: "4px",
    display: "flex", gap: "4px", zIndex: 1000,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  mapStyleBtn: {
    background: "transparent", border: "none", color: "#9CA3AF",
    padding: "8px 12px", borderRadius: "6px", fontSize: "0.75rem",
    fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  mapStyleBtnActive: {
    background: "rgba(255,255,255,0.15)", color: "#FFFFFF",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
  },

  // Driving Mode Overlay
  navOverlay: {
    position: "absolute", top: "24px", left: "50%", transform: "translateX(-50%)",
    width: "90%", maxWidth: "440px",
    background: "rgba(17,17,17,0.85)", border: "1px solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    borderRadius: "16px", zIndex: 2000, overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  },
  navTop: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "16px 20px", borderBottom: "1px solid #1A1A1A",
  },
  navIcon: {
    fontSize: "1.4rem", color: "#FFFFFF",
    background: "#1A1A1A", width: "44px", height: "44px",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "8px", flexShrink: 0,
  },
  navInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  navDist: { fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.5px" },
  navInst: { fontSize: "0.9rem", color: "#9CA3AF", lineHeight: 1.4 },
  navControls: {
    display: "flex", gap: "8px", padding: "12px 16px",
    background: "#0B0B0B",
  },
  navBtn: {
    flex: 1, padding: "9px", background: "#1A1A1A",
    border: "1px solid #2A2A2A", borderRadius: "8px",
    color: "#D1D5DB", cursor: "pointer", fontWeight: 500,
    fontSize: "0.85rem", fontFamily: "inherit", transition: "border-color 0.2s ease",
  },
  navBtnExit: {
    padding: "9px 20px", background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px",
    color: "#EF4444", cursor: "pointer", fontWeight: 600,
    fontSize: "0.85rem", fontFamily: "inherit",
  },
};
