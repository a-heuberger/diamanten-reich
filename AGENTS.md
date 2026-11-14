# Diamanten-Reich: Hinweise für Claude und Mitwirkende

Belohnungs-App für ein Mädchen (5, bald 6), Schwester der Torjäger-App für den Bruder in derselben Familie. Aufgaben bringen **Diamanten**, eine Schatzgräberin gräbt sie aus und legt sie in die Schatztruhe, Diamanten führen zu Belohnungen, dazu ein Sammelalbum mit Einhörnern, Prinzessinnen und Edelsteinen. Der Fokus liegt auf Diamanten. Ton: verspielt, träumerisch, warm, nie beschämend; die App muss dem Kind Spaß machen. Der Nutzer ist ein Elternteil, spricht Deutsch und will **so wenig wie möglich selbst tun müssen**: Antworten auf Deutsch, kurz, ehrlich darüber, was geprüft wurde und was nicht.

> **Living memory:** Halte diese Datei aktuell (dauerhafte Entscheidungen, Regeln, Gotchas themenbasiert, kein datierter Changelog).
> **Neuer Chat? Zuerst `UEBERGABE.md` lesen:** alle Antworten des Nutzers, Entscheidungen, Stand, Code-Landkarte, Arbeitsplan mit Meilensteinen, Einrichtungs-Checkliste. Hier steht nur das Dauerhafte.

## Stand in einem Satz

Die **App ist fertig gebaut und getestet** (Regeln, Optik, Graben, Spielwiese mit drei Mini-Spielen, Wolken, Schätze mit Beispiel-Belohnungen, Guthabenkonto, Album, Woche, Eltern-Bereich; Vorlesen hat der Nutzer gestrichen), aber **noch nicht veröffentlicht**: Es fehlen das Repo `diamanten-reich`, der Familiencode in den Firestore-Regeln und Pages (Einrichtung in `UEBERGABE.md`, Abschnitt 10). Die offenen Fragen an den Nutzer sind mit Vorgaben belegt, die er im Eltern-Bereich ändern kann (`UEBERGABE.md`, Abschnitt 4). Auf einem echten iPhone ist diese App noch nicht geprüft.

## Namen und Datenschutz im öffentlichen Repo

- Das Repo ist **öffentlich**. Der echte Vorname des Kindes steht nie darin; Tests und Beispiele nehmen **Lia**, der Bruder heißt in den alten Tests **Ben**. App-Name (Arbeitstitel, vom Nutzer noch zu bestätigen): **Diamanten-Reich**, Repo-Name `diamanten-reich` (neutral, ohne Vornamen, weil Repo-Name und Adresse öffentlich sind).
- Niemals Familiencode, Firebase-Konfiguration, Familienlink oder echten Stand ins Repo, in Tests, Screenshots oder Commit-Nachrichten. Tests nutzen `TESTCODE23456789` / `TESTZWEI23456789` und das Emulator-Projekt `demo-diamanten`.

## Eine Codebasis, zwei Ausgaben

| Ausgabe | Ordner | Speicher | Zweck |
|---|---|---|---|
| Web-App (Home-Bildschirm der iPhones) | `docs/`, ausgeliefert von GitHub Pages (`main`, Ordner `/docs`) | Firestore (EU), Pfad `families/<Familiencode>/…` | die eigentliche App für Eltern und Kind |
| Claude-Seite (Artifact) | `build/diamanten.html`, `build/diamanten.test.html` | Claude-db (in Tests: `test/mock-claude.js`) | Vorschau per Artifact-Werkzeug und **schnelle Browser-Tests ohne Emulator** |

`src/`: `logic.js` (Regeln, rein), `svg.js` (Bilder), `fx.js` (Effekte, Ton), `games.js` (Spielwiese; `build.js` hängt danach `boot()` an), `store.js` (Speicher, Sync, Echo-Erkennung), `cloud.js` (Web-App: Familienlink, Firestore-Adapter, Sperrseiten), `views.js`, `actions.js`, `style.css`, `body.html`.
Dokumente: `cfg/main` (Einstellungen), `cfg/progress` (Feiern, Eingelöstes, Album), `days/<JJJJ-MM-TT>` (`m` Aufgaben, `ev` Extras und Wolken, `dg` ausgegrabene Diamanten), `konto/<id>` (eine Buchung je Dokument, wie in der Torjäger-App). Beide Ausgaben nutzen dieselben Dokumente und dieselbe Schnittstelle; `fsAdapter` in `cloud.js` bildet sie auf Firestore ab.

