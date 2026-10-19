import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  Sun,
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

export default function App() {
  const [selected, setSelected] = useState("stars"),
    [quantity, setQuantity] = useState(1),
    [cart, setCart] = useState<CartLine[]>(readCart),
    [bagOpen, setBagOpen] = useState(false),
    [menuOpen, setMenuOpen] = useState(false),
    [night, setNight] = useState(false),
    [nightProduct, setNightProduct] = useState("stars"),
    [info, setInfo] = useState(""),
    [toast, setToast] = useState(""),
    [inShop, setInShop] = useState(false);
  const reduce = useReducedMotion(),
    product = products.find((p) => p.id === selected)!,
    effectProduct = products.find((p) => p.id === nightProduct)!;
  const first = useRef(true);
  const count = cart.reduce((n, l) => n + l.quantity, 0);
  useEffect(() => {
    const id = location.hash.slice(1);
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
      if (params.get("checkout") === "cancelled")
        setToast("Deine Tasche ist noch da. Nimm dir Zeit.");
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
  }
  function select(id: string) {
    setSelected(id);
    setQuantity(1);
    const p = products.find((p) => p.id === id)!;
    if (p.night) setNightProduct(id);
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
                src="/images/hero-960.webp"
                srcSet="/images/hero-640.webp 640w, /images/hero-960.webp 960w, /images/hero-1440.webp 1440w"
                sizes="(max-width:760px) 100vw, 50vw"
                alt="Inszenierte Wohnszene: eine graue Stars-Decke auf einem cremefarbenen Sessel im warmen Abendlicht"
                width="1024"
                height="1536"
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
        <section
          id="leuchten"
          className={`glow-section ${night ? "is-night" : ""}`}
          aria-labelledby="glow-title"
        >
          <div className="glow-inner section-shell">
            <Reveal className="glow-copy">
              <span className="section-number">
                02 / EIN KLEINES BISSCHEN MAGIE
              </span>
              <h2 id="glow-title">
                Mach den
                <br />
                <em>Abend an.</em>
              </h2>
              <p>
                Am Tag kuschelig.
                <br />
                Im Dunkeln besonders.
              </p>
              <div className="day-night" role="group" aria-label="Lichtansicht">
                <span className={`switch-track ${night ? "at-night" : ""}`} />
                <button aria-pressed={!night} onClick={() => setNight(false)}>
                  <Sun size={18} />
                  Tag
                </button>
                <button aria-pressed={night} onClick={() => setNight(true)}>
                  <Moon size={17} />
                  Nacht
                </button>
              </div>
              <p className="glow-explainer">
                Die Motive leuchten im Dunkeln sanft nach.
                <br />
                Entdecke die Ansichten des Herstellers.
              </p>
              <div
                className="effect-motifs"
                aria-label="Motiv für Leuchtansicht"
              >
                {products
                  .filter((p) => p.night)
                  .map((p) => (
                    <button
                      key={p.id}
                      aria-pressed={nightProduct === p.id}
                      onClick={() => setNightProduct(p.id)}
                    >
                      {p.name}
                    </button>
                  ))}
              </div>
            </Reveal>
            <div className="glow-visual">
              <div className="glow-image">
                <AnimatePresence mode="sync" initial={false}>
                  <motion.img
                    className={
                      night
                        ? `night-photo night-${effectProduct.id}`
                        : undefined
                    }
                    key={effectProduct.id + String(night)}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.7 }}
                    src={`/images/${night ? effectProduct.night : effectProduct.images[0].src}-960.webp`}
                    alt={`${night ? "Leuchtansicht" : "Tagesansicht"} Flair ${effectProduct.name}, Originalbild des Herstellers`}
                    width="960"
                    height="760"
                    loading="lazy"
                  />
                </AnimatePresence>
              </div>
              <p>
                {night ? "Leuchtansicht" : "Tagesansicht"} des Herstellers ·{" "}
                {effectProduct.name}
                <span>
                  Helligkeit und Dauer hängen von den Lichtbedingungen ab.
                </span>
              </p>
            </div>
          </div>
        </section>
        <section className="editorial section-shell">
          <Reveal className="editorial-picture">
            <img
              src="/images/evening-960.webp"
              srcSet="/images/evening-640.webp 640w, /images/evening-960.webp 960w, /images/evening-1440.webp 1440w"
              sizes="(max-width:760px) 100vw, 55vw"
              alt="Inszenierte Wohnszene: Eine Frau liest auf dem Sofa unter der grauen Stars-Decke"
              width="1536"
              height="1024"
              loading="lazy"
            />
            <span>Inszenierte Wohnwelt</span>
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
                keine Lieferung. Verbindliche Preise, Versand- und
                Rückgabebedingungen ergänzen wir vor dem Start.
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
              Verbindliche Preis-, Versand- und Anbieterangaben werden vor dem
              Verkaufsstart ergänzt.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}
