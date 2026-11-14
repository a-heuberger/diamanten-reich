/* ============ Spielwiese: Mini-Spiele nur zum Spaß ============
   Memory (Paare finden), Hütchen (Wo ist der Diamant?) und Sternenregen (fallende Diamanten fangen).
   Keines bringt Diamanten, keines kennt Verlieren: Es gibt nur „Nochmal!“. Bestwerte stehen in cfg/progress (prog.games).
   Die Spiele laufen in einem Fenster (Sheet „sheet-game“); Schließen beendet alle Zeitgeber (gameStop, aus closeSheet). */
let gameTimers = [];
const gLater = (fn, ms) => { const t = setTimeout(fn, ms); gameTimers.push(t); return t; };
function gameStop() {
  gameTimers.forEach(clearTimeout); gameTimers = [];
  if (U.game && U.game.raf) cancelAnimationFrame(U.game.raf);
  U.game = null; window.__game = null;
}
/* App im Hintergrund: Sternenregen endet sofort (sonst liefe die Zeit unsichtbar ab). */
function gamePause() { if (U.game && U.game.id === 'catch' && U.game.phase === 'play') catchEnd(); }
const gameAlive = g => U.game === g && U.sheet === 'sheet-game';
function gameBest(id) { return ((S.prog.games || {})[id]); }
/* Merkt sich einen neuen Bestwert (better: neu besser als alt?). Liefert true bei neuem Rekord. */
function gameRecord(id, v, better) {
  const gs = S.prog.games || (S.prog.games = {}), old = gs[id];
  if (old != null && !better(v, old)) return false;
  gs[id] = v; markChanged();
  if (!U.readonly) persist('cfg/progress');
  return old != null;
}
const GAME_TITLE = { memory: 'Edelstein-Memory', cups: 'Wo ist der Diamant?', catch: 'Sternenregen' };
function gameShell(id, inner, foot) {
  return '<div class="g-head"><h2>' + GAME_TITLE[id] + '</h2><button class="g-x" data-act="sheet-close" aria-label="Spiel schließen">' + IC.cross + '</button></div>' +
    '<div class="g-body" id="gbody">' + inner + '</div><div class="g-foot" id="gfoot">' + (foot || '') + '</div>';
}
const setFoot = h => { const f = $('#gfoot'); if (f) f.innerHTML = h; };
const doneFoot = (msg, again) => '<p class="g-msg">' + msg + '</p><div class="row-btns"><button class="btn btn-main" data-act="' + again + '">Nochmal!</button><button class="btn btn-ghost" data-act="sheet-close">Fertig</button></div>';

ACT['game-open'] = el => {
  const id = el.dataset.game;
  if (!GAME_TITLE[id]) return;
  gameStop();
  openSheet(gameShell(id, '', ''), 'sheet-game');
  ({ memory: memStart, cups: cupsStart, catch: catchStart })[id]();
};

