/* ============ Ton (Web Audio), Konfetti (Canvas), Vibration ============ */
/* Vibration nur nach einem echten Tipp (sonst meldet der Browser einen Fehler); das iPhone kann es ohnehin nicht. */
const Hap = { go(p) { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch (e) { /* kein Gerät mit Vibration */ } } };
const stillMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

const Snd = (function () {
  let ctx = null, master = null, muted = false;
  function ensure() {
    if (muted) return null;
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC(); master = ctx.createGain(); master.gain.value = .6; master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(f, t, d, type, g, f2) {
    const o = ctx.createOscillator(), a = ctx.createGain();
    o.type = type || 'triangle'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    a.gain.setValueAtTime(.0001, t); a.gain.exponentialRampToValueAtTime(g || .2, t + .012); a.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(a); a.connect(master); o.start(t); o.stop(t + d + .05);
  }
  function crowd(t, d, g, f0, f1) {
    const n = Math.max(1, Math.floor(ctx.sampleRate * d)), buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), a = ctx.createGain();
    s.buffer = buf; bp.type = 'bandpass'; bp.Q.value = .7;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.linearRampToValueAtTime(f1, t + d);
    a.gain.setValueAtTime(.0001, t); a.gain.linearRampToValueAtTime(g, t + d * .35); a.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(bp); bp.connect(a); a.connect(master); s.start(t);
  }
  function bell(f, t, d, g) { tone(f, t, d, 'sine', g); tone(f * 2.01, t, d * .6, 'sine', g * .35); tone(f * 3.02, t, d * .3, 'triangle', g * .12); }
  const run = fn => { const c = ensure(); if (!c) return; try { fn(c.currentTime); } catch (e) { /* Ton ist nie wichtig genug für einen Fehler */ } };
  return {
    setMuted(m) { muted = !!m; },
    isMuted: () => muted,
    wake() { ensure(); },
    tap() { run(t => tone(880, t, .07, 'sine', .07, 640)); },
    soft() { run(t => tone(330, t, .22, 'sine', .07, 262)); },                                      // ruhig: noch nicht, Wolke
    claim() { run(t => { bell(988, t, .35, .09); bell(1319, t + .09, .45, .08); }); },               // Kind tippt „Geschafft!“
    dig(n) { run(t => { tone(150 - (n || 0) * 12, t, .12, 'sine', .35, 60); crowd(t, .16, .22, 1800, 600); }); },   // Spatenstich: Plopp und Sand
    gem() { run(t => { [1319, 1661, 1976, 2637].forEach((f, i) => bell(f, t + i * .06, .5, .08)); }); },              // Diamant springt heraus
    find() { run(t => { tone(520, t, .12, 'sine', .12, 780); tone(780, t + .1, .16, 'sine', .1, 620); }); },         // Spaß-Fund
    fanfare() { run(t => { [523.3, 659.3, 784, 1046.5, 1318.5, 1568].forEach((f, i) => bell(f, t + i * .11, .9, .09)); [1046.5, 1318.5, 1568].forEach(f => bell(f, t + .8, 1.4, .07)); crowd(t + .7, 1.2, .08, 5000, 9000); }); },
    pack() { run(t => { crowd(t, .45, .22, 1200, 5000); [1568, 1976, 2349, 2637].forEach((f, i) => bell(f, t + .5 + i * .07, .4, .07)); }); },
    sparkle() { run(t => { [1568, 1976, 2349, 3136].forEach((f, i) => bell(f, t + i * .07, .4, .06)); }); },
  };
})();

