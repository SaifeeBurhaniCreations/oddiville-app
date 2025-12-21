const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const s3 = require("../utils/s3Client");

const uploadToS3 = async ({
  file,
  folder = "uploads",
  fileName,
}) => {
  if (!file) return null;

  const id = uuidv4();
  const safeName = fileName || file.originalname.replace(/\s+/g, "_");
  const key = `${folder}/${id}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

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