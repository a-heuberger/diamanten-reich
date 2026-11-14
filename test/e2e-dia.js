// Browser-Tests der Claude-Seite (Attrappe der Claude-db): Einrichtung, Abhaken durch das Kind, Freigabe durch die Eltern,
// Graben (Tipps, Gedrückthalten, Spaß-Funde), Feiern erst nach dem Graben und nur einmal, Wolken, Schätze, Zauberbeutel,
// Woche (Regenbogen), Eltern-Einstellungen, nichts wird vorgelesen, nur ansehen, ohne Zugriff, zweites Gerät, Konto, Spielwiese. Bildschirmfotos nach shots/.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const URL = 'file://' + path.resolve('build/diamanten.test.html');
const errs = [];
let bad = 0, n = 0;
const ok = (name, cond, info) => { n++; if (!cond) bad++; console.log((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' | ' + info : '')); };
const ALL = ['t_zaehne_m', 't_anziehen', 't_bett', 't_aufraeumen', 't_tisch', 't_zaehne_a', 't_schlafanzug'];
const marks = (ids, v) => Object.fromEntries(ids.map(id => [id, v]));
const T = '2026-11-13';
const BASE = over => Object.assign({
  'cfg/main': { v: 1, name: 'Lia', cloudsAck: true },
  'cfg/progress': { cel: {}, red: {}, album: [], foil: [], packN: 1, shown: {} },
}, over || {});
fs.mkdirSync('shots', { recursive: true });
async function open(b, preload, o = {}) {
  const ctx = o.ctx || await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  if (preload) await page.addInitScript(d => { window.__preload = d; }, preload);
  if (o.readonly) await page.addInitScript(() => { window.__readonly = true; });
  if (o.nodb) await page.addInitScript(() => { window.__nodb = true; });
  if (o.reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
  /* Sprachausgabe nachstellen: Die App liest nichts mehr vor; jeder Aufruf würde hier auffallen. */
  await page.addInitScript(() => {
    const fake = { speak: u => { (window.__spoken = window.__spoken || []).push(u.text); console.error('VORGELESEN: ' + u.text); }, cancel() {}, getVoices: () => [{ name: 'Anna', lang: 'de-DE' }], onvoiceschanged: null };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true, writable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: function (t) { this.text = t; }, configurable: true, writable: true });
  });
  await page.addInitScript(fs.readFileSync('test/mock-claude.js', 'utf8'));
  await page.clock.setFixedTime(new Date(T + 'T17:30:00'));
  await page.goto(URL); await page.waitForTimeout(900);
  return page;
}
const H = page => ({
  txt: sel => page.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/[\s ]+/g, ' ').trim() : null; }, sel),
  cnt: sel => page.evaluate(s => document.querySelectorAll(s).length, sel),
  all: sel => page.evaluate(s => Array.from(document.querySelectorAll(s)).map(e => e.textContent.replace(/[\s ]+/g, ' ').trim()), sel),
  wait: ms => page.waitForTimeout(ms),
  store: key => page.evaluate(k => { const v = window.__mock.store.get(k); return v === undefined ? null : JSON.parse(JSON.stringify(v)); }, key),
  spoken: () => page.evaluate(() => window.__spoken || []),
  shot: name => page.screenshot({ path: 'shots/' + name + '.png' }),
});
const tap = async (page, sel, ms = 250, force) => { await page.click(sel, force ? { force: true } : {}); await page.waitForTimeout(ms); };

