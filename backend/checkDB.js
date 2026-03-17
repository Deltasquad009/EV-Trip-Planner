require("dotenv").config();
const mongoose = require("mongoose");

// Models
const User = require("./models/User");
const Trip = require("./models/Trip");
const EVModel = require("./models/EVModel");

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✅ MongoDB Connected:", process.env.MONGO_URI);

    // ─── USERS ────────────────────────────────────────────────────────────────
    const users = await User.find({}, "-password"); // exclude password for safety
    console.log(`\n📋 USERS COLLECTION (${users.length} records):`);
    console.log("─".repeat(70));
    if (users.length === 0) {
      console.log("  ⚠️  No users found.");
    } else {
      users.forEach((u, i) => {
        console.log(`  [${i + 1}] ID       : ${u._id}`);
        console.log(`       Name     : ${u.name}`);
        console.log(`       Email    : ${u.email}`);
        console.log(`       Vehicle  : ${u.vehicleType}`);
        console.log(`       Created  : ${u.createdAt}`);
        console.log(`       Updated  : ${u.updatedAt}`);
        console.log("  " + "─".repeat(60));
      });
    }

    // ─── TRIPS ────────────────────────────────────────────────────────────────
    const trips = await Trip.find({});
    console.log(`\n🗺️  TRIPS COLLECTION (${trips.length} records):`);
    console.log("─".repeat(70));
    if (trips.length === 0) {
      console.log("  ⚠️  No trips found.");
    } else {
      trips.forEach((t, i) => {
        console.log(`  [${i + 1}] Trip ID         : ${t._id}`);
        console.log(`       User ID         : ${t.userId}`);
        console.log(`       Start           : ${t.start}`);
        console.log(`       Destination     : ${t.destination}`);
        console.log(`       EV Model        : ${t.evModel}`);
        console.log(`       Distance        : ${t.distance} km`);
        console.log(`       Duration        : ${t.duration} hrs`);
        console.log(`       Energy Used     : ${t.energyUsed} kWh`);
        console.log(`       Battery Left    : ${t.batteryRemaining}%`);
        console.log(`       Charging Stops  : ${t.chargingStops}`);
        console.log(`       Charging Stns   : ${t.chargingStations?.length || 0} stations`);
        if (t.chargingStations?.length > 0) {
          t.chargingStations.forEach((s, j) => {
            console.log(`         ⚡ [${j + 1}] ${s.name} (lat:${s.lat}, lng:${s.lng}) Power:${s.power}`);
          });
        }
        console.log(`       Weather         : ${JSON.stringify(t.weather)}`);
        console.log(`       Route Points    : ${t.coordinates?.length || 0} coords`);
        console.log(`       Created         : ${t.createdAt}`);
        console.log("  " + "─".repeat(60));
      });
    }

    // ─── EV MODELS ────────────────────────────────────────────────────────────
    const evModels = await EVModel.find({});
    console.log(`\n🚗 EV MODELS COLLECTION (${evModels.length} records):`);
    console.log("─".repeat(70));
    if (evModels.length === 0) {
      console.log("  ⚠️  No EV models found.");
    } else {
      evModels.forEach((m, i) => {
        console.log(`  [${i + 1}] ${m.name}`);
        console.log(`       Battery   : ${m.batteryCapacity} kWh`);
        console.log(`       Efficiency: ${m.efficiency} Wh/km`);
        console.log(`       Range     : ${m.range} km`);
        console.log(`       Weight    : ${m.weight} kg`);
        console.log(`       Drag Coef : ${m.dragCoefficient}`);
        console.log(`       Frontal A : ${m.frontalArea} m²`);
        console.log("  " + "─".repeat(60));
      });
    }

    // ─── SUMMARY ──────────────────────────────────────────────────────────────
    console.log("\n📊 DATABASE SUMMARY:");
    console.log("─".repeat(70));
    console.log(`  👤 Total Users     : ${users.length}`);
    console.log(`  🗺️  Total Trips     : ${trips.length}`);
    console.log(`  🚗 Total EV Models : ${evModels.length}`);

    // Password hash verification for last user
    const rawUser = await User.findOne();
    if (rawUser) {
      const hashedPwd = rawUser.password;
      const isHashed = hashedPwd.startsWith("$2") && hashedPwd.length >= 60;
      console.log(`\n🔒 Password Hashing Check:`);
      console.log(`   User: ${rawUser.email}`);
      console.log(`   Hash: ${hashedPwd.substring(0, 20)}...`);
      console.log(`   Properly bcrypt-hashed: ${isHashed ? "✅ YES" : "❌ NO (PLAIN TEXT!)"}`);
    }

  } catch (err) {
    console.error("\n❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected. Check complete.\n");
  }
}

checkDB();
