const router = require("express").Router();
const PackingService = require("../../services/packing.service");
const safeRoute = require("../../sbc/utils/safeRoute/index");

router.post(
    "/",
    safeRoute(async (req, res) => {
        // throw new Error("Debug stop here");

        const result = await PackingService.execute(req.body);
        res.status(201).json(result);
    })
);

module.exports = router;