/* ============ Zustand und Ansichten ============ */
const U = {
  tab: 'today', today: todayStr(), date: todayStr(), unlocked: false, ready: false, readonly: false, hasCfg: true,
  weekOff: 0, fx: null, pop: false, editTask: null, last: Date.now(), celebQ: [], sheet: null, pin: '',
  bars: {}, newSticker: null, muted: false, ob: null, ex: null, kx: null, game: null, lastGoal: null, dig: { taps: 0 }, digBusy: false, volley: false,
};
let S = { cfg: defaultCfg(), prog: normProg(), days: {}, konto: {} };
let _st = null;
const markChanged = () => { touch(S); _st = null; };
const ST = () => _st || (_st = computeStats(S, U.today));

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dia = n => n + (Math.abs(n) === 1 ? ' Diamant' : ' Diamanten');
const signed = n => (n < 0 ? '−' + Math.abs(n) : String(n));
const punkte = n => n + (n === 1 ? ' Punkt' : ' Punkte');
const fmtShort = ds => { const d = parseDate(ds); return WD_SHORT[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; };
const rewardOf = g => String(g.reward || '').trim();
const goalText = g => esc(rewardOf(g) || 'Überraschung!');
const plain = s => String(s).replace(/­/g, '');
const stickerIco = (s, size) => (s.ico.indexOf('gem:') === 0 ? gemSVG(s.ico.slice(4), size) : '<span class="emo" style="font-size:' + Math.round(size * .9) + 'px">' + s.ico + '</span>');
const look = () => S.cfg.look;

function render() {
  const app = $('#app'); if (!app) return;
  if (Store.gate) { app.innerHTML = gateView(Store.gate); return; }
  if (!U.ready) { app.innerHTML = '<div class="boot">' + gemSVG('weiss', 84, 'hop') + '<p>Die Schatzkarte wird geladen …</p></div>'; return; }
  _st = null;
  if (Store.noAccess && !U.hasCfg) { app.innerHTML = gateView('noaccess'); return; }
  if (U.tab === 'coach' && U.readonly) U.tab = 'today';
  const st = ST();
  const views = { today: viewToday, week: viewWeek, achieve: viewAchieve, konto: viewKonto, coach: viewCoach };
  app.innerHTML = headerView(st) + '<main class="wrap main" id="main">' + (views[U.tab] || viewToday)(st) + '</main>' + tabsView(st);
  afterRender();
}

function afterRender() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('.fill[data-to]').forEach(el => { el.style.width = el.dataset.to + '%'; U.bars[el.dataset.key] = +el.dataset.to; });
  }));
  U.fx = null; U.pop = false; U.newSticker = null;
  if (typeof checkCelebs === 'function') checkCelebs();
}

/* ---------- Kopf und Tab-Leiste ---------- */
function headerFlags(st) {
  const red = evalDay(S, U.today).red > 0;
  return (st.clouds.count > 0 ? '<span class="hflag" role="img" aria-label="Gelbe Wolke">' + cloudSVG('yellow', 26) + '</span>' : '') +
    (red ? '<span class="hflag" role="img" aria-label="Gewitterwolke heute">' + cloudSVG('red', 26) + '</span>' : '');
}
function headerView(st) {
  const claimed = evalDay(S, U.today).claimed;
  const badge = !U.unlocked && claimed ? '<i class="dot-badge pink" aria-hidden="true">' + claimed + '</i>' : '';
  const lock = U.readonly ? '' : '<button class="chip lockbtn' + (U.unlocked ? ' on' : '') + '" data-act="lock" aria-label="' + (U.unlocked ? 'Eltern-Modus beenden' : 'Eltern-Modus öffnen' + (claimed ? ', ' + claimed + ' Aufgaben warten auf Freigabe' : '')) + '">' + (U.unlocked ? IC.unlock : IC.lock) + badge + '</button>';
  return '<header class="top"><div class="wrap top-in"><div class="who">' + girlHeadSVG(look(), 44) +
    '<div class="who-tx"><span class="nmrow"><b class="nm">' + esc(S.cfg.name) + '</b>' + headerFlags(st) + '</span></div></div>' +
    '<div class="chips"><div class="chip spark" role="img" aria-label="Funkel-Tage in Folge: ' + st.cur + '">' + IC.sparkle + '<b>' + st.cur + '</b></div>' +
    '<div class="chip gems" role="img" aria-label="' + dia(st.chest) + ' in der Truhe">' + gemMini(22) + '<b id="chestN">' + st.chest + '</b></div>' + lock + '</div></div></header>';
}
function tabsView(st) {
  const tabs = [['today', 'Heute'], ['week', 'Woche'], ['achieve', 'Schätze'], ['konto', 'Konto']].concat(U.readonly ? [] : [['coach', 'Eltern']]);
  return '<nav class="tabs" aria-label="Bereiche"><div class="tabs-in">' + tabs.map(t => {
    const badge = t[0] === 'achieve' && st.packs.left > 0 ? '<i class="dot-badge" aria-label="' + st.packs.left + ' Zauberbeutel warten">' + st.packs.left + '</i>'
      : t[0] === 'today' && st.waiting > 0 && S.cfg.digMode !== false ? '<i class="dot-badge gold" aria-label="' + dia(st.waiting) + ' warten in der Erde">' + st.waiting + '</i>' : '';
    return '<button class="tab" data-act="tab" data-tab="' + t[0] + '"' + (U.tab === t[0] ? ' aria-current="page"' : '') + '>' + TAB_IC[t[0]] + badge + '<span>' + t[1] + '</span></button>';
  }).join('') + '</div></nav>';
}

/* Sperrseite statt Spiel: noaccess = Claude-Seite ohne Zugriff, nolink = Web-App ohne Familienlink, denied = Link passt nicht (mehr),
   sdk = Programmteil nicht geladen (erster Start ohne Netz), offline = Stand noch nicht vom Server geholt. */
function gateView(kind) {
  const card = (title, body, extra) => '<main class="wrap main gate-main" id="main"><section class="card gate noconn" data-gate="' + kind + '"><div class="gate-art">' + chestSVG(.25, 120) + '</div><h2>' + title + '</h2>' + body + (extra || '') + '</section></main>';
  if (kind === 'nolink') {
    return card('Familienlink fehlt', '<p class="hint">Diese App zeigt nur den Schatz eurer Familie. Öffne den Familienlink, den du bekommen hast, oder füge ihn hier ein.</p>',
      '<div class="field link-in"><input type="text" id="link-in" inputmode="url" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Familienlink hier einfügen" aria-label="Familienlink"></div>' +
      '<p class="hint err" id="link-err" role="alert" hidden>Das ist kein gültiger Familienlink. Es muss der ganze Link sein, mit allem hinter dem #.</p>' +
      '<button class="btn btn-main" data-act="link-save">Verbinden</button>');
  }
  if (kind === 'denied') return card('Der Link passt nicht', '<p class="hint">Mit diesem Familienlink kommt die App nicht an euren Schatz. Vielleicht wurde der Zugang erneuert. Frag nach dem neuen Link und füge ihn ein.</p>', '<button class="btn btn-main" data-act="link-reset">Neuen Link eingeben</button>');
  if (kind === 'sdk') return card('Die App kann nicht starten', '<p class="hint">Beim ersten Start braucht sie Internet. Verbinde dich und versuche es noch einmal.</p>', '<button class="btn btn-main" data-act="reload">Noch einmal versuchen</button>');
  if (kind === 'offline') return card('Noch keine Verbindung', '<p class="hint">Der Schatz wird geladen, sobald das Internet da ist. Du musst nichts tun.</p>', '<button class="btn btn-ghost" data-act="reload">Noch einmal versuchen</button>');
  return card('Hier fehlt die Anmeldung', '<p class="hint">Der Stand liegt in Claude und zeigt sich nur, wenn du dort angemeldet bist und die Seite für dich freigegeben ist. Bitte Mama oder Papa um Hilfe.</p>' +
    '<p class="hint">Für die Eltern: Mit dem Claude-Konto anmelden, in dem die Seite liegt oder für das sie freigegeben wurde, und den Link noch einmal öffnen.</p>');
}
function modeNote() {
  if (Store.noAccess) return '<section class="warn-box mode-note" role="status"><b>Nicht verbunden.</b> Diese Ansicht zeigt nicht den gemeinsamen Stand. Was hier eingetragen wird, bleibt nur auf diesem Gerät.</section>';
  if (U.readonly) return '<p class="hint mode-note" role="note">Nur ansehen: Eintragen und Graben geht hier nicht.</p>';
  return '';
}

