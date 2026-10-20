import test from "node:test";
import assert from "node:assert/strict";
import { paymentMode, expectedAccount } from "../server/mode.mjs";
import { orderFromSession, saveOrder } from "../server/orders.mjs";

const liveEnv = {
  STRIPE_MODE: "live", VERCEL_ENV: "production",
  LIVE_CHECKOUT_APPROVED: "true", VITE_SHOP_MODE: "live",
  APP_URL: "https://glow.bettundbad.ch",
};
test("live payments fail closed unless production, UI, approval and domain agree", () => {
  assert.equal(paymentMode({}), "test");
  assert.equal(paymentMode(liveEnv), "live");
  for (const [key, value] of [
    ["VERCEL_ENV", "preview"], ["LIVE_CHECKOUT_APPROVED", "false"],
    ["VITE_SHOP_MODE", "test"], ["APP_URL", "https://other.example"],
  ]) assert.throws(() => paymentMode({ ...liveEnv, [key]: value }));
  assert.throws(() => paymentMode({ STRIPE_MODE: "typo" }));
  assert.notEqual(expectedAccount("test"), expectedAccount("live"));
});
test("live orders cannot enter the sandbox table or accept test sessions", async () => {
  const session = {
    id: "cs_live_example", livemode: true, status: "complete", payment_status: "paid",
    metadata: { shop: "glow", cart: '[{"id":"stars","quantity":1}]' },
    currency: "chf", amount_subtotal: 5990, amount_total: 5990,
    total_details: { amount_shipping: 0, amount_discount: 0, amount_tax: 0 },
    customer_details: { email: "synthetic@example.com" },
    collected_information: { shipping_details: { name: "Fixture", address: {
      country: "CH", line1: "Fixture 1", postal_code: "8038", city: "Zürich",
    } } },
  };
  assert.throws(() => orderFromSession(session, "evt_fixture"));
  assert.throws(() => orderFromSession({ ...session, livemode: false }, "evt_fixture", "live"));
  const order = orderFromSession(session, "evt_fixture", "live");
  assert.equal(order.fulfillment_status, "paid");
  const old = [process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY];
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_fixture";
  try {
    await saveOrder(order, async (url) => {
      assert.match(url, /\/glow_live_orders\?/);
      return { ok: true };
    });
  } finally {
    ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].forEach((key, i) => {
      if (old[i] === undefined) delete process.env[key]; else process.env[key] = old[i];
    });
  }
});
