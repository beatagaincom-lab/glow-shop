# GLOW: Bestellungen bearbeiten

Stand 20. Oktober 2026. Der Shop ist auf https://glow.bettundbad.ch live.
Produktionsdeployment: `dpl_9uiQHqr3zr6Y9F4VummDZmSKBcHU`, Code `148d88a`.
Der Betreiber hat den Supabase-Serverzugang und
ein separates Stripe-Live-Webhook-Geheimnis ausdrücklich für Vercel Production
freigegeben; beide sind dort als Secrets hinterlegt. Der eingeschränkte
Live-API-Schlüssel ist ausschliesslich in Vercel Production als Secret
gespeichert. Direkte Stripe-Leseprüfungen für Account und Checkout Sessions
lieferten HTTP 200 und bestätigten das Konto `acct_1USDUNLnJPWAKfhq`.
Der Live-Webhook ist aktiviert. Der öffentliche Checkout erzeugt Live-Sitzungen
mit CHF 59.90 pro Decke und kostenlosem Versand. Signierte Diagnoseereignisse
für unbezahlte Live-Sitzungen werden nach kanonischer Stripe-Abfrage mit HTTP 200
bestätigt, ohne eine Bestellung anzulegen. Ungültige Signaturen ergeben HTTP 400.
Es wurde keine echte Zahlung durchgeführt: Speicherung eines tatsächlich
bezahlten Live-Kaufs und E-Mail-Zustellung sind noch nicht Ende zu Ende geprüft.

## Bestätigte Geschäftsangaben

- Betreiber: Bernard Fries, Marke Bett & Bad
- Kontakt: bernardfries7@gmail.com
- Versand und Rücksendungen: Bellariastrasse 47, 8038 Zürich, Schweiz
- Versand durch Bernard selbst, nur Schweiz, kostenlos
- Endpreis CHF 59.90 pro Decke; keine Mehrwertsteuerpflicht laut Betreiber
- Lieferziel ca. vier Tage nach Zahlung
- Alle fünf Motive verfügbar; keine numerischen Lagerbestände übermittelt
- Freiwillige Rückgabe innerhalb 14 Tagen nach Erhalt für unbenutzte,
  ungewaschene Ware. Rückporto beim Kunden, ausser bei Mängeln/Falschlieferung.
  Erstattung innerhalb 14 Tagen nach Rückerhalt und Prüfung.

## Tägliche Bearbeitung nach Freischaltung

1. Im Supabase-Projekt `qvcarifkppszjvlhrndn` den Table Editor öffnen.
   Nur `glow_live_orders` bearbeiten. `glow_orders` enthält ausschliesslich
   Tests und darf niemals Versand auslösen.
2. `fulfillment_status = paid` filtern, älteste Bestellungen zuerst.
3. Vor Versand die Zahlung im richtigen Stripe-Konto Bett und Bad prüfen:
   bezahlt, nicht zurückerstattet oder strittig. Lieferadresse und Artikel aus
   der Bestellung übernehmen. Fehlende Bestellungen oder Widersprüche zuerst
   klären; weder Browser-Screenshots noch Rückkehrseiten sind Zahlungsbelege.
4. Status auf `packing` setzen; Motiv und Menge prüfen und verpacken.
5. Nach tatsächlichem Versand `shipped`, `shipped_at` und, soweit vorhanden,
   `tracking_number` eintragen. Kunden eine Versandbestätigung senden.
6. Bei Rückgabe Eingang prüfen, Erstattung in Stripe ausführen und deren
   Erfolg kontrollieren. `returned` oder `cancelled` in Supabase ist nur ein
   Bearbeitungsstatus und führt selbst KEINE Erstattung aus.

Die Tabelle ist vor anonymen und normalen angemeldeten API-Nutzern gesperrt.
Zugriff für Bernard erfolgt über sein Supabase-Dashboard. Keine geheimen
Schlüssel oder Kundendaten in GitHub, Screenshots oder öffentliche Dateien.
Bestandsreservierungen und automatische Versandetiketten sind nicht eingebaut.
Bei ausverkauftem Motiv den Verkauf vor weiteren Bestellungen sperren.

