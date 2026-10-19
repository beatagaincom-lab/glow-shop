import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import Stripe from "stripe";
import { createWebhook, readRawBody } from "../api/stripe-webhook.mjs";
import { orderFromSession, saveOrder } from "../server/orders.mjs";

const session = {
  id: "cs_test_example", livemode: false, status: "complete", payment_status: "paid",
  metadata: { shop: "glow", cart: '[{"id":"stars","quantity":1}]' },
  currency: "chf", amount_subtotal: 5990, amount_total: 5990,
  total_details: { amount_shipping: 0, amount_discount: 0, amount_tax: 0 },
  customer_details: { email: "test@example.com" },
  collected_information: { shipping_details: { name: "Test Person", address: {
    country: "CH", line1: "Teststrasse 1", postal_code: "8000", city: "Testort",
  } } },
};
test("only paid, complete GLOW test orders with matching totals can be stored", () => {
  assert.equal(orderFromSession(session, "evt_test").fulfillment_status, "test_only");
  assert.equal(orderFromSession({ ...session, payment_status: "unpaid" }, "evt_test"), null);
  assert.equal(orderFromSession({ ...session, status: "open" }, "evt_test"), null);
  assert.equal(orderFromSession({ ...session, metadata: {} }, "evt_test"), null);
  for (const patch of [{ livemode: true }, { amount_total: 1 }, { currency: "eur" }, { customer_details: {} }])
    assert.throws(() => orderFromSession({ ...session, ...patch }, "evt_test"));
});

test("signed webhook stores canonical data; invalid signature never reaches Stripe", async () => {
  const before = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_fixture";
  try {
    let reads = 0;
    const records = new Map();
    let failStorage = false;
    const handler = createWebhook({
      stripeFactory: async () => ({ checkout: { sessions: { retrieve: async () => { reads++; return session; } } } }),
      persist: async (order) => { if (failStorage) throw Error("offline"); records.set(order.stripe_session_id, order); },
    });
    async function deliver(valid = true) {
      const payload = JSON.stringify({ id: "evt_test", livemode: false, type: "checkout.session.completed", data: { object: { id: session.id, amount_total: 1 } } });
      const req = Readable.from([Buffer.from(payload)]);
      req.method = "POST";
      req.headers = { "stripe-signature": valid ? Stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET }) : "invalid" };
      const res = { statusCode: 0, setHeader() {}, end() {} };
      await handler(req, res);
      return res.statusCode;
    }
    assert.equal(await deliver(false), 400);
    assert.equal(reads, 0);
    assert.equal(await deliver(), 200);
    assert.equal(await deliver(), 200);
    assert.equal(records.size, 1);
    assert.equal(records.get(session.id).amount_total, 5990);
    failStorage = true;
    assert.equal(await deliver(), 503);
  } finally {
    if (before === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = before;
  }
});
test("webhook body is bounded", async () => {
  await assert.rejects(readRawBody(Readable.from([Buffer.alloc(1024 * 1024 + 1)])), /payload_too_large/);
});
test("order storage ignores duplicate session IDs and reports database failure", async () => {
  const previous = [process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY];
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";
  try {
    await saveOrder(orderFromSession(session, "evt_test"), async (url, options) => {
      assert.match(url, /on_conflict=stripe_session_id/);
      assert.equal(options.headers.Prefer, "resolution=ignore-duplicates,return=minimal");
      return { ok: true };
    });
    await assert.rejects(saveOrder({}, async () => ({ ok: false })), /order_store_unavailable/);
  } finally {
    ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index];
    });
  }
});