/* ---------- Memory: 6 Paare, Karten umdrehen ---------- */
const MEM_POOL = ['gem:rosa', 'gem:tuerkis', 'gem:topas', 'gem:smaragd', 'gem:saphir', 'gem:amethyst', '🦄', '👑', '🌈', '🦋', '🐬', '🌸', '🧚', '🏰'];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
const memFace = v => (v.indexOf('gem:') === 0 ? gemSVG(v.slice(4), 54) : '<span class="emo">' + v + '</span>');
function memStart() {
  const pick = shuffle(MEM_POOL.slice()).slice(0, 6);
  const g = U.game = { id: 'memory', cards: shuffle(pick.concat(pick)).map(v => ({ v, open: false, done: false })), first: -1, lock: false, moves: 0, found: 0 };
  window.__game = g;
  const b = $('#gbody'); if (!b) return;
  b.innerHTML = '<div class="mem-grid">' + g.cards.map((c, i) => '<button class="mcard" data-act="mem-flip" data-i="' + i + '" aria-label="Karte ' + (i + 1) + '"><span class="mc-in"><span class="mc-back">' + sparkleSVG(30, '#ffffff') + '</span><span class="mc-front">' + memFace(c.v) + '</span></span></button>').join('') + '</div>';
  const best = gameBest('memory');
  setFoot('<p class="g-msg">Finde die Paare! Tippe zwei Karten an.' + (best ? ' Rekord: ' + best + ' Züge.' : '') + '</p>');
}
function memPaint(i) {
  const g = U.game, c = g.cards[i], el = $('.mcard[data-i="' + i + '"]'); if (!el) return;
  el.classList.toggle('open', c.open || c.done); el.classList.toggle('done', c.done);
}
ACT['mem-flip'] = el => {
  const g = U.game; if (!g || g.id !== 'memory' || g.lock) return;
  const i = +el.dataset.i, c = g.cards[i]; if (!c || c.open || c.done) return;
  c.open = true; memPaint(i); Snd.tap();
  if (g.first < 0) { g.first = i; return; }
  const j = g.first, d = g.cards[j]; g.first = -1; g.moves++;
  if (d.v === c.v) {
    c.done = d.done = true; g.found++;
    gLater(() => { if (!gameAlive(g)) return; memPaint(i); memPaint(j); Snd.gem(); const r = el.getBoundingClientRect(); FX.pop(r.left + r.width / 2, r.top + r.height / 2, ['✨']); if (g.found === g.cards.length / 2) memDone(g); }, 250);
  } else {
    g.lock = true;
    gLater(() => { if (!gameAlive(g)) return; c.open = d.open = false; memPaint(i); memPaint(j); g.lock = false; Snd.soft(); }, 900);
  }
};
function memDone(g) {
  const rec = gameRecord('memory', g.moves, (a, b) => a < b);
  g.over = true;
  Snd.fanfare(); FX.party(['💎', '✨', '🦄']); Hap.go([30, 40, 30]);
  setFoot(doneFoot('<b>Alle Paare gefunden!</b> ' + g.moves + ' Züge.' + (rec ? ' Neuer Rekord!' : ''), 'mem-again'));
}
ACT['mem-again'] = () => { gameStop(); U.sheet = 'sheet-game'; memStart(); };

/* ---------- Hütchen: Der Diamant liegt unter einem von drei Hütchen, die Hütchen werden vertauscht ---------- */
const cupSVG = () => '<svg viewBox="0 0 100 96" aria-hidden="true" focusable="false"><path d="M18 90 32 14Q50 2 68 14L82 90z" fill="#ff8fc1" stroke="#b5447a" stroke-width="3.5" stroke-linejoin="round"/>' +
  '<path d="M24 62q26 8 52 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".85"/><ellipse cx="50" cy="90" rx="34" ry="6" fill="#e0609d" stroke="#b5447a" stroke-width="3"/>' +
  '<path d="' + sparklePath(42, 36, 6) + '" fill="#fff"/><circle cx="50" cy="9" r="6" fill="url(#gGold)" stroke="#ad7706" stroke-width="2"/></svg>';
