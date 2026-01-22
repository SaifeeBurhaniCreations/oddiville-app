const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const redis = require('./devops/redis');
const routes = require("./config/routes");
const uploadErrorHandler = require("./middlewares/multerErrorHandler");

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
  PackingEvent,
  sequelize
} = require("./models");
const { setIO } = require("./config/socket");
require("./models/Admin");

dotenv.config();

async function printAllRedisData() {
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*", "COUNT", 100);
    cursor = nextCursor;

    for (const key of keys) {
      const type = await redis.type(key);

      let value;
      switch (type) {
        case "string":
          value = await redis.get(key);
          break;
        case "hash":
          value = await redis.hgetall(key);
          break;
        case "list":
          value = await redis.lrange(key, 0, -1);
          break;
        case "set":
          value = await redis.smembers(key);
          break;
        case "zset":
          value = await redis.zrange(key, 0, -1, "WITHSCORES");
          break;
        default:
          value = "<unknown type>";
      }

      console.log({ key, type, value });
    }
  } while (cursor !== "0");
}

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
app.use(uploadErrorHandler);

app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "Internal server error" });
});
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
    console.log("✅ Connected to Aiven PostgreSQL");

    if (process.env.SHOULD_SYNC === "true") {
      // await Admin.sync({ force: true });
      // await sequelize.sync({ alter: true });
      // await sequelize.authenticate();
      // await Chambers.sync({ force: true });
      
      // await Lanes.sync({ force: true });
      await ChamberStock.sync({ force: true });
      await PackingEvent.sync({ force: true });
      await TruckDetails.sync({ force: true });
      await Notifications.sync({ force: true });
      await Production.sync({ force: true });
      await RawMaterialOrder.sync({ force: true });
      await History.sync({ force: true });
      await OthersItem.sync({ force: true });
      await ThirdPartyClient.sync({ force: true });
      await Vendors.sync({ force: true });
      await Packages.sync({ force: true });
      await DryWarehouse.sync({ force: true });
      await DispatchOrder.sync({ force: true });
      await Calendar.sync({ force: true });
      await Contractor.sync({ force: true });
      console.log("✅ Synced DB with models");
    }

   try {
  const redisClient = redis;

 if(process.env.ENVIRONMENT === "development") {
  await redisClient.set('health-check', 'ok'); 
  const value = await redisClient.get('health-check');
  console.log("Redis health-check value:", value);

// await printAllRedisData();
 }

  app.set("redis", redisClient);
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
