/* ============ Aktionen: Abhaken, Freigeben, Graben, Wolken, Feiern, Fenster, Einstellungen ============ */
const ACT = {};
const rid = () => Math.random().toString(36).slice(2, 7);
const taskById = id => S.cfg.tasks.find(t => t.id === id);

/* ---------- Meldungen ---------- */
let toastT = 0, bannerT = 0, celebT = 0, confirmFn = null;
function toast(msg, kind) {
  const h = $('#toast'); if (!h) return;
  clearTimeout(toastT);
  h.innerHTML = '<div class="toast' + (kind === 'warn' ? ' warn' : '') + '">' + esc(msg) + '</div>';
  toastT = setTimeout(() => { h.innerHTML = ''; }, 3300);
}
/* Einblendung oben. title und sub müssen bereits mit esc() behandelt sein. Mit go (Name eines Tabs) führt Antippen dorthin. */
function banner(o) {
  const h = $('#banner'); if (!h) return;
  clearTimeout(bannerT);
  const inner = '<span class="bn-i">' + (o.icon || '') + '</span><span class="bn-t"><b>' + o.title + '</b>' + (o.sub ? '<small>' + o.sub + '</small>' : '') + '</span>';
  h.innerHTML = o.go ? '<button class="bn go ' + (o.tone || '') + '" data-act="banner-go" data-tab="' + o.go + '" style="animation-duration:' + (o.ms || 3000) + 'ms">' + inner + '<span class="bn-arrow" aria-hidden="true">' + IC.chevR + '</span></button>'
    : '<div class="bn ' + (o.tone || '') + '" role="status" style="animation-duration:' + (o.ms || 3000) + 'ms">' + inner + '</div>';
  bannerT = setTimeout(() => { h.innerHTML = ''; }, o.ms || 3000);
}
ACT['banner-go'] = el => {
  clearTimeout(bannerT); const h = $('#banner'); if (h) h.innerHTML = '';
  U.tab = el.dataset.tab; window.scrollTo(0, 0); render();
};

