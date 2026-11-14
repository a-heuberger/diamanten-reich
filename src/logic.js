/* ============ Regeln, Datum, Auswertung (rein, ohne DOM) ============
   Diamanten-Reich: Aufgaben bringen Diamanten. Das Kind tippt „Geschafft!“ (Zustand c), ein Elternteil gibt frei (y).
   Jeder freigegebene Diamant wartet in der Erde, bis die Schatzgräberin ihn ausgräbt (days/<ds>.dg zählt die gegrabenen).
   Wolken sind die Verwarnungen: gelbe Wolke −1, Gewitterwolke −3 (Regeln wie bei den Karten der Torjäger-App).
   Dazu ein Guthabenkonto in Euro (konto/<id>, je Buchung ein Dokument), wie in der Torjäger-App. */
const WD_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WD_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

const pad2 = n => String(n).padStart(2, '0');
const fmtDate = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const parseDate = s => { const p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0); };
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return fmtDate(d); };
const dowOf = s => parseDate(s).getDay();
const mondayOf = s => { const d = parseDate(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return fmtDate(d); };
const todayStr = () => fmtDate(new Date());
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
function isoWeek(s) {
  const d = parseDate(s);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4, 12);
  return 1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}

/* ---------- Voreinstellungen ---------- */
const CFG_V = 2;
const SLOTS = { morgens: 'Morgens', abends: 'Abends' };
const HAIR = { braun: { name: 'Braun', fill: '#7a4a2a', dark: '#5a331b' }, blond: { name: 'Blond', fill: '#f2c45a', dark: '#c99a2e' }, schwarz: { name: 'Schwarz', fill: '#2d2433', dark: '#16111a' }, rot: { name: 'Rot', fill: '#d4643a', dark: '#a8461f' }, hellbraun: { name: 'Hellbraun', fill: '#b07a4a', dark: '#83572f' } };
const DRESS = { tuerkis: { name: 'Türkis', fill: '#2cc6c3', dark: '#14918f' }, rosa: { name: 'Rosa', fill: '#ff8fc1', dark: '#e0609d' }, lila: { name: 'Lila', fill: '#a98bff', dark: '#7c5ce0' }, gold: { name: 'Gold', fill: '#ffc93c', dark: '#d79a12' }, blau: { name: 'Blau', fill: '#5aa8ff', dark: '#2f7fdc' } };
const STYLE = { zoepfe: 'Zöpfe', offen: 'Offen', dutt: 'Dutt' };
const DEFAULT_GOALS = [
  [10, 'Glitzer-Tattoo aussuchen'],
  [25, '2 € aufs Guthabenkonto'],
  [50, 'Filmnachmittag mit Popcorn'],
  [75, 'Kleines Spielzeug aussuchen'],
  [100, '5 € aufs Guthabenkonto'],
  [150, 'Ausflug in den Zoo'],
  [200, 'Neues Buch oder Spiel aussuchen'],
  [300, '10 € aufs Guthabenkonto'],
  [500, 'Ausflug in den Freizeitpark'],
];
function defaultCfg() {
  const all = [0, 1, 2, 3, 4, 5, 6];
  return {
    v: CFG_V,
    name: 'Lia',
    look: { hair: 'braun', style: 'zoepfe', dress: 'tuerkis' },
    unicorn: 'Funkelstern',
    pin: '',
    cloudsAck: false,    // Hinweise für Eltern gelesen (schaltet Wolken frei)
    digMode: true,       // das Kind gräbt jeden freigegebenen Diamanten selbst aus
    digTaps: 3,          // so viele Spatenstiche je Diamant (1 bis 5)
    digFun: true,        // ohne wartende Diamanten findet die Gräberin Kleinigkeiten (zählen nicht)
    games: true,         // Spielwiese mit Mini-Spielen (zählen nicht für Diamanten)
    yellowPts: 1,        // gelbe Wolke = so viele Diamanten Abzug bei den Schätzen
    redPts: 3,           // Gewitterwolke = so viele Diamanten Abzug, höchstens einmal pro Tag
    extraMax: 3,         // höchstens so viele Extra-Diamanten pro Tag
    packEvery: 5,        // alle so viele Diamanten gibt es einen Zauberbeutel
    /* Vorschlag, bis die Eltern die echte Liste eintragen. Morgens und abends, an jedem Tag. */
    tasks: [
      { id: 't_zaehne_m', icon: '🦷', title: 'Zähne putzen', slot: 'morgens', pts: 1, days: all },
      { id: 't_anziehen', icon: '👗', title: 'Selbst anziehen', slot: 'morgens', pts: 1, days: all },
      { id: 't_bett', icon: '🛏️', title: 'Kuscheltiere aufs Bett', slot: 'morgens', pts: 1, days: all },
      { id: 't_aufraeumen', icon: '🧸', title: 'Spielzeug aufräumen', slot: 'abends', pts: 1, days: all },
      { id: 't_tisch', icon: '🍽️', title: 'Beim Tischdecken helfen', slot: 'abends', pts: 1, days: all },
      { id: 't_zaehne_a', icon: '🪥', title: 'Zähne putzen', slot: 'abends', pts: 1, days: all },
      { id: 't_schlafanzug', icon: '🌙', title: 'Schlafanzug anziehen', slot: 'abends', pts: 1, days: all },
    ],
    /* Schätze: alle Diamanten zusammen (Aufgaben, Extra-Diamanten, Bonus-Diamanten der Sticker), abzüglich Wolken.
       Der erste nach etwa 2 bis 3 Tagen, danach größere Abstände. Die Belohnungen sind Beispiele, die Eltern ändern sie.
       „2 € aufs Guthabenkonto“ bucht den Betrag beim Einlösen aufs Konto. Leer = Überraschung. */
    goals: DEFAULT_GOALS.map(g => ({ id: 'g' + g[0], at: g[0], reward: g[1] })),
    chest: { title: 'Der große Schatz' },
    goodReasons: ['Lieb geteilt', 'Toll geholfen', 'Mutig gewesen', 'Gut zugehört', 'Allein geschafft', 'Lieb getröstet'],
  };
}

