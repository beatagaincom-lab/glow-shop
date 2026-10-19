import { useState, useRef } from "react";
import { ShoppingBag, Trash2, LockKeyhole, Check } from "lucide-react";
import { type CartLine, products, PRICE, money } from "./data";
import { GlowButton, Modal, Quantity } from "./components";
export default function Cart({
  open,
  onClose,
  lines,
  onChange,
  onRemove,
  onChoose,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  onChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onChoose: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const total = lines.reduce((n, l) => n + l.quantity * PRICE, 0);
  const pending = useRef(false);
  const request = useRef({ cart: "", id: "" });
  async function checkout() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const cart = JSON.stringify(lines);
      if (request.current.cart !== cart)
        request.current = { cart, id: crypto.randomUUID() };
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines, requestId: request.current.id }),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({ message: "Der Checkout antwortet gerade nicht. Bitte versuche es erneut." }));
      if (!response.ok)
        throw new Error(
          body.message ||
            "Der Checkout ist gerade nicht verfügbar. Bitte versuche es später erneut.",
        );
      const url = new URL(body.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
        throw new Error("Der Checkout konnte nicht sicher geöffnet werden.");
      window.location.assign(url.href);
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Die Verbindung dauert zu lange. Deine Tasche bleibt gespeichert. Bitte versuche es erneut."
          : e instanceof TypeError
          ? "Keine Verbindung zum Checkout. Bitte prüfe deine Internetverbindung und versuche es erneut. Deine Tasche bleibt gespeichert."
          : e instanceof Error
          ? e.message
          : "Der Checkout konnte nicht geöffnet werden.",
      );
    } finally {
      clearTimeout(timeout);
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <Modal
      open={open}
      onClose={() => {
        setError("");
        onClose();
      }}
      title="Deine Abendbegleiter."
      className="cart-modal"
    >
      {!lines.length ? (
        <div className="cart-empty">
          <ShoppingBag size={44} strokeWidth={1} />
          <h3>Noch Platz für Gemütlichkeit.</h3>
          <p>Welches Motiv darf dich begleiten?</p>
          <GlowButton onClick={onChoose}>Deine Decke finden</GlowButton>
        </div>
      ) : (
        <>
          <fieldset className="cart-lines" disabled={busy} aria-label="Artikel in deiner Tasche">
            {lines.map((line) => {
              const p = products.find((p) => p.id === line.id)!;
              return (
                <article className="cart-line" key={line.id}>
                  <img
                    src={`/images/${p.images[0].src}-320.webp`}
                    width="96"
                    height="110"
                    alt={`Flair ${p.name}`}
                  />
                  <div className="cart-line-info">
                    <h3>Flair {p.name}</h3>
                    <p>150 × 200 cm</p>
                    <Quantity
                      label={`Menge ${p.name}`}
                      value={line.quantity}
                      onChange={(q) => onChange(line.id, q)}
                    />
                  </div>
                  <div className="cart-line-right">
                    <span>{money(line.quantity * PRICE)}</span>
                    <button
                      className="icon-button"
                      aria-label={`${p.name} entfernen`}
                      onClick={() => onRemove(line.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </fieldset>
          <div className="cart-summary">
            <div>
              <span>Zwischensumme</span>
              <strong>{money(total)}</strong>
            </div>
            <p>Kostenloser Versand in der Schweiz · Testkauf ohne Lieferung.</p>
            <div className="checkout-notice">
              <LockKeyhole size={17} />
              <span>Bett und Bad Sandbox · Nur Testdaten verwenden.</span>
            </div>
            <GlowButton onClick={checkout} disabled={busy}>
              {busy ? "Wird geöffnet …" : "Zum Test-Checkout"}
            </GlowButton>
            {error && (
              <p role="alert" className="checkout-error">
                {error}
              </p>
            )}
            <p className="cart-safety">
              <Check size={14} /> Keine Zahlung ohne deine Bestätigung.
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}