/* ---------- Fenster ---------- */
function openSheet(html, cls) {
  const l = $('#layer'); if (!l) return;
  const bn = $('#banner'); if (bn) bn.innerHTML = '';
  l.innerHTML = '<div class="sheet-back" data-act="sheet-close"></div><div class="sheet' + (cls ? ' ' + cls : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
  U.sheet = cls || 'x'; document.body.classList.add('noscroll');
  const f = $('.sheet [autofocus]'); if (f) setTimeout(() => f.focus(), 60);
}
const setSheet = html => { const s = $('.sheet'); if (s) s.innerHTML = html; };
function closeSheet() {
  const l = $('#layer'); if (l) l.innerHTML = '';
  const was = U.sheet;
  if (was === 'sheet-game') gameStop();
  U.sheet = null; U.ob = null; U.ex = null; U.kx = null; document.body.classList.remove('noscroll');
  if (was) scheduleCeleb(400);
}
ACT['sheet-close'] = () => { if (U.sheet === 'onboard') return; closeSheet(); };
function confirmSheet(o, fn) {
  confirmFn = fn;
  openSheet('<h2>' + esc(o.title) + '</h2>' + (o.text ? '<p class="sub">' + esc(o.text) + '</p>' : '') +
    '<div class="row-btns"><button class="btn ' + (o.danger ? 'btn-danger' : 'btn-main') + '" data-act="confirm-yes">' + esc(o.ok || 'Ja') + '</button><button class="btn btn-ghost" data-act="sheet-close">Abbrechen</button></div>', 'confirm');
}
ACT['confirm-yes'] = () => { const f = confirmFn; confirmFn = null; closeSheet(); if (f) f(); };

/* ---------- Tag, Meilensteine ---------- */
function ensureDay(ds) {
  const d = S.days[ds] || (S.days[ds] = {});
  if (!d.m) d.m = {};
  if (!d.ev) d.ev = [];
  return d;
}
const snap = ds => milestones(S, ds, U.today);
const savedDay = ds => persist('days/' + ds);

/* Merkt sich, wann ein Schatz erreicht wurde („Gefunden am …“). Wird er durch eine Wolke wieder verfehlt, fällt das Datum (und die Feier) weg. */
function afterMutation(ds, b) {
  const a = snap(ds), cel = S.prog.cel, shown = S.prog.shown || (S.prog.shown = {});
  let dirty = false;
  b.goals.filter(id => a.goals.indexOf(id) < 0).forEach(id => { if (cel['g:' + id]) { delete cel['g:' + id]; dirty = true; } if (shown[id]) { delete shown[id]; dirty = true; } });
  a.goals.filter(id => b.goals.indexOf(id) < 0).forEach(id => { if (!cel['g:' + id]) { cel['g:' + id] = U.today; dirty = true; } });
  if (dirty) persist('cfg/progress');
  scheduleCeleb(700);
}
function scheduleCeleb(ms) { clearTimeout(celebT); celebT = setTimeout(checkCelebs, ms); }

/* ---------- Feiern: aus den Daten abgeleitet, damit sie auch geräteübergreifend genau einmal kommen ----------
   Gefeiert wird erst, wenn nichts mehr in der Erde wartet (Feier nach dem Graben). Was gezeigt wurde, steht in cfg/progress. */
function celebBlocked() { return !U.ready || U.readonly || Store.noAccess || Store.gate || U.celeb || U.pack || U.sheet || U.digBusy || U.volley || U.holdAt != null; }
function checkCelebs() {
  if (celebBlocked()) { if (U.ready && !U.readonly && !Store.gate) { clearTimeout(celebT); celebT = setTimeout(checkCelebs, 900); } return; }
  const st = ST(), prog = S.prog, shown = prog.shown || (prog.shown = {}), cel = prog.cel;
  if (st.waiting > 0 && S.cfg.digMode !== false) return;
  let dirty = false;
  const gl = goalList(S, st);
  gl.forEach(g => { if (g.reached && !shown[g.id]) { shown[g.id] = 1; dirty = true; if (!g.done) U.celebQ.push({ type: g.last ? 'treasure' : 'goal', id: g.id }); if (!cel['g:' + g.id]) cel['g:' + g.id] = U.today; } });
  const e = evalDay(S, U.today);
  if (e.perfect && !cel['p:' + U.today]) { cel['p:' + U.today] = 1; dirty = true; U.celebQ.push({ type: 'perfect' }); }
  if (prog.packN == null) { prog.packN = st.packs.earned; dirty = true; }
  else if (st.packs.earned > prog.packN) { U.packNote = (U.packNote || 0) + st.packs.earned - prog.packN; prog.packN = st.packs.earned; dirty = true; }
  if (dirty) persist('cfg/progress');
  showNextCeleb();
}
const celCard = (emblem, eyebrow, title, sub, extra, cls) =>
  '<div class="celeb ' + (cls || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(plain(title)) + '"><div class="rays"></div><div class="ce-card"><div class="emblem">' + emblem + '</div>' +
  '<div class="ce-eyebrow">' + eyebrow + '</div><h2 class="ce-title">' + title + '</h2>' + (sub ? '<p class="ce-sub">' + sub + '</p>' : '') + (extra || '') +
  '<button class="btn btn-main" data-act="celeb-next">Weiter</button></div></div>';
const rewardBox = txt => '<div class="ce-reward"><span class="gift" aria-hidden="true">' + IC.gift + '</span><div><b>Deine Belohnung</b><span>' + (String(txt || '').trim() ? esc(txt) : 'Eine Überraschung! Mama und Papa verraten sie dir.') + '</span></div></div>';
function showNextCeleb() {
  if (U.celeb || U.pack || U.sheet) return;
  const it = U.celebQ.shift();
  if (!it) {
    if (U.packNote) {
      const bn0 = $('#banner');
      if (bn0 && bn0.firstElementChild && !bn0.querySelector('.go')) { scheduleCeleb(1400); return; }
      const n = U.packNote; U.packNote = 0;
      banner({ icon: pouchSVG(46), title: n === 1 ? 'Ein neuer Zauberbeutel!' : n + ' neue Zauberbeutel!', sub: n === 1 ? 'Tippe hier, um ihn bei den Schätzen zu öffnen.' : 'Tippe hier, um sie bei den Schätzen zu öffnen.', tone: 'violet', ms: 7000, go: 'achieve' });
      Snd.sparkle();
    }
    return;
  }
  const name = esc(S.cfg.name), c = $('#celeb'); if (!c) return;
  let html;
  if (it.type === 'perfect') {
    html = celCard(crownSVG(150), 'Alle Aufgaben geschafft', 'Glitzer-Tag!', 'Heute hast du alles geschafft, ' + name + '!', '', 'perfect');
  } else {
    const g = goalList(S, ST()).find(x => x.id === it.id);
    if (!g || !g.reached) { scheduleCeleb(100); return; }
    if (it.type === 'treasure') {
      html = celCard(chestSVG(1, 230, { cls: 'open' }), dia(g.at), 'Der große Schatz!', 'Du hast ' + esc(S.cfg.chest.title) + ' gefunden, ' + name + '!', rewardBox(g.reward), 'treasure');
    } else {
      html = celCard(gemSVG(g.gem, 160), dia(g.at), 'Schatz gefunden!', 'Toll gemacht, ' + name + '!', rewardBox(g.reward));
    }
  }
  U.celeb = it;
  const bn = $('#banner'); if (bn) bn.innerHTML = '';
  c.innerHTML = html;
  document.body.classList.add('noscroll');
  Snd.fanfare(); FX.party(['💎', '✨', '👑']); Hap.go([40, 40, 40, 40, 90]);
}
function closeCeleb() {
  const c = $('#celeb'); if (c) c.innerHTML = '';
  U.celeb = null; U.pack = null; FX.clear();
  if (!U.sheet) document.body.classList.remove('noscroll');
}
ACT['celeb-next'] = () => { closeCeleb(); render(); scheduleCeleb(300); };

/* ---------- Eintragen (nur im Eltern-Modus) ----------
   Das Kind hakt nichts selbst ab (Wunsch des Nutzers, 14.11.): Die Eltern tragen gemeinsam mit ihm „Geschafft“ oder „Nicht geschafft“ ein.
   Ein alter Zustand c (vom Kind getippt, aus früheren Fassungen) wird weiter angezeigt und lässt sich freigeben. */
ACT.hint = el => {
  if (U.unlocked) return;
  const st = el.dataset.st, t = taskById(el.dataset.task);
  const li = el.closest('.task'); if (li) { li.classList.remove('shake'); void li.offsetWidth; li.classList.add('shake'); }
  const msg = (t ? t.title + ': ' : '') + (st === 'c' ? 'Wartet auf Mama oder Papa.' : st === 'y' ? 'Geschafft! Dafür gibt es einen Diamanten.' : st === 'n' ? 'Nicht geschafft. Morgen wieder!' : 'Das tragen Mama oder Papa mit dir ein.');
  toast(msg);
};
function setMark(ds, id, st) {
  if (!taskById(id)) return;
  const day = ensureDay(ds), cur = day.m[id] || null, b = snap(ds);
  const next = cur === st ? null : st;
  if (next) day.m[id] = next; else delete day.m[id];
  markChanged(); savedDay(ds);
  U.fx = { task: id };
  if (next === 'y') gemArrived(1, id); else { Snd.soft(); render(); }
  afterMutation(ds, b);
}
/* Nach einer Freigabe: Diamant wartet in der Erde (oder fliegt ohne Graben gleich in die Truhe). */
function gemArrived(n, taskId) {
  if (S.cfg.digMode === false) {
    Snd.gem(); U.pop = true; render();
    const el = taskId && $('#app .task[data-task="' + taskId + '"] .stamp');
    if (el) { const r = el.getBoundingClientRect(); FX.pop(r.left + r.width / 2, r.top + r.height / 2); }
    banner({ icon: gemSVG('weiss', 40), title: n === 1 ? 'Ein Diamant für die Truhe!' : dia(n) + ' für die Truhe!', tone: 'gold', ms: 2600 });
    return;
  }
  Snd.claim(); render();
  const w = ST().waiting;
  banner({ icon: IC.shovel, title: w === 1 ? 'Ein Diamant wartet in der Erde!' : dia(w) + ' warten in der Erde!', sub: U.tab === 'today' ? 'Tipp auf „Graben!“' : 'Auf „Heute“ ausgraben.', tone: 'gold', ms: 3000 });
}
ACT.mark = el => { if (!U.unlocked) return; setMark(U.date, el.dataset.task, el.dataset.st); };
function bulkMark(pred, st) {
  const ds = U.date, e = evalDay(S, ds), b = snap(ds), day = ensureDay(ds);
  let n = 0;
  e.items.forEach(it => { if (pred(it)) { day.m[it.t.id] = st; n += st === 'y' ? it.t.pts : 1; } });
  if (!n) return 0;
  markChanged(); savedDay(ds);
  if (st === 'y') gemArrived(n); else { Snd.soft(); render(); }
  afterMutation(ds, b);
  return n;
}
ACT['approve-claimed'] = () => { if (U.unlocked) bulkMark(it => it.st === 'c', 'y'); };
ACT['all-ok'] = () => { if (U.unlocked) bulkMark(it => !it.st || it.st === 'c', 'y'); };
ACT['rest-no'] = () => {
  if (!U.unlocked) return;
  const n = bulkMark(it => !it.st || it.st === 'c', 'n');
  if (n) toast(n === 1 ? 'Eine Aufgabe auf „nicht geschafft“ gesetzt.' : n + ' Aufgaben auf „nicht geschafft“ gesetzt.');
};

/* ---------- Graben ----------
   Jeder Tipp ist ein Spatenstich. Nach digTaps Stichen springt der älteste wartende Diamant heraus und fliegt in die Truhe (days/<ds>.dg + 1).
   Ohne wartende Diamanten findet die Gräberin Kleinigkeiten, die nicht zählen. Gedrückt halten gräbt alle aus. */
function paintDig() {
  const c = S.cfg, t = U.dig.taps, st = ST();
  $$('.digbtn .pips i').forEach((p, i) => p.classList.toggle('on', i < t));
  const m = $('#mound'); if (m) m.className = 'mound s' + Math.min(3, Math.round(t / Math.max(1, c.digTaps) * 3));
  const lab = $('#digLabel'); if (lab) lab.textContent = digLabel(st);
}
function digFx(k) {
  const g = $('#girl'); if (g) { g.classList.remove('dig'); void g.offsetWidth; g.classList.add('dig'); }
  const dirt = $('#dirt'), m = $('#mound');
  if (dirt && m && !stillMotion()) {
    const host = dirt.getBoundingClientRect(), r = m.getBoundingClientRect();
    for (let i = 0; i < 6 + k * 2; i++) {
      const p = document.createElement('i'); p.className = 'clod';
      const dx = (Math.random() - .5) * 120, dy = -30 - Math.random() * 60;
      p.style.left = (r.left - host.left + r.width / 2) + 'px'; p.style.top = (r.top - host.top + r.height * .45) + 'px';
      p.style.setProperty('--dx', dx.toFixed(0) + 'px'); p.style.setProperty('--dy', dy.toFixed(0) + 'px');
      dirt.appendChild(p); setTimeout(() => p.remove(), 700);
    }
  }
  Snd.dig(k); Hap.go(12);
}
function flyGem(fromEl, toEl, ms, color) {
  return new Promise(res => {
    if (!fromEl || !toEl || stillMotion() || !document.body.animate) return res();
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const x0 = a.left + a.width / 2 - 24, y0 = a.top + a.height * .4 - 24, x1 = b.left + b.width / 2 - 24, y1 = b.top + b.height * .35 - 24;
    const el = document.createElement('div'); el.className = 'flygem'; el.innerHTML = gemSVG(color || 'weiss', 48); document.body.appendChild(el);
    const an = el.animate([
      { transform: 'translate(' + x0 + 'px,' + (y0 + 20) + 'px) scale(.3) rotate(0deg)', opacity: .4 },
      { transform: 'translate(' + x0 + 'px,' + (y0 - 50) + 'px) scale(1.3) rotate(-12deg)', opacity: 1, offset: .35 },
      { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + (Math.min(y0, y1) - 80) + 'px) scale(1.1) rotate(8deg)', offset: .65 },
      { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.55) rotate(0deg)', opacity: 1 },
    ], { duration: ms, easing: 'cubic-bezier(.3,.1,.4,1)', fill: 'forwards' });
    const done = () => { el.remove(); res(); };
    an.onfinish = done; an.oncancel = done;
  });
}
const GEM_ROLL = ['weiss', 'rosa', 'topas', 'tuerkis', 'weiss', 'rosa'];
async function unearth(quick) {
  const st = ST(), ds = st.firstWaiting; if (!ds) return;
  const day = ensureDay(ds), e = evalDay(S, ds);
  U.digBusy = true;
  try {
    day.dg = e.dug + 1; markChanged(); savedDay(ds);
    const todayDug = evalDay(S, U.today).dug, col = GEM_ROLL[(ST().chest) % GEM_ROLL.length];
    Snd.gem(); Hap.go([25, 35, 25]);
    const g = $('#girl'); if (g) { g.classList.remove('dig'); g.classList.add('cheer'); }
    await flyGem($('#mound'), $('#chest'), quick ? 520 : 950, col);
    U.dig.taps = 0; U.pop = true; render();
    const ch = $('#chest'); if (ch) { const r = ch.getBoundingClientRect(); FX.pop(r.left + r.width / 2, r.top + r.height * .3); ch.classList.add('bump'); }
    const left = ST().waiting, n = ds === U.today ? todayDug : 0;
    if (!quick || !left) {
      const title = ds === U.today && n > 0 ? ladderText(n) : 'Funkel!';
      banner({ icon: gemSVG(col, 40), title: esc(title), sub: left ? (left === 1 ? 'Noch ein Diamant in der Erde.' : 'Noch ' + dia(left) + ' in der Erde.') : 'Alle Diamanten sind in der Truhe!', tone: 'gold', ms: 2400 });
    }
  } finally { U.digBusy = false; }
  if (!ST().waiting) scheduleCeleb(quick ? 900 : 1500);
}
function funFind() {
  const f = FUN_FINDS[Math.floor(Math.random() * FUN_FINDS.length)];
  Snd.find();
  const m = $('#mound');
  if (m && !stillMotion()) { const r = m.getBoundingClientRect(); FX.pop(r.left + r.width / 2, r.top, [f[0]]); }
  banner({ icon: '<span class="bn-emo">' + f[0] + '</span>', title: esc(f[1]) + '!', sub: 'Das ist kein Diamant. Aber lustig!', tone: '', ms: 2200 });
}
function digOnce(quick) {
  const c = S.cfg;
  if (U.readonly || U.digBusy || c.digMode === false) return Promise.resolve();
  const st = ST();
  if (st.waiting <= 0 && !c.digFun) { toast('Gerade wartet kein Diamant in der Erde.'); return Promise.resolve(); }
  U.dig.taps++;
  digFx(U.dig.taps);
  if (U.dig.taps < c.digTaps) { paintDig(); return Promise.resolve(); }
  if (st.waiting > 0) return unearth(quick);
  U.dig.taps = 0; paintDig(); funFind();
  return Promise.resolve();
}
async function digAll() {
  if (U.volley || ST().waiting < 1) return;
  U.volley = true;
  try {
    while (ST().waiting > 0) {
      for (let i = 0; i < S.cfg.digTaps; i++) { await digOnce(true); await sleep(110); }
      await sleep(120);
    }
  } finally { U.volley = false; }
  scheduleCeleb(900);
}
ACT.dig = () => { if (U.suppressClick) { U.suppressClick = false; return; } if (U.volley) return; digOnce(false); };

/* ---------- Extras und Wolken ---------- */
function addEvent(ds, ev) {
  const d = ensureDay(ds);
  ev.id = 'e' + Date.now().toString(36) + rid(); ev.ts = Date.now();
  d.ev.push(ev);
}
const EX_TITLE = { '+': 'Extra-Diamant', y: 'Gelbe Wolke', r: 'Gewitterwolke' };
const EX_OK = { '+': 'Diamant schenken', y: 'Gelbe Wolke eintragen', r: 'Gewitter eintragen' };
function exHTML() {
  const x = U.ex, c = S.cfg, k = x.k, e = evalDay(S, U.date), st = ST();
  const sub = {
    '+': 'Für etwas Besonderes: Wofür gibt es den Diamanten?',
    y: st.clouds.count > 0 ? 'Das ist die zweite gelbe Wolke: Sie wird zur Gewitterwolke. Minus zusammen ' + dia(c.yellowPts + (e.red ? 0 : c.redPts)) + ' bei den Schätzen.' : (c.yellowPts ? 'Minus ' + dia(c.yellowPts) + ' bei den Schätzen.' : 'Ohne Abzug.') + ' Eine zweite gelbe Wolke wird zur Gewitterwolke.',
    r: 'Minus ' + dia(c.redPts) + ' bei den Schätzen' + (e.red ? ' (heute gab es schon Gewitter, kein weiteres Minus)' : '') + '. Die Truhe bleibt, wie sie ist.',
  }[k];
  const left = Math.max(0, c.extraMax - e.plus);
  let h = '<h2 class="h-ic">' + (k === '+' ? gemMini(30) : cloudSVG(k === 'y' ? 'yellow' : 'red', 40)) + EX_TITLE[k] + '</h2><p class="sub">' + sub + '</p>';
  if (k === '+' && c.goodReasons.length) h += '<div class="chips-r" role="group" aria-label="Schnellauswahl">' + c.goodReasons.map((t, i) => '<button data-act="ex-chip" data-i="' + i + '" aria-pressed="' + (x.t === t) + '">' + esc(t) + '</button>').join('') + '</div>';
  h += '<div class="field"><span>' + (k === '+' ? 'Wofür?' : 'Grund (freiwillig)') + '</span><input type="text" id="ex-text" data-ex="t" value="' + esc(x.t) + '" maxlength="90" autocomplete="off" placeholder="' + (k === '+' ? 'z. B. Lieb geteilt' : 'Kein Grund nötig') + '"></div>';
  if (k === '+') h += '<div class="field"><span>Wie viele? (heute noch ' + left + ' möglich)</span><div class="vals">' + [1, 2, 3].map(v => '<button data-act="ex-val" data-v="' + v + '" aria-pressed="' + (x.v === v) + '"' + (v > left ? ' disabled' : '') + '>+' + v + '</button>').join('') + '</div></div>';
  h += '<div class="row-btns"><button class="btn btn-main" data-act="ex-save">' + EX_OK[k] + '</button><button class="btn btn-ghost" data-act="sheet-close">Abbrechen</button></div>';
  return h;
}
ACT['extra-open'] = el => {
  if (!U.unlocked) return;
  const k = el.dataset.k;
  if ((k === 'y' || k === 'r') && !S.cfg.cloudsAck) { ACT['clouds-unlock'](); return; }
  if ((k === 'y' || k === 'r') && U.date !== U.today) { toast('Wolken gibt es nur am selben Tag.'); return; }
  if (k === '+' && Math.max(0, S.cfg.extraMax - evalDay(S, U.date).plus) <= 0) { toast('Heute sind schon ' + S.cfg.extraMax + ' Extra-Diamanten eingetragen.'); return; }
  U.ex = { k, v: 1, t: '' };
  openSheet(exHTML(), 'sheet-ex');
};
ACT['ex-chip'] = el => { if (U.ex.k !== '+') return; U.ex.t = S.cfg.goodReasons[+el.dataset.i] || ''; setSheet(exHTML()); };
ACT['ex-val'] = el => { U.ex.v = +el.dataset.v; setSheet(exHTML()); };
ACT['ex-save'] = () => {
  const x = U.ex; if (!x) return;
  const ds = U.date, k = x.k, c = S.cfg, reason = (x.t || '').trim();
  const b = snap(ds), e0 = evalDay(S, ds);
  if (k === '+') {
    const left = Math.max(0, c.extraMax - e0.plus);
    if (left <= 0) { toast('Heute sind höchstens ' + c.extraMax + ' Extra-Diamanten möglich.'); return; }
    addEvent(ds, { k: '+', v: Math.min(x.v, left), t: reason || 'Extra-Diamant' });
  } else addEvent(ds, reason ? { k, t: reason } : { k });
  markChanged(); savedDay(ds);
  U.sheet = null; closeSheet();
  const e1 = evalDay(S, ds), newRed = e1.red - e0.red, gained = e1.minus - e0.minus;
  const dot = s => (/[.!?]$/.test(s) ? s : s + '.'), why = reason ? esc(dot(reason)) + ' ' : '';
  if (k === '+') gemArrived(e1.plus - e0.plus);
  else if (newRed > 0) {
    const auto = e1.entries.some(en => en.auto) && !e0.entries.some(en => en.auto);
    Snd.soft(); render();
    banner({ icon: cloudSVG('red', 44), title: auto ? 'Zwei gelbe Wolken: Gewitter!' : 'Gewitterwolke', sub: why + (gained > 0 ? 'Minus ' + dia(gained) + '.' : 'Heute gab es schon Gewitter, kein weiteres Minus.'), tone: 'storm', ms: 4200 });
  } else { Snd.soft(); render(); banner({ icon: cloudSVG('yellow', 44), title: 'Gelbe Wolke', sub: why + (gained > 0 ? 'Minus ' + dia(gained) + '. ' : '') + 'Eine zweite wird zur Gewitterwolke.', tone: 'yellow', ms: 3800 }); }
  afterMutation(ds, b);
};
ACT['ev-del'] = el => {
  if (!U.unlocked) return;
  const ds = U.date, d = S.days[ds]; if (!d) return;
  const b = snap(ds);
  d.ev = (d.ev || []).filter(x => x.id !== el.dataset.id);
  markChanged(); savedDay(ds); render(); afterMutation(ds, b);
};
ACT['cloud-back'] = el => {
  if (!U.unlocked) return;
  const ds = el.dataset.ds || U.date, id = el.dataset.id, d = S.days[ds];
  const en = d && (d.ev || []).find(x => x.id === id); if (!en) return;
  confirmSheet({ title: 'Wolke zurücknehmen?', text: 'Die ' + (en.k === 'y' ? 'gelbe Wolke' : 'Gewitterwolke') + (en.t ? ' („' + en.t + '“)' : '') + ' wird gelöscht. Was daraus folgt, rechnet sich neu, auch ein automatisches Gewitter.', ok: 'Zurücknehmen' }, () => {
    const b = snap(ds);
    d.ev = (d.ev || []).filter(x => x.id !== id);
    markChanged(); savedDay(ds); render(); afterMutation(ds, b); toast('Wolke zurückgenommen. Die Sonne scheint wieder.');
  });
};

/* ---------- Schätze ---------- */
ACT.redeem = el => {
  if (!U.unlocked) return;
  const k = el.dataset.key, g = S.cfg.goals.find(x => x.id === k); if (!g) return;
  S.prog.redK = S.prog.redK || {};
  if (S.prog.red[k]) {                                                // zurücknehmen: eine Konto-Gutschrift dazu wird wieder entfernt
    delete S.prog.red[k];
    const kid = S.prog.redK[k]; delete S.prog.redK[k];
    if (kid && S.konto[kid]) { delete S.konto[kid]; persist('konto/' + kid); toast('Zurückgenommen. Die Gutschrift auf dem Konto wurde entfernt.'); }
  } else {
    S.prog.red[k] = U.today;
    const cents = rewardMoney(g.reward);                              // „2 € aufs Guthabenkonto“ wird gleich gebucht, damit es nicht vergessen wird
    if (cents > 0) {
      const ts = Date.now(), id = 'k' + ts.toString(36) + rid();
      S.konto[id] = { ts, ds: U.today, c: cents, k: 'plus', t: ('Schatz: ' + dia(g.at)).slice(0, 40) };
      S.prog.redK[k] = id; persist('konto/' + id);
      banner({ icon: coinSVG(42), title: esc('+' + fmtEUR(cents) + ' aufs Konto'), sub: esc('Schatz bei ' + dia(g.at) + ' · Guthaben jetzt ' + fmtEUR(kontoBalance(S))), tone: 'gold', ms: 3600, go: 'konto' });
      Snd.fanfare(); FX.pop(innerWidth / 2, innerHeight / 3, ['🪙', '✨']);
    }
  }
  markChanged(); persist('cfg/progress'); render();
};
ACT['goal-add'] = () => {
  if (!U.unlocked) return;
  const gs = S.cfg.goals, last = gs[gs.length - 1], at = (last ? last.at : 0) + 100;
  gs.push({ id: 'g' + at + rid(), at, reward: '' }); markChanged(); persist('cfg/main'); render();
};
ACT['goal-del'] = el => {
  if (!U.unlocked) return;
  const g = S.cfg.goals.find(x => x.id === el.dataset.id); if (!g || S.cfg.goals.length < 2) return;
  confirmSheet({ title: 'Schatz entfernen?', text: dia(g.at) + ': ' + (rewardOf(g) || 'Überraschung') + '. Der Schatz verschwindet aus der Liste.', ok: 'Entfernen', danger: true }, () => {
    S.cfg.goals = S.cfg.goals.filter(x => x.id !== g.id); markChanged(); persist('cfg/main'); render();
  });
};
/* Ideen füllen das zuletzt angetippte Belohnungsfeld, sonst den ersten leeren Schatz. */
ACT['reward-idea'] = el => {
  if (!U.unlocked) return;
  const t = REWARD_IDEAS[+el.dataset.i];
  const g = S.cfg.goals.find(x => x.id === U.lastGoal) || S.cfg.goals.find(x => !rewardOf(x));
  if (!t) return;
  if (!g) { toast('Tippe zuerst in das Feld eines Schatzes, dann auf eine Idee.'); return; }
  g.reward = t; markChanged(); persist('cfg/main'); render();
  toast('„' + t + '“ bei ' + dia(g.at) + ' eingetragen.');
};

/* ---------- Zauberbeutel ---------- */
const stickerBig = (s, got, foil, extra) => '<div class="sticker big r-' + s.rar + ' ' + (got ? 'got' : 'lock') + (foil ? ' foil' : '') + (extra ? ' ' + extra : '') + '"><div class="in"><span class="no">' + s.cat + '</span><span class="ic">' + stickerIco(s, 86) + '</span><span class="nm2">' + (got ? esc(s.name) : '?') + '</span></div>' + (got ? '<span class="pt" aria-hidden="true">' + RARITY[s.rar].pts + '</span>' : '') + '</div>';
function paintPack() {
  const c = $('#celeb'), p = U.pack; if (!c || !p) return;
  if (p.phase === 'closed' || p.phase === 'tearing') {
    c.innerHTML = '<div class="celeb pack" role="dialog" aria-modal="true" aria-label="Zauberbeutel"><div class="rays"></div><div class="ce-card"><div class="ce-eyebrow">Zauberbeutel</div>' +
      '<button class="packbtn' + (p.phase === 'tearing' ? ' tearing' : '') + '" data-act="pack-tear" aria-label="Zauberbeutel öffnen">' + pouchSVG(220) + '</button>' +
      '<h2 class="ce-title small">' + (p.phase === 'tearing' ? 'Simsalabim …' : 'Aufmachen!') + '</h2><p class="ce-sub">Tippe auf den Beutel.</p>' +
      '<button class="btn btn-ghost btn-sm" data-act="pack-close">Später</button></div></div>';
  } else {
    const st = ST(), s = p.sticker, R = RARITY[s.rar], foilKind = p.kind === 'foil';
    const eyebrow = foilKind ? 'Glanz-Sticker!' : s.rar === 'u' ? 'Ultraselten!' : s.rar === 'r' ? 'Selten!' : 'Neu im Album!';
    c.innerHTML = '<div class="celeb pack open r-' + s.rar + '" role="dialog" aria-modal="true" aria-label="Neuer Sticker"><div class="rays"></div><div class="ce-card"><div class="ce-eyebrow">' + eyebrow + '</div>' +
      '<div class="emblem">' + stickerBig(s, true, foilKind, 'pop') + '</div><h2 class="ce-title small">' + esc(s.name) + '</h2>' +
      '<p class="ce-sub fact">' + esc(s.fact) + '</p>' +
      (foilKind ? '<p class="ce-sub">Dein Sticker glänzt jetzt.</p>' : '<p class="ce-sub sp-line">' + (p.bonusNew > 0 ? '<b class="bonus">💎 Bonus-Diamant!</b> ' : '') + 'Sticker ' + S.prog.album.length + ' von ' + STICKERS.length + ' · ' + R.name + '</p>') +
      '<div class="row-btns">' + (st.packs.left > 0 ? '<button class="btn btn-main" data-act="pack-again">Nächster Beutel (' + st.packs.left + ')</button>' : '') + '<button class="btn ' + (st.packs.left > 0 ? 'btn-ghost' : 'btn-main') + '" data-act="pack-close">Ins Album</button></div></div></div>';
  }
}
ACT['pack-open'] = () => {
  if (U.readonly || ST().packs.left <= 0) return;
  U.pack = { phase: 'closed' }; document.body.classList.add('noscroll'); paintPack(); Snd.tap();
};
ACT['pack-again'] = () => { if (ST().packs.left > 0) { U.pack = { phase: 'closed' }; paintPack(); } else ACT['pack-close'](); };
ACT['pack-close'] = () => { closeCeleb(); render(); scheduleCeleb(300); };
ACT['pack-tear'] = () => {
  const p = U.pack; if (!p || p.phase !== 'closed') return;
  const album = S.prog.album, foil = S.prog.foil;
  const fresh = STICKERS.filter(s => album.indexOf(s.id) < 0), noFoil = STICKERS.filter(s => foil.indexOf(s.id) < 0);
  if (!fresh.length && !noFoil.length) return;
  const b = snap(U.today), bonus0 = stickerBonus(S.prog);
  const s = pickSticker(fresh.length ? fresh : noFoil), kind = fresh.length ? 'new' : 'foil';
  if (kind === 'new') album.push(s.id); else foil.push(s.id);
  U.newSticker = s.id; markChanged(); persist('cfg/progress');
  p.bonusNew = stickerBonus(S.prog) - bonus0;
  afterMutation(U.today, b);
  p.phase = 'tearing'; paintPack(); Snd.pack(); Hap.go([20, 30, 20, 30, 60]);
  setTimeout(() => {
    if (U.pack !== p) return;
    p.phase = 'opened'; p.sticker = s; p.kind = kind; paintPack(); FX.party(['✨', '💎']); Snd.sparkle();
  }, stillMotion() ? 50 : 900);
};
ACT.sticker = el => {
  const s = STICKER_BY[el.dataset.id]; if (!s) return;
  const got = (S.prog.album || []).indexOf(s.id) >= 0, foil = (S.prog.foil || []).indexOf(s.id) >= 0, R = RARITY[s.rar];
  openSheet('<h2>' + (got ? esc(s.name) : 'Noch nicht gefunden') + '</h2><div class="stbig-wrap">' + stickerBig(s, got, foil) + '</div>' +
    '<p class="sub">' + (got ? s.cat + ' · ' + R.name + ' · ' + punkte(R.pts) + (foil ? ' · Glanz' : '') : R.name + '. Alle ' + S.cfg.packEvery + ' Diamanten gibt es einen Zauberbeutel.') + '</p>' + (got ? '<p class="sub fact">' + esc(s.fact) + '</p>' : '') +
    '<button class="btn btn-ghost" data-act="sheet-close">Schließen</button>', 'sheet-st');
};

/* ---------- Konto: Gutschreiben, Abbuchen, Auszahlen (wie in der Torjäger-App) ---------- */
const KX_TITLE = { plus: 'Gutschreiben', minus: 'Abbuchen', pay: 'Auszahlen' };
const KX_CHIPS = { plus: ['Taschengeld', 'Geschenk', 'Oma und Opa', 'Extra-Hilfe'], minus: ['Spielzeug', 'Buch', 'Eis', 'Kleinigkeit'], pay: [] };
const KX_AMOUNTS = [50, 100, 200, 500, 1000];
function kxAfter() {
  const x = U.kx; if (!x) return '';
  const c = parseMoney(x.amt), bal = kontoBalance(S);
  if (c == null) return 'Bitte einen Betrag eintragen, zum Beispiel 2,50.';
  const after = x.k === 'plus' ? bal + c : bal - c;
  return after < 0 ? 'Das Guthaben reicht nicht: Es sind nur ' + fmtEUR(bal) + ' auf dem Konto.' : 'Danach auf dem Konto: ' + fmtEUR(after);
}
function kontoSheetHTML() {
  const x = U.kx, k = x.k, nm = esc(S.cfg.name);
  const sub = {
    plus: 'Für Taschengeld, ein Geschenk oder eine vereinbarte Extra-Hilfe.',
    minus: 'Du hast etwas für ' + nm + ' gekauft. Der Betrag wird vom Konto abgebucht.',
    pay: 'Du gibst ' + nm + ' Geld in die Hand oder ins Sparschwein. Der Betrag wird vom Konto abgebucht.',
  }[k];
  let h = '<h2 class="h-ic">' + coinSVG(34) + KX_TITLE[k] + '</h2><p class="sub">' + sub + '</p>';
  h += '<div class="field"><span>Betrag in Euro</span><input type="text" inputmode="decimal" id="kx-amt" data-kx="amt" value="' + esc(x.amt) + '" maxlength="8" autocomplete="off" placeholder="z. B. 2,50"></div>';
  if (k !== 'pay') h += '<div class="chips-r" role="group" aria-label="Schnellauswahl Betrag">' + KX_AMOUNTS.map(v => '<button data-act="kx-amt" data-c="' + v + '">' + fmtEUR(v) + '</button>').join('') + '</div>';
  h += '<div class="field"><span>' + (k === 'pay' ? 'Notiz (freiwillig)' : 'Wofür?') + '</span><input type="text" id="kx-text" data-kx="t" value="' + esc(x.t) + '" maxlength="40" autocomplete="off"></div>';
  if (KX_CHIPS[k].length) h += '<div class="chips-r" role="group" aria-label="Schnellauswahl">' + KX_CHIPS[k].map(t => '<button data-act="kx-chip" data-t="' + esc(t) + '" aria-pressed="' + (x.t === t) + '">' + esc(t) + '</button>').join('') + '</div>';
  if (k === 'minus') h += switchRow('kx-ok', x.ok, nm + ' hat dazu Ja gesagt', 'Abgebucht wird nur, was ' + nm + ' sich selbst wünscht, nie etwas, das ihr ohnehin bezahlt.');
  h += '<p class="hint" id="kx-after">' + esc(kxAfter()) + '</p>';
  h += '<div class="row-btns"><button class="btn btn-main" data-act="kx-save">' + KX_TITLE[k] + '</button><button class="btn btn-ghost" data-act="sheet-close">Abbrechen</button></div>';
  return h;
}
ACT['konto-open'] = el => {
  if (!U.unlocked || U.readonly) return;
  const k = el.dataset.k, bal = kontoBalance(S);
  if ((k === 'minus' || k === 'pay') && bal <= 0) { toast('Auf dem Konto ist nichts, das sich abbuchen lässt.'); return; }
  U.kx = { k, amt: k === 'pay' ? fmtPlain(bal) : '', t: k === 'pay' ? 'Ausgezahlt' : '', ok: false };
  openSheet(kontoSheetHTML(), 'sheet-konto');
};
ACT['kx-amt'] = el => { U.kx.amt = fmtPlain(+el.dataset.c); setSheet(kontoSheetHTML()); };
ACT['kx-ok'] = () => { U.kx.ok = !U.kx.ok; setSheet(kontoSheetHTML()); };
ACT['kx-chip'] = el => { U.kx.t = U.kx.t === el.dataset.t ? '' : el.dataset.t; setSheet(kontoSheetHTML()); };
ACT['kx-save'] = () => {
  const x = U.kx; if (!x || !U.unlocked || U.readonly) return;
  const c = parseMoney(x.amt), bal = kontoBalance(S), k = x.k;
  if (c == null) { toast('Bitte einen Betrag über 0 eintragen, zum Beispiel 2,50.'); return; }
  if (k === 'minus' && !x.ok) { toast('Bitte bestätigen: ' + S.cfg.name + ' hat dazu Ja gesagt.'); return; }
  if ((k === 'minus' || k === 'pay') && c > bal) { toast('Das Guthaben reicht nicht: Es sind nur ' + fmtEUR(bal) + ' auf dem Konto.', 'warn'); return; }
  const ts = Date.now(), id = 'k' + ts.toString(36) + rid(), t = (x.t || '').trim().slice(0, 40), credit = k === 'plus';
  const en = { ts, ds: U.today, c: credit ? c : -c, k };
  if (t) en.t = t;
  S.konto[id] = en; markChanged(); persist('konto/' + id);
  U.kx = null; closeSheet(); render();
  const now = kontoBalance(S);
  if (credit) { Snd.gem(); FX.pop(innerWidth / 2, innerHeight / 2, ['🪙', '✨']); } else Snd.soft();
  banner({ icon: coinSVG(42), title: esc((credit ? '+' : '−') + fmtEUR(c) + (credit ? ' gutgeschrieben' : k === 'pay' ? ' ausgezahlt' : ' abgebucht')), sub: esc(kontoTitle(en)) + ' · Guthaben jetzt ' + esc(fmtEUR(now)), tone: credit ? 'gold' : '', ms: 3600 });
};
ACT['konto-del'] = el => {
  if (!U.unlocked || U.readonly) return;
  const id = el.dataset.id, en = S.konto[id]; if (!en) return;
  confirmSheet({ title: 'Buchung löschen?', text: kontoTitle(en) + ' (' + (en.c < 0 ? '−' : '+') + fmtEUR(Math.abs(en.c)) + '). Das Guthaben ändert sich entsprechend.', ok: 'Löschen', danger: true }, () => {
    delete S.konto[id];
    Object.keys(S.prog.redK || {}).forEach(g => { if (S.prog.redK[g] === id) { delete S.prog.redK[g]; persist('cfg/progress'); } });
    markChanged(); persist('konto/' + id); render(); toast('Buchung gelöscht.');
  });
};

/* ---------- Regeln (für das Kind) und Hinweise für Eltern ---------- */
function rulesHTML() {
  const c = S.cfg, nm = esc(c.name);
  return '<h2 class="h-ic">' + gemMini(30) + 'So geht das Diamanten-Reich</h2><p class="sub">Zum Vorlesen für Mama oder Papa.</p>' +
    '<div class="rb"><h3>' + IC.hand + ' Geschafft!</h3><p>Hast du eine Aufgabe geschafft, trägst du sie mit Mama oder Papa ein. Für jedes <b>Geschafft</b> bekommst du einen <b>Diamanten</b>.</p>' +
    '<h3>' + IC.shovel + ' Graben</h3><p>Jeder Diamant steckt in der Erde. Tipp auf <b>Graben!</b>, dann holt die Schatzgräberin ihn heraus und legt ihn in deine Truhe.</p>' +
    '<h3>' + gemMini(20) + ' Schätze</h3><p>Für viele Diamanten findest du Schätze mit einer Belohnung. Alle ' + c.packEvery + ' Diamanten gibt es einen <b>Zauberbeutel</b> mit einem Sticker.</p>' +
    '<h3>' + IC.coin + ' Konto</h3><p>Manche Schätze bringen Geld auf dein <b>Konto</b>. Das Geld gehört dir. Abgebucht wird nur, wenn du dir etwas wünschst und Ja sagst.</p>' +
    '<h3>' + IC.sparkle + ' Spielwiese</h3><p>Auf der <b>Spielwiese</b> kannst du Memory, Hütchen und Sternenregen spielen. Das ist nur zum Spaß.</p>' +
    '<h3>' + cloudSVG('yellow', 26) + ' Wolken</h3><p>Eine <b>gelbe Wolke</b> ist eine Warnung. Zwei gelbe Wolken werden zur <b>Gewitterwolke</b>. Dann gehen ein paar Diamanten bei den Schätzen ab. Deine Truhe bleibt aber voll.</p>' +
    '<p><b>Wir haben dich lieb, ' + nm + ', egal was passiert.</b></p></div>' +
    '<button class="btn btn-ghost btn-block" data-act="sheet-close">Schließen</button>';
}
ACT.rules = () => openSheet(rulesHTML(), 'sheet-rules');
function parentsHTML() {
  const c = S.cfg, nm = esc(c.name);
  return '<h2>Hinweise für Eltern</h2><p class="sub">Mit fünf, sechs Jahren wirkt Lob viel stärker als Abzug. Wolken sind die Ausnahme, nicht der Alltag.</p><ol class="rb-ol">' +
    '<li><b>Gemeinsam anfangen:</b> Zeigt ' + nm + ' die App in Ruhe, lest ihr die Regeln vor (Knopf „Regeln“ bei den Extras) und sucht die Belohnungen zusammen aus.</li>' +
    '<li><b>Lob zuerst:</b> Eintragen möglichst bald und mit einem Satz dazu („Du hast dich ganz allein angezogen!“). Die App ersetzt kein Lob.</li>' +
    '<li><b>Wolken sparsam:</b> Am besten die erste Woche ganz ohne. Nie für Gefühle (Weinen, Wut, Angst), nie für Missgeschicke, nie im Streit oder vor dem Schlafen.</li>' +
    '<li><b>Belohnungen nie zurücknehmen</b> und zeitnah einlösen. Essen, Schlaf, Kuscheln und gemeinsame Zeit sind nie Belohnung und nie Entzug.</li>' +
    '<li><b>Hürde passend halten:</b> Klappt etwas tagelang nicht, ist die Aufgabe zu schwer. Dann kürzen oder teilen, nicht strenger werden.</li>' +
    '<li><b>Warnzeichen:</b> Bauchweh, „Ich bin eh böse“, Rückzug. Dann Wolken pausieren, reden, bei Sorgen Beratung suchen.</li></ol>' +
    (c.cloudsAck ? '<button class="btn btn-ghost btn-block" data-act="sheet-close">Schließen</button>'
      : '<button class="btn btn-main btn-block sticky-act" data-act="clouds-ack">Gelesen: Wolken freischalten</button><button class="btn btn-ghost btn-block" data-act="sheet-close">Später</button>');
}
ACT.parents = () => openSheet(parentsHTML(), 'sheet-rules');
ACT['clouds-unlock'] = () => { if (!U.unlocked) return; openSheet(parentsHTML(), 'sheet-rules'); };
ACT['clouds-ack'] = () => { S.cfg.cloudsAck = true; markChanged(); persist('cfg/main'); closeSheet(); render(); toast('Wolken sind freigeschaltet.'); };

/* ---------- Eltern-Modus und Code ---------- */
async function hashPin(pin) {
  try {
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('diamanten|' + pin));
    return 'h:' + Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) { return 'p:' + pin; }
}
const checkPin = async p => { const c = S.cfg.pin; return c === 'p:' + p || c === (await hashPin(p)); };
function pinHTML(mode, msg) {
  const t = { enter: 'Eltern-Code', set: 'Neuen Code festlegen', again: 'Code wiederholen' }[mode];
  const sub = msg || { enter: 'Nur Mama und Papa geben Diamanten frei.', set: 'Vier Ziffern. Der Code schützt nur vor versehentlichem Tippen.', again: 'Noch einmal zur Sicherheit.' }[mode];
  return '<h2>' + t + '</h2><p class="sub">' + sub + '</p><div class="pin-dots" id="pindots" aria-live="polite">' + [0, 1, 2, 3].map(i => '<i' + (i < U.pin.length ? ' class="on"' : '') + '></i>').join('') + '</div>' +
    '<div class="pad4">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button data-act="pin-key" data-n="' + n + '">' + n + '</button>').join('') +
    '<button class="ghost" data-act="sheet-close">Zurück</button><button data-act="pin-key" data-n="0">0</button><button class="ghost" data-act="pin-del" aria-label="Löschen">⌫</button></div>';
}
function openPin(mode) { U.pin = ''; U.pinMode = mode; U.pinFirst = ''; openSheet(pinHTML(mode), 'sheet-pin'); }
const paintPin = () => $$('#pindots i').forEach((d, i) => d.classList.toggle('on', i < U.pin.length));
function badPin() {
  const d = $('#pindots'); if (d) { d.classList.add('bad'); setTimeout(() => { d.classList.remove('bad'); U.pin = ''; paintPin(); }, 450); }
  Snd.soft(); Hap.go([30, 40, 30]);
}
ACT['pin-del'] = () => { U.pin = U.pin.slice(0, -1); paintPin(); };
ACT['pin-key'] = async el => {
  if (U.pin.length >= 4) return;
  U.pin += el.dataset.n; Snd.tap(); paintPin();
  if (U.pin.length < 4) return;
  const entered = U.pin;
  if (U.pinMode === 'enter') {
    if (await checkPin(entered)) { U.sheet = null; closeSheet(); U.unlocked = true; U.last = Date.now(); render(); toast('Eltern-Modus an.'); } else badPin();
  } else if (U.pinMode === 'set') {
    U.pinFirst = entered; U.pin = ''; U.pinMode = 'again'; setSheet(pinHTML('again'));
  } else if (entered === U.pinFirst) {
    S.cfg.pin = await hashPin(entered); markChanged(); persist('cfg/main'); closeSheet(); render(); toast('Code gespeichert.');
  } else { U.pin = ''; U.pinMode = 'set'; setSheet(pinHTML('set', 'Das war nicht gleich. Bitte noch einmal von vorn.')); }
};
function lockNow() { U.unlocked = false; U.editTask = null; render(); }
ACT.lock = () => {
  if (U.readonly) return;
  if (U.unlocked) { lockNow(); toast('Eltern-Modus beendet.'); return; }
  if (!S.cfg.pin) { U.unlocked = true; U.last = Date.now(); render(); toast('Eltern-Modus an.'); return; }
  openPin('enter');
};
ACT['pin-set'] = () => openPin('set');
ACT['pin-clear'] = () => confirmSheet({ title: 'Code entfernen?', text: 'Dann kann ' + S.cfg.name + ' selbst Diamanten freigeben.', ok: 'Code entfernen', danger: true }, () => { S.cfg.pin = ''; markChanged(); persist('cfg/main'); render(); });

