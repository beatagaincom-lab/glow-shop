import { LIVE_SHOP } from "./shopMode";
export const deliveryText = "Kostenloser Versand innerhalb der Schweiz. Lieferung voraussichtlich innerhalb von ca. 4 Tagen nach bestätigter Zahlung.";
export const returnText = "Freiwillige Rückgabe: Melde dich innerhalb von 14 Tagen nach Erhalt per E-Mail. Die Decke muss unbenutzt, ungewaschen und vollständig sein. Die Rücksendekosten trägst du; bei falscher oder mangelhafter Lieferung übernehmen wir sie.";

export default function ShopPolicies() {
  return (
    <>
      <h3>Preis & Lieferung</h3>
      <p>CHF 59.90 pro Decke, inklusive Versand in der Schweiz. Es wird keine Mehrwertsteuer erhoben oder ausgewiesen.</p>
      <p>{deliveryText} Bernard Fries übernimmt die Bearbeitung und den Versand. Bei einer Verzögerung informieren wir dich per E-Mail.</p>
      <h3>14 Tage freiwillige Rückgabe</h3>
      <p>{returnText} Eine kurze Prüfung wie im Geschäft ist erlaubt. Deine Rechte bei Mängeln bleiben unberührt.</p>
      <p>Schreibe an <a href="mailto:bernardfries7@gmail.com">bernardfries7@gmail.com</a> und nenne deine Bestellnummer. Sende die Ware sicher verpackt an:</p>
      <p>Bett & Bad · Bernard Fries<br />Bellariastrasse 47<br />8038 Zürich, Schweiz</p>
      <p>Wir erstatten den Kaufpreis spätestens innerhalb von 14 Tagen nach Eingang und Prüfung der Rücksendung über die ursprüngliche Zahlungsart.</p>
      <h3>Beschädigung oder falscher Artikel</h3>
      <p>Kontaktiere uns mit deiner Bestellnummer und einer Beschreibung, möglichst mit Foto. Wir klären Ersatz oder Erstattung und organisieren bei Bedarf die Rücksendung.</p>
      {!LIVE_SHOP && <p className="subtle">Aktuell ist nur ein Testkauf möglich. Es erfolgt keine echte Zahlung und kein Versand. Die obigen Konditionen sind für den Verkaufsstart vorgesehen.</p>}
    </>
  );
}