/* ---------- Heute ---------- */
/* Ganz oben: gelbe Wolke (offen) und Gewitterwolke (heute), gut sichtbar, mit einem Satz dazu. */
function cloudTop(st) {
  const e = evalDay(S, U.today), c = S.cfg;
  let h = '';
  if (e.red > 0) {
    h += '<section class="cloudtop red" role="status">' + cloudSVG('red', 46) + '<span class="ct-tx"><b>Gewitterwolke heute</b><small>Minus ' + dia(c.redPts) + ' bei den Schätzen. Morgen scheint wieder die Sonne.</small></span></section>';
  }
  if (st.clouds.count > 0) {
    const d = st.clouds.dates[0];
    h += '<section class="cloudtop yellow" role="status">' + cloudSVG('yellow', 46) + '<span class="ct-tx"><b>Gelbe Wolke</b><small>' + (d === U.today ? 'Heute. ' : d ? 'Seit ' + fmtShort(d) + '. ' : '') + (c.yellowPts ? 'Minus ' + dia(c.yellowPts) + ' bei den Schätzen. ' : '') + 'Eine zweite wird zur Gewitterwolke.</small></span></section>';
  }
  return h;
}
function dayStrip(sel) {
  const mon = mondayOf(sel);
  let h = '<nav class="strip" aria-label="Tage der Woche">';
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), e = evalDay(S, d), fut = d > U.today;
    const mark = e.perfect ? '<span class="st">' + crownSVG(18) + '</span>' : e.gain > 0 ? '<span class="st">' + gemMini(16) + '</span>' : '<span class="st"><i class="dot ' + e.result + '"></i></span>';
    const pc = (e.yellow ? '<i class="pcl y"></i>' : '') + (e.red ? '<i class="pcl r"></i>' : '');
    h += '<button class="pill' + (d === sel ? ' sel' : '') + (d === U.today ? ' today' : '') + (fut ? ' fut' : '') + '" data-act="day" data-date="' + d + '"' + (fut ? ' disabled' : '') + ' aria-label="' + WD_LONG[dowOf(d)] + ', ' + parseDate(d).getDate() + '., ' + dia(e.gain) + (e.yellow ? ', gelbe Wolke' : '') + (e.red ? ', Gewitterwolke' : '') + '"' + (d === sel ? ' aria-current="date"' : '') + '>' +
      '<span class="wd">' + WD_SHORT[dowOf(d)] + '</span><span class="dn">' + parseDate(d).getDate() + '</span>' + mark + (pc ? '<span class="pcls" aria-hidden="true">' + pc + '</span>' : '') + '</button>';
  }
  return h + '</nav>';
}

/* Die Schatzszene: links die Schatzgräberin am Erdhügel, rechts die Truhe, darüber das Einhorn. Tippen gräbt. */
function digPips() {
  const n = S.cfg.digTaps, t = U.dig.taps;
  let h = '<span class="pips" aria-hidden="true">';
  for (let i = 0; i < n; i++) h += '<i' + (i < t ? ' class="on"' : '') + '></i>';
  return h + '</span>';
}
function digLabel(st) {
  if (st.waiting > 0) return st.waiting === 1 ? 'Ein Diamant wartet in der Erde!' : dia(st.waiting) + ' warten in der Erde!';
  return S.cfg.digFun ? 'Grab ruhig weiter. Vielleicht findest du etwas!' : 'Alle Diamanten sind in der Truhe.';
}
function sceneCard(st) {
  const c = S.cfg, digOn = c.digMode !== false, can = digOn && !U.readonly && (st.waiting > 0 || c.digFun);
  const gl = goalList(S, st), last = gl[gl.length - 1];
  const level = chestLevel(st.chest, last ? last.at : 100);
  const stage = Math.min(3, Math.round(U.dig.taps / Math.max(1, c.digTaps) * 3));
  const waitGems = st.waiting > 0 && digOn ? '<span class="wait-bubble" aria-hidden="true">' + gemMini(18) + '<b>' + st.waiting + '</b></span>' : '';
  let h = '<section class="card scene' + (st.waiting > 0 && digOn ? ' has-wait' : '') + '" aria-label="Schatzsuche">' +
    '<div class="stage"' + (can ? ' data-act="dig" role="button" tabindex="0" aria-label="Graben. ' + esc(digLabel(st)) + '"' : '') + '>' +
    '<span class="sun" aria-hidden="true"></span><span class="sc-cloud c1" aria-hidden="true"></span><span class="sc-cloud c2" aria-hidden="true"></span>' +
    '<span class="ground" aria-hidden="true"></span>' +
    '<div class="uni-wrap" aria-hidden="true">' + unicornSVG(78) + '</div>' +
    '<div class="girl-wrap" id="girl" aria-hidden="true">' + girlSVG(look(), 150) + '</div>' +
    '<div class="mound s' + stage + '" id="mound" aria-hidden="true"><i class="hole"></i>' + waitGems + '</div>' +
    '<div class="chest-wrap" id="chest" aria-hidden="true">' + chestSVG(level, 136) + '</div>' +
    '<div class="dirt" id="dirt" aria-hidden="true"></div></div>';
  if (!digOn) h += '<div class="scene-bar"><span class="sb-tx"><b>' + dia(st.chest) + ' in der Truhe</b><small>Diamanten fliegen gleich in die Truhe.</small></span></div>';
  else if (U.readonly) h += '<div class="scene-bar"><span class="sb-tx"><b>' + esc(digLabel(st)) + '</b><small>Graben geht nur auf den Geräten der Familie.</small></span></div>';
  else {
    h += '<div class="scene-bar"><button class="digbtn' + (st.waiting > 0 ? ' hot' : '') + '" data-act="dig" aria-label="Graben! ' + esc(digLabel(st)) + (st.waiting > 1 ? ' Gedrückt halten gräbt alle.' : '') + '"' + (can ? '' : ' disabled') + '>' + IC.shovel + '<span>Graben!</span>' + digPips() + '<i class="charge"></i></button>' +
      '<span class="sb-tx"><b id="digLabel">' + esc(digLabel(st)) + '</b>' + (st.waiting > 1 ? '<small>Gedrückt halten gräbt alle aus.</small>' : st.waiting === 1 ? '<small>' + (c.digTaps === 1 ? 'Einmal tippen.' : c.digTaps + '-mal tippen.') + '</small>' : '') + '</span></div>';
  }
  return h + '</section>';
}
/* Für einen früheren Tag: kurze Zusammenfassung statt Szene. */
function pastDayCard(e, ds) {
  const d = parseDate(ds);
  let gems = '';
  for (let i = 0; i < Math.min(e.gain, 10); i++) gems += gemMini(26);
  if (e.gain > 10) gems += '<em>+' + (e.gain - 10) + '</em>';
  const msg = e.perfect ? 'Glitzer-Tag: alles geschafft!' : e.gain > 0 ? dia(e.gain) + ' an diesem Tag' : e.hasData ? 'An diesem Tag gab es keinen Diamanten.' : 'Noch nichts eingetragen.';
  return '<section class="card pad pastday"><div class="pd-top"><b>' + WD_LONG[d.getDay()] + ', ' + d.getDate() + '. ' + MONTHS_SHORT[d.getMonth()] + '</b>' + (e.perfect ? crownSVG(30) : '') + '</div>' +
    (gems ? '<div class="pd-gems">' + gems + '</div>' : '') + '<p class="hint">' + msg + '</p></section>';
}

