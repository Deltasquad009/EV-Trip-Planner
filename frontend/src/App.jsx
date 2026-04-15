// Updated by Prasad
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TripPlanner from "./pages/TripPlanner";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trip" element={<TripPlanner />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/trip" />} />
      </Routes>
    </Router>
  );
}

export default App;