/* ---------- Navigation ---------- */
ACT.tab = el => { U.tab = el.dataset.tab; window.scrollTo(0, 0); render(); };
ACT.day = el => { U.date = el.dataset.date; if (el.dataset.go) { U.tab = 'today'; window.scrollTo(0, 0); } render(); };
ACT['goto-today'] = () => { U.date = U.today; render(); };
ACT['all-goals'] = () => { U.allGoals = true; render(); };
ACT.wk = el => { U.weekOff = clamp(U.weekOff + (+el.dataset.d), -52, 0); render(); };

/* ---------- Einrichtung (Start) ---------- */
function obHTML() {
  const o = U.ob;
  return '<h2>Willkommen im Diamanten-Reich!</h2><p class="sub">Richtet zusammen die Schatzgräberin ein. Das dauert eine Minute.</p>' +
    '<div class="ob-prev">' + girlSVG(o.look, 130) + unicornSVG(84) + '</div>' +
    '<div class="field"><span>Name</span><input type="text" id="ob-name" data-ob="name" value="' + esc(o.name) + '" maxlength="20" autocomplete="off"></div>' +
    lookPickers(o.look, 'ob-look') +
    '<div class="field"><span>Name des Einhorns</span><input type="text" id="ob-uni" data-ob="unicorn" value="' + esc(o.unicorn) + '" maxlength="20" autocomplete="off"></div>' +
    '<div class="field"><span>Eltern-Code (empfohlen)</span><input type="tel" inputmode="numeric" id="ob-pin" data-ob="pin" value="' + esc(o.pin) + '" maxlength="4" placeholder="4 Ziffern" autocomplete="off"><small>Mit Code können nur Mama und Papa Diamanten freigeben.</small></div>' +
    '<button class="btn btn-main btn-block sticky-act" data-act="ob-go">Los geht\'s!</button>';
}
function openOnboard() { U.ob = { name: S.cfg.name, unicorn: S.cfg.unicorn, look: Object.assign({}, S.cfg.look), pin: '' }; openSheet(obHTML(), 'onboard'); }
ACT['ob-look'] = el => { U.ob.look[el.dataset.k] = el.dataset.v; const y = ($('.sheet') || {}).scrollTop; setSheet(obHTML()); const s = $('.sheet'); if (s && y) s.scrollTop = y; };
ACT['ob-go'] = async () => {
  const o = U.ob; if (!o) return;
  const c = S.cfg;
  c.name = (o.name || '').trim().slice(0, 20) || 'Lia';
  c.unicorn = (o.unicorn || '').trim().slice(0, 20) || 'Funkelstern';
  c.look = Object.assign({}, o.look);
  if (/^\d{4}$/.test(o.pin || '')) c.pin = await hashPin(o.pin);
  S.prog.packN = 1;
  U.hasCfg = true; markChanged(); persist('cfg/main'); persist('cfg/progress');
  U.sheet = null; closeSheet(); render();
  Snd.fanfare(); FX.party(['💎', '✨', '🦄']);
  banner({ icon: girlHeadSVG(c.look, 44), title: 'Willkommen, ' + esc(c.name) + '!', sub: 'Ein Zauberbeutel wartet schon. Tippe hier.', tone: 'violet', ms: 7000, go: 'achieve' });
};