function cupsStart(keepStreak) {
  const prev = U.game && U.game.id === 'cups' ? U.game.streak : 0;
  const g = U.game = { id: 'cups', slots: [0, 1, 2], gem: Math.floor(Math.random() * 3), phase: 'show', streak: keepStreak ? prev : 0 };
  window.__game = g;
  const b = $('#gbody'); if (!b) return;
  b.innerHTML = '<div class="cups-stage">' + [0, 1, 2].map(c => '<div class="cupw" data-cup="' + c + '" style="left:' + (c * 33.333) + '%">' + (c === g.gem ? '<span class="cup-gem">' + gemSVG('weiss', 54) + '</span>' : '') +
    '<button class="cup up" data-act="cup-pick" data-cup="' + c + '" aria-label="Hütchen ' + (c + 1) + '" disabled>' + cupSVG() + '</button></div>').join('') + '</div>';
  setFoot('<p class="g-msg">' + (g.streak ? '<b>' + g.streak + '× gefunden!</b> ' : '') + 'Schau genau hin: Hier ist der Diamant!</p>');
  gLater(() => { if (!gameAlive(g)) return; $$('.cup').forEach(c => c.classList.remove('up')); Snd.soft(); }, 1300);
  gLater(() => { if (gameAlive(g)) cupsShuffle(g); }, 1800);
}
function cupsPlace(g) {
  $$('.cupw').forEach(w => { const c = +w.dataset.cup; w.style.left = (g.slots[c] * 33.333) + '%'; });
}
function cupsShuffle(g) {
  g.phase = 'shuffle';
  setFoot('<p class="g-msg">Die Hütchen tanzen …</p>');
  const n = 3 + Math.min(g.streak, 5), ms = Math.max(260, 480 - g.streak * 35);
  const stage = $('.cups-stage'); if (stage) stage.style.setProperty('--sw', ms + 'ms');
  let k = 0;
  const step = () => {
    if (!gameAlive(g)) return;
    if (k++ >= n) { g.phase = 'pick'; $$('.cup').forEach(c => { c.disabled = false; }); setFoot('<p class="g-msg"><b>Wo ist der Diamant?</b> Tippe auf ein Hütchen.</p>'); return; }
    const a = Math.floor(Math.random() * 3), b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
    const ca = g.slots.indexOf(a), cb = g.slots.indexOf(b);
    g.slots[ca] = b; g.slots[cb] = a; cupsPlace(g); Snd.tap();
    gLater(step, ms + 60);
  };
  step();
}
ACT['cup-pick'] = el => {
  const g = U.game; if (!g || g.id !== 'cups' || g.phase !== 'pick') return;
  const c = +el.dataset.cup; g.phase = 'reveal';
  $$('.cup').forEach(x => { x.disabled = true; });
  el.classList.add('up');
  if (c === g.gem) {
    g.streak++;
    const rec = gameRecord('cups', g.streak, (a, b) => a > b);
    Snd.gem(); Hap.go([20, 30, 20]);
    const r = el.getBoundingClientRect(); FX.pop(r.left + r.width / 2, r.top + r.height, ['💎', '✨']);
    setFoot(doneFoot('<b>Gefunden!</b> ' + (g.streak > 1 ? g.streak + '-mal hintereinander.' : 'Super aufgepasst!') + (rec ? ' Neuer Rekord!' : ''), 'cups-again'));
  } else {
    Snd.soft();
    gLater(() => { if (!gameAlive(g)) return; const right = $('.cup[data-cup="' + g.gem + '"]'); if (right) right.classList.add('up'); }, 500);
    g.streak = 0;
    setFoot(doneFoot('<b>Fast!</b> Hier war er versteckt. Nochmal?', 'cups-again'));
  }
};
ACT['cups-again'] = () => { const keep = U.game && U.game.id === 'cups'; gameTimers.forEach(clearTimeout); gameTimers = []; cupsStart(keep); };

