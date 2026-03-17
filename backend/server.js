const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const authRoutes = require("./routes/authRoutes");
const evRoutes = require("./routes/evRoutes");
const tripRoutes = require("./routes/tripRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ev", evRoutes);
app.use("/api/trip", tripRoutes);

app.get("/", (req, res) => {
  res.send("EV Trip Planner Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});