/* ---------- Einstellungen ---------- */
function stepTarget(obj) {
  const [kind, id] = obj.split(':');
  if (kind === 'cfg') return S.cfg;
  if (kind === 'goal') return S.cfg.goals.find(g => g.id === id);
  if (kind === 'task') return taskById(id);
  return null;
}
ACT.step = el => {
  const o = stepTarget(el.dataset.obj), key = el.dataset.key; if (!o) return;
  let v = clamp((+o[key] || 0) + (+el.dataset.d), +el.dataset.min, +el.dataset.max);
  if (el.dataset.obj.indexOf('goal:') === 0) {
    const gs = S.cfg.goals, i = gs.indexOf(o);
    v = Math.max(v, i > 0 ? gs[i - 1].at + 1 : 1);
    if (i < gs.length - 1) v = Math.min(v, gs[i + 1].at - 1);
  }
  o[key] = v; if (key === 'digTaps') U.dig.taps = 0;
  markChanged(); persist('cfg/main', 400); render();
};
ACT['dig-mode'] = () => { S.cfg.digMode = S.cfg.digMode === false; U.dig.taps = 0; markChanged(); persist('cfg/main'); render(); };
ACT['dig-fun'] = () => { S.cfg.digFun = S.cfg.digFun === false; markChanged(); persist('cfg/main'); render(); };
ACT.sound = () => {
  U.muted = !U.muted; Snd.setMuted(U.muted);
  try { localStorage.setItem('dia-muted', U.muted ? '1' : '0'); } catch (e) { /* nur Komfort */ }
  if (!U.muted) Snd.sparkle();
  render();
};
ACT.games = () => { S.cfg.games = S.cfg.games === false; markChanged(); persist('cfg/main'); render(); };
ACT.look = el => { S.cfg.look[el.dataset.k] = el.dataset.v; markChanged(); persist('cfg/main'); render(); };
ACT['task-edit'] = el => { U.editTask = U.editTask === el.dataset.id ? null : el.dataset.id; render(); };
ACT.emoji = el => { const t = taskById(el.dataset.id); if (t) { t.icon = el.dataset.e; markChanged(); persist('cfg/main'); render(); } };
ACT['task-slot'] = el => { const t = taskById(el.dataset.id); if (t && SLOTS[el.dataset.v]) { t.slot = el.dataset.v; markChanged(); persist('cfg/main'); render(); } };
ACT['task-day'] = el => {
  const t = taskById(el.dataset.id); if (!t) return;
  const d = +el.dataset.d, i = t.days.indexOf(d);
  if (i >= 0) { if (t.days.length > 1) t.days.splice(i, 1); } else t.days.push(d);
  markChanged(); persist('cfg/main'); render();
};
/* Verschieben innerhalb der eigenen Tageszeit: mit der nächsten sichtbaren Aufgabe derselben Tageszeit tauschen. */
ACT['task-move'] = el => {
  const ts = S.cfg.tasks, t = taskById(el.dataset.id); if (!t) return;
  const same = ts.filter(x => x.slot === t.slot && !(x.until && x.until <= U.today));
  const j = same.indexOf(t) + (+el.dataset.d); if (j < 0 || j >= same.length) return;
  const a = ts.indexOf(t), b = ts.indexOf(same[j]);
  ts[a] = same[j]; ts[b] = t; markChanged(); persist('cfg/main'); render();
};
const newTask = (icon, title) => ({ id: 't_' + Date.now().toString(36) + rid(), icon, title, slot: new Date().getHours() < 13 ? 'morgens' : 'abends', pts: 1, days: [0, 1, 2, 3, 4, 5, 6], from: U.today });
ACT['task-add'] = () => { const t = newTask('⭐', 'Neue Aufgabe'); S.cfg.tasks.push(t); U.editTask = t.id; markChanged(); persist('cfg/main'); render(); };
ACT['task-idea'] = el => {
  const idea = TASK_IDEAS[+el.dataset.i]; if (!idea) return;
  const t = newTask(idea[0], idea[1]); S.cfg.tasks.push(t); U.editTask = t.id; markChanged(); persist('cfg/main'); render();
  toast('„' + idea[1] + '“ ist angelegt. Tageszeit und Wochentage kannst du jetzt anpassen.');
};
ACT['goto-sec'] = el => {
  if (!U.unlocked) return;
  const id = 'sec-' + el.dataset.sec;
  if (U.tab !== 'coach') { U.tab = 'coach'; render(); }
  requestAnimationFrame(() => { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: stillMotion() ? 'auto' : 'smooth', block: 'start' }); });
};
ACT['task-del'] = el => {
  const id = el.dataset.id, t = taskById(id); if (!t) return;
  const used = Object.keys(S.days).some(ds => S.days[ds].m && S.days[ds].m[id]);
  confirmSheet({ title: 'Aufgabe entfernen?', text: used ? 'Bisherige Diamanten bleiben erhalten. Ab morgen erscheint die Aufgabe nicht mehr.' : 'Die Aufgabe wurde noch nie eingetragen und wird ganz gelöscht.', ok: 'Entfernen', danger: true }, () => {
    if (used) t.until = addDays(U.today, 1); else S.cfg.tasks = S.cfg.tasks.filter(x => x.id !== id);
    U.editTask = null; markChanged(); persist('cfg/main'); render();
  });
};
ACT['reset-ask'] = () => confirmSheet({ title: 'Alles zurücksetzen?', text: 'Alle Tage, Diamanten, Wolken, Sticker, Buchungen auf dem Konto und Einstellungen werden gelöscht. Das lässt sich nicht rückgängig machen.', ok: 'Ja, alles löschen', danger: true }, resetAll);
async function resetAll() {
  const ids = Object.keys(S.days), kids = Object.keys(S.konto || {});
  S.days = {}; S.konto = {}; S.cfg = defaultCfg(); S.prog = normProg(); markChanged();
  U.unlocked = false; U.editTask = null; U.bars = {}; U.celebQ = []; U.dig = { taps: 0 }; U.hasCfg = false;
  render();
  for (const id of ids) await flushKey('days/' + id);
  for (const id of kids) await flushKey('konto/' + id);
  await flushKey('cfg/main'); await flushKey('cfg/progress');
  openOnboard();
}