function stampHTML(st) {
  if (st === 'y') return '<div class="stamp y">' + gemMini(30) + '<span>Geschafft!</span></div>';
  if (st === 'c') return '<div class="stamp c">' + IC.sparkle + '<span>Wartet</span></div>';
  if (st === 'n') return '<div class="stamp n">' + IC.moon + '<span>Nicht geschafft</span></div>';
  return '<div class="stamp o"><span>Offen</span></div>';
}
function taskCard(it, ds) {
  const t = it.t, st = it.st, isToday = ds === U.today;
  const fx = U.fx && U.fx.task === t.id ? ' fx' : '';
  const pts = t.pts > 1 ? '<span class="tag">' + t.pts + ' ' + gemMini(14) + '</span>' : '';
  let act;
  if (U.unlocked) act = stampHTML(st);
  else act = '<button class="stamp-btn" data-act="hint" data-task="' + t.id + '" data-st="' + (st || 'o') + '">' + stampHTML(st) + '</button>';
  const seg = U.unlocked ? '<div class="seg two">' +
    '<button class="b-y" data-act="mark" data-task="' + t.id + '" data-st="y" aria-pressed="' + (st === 'y') + '">' + gemMini(20) + '<span>Geschafft</span></button>' +
    '<button class="b-n" data-act="mark" data-task="' + t.id + '" data-st="n" aria-pressed="' + (st === 'n') + '">' + IC.moon + '<span>Nicht geschafft</span></button></div>' : '';
  return '<li class="task st-' + (st || 'o') + fx + (U.unlocked && st === 'c' ? ' claimed' : '') + '" data-task="' + t.id + '">' +
    '<span class="ico" aria-hidden="true">' + esc(t.icon) + '</span>' +
    '<div class="tx"><h3>' + esc(t.title) + pts + '</h3>' + (U.unlocked && st === 'c' ? '<p class="claimed-note">' + esc(S.cfg.name) + ' sagt: geschafft!</p>' : '') + '</div>' +
    '<div class="tact">' + act + '</div>' + seg + '</li>';
}
function taskSections(e, ds) {
  let h = '';
  Object.keys(SLOTS).forEach(slot => {
    const items = e.items.filter(it => (it.t.slot || 'morgens') === slot);
    if (!items.length) return;
    const done = items.filter(it => it.st === 'y').length;
    h += '<div class="sec-h slot-h ' + slot + '"><h2>' + (slot === 'morgens' ? IC.sun : IC.moon) + SLOTS[slot] + '</h2><span class="hint">' + done + ' von ' + items.length + '</span></div>' +
      '<ul class="tasks">' + items.map(it => taskCard(it, ds)).join('') + '</ul>';
  });
  return h;
}

/* Einträge des Tages: Extra-Diamanten und Wolken. Wolken nehmen nur die Eltern zurück. */
function entryRow(en, ds) {
  const c = S.cfg;
  const back = (id, label) => (U.unlocked && id ? '<div class="ev-act"><button class="btn btn-ghost btn-xs" data-act="cloud-back" data-id="' + esc(id) + '" data-ds="' + ds + '">' + label + '</button></div>' : '');
  if (en.k === '+') return '<li class="ev good"><span class="evi">' + gemMini(26) + '</span><span class="evt">' + esc(en.t || 'Extra-Diamant') + '<small>Extra-Diamant</small></span><b class="evv">+' + (en.v || 1) + '</b>' + (U.unlocked && en.id ? '<button class="evx" data-act="ev-del" data-id="' + esc(en.id) + '" aria-label="Eintrag löschen">' + IC.cross + '</button>' : '<span></span>') + '</li>';
  if (en.k === 'y') return '<li class="ev yellow"><span class="evi">' + cloudSVG('yellow', 34) + '</span><span class="evt">' + esc(en.t || 'Gelbe Wolke') + '<small>' + (en.t ? 'Gelbe Wolke · ' : '') + 'Verwarnung' + (c.yellowPts ? ' · Minus ' + c.yellowPts : '') + '</small></span><b class="evv">' + (c.yellowPts ? '−' + c.yellowPts : '') + '</b><span></span>' + back(en.id, 'Wolke zurücknehmen') + '</li>';
  const why = en.auto ? 'Zwei gelbe Wolken' : (en.t || 'Gewitterwolke');
  const eff = en.capped ? 'heute schon Gewitter, kein weiteres Minus' : 'Minus ' + c.redPts;
  return '<li class="ev red"><span class="evi">' + cloudSVG('red', 34) + '</span><span class="evt">' + esc(why) + '<small>' + (en.auto ? 'Automatisch Gewitter' : 'Gewitterwolke') + ' · ' + eff + '</small></span><b class="evv">' + (en.capped ? '' : '−' + c.redPts) + '</b><span></span>' +
    (en.auto ? back(en.src, 'Zweite gelbe Wolke zurücknehmen') : back(en.id, 'Wolke zurücknehmen')) + '</li>';
}
function extrasCard(e, ds) {
  const isToday = ds === U.today, c = S.cfg;
  if (!U.unlocked && !e.entries.length) return '';
  let btns = '';
  if (U.unlocked) {
    const left = Math.max(0, c.extraMax - e.plus);
    btns = '<div class="xbtns">' +
      '<button class="xbtn wide" data-act="extra-open" data-k="+">' + gemMini(30) + '<span>Extra-Diamant</span><small>Für etwas Besonderes, frei eingeben' + (left <= 0 ? ' · heute keine mehr' : '') + '</small></button>';
    if (!isToday) btns += '</div><p class="hint">Wolken gibt es nur am selben Tag.</p>';
    else if (!c.cloudsAck) btns += '<button class="xbtn wide" data-act="clouds-unlock">' + cloudSVG('yellow', 34) + '<span>Wolken freischalten</span><small>Erst die Hinweise für Eltern lesen</small></button></div>';
    else btns += '<button class="xbtn" data-act="extra-open" data-k="y">' + cloudSVG('yellow', 36) + '<span>Gelbe Wolke</span></button>' +
      '<button class="xbtn" data-act="extra-open" data-k="r"' + (e.red > 0 ? ' disabled' : '') + '>' + cloudSVG('red', 36) + '<span>' + (e.red > 0 ? 'Gewitter (schon)' : 'Gewitter') + '</span></button></div>';
  }
  const list = e.entries.length ? '<ul class="evs">' + e.entries.map(en => entryRow(en, ds)).join('') + '</ul>' : '';
  return '<section class="card extras" aria-label="Extras und Wolken"><div class="sec-h"><h2>Extras &amp; Wolken</h2><button class="btn btn-ghost btn-sm" data-act="rules">Regeln</button></div>' + btns + list + '</section>';
}
function dayTools(e) {
  if (!U.unlocked) return '';
  const claimed = e.items.filter(it => it.st === 'c').length, open = e.items.filter(it => !it.st || it.st === 'c').length;
  if (!open) return '';
  return '<div class="day-tools">' + (claimed ? '<button class="btn btn-main btn-sm" data-act="approve-claimed">' + IC.check + 'Getippte: geschafft (' + claimed + ')</button>' : '') +
    '<button class="btn btn-ghost btn-sm" data-act="all-ok">' + gemMini(18) + 'Alle offenen: geschafft</button><button class="btn btn-ghost btn-sm" data-act="rest-no">' + IC.moon + 'Rest: nicht geschafft</button></div>';
}

