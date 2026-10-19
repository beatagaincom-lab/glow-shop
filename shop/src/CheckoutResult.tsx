import { useEffect, useState } from "react";
import { Modal, GlowButton, Spark } from "./components";
import { money } from "./data";
export default function CheckoutResult() {
  const [open, setOpen] = useState(
    () => new URLSearchParams(location.search).get("checkout") === "success",
  );
  const [result, setResult] = useState<{ paid: boolean; total: number } | null>(
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
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(e.message || "Die Bestätigung konnte nicht geladen werden.");
      });
    return () => controller.abort();
  }, [open, attempt]);
  function close() {
    setOpen(false);
    history.replaceState({}, "", location.pathname);
  }
  return (
    <Modal
      open={open}
      onClose={close}
      title={result?.paid ? "Dein Test hat funktioniert." : "Dein Testkauf."}
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
              ? `Stripe hat die Testzahlung über ${money(result.total)} bestätigt.`
              : "Die Testzahlung ist noch nicht bestätigt. Es wurde keine Bestellung zur Lieferung freigegeben."}
          </p>
          <p>
            Es wurde kein echtes Geld abgebucht. Es erfolgt keine Lieferung.
            Deine Tasche bleibt zum weiteren Ausprobieren erhalten.
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
