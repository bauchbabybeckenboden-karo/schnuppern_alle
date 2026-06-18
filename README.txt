Schnupperbogen — Fragebogen Deploy-Paket (eigenstaendig)
==========================================================

Zweck
-----
Dies ist die Anmeldung fuer eine Schnupperstunde, gueltig fuer ALLE
Kursarten (Schwangerfit, Mamafit, Somatic Yoga, Somatic Koerpermitte
& Beckenboden). Die Kurswahl passiert direkt im Formular (Abschnitt
2), nicht ueber getrennte Dateien.

Das ist NICHT derselbe Fragebogen wie der ausfuehrliche Mamafit-
Aufnahmebogen (separates Paket fuer das Netlify-Projekt
"mamafitfragen"). Falls beide Bogen live gehen sollen, brauchen sie
zwei getrennte Netlify-Projekte (= zwei getrennte GitHub-Repos oder
zwei Ordner mit jeweils eigener netlify.toml).


Inhalt
------
- index.html                              -> der Schnupperbogen
- netlify.toml                            -> Netlify-Konfiguration
- netlify/functions/send-notification.js  -> Mail-Versand-Function
                                              (erkennt fragebogen_typ
                                              "schnupperbogen")

Fehlt noch in diesem Ordner:
- logo.png  -> dieselbe Logo-Datei, die du schon fuer die anderen
               Fragebogen verwendest. Bitte vor dem Hochladen in
               denselben Ordner legen wie die index.html (gleiche
               Ebene, nicht in einen Unterordner).


Deploy ueber GitHub + Netlify
------------------------------
1. Neues GitHub-Repository anlegen (z. B. "bbb-schnupperbogen").

2. Den GESAMTEN Inhalt dieses Ordners in das Repository hochladen/
   pushen - inklusive der Unterstruktur netlify/functions/
   send-notification.js und der logo.png. Per Drag & Drop im
   GitHub-Webinterface ("Add file" -> "Upload files") funktioniert
   das genauso wie per "git push".

3. In Netlify: "Add new site" -> "Import an existing project" ->
   GitHub auswaehlen -> das eben erstellte Repository auswaehlen.

4. Build-Einstellungen muessen nicht manuell gesetzt werden - Netlify
   liest "Publish directory" und "Functions directory" automatisch
   aus der netlify.toml.

5. RESEND_API_KEY setzen (nur einmal pro Netlify-Projekt notwendig):
   - Netlify -> Site configuration -> Environment variables
   - Variable "RESEND_API_KEY" mit dem bestehenden Resend-Key
     hinzufuegen (demselben wie in den anderen Projekten).
   - Danach unter "Deploys" -> "Trigger deploy" -> "Deploy site".

6. Die ausgespielte URL aufrufen und den Bogen einmal komplett
   testweise durchklicken (inkl. Absenden), bevor der Link
   oeffentlich geteilt wird.

7. Aenderungen spaeter: Datei(en) im GitHub-Repo aktualisieren ->
   Netlify deployt automatisch neu, sobald der main-Branch sich
   aendert.


Hinweis zu Supabase
--------------------
Der Schnupperbogen schreibt in dieselbe Tabelle
"fragebogen_antworten" wie die anderen Fragebogen (gleiche
SUPABASE_URL/KEY, direkt im Code hinterlegt). Spalten, die fuer den
Schnupperbogen nicht zutreffen (motivation, beschwerden,
medikamente, becken_beschwerden, entbunden), bleiben bei jeder
Einreichung bewusst leer.

Die schnupperbogen-spezifischen Angaben (kurs, termin, sportverbot,
lied, aufmerksam_geworden) gehen aktuell NUR per Mail an Karoline,
nicht in Supabase - dafuer gibt es noch keine eigenen Spalten. Falls
gewuenscht, koennen entsprechende Text-Spalten in der Tabelle
nachtraeglich angelegt werden, und der Code in index.html kann dann
um die passenden Eintraege in supabaseData ergaenzt werden.


Was im Vergleich zur ersten Version geaendert wurde
-----------------------------------------------------
- Kursabfrage und Terminwunsch teilten sich identische IDs/Namen
  ("becken-group") und liefen technisch als Checkbox-Gruppen, obwohl
  jeweils nur eine Auswahl sinnvoll ist. Beide sind jetzt eigene
  Radio-Gruppen ("kurs", "termin") mit eindeutigen Werten.
- Die Validierung beim Absenden verlangte ein Feld ("meds"), das es
  in diesem Formular gar nicht gibt - dadurch liess sich der Bogen
  nie abschicken. Das ist entfernt; dafuer werden jetzt Terminwunsch
  und die Frage zu koerperlichen Problemen/Sportverbot tatsaechlich
  als Pflichtfelder geprueft (passend zu den Sternchen im Formular).
- Die Kursfrage ist jetzt sichtbar optional (kein Sternchen mehr),
  passend zum Hinweistext "(kein Muss)".
- Abschnittsnummern in den Fehlermeldungen passen jetzt zu den
  tatsaechlichen Abschnitten im Formular.
- Doppelte/verschachtelte HTML-Struktur in Abschnitt 2 & 3 (fehlende
  bzw. ueberzaehlige schliessende divs) ist bereinigt.
- "Koepermitte"-Tippfehler korrigiert; einheitlich "Du" statt
  Wechsel zwischen "Du" und "Ihr" im Sicherheitshinweis.
- Die automatische Packlisten-Mail (ueber EmailJS) wird nur noch
  verschickt, wenn tatsaechlich ein Mamafit-Termin gewaehlt wurde,
  da Inhalt (Baby, Packliste) bei den anderen Kursen nicht passt.
- send-notification.js prueft jetzt, ob der Versand ueber Resend
  tatsaechlich geklappt hat (vorher wurde ein Resend-Fehler nie
  erkannt oder geloggt - die Function meldete immer Erfolg).
- Die E-Mail-Betreffzeile enthaelt jetzt den gewaehlten Kurs in
  Klartext, damit auf einen Blick erkennbar ist, worum es geht.