/* Eingabefelder: Zustand sofort, Speichern gebündelt */
function bindInput(el) {
  const v = el.value, parts = (el.dataset.bind || '').split(':');
  const c = S.cfg;
  if (parts[0] === 'cfg') c[parts[1]] = v.slice(0, 20);
  else if (parts[0] === 'task') { const t = taskById(parts[1]); if (t) t[parts[2]] = v.slice(0, 40); }
  else if (parts[0] === 'goal') { const g = c.goals.find(x => x.id === parts[1]); if (!g) return; g.reward = v.slice(0, 120); }
  else if (parts[0] === 'chest') c.chest[parts[1]] = v.slice(0, 40);
  else if (parts[0] === 'list') c[parts[1]] = v.split('\n').map(x => x.trim()).filter(Boolean);
  else return;
  markChanged(); persist('cfg/main', 700);
}

/* ---------- Zeit: Tageswechsel, automatisches Sperren ---------- */
function tick() {
  const t = todayStr();
  if (t !== U.today) {
    const wasToday = U.date === U.today;
    U.today = t; if (wasToday) U.date = t;
    markChanged(); if (U.ready) render();
  }
  if (U.unlocked && Date.now() - U.last > 180000) { lockNow(); toast('Eltern-Modus wurde gesperrt.'); }
}
function afterLoad() {
  U.today = todayStr(); if (!S.days[U.date]) U.date = U.today;
  if (Store.migrated && !U.readonly && U.hasCfg) { Store.migrated = false; persist('cfg/main'); }
  if (!U.readonly && !U.hasCfg && !Store.noAccess) openOnboard();
}