## Befehle

```bash
npm install                      # in einer frischen Sitzung nötig (firebase, esbuild, Schriften Fredoka/Nunito, firebase-tools für den Emulator)
# Playwright ist nicht in package.json: in der Cloud global (export NODE_PATH=$(npm root -g)), am Mac: npm install --no-save playwright@<Version passend zum vorhandenen Chromium>
node build.js                    # baut build/ (Claude-Seite, Testversionen) und docs/ (Web-App)
node test/test-logic.js          # Regeln, rein (76)
node test/e2e-dia.js             # Browser-Tests der Claude-Seite mit Attrappe (93, Sternenregen läuft 25 s), Bildschirmfotos nach shots/
node tools/rules.js CODE1 [CODE2 …] --out Zieldatei    # Regeln aus der Vorlage, ein Block je Familiencode (--out ist Pflicht für eine Datei)
node tools/rules.js TESTCODE23456789 TESTZWEI23456789 --out build/test.firestore.rules   # für den Emulator (build/ vorher anlegen)
./node_modules/.bin/firebase emulators:start --only firestore --project demo-diamanten --config firebase.json   # Emulator auf 127.0.0.1:8085 (braucht Java 21; am Mac ohne Java: JRE von Adoptium in den Scratchpad laden, JAVA_HOME setzen)
node test/e2e-cloud.js           # Web-App gegen den Emulator: echtes SDK, echte Regeln, zwei Familien, zwei Geräte, Graben über Firestore, offline, falscher Code, iPhone-Statusleiste (Abschnitt K)
node test/subpath.js             # docs/ unter dem Pages-Unterpfad /diamanten-reich/: Manifest, Symbole, Service Worker, Schriften, Start ohne Netz, fremde Zwischenspeicher bleiben
node tools/icons.js              # Symbole neu zeichnen (assets/)
node tools/familiencode.js       # neuen Familiencode würfeln
node tools/familienlink.js <Seite> <Code> <Konfigurationsdatei>   # Familienlink bauen
```

Vor jedem Push auf `main` müssen **alle** Suiten grün sein: Push = live für die Familie (Pages baut in etwa einer Minute). Die Suiten **nacheinander** laufen lassen, nicht parallel (zeitabhängige Prüfungen werden sonst unzuverlässig). Nach Änderungen an `src/` immer `node build.js` und `docs/` mit committen. `docs/index.html` nach dem Build **nie** von Hand ändern (die Sicherheitsrichtlinie enthält den Hash des Skripts). Wer einen Fehler behebt, schreibt zuerst den Test, sieht ihn **rot** und dann grün.

## Veröffentlichung und Repo

- Ziel: eigenes öffentliches Repo `a-heuberger/diamanten-reich`, Branch `main`, GitHub Pages (Settings → Pages → Branch `main`, Ordner `/docs`) unter `https://a-heuberger.github.io/diamanten-reich/`, also in einem **Unterpfad**: nur relative Pfade (Manifest, Symbole, `sw.js`), nie ein führendes `/`. `test/subpath.js` fängt das ab.
- **Vorläufiger Aufbewahrungsort:** Branch `schwester-app` (eigene Historie) im Repo `a-heuberger/torjaeger-app`. Er wird dort nicht ausgeliefert (Pages liest nur `main`). Sobald der Nutzer das neue Repo angelegt hat (leer, öffentlich, ohne README): `git push https://github.com/a-heuberger/diamanten-reich schwester-app:main`, dann nur noch dort arbeiten und diesen Satz hier anpassen.
- Pushen aus einer Claude-Sitzung: Repo mit `add_repo` (Zugriff `push`) anhängen, dann normal `git push`. Das läuft über die Claude-GitHub-App, die auf dem Konto `a-heuberger` für alle Repositories freigegeben ist. Meldet GitHub **403 „repo_not_connected“**, fehlt der App der Zugriff (github.com/settings/installations → Claude → Configure; nur der Kontoinhaber kann das). Das Anlegen eines Repos über die Werkzeuge geht nicht (403), das macht der Nutzer.
- Die Cloud-Sitzung hat keinen Browser und erreicht den Computer des Nutzers nicht (auch nicht mit „du bist eingeloggt“). Konsolen- und Einstellungsschritte (GitHub, Firebase) erledigt der Nutzer selbst oder **das Claude-Fenster in seinem Chrome**: ein vollständiger Auftrag zum Einfügen, das Ergebnis kommt als Text zurück. Für Pages und Firebase hat das bei der Torjäger-App so funktioniert. Danach immer von außen nachprüfen (Pages-Lauf über die GitHub-Werkzeuge, Regeln per REST).

