# Übergabe: Diamanten-Reich (Schwester-App der Torjäger-App)

Stand der Übergabe: 13.11.2026, zweiter Chat (App gebaut). Dieses Dokument ist für einen **neuen Chat**, der die App veröffentlicht und nach den Antworten des Nutzers nachjustiert. Es enthält alles, was im ersten Chat besprochen, entschieden und geprüft wurde. `AGENTS.md` (wird automatisch geladen) enthält das Dauerhafte, hier steht der Projektstand und der Plan. Der echte Vorname des Kindes steht nie im öffentlichen Repo: Hier heißt die Tochter **Lia** (Platzhalter), im Chat mit dem Nutzer hat sie ihren echten Namen.

## 1. Worum es geht

Der Nutzer (Vater, GitHub-Konto `a-heuberger`, spricht Deutsch, will **so wenig wie möglich selbst tun müssen**) hat für seinen Sohn Ben (9) die **Torjäger-App** bauen lassen: Aufgaben bringen Tore, Karten kosten Minus, Ziele mit Belohnungen, Sticker-Album, Angel-Spiel. Sie läuft seit Ende Oktober 2026 auf den iPhones der Familie (Web-App vom Home-Bildschirm, Daten in Firestore, Zugang über einen geheimen Familienlink). Jetzt soll eine **zweite Version für die Tochter Lia (5, wird bald 6)** entstehen. Sie hat ganz andere Vorlieben.

Wortlaut des Auftrags (Vornamen ersetzt): „Wir benötigen nun eine weitere Version dieser App für meine Tochter. Bitte bereite alles vor und stelle mir Fragen zu den gewünschten Änderungen, da sie natürlich ganz andere Vorlieben hat. Es geht hauptsächlich um Diamanten, Einhörner und Prinzessinnen, wobei der Fokus auf Diamanten liegt. Sie ist erst 5 Jahre alt und wird bald 6, daher sollte die App etwas verspielter und träumerischer gestaltet sein. Es ist wichtig, dass sie Spaß daran hat, die App zu nutzen und Aufgaben zu erledigen, um Belohnungen zu erhalten.“

## 2. Was der Nutzer entschieden hat (zwei Fragerunden, wörtliche Auswahl)

| Frage | Antwort des Nutzers |
|---|---|
| Was wächst und glitzert auf dem Hauptbildschirm? | **Diamantenschatz**: Eine Schatztruhe füllt sich Diamant für Diamant und glitzert immer mehr; Einhorn und Prinzessin begleiten als Figuren. Am stärksten auf Diamanten ausgerichtet. |
| Wer trägt ein, dass eine Aufgabe erledigt ist? | **Das Kind tippt, die Eltern bestätigen.** Das Kind tippt „Geschafft!“, der Diamant funkelt und wartet, bis Mama oder Papa ihn mit einem Tipp freigibt. |
| Abzüge (bei Ben: gelbe und rote Karten)? | **Wie bei Ben**: Eine Verwarnung kostet Diamanten (Minus bei Zielen/Belohnungen). Für das Kind ändert sich nur die Verpackung, siehe nächste Zeile. |
| Aussehen der Verwarnungen? | **Wolken**: gelbe Wolke = Verwarnung (−1 Diamant), Gewitterwolke = rot (−3 Diamanten). Regeln wie bei Ben (zwei offene gelbe = rot, rot höchstens einmal pro Tag, verfallen nie, Eltern können zurücknehmen, kein Einspruch). |
| Wie schnell die erste Belohnung? | **Nach 2 bis 3 Tagen**: erste Stufe nach etwa 10 Diamanten, danach größere Abstände. |
| Extras (Mehrfachauswahl) | **Alle vier**: Sammelalbum, Mini-Spiel, Vorlesen per Tipp, Wochenrückblick. |
| Farbstimmung | **Türkis-Gold „Schatzreich“**: glitzerndes Türkis mit Gold, Meerjungfrau- und Schatzinsel-Gefühl; Diamanten in Weiß, Gold und Rosa. |
| Wie entstehen die Bilder? | **Zusätzlich KI-Bilder** (Magnific) für einzelne große Motive (Einhorn, Prinzessin). Ich nenne vorher den Preis und frage vor jeder Erzeugung. Rest als selbst gezeichnete Vektorgrafik. |

