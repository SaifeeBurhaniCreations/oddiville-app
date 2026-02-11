const router = require("express").Router();
const exportService = require("../services/exportService");

router.get("/", async (req, res) => {
    try {
        const { type = "dashboard" } = req.query;

        if (!exportService[type]) {
            return res.status(400).json({ error: "Invalid export type" });
        }

        const workbook = await exportService[type](req.query);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${type}-report.xlsx`
        );
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/count", async (req, res) => {
    try {
        const { type = "dashboard" } = req.query;

        if (!exportService.count[type]) {
            return res.status(400).json({ error: "Invalid export type" });
        }

        const count = await exportService.count[type](req.query);

        res.json({ count });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