/* Schätze bereinigen: nach Diamanten sortiert, jede Zahl nur einmal, Belohnung als Text. Ohne brauchbare Liste gelten die Vorgaben. */
function normGoals(list, dflt) {
  const out = [], used = {};
  (Array.isArray(list) ? list : []).forEach(g => {
    const at = Math.round(+(g && g.at));
    if (!isFinite(at) || at < 1 || at > 100000) return;
    let id = String((g && g.id) || 'g' + at); while (used[id]) id += 'x';
    used[id] = 1;
    out.push({ id, at, reward: String(g.reward == null ? '' : g.reward).slice(0, 120) });
  });
  out.sort((a, b) => a.at - b.at);
  for (let i = 1; i < out.length; i++) if (out[i].at <= out[i - 1].at) out[i].at = out[i - 1].at + 1;
  return out.length ? out : dflt.map(g => Object.assign({}, g));
}
const clampInt = (v, a, b, dflt) => { const n = Math.round(+v); return isFinite(n) ? Math.max(a, Math.min(b, n)) : dflt; };
const pickKey = (obj, k, dflt) => (Object.prototype.hasOwnProperty.call(obj, k) ? k : dflt);

/* Fehlende Felder aus den Voreinstellungen ergänzen, Werte in gültige Bereiche bringen (alte Daten bleiben nutzbar). */
function migrateCfg(c) {
  const d = defaultCfg();
  const old = c || {};
  const out = Object.assign({}, d, old);
  out.name = String(out.name == null ? d.name : out.name).slice(0, 20);
  out.unicorn = String(out.unicorn == null ? d.unicorn : out.unicorn).slice(0, 20);
  const lk = old.look || {};
  out.look = { hair: pickKey(HAIR, lk.hair, d.look.hair), style: pickKey(STYLE, lk.style, d.look.style), dress: pickKey(DRESS, lk.dress, d.look.dress) };
  out.tasks = (Array.isArray(old.tasks) ? old.tasks : d.tasks).map(t => {
    const n = Object.assign({ icon: '⭐', title: '', slot: 'morgens', pts: 1, days: [0, 1, 2, 3, 4, 5, 6] }, t);
    n.slot = SLOTS[n.slot] ? n.slot : 'morgens';
    n.pts = clampInt(n.pts, 1, 3, 1);
    if (!Array.isArray(n.days) || !n.days.length) n.days = [0, 1, 2, 3, 4, 5, 6];
    delete n.bonus; delete n.sub;
    return n;
  });
  out.chest = { title: String((old.chest && old.chest.title) || d.chest.title).slice(0, 40) };
  out.goals = normGoals(old.goals, d.goals);
  /* Fassung 1 hatte leere Belohnungen: Die Vorgabe-Schätze bekommen die Beispiele, eigene Texte bleiben. */
  if ((old.v || 0) < 2) out.goals.forEach(g => { const dg = d.goals.find(x => x.id === g.id && x.at === g.at); if (dg && !String(g.reward || '').trim()) g.reward = dg.reward; });
  out.yellowPts = clampInt(out.yellowPts, 0, 5, d.yellowPts);
  out.redPts = clampInt(out.redPts, 1, 9, d.redPts);
  out.extraMax = clampInt(out.extraMax, 1, 10, d.extraMax);
  out.packEvery = clampInt(out.packEvery, 3, 20, d.packEvery);
  out.digTaps = clampInt(out.digTaps, 1, 5, d.digTaps);
  out.digMode = out.digMode !== false;
  out.digFun = out.digFun !== false;
  out.games = out.games !== false;
  if (!Array.isArray(out.goodReasons)) out.goodReasons = d.goodReasons;
  out.v = CFG_V;
  return out;
}
const normProg = p => Object.assign({ cel: {}, red: {}, redK: {}, album: [], foil: [] }, p || {});