**Hinweis des Nutzers zum Mini-Spiel (mitten in der Arbeit, sinngemäß):** Bei Bens App kann er am Ende die Tore schießen, also die Bälle ins Tor. Bei der Tochter soll es so sein: **Ein Mädchen steht da und gräbt mit der Schaufel in die Erde und holt jeweils Diamanten heraus, und das kann die Tochter immer betätigen.** Er fragte: „Wie viel drückt man immer drauf, und dann tut das Mädchen graben“ (also: wie oft muss man tippen). Bens „Schieß!“-Mechanik (`shootMode`, `U.shots`, Schussleiste, Ball halten = alle) wird damit durch **Graben** ersetzt.

## 3. Vorgaben (umgesetzt; der Nutzer konnte sie noch nicht bestätigen)

Der Nutzer war beim Bau nicht erreichbar und hat gebeten, ohne Rückfragen fertig zu bauen. Alles Folgende ist umgesetzt und im Eltern-Bereich änderbar:

1. **Tipps je Diamant: 3** (1 bis 5). Gedrückt halten gräbt alle. Ein Spatenstich lässt Erde fliegen, das Loch wächst und leuchtet, beim letzten springt der Diamant heraus und fliegt in die Truhe.
2. **Spaß-Funde** an (Wurm, Blume, Stern, Muschel, Marienkäfer …), zählen nicht.
3. **Morgens (Sonne) und Abends (Mond)**, jede Aufgabe hat eine Tageszeit.
4. **Entfallen:** Gegner, Angeln, Konto, Fußball.
5. **Tabs:** Heute · Woche · Schätze · Eltern.
6. **Funkel-Tage in Folge** (Tag mit mindestens einem Diamanten; ein Tag ganz ohne Eintrag unterbricht nicht, ein Tag mit nur „heute nicht“ schon).
7. **App-Name** „Diamanten-Reich“, Repo `diamanten-reich`.
8. **Schätze** 10, 25, 50, 75, 100, 150, 200, 300, 500, Belohnungstexte leer (= „Überraschung!“). Zauberbeutel alle 5 Diamanten, 10 Sticker-Punkte = 1 Bonus-Diamant.
9. Zusätzlich entschieden: **„Heute nicht“** statt „kein Diamant“ (neutral, ohne Minus, kein Gegner). Das Kind kann ein getipptes „Geschafft!“ nicht selbst zurücknehmen (das machen die Eltern). Schätze-Seite zeigt oben den **nächsten** Schatz statt „0 % bis 500“. Wolken erst nach den Hinweisen für Eltern (Empfehlung dort: erste Woche ohne Wolken).

## 4. Offene Fragen an den Nutzer (mit der jetzt eingebauten Vorgabe)

1. **Aufgabenliste:** Vorgabe morgens Zähne putzen, Selbst anziehen, Kuscheltiere aufs Bett; abends Spielzeug aufräumen, Beim Tischdecken helfen, Zähne putzen, Schlafanzug anziehen (täglich, je 1 Diamant). Bitte die echte Liste.
2. **Belohnungen** mindestens für 10, 25, 50 Diamanten (Ideen zum Antippen sind im Eltern-Bereich).
3. **Aussehen der Schatzgräberin** (Haarfarbe, Frisur, Kleidfarbe) und **Name des Einhorns** (Vorgabe „Funkelstern“): wählt man bei der Einrichtung, später im Eltern-Bereich änderbar.
4. **Gerät** des Kindes und wer den **Eltern-Code** kennt (wird bei der Einrichtung gesetzt).
5. **Bestätigung der Vorgaben** aus Abschnitt 3, besonders 3 Tipps je Diamant.
6. **KI-Bilder** (Magnific): nicht erzeugt, da der Preis vorher genannt und freigegeben werden muss. Die Vektorgrafik reicht für den Start.

## 5. Stand der Technik

**Torjäger-App:** unverändert (Branch `main`, nicht angefasst).