(async () => {
  const b = await chromium.launch();
  let page, h;

  // ---- A) Einrichtung ----
  page = await open(b, null); h = H(page);
  ok('A Einrichtung erscheint beim ersten Start', /Willkommen im Diamanten-Reich/.test(await h.txt('.sheet h2')));
  ok('A Vorschau mit Schatzgräberin und Einhorn', await h.cnt('.ob-prev .girl') === 1 && await h.cnt('.ob-prev .unicorn') === 1);
  await h.shot('01-einrichtung');
  await page.fill('#ob-name', 'Lia');
  await tap(page, '[data-act="ob-look"][data-k="hair"][data-v="blond"]');
  await tap(page, '[data-act="ob-look"][data-k="dress"][data-v="rosa"]');
  ok('A Name bleibt beim Wählen der Farben erhalten', (await page.inputValue('#ob-name')) === 'Lia');
  await page.fill('#ob-uni', 'Glitzerhuf'); await page.fill('#ob-pin', '1234');
  await tap(page, '[data-act="ob-go"]', 900);
  const cm = await h.store('cfg/main');
  ok('A gespeichert: Name, Aussehen, Einhorn, Code als Hash', cm && cm.name === 'Lia' && cm.look.hair === 'blond' && cm.look.dress === 'rosa' && cm.unicorn === 'Glitzerhuf' && /^h:[0-9a-f]{64}$/.test(cm.pin), JSON.stringify(cm && cm.look));
  ok('A Begrüßung führt zum Zauberbeutel', /Willkommen, Lia!/.test(await h.txt('#banner')) && /Zauberbeutel/.test(await h.txt('#banner')));
  ok('A nichts wird vorgelesen', (await h.spoken()).length === 0);
  ok('A Tab Schätze zeigt einen wartenden Beutel', (await h.txt('.tab[data-tab="achieve"] .dot-badge')) === '1');
  await page.close();

  // ---- B) Kind tippt „Geschafft!“ ----
  page = await open(b, BASE({ 'cfg/main': { v: 1, name: 'Lia', cloudsAck: true, pin: '' } })); h = H(page);
  ok('B Morgens und Abends getrennt (3 + 4)', JSON.stringify(await h.all('.slot-h h2')) === JSON.stringify(['Morgens', 'Abends']) && await h.cnt('.tasks') === 2 && await h.cnt('.task') === 7);
  ok('B jede Aufgabe hat „Geschafft!“, keine Eltern-Knöpfe', await h.cnt('.claim') === 7 && await h.cnt('.task .seg') === 0);
  ok('B Szene: Schatzgräberin, Truhe, Einhorn, Graben-Knopf', await h.cnt('.scene .girl') === 1 && await h.cnt('.scene .chest') === 1 && await h.cnt('.scene .unicorn') === 1 && await h.cnt('.digbtn') === 1);
  await h.shot('02-heute');
  await tap(page, '.claim[data-task="t_zaehne_m"]', 400);
  ok('B getippt: wartet auf die Eltern (c), ohne Diamant', (await h.store('days/' + T)).m.t_zaehne_m === 'c' && /Wartet/.test(await h.txt('.task[data-task="t_zaehne_m"] .stamp')) && (await h.txt('#chestN')) === '0');
  ok('B Eltern-Schloss zeigt die Zahl der getippten Aufgaben', (await h.txt('.lockbtn .dot-badge')) === '1');
  await tap(page, '.task[data-task="t_zaehne_m"] .stamp-btn', 300);
  ok('B nochmal tippen: Hinweis, kein Zurücksetzen', /Wartet auf Mama oder Papa/.test(await h.txt('#toast')) && (await h.store('days/' + T)).m.t_zaehne_m === 'c');
  ok('B keine Vorlese-Knöpfe, Bild ist kein Knopf', await h.cnt('.saybtn') === 0 && await h.cnt('button.ico') === 0 && await h.cnt('[data-act="say"]') === 0);
  await tap(page, '.claim[data-task="t_anziehen"]', 400);

  // ---- C) Eltern geben frei ----
  await tap(page, '[data-act="lock"]', 300);
  ok('C Eltern sehen Getipptes hervorgehoben', await h.cnt('.task.claimed') === 2 && /Lia sagt: geschafft!/.test(await h.txt('.task.claimed')));
  ok('C Knopf „Getippte freigeben (2)“', /Getippte freigeben \(2\)/.test(await h.txt('[data-act="approve-claimed"]')));
  await h.shot('03-eltern-freigabe');
  await tap(page, '[data-act="approve-claimed"]', 500);
  const d1 = await h.store('days/' + T);
  ok('C freigegeben: beide y', d1.m.t_zaehne_m === 'y' && d1.m.t_anziehen === 'y');
  ok('C zwei Diamanten warten in der Erde (Blase, Tab, Hinweis)', (await h.txt('.wait-bubble')) === '2' && (await h.txt('.tab[data-tab="today"] .dot-badge')) === '2' && /2 Diamanten warten in der Erde/.test(await h.txt('#banner')));
  ok('C Truhe noch leer, Schätze zählen schon', (await h.txt('#chestN')) === '0');
  await tap(page, '.task[data-task="t_bett"] [data-st="n"]', 300);
  ok('C „Heute nicht“ ist neutral', (await h.store('days/' + T)).m.t_bett === 'n' && /Heute nicht/.test(await h.txt('.task[data-task="t_bett"] .stamp')));
  await tap(page, '.task[data-task="t_bett"] [data-st="n"]', 300);
  ok('C nochmal tippen nimmt es zurück', !(await h.store('days/' + T)).m.t_bett);
  await tap(page, '[data-act="lock"]', 300);

  // ---- D) Graben ----
  await tap(page, '.digbtn', 200);
  ok('D erster Spatenstich: Punkt 1 von 3, Loch wächst, noch kein Diamant', await h.cnt('.digbtn .pips i.on') === 1 && /s1/.test(await page.getAttribute('#mound', 'class')) && (await h.txt('#chestN')) === '0');
  ok('D Erde fliegt', await h.cnt('#dirt .clod') > 0);
  await tap(page, '.digbtn', 200);
  await h.shot('04-graben');
  await tap(page, '.digbtn', 1600);
  ok('D dritter Stich: Diamant in der Truhe, dg = 1', (await h.txt('#chestN')) === '1' && (await h.store('days/' + T)).dg === 1, await h.txt('#chestN'));
  ok('D Funkel! eingeblendet, noch einer wartet', /Funkel!/.test(await h.txt('#banner')) && /Noch ein Diamant/.test(await h.txt('#banner')));
  for (let i = 0; i < 3; i++) await tap(page, '.digbtn', i < 2 ? 150 : 1600);
  ok('D zweiter Diamant: Doppel-Funkel, alle in der Truhe', (await h.txt('#chestN')) === '2' && /Doppel-Funkel/.test(await h.txt('#banner')) && await h.cnt('.wait-bubble') === 0);
  for (let i = 0; i < 3; i++) await tap(page, '.digbtn', i < 2 ? 150 : 500);
  ok('D ohne Wartende: Spaß-Fund, zählt nicht', /kein Diamant/i.test(await h.txt('#banner')) && (await h.txt('#chestN')) === '2' && (await h.store('days/' + T)).dg === 2);
  await page.close();

  // ---- D2) Gedrückt halten gräbt alle ----
  page = await open(b, BASE({ 'days/2026-11-12': { m: marks(ALL.slice(0, 3), 'y') }, ['days/' + T]: { m: marks(ALL.slice(0, 2), 'y') } })); h = H(page);
  ok('D2 fünf warten (zwei Tage)', (await h.txt('.wait-bubble')) === '5' && /Gedrückt halten/.test(await h.txt('.scene-bar')));
  const box = await page.locator('.digbtn').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await h.wait(750); await page.mouse.up();
  await h.wait(9000);
  ok('D2 alle ausgegraben, ältester Tag zuerst', (await h.txt('#chestN')) === '5' && (await h.store('days/2026-11-12')).dg === 3 && (await h.store('days/' + T)).dg === 2, await h.txt('#chestN'));
  await page.close();

  // ---- E) Feiern erst nach dem Graben, nur einmal ----
  const nine = { 'days/2026-11-11': { m: marks(ALL, 'y'), dg: 7 }, 'days/2026-11-12': { m: marks(ALL.slice(0, 2), 'y'), dg: 2 } };
  page = await open(b, BASE(Object.assign({}, nine, { 'cfg/progress': { cel: {}, red: {}, album: [], foil: [], packN: 2, shown: {} }, 'cfg/main': { v: 1, name: 'Lia', cloudsAck: true, goals: [{ id: 'g10', at: 10, reward: 'Eis essen gehen' }, { id: 'g25', at: 25, reward: '' }] } }))); h = H(page);
  await tap(page, '[data-act="lock"]', 300);
  await tap(page, '.task[data-task="t_bett"] [data-st="y"]', 1500);
  ok('E Schatz erreicht, aber noch keine Feier (Diamant in der Erde)', await h.cnt('#celeb .celeb') === 0);
  await tap(page, '[data-act="lock"]', 300);
  for (let i = 0; i < 3; i++) await tap(page, '.digbtn', i < 2 ? 150 : 2600);
  ok('E nach dem Graben: „Schatz gefunden!“ mit Belohnung', /Schatz gefunden!/.test(await h.txt('#celeb')) && /Eis essen gehen/.test(await h.txt('#celeb .ce-reward')), await h.txt('#celeb'));
  await h.wait(900);
  await h.shot('05-feier');
  ok('E gemerkt: gezeigt und Datum', (await h.store('cfg/progress')).shown.g10 === 1 && (await h.store('cfg/progress')).cel['g:g10'] === T);
  await tap(page, '[data-act="celeb-next"]', 1500);
  ok('E danach: neuer Zauberbeutel eingeblendet', /Zauberbeutel/.test(await h.txt('#banner')));
  const store = await page.evaluate(() => Object.fromEntries(window.__mock.store));
  await page.close();
  page = await open(b, store); h = H(page); await h.wait(1500);
  ok('E nach dem Neuladen keine zweite Feier', await h.cnt('#celeb .celeb') === 0);
  await page.close();

  // ---- F) Wolken ----
  page = await open(b, BASE({ 'cfg/main': { v: 1, name: 'Lia', cloudsAck: false }, ['days/' + T]: { m: marks(ALL, 'y'), dg: 7 } })); h = H(page);
  await h.wait(800); await page.evaluate(() => { const c = document.querySelector('[data-act="celeb-next"]'); if (c) c.click(); }); await h.wait(500);
  await tap(page, '[data-act="lock"]', 300);
  await tap(page, '[data-act="clouds-unlock"]', 300);
  ok('F Wolken erst nach den Hinweisen für Eltern', /Hinweise für Eltern/.test(await h.txt('.sheet h2')) && /nie für Gefühle/i.test(await h.txt('.sheet')));
  await tap(page, '[data-act="clouds-ack"]', 400);
  await tap(page, '[data-act="extra-open"][data-k="y"]', 300);
  ok('F Fenster gelbe Wolke: Grund freiwillig', /Gelbe Wolke/.test(await h.txt('.sheet h2')) && (await page.getAttribute('#ex-text', 'placeholder')) === 'Kein Grund nötig');
  await tap(page, '[data-act="ex-save"]', 500);
  ok('F oben gelbe Wolke, Kopf zeigt sie, Truhe bleibt 7', await h.cnt('.cloudtop.yellow') === 1 && await h.cnt('.top .cloud-ic.yellow') === 1 && (await h.txt('#chestN')) === '7');
  await tap(page, '[data-act="extra-open"][data-k="y"]', 300); await tap(page, '[data-act="ex-save"]', 500);
  ok('F zweite gelbe → Gewitter', /Gewitter/.test(await h.txt('#banner')) && await h.cnt('.cloudtop.red') === 1 && await h.cnt('.cloudtop.yellow') === 0);
  await h.shot('06-wolken');
  await tap(page, '.ev.red [data-act="cloud-back"]', 300); await tap(page, '[data-act="confirm-yes"]', 500);
  ok('F zurückgenommen: wieder eine gelbe, kein Gewitter', await h.cnt('.cloudtop.red') === 0 && await h.cnt('.cloudtop.yellow') === 1);
  await tap(page, '[data-act="extra-open"][data-k="+"]', 300); await tap(page, '[data-act="ex-chip"][data-i="0"]', 200); await tap(page, '[data-act="ex-save"]', 600);
  ok('F Extra-Diamant mit Grund wartet in der Erde', (await h.store('days/' + T)).ev.some(x => x.k === '+' && x.t === 'Lieb geteilt') && (await h.txt('.wait-bubble')) === '1');
  await page.close();

  // ---- G) Schätze und Zauberbeutel ----
  page = await open(b, BASE({ 'cfg/main': { v: 2, name: 'Lia', goals: [{ id: 'g10', at: 10, reward: 'Glitzer-Tattoo' }, { id: 'g25', at: 25, reward: '' }, { id: 'g50', at: 50, reward: '' }, { id: 'g75', at: 75, reward: '' }, { id: 'g100', at: 100, reward: '' }, { id: 'g500', at: 500, reward: 'Freizeitpark' }] }, ['days/' + T]: { m: marks(ALL.slice(0, 4), 'y'), dg: 4 } })); h = H(page);
  await tap(page, '.tab[data-tab="achieve"]', 900);
  ok('G oben der nächste Schatz: noch 6 bis 10, Belohnung', /Nächster Schatz/.test(await h.txt('.big-chest h2')) && /Noch 6 Diamanten/.test(await h.txt('.big-chest')) && /Glitzer-Tattoo/.test(await h.txt('.big-chest .reward-box')));
  ok('G Liste gekürzt für das Kind (gefundene, nächster, zwei weitere, großer Schatz), Knopf für alle', await h.cnt('.tier') === 4 && /2 mehr/.test(await h.txt('[data-act="all-goals"]')), await h.cnt('.tier'));
  ok('G leere Belohnung heißt Überraschung', /Überraschung!/.test(await h.txt('.tier[data-goal="g25"]')));
  await h.shot('07-schaetze');
  await tap(page, '[data-act="pack-open"]', 400);
  ok('G Zauberbeutel öffnet sich', /Aufmachen!/.test(await h.txt('#celeb')));
  await tap(page, '[data-act="pack-tear"]', 1400, true);   // der Beutel wackelt ständig: für Playwright „nicht stabil“
  const al = (await h.store('cfg/progress')).album;
  ok('G neuer Sticker im Album, Steckbrief wird gezeigt', al.length === 1 && (await h.txt('#celeb .fact')).length > 10);
  await h.shot('08-sticker');
  await tap(page, '[data-act="pack-close"]', 500);
  ok('G Sticker im Album sichtbar', await h.cnt('.sticker.got') === 1);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await h.wait(300);
  await h.shot('09-album');
  await page.close();

  // ---- H) Woche ----
  page = await open(b, BASE({ 'days/2026-11-09': { m: marks(ALL, 'y'), dg: 7 }, 'days/2026-11-11': { m: marks(ALL.slice(0, 3), 'y'), dg: 3, ev: [{ k: 'y', id: 'y1' }] }, ['days/' + T]: { m: marks(ALL.slice(0, 5), 'y'), dg: 5 } })); h = H(page);
  await h.wait(600); await page.evaluate(() => { const c = document.querySelector('[data-act="celeb-next"]'); if (c) c.click(); }); await h.wait(400);
  await tap(page, '.tab[data-tab="week"]', 1400);
  ok('H Regenbogen mit 3 gefüllten Streifen und 15 Diamanten', await h.cnt('.rainbow .rb-fill') === 3 && /15/.test(await h.txt('.rainbow .rb-n')));
  ok('H Glitzer-Tag bekommt eine Krone, Wolke steht am Tag', await h.cnt('.wk-day .crown') === 1 && await h.cnt('.wk-day .cloud-ic') === 1);
  ok('H Zahlen: Diamanten, Glitzer-Tage, Funkel-Tage', JSON.stringify(await h.all('.stat b')) === JSON.stringify(['15', '1', '3', '3']), JSON.stringify(await h.all('.stat b')));
  await h.shot('10-woche');
  await page.close();

  // ---- I) Eltern-Einstellungen ----
  page = await open(b, BASE({ ['days/' + T]: { m: { t_zaehne_m: 'y' } } })); h = H(page);
  await tap(page, '[data-act="lock"]', 300); await tap(page, '.tab[data-tab="coach"]', 400);
  ok('I Eltern: Bereiche Aufgaben, Schätze, Graben, Wolken, Aussehen, Ton', await h.cnt('#sec-aufgaben') + await h.cnt('#sec-schaetze') + await h.cnt('#sec-graben') + await h.cnt('#sec-wolken') + await h.cnt('#sec-kind') + await h.cnt('#sec-ton') === 6);
  ok('I Schätze haben Beispiel-Belohnungen (alte Fassung ergänzt)', (await page.inputValue('#f-goal-g10')) === 'Glitzer-Tattoo aussuchen' && (await page.inputValue('#f-goal-g25')) === '2 € aufs Guthabenkonto' && !/fehlt noch die Belohnung/.test(await h.txt('#main')));
  await h.shot('11-eltern');
  await page.focus('#f-goal-g50'); await tap(page, '[data-act="reward-idea"][data-i="3"]', 300);
  ok('I Idee füllt das angetippte Feld', (await h.store('cfg/main')).goals.find(g => g.id === 'g50').reward === 'Einhorn-Sticker');
  ok('I kein Vorlesen in den Einstellungen, Schalter für die Spielwiese', await h.cnt('[data-act="voice-test"]') === 0 && await h.cnt('[data-act="speak"]') === 0 && await h.cnt('[data-act="games"]') === 1);
  await tap(page, '[data-act="step"][data-obj="cfg"][data-key="digTaps"][data-d="-1"]', 200);
  await tap(page, '[data-act="step"][data-obj="cfg"][data-key="digTaps"][data-d="-1"]', 600);
  ok('I Tipps je Diamant auf 1', (await h.store('cfg/main')).digTaps === 1);
  await tap(page, '[data-act="task-idea"][data-i="0"]', 400);
  ok('I Idee legt Aufgabe an und öffnet sie', (await h.store('cfg/main')).tasks.some(t => t.title === 'Hände waschen') && await h.cnt('.tedit') === 1);
  const nid = (await h.store('cfg/main')).tasks.find(t => t.title === 'Hände waschen').id;
  await tap(page, '[data-act="task-slot"][data-id="' + nid + '"][data-v="morgens"]', 400);
  ok('I Tageszeit umstellen', (await h.store('cfg/main')).tasks.find(t => t.id === nid).slot === 'morgens');
  await page.fill('#f-name', 'Lia Sophie'); await h.wait(900);
  ok('I Name ändern wird gespeichert', (await h.store('cfg/main')).name === 'Lia Sophie');
  await tap(page, '.tab[data-tab="today"]', 300); await tap(page, '[data-act="lock"]', 300);
  await tap(page, '.digbtn', 1600);
  ok('I mit 1 Tipp gräbt ein Stich einen Diamanten aus', (await h.txt('#chestN')) === '1');
  await tap(page, '[data-act="lock"]', 300); await tap(page, '.tab[data-tab="coach"]', 300);
  await tap(page, '[data-act="dig-mode"]', 300); await tap(page, '.tab[data-tab="today"]', 300);
  await tap(page, '.task[data-task="t_anziehen"] [data-st="y"]', 600);
  ok('I Graben aus: Diamant fliegt sofort in die Truhe', (await h.txt('#chestN')) === '2' && await h.cnt('.digbtn') === 0, await h.txt('#chestN') + ' ' + await h.cnt('.digbtn') + ' ' + JSON.stringify(await h.store('days/' + T)));
  await page.close();

  // ---- J) nur ansehen, ohne Zugriff ----
  page = await open(b, BASE({ ['days/' + T]: { m: { t_zaehne_m: 'y' } } }), { readonly: true }); h = H(page);
  ok('J nur ansehen: kein Geschafft, kein Graben, kein Eltern-Tab, Hinweis', await h.cnt('.claim') === 0 && await h.cnt('.digbtn') === 0 && await h.cnt('.tab[data-tab="coach"]') === 0 && /Nur ansehen/.test(await h.txt('.mode-note')));
  await page.close();
  page = await open(b, null, { nodb: true }); h = H(page);
  ok('J ohne Zugriff: Sperrseite statt neuem Spiel', (await page.getAttribute('.gate', 'data-gate')) === 'noaccess' && await h.cnt('.sheet') === 0);
  await page.close();

  // ---- K) zweites Gerät: Eltern geben woanders frei, Kind gräbt hier ----
  page = await open(b, BASE({ ['days/' + T]: { m: { t_zaehne_m: 'c' } } })); h = H(page);
  await page.evaluate(async () => { const db = await window.claude.use('db'); await db.doc('days/2026-11-13').set({ m: { t_zaehne_m: 'y' }, ev: [] }); });
  await h.wait(600);
  ok('K Freigabe vom anderen Gerät kommt an: ein Diamant wartet', (await h.txt('.wait-bubble')) === '1' && /Diamant!/.test(await h.txt('.task[data-task="t_zaehne_m"] .stamp')));
  await tap(page, '[data-act="lock"]', 200); await tap(page, '.tab[data-tab="coach"]', 300);
  await page.fill('#f-name', 'Li'); await page.locator('#f-name').pressSequentially('a', { delay: 120 }); await h.wait(1500);
  ok('K eigene Eingabe wird nicht vom Echo überschrieben', (await page.inputValue('#f-name')) === 'Lia');
  await page.close();

  // ---- L) Bewegung reduziert: keine Animation nötig ----
  page = await open(b, BASE({ ['days/' + T]: { m: { t_zaehne_m: 'y' } } }), { reduced: true }); h = H(page);
  for (let i = 0; i < 3; i++) await tap(page, '.digbtn', 150);
  await h.wait(400);
  ok('L reduzierte Bewegung: Graben klappt ohne Flug', (await h.txt('#chestN')) === '1');
  await page.close();

  // ---- M) schmales Gerät (iPhone SE) ----
  const ctx = await b.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  page = await open(b, BASE({ ['days/' + T]: { m: { t_zaehne_m: 'y', t_anziehen: 'c' } } }), { ctx }); h = H(page);
  const wide = () => page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => e.getBoundingClientRect().right > 320.5).slice(0, 4).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right)).join(', '));
  ok('M 320 px: nichts ragt seitlich heraus', await page.evaluate(() => document.documentElement.scrollWidth <= 320), await page.evaluate(() => document.documentElement.scrollWidth) + ' ' + await wide());
  await h.shot('12-schmal');
  await tap(page, '.tab[data-tab="konto"]', 300);
  ok('M 320 px: Konto passt', await page.evaluate(() => document.documentElement.scrollWidth <= 320), await wide());
  await page.close();

  // ---- N) Konto ----
  const full = { 'days/2026-11-10': { m: marks(ALL, 'y'), dg: 7 }, 'days/2026-11-11': { m: marks(ALL, 'y'), dg: 7 }, 'days/2026-11-12': { m: marks(ALL, 'y'), dg: 7 }, ['days/' + T]: { m: marks(ALL.slice(0, 4), 'y'), dg: 4 } };
  page = await open(b, BASE(Object.assign({}, full, { 'cfg/progress': { cel: {}, red: {}, album: [], foil: [], packN: 6, shown: { g10: 1, g25: 1 } } }))); h = H(page);
  const konto = () => page.evaluate(() => Array.from(window.__mock.store.entries()).filter(e => e[0].indexOf('konto/') === 0).map(e => e[1]));
  await tap(page, '.tab[data-tab="konto"]', 400);
  ok('N Tab Konto: Guthaben 0,00 €, für das Kind ohne Knöpfe', (await h.txt('#kontoSum')) === '0,00 €' && await h.cnt('[data-act="konto-open"]') === 0 && /Lias Konto/.test(await h.txt('.konto-hero')));
  await tap(page, '[data-act="lock"]', 300);
  await tap(page, '[data-act="konto-open"][data-k="plus"]', 300);
  await page.fill('#kx-amt', '2,5'); await tap(page, '[data-act="kx-chip"][data-t="Taschengeld"]', 200);
  ok('N Vorschau: danach 2,50 €', /Danach auf dem Konto: 2,50 €/.test(await h.txt('#kx-after')));
  await tap(page, '[data-act="kx-save"]', 600);
  let ks = await konto();
  ok('N gutgeschrieben: eine Buchung +250 Cent mit Grund', ks.length === 1 && ks[0].c === 250 && ks[0].k === 'plus' && ks[0].t === 'Taschengeld' && (await h.txt('#kontoSum')) === '2,50 €');
  ok('N Münzen als Bild: 2 große und eine kleine', await h.cnt('.kh-pile > .coin-svg') === 2 && await h.cnt('.kh-pile .small-coin') === 1);
  await tap(page, '[data-act="konto-open"][data-k="minus"]', 300);
  await page.fill('#kx-amt', '1'); await tap(page, '[data-act="kx-save"]', 300);
  ok('N Abbuchen nur mit Ja des Kindes', (await konto()).length === 1 && /Ja gesagt/.test(await h.txt('#toast')));
  await tap(page, '[data-act="kx-ok"]', 200); await tap(page, '[data-act="kx-save"]', 600);
  ok('N abgebucht: Guthaben 1,50 €', (await h.txt('#kontoSum')) === '1,50 €');
  await tap(page, '[data-act="konto-open"][data-k="pay"]', 300);
  ok('N Auszahlen schlägt das ganze Guthaben vor', (await page.inputValue('#kx-amt')) === '1,50');
  await page.fill('#kx-amt', '9'); await tap(page, '[data-act="kx-save"]', 300);
  ok('N mehr als das Guthaben geht nicht', /reicht nicht/.test(await h.txt('#toast')));
  await tap(page, '.sheet [data-act="sheet-close"]', 300);
  await tap(page, '.tab[data-tab="achieve"]', 500);
  ok('N Schätze mit Geld zeigen eine Münze', await h.cnt('.tier[data-goal="g25"] .tier-coin') === 1);
  await tap(page, '[data-act="redeem"][data-key="g25"]', 700);
  ks = await konto();
  const pr = await h.store('cfg/progress');
  ok('N Schatz „2 € aufs Guthabenkonto“ einlösen bucht 2 € aufs Konto', ks.length === 3 && ks.some(k => k.c === 200 && /Schatz: 25 Diamanten/.test(k.t)) && pr.red.g25 === T && !!pr.redK.g25 && /2,00 € aufs Konto/.test(await h.txt('#banner')));
  await tap(page, '.tab[data-tab="konto"]', 400);
  ok('N Guthaben jetzt 3,50 €, drei Buchungen', (await h.txt('#kontoSum')) === '3,50 €' && await h.cnt('.ev.kb') === 3);
  await h.shot('13-konto');
  await tap(page, '.tab[data-tab="achieve"]', 400); await tap(page, '[data-act="redeem"][data-key="g25"]', 500);
  ok('N Einlösen zurücknehmen entfernt die Gutschrift', (await konto()).length === 2 && !(await h.store('cfg/progress')).red.g25);
  const kstore = await page.evaluate(() => Object.fromEntries(window.__mock.store));
  await page.close();
  page = await open(b, kstore); h = H(page);
  await tap(page, '.tab[data-tab="konto"]', 400);
  ok('N nach dem Neuladen: Guthaben 1,50 €', (await h.txt('#kontoSum')) === '1,50 €');
  await tap(page, '[data-act="lock"]', 300); await tap(page, '.ev.kb [data-act="konto-del"]', 300); await tap(page, '[data-act="confirm-yes"]', 500);
  ok('N Buchung löschen', (await konto()).length === 1);
  await page.close();

  // ---- O) Spielwiese ----
  page = await open(b, BASE({ ['days/' + T]: { m: { t_zaehne_m: 'y' }, dg: 1 } })); h = H(page);
  ok('O Spielwiese mit drei Spielen auf Heute', await h.cnt('.gtile') === 3);
  await page.evaluate(() => document.querySelector('.games').scrollIntoView()); await h.wait(200);
  await h.shot('14-spielwiese');
  // Memory
  await tap(page, '[data-game="memory"]', 400);
  ok('O Memory: 12 verdeckte Karten', await h.cnt('.mcard') === 12 && await h.cnt('.mcard.open') === 0);
  const cards = await page.evaluate(() => window.__game.cards.map(c => c.v));
  const wrongB = cards.findIndex((v, i) => i > 0 && v !== cards[0]);
  await tap(page, '.mcard[data-i="0"]', 100); await tap(page, '.mcard[data-i="' + wrongB + '"]', 1200);
  ok('O Memory: falsches Paar dreht sich wieder um', await h.cnt('.mcard.open') === 0);
  const seen = {};
  for (let i = 0; i < cards.length; i++) { (seen[cards[i]] = seen[cards[i]] || []).push(i); }
  let pi = 0;
  for (const v of Object.keys(seen)) { await tap(page, '.mcard[data-i="' + seen[v][0] + '"]', 80); await tap(page, '.mcard[data-i="' + seen[v][1] + '"]', pi === 2 ? 300 : 400); if (pi === 2) await h.shot('15-memory'); pi++; }
  await h.wait(500);
  ok('O Memory: alle Paare gefunden, 7 Züge, Bestwert gespeichert', await h.cnt('.mcard.done') === 12 && /Alle Paare gefunden/.test(await h.txt('#gfoot')) && /7 Züge/.test(await h.txt('#gfoot')) && (await h.store('cfg/progress')).games.memory === 7);
  ok('O Memory zählt nicht für Diamanten', (await h.txt('#chestN')) === '1');
  await tap(page, '[data-act="mem-again"]', 300);
  ok('O Memory: Nochmal mischt neu', await h.cnt('.mcard.done') === 0 && await h.cnt('.mcard') === 12);
  await tap(page, '.g-x', 300);
  // Hütchen
  await tap(page, '[data-game="cups"]', 500);
  ok('O Hütchen: Diamant wird gezeigt', await h.cnt('.cup.up') === 3 && await h.cnt('.cup-gem') === 1);
  await h.wait(1600);
  await h.shot('16-huetchen');
  await page.waitForFunction(() => window.__game && window.__game.phase === 'pick', null, { timeout: 8000 });
  const gemCup = await page.evaluate(() => window.__game.gem);
  await tap(page, '.cup[data-cup="' + gemCup + '"]', 500, true);   // Hütchen wackeln: für Playwright „nicht stabil“
  ok('O Hütchen: richtig geraten, Rekord 1', /Gefunden!/.test(await h.txt('#gfoot')) && (await h.store('cfg/progress')).games.cups === 1);
  await tap(page, '[data-act="cups-again"]', 300);
  await page.waitForFunction(() => window.__game && window.__game.phase === 'pick', null, { timeout: 9000 });
  const wrongCup = await page.evaluate(() => (window.__game.gem + 1) % 3);
  await tap(page, '.cup[data-cup="' + wrongCup + '"]', 900, true);
  ok('O Hütchen: daneben ist kein Drama („Fast!“), richtiges Hütchen hebt sich', /Fast!/.test(await h.txt('#gfoot')) && await h.cnt('.cup.up') === 2);
  await tap(page, '[data-act="cups-again"]', 300); await tap(page, '.g-x', 2500);
  ok('O Hütchen schließen mitten im Mischen: keine Fehler', await h.cnt('.sheet') === 0);
  // Sternenregen
  await tap(page, '[data-game="catch"]', 400);
  await tap(page, '[data-act="catch-go"]', 2200);
  ok('O Sternenregen: Diamanten fallen', await h.cnt('.fall') > 0);
  await h.shot('17-sternenregen');
  const caught = await page.evaluate(() => { const f = document.querySelector('.fall:not(.hit)'); if (!f) return 0; f.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); return 1; });
  await h.wait(200);
  ok('O Sternenregen: Antippen fängt', caught === 1 && +(await h.txt('#ctScore')) >= 1);
  await page.waitForFunction(() => window.__game && window.__game.phase === 'over', null, { timeout: 30000 });
  await h.wait(300);
  ok('O Sternenregen: nach 25 s Ende mit Ergebnis und Bestwert', /gefangen/.test(await h.txt('#gfoot')) && ((await h.store('cfg/progress')).games || {}).catch >= 1 && await h.cnt('.fall') === 0, await h.txt('#gfoot') + ' ' + JSON.stringify((await h.store('cfg/progress')).games) + ' ' + await h.cnt('.fall'));
  await tap(page, '#gfoot [data-act="sheet-close"]', 300);
  await tap(page, '[data-act="lock"]', 300); await tap(page, '.tab[data-tab="coach"]', 300); await tap(page, '[data-act="games"]', 400);
  await tap(page, '.tab[data-tab="today"]', 300);
  ok('O Eltern schalten die Spielwiese aus', (await h.store('cfg/main')).games === false && await h.cnt('.gtile') === 0);
  await page.close();

  ok('Keine Fehler in der Konsole, nie etwas vorgelesen', errs.length === 0, errs.slice(0, 5).join(' | '));
  console.log('\n' + (n - bad) + ' von ' + n + ' Prüfungen bestanden' + (bad ? ', ' + bad + ' FEHLER' : ''));
  await b.close();
  process.exit(bad ? 1 : 0);
})();
