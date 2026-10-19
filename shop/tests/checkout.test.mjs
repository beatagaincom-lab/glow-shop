import test from "node:test";
import assert from "node:assert/strict";
import { validateCart, price } from "../server/catalog.mjs";
import checkout from "../api/checkout.mjs";
import { getStripe } from "../server/stripe.mjs";
test("server accepts only known products and owns prices", () => {
  assert.deepEqual(
    validateCart({ items: [{ id: "stars", quantity: 2, price: 1 }] }),
    [{ id: "stars", quantity: 2 }],
  );
  assert.equal(price, 5990);
});

test("checkout rejects invalid requests before contacting Stripe", async () => {
  for (const [request, expected] of [
    [{ method: "GET", headers: {} }, 405],
    [{ method: "POST", headers: {}, body: { items: [] } }, 400],
    [
      {
        method: "POST",
        headers: { origin: "https://untrusted.example" },
        body: { items: [{ id: "stars", quantity: 1 }] },
      },
      403,
    ],
  ]) {
    const response = { statusCode: 0, setHeader() {}, end() {} };
    await checkout(request, response);
    assert.equal(response.statusCode, expected);
  }
});

test("preview rejects live credentials even when checkout is enabled", async () => {
  const before = { ...process.env };
  try {
    process.env.CHECKOUT_ENABLED = "true";
    process.env.STRIPE_MODE = "test";
    process.env.STRIPE_SECRET_KEY = "sk_live_placeholder";
    await assert.rejects(getStripe(), /checkout_disabled/);
  } finally {
    for (const key of [
      "CHECKOUT_ENABLED",
      "STRIPE_MODE",
      "STRIPE_SECRET_KEY",
    ]) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
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