/* ---------- Ereignisse ---------- */
function bindEvents() {
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]'); if (!el) return;
    Snd.wake(); U.last = Date.now();
    const fn = ACT[el.dataset.act];
    if (fn) fn(el, ev);
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && U.sheet && U.sheet !== 'onboard') closeSheet();
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('stage')) { ev.preventDefault(); ACT.dig(); }
  });
  document.addEventListener('input', ev => {
    const el = ev.target;
    if (el.dataset && el.dataset.bind) bindInput(el);
    else if (el.dataset && el.dataset.ex && U.ex) U.ex.t = el.value;
    else if (el.dataset && el.dataset.kx && U.kx) { U.kx[el.dataset.kx] = el.value; const a = $('#kx-after'); if (a) a.textContent = kxAfter(); }
    else if (el.dataset && el.dataset.ob && U.ob) {
      const k = el.dataset.ob; U.ob[k] = k === 'pin' ? el.value.replace(/\D/g, '').slice(0, 4) : el.value;
      if (k === 'pin' && el.value !== U.ob.pin) el.value = U.ob.pin;
    }
  });
  document.addEventListener('focusin', ev => { const g = ev.target.dataset && ev.target.dataset.goalId; if (g) U.lastGoal = g; });
  document.addEventListener('change', ev => { if (ev.target.dataset && ev.target.dataset.bind) persist('cfg/main'); });
  document.addEventListener('contextmenu', ev => { if (ev.target.closest('.digbtn, .stage')) ev.preventDefault(); });
  /* Gedrückt halten (ab 0,6 s) gräbt alle wartenden Diamanten aus. */
  document.addEventListener('pointerdown', ev => { if (ev.target.closest('.digbtn')) { U.holdAt = performance.now(); const b = $('.digbtn'); if (b) b.classList.add('charging'); Snd.wake(); } });
  const endHold = ev => {
    if (U.holdAt == null) return;
    const held = performance.now() - U.holdAt; U.holdAt = null;
    const b = $('.digbtn'); if (b) b.classList.remove('charging');
    if (held >= 600 && ST().waiting > 1 && ev.type === 'pointerup') { U.suppressClick = true; setTimeout(() => { U.suppressClick = false; }, 450); digAll(); }
  };
  document.addEventListener('pointerup', endHold); document.addEventListener('pointercancel', endHold);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { U.hiddenAt = Date.now(); if (typeof gamePause === 'function') gamePause(); }
    else { if (U.unlocked && U.hiddenAt && Date.now() - U.hiddenAt > 60000) lockNow(); tick(); }
  });
}

