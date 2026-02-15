export function rejectEmptyOrNull(fn) {
  return async (...args) => {
    const data = await fn(...args);

    if (data == null) {
      throw new Error("No data received – likely API or network issue");
    }

    return data;
  };
}
