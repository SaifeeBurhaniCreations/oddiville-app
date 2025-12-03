function formatWeight(weightInKg, overrideOptions = {}) {
  const formatValue = (value, allowDecimals = false) => {
    if (typeof value !== "number" || isNaN(value)) return "0";

    return allowDecimals 
      ? Number(value.toFixed(2)).toString()
      : Number(value).toString();
  };

  if (overrideOptions?.unit) {
    const unit = overrideOptions.unit.toLowerCase();

    switch (unit) {
      case "kg":
        return `${formatValue(weightInKg, false)} Kg`;

      case "gm":
      case "g":
      case "gram":
        return `${formatValue(weightInKg * 1000, false)} Gm`;

      case "tons":
      case "ton":
        return `${formatValue(weightInKg / 1000, true)} Tons`;

      case "quintal":
        return `${formatValue(weightInKg / 100, true)} Quintal`;

      default:
        console.warn("Unknown unit override:", overrideOptions.unit);
        return `${formatValue(weightInKg, false)} Kg`;
    }
  }

  // --------------------
  // Default Logic (Your original but improved)
  // --------------------
  if (weightInKg >= 1000) {
    return `${formatValue(weightInKg / 1000, true)} ton`;
  } else {
    return `${formatValue(weightInKg, false)} kg`;
  }
}


function formatPrice(price) {
  const formatValue = (value) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0.00";
    }
    return Number(value.toFixed(2)).toString();
  };

  if (typeof price === "number" && price >= 100000) {
    return `${formatValue(price / 100000)} lakh`;
  } else if (typeof price === "number") {
    return `${formatValue(price)} Rs`;
  } else {
    return "0.00 Rs";
  }
}

module.exports = { formatWeight, formatPrice };