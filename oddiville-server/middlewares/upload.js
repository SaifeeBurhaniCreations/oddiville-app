const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      const err = new Error(
        "Only PNG, JPG images or PDF files are allowed"
      );
      err.statusCode = 400; // 👈 IMPORTANT
      return cb(err);
    }

    cb(null, true);
  },
});

module.exports = upload;