const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const s3 = require("../utils/s3Client");

/**
 * Upload file to S3 (OBJECT-BASED API)
 * @param {Object} params
 * @param {Object} params.file - multer file object
 * @param {string} params.folder - s3 folder path
 * @param {string} [params.fileName] - optional custom filename
 */
const uploadToS3 = async ({ file, folder = "uploads", fileName }) => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file passed to uploadToS3");
  }

  const id = uuidv4();
  const safeName =
    fileName || file.originalname.replace(/\s+/g, "_");

  const key = `${folder}/${id}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  if (process.env.NODE_ENV !== "production") {
    console.log("[uploadToS3]", {
      hasFile: !!file,
      hasBuffer: !!file?.buffer,
      fileKeys: file && typeof file === "object" ? Object.keys(file) : null,
      folder,
    });
  }

  return {
    key,
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
};

const deleteFromS3 = async (key) => {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    })
  );
};

module.exports = { uploadToS3, deleteFromS3 };