/* Unter den Aufgaben: der nächste Schatz mit Zähler und der nächste Zauberbeutel. Tippen führt zu den Schätzen. */
function nextTreasureCard(st) {
  const gl = goalList(S, st), ng = gl.find(g => !g.reached), p = st.packs;
  const waiting = gl.filter(g => g.reached && !g.done);
  let h = '<div class="sec-h"><h2>Nächster Schatz</h2></div><button class="card nextgoal" data-act="tab" data-tab="achieve" aria-label="Zu den Schätzen">';
  if (waiting.length) h += '<span class="ng-wait">' + IC.gift + '<span><b>Schatz gefunden!</b> Deine Belohnung wartet' + (waiting.length > 1 ? ' (' + waiting.length + ' Schätze)' : '') + '.</span></span>';
  if (ng) {
    const pct = clamp(Math.round((st.score - ng.prev) / Math.max(1, ng.at - ng.prev) * 100), 0, 100);
    h += '<span class="ng-main"><span class="ng-ico">' + (ng.last ? crownSVG(52) : gemSVG(ng.gem, 50)) + '</span><span class="ng-tx"><b>Noch ' + dia(ng.need) + '</b><small>' + goalText(ng) + '</small></span><span class="ng-cnt">' + signed(st.score) + '<i>/</i>' + ng.at + '</span></span>' +
      '<span class="ng-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></span>' +
      (st.minus ? '<span class="ng-note">' + dia(st.total) + ' gesamt, minus ' + st.minus + ' durch Wolken</span>' : '');
  } else h += '<span class="ng-main"><span class="ng-ico">' + crownSVG(52) + '</span><span class="ng-tx"><b>Alle Schätze gefunden!</b><small>Mama und Papa verstecken bald neue.</small></span></span>';
  h += '<span class="ng-pack">' + pouchSVG(32) + '<span>' + (p.left ? '<b>' + (p.left === 1 ? 'Ein Zauberbeutel wartet' : p.left + ' Zauberbeutel warten') + '</b> bei den Schätzen' : 'Noch <b>' + dia(p.next) + '</b> bis zum nächsten Zauberbeutel') + '</span></span></button>';
  return h;
}
function viewToday(st) {
  const ds = U.date, e = evalDay(S, ds), isToday = ds === U.today;
  let h = (isToday ? cloudTop(st) : '') + modeNote() + dayStrip(ds);
  if (isToday) h += sceneCard(st);
  else h += '<button class="btn btn-ghost btn-sm back-today" data-act="goto-today">' + IC.back + 'Zurück zu heute</button>' + pastDayCard(e, ds);
  h += dayTools(e);
  if (!e.items.length) h += '<div class="card pad"><p class="hint">An diesem Tag gibt es keine Aufgaben.</p></div>';
  else h += taskSections(e, ds);
  h += extrasCard(e, ds);
  if (isToday) h += nextTreasureCard(st);
  if (isToday && S.cfg.games !== false) h += gamesCard();
  h += installHint();
  return h;
}
/* Spielwiese: Mini-Spiele nur zum Spaß (zählen nicht für Diamanten). Die Spiele selbst stehen in games.js. */
function gamesCard() {
  const tile = (id, art, name, sub) => '<button class="gtile" data-act="game-open" data-game="' + id + '"><span class="gt-art" aria-hidden="true">' + art + '</span><b>' + name + '</b><small>' + sub + '</small></button>';
  return '<div class="sec-h"><h2>Spielwiese</h2><span class="hint">Nur zum Spaß</span></div><section class="card games" aria-label="Mini-Spiele"><div class="gtiles">' +
    tile('memory', '<span class="gt-mem">' + gemSVG('rosa', 30) + gemSVG('rosa', 30) + '</span>', 'Memory', 'Paare finden') +
    tile('cups', '<span class="gt-cups"><i></i><i class="hi">' + gemMini(18) + '</i><i></i></span>', 'Hütchen', 'Wo ist der Diamant?') +
    tile('catch', '<span class="gt-catch">' + gemSVG('tuerkis', 24) + gemSVG('topas', 20) + gemSVG('weiss', 28) + '</span>', 'Sternen&shy;regen', 'Diamanten fangen') +
    '</div></section>';
}
/* Auf dem iPhone, solange die Seite noch in Safari läuft: wie sie auf den Home-Bildschirm kommt. */
function installHint() {
  if (!window.__PWA__ || Store.gate) return '';
  try { if (localStorage.getItem('dia-hint-a2hs') === '1') return ''; } catch (e) { /* egal */ }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  if (!ios || standalone) return '';
  return '<section class="card pad a2hs" aria-label="Als App installieren"><span class="a2hs-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M7 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg></span>' +
    '<div class="a2hs-tx"><b>Als App auf den Home-Bildschirm</b><p>Tippe unten auf <b>Teilen</b> (Quadrat mit Pfeil) und dann auf <b>Zum Home-Bildschirm</b>. Danach öffnet sie wie eine App.</p></div>' +
    '<button class="btn btn-ghost btn-xs" data-act="a2hs-close">Verstanden</button></section>';
}

