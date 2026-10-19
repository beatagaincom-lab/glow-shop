import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Expand, ChevronLeft, ChevronRight } from "lucide-react";
import { products, money, PRICE, type Product } from "./data";
import { Accordion, GlowButton, Modal, Quantity } from "./components";

function featuredImage(product: Product) {
  return product.images.find((im) => im.featured) || product.images.find((im) => im.staged) || product.images[0];
}

export default function ProductChooser({
  product,
  onSelect,
  onAdd,
  quantity,
  onQuantity,
}: {
  quantity: number;
  onQuantity: (n: number) => void;
  product: Product;
  onSelect: (id: string) => void;
  onAdd: (id: string, qty: number) => boolean;
}) {
  const [image, setImage] = useState(() => product.images.indexOf(featuredImage(product))),
    [zoom, setZoom] = useState(false),
    [added, setAdded] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    setImage(product.images.indexOf(featuredImage(product)));
    setAdded(false);
  }, [product.id]);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [added]);
  const selectedImage = product.images[image] || product.images[0];
  return (
    <section
      className="product-section section-shell"
      id="decken"
      aria-labelledby="collection-title"
    >
      <div className="collection-heading">
        <span className="section-number">01 / DEINE DECKE</span>
        <h2 id="collection-title">
          Welches Motiv
          <br />
          <em>leuchtet für dich?</em>
        </h2>
        <p>Fünf Motive. Ein kleines bisschen Abendzauber.</p>
      </div>
      <div className="motif-picker" role="group" aria-label="Motiv auswählen">
        {products.map((p) => (
          <button
            key={p.id}
            aria-pressed={p.id === product.id}
            onClick={() => onSelect(p.id)}
            className={`motif ${p.id === product.id ? "selected" : ""}`}
          >
            <span className="motif-image">
              <img
                src={`/images/${featuredImage(p).src}-320.webp`}
                alt=""
                loading="lazy"
                width="160"
                height="100"
              />
              {p.id === product.id && (
                <span className="motif-check">
                  <Check size={12} />
                </span>
              )}
            </span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <div className="product-layout">
        <div className="product-gallery">
          <div className={`product-main-image ${selectedImage.staged ? "is-editorial" : ""}`}>
            <AnimatePresence mode="sync" initial={false}>
              <motion.img
                key={selectedImage.src}
                src={`/images/${selectedImage.src}-960.webp`}
                srcSet={`/images/${selectedImage.src}-640.webp 640w, /images/${selectedImage.src}-960.webp 960w, /images/${selectedImage.src}-1440.webp ${selectedImage.staged ? 1122 : 1440}w`}
                sizes="(max-width: 760px) 100vw, 55vw"
                alt={selectedImage.alt}
                style={selectedImage.featured ? { objectPosition: "center top" } : undefined}
                initial={reduce ? false : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35 }}
                width="960"
                height="720"
              />
            </AnimatePresence>
            <button
              className="zoom-button icon-button"
              aria-label="Produktbild vergrössern"
              onClick={() => setZoom(true)}
            >
              <Expand size={19} />
            </button>
            <span className="image-origin">{selectedImage.staged ? "KI-Wohnszene · nach Originalreferenz" : "Original-Produktfotografie"}</span>
          </div>
          <div className="thumbnails" aria-label="Produktbilder">
            {product.images.map((im, i) => (
              <button
                key={im.src}
                aria-pressed={i === image}
                aria-label={`Bild ${i + 1}: ${im.alt}`}
                onClick={() => setImage(i)}
              >
                <img
                  src={`/images/${im.src}-320.webp`}
                  alt=""
                  loading="lazy"
                  width="100"
                  height="75"
                />
                {im.staged && <span className="thumbnail-label">Wohnszene</span>}
              </button>
            ))}
            <span className="gallery-count">
              {image + 1} / {product.images.length}
            </span>
          </div>
        </div>
        <div className="product-info" aria-live="polite">
          <div className="product-brand">FLAIR · GLOW IN THE DARK</div>
          <h3>Flair {product.name}</h3>
          <p className="product-subtitle">{product.subtitle}</p>
          <div className="price">{money(PRICE)}</div>
          <div className="price-note">Preis pro Decke · Aktuell nur Testkäufe</div>
          <p className="delivery-estimate">Kostenloser Versand in der Schweiz · geplante Lieferung in ca. 4 Tagen.</p>
          <div className="specs">
            <span>150 × 200 cm</span>
            <span>100 % Polyester · 280 g/m²</span>
            <span>{product.color}</span>
          </div>
          <div className="purchase-row">
            <Quantity value={quantity} onChange={onQuantity} />
            <GlowButton
              onClick={() => {
                setAdded(onAdd(product.id, quantity));
              }}
              className={added ? "is-added" : ""}
            >
              {added ? "In deiner Tasche" : "In die Tasche"}
            </GlowButton>
          </div>
          <p className="purchase-note">
            Deine Tasche bleibt gespeichert. Ganz ohne Konto.
          </p>
          <Accordion title="Material & Pflege">
            <p>
              Weicher Polyester-Flanell, 100 % Polyester. Bei 30 °C im
              Schonwaschgang waschen. Bei niedriger Temperatur trocknergeeignet.
              Bügelfrei, nicht bleichen und nicht chemisch reinigen.
            </p>
            <p className="subtle">Artikel {product.sku}</p>
          </Accordion>
          <Accordion title="Lieferung & Rückgabe">
            <p>
              Für den Verkaufsstart sind kostenloser Versand innerhalb der Schweiz
              und eine Lieferzeit von ca. 4 Tagen vorgesehen. Die Rückgaberegeln
              werden vor dem Verkaufsstart verbindlich ergänzt. Testkäufe lösen
              keine Lieferung aus.
            </p>
          </Accordion>
        </div>
      </div>
      <Modal
        open={zoom}
        onClose={() => setZoom(false)}
        title={`Flair ${product.name}`}
        className="image-modal"
      >
        <img
          src={`/images/${selectedImage.src}-1440.webp`}
          alt={selectedImage.alt}
        />
        {selectedImage.staged && <p className="scene-label">KI-inszenierte Wohnszene. Für Muster, Farbe und Stoffdetails sind die Originalfotos massgeblich.</p>}
        <div className="lightbox-controls">
          <button
            className="icon-button"
            disabled={image === 0}
            aria-label="Vorheriges Bild"
            onClick={() => setImage(image - 1)}
          >
            <ChevronLeft />
          </button>
          <span>
            {image + 1} / {product.images.length}
          </span>
          <button
            className="icon-button"
            disabled={image === product.images.length - 1}
            aria-label="Nächstes Bild"
            onClick={() => setImage(image + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </Modal>
    </section>
  );
}
