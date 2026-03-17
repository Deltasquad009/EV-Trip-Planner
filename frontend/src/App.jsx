import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TripPlanner from "./pages/TripPlanner";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trip" element={<TripPlanner />} />
      </Routes>
    </Router>
  );
}

export default App;
