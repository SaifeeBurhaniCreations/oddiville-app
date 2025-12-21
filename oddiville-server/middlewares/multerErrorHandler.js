const multer = require("multer");

module.exports = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File too large",
        message: "File must be smaller than 10 MB.",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Invalid file type",
        message: "Only PNG, JPG images or PDF files are allowed.",
      });
    }
  }

  next(err);
};
