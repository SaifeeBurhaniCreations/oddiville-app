function validatePackingIntent(payload) {
    if (!payload.product?.productName) {
        throw new Error("Product is required");
    }

    if (!Array.isArray(payload.packagingPlan) || payload.packagingPlan.length === 0) {
        throw new Error("Packaging plan required");
    }

    const totalProduced = payload.packagingPlan.reduce(
        (s, p) => s + p.bagsProduced,
        0
    );

    if (totalProduced <= 0) {
        throw new Error("No bags produced");
    }
}

module.exports = { validatePackingIntent };