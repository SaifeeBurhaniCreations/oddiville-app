const router = require("express").Router();
const PackingService = require("../../services/packing.service");
const safeRoute = require("../../sbc/utils/safeRoute/index");


function normalizeRMConsumption(rmConsumptionObj) {
  if (!rmConsumptionObj) return [];

  const result = [];

  for (const [rmId, chambers] of Object.entries(rmConsumptionObj)) {
    let rating = null;
    const sourceChambers = [];

    for (const [chamberId, data] of Object.entries(chambers)) {
      rating = data.rating ?? rating ?? 5;

      sourceChambers.push({
        chamberId,
        containersUsed: Number(data.outer_used) || 0,
      });
    }

    result.push({
      rmId,
      rating: rating ?? 5,
      sourceChambers,
    });
  }

  return result;
}

router.post(
    "/",
    safeRoute(async (req, res) => {
        // throw new Error("Debug stop here");
        const payload = req.body;

        payload.rmConsumption = normalizeRMConsumption(payload.rmConsumption);

        const result = await PackingService.execute(payload);
        res.status(201).json(result);
    })
);

module.exports = router;