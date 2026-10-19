import { catalog, price, validateCart } from "../server/catalog.mjs";
import { getStripe, appUrl, reply } from "../server/stripe.mjs";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { message: "Bitte verwende den Warenkorb." });
  }
  let items;
  try {
    items = validateCart(
      typeof req.body === "string" ? JSON.parse(req.body) : req.body,
    );
  } catch {
    return reply(res, 400, {
      message: "Bitte prüfe deine Tasche. Die Auswahl ist ungültig.",
    });
  }
  try {
    const origin = appUrl();
    if (req.headers.origin && req.headers.origin !== origin)
      return reply(res, 403, {
        message: "Bitte öffne den Checkout direkt im GLOW-Shop.",
      });
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "de",
      line_items: items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "chf",
          unit_amount: price,
          product_data: {
            name: `Flair ${catalog[item.id].name}`,
            description: "GLOW Testkauf · Leuchtdecke 150 × 200 cm",
            metadata: { sku: catalog[item.id].sku },
          },
        },
      })),
      shipping_address_collection: { allowed_countries: ["CH"] },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Testversand (keine Lieferung)",
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "chf" },
          },
        },
      ],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      custom_text: {
        submit: {
          message:
            "Testkauf: Es erfolgt keine echte Zahlung und keine Lieferung.",
        },
      },
      metadata: { shop: "glow", cart: JSON.stringify(items) },
    });
    return reply(res, 200, { url: session.url });
  } catch {
    return reply(res, 503, {
      message:
        "Der Test-Checkout ist gerade nicht verfügbar. Deine Tasche bleibt gespeichert.",
    });
  }
}
