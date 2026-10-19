import { getStripe, reply } from "../server/stripe.mjs";
export default async function handler(req, res) {
  if (req.method !== "GET")
    return reply(res, 405, { message: "Methode nicht erlaubt." });
  const id = new URL(req.url, "https://glow.local").searchParams.get(
    "session_id",
  );
  if (!id || !/^cs_test_[A-Za-z0-9]{20,200}$/.test(id))
    return reply(res, 400, { message: "Ungültige Testbestellung." });
  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.livemode || session.metadata?.shop !== "glow")
      return reply(res, 404, { message: "Testbestellung nicht gefunden." });
    return reply(res, 200, {
      status: session.status,
      paid: session.payment_status === "paid",
      total: session.amount_total,
      currency: session.currency,
    });
  } catch {
    return reply(res, 503, {
      message:
        "Die Zahlungsbestätigung konnte noch nicht abgerufen werden. Bitte versuche es erneut.",
    });
  }
}
