export const catalog = Object.freeze({
  stars: { name: "Stars", sku: "004035.150.800" },
  unicorn: { name: "Unicorn", sku: "004037.150.800" },
  hearts: { name: "Hearts", sku: "004084.150.071" },
  raket: { name: "Raket", sku: "004085.150.800" },
  schmetterlinge: { name: "Schmetterlinge", sku: "004343.150.800" },
});
export const price = 5990;
export function validateCart(body) {
  if (
    !body ||
    !Array.isArray(body.items) ||
    body.items.length < 1 ||
    body.items.length > 5
  )
    throw new Error("invalid_cart");
  const seen = new Set();
  return body.items.map((item) => {
    if (
      !item ||
      !Object.hasOwn(catalog, item.id) ||
      seen.has(item.id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10
    )
      throw new Error("invalid_cart");
    seen.add(item.id);
    return { id: item.id, quantity: item.quantity };
  });
}
