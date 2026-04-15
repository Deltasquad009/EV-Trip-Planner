# ⚡ EV Trip Planner

A full-stack **Electric Vehicle Trip Planning** application that provides optimal routes, real-time battery predictions, weather-aware energy calculations, and intelligent charging station recommendations.

Built for Indian EV drivers — supports 20+ EV models including Tesla, Tata, MG, Hyundai, Kia, BYD, Ola, Ather, and more.

---

## 🚀 Features

- **Smart Route Planning** — Optimized driving routes using OSRM with turn-by-turn directions
- **Battery Intelligence** — Real-time energy consumption based on distance, elevation, temperature, and wind
- **Live Weather Impact** — OpenWeatherMap integration for weather-aware energy calculations
- **Charging Station Finder** — Discovers charging stations along your route via OpenChargeMap API
- **Interactive Map** — Dark-themed Leaflet map with route visualization, charging station markers, and driving mode
- **3D Car Visualization** — Interactive Three.js car model on the landing page
- **User Authentication** — JWT-based auth with secure password hashing
- **Trip History** — Saved trip history with real statistics on your profile
- **Multi-Vehicle Support** — 20+ pre-configured EV models with accurate specs
- **Cost Estimation** — Charging cost + estimated toll calculations

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite | Build Tool & Dev Server |
| React Router v6 | Client-side Routing |
| Leaflet + React-Leaflet | Interactive Maps |
| Three.js + React Three Fiber | 3D Car Model |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API Server |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcryptjs | Authentication |
| Helmet | Security Headers |
| express-rate-limit | Rate Limiting |
| express-validator | Input Validation |
| Morgan | Request Logging |

### External APIs
| API | Purpose |
|---|---|
| OSRM | Route calculation (free, no key) |
| Nominatim (OSM) | Geocoding (free, no key) |
| OpenWeatherMap | Weather data |
| OpenChargeMap | Charging station locations |

---

## 📁 Project Structure

```
EV-Trip-Planner/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route handlers (auth, trip, ev)
│   ├── middleware/        # Auth guard, validation, error handler
│   ├── models/           # Mongoose schemas (User, Trip, EVModel)
│   ├── routes/           # Express route definitions
│   ├── scripts/          # Database seed script
│   ├── services/         # External API integrations
│   ├── tests/            # Backend tests
│   ├── .env.example      # Environment variable template
│   ├── package.json
│   └── server.js         # Express app entry point
│
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable UI (Navbar, Car3D, Autocomplete, ProtectedRoute)
│   │   ├── pages/        # Page components (Home, Login, Register, TripPlanner, Profile)
│   │   ├── services/     # API service layer
│   │   ├── styles/       # Global CSS design system
│   │   ├── utils/        # Storage utility
│   │   ├── App.jsx       # Root component with routes
│   │   └── main.jsx      # App entry point
│   ├── .env.example      # Frontend env template
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **API Keys** (optional but recommended):
  - [OpenWeatherMap](https://openweathermap.org/api) — free tier
  - [OpenChargeMap](https://openchargemap.org/site/develop/api) — free tier

---

## 🏁 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Deltasquad009/EV-Trip-Planner.git
cd EV-Trip-Planner
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ev-trip-planner
JWT_SECRET=your_strong_random_secret_min_32_chars
OPENCHARGEMAP_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Seed the database with EV models:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the App

Visit **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |

### EV Models
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ev/models` | List all EV models | No |
| POST | `/api/ev/seed` | Seed EV models (admin) | Yes |

### Trip Planning
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/trip/plan` | Plan a trip | Optional |
| GET | `/api/trip/history` | Get trip history | Yes |
| GET | `/api/trip/reverse-geocode` | Reverse geocode | No |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

---

## 🔒 Security Features

- ✅ JWT authentication with 7-day expiry
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Helmet HTTP security headers
- ✅ CORS restricted to frontend origin
- ✅ Rate limiting (100 req/15min general, 10 req/15min auth)
- ✅ Input validation on all endpoints
- ✅ Request body size limit (10kb)
- ✅ Password never returned in API responses
- ✅ Protected routes on frontend

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 📝 License

ISC

---

## 👤 Author

**Prasad** — [GitHub](https://github.com/Deltasquad009)
