import { useEffect, useState, useRef } from "react";
import { Modal, GlowButton, Spark } from "./components";
import { money } from "./data";
export default function CheckoutResult({ onPaid }: { onPaid: () => void }) {
  const paidCallback = useRef(onPaid);
  paidCallback.current = onPaid;
  const [open, setOpen] = useState(
    () => new URLSearchParams(location.search).get("checkout") === "success",
  );
  const [result, setResult] = useState<{ paid: boolean; total: number; livemode: boolean } | null>(
      null,
    ),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setError("");
    const id = new URLSearchParams(location.search).get("session_id") || "";
    fetch(`/api/session-status?session_id=${encodeURIComponent(id)}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.message);
        setResult(body);
        if (body.paid && body.livemode) {
          try {
            const saved = JSON.parse(sessionStorage.getItem("glow-pending-cart") || "null");
            if (saved?.sessionId === id) {
              sessionStorage.removeItem("glow-pending-cart");
              if (saved.cart === localStorage.getItem("glow-bag-v1"))
                paidCallback.current();
            }
          } catch { /* Preserve the bag when storage cannot be checked safely. */ }
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(e.message || "Die Bestätigung konnte nicht geladen werden.");
      });
    return () => controller.abort();
  }, [open, attempt]);
  function close() {
    setOpen(false);
    const url = new URL(location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    history.replaceState({}, "", url);
  }
  return (
    <Modal
      open={open}
      onClose={close}
      title={result?.paid ? result.livemode ? "Vielen Dank für deine Bestellung." : "Dein Test hat funktioniert." : "Deine Zahlungsbestätigung."}
      className="info-modal"
    >
      <Spark className="result-spark" />
      {error ? (
        <>
          <p role="alert">{error}</p>
          <GlowButton onClick={() => setAttempt((n) => n + 1)}>
            Erneut prüfen
          </GlowButton>
        </>
      ) : result ? (
        <>
          <p>
            {result.paid
              ? `Stripe hat die ${result.livemode ? "Zahlung" : "Testzahlung"} über ${money(result.total)} bestätigt.`
              : "Die Zahlung ist noch nicht bestätigt. Es wurde keine Bestellung zur Lieferung freigegeben."}
          </p>
          <p>
            {result.livemode
              ? "Bernard Fries bearbeitet deine Bestellung. Die Lieferung erfolgt voraussichtlich in ca. 4 Tagen nach bestätigter Zahlung. Bei Fragen: bernardfries7@gmail.com."
              : "Es wurde kein echtes Geld abgebucht. Es erfolgt keine Lieferung. Deine Tasche bleibt zum weiteren Ausprobieren erhalten."}
          </p>
          <GlowButton
            onClick={result.paid ? close : () => setAttempt((n) => n + 1)}
          >
            {result.paid ? "Zurück zu GLOW" : "Status erneut prüfen"}
          </GlowButton>
        </>
      ) : (
        <p role="status">Wir prüfen die Bestätigung direkt bei Stripe …</p>
      )}
    </Modal>
  );
}
