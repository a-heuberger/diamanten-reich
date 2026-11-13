# Übergabe: Diamanten-Reich (Schwester-App der Torjäger-App)

Stand der Übergabe: 13.11.2026. Dieses Dokument ist für einen **neuen Chat**, der die App fertig baut. Es enthält alles, was im ersten Chat besprochen, entschieden und geprüft wurde. `AGENTS.md` (wird automatisch geladen) enthält das Dauerhafte, hier steht der Projektstand und der Plan. Der echte Vorname des Kindes steht nie im öffentlichen Repo: Hier heißt die Tochter **Lia** (Platzhalter), im Chat mit dem Nutzer hat sie ihren echten Namen.

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

## 3. Meine Vorgaben (noch nicht bestätigt, Veto möglich: im neuen Chat kurz bestätigen lassen)

1. **Tipps je Diamant: 3** (einstellbar 1 bis 5 im Eltern-Bereich). Tipp 1: Erde fliegt, Tipp 2: größeres Loch, ein Funkeln, Tipp 3: Diamant springt heraus, Fanfare, fliegt in die Truhe. Gedrückt halten gräbt alle wartenden Diamanten nacheinander.
2. **Spaß-Funde:** Ohne wartende Diamanten gräbt die Gräberin trotzdem, findet aber nur Kleinigkeiten (Wurm, Blume, Stern, Muschel), die nicht zählen. Schaltbar.
3. **Tagesaufbau:** Aufgaben in zwei Bereichen **Morgens (Sonne)** und **Abends (Mond)**.
4. **Entfällt:** Gegner/Spielstand 0:0, Angeln und Fang, **Konto/Noten-Geld** (Tab entfällt), Fußball-Texte, „Joker/Spielfrei“-Reste.
5. **Tabs:** Heute · Woche (Wochenrückblick mit Regenbogen) · Schätze (Belohnungen und Sammelalbum) · Eltern (bei Ben „Trainer“, hinter PIN).
6. **Serie** (bei Ben „Ungeschlagen seit N Spielen“): „Funkel-Tage in Folge“, ein Tag zählt mit mindestens einem Diamanten.
7. **App-Name** „Diamanten-Reich“, Repo `diamanten-reich` (Arbeitstitel, vom Nutzer noch zu bestätigen).
8. Belohnungsstufen (Vorschlag, alles änderbar): 10, 25, 50, 75, 100, 150, 200, 300, 500 Diamanten; die Texte legen die Eltern fest, bis dahin „Wird später festgelegt“. Sticker-Päckchen („Zauberbeutel“) alle 5 Diamanten, 10 Sticker-Punkte = 1 Bonus-Diamant.

## 4. Vom Nutzer noch zu erfragen (im neuen Chat zuerst, möglichst als eine Nachricht)

1. **Aufgabenliste** (Morgens/Abends, welche Wochentage). Als Symbole eignen sich Emoji, wie bei Ben.
2. **Belohnungsideen** (mindestens für die ersten drei Stufen).
3. **Aussehen der Schatzgräberin** (Haarfarbe, Frisur, Kleidfarbe), Lieblingsfarben, ein Name für das Einhorn; nur Originalfiguren zeichnen (keine bekannten Film-Prinzessinnen).
4. **Gerät** des Kindes (iPad, iPhone der Eltern?) und wer den **Eltern-PIN** kennt.
5. Bestätigung der Vorgaben aus Abschnitt 3 (besonders die 3 Tipps).
6. **Freigabe eines Testlaufs für KI-Bilder** mit genanntem Preis (Abschnitt 11).

## 5. Stand der Technik

**Torjäger-App (Bens App, läuft live, nicht verändern ohne Auftrag):** Repo `a-heuberger/torjaeger-app`, Branch `main`, Pages `https://a-heuberger.github.io/torjaeger-app/`. Zuletzt `53b8f5e`: Service Worker löscht fremde Zwischenspeicher nicht mehr (Voraussetzung für zwei Apps auf einem Host), davor der Fix für die iPhone-Statusleiste (`b6336bd`). Alle Suiten grün: Regeln 138, Claude-Seite 156 + 36, Web-App gegen Emulator 69, Unterpfad 17, dazu zwei Beobachtungsläufe ohne Fehler. Der Nutzer hat sie auf einem **echten iPhone** getestet (daraus kam der Statusleisten-Fehler).

