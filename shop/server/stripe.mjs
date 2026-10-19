import Stripe from "stripe";
export async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (
    process.env.CHECKOUT_ENABLED !== "true" ||
    process.env.STRIPE_MODE !== "test" ||
    !key?.startsWith("sk_test_")
  )
    throw new Error("checkout_disabled");
  const stripe = new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
  const account = await stripe.accounts.retrieve();
  if (account.id !== "acct_1USDUWLLnPcxPmsT") throw new Error("wrong_account");
  return stripe;
}
export function appUrl() {
  const value =
    process.env.APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://127.0.0.1:4173");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.origin !== "http://127.0.0.1:4173")
    throw new Error("invalid_origin");
  return url.origin;
}
export function reply(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}