**Diamanten-Reich (Branch `schwester-app`):** fertig gebaut, alle Suiten grün am 13.11.: Regeln 62, Claude-Seite 69 (`test/e2e-dia.js`, ersetzt die alten Fußball-Tests e2e/e2e4/e2e6/e2e7), Web-App gegen den Firestore-Emulator alle Prüfungen (einschließlich Graben über zwei Geräte, offline, iPhone-Statusleiste), Unterpfad alle. `docs/` ist eingecheckt (gebaut). Bildschirmfotos in iPhone-Größe erzeugt `test/e2e-dia.js` nach `shots/` (nicht im Repo).

**Vorschau:** Die Claude-Seite (`build/diamanten.html`) ist als **private** Claude-Seite veröffentlicht (Adresse nur im Chat, nicht im Repo), Speicher = Claude-db der Seite, getrennt von Firestore. Zum Ausprobieren; was dort eingetragen wird, wandert nicht in die Web-App.

**Firebase:** unverändert. Die Regeln enthalten weiter nur den Code der Torjäger-App. Ein neuer Code für diese App ist gewürfelt und liegt mit dem fertigen Regeltext (beide Codes) und dem Familienlink nur im Scratchpad der Sitzung vom 13.11. (nicht im Repo). Geht der Scratchpad verloren: neu würfeln (`node tools/familiencode.js`), der alte wurde nie verwendet.

**Noch nicht vorhanden:** Repo `diamanten-reich`, Pages, Code in den Regeln, Prüfung auf einem echten iPhone (Vorlesen: deutsche Stimme da? Ton, Graben mit dem Finger, Statusleiste).

## 6. Code-Landkarte

- `src/logic.js` (rein): `defaultCfg`, `migrateCfg` (`CFG_V = 1`), `HAIR`/`DRESS`/`STYLE`, `SLOTS`, `STICKER_DATA` (40, mit `fact`), `FUN_FINDS`, `buildLedger` (Wolken), `evalDay` (`gain`, `dug`, `waiting`, `claimed`, `result`), `evalWeek`, `computeStats` (`total`, `chest`, `waiting`, `firstWaiting`, `score`, `packs`), `goalList` (mit `gem` je Stufe), `parentAdvice`.
- `src/svg.js`: `gemSVG`/`gemMini`/`gemInner`, `girlSVG`/`girlHeadSVG` (aus `look`), `unicornSVG`, `chestSVG(level)`, `cloudSVG`, `pouchSVG`, `crownSVG`, `IC`, `TAB_IC`, `SVG_DEFS`.
- `src/views.js`: `headerView`, `tabsView`, `gateView`, `cloudTop`, `dayStrip`, `sceneCard` (Szene + Graben-Leiste), `taskCard`/`taskSections`, `extrasCard`, `nextTreasureCard`, `rainbowSVG`/`viewWeek`, `viewAchieve` (nächster Schatz, gekürzte Liste, Album), `viewCoach` (Eltern-Bereich), `taskEditor`.
- `src/actions.js`: `claim`, `setMark`/`bulkMark`, Graben (`digOnce`, `unearth`, `digAll`, `funFind`, `flyGem`), `checkCelebs`/`showNextCeleb`, Wolken (`ex-*`, `cloud-back`), Zauberbeutel (`pack-*`), PIN, Einrichtung (`ob-*`), Einstellungen, Familienlink.
- `src/fx.js`: Töne (Glöckchen), Konfetti, `Hap`, `Say` (Vorlesen). `src/store.js`, `src/cloud.js`: unverändert bis auf das entfernte Konto.

## 7. Datenmodell (umgesetzt)

- `days/<ds>.m[aufgabe]`: `'c'` getippt · `'y'` Diamant · `'n'` heute nicht. `days/<ds>.ev`: `{k:'+', v, t}` Extra-Diamant, `{k:'y'}`/`{k:'r'}` Wolken. `days/<ds>.dg`: ausgegrabene Diamanten.
- `cfg/progress`: `cel` (`g:<id>` Datum erreicht, `p:<ds>` Glitzer-Tag gefeiert), `shown` (Schatz-Feier gezeigt), `packN` (gemeldete Zauberbeutel), `red` (eingelöst), `album`, `foil`.

