const router = require("express").Router();
const PackingService = require("../../services/packing.service");

router.post("/", async (req, res) => {
    try {
        const result = await PackingService.execute(req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error("PACKING ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;