/* ---------- Sternenregen: 25 Sekunden fallende Diamanten antippen ---------- */
const CATCH_SECS = 25;
const CATCH_COLS = ['weiss', 'rosa', 'tuerkis', 'topas', 'smaragd', 'saphir', 'amethyst'];
function catchStart() {
  const g = U.game = { id: 'catch', phase: 'ready', score: 0, items: [], raf: 0, t0: 0, last: 0, spawnIn: 0 };
  window.__game = g;
  const b = $('#gbody'); if (!b) return;
  const best = gameBest('catch');
  b.innerHTML = '<div class="catch-top"><span class="ct-score" aria-live="polite">' + gemMini(22) + '<b id="ctScore">0</b></span><span class="ct-time"><i id="ctTime" style="width:100%"></i></span></div>' +
    '<div class="catch-area" id="carea"><div class="catch-start"><p>Tippe die fallenden Diamanten an!<br>Regenbogen-Diamanten zählen 3.</p>' + (best ? '<p class="hint">Dein Rekord: ' + best + '</p>' : '') + '<button class="btn btn-main" data-act="catch-go">Los!</button></div></div>';
  setFoot('<p class="g-msg">Nur zum Spaß: Hier gibt es keine echten Diamanten.</p>');
  const area = $('#carea');
  area.addEventListener('pointerdown', ev => {
    const el = ev.target.closest('.fall'); if (!el || !U.game || U.game !== g || g.phase !== 'play') return;
    ev.preventDefault();
    const it = g.items.find(x => x.el === el); if (!it || it.hit) return;
    it.hit = true; g.score += it.pts; el.classList.add('hit');
    const s = $('#ctScore'); if (s) s.textContent = g.score;
    if (it.pts > 1) Snd.sparkle(); else Snd.gem();
    const r = el.getBoundingClientRect(); FX.pop(r.left + r.width / 2, r.top + r.height / 2, it.pts > 1 ? ['🌈', '✨'] : ['✨']);
    gLater(() => el.remove(), 260);
  });
}
ACT['catch-go'] = () => {
  const g = U.game; if (!g || g.id !== 'catch' || g.phase !== 'ready') return;
  const st = $('.catch-start'); if (st) st.remove();
  g.phase = 'play'; g.t0 = performance.now(); g.last = g.t0; g.spawnIn = 0;
  const loop = now => {
    if (!gameAlive(g) || g.phase !== 'play') return;
    const dt = Math.min(64, now - g.last) / 1000, el = (now - g.t0) / 1000; g.last = now;
    const area = $('#carea'); if (!area) return;
    const H = area.clientHeight, W = area.clientWidth;
    g.spawnIn -= dt;
    if (g.spawnIn <= 0) {
      const rb = Math.random() < .09, size = rb ? 64 : 50 + Math.round(Math.random() * 10);
      const n = document.createElement('button');
      n.className = 'fall' + (rb ? ' rb' : ''); n.type = 'button'; n.setAttribute('aria-label', rb ? 'Regenbogen-Diamant' : 'Diamant');
      n.innerHTML = gemSVG(rb ? 'regenbogen' : CATCH_COLS[Math.floor(Math.random() * CATCH_COLS.length)], size);
      const x = Math.random() * Math.max(10, W - size - 8) + 4;
      n.style.left = x + 'px'; n.style.transform = 'translateY(-70px)';
      area.appendChild(n);
      g.items.push({ el: n, y: -70, v: (H * .32) + el * (H * .018) + Math.random() * 40, pts: rb ? 3 : 1, hit: false });
      g.spawnIn = Math.max(.42, .85 - el * .018);
    }
    g.items = g.items.filter(it => {
      if (it.hit) return true;
      it.y += it.v * dt; it.el.style.transform = 'translateY(' + it.y.toFixed(1) + 'px)';
      if (it.y > H + 10) { it.el.remove(); return false; }
      return true;
    }).filter(it => !(it.hit && !it.el.isConnected));
    const left = Math.max(0, 1 - el / CATCH_SECS), bar = $('#ctTime'); if (bar) bar.style.width = (left * 100).toFixed(1) + '%';
    if (el >= CATCH_SECS) { catchEnd(); return; }
    g.raf = requestAnimationFrame(loop);
  };
  g.raf = requestAnimationFrame(loop);
};
function catchEnd() {
  const g = U.game; if (!g || g.id !== 'catch' || g.phase !== 'play') return;
  g.phase = 'over'; cancelAnimationFrame(g.raf);
  $$('#carea .fall').forEach(n => n.remove()); g.items = [];
  const rec = gameRecord('catch', g.score, (a, b) => a > b);
  if (g.score > 0) { Snd.fanfare(); FX.party(['💎', '✨', '🌈']); }
  setFoot(doneFoot('<b>' + (g.score === 1 ? 'Ein Diamant gefangen!' : g.score + ' Diamanten gefangen!') + '</b>' + (rec ? ' Neuer Rekord!' : ''), 'catch-again'));
}
ACT['catch-again'] = () => { gameStop(); U.sheet = 'sheet-game'; catchStart(); };