/* ---------- Konto (Guthaben): Beträge immer in ganzen Cent ---------- */
const fmtEUR = c => (c < 0 ? '−' : '') + Math.floor(Math.abs(c) / 100) + ',' + pad2(Math.abs(c) % 100) + ' €';
const fmtPlain = c => Math.floor(c / 100) + ',' + pad2(c % 100);
/* „2,5“, „2.50“, „€ 3“ → Cent. Nur Beträge über 0 bis 1000 €, sonst null. */
function parseMoney(s) {
  const t = String(s == null ? '' : s).replace(/[€\s\u00a0]/g, '').replace(/^\+/, '');
  if (!/^\d{1,4}([.,]\d{1,2})?$/.test(t)) return null;
  const c = Math.round(parseFloat(t.replace(',', '.')) * 100);
  return c > 0 && c <= 100000 ? c : null;
}
const kontoBalance = S => Object.keys(S.konto || {}).reduce((n, id) => n + (Math.round(+S.konto[id].c) || 0), 0);
const kontoList = S => Object.keys(S.konto || {}).map(id => Object.assign({ id }, S.konto[id])).sort((a, b) => ((b.ts || 0) - (a.ts || 0)) || (a.id < b.id ? 1 : -1));
const genitive = n => (/[sßxz]$/i.test(n) ? n + '’' : n + 's');
/* Steht in der Belohnung „2 € aufs Guthabenkonto“, bucht die App den Betrag beim Einlösen (in Cent, sonst 0). */
function rewardMoney(text) {
  const m = /(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:€|euro)\s*(?:auf|aufs|auf\s+das|auf\s+dem|ins)\s*(?:guthaben)?\s*konto/i.exec(String(text || ''));
  return m ? (parseMoney(m[1]) || 0) : 0;
}

/* ---------- Funkel-Rufe (Diamanten an einem Tag) ---------- */
const LADDER = { 1: 'Funkel!', 2: 'Doppel-Funkel!', 3: 'Dreifach-Funkel!', 4: 'Super-Funkel!', 5: 'Mega-Funkel!' };
const ladderText = n => LADDER[Math.max(1, Math.min(n, 5))];

/* ---------- Sammelsticker: 40 Stück in drei Seltenheiten ----------
   Normal zählt 1 Punkt, selten 2, ultraselten 5. Je 10 Sticker-Punkte gibt es 1 Bonus-Diamant.
   Bild: ein Emoji oder „gem:<farbe>“ (gezeichneter Edelstein). */
