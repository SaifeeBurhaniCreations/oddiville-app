function mapProductListSection(section, filler) {
  if (!section?.data?.products) return;

  const fillerProducts = filler["products"];
  if (!Array.isArray(fillerProducts) || fillerProducts.length === 0) return;

  const isPlaceholder =
    section.data.products.length === 1 &&
    !section.data.products[0].productId;

  if (isPlaceholder) {
    section.data.products = fillerProducts.map(fp => {
      const skus = fp.skus || [];
      const totalBags = skus.reduce((s, k) => s + (k.totalBags || 0), 0);

      return {
        ...fp,
        title: fp.name || "",
        image: "box",
        description: skus.length
          ? skus.map(s => `${s.size}${s.unit} • ★ ${fp.rating}`).join(", ")
          : "",
        weight: totalBags ? `${totalBags} bags` : "",
      };
    });

    return;
  }

  const fillerMap = new Map(fillerProducts.map(p => [p.productId, p]));

  section.data.products = section.data.products.map(product => {
    
    const fp = fillerMap.get(product.productId) || product;
    const skus = fp.skus || [];
    const totalBags = skus.reduce((s, k) => s + (k.totalBags || 0), 0);

    return {
      ...product,
      ...fp,
      title: fp.name || product.title || "",
      image: "box",
      description: skus.length
        ? skus.map(s => `${s.size}${s.unit} • ★ ${product.rating}`).join(", ")
        : "",
      weight: totalBags ? `${totalBags} bags` : "",
    };
  });
}

module.exports = {
  mapProductListSection
}