## 8. Private Eingaben (nicht ins Repo, nicht in Commits, nicht in Screenshots)

- Firebase-Konfiguration und Code der Torjäger-App stehen in deren Familienlink. Daraus gelesen und nur im Scratchpad abgelegt (`privat/firebase-config.json`, `privat/code-torjaeger.txt`).
- Code dieser App, Regeltext mit beiden Codes und Familienlink: ebenfalls nur im Scratchpad (`privat/code-diamanten.txt`, `privat/regeln-beide-codes.txt`, `privat/familienlink-diamanten.txt`).

## 9. Nächste Schritte

1. Antworten des Nutzers auf Abschnitt 4 einarbeiten (Aufgaben, Belohnungen; Aussehen stellt er bei der Einrichtung selbst ein).
2. Veröffentlichung nach Abschnitt 10 (Auftrag für das Chrome-Fenster liegt im Chat bereit).
3. Test auf dem echten iPhone durch den Nutzer; danach Feinschliff.
4. Optional KI-Bilder nach Preisangabe und Freigabe.

## 10. Einrichtung und Veröffentlichung (Checkliste)

1. Der Nutzer legt das Repo an (oder sein Chrome-Fenster): github.com/new, Eigentümer `a-heuberger`, Name `diamanten-reich`, **öffentlich**, ohne README, ohne `.gitignore`, ohne Lizenz. Danach den Branch dorthin schieben: `git push https://github.com/a-heuberger/diamanten-reich schwester-app:main` (die Claude-GitHub-App hat auf dem Konto Zugriff auf alle Repos; sonst 403 „repo_not_connected“, siehe `AGENTS.md`).
2. **Regeln erweitern (betrifft die laufende Torjäger-App, deshalb sorgfältig):** `node tools/rules.js <CodeBen> <CodeDiese> --out regeln.txt` erzeugt den Text mit **beiden** Blöcken. Der Nutzer oder sein Chrome-Fenster ersetzt in der Firebase-Konsole (Firestore Database → Regeln) den **ganzen** Text und veröffentlicht. Der Editor ergänzt Klammern selbst: Danach muss genau dieser Text dastehen, mit zwei `match /families/…`-Blöcken. Sofort von außen prüfen (Probe-Dokument `_selftest/probe` mit **beiden** Codes: Schreiben 200, Lesen 200, löschen; falscher Code 403). Funktioniert Bens Code danach nicht, sofort den alten Text wiederherstellen lassen.
3. Pages einschalten: Settings → Pages → Deploy from a branch → `main`, `/docs` (erst nach dem ersten Push auf `main`). Den Lauf „pages build and deployment“ über `mcp__github__actions_list` prüfen.
4. Familienlink bauen und dem Nutzer **privat im Chat** geben; Installation wie bei Ben: in Safari öffnen, Teilen → Zum Home-Bildschirm, Link einmal einfügen, falls die App danach fragt; die Einrichtung (Name, Aussehen, Eltern-PIN) zuerst auf **einem** Gerät abschließen.
5. Rauchtest mit dem echten Link nur **lesend** (Einrichtung erscheint, kein Schreibkanal). Dann der Nutzer auf dem echten iPhone: Tab-Leiste, Statusleiste, Graben, Vorlesen (deutsche Stimme?), Ton.

**Vorlage für den Auftrag an das Claude-Fenster im Chrome des Nutzers** (Platzhalter in `<…>` vorher füllen, nie ins Repo): Nutzer meldet sich bei GitHub und Firebase überall an. Teil A: github.com/new → `diamanten-reich`, öffentlich, leer. Teil B: Firebase-Konsole → bestehendes Projekt → Firestore Database → Regeln → den gesamten Text durch `<REGELTEXT MIT BEIDEN CODES>` ersetzen, nach dem Einfügen Zeichen für Zeichen kontrollieren, dann Veröffentlichen. Bei Zahlungsdaten, Tarifwechsel oder Abweichungen **stoppen und fragen**. Antwort: (1) Repo-Adresse, (2) Bestätigung der veröffentlichten Regeln, (3) alles Auffällige. Der Auftrag für Pages (Teil C) folgt nach dem ersten Push.

## 11. KI-Bilder (Magnific)