## Zugang und Datenschutz

- Daten: Vorname, Aufgaben, Diamanten, Belohnungen. **Dasselbe Firebase-Projekt wie die Torjäger-App** (Google-Konto des Nutzers, kostenloser Spark-Tarif, Datenbank `eur3`, Produktionsmodus), aber ein **eigener Familiencode** und damit ein eigener Pfad `families/<Code>/…`. Jede Familie kommt nur an ihren Pfad; die Regeln listen beide Codes (`node tools/rules.js <CodeBen> <CodeLia> --out …`). Der Code der Torjäger-App steht in deren Link, den der Nutzer hat.
- Zugang = **Familienlink** `https://<Seite>/#c=<base64url({ k, f, e? })>`. `k` = Familiencode (16 Zeichen A–Z/2–9), `f` = Firebase-Webkonfiguration (dieselbe wie bei der Torjäger-App), `e` = Emulator (nur Tests). Der Link wird einmal pro Gerät geöffnet und liegt dann im lokalen Speicher (`dia-cloud-v1`).
- Das Modell ist „geheimer Link“, nicht „Online-Banking“. Ohne Code ist nichts erreichbar (auch `/families` lässt sich nicht auflisten). **Der API-Schlüssel schützt nichts** (Firestore antwortet ohne und mit falschem Schlüssel gleich), allein die Regeln mit dem Code im Pfad entscheiden.
- Die Regeln der **laufenden** Torjäger-App werden mitgeändert. Jede Änderung der Regeln danach von außen für **beide** Codes prüfen (Probe-Dokument `_selftest/probe`: richtiger Code → 404 beim Lesen = erlaubt, Schreiben 200, sofort wieder löschen; falscher Code → 403). Ein Fehler hier legt die App des Bruders still.
- Der Eltern-Code (PIN) schützt nur vor versehentlichem Tippen und liegt als Hash in `cfg/main`.
- Konfiguration, Codes und Links liegen **nicht** im Repo, nur beim Nutzer und im Scratchpad der Sitzung. Den Code dieses Kindes würfelt man mit `node tools/familiencode.js` neu (der erste wurde nie verwendet).

## Gemeinsame Herkunft mit der Torjäger-App

Beide Apps liegen auf `a-heuberger.github.io`. Cache Storage, `localStorage` und IndexedDB gehören der **ganzen Herkunft**, nicht dem Unterpfad. Darum hier: Zwischenspeicher `diamanten-<Version>` (der Service Worker löscht nur Zwischenspeicher mit diesem Präfix), `localStorage`-Schlüssel mit Präfix `dia-`, eigener Name der Firebase-Instanz (`initializeApp(…, 'diamanten')`, sonst teilen sich beide App den IndexedDB-Speicher von Firestore) und eigenes PIN-Salz. Die Torjäger-App nutzt `torjaeger-`/`torj-` und löscht fremde Zwischenspeicher seit `53b8f5e` nicht mehr; ältere installierte Fassungen taten das noch (kein Problem, solange die App des Bruders vor dem Start dieser App einmal online geöffnet wurde und sich aktualisiert hat). Neue Schlüssel und Zwischenspeicher immer mit dem eigenen Präfix anlegen.

## Konzept (vom Nutzer entschieden) und wie es umgesetzt ist

Einzelheiten und Wortlaut in `UEBERGABE.md`. Kurz:

- **Hauptbild: Diamantenschatz.** Heute zeigt eine Szene: Schatzgräberin (Aussehen aus `cfg.look`: Haarfarbe, Frisur, Kleid) am Erdhügel, Truhe mit Füllstand (`chestLevel`, Wurzel aus Truhe/letzter Schatz, damit die ersten Diamanten sichtbar sind), Einhorn auf der Truhe. Stimmung Türkis-Gold, runde Schriften, große Knöpfe, wenig Text.
- **Eintragen nur im Eltern-Modus** (Wunsch des Nutzers, 14.11.: Er macht es gemeinsam mit dem Kind): „Geschafft“ → `'y'`, „Nicht geschafft“ → `'n'` (neutral, kein Minus). Gleicher Knopf noch einmal = zurück auf offen. Ohne Eltern-Modus gibt es keine Knöpfe zum Abhaken, nur Stempel und einen Hinweis. Zustand `'c'` (vom Kind getippt) kommt nur noch aus alten Daten und lässt sich weiter freigeben. Keine anderen Wörter für die Knöpfe (nicht „Freigeben“, „Diamant“, „Heute nicht“).
- **Graben:** `evalDay` liefert `gain`, `dug = min(dg, gain)`, `waiting`. Jeder Tipp ist ein Stich (`cfg.digTaps`, 1–5, Vorgabe 3); danach `dg + 1` am ältesten Tag mit Wartenden. Gedrückt halten gräbt alle. Ohne Wartende Spaß-Funde (`FUN_FINDS`, zählen nicht, `cfg.digFun`). `cfg.digMode = false`: alles gilt sofort als gegraben.
- **Zählen:** Schätze und Zauberbeutel rechnen mit **allen freigegebenen** Diamanten (plus Bonus der Sticker, minus Wolken); Kopf und Truhe zeigen die **gegrabenen**. Gefeiert wird erst, wenn nichts mehr wartet.
- **Feiern sind aus den Daten abgeleitet** (`checkCelebs` nach jedem Rendern): erreichter Schatz ohne `prog.shown[id]`, perfekter Tag ohne `prog.cel['p:'+ds]`, mehr Beutel als `prog.packN`. So kommen sie genau einmal, auch wenn die Eltern auf einem anderen Gerät freigeben. Nur ansehen und ohne Zugriff: keine Feiern.
- **Wolken** = Karten der Torjäger-App (`buildLedger`, Ereignisse `y`/`r`, zwei offene gelbe = Gewitter, Gewitter höchstens einmal pro Tag, verfallen nie, Eltern nehmen zurück). Erst nach „Hinweise für Eltern“ freigeschaltet (`cloudsAck`).
- **Extras:** Sammelalbum (**100 Sticker**, Wunsch des Nutzers: mindestens 100; fünf Kategorien à 20 mit je 12 normal, 6 selten, 2 ultraselten; s01–s40 unverändert, neue nur hinten anhängen; Edelsteine als Zeichnung `gem:<farbe>`, Steckbrief `fact` als Text), Wochenrückblick als Regenbogen.
- **Mini-Spiele (Nutzer will mehr davon):** Graben (Hauptspiel) und die **Spielwiese** auf „Heute“ (`cfg.games`): Memory, Hütchen, Sternenregen (`games.js`). Nur zum Spaß, nie Diamanten, kein Verlieren; Bestwerte in `prog.games`. Neue Spiele dort ergänzen (Kachel in `gamesCard`, Start in `game-open`).
- **Kein Vorlesen** (vom Nutzer gestrichen): keine `speechSynthesis`, keine Lautsprecher-Knöpfe. Der Browser-Test meldet jeden Sprachaufruf als Konsolenfehler.
- **Konto** wie in der Torjäger-App, ohne Noten: Gutschreiben, Abbuchen (nur mit Ja des Kindes), Auszahlen; „X € aufs Guthabenkonto“ in einer Belohnung bucht beim Einlösen (`rewardMoney`, `prog.redK`).
- **Schätze:** Vorgabe 10, 25, 50, 75, 100, 150, 200, 300, 500 mit Beispiel-Belohnungen (`DEFAULT_GOALS`, darunter drei Geldbeträge fürs Konto), leeres Feld = „Überraschung!“. Ideen-Chips füllen das zuletzt angetippte Feld. Die Schätze-Seite zeigt oben den nächsten Schatz (nicht den Weg bis 500), die Liste für das Kind gekürzt.
- **Bilder:** alles selbst gezeichnete Vektorgrafik (`svg.js`). KI-Bilder (Magnific) nur nach Preisangabe und Freigabe des Nutzers; bisher keine erzeugt.
- Entfallen: Gegner/Spielstand, Angeln, Fußball, Vorlesen.

## Gotchas (aus der Torjäger-App übernommen, hier ebenso gültig)