/* ---------- Web-App: Familienlink ---------- */
ACT['link-save'] = () => {
  const inp = $('#link-in'), err = $('#link-err'), c = parseFamilyLink(inp ? inp.value : '');
  if (!c) { if (err) err.hidden = false; return; }
  saveCred(c);
  try { history.replaceState(null, '', location.pathname + '#c=' + b64urlEncode(JSON.stringify({ k: c.k, f: c.f, e: c.e || undefined }))); } catch (e) { /* egal */ }
  location.reload();
};
ACT['link-reset'] = async () => {
  try { if (Store.fs) { await FB.terminate(Store.fs); await FB.clearIndexedDbPersistence(Store.fs); } } catch (e) { /* egal */ }
  forgetCred();
  try { history.replaceState(null, '', location.pathname); } catch (e) { /* egal */ }
  location.reload();
};
ACT['link-reset-ask'] = () => confirmSheet({ title: 'Dieses Gerät abmelden?', text: 'Der Familienlink wird von diesem Gerät entfernt. Der Stand selbst bleibt erhalten. Mit dem Link kommt ihr jederzeit wieder hinein.', ok: 'Abmelden' }, ACT['link-reset']);
ACT['link-share'] = async () => {
  if (!Store.cred) return;
  const url = familyLink(Store.cred);
  try { if (navigator.share) { await navigator.share({ title: 'Diamanten-Reich', text: 'Familienlink für die Diamanten-App', url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); toast('Familienlink kopiert. Schickt ihn nur an die Familie.'); return; } catch (e) { /* Zwischenablage nicht erlaubt: Link zum Kopieren zeigen */ }
  openSheet('<h2>Familienlink</h2><p class="sub">Markieren und kopieren. Schickt ihn nur an die Familie.</p><textarea class="linkbox" readonly rows="5" id="link-out">' + esc(url) + '</textarea><button class="btn btn-ghost" data-act="sheet-close">Schließen</button>', 'sheet-link');
  const t = $('#link-out'); if (t) { t.focus(); t.select(); }
};
ACT.reload = () => location.reload();
ACT['a2hs-close'] = () => { try { localStorage.setItem('dia-hint-a2hs', '1'); } catch (e) { /* egal */ } render(); };

function boot() {
  document.body.insertAdjacentHTML('afterbegin', SVG_DEFS);
  try {
    U.muted = localStorage.getItem('dia-muted') === '1';
  } catch (e) { /* ohne Speicher geht es auch */ }
  Snd.setMuted(U.muted);
  FX.init(); bindEvents(); render();
  setInterval(tick, 20000);
  if (window.__PWA__ && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Hülle geht es auch */ });
  initStore();
}