const RARITY = { n: { name: 'Normal', pts: 1 }, r: { name: 'Selten', pts: 2 }, u: { name: 'Ultraselten', pts: 5 } };
const RAR_ORDER = ['u', 'r', 'n'];
const RAR_WEIGHT = { n: 12, r: 4, u: 1 };       // Ziehungsgewicht im Zauberbeutel: Seltene kommen seltener
const PTS_PER_DIAMANT = 10;
const CATS = ['Einhörner', 'Prinzessinnen', 'Edelsteine', 'Märchenwelt'];
const STICKER_DATA = [
  /* Einhörner */
  ['🦄', 'Funkel-Einhorn', 'Einhörner', 'n', 'Ein Einhorn hat ein Horn auf der Stirn. Wenn es lacht, funkelt es.'],
  ['🌈', 'Regenbogen', 'Einhörner', 'n', 'Ein Regenbogen hat sieben Farben. Einhörner rutschen gern darauf.'],
  ['☁️', 'Wolkenbett', 'Einhörner', 'n', 'Auf weichen Wolken schlafen Einhörner am liebsten.'],
  ['🌟', 'Sternenstaub', 'Einhörner', 'n', 'Sternenstaub glitzert, wenn man ihn in die Luft pustet.'],
  ['🎠', 'Karussell-Pony', 'Einhörner', 'n', 'Das Karussell-Pony dreht sich im Kreis und spielt Musik.'],
  ['🥕', 'Einhorn-Snack', 'Einhörner', 'n', 'Auch Einhörner knabbern gern eine Möhre.'],
  ['💫', 'Sternschnuppe', 'Einhörner', 'r', 'Wenn du eine Sternschnuppe siehst, darfst du dir etwas wünschen.'],
  ['🌙', 'Mondschein-Einhorn', 'Einhörner', 'r', 'Dieses Einhorn wacht nachts und passt auf die Träume auf.'],
  ['🪽', 'Zauberflügel', 'Einhörner', 'r', 'Mit Zauberflügeln fliegt das Einhorn bis zu den Sternen.'],
  ['🦄', 'Gold-Einhorn', 'Einhörner', 'u', 'Das Gold-Einhorn zeigt sich nur ganz besonderen Kindern.'],
  /* Prinzessinnen */
  ['👑', 'Krone', 'Prinzessinnen', 'n', 'Eine Krone trägt man auf dem Kopf. Diese hier funkelt wie du.'],
  ['🏰', 'Schloss', 'Prinzessinnen', 'n', 'Im Schloss gibt es viele Türme und eine lange Treppe.'],
  ['👗', 'Ballkleid', 'Prinzessinnen', 'n', 'In diesem Kleid kann man sich wunderbar im Kreis drehen.'],
  ['👠', 'Glitzerschuh', 'Prinzessinnen', 'n', 'Der Glitzerschuh glänzt bei jedem Schritt.'],
  ['🎀', 'Schleife', 'Prinzessinnen', 'n', 'Eine Schleife macht aus allem ein Geschenk.'],
  ['🫖', 'Teeparty', 'Prinzessinnen', 'n', 'Bei der Teeparty sitzen alle Kuscheltiere mit am Tisch.'],
  ['🪞', 'Zauberspiegel', 'Prinzessinnen', 'r', 'Der Zauberspiegel sagt: Du bist toll, so wie du bist.'],
  ['🌹', 'Zauberrose', 'Prinzessinnen', 'r', 'Diese Rose blüht das ganze Jahr.'],
  ['💍', 'Funkelring', 'Prinzessinnen', 'r', 'Ein Ring mit einem kleinen Diamanten.'],
  ['👸', 'Prinzessin', 'Prinzessinnen', 'u', 'Eine echte Prinzessin ist mutig, freundlich und hilft anderen.'],
  /* Edelsteine (gezeichnet) */
  ['gem:weiss', 'Diamant', 'Edelsteine', 'n', 'Diamanten sind die härtesten Steine der Welt.'],
  ['gem:rubin', 'Rubin', 'Edelsteine', 'n', 'Ein Rubin ist rot wie eine Erdbeere.'],
  ['gem:saphir', 'Saphir', 'Edelsteine', 'n', 'Ein Saphir ist blau wie das Meer.'],
  ['gem:smaragd', 'Smaragd', 'Edelsteine', 'n', 'Ein Smaragd ist grün wie eine Wiese.'],
  ['gem:amethyst', 'Amethyst', 'Edelsteine', 'n', 'Ein Amethyst ist lila wie Flieder.'],
  ['gem:topas', 'Topas', 'Edelsteine', 'n', 'Ein Topas leuchtet gelb wie die Sonne.'],
  ['gem:rosa', 'Rosenquarz', 'Edelsteine', 'r', 'Rosenquarz ist rosa und heißt auch Stein der Liebe.'],
  ['gem:tuerkis', 'Aquamarin', 'Edelsteine', 'r', 'Aquamarin heißt Meerwasser. So sieht er auch aus.'],
  ['🦪', 'Perle', 'Edelsteine', 'r', 'Perlen wachsen in Muscheln tief im Meer.'],
  ['gem:regenbogen', 'Regenbogen-Diamant', 'Edelsteine', 'u', 'Ein Diamant in allen Farben. Den gibt es nur einmal.'],
  /* Märchenwelt */
  ['🐚', 'Muschel', 'Märchenwelt', 'n', 'Halte eine Muschel ans Ohr, dann hörst du das Meer rauschen.'],
  ['🦋', 'Schmetterling', 'Märchenwelt', 'n', 'Ein Schmetterling war früher eine kleine Raupe.'],
  ['🌸', 'Kirschblüte', 'Märchenwelt', 'n', 'Im Frühling werden ganze Bäume rosa.'],
  ['🍄', 'Glückspilz', 'Märchenwelt', 'n', 'Im Märchenwald wohnen Wichtel unter Pilzen.'],
  ['🪄', 'Zauberstab', 'Märchenwelt', 'n', 'Einmal schwingen, und alles glitzert.'],
  ['🐬', 'Delfin', 'Märchenwelt', 'n', 'Delfine sind schlau und springen hoch aus dem Wasser.'],
  ['🦢', 'Schwan', 'Märchenwelt', 'r', 'Ein Schwan gleitet ganz leise über den See.'],
  ['🏝️', 'Schatzinsel', 'Märchenwelt', 'r', 'Auf der Schatzinsel ist der Schatz mit einem Kreuz markiert.'],
  ['🧜‍♀️', 'Meerjungfrau', 'Märchenwelt', 'u', 'Die Meerjungfrau hütet die Schätze am Meeresgrund.'],
  ['🧚', 'Glücksfee', 'Märchenwelt', 'u', 'Die Glücksfee streut Glitzer auf alle, die lieb sind.'],
];
const STICKERS = STICKER_DATA.map((s, i) => ({ id: 's' + pad2(i + 1), ico: s[0], name: s[1], cat: s[2], rar: s[3], fact: s[4] }));
const STICKER_BY = {};
STICKERS.forEach(s => { STICKER_BY[s.id] = s; });
const rarOf = id => (STICKER_BY[id] ? STICKER_BY[id].rar : 'n');
const stickerPoints = prog => (prog.album || []).filter(id => STICKER_BY[id]).reduce((n, id) => n + RARITY[rarOf(id)].pts, 0);
const stickerBonus = prog => Math.floor(stickerPoints(prog) / PTS_PER_DIAMANT);
/* Zieht einen Sticker aus der Liste, Seltene mit kleinerem Gewicht (rnd liefert 0 bis unter 1). */
function pickSticker(list, rnd) {
  const r = rnd || Math.random, tot = list.reduce((n, s) => n + RAR_WEIGHT[s.rar], 0);
  let x = r() * tot;
  for (let i = 0; i < list.length; i++) { x -= RAR_WEIGHT[list[i].rar]; if (x < 0) return list[i]; }
  return list[list.length - 1];
}
const packsLeft = (earned, album, foil) => { const opened = album.length + (foil || []).length; return opened >= 2 * STICKERS.length ? 0 : Math.max(0, earned - opened); };