- Verfügbar (am 13.11. geprüft): `mcp__magnific__images_generate`, `images_remove_background`, `simulate_cost` (kostet nichts, vorher aufrufen), `account_balance`, `creations_wait`/`creations_read` (Ergebnis ansehen), `folders_list`/`account_defaults_get` (Projekt wählen, `folderReference` bei jeder Erzeugung mitgeben). Die Werkzeuge müssen vorher mit `ToolSearch` geladen werden.
- **Regel des Nutzers:** Vor jeder Erzeugung den **Preis** nennen und **fragen**. Nichts auf Verdacht erzeugen. Das Guthaben gehört dem Nutzer.
- **Noch ungeklärt:** ob die fertigen Bilddateien aus der Sandbox heruntergeladen werden können (der Proxy erlaubt nur bestimmte Hosts). Mit **einem** freigegebenen Testbild klären (`creations_*`-Werkzeuge, URL zum Herunterladen). Geht es nicht, bleibt es bei Vektorgrafiken und Emoji.
- Stil für Prompts: niedliche, flache Illustration, **transparenter Hintergrund** (sonst `images_remove_background`), Palette Türkis/Gold/Rosa/Perlmutt, **kein Text im Bild**, **keine bekannten Figuren** („ein originales Einhorn“, „eine originale Prinzessin“). Ergebnis immer ansehen, bevor es eingebaut wird. Dateien als WebP, höchstens etwa 40 KB je Bild; sie müssen nicht in die Service-Worker-Hülle (nur kleine Dateien dort).

## 12. Arbeitsweise (aus dem ersten Chat gelernt)

- **Ehrlich berichten, was geprüft wurde und was nicht.** Nichts als erledigt melden, was nur geplant ist. Auf einem echten iPhone war bisher nur die Torjäger-App; für diese App ist noch nichts auf einem iPhone bestätigt.
- **Fehler:** erst der Test, er muss rot werden, dann der Fix, dann grün. Ein Test, der nie rot wird, taugt nichts (Beispiel: `controllerchange` kam zu früh, der Test blieb grün gegen den alten Code).
- **Optik immer auch am iPhone-Maß prüfen** (393×852, Statusleiste 59 px, Home-Balken 34 px über `?inset=1`) und die Bildschirmfotos selbst ansehen (`Read` auf die PNG-Datei), nicht nur Zahlen.
- Suiten **nacheinander** laufen lassen; langes Warten mit einer Schleife mit Bedingung statt nacktem `sleep`; zwischendurch dem Nutzer in einem Satz sagen, woran gerade gearbeitet wird.
- Der Nutzer schreibt oft per Diktat (Tippfehler wie „Torte“ für „Tore“) und ergänzt Wünsche **mitten in der Arbeit**: Jede Nachricht lesen und einarbeiten.
- Konsolen- und Browser-Schritte nie selbst versuchen: Auftrag zum Einfügen für das Claude-Fenster im Chrome des Nutzers schreiben, danach von außen nachprüfen.
- Torjäger-App und Diamanten-Reich teilen Host und Firebase-Projekt: **Jede Änderung an Regeln oder an der Torjäger-App prüfen, ob sie die andere App berührt.**

## 13. Startprompt für den nächsten Chat (ohne Zugangsdaten)

> Wir machen weiter mit der Diamanten-App für meine Tochter (Schwester der Torjäger-App). Hänge `a-heuberger/torjaeger-app` mit Push-Zugriff an, klone den Branch `schwester-app`, lies `AGENTS.md` und `UEBERGABE.md` komplett. Die App ist gebaut; arbeite meine Antworten auf Abschnitt 4 ein und veröffentliche sie nach Abschnitt 10. Den Familienlink der Torjäger-App gebe ich dir im Chat (daraus Firebase-Konfiguration und Bens Code). Regeln wie in `AGENTS.md`: Deutsch, kurz, ehrlich; nie Codes, Konfiguration, Link oder echten Vornamen ins Repo; vor KI-Bildern Preis nennen und fragen; Konsolenschritte als Auftrag für mein Claude-Fenster in Chrome; die Torjäger-App (`main`) nicht ändern, ohne dass ich es sage.
