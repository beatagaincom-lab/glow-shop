import { validateCart, price } from "./catalog.mjs";

// Validate canonical Stripe data, never browser-provided totals or addresses.
export function orderFromSession(session, eventId, mode = "test") {
  if (session.metadata?.shop !== "glow") return null;
  const live = mode === "live";
  if (!["test", "live"].includes(mode) ||
      session.livemode !== live || !session.id?.startsWith(`cs_${mode}_`))
    throw new Error("unexpected_payment_mode");
  if (session.status !== "complete" || session.payment_status !== "paid") return null;
  const items = validateCart({ items: JSON.parse(session.metadata.cart) });
  const subtotal = items.reduce((sum, item) => sum + item.quantity * price, 0);
  if (session.currency !== "chf" || session.amount_subtotal !== subtotal ||
      session.amount_total !== subtotal || session.total_details?.amount_shipping !== 0 ||
      session.total_details?.amount_discount !== 0 || session.total_details?.amount_tax !== 0)
    throw new Error("unexpected_order_total");
  const shipping = session.collected_information?.shipping_details || session.shipping_details;
  if (!shipping?.name || shipping.address?.country !== "CH" ||
      !shipping.address.line1 || !shipping.address.postal_code || !shipping.address.city ||
      !session.customer_details?.email) throw new Error("missing_order_details");
  return {
    stripe_session_id: session.id,
    stripe_event_id: eventId,
    livemode: live,
    amount_total: session.amount_total,
    currency: "chf",
    items,
    customer_email: session.customer_details.email,
    shipping_name: shipping.name,
    shipping_address: shipping.address,
    fulfillment_status: live ? "paid" : "test_only",
  };
}

export async function saveOrder(order, fetcher = fetch) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key || new URL(base).protocol !== "https:")
    throw new Error("order_store_not_configured");
  const table = order.livemode === true ? "glow_live_orders" : "glow_orders";
  const response = await fetcher(`${base.replace(/\/$/, "")}/rest/v1/${table}?on_conflict=stripe_session_id`, {
    method: "POST",
    headers: {
      apikey: key,
      // Supabase's new sb_secret_ keys are API keys, not JWTs, and must not be
      // sent as bearer tokens. Legacy service_role JWTs still need both headers.
      ...(key.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${key}` }),
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(order),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("order_store_unavailable");
}
