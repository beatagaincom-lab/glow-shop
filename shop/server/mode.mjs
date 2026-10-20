export function paymentMode(env = process.env) {
  if (env.STRIPE_MODE === "live") {
    if (env.VERCEL_ENV !== "production" ||
        env.LIVE_CHECKOUT_APPROVED !== "true" ||
        env.VITE_SHOP_MODE !== "live" ||
        env.APP_URL !== "https://glow.bettundbad.ch")
      throw new Error("live_checkout_not_approved");
    return "live";
  }
  if (env.STRIPE_MODE && env.STRIPE_MODE !== "test")
    throw new Error("invalid_payment_mode");
  return "test";
}

export function expectedAccount(mode) {
  return mode === "live" ? "acct_1USDUNLnJPWAKfhq" : "acct_1USDUWLLnPcxPmsT";
}