**Firebase:** Ein Projekt (Spark, Datenbank `eur3`, Produktionsmodus, Web-App registriert, Google-Konto des Nutzers). **Die Regeln enthalten bisher nur den Code der Torjäger-App.** Der Code dieser App ist noch nirgends eingetragen. Konfiguration und Codes liegen nicht im Repo (Abschnitt 8).

**Gerüst dieser App (diese Kopie):** Kopie von `torjaeger-app` Stand `53b8f5e` mit eigenen Kennungen: `localStorage`-Präfix `dia-`, Zwischenspeicher `diamanten-<Version>`, Firebase-Instanz `diamanten` (`initializeApp(cred.f, 'diamanten')`), PIN-Salz `diamanten|`, Emulator-Projekt `demo-diamanten`, Build-Dateien `build/diamanten*.html`, Unterpfad-Test auf `/diamanten-reich/`. `tools/rules.js` schreibt Regeln für **mehrere** Codes (`--out`). `test/e2e-cloud.js` prüft zwei Familien im selben Projekt (Abschnitt A). `.gitignore` ignoriert `node_modules` auch als Verknüpfung. Basistest dieser Kopie: **alle Suiten grün** (Regeln 138, Claude-Seite 156 + 36, Web-App gegen den Emulator 72 einschließlich zwei Familien im selben Projekt, Unterpfad 17 einschließlich Test für fremde Zwischenspeicher, dazu zwei Beobachtungsläufe ohne Fehler). **Noch nicht umgesetzt:** alle Spielregeln, Texte, Bilder und Schriften dieser App (sie zeigt noch Bens Fußball-Welt unter neuem Namen), `docs/` ist nicht eingecheckt.

**Noch nicht vorhanden:** das Repo `diamanten-reich` (legt der Nutzer an oder sein Chrome-Fenster), Pages dafür, der Familiencode dieser App in den Regeln, der Familienlink.

## 6. Code-Landkarte (Ausgangspunkt = Bens App; Zeilen ungefähr)

