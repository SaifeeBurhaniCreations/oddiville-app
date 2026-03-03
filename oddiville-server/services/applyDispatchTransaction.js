async function applyDispatchTransaction({
  orderPayload,
  transaction,
  stocks
}) {
  const { usedBagsByProduct } = orderPayload;
console.log("DEBUG usedBagsByProduct:", JSON.stringify(usedBagsByProduct, null, 2));
  for (const productName of Object.keys(usedBagsByProduct)) {

    const productUsage = usedBagsByProduct[productName];

    const stock = stocks.find(
      s =>
        String(s.product_name).toLowerCase() ===
        String(productName).toLowerCase()
    );

    if (!stock)
      throw new Error(`Stock not found for ${productName}`);

    if (stock.category !== "packed") {
  throw new Error(
    `Dispatch only allowed for packed products`
  );
}
    for (const packageKey of Object.keys(productUsage)) {

      const usage = productUsage[packageKey];
      const { byChamber = {}, packet, totalBags = 0 } = usage;

      console.log("Processing:", {
  productName,
  packageKey,
  usage
});
      if (!Array.isArray(stock.packages))
        throw new Error(`Product ${productName} has no package configuration`);

      const pkg = stock.packages.find(
        p =>
          Number(p.size) === Number(packet.size) &&
          String(p.unit).toLowerCase() ===
          String(packet.unit).toLowerCase()
      );

      if (!pkg)
        throw new Error(
          `Package configuration missing for ${productName} ${packet.size}${packet.unit}`
        );

assertPositiveInteger(
  totalBags,
  "Dispatch bags",
  `dispatch.usedBagsByProduct.${productName}`
);

const totalAvailableBags = stock.chamber.reduce(
  (s, ch) => s + Number(ch.quantity || 0),
  0
);

if (totalAvailableBags < totalBags) {
  throw new Error(`Insufficient bags for ${productName}`);
}

      for (const chamberId of Object.keys(byChamber)) {

        const bagsToDeduct = Number(byChamber[chamberId]);

        const chamberIdx = stock.chamber.findIndex(
          c => String(c.id) === String(chamberId)
        );

        if (chamberIdx === -1)
          throw new Error(`Chamber ${chamberId} not found`);

        if (
          Number(stock.chamber[chamberIdx].quantity) < bagsToDeduct
        )
          throw new Error(`Insufficient stock in ${chamberId}`);

        stock.chamber[chamberIdx].quantity = String(
          Number(stock.chamber[chamberIdx].quantity) - bagsToDeduct
        );
      }
      const remainingTotalBags = stock.chamber.reduce(
  (s, ch) => s + Number(ch.quantity || 0), 0
);

pkg.quantity = remainingTotalBags * Number(pkg.packets_per_bag);
    }

try {
  stock.changed("chamber", true);
  stock.changed("packages", true);
  await stock.save({ transaction });
} catch (err) {
  console.error("SAVE FAILED:", err.message);
  throw err;
}
  }
}