const multer = require("multer");

module.exports = (err, req, res, next) => {
  // Multer internal errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File too large",
        message: "File must be smaller than 10 MB.",
      });
    }

    return res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
  }

  // Custom fileFilter errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      error: "Invalid file",
      message: err.message,
    });
  }

  next(err);
};