/* ---------- Woche: Regenbogen ---------- */
const RB_COLORS = ['#ff6b8b', '#ff9f45', '#ffd23f', '#5ad48c', '#3cc8d0', '#5b8cff', '#a77bff'];
function rainbowSVG(w) {
  const cx = 150, cy = 146;
  let arcs = '', labels = '';
  w.days.forEach((e, i) => {
    const r = 132 - i * 15, fut = e.ds > U.today;
    const p = e.gain > 0 ? Math.min(1, e.max > 0 ? e.gain / e.max : 1) : 0;
    const d = 'M' + (cx - r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy;
    arcs += '<path d="' + d + '" fill="none" stroke="' + RB_COLORS[i] + '" stroke-opacity=".2" stroke-width="12" stroke-linecap="round"' + (fut ? ' stroke-dasharray="2 7"' : '') + '/>';
    if (p > 0) arcs += '<path class="rb-fill" d="' + d + '" pathLength="100" fill="none" stroke="' + RB_COLORS[i] + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + f1(p * 100) + ' 200"/>';
    if (e.perfect) arcs += '<path d="' + sparklePath(cx + r * Math.cos(Math.PI * (1 - p)), cy - r * Math.sin(Math.PI * (1 - p)), 7) + '" fill="#fff" stroke="' + RB_COLORS[i] + '" stroke-width="1.5"/>';
    labels += '<g transform="translate(' + (30 + i * 40) + ' 182)"><circle r="7" fill="' + RB_COLORS[i] + '"' + (e.gain > 0 ? '' : ' fill-opacity=".25"') + '/><text y="22" text-anchor="middle"' + (e.ds === U.today ? ' class="today"' : '') + '>' + WD_SHORT[dowOf(e.ds)] + '</text></g>';
  });
  return '<svg class="rainbow" viewBox="0 0 300 212" role="img" aria-label="Regenbogen der Woche: ' + dia(w.gems) + '">' + arcs + '<g class="rb-lab">' + labels + '</g>' +
    '<g transform="translate(' + (cx - 22) + ' ' + (cy - 46) + ') scale(.44)">' + gemInner('weiss') + '</g><text class="rb-n" x="' + cx + '" y="' + (cy + 15) + '" text-anchor="middle">' + w.gems + '</text></svg>';
}
function dayClouds(e) {
  if (!e.yellow && !e.red) return '';
  let s = '';
  for (let i = 0; i < Math.min(e.yellow, 2); i++) s += cloudSVG('yellow', 22);
  for (let i = 0; i < Math.min(e.red, 2); i++) s += cloudSVG('red', 22);
  return '<span class="dclouds" role="img" aria-label="' + (e.yellow ? e.yellow + ' gelbe Wolke' + (e.yellow > 1 ? 'n' : '') : '') + (e.yellow && e.red ? ', ' : '') + (e.red ? 'Gewitter' : '') + '">' + s + '</span>';
}
function dayRow(e) {
  const d = parseDate(e.ds), fut = e.ds > U.today;
  let gems = '';
  if (e.gain > 0) { for (let i = 0; i < Math.min(e.gain, 8); i++) gems += gemMini(20); if (e.gain > 8) gems += '<em>+' + (e.gain - 8) + '</em>'; }
  else gems = '<em>' + (fut ? '' : e.hasData ? 'Kein Diamant' : 'Noch nichts') + '</em>';
  return '<button class="wk-day' + (e.ds === U.today ? ' today' : '') + (fut ? ' fut' : '') + '" data-act="day" data-date="' + e.ds + '" data-go="1"' + (fut ? ' disabled' : '') + '>' +
    '<span class="d"><b>' + d.getDate() + '</b><span>' + WD_SHORT[d.getDay()] + '</span></span><span class="gems">' + gems + '</span>' +
    '<span class="res">' + dayClouds(e) + (e.perfect ? crownSVG(22) : '') + '</span></button>';
}
function viewWeek(st) {
  const mon = addDays(mondayOf(U.today), U.weekOff * 7), w = evalWeek(S, mon);
  const a = parseDate(mon), b = parseDate(addDays(mon, 6));
  const range = a.getDate() + '.' + (a.getMonth() === b.getMonth() ? '' : (a.getMonth() + 1) + '.') + '–' + b.getDate() + '. ' + MONTHS_SHORT[b.getMonth()];
  let h = '<div class="wk-nav"><button class="navbtn" data-act="wk" data-d="-1" aria-label="Vorherige Woche"' + (U.weekOff <= -52 ? ' disabled' : '') + '>' + IC.chevL + '</button>' +
    '<div class="mid"><b>' + (U.weekOff === 0 ? 'Diese Woche' : U.weekOff === -1 ? 'Letzte Woche' : 'KW ' + isoWeek(mon)) + '</b><span class="hint">' + range + '</span></div>' +
    '<button class="navbtn" data-act="wk" data-d="1" aria-label="Nächste Woche"' + (U.weekOff >= 0 ? ' disabled' : '') + '>' + IC.chevR + '</button></div>';
  h += '<section class="card rb-card"><div class="sec-h"><h2>Dein Regenbogen</h2></div>' + rainbowSVG(w) +
    '<p class="hint">Jeder Tag ist ein Streifen. Je mehr Diamanten, desto voller wird er.' + (w.perfect ? ' Ein Stern heißt: Glitzer-Tag, alles geschafft.' : '') + '</p></section>';
  if (w.yellow || w.red) h += '<section class="card pad weekclouds"><div class="wc">' + (w.yellow ? '<span class="cflag">' + cloudSVG('yellow', 30) + '<b>' + w.yellow + '× gelb</b></span>' : '') + (w.red ? '<span class="cflag">' + cloudSVG('red', 30) + '<b>' + w.red + '× Gewitter</b></span>' : '') + (w.minus ? '<span class="cflag minus"><b>Minus ' + w.minus + '</b></span>' : '') + '</div></section>';
  h += '<div class="sec-h"><h2>Die Tage</h2></div><div class="wk-days">' + w.days.map(dayRow).join('') + '</div>';
  h += '<div class="stats4"><div class="stat"><b>' + w.gems + '</b><span>Diamanten</span></div><div class="stat"><b>' + w.perfect + '</b><span>Glitzer-Tage</span></div><div class="stat"><b>' + st.cur + '</b><span>Funkel-Tage in Folge</span></div><div class="stat"><b>' + st.best + '</b><span>Rekord</span></div></div>';
  return h;
}

/* ---------- Schätze: große Truhe, Belohnungen, Sammelalbum ---------- */
function packLine(st) {
  const p = st.packs;
  if (p.foil >= STICKERS.length) return '<div class="packline done"><span class="pl-ico">' + pouchSVG(46) + '</span><span class="pl-tx"><b>Alles glitzert!</b><small>Alle ' + STICKERS.length + ' Sticker glänzen. Du bist die Sammelkönigin!</small></span></div>';
  const head = p.left === 0 ? 'Gerade kein Zauberbeutel' : p.left === 1 ? 'Ein Zauberbeutel wartet!' : p.left + ' Zauberbeutel warten!';
  const sub = p.left ? (U.readonly ? 'Mama oder Papa öffnen ihn mit dir. ' : 'Mach ihn auf! ') + (p.complete ? 'Ein Sticker fängt an zu glänzen.' : 'Darin ist ein neuer Sticker.')
    : 'Noch <b>' + dia(p.next) + '</b> bis zum nächsten. Alle ' + p.every + ' Diamanten gibt es einen.';
  if (p.left && !U.readonly) return '<button class="packline has" data-act="pack-open"><span class="pl-ico">' + pouchSVG(52) + '</span><span class="pl-tx"><b>' + head + '</b><small>' + sub + '</small></span><span class="pl-go">Auf&shy;machen' + IC.chevR + '</span></button>';
  return '<div class="packline' + (p.left ? ' has' : '') + '"><span class="pl-ico">' + pouchSVG(48) + '</span><span class="pl-tx"><b>' + head + '</b><small>' + sub + '</small></span></div>';
}
function goalRow(g, st, isNext) {
  const done = g.done, r = rewardOf(g);
  const state = done ? 'Eingelöst am ' + fmtShort(done) : g.reached ? 'Gefunden!' + (g.on ? ' Am ' + fmtShort(g.on) + '.' : '') + ' Sag Mama oder Papa Bescheid.' : 'Noch ' + dia(g.need);
  const bar = isNext ? '<div class="gbar" aria-hidden="true"><i style="width:' + clamp(Math.round((st.score - g.prev) / Math.max(1, g.at - g.prev) * 100), 0, 100) + '%"></i></div>' : '';
  const btn = U.unlocked && g.reached ? '<button class="btn btn-ghost btn-sm" data-act="redeem" data-key="' + esc(g.id) + '">' + (done ? 'Rückgängig' : 'Als eingelöst markieren') + '</button>' : '';
  return '<div class="tier goal' + (g.reached ? ' got' : '') + (done ? ' done' : '') + (isNext ? ' next' : '') + '" data-goal="' + esc(g.id) + '"><span class="tier-ico">' + (g.last ? crownSVG(46) : gemSVG(g.gem, 44)) + '</span>' +
    '<div><h3>' + dia(g.at) + (g.last ? '<span class="tn-s"> · der große Schatz</span>' : '') + '</h3><p' + (r ? '' : ' class="tbd"') + '>' + (r ? esc(r) : IC.gift + ' Überraschung!') + '</p><div class="state">' + state + '</div>' + bar + btn + '</div>' + (g.money ? '<span class="tier-coin" role="img" aria-label="Geld fürs Konto">' + coinSVG(30) + '</span>' : '') + '</div>';
}
function stickerCell(s, own, foilL) {
  const got = own.indexOf(s.id) >= 0, foil = foilL.indexOf(s.id) >= 0, R = RARITY[s.rar];
  return '<button class="sticker r-' + s.rar + ' ' + (got ? 'got' : 'lock') + (foil ? ' foil' : '') + (U.newSticker === s.id ? ' new' : '') + '" data-act="sticker" data-id="' + s.id + '" aria-label="' + (got ? esc(plain(s.name)) + ', ' + R.name : 'Sticker ' + (+s.id.slice(1)) + ', ' + R.name + ', noch nicht gefunden') + '">' +
    '<div class="in"><span class="ic">' + stickerIco(s, 38) + '</span><span class="nm2">' + (got ? esc(s.name) : '?') + '</span></div>' + (got ? '<span class="pt" aria-hidden="true">' + R.pts + '</span>' : '') + '</button>';
}
function stickerPointsCard(st) {
  const s = st.stickers, full = st.packs.complete;
  const pct = full ? 100 : (PTS_PER_DIAMANT - s.toNext) / PTS_PER_DIAMANT * 100;
  return '<section class="card stpoints" aria-label="Sticker-Punkte"><div class="sp-top"><div class="sp-n"><b>' + s.pts + '</b><span>Sticker-Punkte</span></div>' +
    '<div class="sp-bonus">' + gemMini(30) + '<b>' + s.bonus + '</b><span>' + (s.bonus === 1 ? 'Bonus-Diamant' : 'Bonus-Diamanten') + '</span></div></div>' +
    '<div class="bar sp-bar"><div class="fill" data-key="spts" data-to="' + pct + '" style="width:' + (U.bars.spts != null ? U.bars.spts : 0) + '%"></div></div>' +
    '<p class="hint">' + (full ? 'Alle Sticker gesammelt!' : 'Noch <b>' + punkte(s.toNext) + '</b> bis zum nächsten Bonus-Diamanten.') + '</p>' +
    '<ul class="sp-legend">' + RAR_ORDER.slice().reverse().map(r => '<li><i class="rsw ' + r + '"></i><span><b>' + RARITY[r].name + '</b> ' + punkte(RARITY[r].pts) + '</span></li>').join('') + '</ul></section>';
}
function tally(st) {
  if (!st.minus && !(st.waiting && S.cfg.digMode !== false)) return '';
  return '<section class="card tally" aria-label="Diamanten und Minus"><div class="ty-row"><span>Diamanten gesamt</span><b>' + st.total + '</b></div>' +
    (st.waiting && S.cfg.digMode !== false ? '<div class="ty-row"><span>davon noch in der Erde (zählen schon)</span><b>' + st.waiting + '</b></div>' : '') +
    (st.minus ? '<div class="ty-row minus"><span>Minus durch Wolken</span><b>−' + st.minus + '</b></div>' : '') +
    '<div class="ty-row sum"><span>Das zählt für die Schätze</span><b>' + signed(st.score) + '</b></div></section>';
}
function viewAchieve(st) {
  const gl = goalList(S, st), last = gl[gl.length - 1], nx = gl.find(g => !g.reached);
  const tgt = nx || last, p = tgt ? clamp((st.score - (nx ? nx.prev : 0)) / Math.max(1, tgt.at - (nx ? nx.prev : 0)), 0, 1) : 1;
  const left = last ? Math.max(0, last.at - st.score) : 0;
  const head = nx ? (nx.last ? esc(S.cfg.chest.title) : 'Nächster Schatz') : 'Alle Schätze gefunden!';
  let h = '<section class="card big-chest"><div class="bc-art">' + unicornSVG(86, 'bc-uni') + chestSVG(chestLevel(st.chest, last ? last.at : 100), 220) + '</div><div class="bc-meta">' +
    '<div class="top-line"><div><span class="eyebrow">' + dia(st.chest) + ' in deiner Truhe</span><h2>' + head + '</h2></div>' + (nx ? '<span class="tl-gem">' + (nx.last ? crownSVG(48) : gemSVG(nx.gem, 46)) + '</span>' : '') + '</div>' +
    (nx ? '<div class="bar"><div class="fill gold" data-key="next" data-to="' + (p * 100) + '" style="width:' + (U.bars.next != null ? U.bars.next : 0) + '%"></div></div>' +
      '<p class="hint big"><b>Noch ' + dia(nx.need) + '</b> bis ' + dia(nx.at) + '.</p>' +
      '<div class="reward-box"><span class="gift" aria-hidden="true">' + IC.gift + '</span><div><b>Dann bekommst du</b><span>' + goalText(nx) + '</span></div></div>' : '<p class="hint big">Mama und Papa verstecken bald neue Schätze.</p>') +
    (nx && !nx.last && last ? '<p class="hint">Bis zu „' + esc(S.cfg.chest.title) + '“: noch ' + dia(left) + '.</p>' : '') +
    packLine(st) + '</div></section>';
  h += tally(st);
  /* Alle Schätze sind immer zu sehen (Wunsch des Nutzers, 14.11.). */
  const shown = gl;
  h += '<div class="sec-h"><h2>Meine Schätze</h2>' + (U.unlocked ? '<button class="btn btn-ghost btn-sm" data-act="goto-sec" data-sec="schaetze">Schätze ändern</button>' : '<span class="hint">' + gl.filter(g => g.reached).length + ' von ' + gl.length + ' gefunden</span>') + '</div><div class="tiers">' +
    shown.map(g => goalRow(g, st, nx && nx.id === g.id)).join('') + '</div>';
  const own = S.prog.album || [], foilL = S.prog.foil || [];
  h += '<div class="sec-h"><h2>Sammelalbum</h2><span class="hint">' + own.filter(id => STICKER_BY[id]).length + ' von ' + STICKERS.length + '</span></div>' + stickerPointsCard(st);
  CATS.forEach(cat => {
    const list = STICKERS.filter(s => s.cat === cat), got = list.filter(s => own.indexOf(s.id) >= 0).length;
    h += '<div class="sec-h cat-h"><h3>' + cat + '</h3><span class="hint">' + got + ' von ' + list.length + '</span></div><div class="album">' + list.map(s => stickerCell(s, own, foilL)).join('') + '</div>';
  });
  return h;
}

/* ---------- Konto (Guthaben in Euro, wie in der Torjäger-App) ---------- */
function kontoTitle(en) {
  const t = String(en.t || '').trim();
  if (en.k === 'pay') return t || 'Ausgezahlt';
  if (en.k === 'minus') return t || 'Abbuchung';
  return t || 'Gutschrift';
}
function kontoRow(en) {
  const c = Math.round(+en.c) || 0, out = c < 0;
  const ico = en.k === 'pay' ? IC.coin : out ? IC.minus : IC.plus;
  const when = /^\d{4}-\d{2}-\d{2}$/.test(en.ds || '') ? fmtShort(en.ds) : '';
  const kind = { plus: 'Gutschrift', minus: 'Abbuchung', pay: 'Ausgezahlt' }[en.k] || 'Buchung';
  return '<li class="ev kb ' + (out ? (en.k === 'pay' ? 'pay' : 'out') : 'good') + '"><span class="evi">' + ico + '</span><span class="evt">' + esc(kontoTitle(en)) + '<small>' + (when ? when + ' · ' : '') + kind + '</small></span>' +
    '<b class="evv">' + (out ? '−' : '+') + fmtEUR(Math.abs(c)) + '</b>' +
    (U.unlocked && !U.readonly ? '<button class="evx" data-act="konto-del" data-id="' + esc(en.id) + '" aria-label="Buchung löschen">' + IC.cross + '</button>' : '<span></span>') + '</li>';
}
/* Münzen als Bild: eine je Euro (höchstens 20), damit auch ein Kind ohne Zahlen sieht, wie viel es ist. */
function coinPile(cents) {
  const n = Math.min(20, Math.floor(Math.max(0, cents) / 100)), rest = cents > 0 && cents % 100 ? 1 : 0;
  if (!n && !rest) return '';
  let h = '<div class="kh-pile" aria-hidden="true">';
  for (let i = 0; i < n; i++) h += coinSVG(30);
  if (rest) h += '<span class="small-coin">' + coinSVG(20) + '</span>';
  return h + (cents >= 2100 ? '<em>…</em>' : '') + '</div>';
}
function viewKonto() {
  const bal = kontoBalance(S), list = kontoList(S), nm = S.cfg.name;
  const gl = goalList(S, ST()), nextMoney = gl.find(g => !g.reached && g.money);
  let h = '<section class="card konto-hero"><div class="kh-ico">' + coinSVG(76) + '</div><div class="kh-tx"><span class="eyebrow">' + esc(genitive(nm)) + ' Konto</span>' +
    '<b class="kh-sum' + (bal > 0 ? '' : ' zero') + '" id="kontoSum">' + fmtEUR(bal) + '</b>' +
    '<small>' + (bal > 0 ? 'Dieses Geld gehört dir. Mama und Papa heben es für dich auf.' : 'Noch nichts auf dem Konto. Manche Schätze bringen Geld!') + '</small></div>' + coinPile(bal) + '</section>';
  if (nextMoney) h += '<button class="card pad konto-next" data-act="tab" data-tab="achieve"><span class="kn-ico">' + coinSVG(34) + '</span><span class="kn-tx"><b>Noch ' + dia(nextMoney.need) + '</b><small>Dann gibt es ' + fmtEUR(nextMoney.money) + ' aufs Konto.</small></span>' + IC.chevR + '</button>';
  if (U.unlocked && !U.readonly) {
    h += '<div class="xbtns kbtns">' +
      '<button class="xbtn" data-act="konto-open" data-k="plus">' + IC.plus + '<span>Gutschreiben</span></button>' +
      '<button class="xbtn" data-act="konto-open" data-k="minus">' + IC.minus + '<span>Abbuchen</span></button>' +
      '<button class="xbtn" data-act="konto-open" data-k="pay">' + IC.coin + '<span>Auszahlen</span></button></div>';
  }
  h += '<div class="sec-h"><h2>Buchungen</h2>' + (list.length ? '<span class="hint">' + list.length + '</span>' : '') + '</div>';
  h += list.length ? '<ul class="evs kl">' + list.map(kontoRow).join('') + '</ul>' : '<div class="card pad"><p class="hint">Noch keine Buchungen. Hier steht, was gutgeschrieben, abgebucht oder ausgezahlt wurde.</p></div>';
  return h;
}

/* ---------- Eltern ---------- */
const EMOJI_PRESETS = ['🦷', '🪥', '👗', '🧦', '👟', '🛏️', '🧸', '🍽️', '🌙', '🛁', '🧼', '💧', '📚', '🎨', '🧩', '🐶', '🌱', '🧹', '🎒', '💖', '⭐', '🌈'];
const TASK_IDEAS = [['🧼', 'Hände waschen'], ['🛁', 'Baden'], ['🧦', 'Socken anziehen'], ['👟', 'Schuhe anziehen'], ['📚', 'Buch anschauen'], ['🌱', 'Blumen gießen'], ['🐶', 'Tier füttern'], ['🎒', 'Tasche packen']];
const REWARD_IDEAS = ['1 € aufs Guthabenkonto', '2 € aufs Guthabenkonto', '5 € aufs Guthabenkonto', 'Einhorn-Sticker', 'Glitzer-Tattoo aussuchen', 'Haarspange aussuchen', 'Malbuch aussuchen', 'Kleines Spielzeug aussuchen', 'Extra Gute-Nacht-Geschichte', 'Filmnachmittag mit Popcorn', 'Eis essen gehen', 'Ausflug in den Zoo', 'Ausflug ins Schwimmbad', 'Ausflug in den Freizeitpark'];
const SECTIONS = [['aufgaben', 'Aufgaben'], ['schaetze', 'Schätze'], ['graben', 'Graben und Spiele'], ['wolken', 'Wolken'], ['kind', 'Aussehen'], ['ton', 'Ton und Code']];
const stepper = (obj, key, val, min, max, step, unit) => '<div class="stepper"><button data-act="step" data-obj="' + obj + '" data-key="' + key + '" data-d="' + (-step) + '" data-min="' + min + '" data-max="' + max + '" aria-label="weniger">−</button><output>' + val + (unit || '') + '</output><button data-act="step" data-obj="' + obj + '" data-key="' + key + '" data-d="' + step + '" data-min="' + min + '" data-max="' + max + '" aria-label="mehr">+</button></div>';
const switchRow = (act, on, title, small, extra) => '<button class="switch" role="switch" aria-checked="' + on + '" data-act="' + act + '" ' + (extra || '') + '><span><b>' + title + '</b>' + (small ? '<small>' + small + '</small>' : '') + '</span><i class="sw"></i></button>';
function lookPickers(cur, act) {
  return '<div class="field"><span>Haarfarbe</span><div class="swatches" role="group" aria-label="Haarfarbe">' + Object.keys(HAIR).map(k => '<button class="sw-c" data-act="' + act + '" data-k="hair" data-v="' + k + '" aria-pressed="' + (cur.hair === k) + '" aria-label="' + HAIR[k].name + '" style="--c:' + HAIR[k].fill + '"></button>').join('') + '</div></div>' +
    '<div class="field"><span>Frisur</span><div class="chips-r" role="group" aria-label="Frisur">' + Object.keys(STYLE).map(k => '<button data-act="' + act + '" data-k="style" data-v="' + k + '" aria-pressed="' + (cur.style === k) + '">' + STYLE[k] + '</button>').join('') + '</div></div>' +
    '<div class="field"><span>Kleid</span><div class="swatches" role="group" aria-label="Kleidfarbe">' + Object.keys(DRESS).map(k => '<button class="sw-c" data-act="' + act + '" data-k="dress" data-v="' + k + '" aria-pressed="' + (cur.dress === k) + '" aria-label="' + DRESS[k].name + '" style="--c:' + DRESS[k].fill + '"></button>').join('') + '</div></div>';
}

function adviceBox() {
  const adv = parentAdvice(S, U.today);
  const claimed = evalDay(S, U.today).claimed;
  const lines = [];
  if (claimed) lines.push('<li><b>' + esc(S.cfg.name) + ' hat heute ' + (claimed === 1 ? 'eine Aufgabe' : claimed + ' Aufgaben') + ' als geschafft getippt.</b> <button class="linkbtn" data-act="tab" data-tab="today">Jetzt ansehen</button></li>');
  adv.forEach(a => {
    if (a.kind === 'reds') lines.push('<li><b>Zwei Gewitter in 7 Tagen.</b> Das ist für ein Kind in diesem Alter viel. Wolken pausieren, Aufgaben kürzen und in Ruhe reden.</li>');
    else if (a.kind === 'album') lines.push('<li><b>Das Album ist voll.</b> Neue Zauberbeutel lassen Sticker glänzen.</li>');
    else if (a.kind === 'rewards') lines.push('<li><b>Bei den ersten Schätzen fehlt noch die Belohnung.</b> Bis dahin steht dort „Überraschung!“. Tragt sie unten bei „Schätze“ ein, am besten gemeinsam mit ' + esc(S.cfg.name) + '.</li>');
    else lines.push('<li><b>Der Schatz bei ' + dia(a.at) + ' (seit ' + fmtShort(a.since) + ') ist noch nicht eingelöst.</b> Bitte bald einlösen.</li>');
  });
  return lines.length ? '<section class="warn-box"><b>Für euch</b><ul class="adv">' + lines.join('') + '</ul></section>' : '';
}

function viewCoach(st) {
  if (!U.unlocked) {
    return '<section class="card gate"><div class="gate-art">' + crownSVG(90) + '</div><h2>Nur für Mama und Papa</h2><p class="hint">Hier stellt ihr Aufgaben, Schätze, Wolken und Spiele ein.</p><button class="btn btn-main" data-act="lock">Eltern-Code eingeben</button></section>';
  }
  const c = S.cfg, gs = c.goals;
  let h = adviceBox();
  h += '<section class="card coach-sec"><h2>So funktioniert es</h2>' +
    '<div class="chips-r jump" role="group" aria-label="Bereiche">' + SECTIONS.map(s => '<button data-act="goto-sec" data-sec="' + s[0] + '">' + s[1] + '</button>').join('') + '</div>' +
    '<ul class="rules">' +
    '<li>' + IC.hand + '<span><b>Ihr tragt im Eltern-Modus ein</b>, am besten gemeinsam mit ' + esc(c.name) + ': <b>Geschafft</b> bringt einen Diamanten. <b>Nicht geschafft</b> ist neutral: kein Diamant, aber auch kein Minus. Ohne Eltern-Modus kann ' + esc(c.name) + ' nichts selbst abhaken.</span></li>' +
    '<li>' + IC.shovel + '<span><b>Graben:</b> Jeder freigegebene Diamant wartet in der Erde. ' + esc(c.name) + ' tippt ' + (c.digTaps === 1 ? 'einmal' : c.digTaps + '-mal') + ', dann springt er heraus und fliegt in die Truhe. Er zählt aber schon ab der Freigabe.</span></li>' +
    '<li>' + IC.coin + '<span><b>Konto:</b> Gutschreiben, Abbuchen und Auszahlen macht ihr selbst im Tab Konto. Steht bei einem Schatz Geld („2 € aufs Guthabenkonto“), erinnert die App beim Einlösen daran, bucht aber nichts von allein.</span></li>' +
    '<li>' + cloudSVG('yellow', 26) + '<span><b>Gelbe Wolke</b> = Verwarnung, minus ' + dia(c.yellowPts) + '. Zwei gelbe Wolken werden zur <b>Gewitterwolke</b> (minus ' + c.redPts + ', höchstens einmal am Tag). Wolken verfallen nicht, ihr könnt sie zurücknehmen.</span></li>' +
    '<li>' + gemMini(24) + '<span><b>Schätze:</b> Alle Diamanten zählen zusammen, abzüglich Wolken. Von ' + gs[0].at + ' bis ' + gs[gs.length - 1].at + ' Diamanten.</span></li></ul>' +
    '<div class="row-btns"><button class="btn btn-ghost btn-sm" data-act="parents">Hinweise für Eltern</button><button class="btn btn-ghost btn-sm" data-act="rules">Regeln für ' + esc(c.name) + '</button><button class="btn btn-ghost btn-sm" data-act="lock">' + IC.lock + 'Eltern-Modus beenden</button></div></section>';

  h += '<section class="card coach-sec" id="sec-aufgaben"><h2>Aufgaben</h2><p class="hint">Die tägliche Liste, getrennt nach morgens und abends. <b>Antippen</b>, um Symbol, Name, Tageszeit, Wochentage und Diamanten zu ändern. Kurze, klare Aufgaben, die ' + esc(c.name) + ' allein schaffen kann, machen am meisten Spaß.</p>' +
    '<div class="tlist">' + Object.keys(SLOTS).map(slot => '<p class="tl-h">' + (slot === 'morgens' ? IC.sun : IC.moon) + SLOTS[slot] + '</p>' + c.tasks.filter(t => t.slot === slot && !(t.until && t.until <= U.today)).map(taskEditor).join('')).join('') + '</div>' +
    '<button class="btn btn-ghost" data-act="task-add">' + IC.plus + 'Neue Aufgabe</button>' +
    '<div class="field"><span>Ideen zum Antippen</span><div class="chips-r ideas" role="group" aria-label="Aufgaben-Ideen">' + TASK_IDEAS.map((t, i) => '<button data-act="task-idea" data-i="' + i + '">' + t[0] + ' ' + esc(t[1]) + '</button>').join('') + '</div></div></section>';

  h += '<section class="card coach-sec" id="sec-schaetze"><h2>Schätze und Belohnungen</h2><p class="hint">Was ' + esc(c.name) + ' bei welchem Stand bekommt. Es zählen alle Diamanten zusammen, abzüglich Wolken. Die Texte sind Beispiele: Ändert sie am besten gemeinsam mit ' + esc(c.name) + '. Ohne Text steht dort „Überraschung!“. Geld wie „2 € aufs Guthabenkonto“ bucht ihr nach dem Einlösen selbst im Tab Konto. Bitte nie Mahlzeiten, Schlaf, Kuscheln oder die gewohnte gemeinsame Zeit als Belohnung oder Entzug einsetzen.</p>' +
    gs.map((g, i) => {
      const min = i > 0 ? gs[i - 1].at + 1 : 1, max = i < gs.length - 1 ? gs[i + 1].at - 1 : 100000;
      return '<div class="field goaled"><div class="row-btns" style="align-items:center;justify-content:space-between">' + stepper('goal:' + g.id, 'at', g.at, min, max, g.at < 30 ? 1 : 5, ' ' + gemMini(16)) +
        (gs.length > 1 ? '<button class="evx" data-act="goal-del" data-id="' + esc(g.id) + '" aria-label="Schatz bei ' + g.at + ' Diamanten entfernen">' + IC.cross + '</button>' : '') + '</div>' +
        '<input type="text" id="f-goal-' + esc(g.id) + '" data-bind="goal:' + esc(g.id) + ':reward" data-goal-id="' + esc(g.id) + '" value="' + esc(g.reward) + '" maxlength="120" placeholder="Belohnung (leer: Überraschung!)" aria-label="Belohnung bei ' + g.at + ' Diamanten"></div>';
    }).join('') +
    '<div class="field"><span>Ideen (erst in ein Feld tippen, dann auf eine Idee)</span><div class="chips-r ideas" role="group" aria-label="Belohnungs-Ideen">' + REWARD_IDEAS.map((t, i) => '<button data-act="reward-idea" data-i="' + i + '">' + esc(t) + '</button>').join('') + '</div></div>' +
    '<button class="btn btn-ghost" data-act="goal-add">' + IC.plus + 'Schatz hinzufügen</button>' +
    '<div class="field"><span>Name der großen Truhe</span><input type="text" id="f-chest-title" data-bind="chest:title" value="' + esc(c.chest.title) + '" maxlength="40" aria-label="Name der großen Truhe"></div>' +
    '<div class="field"><span>Zauberbeutel</span><div class="row-btns" style="align-items:center">' + stepper('cfg', 'packEvery', c.packEvery, 3, 20, 1, ' ' + gemMini(16)) + '</div><small>So viele Diamanten bis zum nächsten Zauberbeutel. Sticker zählen 1, 2 oder 5 Punkte, je ' + PTS_PER_DIAMANT + ' Punkte gibt es einen Bonus-Diamanten.</small></div></section>';

  h += '<section class="card coach-sec" id="sec-graben"><h2>Graben und Spiele</h2>' +
    switchRow('dig-mode', c.digMode !== false, esc(c.name) + ' gräbt jeden Diamanten selbst aus', 'Aus: Diamanten fliegen nach der Freigabe sofort in die Truhe.') +
    '<div class="field"><span>Tipps je Diamant</span>' + stepper('cfg', 'digTaps', c.digTaps, 1, 5, 1, '') + '<small>Vorschlag: 3. Weniger, wenn es zu lange dauert, mehr, wenn es mehr Spiel sein soll.</small></div>' +
    switchRow('dig-fun', c.digFun !== false, 'Spaß-Funde', 'Ohne wartende Diamanten findet die Gräberin Kleinigkeiten (Wurm, Blume, Stern). Sie zählen nicht.') +
    switchRow('games', c.games !== false, 'Spielwiese auf „Heute“', 'Memory, Hütchen und Sternenregen. Nur zum Spaß: Dabei gibt es keine Diamanten.') + '</section>';

  h += '<section class="card coach-sec" id="sec-wolken"><h2>Wolken</h2><p class="hint">Gelbe Wolke = Verwarnung. Zwei gelbe Wolken werden zur Gewitterwolke. Wolken kosten Diamanten bei den Schätzen; in der Truhe und in der Übersicht bleiben alle Diamanten stehen. Einen Grund müsst ihr nie angeben. Jede Wolke lässt sich zurücknehmen.</p>' +
    '<div class="field"><span>Gelbe Wolke: Abzug</span>' + stepper('cfg', 'yellowPts', c.yellowPts, 0, 5, 1, ' ' + gemMini(16)) + '</div>' +
    '<div class="field"><span>Gewitterwolke: Abzug</span>' + stepper('cfg', 'redPts', c.redPts, 1, 9, 1, ' ' + gemMini(16)) + '<small>Wirkt höchstens einmal pro Tag, auch beim automatischen Gewitter.</small></div>' +
    '<div class="field"><span>Extra-Diamanten höchstens pro Tag</span>' + stepper('cfg', 'extraMax', c.extraMax, 1, 10, 1, '') + '</div>' +
    '<div class="field"><span>Schnellauswahl für Extra-Diamanten</span><textarea id="f-good" data-bind="list:goodReasons" rows="5">' + esc(c.goodReasons.join('\n')) + '</textarea></div></section>';

  h += '<section class="card coach-sec" id="sec-kind"><h2>Aussehen</h2><div class="kid-prev">' + girlSVG(c.look, 130) + unicornSVG(90) + '</div>' +
    '<div class="row2"><div class="field"><span>Name</span><input type="text" id="f-name" data-bind="cfg:name" value="' + esc(c.name) + '" maxlength="20"></div>' +
    '<div class="field"><span>Name des Einhorns</span><input type="text" id="f-unicorn" data-bind="cfg:unicorn" value="' + esc(c.unicorn) + '" maxlength="20"></div></div>' +
    lookPickers(c.look, 'look') + '</section>';

  h += '<section class="card coach-sec" id="sec-ton"><h2>Ton und Code</h2>' +
    switchRow('sound', !U.muted, 'Töne auf diesem Gerät', 'Glöckchen, Funkeln, Graben, Spiele. Auf dem iPhone: Seitenschalter auf laut.') +
    (c.pin ? '<div class="row-btns"><button class="btn btn-ghost btn-sm" data-act="pin-set">Code ändern</button><button class="btn btn-ghost btn-sm" data-act="pin-clear">Code entfernen</button></div>'
      : '<div class="warn-box"><span><b>Kein Eltern-Code gesetzt.</b> Dann kann ' + esc(c.name) + ' selbst Diamanten freigeben.</span><button class="btn btn-main btn-sm" data-act="pin-set">Code festlegen</button></div>') + '</section>';

  const memTx = Store.cloud ? 'Der Stand liegt in eurer Datenbank in Europa und ist auf allen Geräten mit dem Familienlink gleich. Ohne Netz geht es weiter, geschrieben wird später nach.'
    : Store.mode === 'db' ? 'Der Stand liegt sicher in der Seite und ist auf allen euren Geräten gleich.' : Store.lsOk ? 'Der Stand liegt nur auf diesem Gerät.' : 'Achtung: Der Stand wird hier nicht dauerhaft gespeichert.';
  const memBtns = Store.cloud && Store.cred ? '<div class="row-btns"><button class="btn btn-main btn-sm" data-act="link-share">Familienlink teilen</button><button class="btn btn-ghost btn-sm" data-act="link-reset-ask">Dieses Gerät abmelden</button></div>' +
    '<p class="hint">Wer den Familienlink hat, sieht und ändert den Stand. Schickt ihn nur an die Familie.</p>' : '';
  h += '<section class="card coach-sec" id="sec-speicher"><h2>Speicher</h2><p class="hint">' + memTx + '</p>' + memBtns +
    '<button class="btn btn-ghost btn-sm" data-act="reset-ask">Alles zurücksetzen</button></section>';
  return h;
}
const daysText = t => (t.days.length === 7 ? 'täglich' : t.days.length === 5 && [1, 2, 3, 4, 5].every(d => t.days.indexOf(d) >= 0) ? 'Mo–Fr' : t.days.slice().sort().map(d => WD_SHORT[d]).join(' '));
function taskEditor(t) {
  const open = U.editTask === t.id;
  let h = '<button class="trow' + (open ? ' open' : '') + '" data-act="task-edit" data-id="' + t.id + '" aria-expanded="' + open + '"><span class="ico">' + esc(t.icon) + '</span><span><b>' + esc(t.title || 'Neue Aufgabe') + '</b><span class="s">' + daysText(t) + ' · ' + dia(t.pts) + '</span></span>' + IC.chevR + '</button>';
  if (!open) return h;
  const same = S.cfg.tasks.filter(x => x.slot === t.slot && !(x.until && x.until <= U.today)), i = same.indexOf(t);
  h += '<div class="tedit"><div class="field"><span>Symbol</span><div class="emojis">' + EMOJI_PRESETS.map(e => '<button data-act="emoji" data-id="' + t.id + '" data-e="' + e + '" aria-pressed="' + (t.icon === e) + '">' + e + '</button>').join('') + '</div></div>' +
    '<div class="field"><span>Name</span><input type="text" id="te-title" data-bind="task:' + t.id + ':title" value="' + esc(t.title) + '" maxlength="40"></div>' +
    '<div class="field"><span>Tageszeit</span><div class="chips-r" role="group" aria-label="Tageszeit">' + Object.keys(SLOTS).map(s => '<button data-act="task-slot" data-id="' + t.id + '" data-v="' + s + '" aria-pressed="' + (t.slot === s) + '">' + SLOTS[s] + '</button>').join('') + '</div></div>' +
    '<div class="field"><span>Diamanten</span>' + stepper('task:' + t.id, 'pts', t.pts, 1, 3, 1, '') + '</div>' +
    '<div class="field"><span>Wochentage</span><div class="dchips">' + [1, 2, 3, 4, 5, 6, 0].map(d => '<button data-act="task-day" data-id="' + t.id + '" data-d="' + d + '" aria-pressed="' + (t.days.indexOf(d) >= 0) + '">' + WD_SHORT[d] + '</button>').join('') + '</div></div>' +
    '<div class="row-btns"><button class="btn btn-ghost btn-sm" data-act="task-move" data-id="' + t.id + '" data-d="-1"' + (i <= 0 ? ' disabled' : '') + '>Nach oben</button><button class="btn btn-ghost btn-sm" data-act="task-move" data-id="' + t.id + '" data-d="1"' + (i >= same.length - 1 ? ' disabled' : '') + '>Nach unten</button><button class="btn btn-ghost btn-sm" data-act="task-del" data-id="' + t.id + '">Entfernen</button></div></div>';
  return h;
}