## Einrichtung und verbleibende Betriebsprüfung

- Produktions-Live-Schlüssel ist in Vercel hinterlegt und das korrekte Konto
  lesend geprüft. Checkout-Schreibzugriff und Verwendung im Deployment sind
  über den öffentlichen Kaufstart geprüft. Keine Geheimnisse im Repository.
- Supabase-Serverzugang ist für Preview und Production freigegeben und in
  Vercel als Secret gespeichert. Eigener Production-Signaturschlüssel ist
  hinterlegt. Live-Webhook `we_1USgwfLnJPWAKfhqVL5jbWW0` zeigt auf
  `https://glow.bettundbad.ch/api/stripe-webhook`, API-Version
  `2026-09-30.endive`, und empfängt nach Aktivierung
  `checkout.session.completed` / `checkout.session.async_payment_succeeded`.
  Er ist aktiviert. Kein Duplikat anlegen.
- `STRIPE_MODE=live`, `VITE_SHOP_MODE=live`,
  `APP_URL=https://glow.bettundbad.ch`, `CHECKOUT_ENABLED=true` und
  `LIVE_CHECKOUT_APPROVED=true` sind für Production gesetzt.
  `VERCEL_ENV=production` setzt Vercel beim Produktionsdeployment automatisch.
  Zum Pausieren neuer Käufe nur `CHECKOUT_ENABLED=false` setzen:
  Webhooks und Zahlungsstatus müssen für bereits begonnene Käufe weiterlaufen.
  Änderungen an Umgebungsvariablen brauchen ein neues Deployment.
- Stripe-Zahlungsbelege für erfolgreiche Zahlungen sind laut Screenshot
  des Betreibers aktiviert. Standardsprache dort aktuell Englisch.
  Der Shop selbst sendet keine zusätzlichen Bestell- oder Versand-E-Mails.
  Zustellung beim ersten echten Kauf prüfen; Versandbestätigung manuell senden.
- Datenschutz enthält die verifizierte Datenbankregion Frankfurt,
  internationale Verarbeitung und die Aufbewahrung von Buchungsbelegen.
- Herstellerbildrechte bleiben Verantwortung des Betreibers; KI-Abbildungen
  bleiben markiert.
- Beim ersten autorisierten echten Kauf Speicherung und E-Mail-Zustellung
  gemeinsam abnehmen. Eine echte Testzahlung nur mit
  ausdrücklichem Auftrag und festgelegtem Betrag durchführen.
- Live-Stripe meldet charges_enabled und payouts_enabled=true.
  Auszahlungen sind aktuell manuell: im Stripe-Dashboard selbst anstossen
  oder dort einen gewünschten Zeitplan einstellen.

## Prüfnachweise

`npm test`: 12 Tests erfolgreich; Warenkorbvalidierung, serverseitige Preise,
Wiederholungen, Signaturen, Speicherfehler sowie Trennung von Test und Live.
Vor jeder Live-Checkout-Erstellung prüft der Server den Datenbankzugriff ohne
Kundendaten abzurufen. Das ersetzt keine Garantie gegen spätere Ausfälle:
Bei Speicherfehlern antwortet der Webhook mit 503, damit Stripe erneut zustellt.
`npm run build` prüft TypeScript und erzeugt den Preview-Build.
Die Live-Datenbanktabelle ist angelegt, RLS aktiv, ohne Browserrechte.
Ein Live-End-to-End-Kauf ist noch nicht durchgeführt.

Rechts-/Datenschutzreferenzen für die Ausarbeitung:
[KMU-Portal Rückgabe](https://www.kmu.admin.ch/de/widerrufsrecht-in-der-schweiz-und-der-eu),
[EDÖB Datenschutzerklärungen](https://www.edoeb.admin.ch/de/datenschutzerklaerungen-im-internet).
[KMU Aufbewahrung von Geschäftsbüchern](https://www.kmu.admin.ch/de/elektronische-aufbewahrung-der-geschaeftsbuecher).
