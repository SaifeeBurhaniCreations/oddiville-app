const extractKeyFromUrl = (url) => {
  if (!url) return null;

  const bucketPart = `.amazonaws.com/`;
  const index = url.indexOf(bucketPart);

  if (index === -1) return null;

  return url.substring(index + bucketPart.length);
};

module.exports = {
  extractKeyFromUrl,
};