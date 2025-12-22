function normalizeError(err) {
  return {
    status: err?.status || 500,
    message: err?.error || err?.message || "Server error",
  };
}


function throwHttpError(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

module.exports = {normalizeError, throwHttpError};
