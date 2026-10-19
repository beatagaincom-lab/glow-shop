import { useState, type PointerEvent } from "react";
import { Sun, Moon } from "lucide-react";
import { products } from "./data";
import { Reveal } from "./components";

export default function GlowComparison({ initialProduct }: { initialProduct: string }) {
  const [selected, setSelected] = useState(initialProduct);
  const [day, setDay] = useState(50);
  const product = products.find(p => p.id === selected)!;
  const scene = product.images.find(image => image.staged)!.src;
  const prefix = selected === "schmetterlinge" ? "butterfly" : selected;
  const original = product.night || product.images[selected === "hearts" ? 1 : 0].src;
  function moveDivider(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setDay(Math.round(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100))));
  }
  return (
    <section id="leuchten" className="glow-section is-night" aria-labelledby="glow-title">
      <div className="glow-inner section-shell">
        <Reveal className="glow-copy">
          <span className="section-number">02 / WENN ES DUNKEL WIRD</span>
          <h2 id="glow-title">Ein Abend.<br /><em>Zwei Stimmungen.</em></h2>
          <p>Das Licht wird leiser.<br />Die kleinen Motive bleiben.</p>
          <div className="day-night" role="group" aria-label="Lichtansicht">
            <span className={`switch-track ${day === 0 ? "at-night" : ""}`} style={{opacity: day === 0 || day === 100 ? 1 : 0}} />
            <button aria-pressed={day === 100} onClick={() => setDay(100)}><Sun size={18} />Tag</button>
            <button aria-pressed={day === 0} onClick={() => setDay(0)}><Moon size={17} />Nacht</button>
          </div>
          <p className="glow-explainer">Verschiebe den Regler und entdecke den Unterschied – in derselben Wohnszene.</p>
          <div className="effect-motifs" role="group" aria-label="Motiv für Leuchtansicht">
            {products.map(p => <button key={p.id} aria-pressed={selected === p.id} onClick={() => setSelected(p.id)}>{p.name}</button>)}
          </div>
        </Reveal>
        <div className="glow-visual comparison-visual">
          <div className="comparison-frame" key={selected}
            onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); moveDivider(event); }}
            onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveDivider(event); }}
            onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
          >
            <img src={`/images/${scene}-960.webp`} srcSet={`/images/${scene}-640.webp 640w, /images/${scene}-960.webp 960w, /images/${scene}-1440.webp 1122w`} sizes="(max-width: 760px) 92vw, 48vw" width="1122" height="1402" alt={`KI-Wohnszene Flair ${product.name} bei Licht`} loading="lazy" />
            <img className="comparison-night" style={{clipPath: `inset(0 0 0 ${day}%)`}} src={`/images/${prefix}-night-v1-960.webp`} srcSet={`/images/${prefix}-night-v1-640.webp 640w, /images/${prefix}-night-v1-960.webp 960w, /images/${prefix}-night-v1-1440.webp 1122w`} sizes="(max-width: 760px) 92vw, 48vw" width="1122" height="1402" alt={`KI-Abendvisualisierung Flair ${product.name} mit nachleuchtenden Motiven`} loading="lazy" />
            {day > 12 && <span className="comparison-label label-day"><Sun size={13} />Bei Licht</span>}
            {day < 88 && <span className="comparison-label label-night"><Moon size={13} />Am Abend</span>}
            {day > 0 && day < 100 && <span className="comparison-divider" style={{left: `${day}%`}} aria-hidden="true"><span>↔</span></span>}
          </div>
          <div className="comparison-control">
            <label htmlFor="evening-compare">Dein Blick in den Abend <span>{day === 100 ? "Tag" : day === 0 ? "Nacht" : "Tag & Nacht"}</span></label>
            <input id="evening-compare" type="range" min="0" max="100" value={day} onChange={event => setDay(Number(event.target.value))} aria-label="Tag-Nacht-Vergleich" aria-valuetext={`${day} Prozent Tagesansicht, ${100-day} Prozent Nachtansicht`} />
            <div className="comparison-endpoints"><span>Nacht</span><span>Tag</span></div>
          </div>
          <p className="comparison-caption">KI-Abendvisualisierung · {product.name}<span>Nach Herstellerreferenzen inszeniert. Helligkeit und Dauer sind nicht gemessen und hängen von den Lichtbedingungen ab.</span></p>
          <details className="effect-original" key={`original-${selected}`}>
            <summary>Original-Leuchtansicht des Herstellers ansehen</summary>
            <img src={`/images/${original}-960.webp`} alt={`Original-Leuchtansicht des Herstellers: Flair ${product.name}`} width="540" height="600" loading="lazy" />
            <p>{product.night ? "Originalbild des Herstellers." : "Originalbild mit Leuchteinsatz; keine separate Nachtaufnahme verfügbar."} Auch dieses Bild ist keine Messung der tatsächlichen Leuchtstärke.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
