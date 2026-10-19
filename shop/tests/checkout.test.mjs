import test from "node:test";
import assert from "node:assert/strict";
import { validateCart, price } from "../server/catalog.mjs";
test("server accepts only known products and owns prices", () => {
  assert.deepEqual(
    validateCart({ items: [{ id: "stars", quantity: 2, price: 1 }] }),
    [{ id: "stars", quantity: 2 }],
  );
  assert.equal(price, 5990);
});
test("rejects invalid, duplicate, inherited and excessive selections", () => {
  for (const items of [
    [],
    [{ id: "dinos", quantity: 1 }],
    [{ id: "__proto__", quantity: 1 }],
    [{ id: "stars", quantity: -1 }],
    [{ id: "stars", quantity: 1.5 }],
    [{ id: "stars", quantity: 11 }],
    [{ id: "stars", quantity: "1" }],
    [
      { id: "stars", quantity: 1 },
      { id: "stars", quantity: 1 },
    ],
    null,
  ])
    assert.throws(() => validateCart({ items }));
});
