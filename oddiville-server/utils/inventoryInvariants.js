function assertInteger(value, label, path) {
  if (!Number.isInteger(Number(value))) {
    throw new Error(
      `${label} must be an integer at ${path}`
    );
  }
}

function assertPositiveInteger(value, label, path) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(
      `${label} must be a non-negative integer at ${path}`
    );
  }
}

module.exports = {
  assertInteger,
  assertPositiveInteger,
};