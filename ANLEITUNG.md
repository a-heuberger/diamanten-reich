# Einrichtung (einmalig)

Die App liegt bei GitHub und wird von dort ausgeliefert. Die Datenbank ist **dieselbe bei Google (Firebase) wie bei der Torjäger-App**, nur mit einem eigenen geheimen Familiencode. Dort kann nur der Nutzer ein Konto nutzen, deshalb sind das die Schritte, die nicht von Claude erledigt werden. Am bequemsten gibt Claude einen fertigen Auftrag zum Einfügen für das Claude-Fenster im Chrome des Nutzers (siehe `UEBERGABE.md`, Abschnitt 10); selbst klicken geht genauso.

## 1. Repo anlegen

github.com/new → Eigentümer `a-heuberger`, Name `diamanten-reich`, **öffentlich**, ohne README, ohne `.gitignore`, ohne Lizenz → Create repository. Danach schiebt Claude den Programmcode hinein.

## 2. Datenbank-Regeln um diese Familie erweitern

Das betrifft die **laufende Torjäger-App**: Die Regeln dort müssen danach weiter funktionieren. Claude erzeugt den Regeltext mit beiden Familiencodes (`node tools/rules.js <Code Torjäger> <Code dieser App> --out regeln.txt`) und prüft ihn danach von außen.

1. https://console.firebase.google.com → das bestehende Projekt → links **Erstellen** (Build) → **Firestore Database**.
2. Oben auf den Reiter **Regeln** (Rules): den **gesamten** Text löschen, den Regeltext von Claude einfügen, **Veröffentlichen** (Publish).
3. Der Editor ergänzt Klammern teilweise selbst: Danach muss genau der Text von Claude dastehen, mit **zwei** Blöcken `match /families/…`.

## 3. Seite bei GitHub freischalten

Im Repo, nach dem ersten Push: **Settings** → **Pages** → bei „Build and deployment“ die Quelle **Deploy from a branch** → Branch `main`, Ordner `/docs` → **Save**. Nach etwa einer Minute ist die App unter `https://a-heuberger.github.io/diamanten-reich/` erreichbar.

## 4. Auf die iPhones

1. Claude schickt den **Familienlink**. Er enthält den Zugang und ist so geheim wie ein Passwort: nur an die Familie schicken.
2. Link auf dem iPhone in **Safari** öffnen.
3. Unten auf **Teilen** (Quadrat mit Pfeil) → **Zum Home-Bildschirm** → Hinzufügen.
4. App vom Home-Bildschirm öffnen. Falls sie nach dem Familienlink fragt: Link aus der Nachricht kopieren und einfügen (einmalig).
5. Auf dem ersten Gerät: Einrichtung durchspielen (Name, Aussehen der Schatzgräberin, **Eltern-Code** festlegen). Auf den anderen Geräten ist der Stand sofort da.

## Wenn etwas hakt

- „Der Link passt nicht“: Der Familiencode in den Regeln stimmt nicht mit dem im Link überein, oder die Regeln wurden nicht veröffentlicht (Schritt 2).
- „Noch keine Verbindung“ beim allerersten Start: Internet nötig, danach geht auch offline.
- Die Torjäger-App zeigt „Der Link passt nicht“, seit die Regeln geändert wurden: Der Text in Schritt 2 war falsch eingefügt. Sofort den alten Regeltext wiederherstellen lassen.
- Neuer Link nötig (z. B. weil er weitergegeben wurde): Claude erzeugt einen neuen Code, die Regeln werden einmal ersetzt, alle bekommen den neuen Link, der Stand wird übernommen.
