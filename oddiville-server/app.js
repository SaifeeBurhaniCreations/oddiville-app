const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const redisModule = await import("./devops/redis.js");
const routes = require("./config/routes");
const sequelize = require("./config/database");

const {
  Notifications,
  Production,
  RawMaterial,
  RawMaterialOrder,
  History,
  OthersItem,
  ThirdPartyClient,
  ChamberStock,
  Vendors,
  Calendar,
  Chambers,
  Lanes,
  Packages,
  WorkLocation,
  DryWarehouse,
  DispatchOrder,
  Contractor,
  Admin,
  TruckDetails,
} = require("./models");
const { setIO } = require("./config/socket");

require("./models/Admin");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(
  "/profilepic",
  express.static(path.join(__dirname, "assets/profilepic"))
);
app.use("/products", express.static(path.join(__dirname, "assets/products")));
app.use(
  "/warehouses",
  express.static(path.join(__dirname, "assets/warehouses"))
);
app.use(
  "/sample-images",
  express.static(path.join(__dirname, "assets/sample-images"))
);
app.use(
  "/driver-image",
  express.static(path.join(__dirname, "assets/driver-image"))
);
app.use("/flags", express.static(path.join(__dirname, "assets/flags")));
app.use("/challan", express.static(path.join(__dirname, "assets/challan")));

app.use(routes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setIO(io);
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", socket.id, reason);
  });
});

const PORT = process.env.PORT || 8022;

(async function start() {
  try {
    // await sequelize.authenticate();
    await TruckDetails.sync({ force: true });
    console.log("✅ Connected to Aiven PostgreSQL");

    if (process.env.SHOULD_SYNC === "true") {
      await Lanes.sync({ force: true });
      console.log("✅ Synced DB with models");
    }

    try {
      const client = redisModule.default ?? redisModule.client ?? redisModule;
      
      app.set("redis", client);
      console.log("✅ Connected to Redis");
    } catch (redisErr) {
      console.error("⚠️ Redis connection failed:", redisErr);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
})();
