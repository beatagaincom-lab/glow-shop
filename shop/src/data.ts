export type Product = {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  color: string;
  images: { src: string; alt: string; staged?: boolean }[];
  night?: string;
};
export const PRICE = 5990;
export const money = (cents: number) => `CHF ${(cents / 100).toFixed(2)}`;
export const products: Product[] = [
  {
    id: "stars",
    sku: "004035.150.800",
    name: "Stars",
    subtitle: "Ein kleiner Sternenhimmel. Ganz für dich.",
    color: "Grau mit hellen Sternen",
    images: [
      {
        src: "stars-room",
        alt: "Original Flair Stars, graue Kuscheldecke mit hellen Sternen auf einem Sessel",
      },
      {
        src: "stars-folded",
        alt: "Flair Stars gefaltet, Original-Produktfotografie",
      },
      { src: "stars-pack", alt: "Flair Stars mit Original-Banderole" },
      { src: "stars-v3", alt: "KI-Wohnszene nach Originalreferenz: Stars im Zürcher Abendlicht", staged: true },
    ],
    night: "stars-night",
  },
  {
    id: "unicorn",
    sku: "004037.150.800",
    name: "Unicorn",
    subtitle: "Ein bisschen Fantasie. Viel zum Einkuscheln.",
    color: "Pastellbunt mit Einhörnern",
    images: [
      {
        src: "unicorn-room",
        alt: "Original Flair Unicorn mit pastellfarbenen Einhornmotiven auf einem Sessel",
      },
      { src: "unicorn-folded", alt: "Original Flair Unicorn gefaltet" },
      { src: "unicorn-pack", alt: "Original Flair Unicorn mit Banderole" },
      { src: "unicorn-v3", alt: "KI-Wohnszene nach Originalreferenz: Unicorn im sanften Morgenlicht", staged: true },
    ],
    night: "unicorn-night",
  },
  {
    id: "hearts",
    sku: "004084.150.071",
    name: "Hearts",
    subtitle: "Für die kleinen Herzensmomente.",
    color: "Grau mit pinken Herzen",
    images: [
      {
        src: "hearts-room",
        alt: "Original Flair Hearts, graue Decke mit pinken Herzen und Detailansicht",
      },
      {
        src: "hearts-glow",
        alt: "Original Flair Hearts mit Leuchteffekt im Bildeinsatz",
      },
      { src: "hearts-v4", alt: "KI-Wohnszene nach Originalreferenz: Eingekuschelt in Hearts", staged: true },
    ],
  },
  {
    id: "raket",
    sku: "004085.150.800",
    name: "Raket",
    subtitle: "Kleine Auszeit. Grosses Universum.",
    color: "Blaugrau mit Weltraummotiven",
    images: [
      {
        src: "raket-room",
        alt: "Original Flair Raket mit Weltraummotiven und Leuchteinsatz",
      },
      { src: "raket-v3", alt: "KI-Wohnszene nach Originalreferenz: Raket in der Leseecke", staged: true },
    ],
  },
  {
    id: "schmetterlinge",
    sku: "004343.150.800",
    name: "Schmetterlinge",
    subtitle: "Leicht im Motiv. Weich im Gefühl.",
    color: "Hellgrau mit bunten Schmetterlingen",
    images: [
      {
        src: "butterfly-room",
        alt: "Original Flair Schmetterlinge auf einem Sessel",
      },
      {
        src: "butterfly-folded",
        alt: "Original Flair Schmetterlinge gefaltet",
      },
      {
        src: "butterfly-pack",
        alt: "Original Flair Schmetterlinge mit Verpackungsbanderole",
      },
      { src: "butterfly-v3", alt: "KI-Wohnszene nach Originalreferenz: Schmetterlinge am Gartenfenster", staged: true },
    ],
    night: "butterfly-night",
  },
];
export type CartLine = { id: string; quantity: number };
export function readCart(): CartLine[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("glow-bag-v1") || "[]",
    );
    if (!Array.isArray(value)) return [];
    const map = new Map<string, number>();
    for (const line of value)
      if (
        line &&
        typeof line.id === "string" &&
        products.some((p) => p.id === line.id) &&
        Number.isInteger(line.quantity) &&
        line.quantity > 0
      )
        map.set(line.id, Math.min(10, line.quantity));
    return [...map].map(([id, quantity]) => ({ id, quantity }));
  } catch {
    return [];
  }
}