- `src/logic.js` (423 Z., rein, ohne DOM): `defaultCfg` (Aufgaben, Ziele, Karten-Punkte, `shootMode`), `migrateCfg`, `normGoals`, `STICKER_DATA` (100 Sticker als Emoji + Name + Kategorie + Seltenheit n/r/u), `RARITY`, `PTS_PER_TOR`, `pickSticker`, `packsLeft`, `tasksOn`, `buildLedger` (Karten: gelb/rot, zwei gelbe = rot), `accountNow`, `evalDay` (gain, minus, rival, result, perfect), `evalWeek`, `computeStats` (total, minus, score, packs, stickers), `goalList`, `nextGoal`, `milestones`, `coachAdvice`. Konto-Funktionen (`kontoBalance`, `parseMoney`, `rewardMoney`) entfallen.
- `src/views.js` (523 Z.): Zustand `U`, `render`, `headerView`, `tabsView`, `gateView` (Sperrseiten), `cardTop` (offene Karten oben), `dayStrip`, `scoreCard` (Spielstand 0:0, **wird zur Schatzszene**), `taskCard`/`stampHTML`/`segHTML` (Aufgaben, Stempel, Tor/Kein-Tor-Knöpfe der Eltern), `extrasCard` (eigener Grund, Karten vergeben), `dayTools`, `shotBar` (**wird zur Graben-Leiste**), `nextGoalCard`, `viewToday`, `installHint`, `viewWeek`, `viewAchieve` (Ziele, Fang, Album, Tüten), `viewKonto` (entfällt), `viewCoach` (Trainer-Bereich), `taskEditor`.
- `src/actions.js` (784 Z.): `ACT[...]` für jede Aktion (`mark`, `all-ok`, `rest-no`, `shoot`, `shoot-skip`, `extra-open`, `ex-save`, `card-back`, `redeem`, `pack-open`, `pack-tear`, `pin-*`, `lock`, `tab`, `ob-*` Einrichtung, `step`, `task-*`, `link-*`), `setMark`, `afterMutation` (Feiern), `finishRitual`/`dayBanner` (Tagesabschluss), `flyBall`, `shootOne`, `volley`, `showNextCeleb`, `paintPack`, Einrichtung `obHTML`, `bindEvents` (lange gedrückt = alle schießen).
- `src/svg.js` (386 Z.): `ballSVG`, `jerseySVG`, `monsterSVG`, `goalSVG`, `packSVG`, `cardSVG` (gelb/rot), `IC` (Symbole), `TAB_IC`, Angel-Szene (`ANGLER_SVG`, `fangSVG`, `speciesSVG`, `FISH_*`), `SVG_DEFS`. Alles Fußball/Angeln, **wird ersetzt** (Diamanten in Schliffen und Farben, Truhe, Gräberin, Einhorn, Prinzessin, Wolken, Krone, Funkeln).
- `src/fx.js` (129 Z.): Konfetti und Ton (WebAudio, `Snd`). `src/store.js` (154 Z.), `src/cloud.js` (126 Z.): Speicher, Sync, Familienlink, Firestore-Adapter. **Nicht anfassen ohne Grund.**
- `src/style.css` (721 Z.): Farben als CSS-Variablen am Anfang, Schriften Barlow (Fußball-Optik) → ersetzen durch runde Schriften.
- `build.js`: `FONTS`-Liste (Barlow aus `@fontsource`), CSP, Manifest, Service-Worker-Hülle mit `__FONTS__`. `assets/`: Manifest, Symbole (`tools/icons.js` zeichnet sie), `sw.template.js`.
- Tests: `test/test-logic.js` (Regeln rein), `e2e7.js`/`e2e.js`/`e2e4.js`/`e2e6.js` (Claude-Seite mit Mock), `e2e-cloud.js` (Emulator, Abschnitte A bis K), `subpath.js`.

## 7. Entwurf der Umbauten

**Begriffe Ben → Diamanten-Reich:** Tor → Diamant · Gegner/Spielstand → entfällt, an die Stelle tritt die **Schatzszene** (Gräberin und Truhe) · Trikot und Nummer → Mädchen-Kopf mit Krone, Wappen-Farbe · Karten → Wolken · Fang/Angler → **Schatztruhe „Der große Schatz“** (Fortschritt zum letzten Ziel) · Schieß!/Ball halten → **Graben!** · Trainer → Eltern · Sticker-Tüte → **Zauberbeutel** · Ziele → Schätze · Konto → entfällt · Tagesleiter („Hattrick!“) → Funkel-Rufe („Funkel!“, „Doppelt funkel!“, …).

