/**
 * Database Seeder Script
 *
 * Usage: node scripts/seedDB.js
 *
 * Seeds the database with default EV models.
 * Run this once after initial setup or when you need to reset EV model data.
 */
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config({ path: require("path").join(__dirname, "..", ".env") });

const EVModel = require("../models/EVModel");

const defaultEVModels = [
  {
    name: "Tesla Model 3",
    batteryCapacity: 75,
    efficiency: 150,
    weight: 1844,
    dragCoefficient: 0.23,
    frontalArea: 2.22,
    range: 500,
  },
  {
    name: "Tata Nexon EV",
    batteryCapacity: 40.5,
    efficiency: 170,
    weight: 1535,
    dragCoefficient: 0.3,
    frontalArea: 2.4,
    range: 240,
  },
  {
    name: "MG ZS EV",
    batteryCapacity: 50.3,
    efficiency: 185,
    weight: 1620,
    dragCoefficient: 0.31,
    frontalArea: 2.5,
    range: 272,
  },
  {
    name: "Hyundai Ioniq 5",
    batteryCapacity: 72.6,
    efficiency: 165,
    weight: 1985,
    dragCoefficient: 0.29,
    frontalArea: 2.59,
    range: 440,
  },
  {
    name: "Kia EV6",
    batteryCapacity: 77.4,
    efficiency: 160,
    weight: 1960,
    dragCoefficient: 0.28,
    frontalArea: 2.52,
    range: 483,
  },
  {
    name: "Ola S1 Pro",
    batteryCapacity: 3.97,
    efficiency: 25,
    weight: 125,
    dragCoefficient: 0.38,
    frontalArea: 0.55,
    range: 181,
  },
  {
    name: "Tata Tiago EV",
    batteryCapacity: 24.0,
    efficiency: 120,
    weight: 1150,
    dragCoefficient: 0.32,
    frontalArea: 2.1,
    range: 200,
  },
  {
    name: "Tata Punch EV",
    batteryCapacity: 35.0,
    efficiency: 140,
    weight: 1300,
    dragCoefficient: 0.34,
    frontalArea: 2.3,
    range: 280,
  },
  {
    name: "Mahindra XUV400",
    batteryCapacity: 39.4,
    efficiency: 160,
    weight: 1580,
    dragCoefficient: 0.35,
    frontalArea: 2.4,
    range: 260,
  },
  {
    name: "BYD Atto 3",
    batteryCapacity: 60.48,
    efficiency: 156,
    weight: 1750,
    dragCoefficient: 0.29,
    frontalArea: 2.5,
    range: 420,
  },
  {
    name: "Citroen eC3",
    batteryCapacity: 29.2,
    efficiency: 135,
    weight: 1302,
    dragCoefficient: 0.33,
    frontalArea: 2.2,
    range: 220,
  },
  {
    name: "MG Comet EV",
    batteryCapacity: 17.3,
    efficiency: 110,
    weight: 815,
    dragCoefficient: 0.35,
    frontalArea: 1.9,
    range: 230,
  },
  {
    name: "Hyundai Kona Electric",
    batteryCapacity: 39.2,
    efficiency: 143,
    weight: 1535,
    dragCoefficient: 0.28,
    frontalArea: 2.3,
    range: 452,
  },
  {
    name: "Tata Tigor EV",
    batteryCapacity: 26.0,
    efficiency: 125,
    weight: 1235,
    dragCoefficient: 0.33,
    frontalArea: 2.15,
    range: 315,
  },
  {
    name: "BYD e6",
    batteryCapacity: 71.7,
    efficiency: 165,
    weight: 1930,
    dragCoefficient: 0.3,
    frontalArea: 2.45,
    range: 520,
  },
  {
    name: "Volvo XC40 Recharge",
    batteryCapacity: 78.0,
    efficiency: 200,
    weight: 2188,
    dragCoefficient: 0.33,
    frontalArea: 2.6,
    range: 418,
  },
  {
    name: "Ather 450X",
    batteryCapacity: 3.7,
    efficiency: 30,
    weight: 111,
    dragCoefficient: 0.4,
    frontalArea: 0.6,
    range: 105,
  },
  {
    name: "TVS iQube",
    batteryCapacity: 3.04,
    efficiency: 35,
    weight: 117,
    dragCoefficient: 0.42,
    frontalArea: 0.65,
    range: 100,
  },
  {
    name: "Bajaj Chetak",
    batteryCapacity: 2.88,
    efficiency: 32,
    weight: 132,
    dragCoefficient: 0.4,
    frontalArea: 0.6,
    range: 90,
  },
  {
    name: "Hero Vida V1 Pro",
    batteryCapacity: 3.94,
    efficiency: 35,
    weight: 125,
    dragCoefficient: 0.4,
    frontalArea: 0.62,
    range: 110,
  },
  {
    name: "Simple One",
    batteryCapacity: 5.0,
    efficiency: 25,
    weight: 134,
    dragCoefficient: 0.38,
    frontalArea: 0.58,
    range: 212,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await EVModel.deleteMany({});
    const inserted = await EVModel.insertMany(defaultEVModels);
    console.log(`✅ Seeded ${inserted.length} EV models successfully`);

    inserted.forEach((m) => console.log(`   → ${m.name} (${m.batteryCapacity} kWh)`));
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

seed();