/* ---------- Spaß-Funde: Was die Gräberin ohne wartende Diamanten findet (zählt nicht) ---------- */
const FUN_FINDS = [['🪱', 'Ein Regenwurm'], ['🌼', 'Eine Blume'], ['⭐', 'Ein Stern'], ['🐚', 'Eine Muschel'], ['🐞', 'Ein Marienkäfer'], ['🪨', 'Ein runder Stein'], ['🍂', 'Ein Blatt'], ['🦴', 'Ein Knochen'], ['🔑', 'Ein alter Schlüssel'], ['🐌', 'Eine Schnecke']];

/* ---------- Aufgaben eines Tages ---------- */
function tasksOn(S, ds) {
  const day = S.days[ds], m = (day && day.m) || {}, wd = dowOf(ds);
  return S.cfg.tasks.filter(t => {
    if (m[t.id]) return true;                       // bereits eingetragen: zählt weiter, auch wenn die Aufgabe später geändert wird
    if (t.from && ds < t.from) return false;        // erst ab Anlegedatum
    if (t.until && ds >= t.until) return false;     // ausgeblendet ab Datum
    return (t.days || []).indexOf(wd) >= 0;
  });
}

/* ---------- Wolken (rechnet alle Tage der Reihe nach durch) ----------
   Gelbe Wolke (k: 'y') = Verwarnung, kostet yellowPts. Gelbe verfallen nie.
   Zwei offene Gelbe = automatisch Gewitterwolke. Gewitter (k: 'r') kostet redPts (höchstens einmal pro Tag) und vertreibt die Gelben.
   Das Minus zählt bei den Schätzen; die Diamanten des Tages und in der Truhe bleiben unberührt.
   Extra-Diamanten (k: '+') aus einem eigenen Grund, höchstens extraMax pro Tag.
   Automatische Gewitter sind abgeleitet, nicht gespeichert: Wird ein Eintrag gelöscht, rechnet sich alles neu.
   Der automatische Eintrag merkt sich in src die zweite Gelbe, die ihn ausgelöst hat. */