- iOS: Safari und Home-Bildschirm-App haben **getrennten** Speicher. Der Link bleibt deshalb mit `#c=…` in der Adresse (wird beim „Zum Home-Bildschirm“ vermutlich übernommen, auf einem echten iPhone bestätigt hat es der Nutzer noch nicht für diese App); sonst fragt die App einmal nach dem Link.
- Offline-Start: Ein `cfg/main`, das nur aus dem Zwischenspeicher kommt und nicht existiert, ist **kein** neues Spiel, sondern Sperrseite „offline“, bis der Server antwortet. Geschrieben wird ohne Abwarten (Firestore-Warteschlange).
- Service Worker (`assets/sw.template.js`): Beim allerersten Laden ist er noch nicht aktiv, was die Seite dabei lädt, würde nie gemerkt. Deshalb stehen die Schriften (`__FONTS__`, aus `build.js`) in der Hülle, und `index.html` gibt es als Rückfall nur für Navigationen. Beim Testen eines Updates: „controllerchange“ kommt schon beim **Beginn** der Aktivierung, auf `statechange` → `activated` warten.
- Sicherheitsrichtlinie per Meta-Tag: `img-src` muss `https://www.google.com` erlauben (das SDK pingt `cleardot.gif`); Test-Build erlaubt zusätzlich `127.0.0.1`. Bilder als Dateien brauchen `img-src 'self'` (steht), Ton über WebAudio braucht nichts, `speechSynthesis` braucht nichts.
- esbuild-Ziel `safari15`; `safari14` scheitert an der Destrukturierung im SDK.
- Firestore-Regel `{document=**}` trifft auch den Familienknoten selbst; das ist gewollt und unkritisch.
- Rauchtest mit dem echten Link nur **lesend** fahren (Einlauf erscheint, kein Schreibkanal); die Einrichtung abzuschließen schreibt `cfg/main` in die echte Datenbank.
- **Sicherheitsabstände (iPhone mit Dynamic Island) sind am Rechner 0 und fallen dort nie auf.** Der Kopf (`.top`) klebt mit `top: env(safe-area-inset-top)` unterhalb der Statusleiste; `.pwa #app { padding-top: env(safe-area-inset-top) }` hält den Inhalt darunter (die Klasse `pwa` setzt `build.js` am `<html>`). Jede feste Höhe unterhalb des Kopfes braucht `env(safe-area-inset-top)` mit (`scroll-margin-top`, klebende Leisten, Banner). Abschnitt K in `test/e2e-cloud.js` stellt Statusleiste (59 px) und Home-Balken (34 px) nach: Der Testserver ersetzt die Abstände bei `?inset=1` nur im `<style>` (im Skript bräche der Hash der Sicherheitsrichtlinie). Nicht per Playwright-`route` lösen, das stört die Anfragen an den Emulator (CORS). **Jede neue Szene, Leiste oder jedes Banner am Rechner mit diesem Test prüfen.**
- Browser-Tests der Claude-Seite brauchen `test/mock-claude.js` (bildet die db von Claude nach, `window.__nodb`/`__readonly` schalten Zugriffsarten). Eine Attrappe von `speechSynthesis` (per `Object.defineProperty`, einfaches Zuweisen wirkt in Chromium nicht) meldet jeden Sprachaufruf als Fehler.
- Zauberbeutel und Hütchen wackeln ständig: Playwright hält sie für „nicht stabil“, dort mit `force: true` klicken, sonst nie (ein erzwungener Klick trifft sonst Banner oder Tab-Leiste). Die Spiele legen ihren Zustand für Tests in `window.__game` ab (der App-Code steckt in einer Funktion, `U` ist von außen nicht erreichbar).
- Mehrere `[data-act="sheet-close"]` (Hintergrund und Knopf): im Test immer `.sheet [data-act="sheet-close"]` oder `#gfoot …` nehmen.
- `navigator.vibrate` nur nach einer echten Geste (`Hap.go` prüft `userActivation`), sonst meldet Chromium einen Konsolenfehler.
- Eine doppelte Setting-`id` oder ein ungültiger Block lässt andere Plattformen Dateien still liegen: lieber testen als annehmen.
- Werkzeug-Eigenheiten der Sitzung: ein nacktes `sleep` ist gesperrt (Schleife mit Bedingung nehmen); bei `git grep --cached` stehen die Optionen **vor** dem Muster (sonst leere Ausgabe wie „keine Treffer“); `github.io` und die GitHub-API sind aus der Sandbox nicht erreichbar, den Pages-Lauf über `mcp__github__actions_list` prüfen.
