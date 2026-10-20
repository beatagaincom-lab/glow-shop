# GLOW: Bestellungen bearbeiten

Stand 20. Oktober 2026. Der Shop ist weiterhin im Testbetrieb.
Live-Code ist vorbereitet. Der Betreiber hat den Supabase-Serverzugang und
ein separates Stripe-Live-Webhook-Geheimnis ausdrücklich für Vercel Production
freigegeben; beide sind dort als Secrets hinterlegt. Der Live-API-Schlüssel
fehlt noch. Der Live-Webhook ist vorbereitet, aber bewusst deaktiviert.
Die Produktionskonfiguration ist noch nicht abschliessend geprüft.

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

## Noch vor echten Verkäufen auszuführen

- Produktions-Live-Schlüssel sicher in Vercel hinterlegen, korrektes Konto
  prüfen. Keine Geheimnisse im Chat oder im Repository.
- Supabase-Serverzugang ist für Preview und Production freigegeben und in
  Vercel als Secret gespeichert. Eigener Production-Signaturschlüssel ist
  hinterlegt. Live-Webhook `we_1USgwfLnJPWAKfhqVL5jbWW0` zeigt auf
  `https://glow.bettundbad.ch/api/stripe-webhook`, API-Version
  `2026-09-30.endive`, und empfängt nach Aktivierung
  `checkout.session.completed` / `checkout.session.async_payment_succeeded`.
  Er ist bis zur fertigen Live-Einrichtung deaktiviert. Kein Duplikat anlegen.
- `STRIPE_MODE=live`, `VITE_SHOP_MODE=live`,
  `APP_URL=https://glow.bettundbad.ch`, `CHECKOUT_ENABLED=true` und
  `LIVE_CHECKOUT_APPROVED=true` erst beim koordinierten Start setzen.
  `VERCEL_ENV=production` setzt Vercel beim Produktionsdeployment automatisch.
  Zum Pausieren neuer Käufe nur `CHECKOUT_ENABLED=false` setzen:
  Webhooks und Zahlungsstatus müssen für bereits begonnene Käufe weiterlaufen.
  Aktuell stehen `CHECKOUT_ENABLED` und `LIVE_CHECKOUT_APPROVED` in Production
  ausdrücklich auf `false`; es wurde kein Produktionsdeployment durchgeführt.
- Automatische Bestellbestätigung und Zahlungsbelege einrichten und
  Zustellung prüfen. Der aktuelle Code sendet noch keine Bestell-E-Mails.
- Datenschutz vor Live-Start um geprüfte Speicherfristen, Hostingregion,
  Datenübermittlung und zutreffende Vertragsgrundlagen ergänzen.
- Originalbilder-Nutzungsrecht sicherstellen; KI-Abbildungen bleiben markiert.
- Produktionsbuild, HTTPS, Zahlung, Webhook, Speicherung, E-Mail und mobile
  Rückkehrseite gemeinsam abnehmen. Eine echte Testzahlung nur mit
  ausdrücklichem Auftrag und festgelegtem Betrag durchführen.
- Live-Stripe meldet charges_enabled und payouts_enabled=true.
  Auszahlungen sind aktuell manuell: im Stripe-Dashboard selbst anstossen
  oder dort einen gewünschten Zeitplan einstellen.

## Prüfnachweise

`npm test` prüft Warenkorbvalidierung, serverseitige Preise, Wiederholungen,
Signaturen, Speicherfehler sowie Trennung von Test und Live.
`npm run build` prüft TypeScript und erzeugt den Preview-Build.
Die Live-Datenbanktabelle ist angelegt, RLS aktiv, ohne Browserrechte.
Ein Live-End-to-End-Kauf ist noch nicht durchgeführt.

Rechts-/Datenschutzreferenzen für die Ausarbeitung:
[KMU-Portal Rückgabe](https://www.kmu.admin.ch/de/widerrufsrecht-in-der-schweiz-und-der-eu),
[EDÖB Datenschutzerklärungen](https://www.edoeb.admin.ch/de/datenschutzerklaerungen-im-internet).