function buildLedger(S) {
  const cfg = S.cfg, limit = 2;
  const yPts = Math.max(0, +cfg.yellowPts || 0), rPts = Math.max(0, +cfg.redPts || 0);
  const xMax = Math.max(0, cfg.extraMax == null ? 3 : +cfg.extraMax);
  const dates = Object.keys(S.days).filter(ds => (S.days[ds].ev || []).length).sort();
  const byDay = {};
  let active = [];
  for (const ds of dates) {
    const L = { plus: 0, plusRaw: 0, plusN: 0, yellow: 0, red: 0, autoRed: 0, minus: 0, entries: [] };
    let redDone = false;
    const storm = (auto, e, src) => {
      const counts = !redDone; redDone = true;
      if (auto) L.autoRed++; else L.red++;
      if (counts) L.minus += rPts;
      active = [];
      L.entries.push(auto ? { k: 'r', auto, capped: !counts, src } : Object.assign({}, e, { capped: !counts }));
    };
    for (const e of S.days[ds].ev) {
      if (e.k === '+') { L.plusRaw += Math.max(1, Math.round(+e.v) || 1); L.plusN++; L.entries.push(e); }
      else if (e.k === 'r') storm(null, e);
      else if (e.k === 'y') {
        active.push(ds); L.yellow++; L.minus += yPts; L.entries.push(e);
        if (active.length >= limit) storm('sum', null, e.id);
      }
    }
    L.plus = Math.min(L.plusRaw, xMax);
    byDay[ds] = L;
  }
  return { byDay, active, limit };
}
function ledgerOf(S) {
  if (S._ledger && S._v !== undefined && S._lv === S._v) return S._ledger;
  S._ledger = buildLedger(S); S._lv = S._v;
  return S._ledger;
}
const touch = S => { S._v = (S._v || 0) + 1; };

/* Offene gelbe Wolken (verfallen nie, bis eine Gewitterwolke sie vertreibt). */
function cloudsNow(S) {
  const lg = ledgerOf(S);
  return { count: lg.active.length, limit: lg.limit, dates: lg.active.slice() };
}

/* ---------- Ein Tag ----------
   Zustände je Aufgabe: c = vom Kind getippt (wartet auf die Eltern), y = freigegeben (Diamant), n = heute nicht.
   gain = Diamanten des Tages (freigegebene Aufgaben und Extra-Diamanten). dug = davon ausgegraben, waiting = noch in der Erde. */
