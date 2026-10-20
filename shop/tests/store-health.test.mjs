import test from "node:test";
import assert from "node:assert/strict";
import { checkLiveOrderStore } from "../server/orders.mjs";

test("live checkout storage check fails closed and does not retrieve customer rows", async () => {
  const before = [process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY];
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_fixture";
  try {
    await checkLiveOrderStore(async (url, options) => {
      assert.equal(new URL(url).searchParams.get("limit"), "0");
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(options.body, undefined);
      return { ok: true };
    });
    await assert.rejects(checkLiveOrderStore(async () => ({ ok: false })), /order_store_unavailable/);
    await assert.rejects(checkLiveOrderStore(async () => { throw Error("network"); }), /network/);
  } finally {
    ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].forEach((key, index) => {
      if (before[index] === undefined) delete process.env[key];
      else process.env[key] = before[index];
    });
  }
});