**Datenmodell (Entwurf, die Cloud-Dokumente bleiben dieselben):**
- `days/<ds>.m[aufgabe]`: `'c'` = vom Kind getippt, wartet auf die Eltern (neu) · `'y'` = freigegeben (Diamant) · `'n'` = heute nicht · `'x'` = frei. Eltern sehen `c` hervorgehoben mit Haken (freigeben) und „noch nicht“ (zurück auf offen). `evalDay` zählt `c` wie offen und liefert `claimed`.
- `days/<ds>.dg` (Zahl, neu): ausgegrabene Diamanten dieses Tages. Wartend = `max(0, gain − dg)`, tatsächlich gegraben = `min(dg, gain)` (so bleibt alles richtig, wenn Eltern etwas zurücknehmen). Graben schreibt `days/<ds>` (ältester Tag mit Wartenden zuerst). `isEmptyDay` in `store.js` darf einen Tag mit `dg` nicht als leer löschen (er hat dann immer auch `m`).
- Anzeige: Truhe/Kopf zeigen gegrabene Diamanten plus Bonus-Diamanten der Sticker; „N warten in der Erde“. **Belohnungen und Feiern rechnen mit allen freigegebenen Diamanten** (wie bei Ben die Tore) und **feiern erst, wenn nichts mehr wartet** (bei Ben: `showNextCeleb` wartet auf `U.shots`; hier auf die Wartenden aus den Daten, also auch geräteübergreifend). Bens `U.shots` war nur Sitzungszustand und fiel beim Neuladen weg.
- `evalDay`: `rival` bleibt 0 und entfällt in der Anzeige; `result` = `win` bei mindestens einem Diamanten, `loss` bei bewertetem Tag ohne Diamant, sonst `none`; Serie = Tage in Folge mit `win`. Wolken (`buildLedger`) bleiben unverändert, nur Namen und Bilder neu.
- Aufgaben bekommen `slot: 'morgens' | 'abends'` (Standard `morgens`); `migrateCfg` ergänzt das. Neue Einstellungen: `digTaps` (3), `digFun` (true). `PTS_PER_TOR` → `PTS_PER_DIAMANT = 10`, `packEvery` 5, `defaultCfg.goals` wie oben, `season.title` → Name der Truhe.
- Sticker: `STICKER_DATA` neu mit etwa 40 Einträgen in den Kategorien **Einhörner, Prinzessinnen, Edelsteine, Märchenwelt**, Emoji als Bild (auf dem iPhone reichhaltig: 🦄 👸 💎 👑 🏰 🧚 🧜 🪄 🌈 ⭐ 🌸 🦋 …) mit Seltenheitsrahmen; wenige Ultraselten dürfen KI-Bilder bekommen. Steckbriefe (`STICKER_FACT`) kurz und kindgerecht, werden vorgelesen.

**Oberfläche Heute (Entwurf):** Kopf (Mädchen-Kopf mit Krone, Name, Chips „Funkel-Tage“ und „Diamanten gesamt“, Eltern-Schloss) · Tagesleiste · **Szene**: links Schatzgräberin auf einem Erdhügel, rechts die Truhe, darüber „N warten in der Erde“; Tippen auf die Szene oder den großen Knopf gräbt · Wolken oben, wenn aktiv · Aufgaben in **Morgens** und **Abends** mit großen, runden Knöpfen („Geschafft!“, danach „wartet“) · Karte „Nächster Schatz“ mit Balken. Zielgruppe kann nicht lesen: große Symbole, wenig Text, Lautsprecher-Symbol zum **Vorlesen**.

**Vorlesen:** `speechSynthesis` mit deutscher Stimme (`de-DE`), nur nach einer Nutzergeste (iOS), Stummschalter vorhanden (`U.muted`, Schlüssel `dia-muted`). Jede Aufgabe, Belohnung und jedes Sticker-Fakt bekommt ein Lautsprecher-Symbol bzw. liest beim Antippen des Bildes vor. Nach dem Bauen auf einem echten iPhone prüfen, ob eine deutsche Stimme da ist.

**Wochenrückblick:** Regenbogen je Woche, ein Band je Tag, gefüllt nach den Diamanten dieses Tages, dazu Wolken-Marken. Respektiert `prefers-reduced-motion` (Bens Code hat `stillMotion()`).

## 8. Private Eingaben (nicht ins Repo, nicht in Commits, nicht in Screenshots)

- **Firebase-Konfiguration und der Familiencode der Torjäger-App** stehen im Familienlink der Torjäger-App (`https://a-heuberger.github.io/torjaeger-app/#c=…`). Der Nutzer gibt den Link im Startprompt oder auf Nachfrage; daraus liest man mit einem kurzen Skript (`base64url` → JSON `{ k, f }`) Konfiguration `f` und Bens Code `k` für die gemeinsamen Regeln. Nur im Scratchpad der Sitzung ablegen.
- Der Code dieser App: `node tools/familiencode.js` neu würfeln (der erste wurde nie verwendet), im Scratchpad ablegen.
- Der Link dieser App entsteht mit `node tools/familienlink.js https://a-heuberger.github.io/diamanten-reich/ <Code> <Konfigurationsdatei>` und geht nur an den Nutzer, im Chat.

## 9. Arbeitsplan (Meilensteine, in dieser Reihenfolge; nach M1 dem Nutzer Bildschirmfotos zeigen)