function evalDay(S, ds) {
  const day = S.days[ds] || {};
  const r = { ds, items: [], max: 0, gain: 0, plus: 0, plusN: 0, minus: 0, open: 0, claimed: 0, ok: 0, na: 0, appN: 0, judged: 0, hasData: false, result: 'none', perfect: false, complete: false, entries: [], yellow: 0, red: 0, dug: 0, waiting: 0 };
  const m = day.m || {};
  let gain = 0;
  r.items = tasksOn(S, ds).map(t => {
    const st = m[t.id] || null;
    r.appN++; r.max += t.pts;
    if (st === 'y') { gain += t.pts; r.ok++; }
    else if (st === 'n') r.na++;
    else { r.open++; if (st === 'c') r.claimed++; }
    return { t, st };
  });
  const led = ledgerOf(S).byDay[ds];
  if (led) {
    r.plus = led.plus; r.plusN = led.plusN; r.entries = led.entries;
    r.yellow = led.yellow; r.red = led.red + led.autoRed;
    r.minus = led.minus;
  }
  r.gain = gain + r.plus;
  const dg = Math.max(0, Math.round(+day.dg) || 0);
  r.dug = S.cfg.digMode === false ? r.gain : Math.min(dg, r.gain);
  r.waiting = r.gain - r.dug;
  r.judged = r.ok + r.na;
  r.hasData = r.judged > 0 || r.gain > 0;
  if (r.gain > 0) r.result = 'win';
  else if (r.judged > 0 && r.open === 0) r.result = 'loss';
  r.perfect = r.appN > 0 && r.ok === r.appN && r.red === 0 && r.yellow === 0;
  r.complete = r.appN > 0 && r.open === 0;
  return r;
}

/* ---------- Eine Woche (Montag bis Sonntag) ---------- */
function evalWeek(S, mon) {
  const days = [];
  let gems = 0, max = 0, perfect = 0, yellow = 0, red = 0, minus = 0, sparkle = 0;
  for (let i = 0; i < 7; i++) {
    const ds = addDays(mon, i), e = evalDay(S, ds);
    days.push(e); gems += e.gain; max += e.max; if (e.perfect) perfect++; if (e.gain > 0) sparkle++;
    yellow += e.yellow; red += e.red; minus += e.minus;
  }
  return { mon, days, gems, max, perfect, yellow, red, minus, sparkle };
}

/* ---------- Gesamtstand ----------
   total = alle freigegebenen Diamanten plus Bonus-Diamanten der Sticker. Danach richten sich Zauberbeutel und (abzüglich Wolken) die Schätze.
   chest = Diamanten in der Truhe (ausgegraben plus Bonus): Das zeigen Kopf und Truhe. waiting = noch in der Erde.
   Gefeiert wird erst, wenn nichts mehr wartet (siehe actions.js). */
function computeStats(S, today) {
  const dates = Object.keys(S.days).filter(d => d <= today).sort();
  let days = 0, dug = 0, waiting = 0, perfect = 0, extras = 0, cur = 0, best = 0, yellows = 0, reds = 0, minus = 0, firstWaiting = null;
  for (const ds of dates) {
    const e = evalDay(S, ds);
    days += e.gain; dug += e.dug; waiting += e.waiting; minus += e.minus; extras += e.plusN; yellows += e.yellow; reds += e.red;
    if (e.waiting > 0 && !firstWaiting) firstWaiting = ds;
    if (e.perfect) perfect++;
    if (e.result === 'win') { cur++; if (cur > best) best = cur; }
    else if (e.result === 'loss') cur = 0;
  }
  const album = S.prog.album || [], foil = S.prog.foil || [];
  const pts = stickerPoints(S.prog), bonus = Math.floor(pts / PTS_PER_DIAMANT);
  const total = days + bonus;
  const score = total - minus;
  const every = Math.max(1, +S.cfg.packEvery || 5);
  const earned = 1 + Math.floor(total / every);
  const cel = S.prog.cel || {};
  const last = S.cfg.goals[S.cfg.goals.length - 1];
  return {
    total, minus, score, days, dug, waiting, firstWaiting, chest: dug + bonus, perfect, extras, cur, best, yellows, reds,
    found: !!last && goalReached(S, score, last),
    clouds: cloudsNow(S),
    stickers: { count: album.length, pts, bonus, toNext: PTS_PER_DIAMANT - (pts % PTS_PER_DIAMANT) },
    packs: { earned, opened: album.length + foil.length, left: packsLeft(earned, album, foil), complete: album.length >= STICKERS.length, foil: foil.length, every, next: every - (total % every) },
    reachedOn: id => { const v = cel['g:' + id]; return typeof v === 'string' ? v : null; },
  };
}

