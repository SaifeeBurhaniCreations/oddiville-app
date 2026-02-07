const safeRoute = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (err) {
            console.error("DEV SAFE ERROR:", err);

            return res.status(422).json({
                ok: false,
                debug: true,
                message: err.message,
                requestBody: req.body,
                headers: req.headers,
            });
        }
    };
};

module.exports = safeRoute;