const FX = (function () {
  let cv = null, cx = null, parts = [], raf = 0, last = 0, W = 0, H = 0;
  const COLORS = ['#2cc6c3', '#ffd45a', '#ff8fc1', '#bb96ff', '#ffffff', '#6fe3dc'];
  function fit() {
    if (!cv) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    cx.setTransform(d, 0, 0, d, 0, 0);
  }
  function init() {
    cv = document.getElementById('fx'); if (!cv) return;
    cx = cv.getContext('2d'); fit(); window.addEventListener('resize', fit);
  }
  function add(x, y, n, o) {
    const emojis = o.emojis || [];
    for (let i = 0; i < n; i++) {
      const a = (o.angle != null ? o.angle : -Math.PI / 2) + (Math.random() - .5) * (o.spread != null ? o.spread : Math.PI * 2);
      const v = (o.speed || 9) * (.45 + Math.random() * .8);
      parts.push({
        x: typeof x === 'function' ? x() : x, y: typeof y === 'function' ? y() : y,
        vx: o.still ? 0 : Math.cos(a) * v, vy: o.fall ? 1 + Math.random() * 3 : Math.sin(a) * v,
        r: Math.random() * 6.28, vr: (Math.random() - .5) * .35, s: 6 + Math.random() * 7,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        e: emojis.length && Math.random() < (o.emojiShare || .2) ? emojis[(Math.random() * emojis.length) | 0] : null,
        shape: Math.random() < .35 ? 'c' : 'r', life: 0, max: (o.life || 2.4) + Math.random() * 1.1, g: o.gravity || .26,
      });
    }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function tick(t) {
    const dt = Math.min(2.5, (t - last) / 16.67); last = t;
    cx.clearRect(0, 0, W, H);
    parts = parts.filter(p => p.life < p.max && p.y < H + 60);
    for (const p of parts) {
      p.life += dt / 60; p.vx *= .985; p.vy = p.vy * .985 + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      cx.save(); cx.globalAlpha = Math.max(0, Math.min(1, (p.max - p.life) / .6)); cx.translate(p.x, p.y); cx.rotate(p.r);
      if (p.e) { cx.font = Math.round(p.s * 2.6) + 'px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(p.e, 0, 0); }
      else {
        cx.fillStyle = p.c;
        if (p.shape === 'c') { cx.beginPath(); cx.arc(0, 0, p.s / 2, 0, 6.3); cx.fill(); } else cx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6);
      }
      cx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) cx.clearRect(0, 0, W, H);
  }
  const ok = () => cv && !stillMotion();
  return {
    init,
    /* kleiner Funkelregen an einer Stelle (beim Diamanten) */
    pop(x, y, emojis) { if (ok()) add(x, y, 26, { speed: 7, spread: Math.PI * 1.4, angle: -Math.PI / 2, emojis: emojis || ['💎'], emojiShare: .25, life: 1.7 }); },
    /* große Feier: zwei Kanonen von unten und Regen von oben */
    party(emojis) {
      if (!ok()) return;
      const e = emojis || ['💎', '✨'];
      add(W * .08, H * .92, 70, { angle: -Math.PI * .36, spread: .7, speed: 17, emojis: e, emojiShare: .2, life: 3.2, gravity: .3 });
      add(W * .92, H * .92, 70, { angle: -Math.PI * .64, spread: .7, speed: 17, emojis: e, emojiShare: .2, life: 3.2, gravity: .3 });
      setTimeout(() => add(() => Math.random() * W, -20, 70, { fall: true, still: true, emojis: e, emojiShare: .15, life: 3.6, gravity: .1 }), 350);
    },
    clear() { parts = []; },
  };
})();

/* ============ Vorlesen: deutsche Stimme des Geräts (iPhone: nur nach einem Tipp) ============ */
const Say = (function () {
  let on = true, voice = null;
  const ok = () => { try { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'; } catch (e) { return false; } };
  function pick() {
    if (voice || !ok()) return voice;
    try {
      const vs = speechSynthesis.getVoices() || [];
      const de = vs.filter(v => /^de(-|_|$)/i.test(v.lang));
      voice = de.find(v => /anna|helena|marlene|petra|vicki|female|frau/i.test(v.name)) || de.find(v => /de-DE/i.test(v.lang)) || de[0] || null;
    } catch (e) { voice = null; }
    return voice;
  }
  if (ok()) { try { speechSynthesis.onvoiceschanged = () => { voice = null; pick(); }; } catch (e) { /* egal */ } }
  return {
    available: ok,
    hasGerman: () => !!pick(),
    setOn(v) { on = !!v; if (!on) this.stop(); },
    isOn: () => on,
    stop() { try { if (ok()) speechSynthesis.cancel(); } catch (e) { /* egal */ } },
    say(text, force) {
      if ((!on && !force) || !ok() || !text) return false;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text).replace(/­/g, ''));
        u.lang = 'de-DE'; u.rate = .92; u.pitch = 1.12;
        const v = pick(); if (v) u.voice = v;
        speechSynthesis.speak(u);
        window.__said = (window.__said || []).concat(String(text));
        return true;
      } catch (e) { return false; }
    },
  };
})();
