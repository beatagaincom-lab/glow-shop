import Stripe from "stripe";

// Probe unsigned requests without following redirects. Never print endpoint URLs:
// a protected preview URL may carry an automation bypass credential.
async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_test_")) throw new Error("sandbox_key_required");
  const stripe = new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
  const account = await stripe.accounts.retrieve();
  if (account.id !== "acct_1USDUWLLnPcxPmsT") throw new Error("wrong_account");
  let found = 0;
  for await (const endpoint of stripe.webhookEndpoints.list({ limit: 100 })) {
    const url = new URL(endpoint.url);
    if (url.pathname !== "/api/stripe-webhook" || endpoint.status !== "enabled") continue;
    if (endpoint.livemode) throw new Error("unexpected_live_endpoint");
    found++;
    const response = await fetch(url, {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.text();
    const reachesSignatureCheck = response.status === 400 && body === '{"received":false}';
    console.log(JSON.stringify({
      endpoint: endpoint.id,
      status: response.status,
      redirects: response.status >= 300 && response.status < 400,
      reachesSignatureCheck,
    }));
    if (!reachesSignatureCheck) process.exitCode = 1;
    if (url.searchParams.has("x-vercel-set-bypass-cookie")) {
      console.error("Remove x-vercel-set-bypass-cookie from server-to-server webhook URLs.");
      process.exitCode = 1;
    }
  }
  if (!found) throw new Error("no_enabled_glow_endpoint");
}

main().catch(() => {
  console.error("Webhook route check failed. Check sandbox credentials and connectivity; no credentials or payloads were logged.");
  process.exitCode = 1;
});