1. **M1 Optik und Szene:** `npm install`; runde Schriften statt Barlow (zum Beispiel `@fontsource/fredoka` für Überschriften, `@fontsource/nunito` für Text; in `build.js` `FONTS` anpassen); Farben „Türkis-Gold“; neue Symbole und Bilder in `svg.js` (Diamanten in Schliffen und Farben mit Funkeln, Truhe in Füllständen, Schatzgräberin mit Schaufel und Animationszuständen, Einhorn, Prinzessin, Krone, Wolken, Zauberbeutel); Kopf, Tab-Leiste und die Heute-Szene (zunächst mit Beispieldaten). Bildschirmfotos mit nachgestellter iPhone-Statusleiste (Abschnitt K) zeigen.
2. **M2 Daten und Logik:** `'c'`-Zustand und Eltern-Freigabe, `dg`/Wartende, Serie, `rival` raus, Aufgaben-`slot`, neue Voreinstellungen, Ziele, `test/test-logic.js` anpassen (Tests zuerst rot).
3. **M3 Graben:** Tipps je Diamant, Animation, Ton, Spaß-Funde, Gedrückthalten, Feiern erst nach dem Graben; Heute komplett (Morgens/Abends), Eltern-Freigabe sichtbar.
4. **M4 Wolken und Belohnungen:** Verwarnungen in Wolkenform (Eltern vergeben/zurücknehmen, Anzeige oben und im Kopf), Schätze-Tab (Belohnungsstufen mit Edelstein-Symbolen, „Der große Schatz“), Einlösen.
5. **M5 Sammelalbum:** etwa 40 Sticker, Seltenheiten, Zauberbeutel, Bonus-Diamant, Steckbriefe; danach (nach Freigabe) KI-Bilder für wenige große Motive.
6. **M6 Vorlesen und Wochenrückblick.**
7. **M7 Eltern-Bereich und Einrichtung:** Aufgabenliste Morgens/Abends, Belohnungstexte, Wolken-Werte, Tipps je Diamant, PIN, Einrichtung mit Name und Aussehen der Gräberin, „Zum Home-Bildschirm“-Hinweis, Sperrseiten in Kindersprache.
8. **M8 Aufräumen und Absichern:** Fußball-, Angel- und Konto-Reste entfernen, Texte kindgerecht, Symbole/Manifest/App-Name, Tests für alles Neue (Browser mit Mock und gegen den Emulator, iPhone-Statusleiste, Unterpfad), `AGENTS.md` nachziehen.
9. **M9 Veröffentlichung** (Abschnitt 10).

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

## 13. Startprompt für den neuen Chat (ohne Zugangsdaten)

> Wir bauen weiter an der Diamanten-App für meine Tochter (Schwester der Torjäger-App für meinen Sohn). Hänge das GitHub-Repo `a-heuberger/torjaeger-app` mit Push-Zugriff an, klone den Branch `schwester-app` nach `/home/user/torjaeger-app` (`git clone --branch schwester-app --depth 1 https://github.com/a-heuberger/torjaeger-app /home/user/torjaeger-app`), registriere den Ordner und lies `AGENTS.md` und `UEBERGABE.md` komplett. Dort steht alles: meine Entscheidungen, der Stand, die offenen Fragen und der Arbeitsplan. Stelle mir zuerst in **einer** Nachricht die offenen Fragen aus Abschnitt 4, lass mich die Vorgaben aus Abschnitt 3 bestätigen und arbeite dann nach dem Plan weiter, beginnend mit Meilenstein 1. Zeig mir früh Bildschirmfotos. Halte dich an die Regeln in `AGENTS.md`: Antworten auf Deutsch, kurz und ehrlich, was geprüft ist; nie Familiencode, Konfiguration, Link oder echten Vornamen ins öffentliche Repo; vor jeder KI-Bilderzeugung Preis nennen und mich fragen; Konsolenschritte als Auftrag zum Einfügen für mein Claude-Fenster in Chrome formulieren; die Torjäger-App (`main`) nicht ändern, ohne dass ich es sage.