/* Ein Schatz ist erreicht, wenn die Diamanten nach Abzug reichen. Ein eingelöster bleibt erreicht: Eine Belohnung, die schon da ist, nimmt keine Wolke zurück. */
const goalReached = (S, score, g) => score >= g.at || !!(S.prog.red && S.prog.red[g.id]);
/* Edelstein je Stufe: wird mit jeder Stufe kostbarer, der letzte ist die Krone. */
const GOAL_GEMS = ['rosa', 'tuerkis', 'topas', 'smaragd', 'saphir', 'amethyst', 'rubin', 'weiss', 'regenbogen'];
function goalList(S, st) {
  const red = S.prog.red || {}, gs = S.cfg.goals;
  return gs.map((g, i) => ({
    id: g.id, at: g.at, reward: g.reward, last: i === gs.length - 1, gem: GOAL_GEMS[Math.min(GOAL_GEMS.length - 1, Math.floor(i * GOAL_GEMS.length / Math.max(1, gs.length)))],
    reached: goalReached(S, st.score, g), need: Math.max(0, g.at - st.score), prev: i ? gs[i - 1].at : 0,
    on: st.reachedOn(g.id), done: red[g.id] || null, money: rewardMoney(g.reward),
  }));
}
const nextGoal = (S, st) => goalList(S, st).find(g => !g.reached) || null;

/* Meilensteine vor/nach einer Änderung vergleichen (für Feiern). */
function milestones(S, ds, today) {
  const e = evalDay(S, ds), st = computeStats(S, today);
  return { perfect: e.perfect, goals: S.cfg.goals.filter(g => goalReached(S, st.score, g)).map(g => g.id), found: st.found, total: st.total, score: st.score, packs: st.packs.earned, ok: e.ok, red: e.red, yellow: e.yellow, clouds: st.clouds.count };
}

/* Hinweise für die Eltern: Hürde zu hoch? Belohnung offen? Wartet etwas auf Freigabe? */
function parentAdvice(S, today) {
  const out = [];
  let reds = 0;
  for (let i = 0; i < 7; i++) reds += evalDay(S, addDays(today, -i)).red;
  if (reds >= 2) out.push({ kind: 'reds', n: reds });
  const st = computeStats(S, today);
  goalList(S, st).forEach(g => { if (g.reached && !g.done && g.on && daysBetween(g.on, today) >= 7) out.push({ kind: 'open', id: g.id, at: g.at, since: g.on }); });
  const firstEmpty = S.cfg.goals.slice(0, 3).filter(g => !String(g.reward || '').trim()).length;
  if (firstEmpty) out.push({ kind: 'rewards', n: firstEmpty });
  if ((S.prog.album || []).length >= STICKERS.length) out.push({ kind: 'album' });
  return out;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fmtEUR, fmtPlain, parseMoney, kontoBalance, kontoList, genitive, rewardMoney, DEFAULT_GOALS, WD_SHORT, WD_LONG, MONTHS_SHORT, fmtDate, parseDate, addDays, dowOf, mondayOf, todayStr, daysBetween, isoWeek, CFG_V, SLOTS, HAIR, DRESS, STYLE, defaultCfg, migrateCfg, normGoals, normProg, goalReached, goalList, nextGoal, GOAL_GEMS, LADDER, ladderText, RARITY, RAR_ORDER, RAR_WEIGHT, PTS_PER_DIAMANT, CATS, STICKERS, STICKER_BY, rarOf, stickerPoints, stickerBonus, pickSticker, packsLeft, FUN_FINDS, tasksOn, buildLedger, ledgerOf, touch, cloudsNow, evalDay, evalWeek, computeStats, milestones, parentAdvice };
}
