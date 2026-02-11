const router = require("express").Router();

const { handlers } = require("../handlers/bottomsheetHandler");
const { getBottomSheet } = require("../utils/getBottomSheet");
const jwt = require("jsonwebtoken");
const {
  Admin: adminClient,
} = require("../models");
router.get("/:type/:id", async (req, res) => {
    const { type, id } = req.params;
console.log("{ type, id }", { type, id });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token is missing or malformed." });
    }

    const token = authHeader.split(" ")[1].trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const authenticatedUser = await adminClient.findOne({ where: { email: decoded.email },
      raw: true,
    });

  let rawMaterials = [];
  let productNames = [];
  let vendors = [];
  let chambers = [];
  let contractors = [];

  let rawMaterialOrder = {};
  let dispatchOrder = {};
  let production = {};
  let lane = {};
  let vendor = {};
  let calendarEvent = {};

  let countries = [];
  let states = [];
  let cities = [];
  
  let packingSummary = {};

  let packingEvents = [];
  let chamberStocks = [];

  let meta = id;
    
  const ctx = {
    type,
    id,

    currentUser: authenticatedUser,

    // Meta (packing-summary only)
    meta,

    // Collections
    rawMaterials,
    productNames,
    vendors,
    chambers,
    contractors,

    // Single entities
    rawMaterialOrder,
    dispatchOrder,
    production,
    lane,
    vendor,
    calendarEvent,

    countries,
    states,
    cities,

    packingSummary,

    packingEvents,
    chamberStocks,
  };

    try {
      if (handlers[type]) {
        await handlers[type](ctx);
      }
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error("Error during fetch:", error);
    return res.status(500).json({ error: "Internal server error, please try again later." });
  }

  const bottomSheet = getBottomSheet(ctx);

// console.log('bottomSheet', JSON.stringify(bottomSheet, null, 2));

    res.status(200).json(bottomSheet);
});


module.exports = router;
