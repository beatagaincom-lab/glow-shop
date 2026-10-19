import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  Moon,
  ArrowDown,
  ArrowUpRight,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { products, PRICE, money, readCart, type CartLine } from "./data";
import {
  Logo,
  Spark,
  Reveal,
  GlowButton,
  Accordion,
  Modal,
} from "./components";
import ProductChooser from "./ProductChooser";
import Cart from "./Cart";
import CheckoutResult from "./CheckoutResult";
import GlowComparison from "./GlowComparison";

export default function App() {
  const [selected, setSelected] = useState(() => {
      const id = new URLSearchParams(location.search).get("motiv");
      return products.some((p) => p.id === id) ? id! : "stars";
    }),
    [quantity, setQuantity] = useState(1),
    [cart, setCart] = useState<CartLine[]>(readCart),
    [bagOpen, setBagOpen] = useState(false),
    [menuOpen, setMenuOpen] = useState(false),
    [info, setInfo] = useState(""),
    [toast, setToast] = useState(""),
    [inShop, setInShop] = useState(false);
  const reduce = useReducedMotion(),
    product = products.find((p) => p.id === selected)!;
  const first = useRef(true);
  const count = cart.reduce((n, l) => n + l.quantity, 0);
  useEffect(() => {
    const id = location.hash.slice(1) || (new URLSearchParams(location.search).has("motiv") ? "decken" : "");
    if (!["decken", "leuchten", "fragen"].includes(id)) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("glow-bag-v1", JSON.stringify(cart));
    } catch {
      /* Shopping continues in memory when storage is unavailable. */
    }
  }, [cart]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const el = document.getElementById("decken");
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInShop(entries[0].isIntersecting),
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      const params = new URLSearchParams(location.search);
      if (params.get("checkout") === "cancelled") {
        setToast("Deine Tasche ist noch da. Nimm dir Zeit.");
        setBagOpen(true);
        params.delete("checkout");
        history.replaceState({}, "", `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`);
      }
    }
  }, []);
  function goShop() {
    setMenuOpen(false);
    setBagOpen(false);
    document.getElementById("decken")?.scrollIntoView({
      behavior: reduce ? "instant" : "smooth",
      block: "start",
    });
  }
  function add(id: string, quantity = 1) {
    const existing = cart.find((l) => l.id === id)?.quantity || 0;
    if (existing + quantity > 10) {
      setToast(`Maximal 10 Decken je Motiv. In deiner Tasche sind bereits ${existing}.`);
      return false;
    }
    setCart((old) => {
      const line = old.find((l) => l.id === id);
      return line
        ? old.map((l) =>
            l.id === id
              ? { ...l, quantity: Math.min(10, l.quantity + quantity) }
              : l,
          )
        : [...old, { id, quantity }];
    });
    setToast(
      `Flair ${products.find((p) => p.id === id)?.name} ist in deiner Tasche.`,
    );
    return true;
  }
  function select(id: string) {
    setSelected(id);
    setQuantity(1);

    const url = new URL(location.href);
    url.searchParams.set("motiv", id);
    history.replaceState({}, "", url);
  }
  return (
    <>
      <CheckoutResult />
      <a className="skip-link" href="#decken">
        Direkt zu den Decken
      </a>
      <div className="preview-strip">
        GLOW Vorschau · Testkäufe möglich · Keine echte Zahlung
      </div>
      <header className="site-header">
        <a href="#" className="brand-link" aria-label="GLOW Startseite">
          <Logo />
        </a>
        <nav aria-label="Hauptnavigation">
          <a href="#decken">Die Decken</a>
          <a href="#leuchten">Der Leuchteffekt</a>
          <a href="#fragen">Gut zu wissen</a>
        </nav>
        <div className="header-actions">
          <button
            className="bag-button icon-button"
            aria-label={`Tasche öffnen, ${count} Artikel`}
            onClick={() => setBagOpen(true)}
          >
            <ShoppingBag size={23} strokeWidth={1.3} />
            {count > 0 && (
              <span className="bag-count" key={count}>
                {count}
              </span>
            )}
          </button>
          <button
            className="menu-button icon-button"
            aria-label="Menü öffnen"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={23} strokeWidth={1.3} />
          </button>
        </div>
      </header>
      <main>
        <section className="hero section-shell">
          <div className="hero-copy">
            <h1>
              Der Tag geht.
              <br />
              <em>Das Leuchten bleibt.</em>
            </h1>
            <p>
              Weiche Kuscheldecken, die im Dunkeln
              <br className="desktop-break" /> ein kleines bisschen zaubern.
            </p>
            <div className="hero-actions">
              <GlowButton onClick={goShop}>Deine Decke finden</GlowButton>
              <a className="text-link" href="#leuchten">
                Den Glow entdecken <ArrowDown size={15} />
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-arch">
              <img
                src="/images/stars-v3-960.webp"
                srcSet="/images/stars-v3-640.webp 640w, /images/stars-v3-960.webp 960w, /images/stars-v3-1440.webp 1122w"
                sizes="(max-width:760px) 100vw, 50vw"
                alt="Inszenierte Wohnszene: eine graue Stars-Decke auf einem Leinensessel im Zürcher Abendlicht"
                width="1122"
                height="1402"
                fetchPriority="high"
              />
              <a
                href="#leuchten"
                className="hero-image-link"
                aria-label="Leuchteffekt entdecken"
              >
                <Moon size={16} />
                <span>Warte, bis es dunkel wird.</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="hero-caption">
              <span>150 × 200 cm</span>
              <i />
              <span>5 Motive</span>
              <i />
              <span>{money(PRICE)}</span>
            </div>
            <p className="scene-label">KI-inszenierte Wohnszene · Originalbilder in der Auswahl</p>
          </div>
        </section>
        <div className="quiet-divider">
          <span>Für Abende, die sich nach Zuhause anfühlen.</span>
          <Spark />
        </div>
        <ProductChooser
          quantity={quantity}
          onQuantity={setQuantity}
          product={product}
          onSelect={select}
          onAdd={add}
        />
        <GlowComparison key={selected} initialProduct={selected} />
        <section className="editorial section-shell">
          <Reveal className="editorial-picture">
            <img
              src="/images/evening-v6-960.webp"
              srcSet="/images/evening-v6-640.webp 640w, /images/evening-v6-960.webp 960w, /images/evening-v6-1440.webp 1440w"
              sizes="(max-width:760px) 100vw, 55vw"
              alt="KI-Alltagsszene: Eine Frau mit Buch und grauer Stars-Decke auf ihrem Sofa"
              width="1536"
              height="1024"
              loading="lazy"
            />
            <span>KI-inszenierte Wohnwelt</span>
          </Reveal>
          <Reveal className="editorial-copy">
            <Spark />
            <h2>
              Heute bleibt
              <br />
              <em>der Abend bei dir.</em>
            </h2>
            <p>
              Ein Buch. Dein Lieblingsplatz. Und eine Decke, unter der aus einem
              ganz normalen Abend deiner wird.
            </p>
            <a className="text-link" href="#decken">
              Finde deinen Abendbegleiter <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </section>
        <section id="fragen" className="faq section-shell">
          <div>
            <span className="section-number">03 / GUT ZU WISSEN</span>
            <h2>
              Gemütlich.
              <br />
              <em>Und unkompliziert.</em>
            </h2>
            <p>Alles Wichtige für deinen Abend.</p>
          </div>
          <div>
            <Accordion title="Wie leuchten die Decken?">
              <p>
                Flair beschreibt Leuchtpartikel im Stoff, die im Dunkeln sanft
                Licht abgeben. Die Leuchtwirkung hängt von der vorherigen
                Lichteinwirkung und der Dunkelheit ab. Eine feste Leuchtdauer
                oder Aufladezeit ist vom Hersteller nicht angegeben.
              </p>
            </Accordion>
            <Accordion title="Welche Grösse hat die Decke?">
              <p>
                Alle fünf Motive sind 150 × 200 cm gross. Grosszügig für deinen
                Lieblingsplatz auf dem Sofa oder als zusätzliche Kuscheldecke
                auf dem Bett.
              </p>
            </Accordion>
            <Accordion title="Wie pflege ich meine Decke?">
              <p>
                30 °C Schonwaschgang. Bei niedriger Temperatur im Trockner
                trocknen. Bügelfrei. Nicht bleichen und nicht chemisch reinigen.
                Beachte auch das Pflegeetikett an deiner Decke.
              </p>
            </Accordion>
            <Accordion title="Aus welchem Material sind die Decken?">
              <p>
                Die Flair-Decken bestehen aus 100 % Polyester-Flanell mit einem
                Flächengewicht von 280 g/m². Weich und kuschelig, mit einem
                leuchtenden Motiv.
              </p>
            </Accordion>
            <Accordion title="Kann ich bereits bestellen?">
              <p>
                GLOW ist aktuell in Vorbereitung. Du kannst alle Motive ansehen
                und deine Tasche zusammenstellen. Du kannst den Kauf mit Stripe
                im Testmodus ausprobieren. Dabei erfolgt keine echte Zahlung und
                keine Lieferung. Der Preis beträgt CHF 59.90 pro Decke.
                Versand in der Schweiz ist für den geplanten Start kostenlos;
                die Rückgaberegeln ergänzen wir vor dem Start.
              </p>
            </Accordion>
          </div>
        </section>
      </main>
      <footer className="site-footer section-shell">
        <div className="footer-main">
          <div>
            <Logo />
            <p>
              Eine Auswahl von{" "}
              <a
                href="https://www.bettundbad.ch/"
                target="_blank"
                rel="noreferrer"
              >
                Bett & Bad <ArrowUpRight size={12} />
              </a>
            </p>
          </div>
          <nav aria-label="Informationen">
            <a
              href="https://www.bettundbad.ch/"
              target="_blank"
              rel="noreferrer"
            >
              Kontakt bei Bett & Bad <ArrowUpRight size={13} />
            </a>
            <button onClick={() => setInfo("Datenschutz")}>Datenschutz</button>
            <button onClick={() => setInfo("Über GLOW")}>Über GLOW</button>
          </nav>
          <span className="footer-goodnight">
            Ein bisschen Glow.
            <br />
            <em>Ganz viel Zuhause.</em>
          </span>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} GLOW · Bett & Bad</span>
          <span>Flair-Produkte. Mit Sorgfalt ausgewählt.</span>
        </div>
      </footer>
      <div className="mobile-buy">
        <img
          src={`/images/${product.images[0].src}-320.webp`}
          alt=""
          width="48"
          height="52"
        />
        <div>
          <span>{product.name}</span>
          <strong>{money(PRICE)}</strong>
        </div>
        <GlowButton
          onClick={() => (inShop ? add(product.id, quantity) : goShop())}
        >
          {inShop ? "In die Tasche" : "Auswählen"}
        </GlowButton>
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            <Spark />
            <span>{toast}</span>
            <button
              onClick={() => {
                setToast("");
                setBagOpen(true);
              }}
            >
              Ansehen
            </button>
            <button
              className="toast-close"
              onClick={() => setToast("")}
              aria-label="Hinweis schliessen"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <Cart
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        lines={cart}
        onChange={(id, q) =>
          setCart((old) =>
            old.map((l) => (l.id === id ? { ...l, quantity: q } : l)),
          )
        }
        onRemove={(id) => setCart((old) => old.filter((l) => l.id !== id))}
        onChoose={goShop}
      />
      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="GLOW"
        className="menu-modal"
      >
        <nav>
          {[
            ["Die Decken", "decken"],
            ["Der Leuchteffekt", "leuchten"],
            ["Gut zu wissen", "fragen"],
          ].map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
              {label}
              <ArrowUpRight />
            </a>
          ))}
        </nav>
      </Modal>
      <Modal
        open={!!info}
        onClose={() => setInfo("")}
        title={info}
        className="info-modal"
      >
        {info === "Datenschutz" ? (
          <>
            <p>
              Diese Vorschau lädt Schriften und Bilder vom selben Server. Es
              sind keine Analyse- oder Werbetracker eingebaut.
            </p>
            <p>
              Deine Tasche wird im lokalen Speicher deines Browsers gesichert.
              Du kannst sie über die Tasche leeren oder über deine
              Browser-Einstellungen entfernen. Beim Start eines Testkaufs werden
              deine Auswahl und die im Checkout eingegebenen Daten von Stripe
              verarbeitet. Bitte verwende ausschliesslich Testdaten.
            </p>
            <p>
              Beim Seitenaufruf verarbeitet der Hosting-Anbieter technische
              Zugriffsdaten. Vor Verkaufsstart werden die vollständigen
              Anbieter- und Datenschutzhinweise ergänzt.
            </p>
            <a
              href="https://www.bettundbad.ch/"
              target="_blank"
              rel="noreferrer"
            >
              Zu Bett & Bad
            </a>
          </>
        ) : (
          <>
            <p>
              GLOW ist eine geplante Auswahl von Flair-Leuchtdecken für Bett &
              Bad. Die Produktgalerien zeigen Originalbilder des Herstellers.
              Die Wohnszenen auf dieser Seite wurden KI-gestützt auf Basis des
              echten Produkts inszeniert.
            </p>
            <p>
              Der Shop ist eine Vorschau. Stripe ist im Testmodus angebunden.
              Der Preis beträgt CHF 59.90 pro Decke. Der geplante Versand in der
              Schweiz ist kostenlos; Anbieterangaben werden vor dem Verkaufsstart
              vervollständigt.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}
