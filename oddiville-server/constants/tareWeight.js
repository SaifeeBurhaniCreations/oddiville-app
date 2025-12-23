const tareWeightByType = {
  pouch: [
    { max: 100, tare: 0.4 },
    { max: 250, tare: 0.6 },
    { max: 500, tare: 0.9 },
    { max: 1000, tare: 1.5 },
    { max: 2000, tare: 2.5 },
    { max: 5000, tare: 4 },
    { max: 10000, tare: 7 },
    { max: 25000, tare: 15 },
    { max: 30000, tare: 18 },
    { max: 50000, tare: 25 },
  ],
  bag: [
    { max: 1000, tare: 1 },
    { max: 5000, tare: 2 },
    { max: 25000, tare: 5 },
  ],
  box: [
    { max: 5000, tare: 3 },
    { max: 25000, tare: 8 },
    { max: Infinity, tare: 15 },
  ],
};

function getTareWeight({ type, size, unit }) {
  const sizeInGram =
    unit.toLowerCase() === "kg" ? Number(size) * 1000 : Number(size);

  const ranges = tareWeightByType[type];
  if (!ranges) return 1;

  const found = ranges.find((r) => sizeInGram <= r.max);
  return found ? found.tare : 1;
}

module.exports = { getTareWeight };
