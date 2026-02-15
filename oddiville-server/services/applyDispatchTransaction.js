async function applyDispatchTransaction({
  orderPayload,
  transaction,
  stocks
})
 {
  const { products, usedBagsByProduct } = orderPayload;

  for (const productId of Object.keys(usedBagsByProduct)) {

    const productUsage = usedBagsByProduct[productId];
    const productName = productId.split("::")[0];

const stock = stocks.find(
  s => String(s.product_name).toLowerCase() === String(productName).toLowerCase()
);


    if (!stock) throw new Error(`Stock not found for ${productName}`);

    for (const packageKey of Object.keys(productUsage)) {

      const usage = productUsage[packageKey];
      const { byChamber = {}, packet, totalBags = 0 } = usage;


      if (!Array.isArray(stock.packages))
  throw new Error(`Product ${productName} has no package configuration`);

const pkg = stock.packages.find(
  p => Number(p.size) === Number(packet.size) && p.unit === packet.unit
);

if (!pkg)
  throw new Error(`Package configuration missing for ${productName} ${packet.size}${packet.unit}`);


      /* chamber deduction */
      for (const chamberId of Object.keys(byChamber)) {

        const bagsToDeduct = Number(byChamber[chamberId]);

const expectedRating = Number(packageKey.split("-")[2]);

const chamberIdx = stock.chamber.findIndex(
  c =>
    String(c.id) === String(chamberId) &&
    Number(c.rating) === expectedRating
);

        if (chamberIdx === -1)
          throw new Error(`Chamber ${chamberId} not found`);

        if (Number(stock.chamber[chamberIdx].quantity) < bagsToDeduct)
          throw new Error(`Insufficient stock in ${chamberId}`);

        stock.chamber[chamberIdx].quantity =
          String(Number(stock.chamber[chamberIdx].quantity) - bagsToDeduct);
      }
    }

    await stock.save({ transaction });
  }
}

module.exports = {applyDispatchTransaction};