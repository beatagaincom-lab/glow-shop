import Stripe from "stripe";
import { getStripe, reply } from "../server/stripe.mjs";
import { orderFromSession, saveOrder } from "../server/orders.mjs";
import { paymentMode } from "../server/mode.mjs";

export const config = { api: { bodyParser: false } };
const supported = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);

export async function readRawBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 1024 * 1024) throw new Error("payload_too_large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export function createWebhook({ stripeFactory = () => getStripe({ requireCheckout: false }), persist = saveOrder } = {}) {
  return async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return reply(res, 405, { received: false });
    }
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return reply(res, 503, { received: false });
    let event;
    try {
      event = Stripe.webhooks.constructEvent(await readRawBody(req), req.headers["stripe-signature"], secret);
    } catch {
      return reply(res, 400, { received: false });
    }
    if (!supported.has(event.type)) return reply(res, 200, { received: true });
    let mode;
    try { mode = paymentMode(); } catch { return reply(res, 503, { received: false }); }
    if (event.livemode !== (mode === "live") || event.account)
      return reply(res, 400, { received: false });
    try {
      const stripe = await stripeFactory();
      const session = await stripe.checkout.sessions.retrieve(event.data.object.id);
      const order = orderFromSession(session, event.id, mode);
      // Acknowledge only after durable storage. Stripe retries transient failures.
      if (order) await persist(order);
      return reply(res, 200, { received: true });
    } catch {
      // Never log addresses, keys or the raw webhook payload.
      return reply(res, 503, { received: false });
    }
  };
}
export default createWebhook();
