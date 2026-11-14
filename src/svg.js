/* ============ Grafik: Diamanten, Schatzgräberin, Truhe, Einhorn, Wolken, Zauberbeutel, Krone, Symbole ============
   Alles selbst gezeichnete Vektorgrafik (Originalfiguren), damit die App ohne Bilddateien und offline auskommt. */
const svgTag = (vb, body, attrs) => '<svg viewBox="' + vb + '" aria-hidden="true" focusable="false"' + (attrs ? ' ' + attrs : '') + '>' + body + '</svg>';
const f1 = n => (Math.round(n * 10) / 10).toString();

/* ---- Edelsteine: Brillant von der Seite, drei Töne je Farbe ---- */
const GEM_COL = {
  weiss: ['#ffffff', '#d9f7fc', '#9fdfea', '#4fb3c6'],
  rosa: ['#ffe4f1', '#ff9fcd', '#e9629f', '#b5447a'],
  topas: ['#fff4c4', '#ffd45a', '#eaa514', '#ad7706'],
  gold: ['#fff4c4', '#ffd45a', '#eaa514', '#ad7706'],
  tuerkis: ['#dcfffb', '#6fe3dc', '#1fb3ad', '#0d7c78'],
  rubin: ['#ffd3da', '#ff6680', '#d12a4a', '#93152e'],
  saphir: ['#dbe9ff', '#6fa8ff', '#2f6fe0', '#1c47a0'],
  smaragd: ['#d6ffe7', '#52da8e', '#1ea75c', '#126d3b'],
  amethyst: ['#f0e4ff', '#bb96ff', '#8a5ce6', '#5c37a8'],
};
const GEM_FACETS = [
  ['10,42 30,22 40,42', 1], ['30,22 50,22 40,42', 0], ['40,42 50,22 60,42', 1], ['50,22 70,22 60,42', 0], ['60,42 70,22 90,42', 2],
  ['10,42 40,42 50,88', 1], ['40,42 60,42 50,88', 0], ['60,42 90,42 50,88', 2],
];
const RAINBOW = ['#ff6680', '#ffb347', '#ffe066', '#52da8e', '#6fe3dc', '#6fa8ff', '#bb96ff', '#ff9fcd'];
function gemInner(color) {
  const c = GEM_COL[color] || GEM_COL.weiss, rb = color === 'regenbogen';
  const facets = GEM_FACETS.map((f, i) => '<polygon points="' + f[0] + '" fill="' + (rb ? RAINBOW[i] : c[f[1]]) + '"/>').join('');
  return '<g stroke="' + (rb ? '#7a4fd0' : c[3]) + '" stroke-width="2.4" stroke-linejoin="round">' + facets + '</g>' +
    '<polygon points="30,22 70,22 90,42 50,88 10,42" fill="none" stroke="' + (rb ? '#7a4fd0' : c[3]) + '" stroke-width="3.2" stroke-linejoin="round"/>' +
    '<path d="M33 27l5 9" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>';
}
const sparklePath = (x, y, r) => 'M' + f1(x) + ' ' + f1(y - r) + 'Q' + f1(x + r * .18) + ' ' + f1(y - r * .18) + ' ' + f1(x + r) + ' ' + f1(y) + 'Q' + f1(x + r * .18) + ' ' + f1(y + r * .18) + ' ' + f1(x) + ' ' + f1(y + r) + 'Q' + f1(x - r * .18) + ' ' + f1(y + r * .18) + ' ' + f1(x - r) + ' ' + f1(y) + 'Q' + f1(x - r * .18) + ' ' + f1(y - r * .18) + ' ' + f1(x) + ' ' + f1(y - r) + 'Z';
const gemSVG = (color, size, cls) => '<svg class="gem' + (cls ? ' ' + cls : '') + '" viewBox="0 6 100 90" width="' + size + '" height="' + f1(size * .9) + '" aria-hidden="true" focusable="false">' + gemInner(color) +
  '<path class="tw" d="' + sparklePath(80, 20, 11) + '" fill="#fff"/></svg>';
/* Diamant für Zähler und Knöpfe (klein, ohne Funkeln) */
const gemMini = (size, color) => '<svg class="gem mini" viewBox="6 18 88 74" width="' + size + '" height="' + f1(size * .84) + '" aria-hidden="true" focusable="false">' + gemInner(color || 'weiss') + '</svg>';

/* ---- Sternfunkeln ---- */
const sparkleSVG = (size, color) => '<svg class="spark" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false"><path d="' + sparklePath(12, 12, 11) + '" fill="' + (color || '#fff') + '"/></svg>';

/* ---- Krone ---- */
const crownSVG = size => '<svg class="crown" viewBox="0 0 64 48" width="' + size + '" height="' + f1(size * .75) + '" aria-hidden="true" focusable="false">' +
  '<path d="M6 16l12 12 14-22 14 22 12-12-5 26H11z" fill="url(#gGold)" stroke="#b07a06" stroke-width="2.4" stroke-linejoin="round"/>' +
  '<rect x="10" y="38" width="44" height="7" rx="3" fill="#eaa514" stroke="#b07a06" stroke-width="2"/>' +
  '<circle cx="32" cy="30" r="5" fill="#ff7eb6" stroke="#b5447a" stroke-width="1.6"/><circle cx="18" cy="33" r="3.2" fill="#6fe3dc" stroke="#0d7c78" stroke-width="1.4"/><circle cx="46" cy="33" r="3.2" fill="#6fe3dc" stroke="#0d7c78" stroke-width="1.4"/>' +
  '<circle cx="6" cy="15" r="3.4" fill="#ffd45a" stroke="#b07a06" stroke-width="1.6"/><circle cx="32" cy="6" r="3.6" fill="#ffd45a" stroke="#b07a06" stroke-width="1.6"/><circle cx="58" cy="15" r="3.4" fill="#ffd45a" stroke="#b07a06" stroke-width="1.6"/>' +
  '<path d="M20 22l4 4" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/></svg>';

/* ---- Wolken: gelb = Verwarnung, Gewitter = rot ---- */
function cloudSVG(kind, size) {
  const storm = kind === 'red';
  const body = '<path d="M14 38a10 10 0 0 1-1-20 13 13 0 0 1 24-6 11 11 0 0 1 17 9 9 9 0 0 1-2 17z" fill="' + (storm ? '#9a9cc4' : '#ffe066') + '" stroke="' + (storm ? '#5d6190' : '#d9a400') + '" stroke-width="2.6" stroke-linejoin="round"/>';
  const face = '<circle cx="25" cy="26" r="2.1" fill="#3b3550"/><circle cx="38" cy="26" r="2.1" fill="#3b3550"/><path d="M28.5 32.5h6" stroke="#3b3550" stroke-width="2.2" stroke-linecap="round"/>';
  const bolt = storm ? '<path d="M34 39l-6 9h6l-4 9 11-12h-6l4-6z" fill="#ffd45a" stroke="#c48a00" stroke-width="1.8" stroke-linejoin="round"/>' : '';
  return '<svg class="cloud-ic ' + (storm ? 'red' : 'yellow') + '" viewBox="0 0 64 ' + (storm ? 58 : 44) + '" width="' + size + '" height="' + f1(size * (storm ? 58 : 44) / 64) + '" aria-hidden="true" focusable="false">' + body + face + bolt + '</svg>';
}

/* ---- Zauberbeutel (Sticker-Päckchen) ---- */
const pouchSVG = size => '<svg class="pouch" viewBox="0 0 64 72" width="' + f1(size * 64 / 72) + '" height="' + size + '" aria-hidden="true" focusable="false">' +
  '<path d="M20 22c-2-6-1-12 4-14 3 4 5 5 8 5s5-1 8-5c5 2 6 8 4 14z" fill="#b993ff" stroke="#5c37a8" stroke-width="2.4" stroke-linejoin="round"/>' +
  '<path d="M18 26C6 36 6 66 32 68s26-32 14-42z" fill="url(#gPouch)" stroke="#5c37a8" stroke-width="2.6" stroke-linejoin="round"/>' +
  '<path d="M17 25q15 6 30 0" fill="none" stroke="#ffd45a" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="30" r="3.4" fill="#ffd45a" stroke="#ad7706" stroke-width="1.5"/>' +
  '<g transform="translate(19 34) scale(.27)">' + gemInner('rosa') + '</g>' +
  '<path d="' + sparklePath(48, 50, 5) + '" fill="#fff"/><path d="' + sparklePath(15, 44, 3.2) + '" fill="#fff" opacity=".8"/></svg>';

/* ---- Schatzgräberin: Mädchen mit Krönchen und Schaufel (Aussehen aus cfg.look) ---- */
function girlParts(look) {
  const h = HAIR[look.hair] || HAIR.braun, d = DRESS[look.dress] || DRESS.tuerkis, st = look.style || 'zoepfe';
  const skin = '#ffdcc6', skinS = '#e6ad8f';
  let backHair = '', sideHair = '';
  if (st === 'offen') backHair = '<path d="M36 44c-6 20-4 38 4 46h40c8-8 10-26 4-46z" fill="' + h.fill + '" stroke="' + h.dark + '" stroke-width="2.4" stroke-linejoin="round"/>';
  if (st === 'zoepfe') sideHair = ['M37 58', 'M83 58'].map((m, i) => { const x = i ? 86 : 34; return '<g fill="' + h.fill + '" stroke="' + h.dark + '" stroke-width="2.2">' + [0, 1, 2].map(k => '<ellipse cx="' + x + '" cy="' + (64 + k * 10) + '" rx="' + (6.5 - k) + '" ry="6"/>').join('') + '</g><circle cx="' + x + '" cy="91" r="3.6" fill="#ff7eb6" stroke="#b5447a" stroke-width="1.6"/>'; }).join('');
  if (st === 'dutt') backHair = '<circle cx="60" cy="24" r="11" fill="' + h.fill + '" stroke="' + h.dark + '" stroke-width="2.4"/>';
  const head = '<circle cx="60" cy="52" r="22" fill="' + skin + '" stroke="' + skinS + '" stroke-width="2"/>' +
    '<path d="M38 50c0-14 10-22 22-22s22 8 22 22c-6-2-10-7-12-12-5 6-14 9-24 10z" fill="' + h.fill + '" stroke="' + h.dark + '" stroke-width="2.4" stroke-linejoin="round"/>';
  const face = '<g class="eyes"><ellipse cx="52" cy="56" rx="2.8" ry="3.4" fill="#2d2433"/><ellipse cx="68" cy="56" rx="2.8" ry="3.4" fill="#2d2433"/><circle cx="53" cy="55" r="1" fill="#fff"/><circle cx="69" cy="55" r="1" fill="#fff"/></g>' +
    '<circle cx="46" cy="63" r="4" fill="#ff8fb8" opacity=".45"/><circle cx="74" cy="63" r="4" fill="#ff8fb8" opacity=".45"/>' +
    '<path class="mouth" d="M54 64q6 6 12 0" fill="none" stroke="#9a3b55" stroke-width="2.4" stroke-linecap="round"/>';
  const tiara = '<path d="M47 33l4-7 4 5 5-8 5 8 4-5 4 7z" fill="url(#gGold)" stroke="#ad7706" stroke-width="1.8" stroke-linejoin="round"/><circle cx="60" cy="30" r="2.4" fill="#ff7eb6"/>';
  const dress = '<path d="M46 76q14-5 28 0l12 46q-26 9-52 0z" fill="' + d.fill + '" stroke="' + d.dark + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M44 96q16 5 32 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="' + sparklePath(52, 108, 3.4) + sparklePath(70, 112, 2.6) + '" fill="#fff" opacity=".85"/>';
  const legs = '<rect x="49" y="120" width="7" height="18" rx="3" fill="' + skin + '" stroke="' + skinS + '" stroke-width="1.6"/><rect x="64" y="120" width="7" height="18" rx="3" fill="' + skin + '" stroke="' + skinS + '" stroke-width="1.6"/>' +
    '<ellipse cx="52" cy="140" rx="7" ry="4" fill="#ff7eb6" stroke="#b5447a" stroke-width="1.6"/><ellipse cx="68" cy="140" rx="7" ry="4" fill="#ff7eb6" stroke="#b5447a" stroke-width="1.6"/>';
  const tool = '<g class="tool"><path d="M80 80l22 50" stroke="#a8682f" stroke-width="5" stroke-linecap="round"/><path d="M75 78h10" stroke="#a8682f" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M95 126l15-6 6 14c-4 6-12 9-18 6z" fill="#cfe3ea" stroke="#5d7f8c" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M60 84l18 4M60 86l20 14" stroke="' + skin + '" stroke-width="7" stroke-linecap="round"/><circle cx="79" cy="88" r="4.5" fill="' + skin + '" stroke="' + skinS + '" stroke-width="1.4"/><circle cx="85" cy="101" r="4.5" fill="' + skin + '" stroke="' + skinS + '" stroke-width="1.4"/></g>';
  return { backHair, sideHair, head, face, tiara, dress, legs, tool };
}
function girlSVG(look, size, cls) {
  const p = girlParts(look || {});
  return '<svg class="girl' + (cls ? ' ' + cls : '') + '" viewBox="20 8 104 140" width="' + f1(size * 104 / 140) + '" height="' + size + '" aria-hidden="true" focusable="false"><g class="girl-body">' +
    p.backHair + p.legs + p.dress + p.sideHair + p.head + p.face + p.tiara + p.tool + '</g></svg>';
}
/* Nur der Kopf mit Krönchen (für den Kopf der App und die Einrichtung) */
function girlHeadSVG(look, size) {
  const p = girlParts(look || {});
  return '<svg class="girl-head" viewBox="28 14 64 66" width="' + size + '" height="' + f1(size * 66 / 64) + '" aria-hidden="true" focusable="false">' + p.backHair + p.sideHair + p.head + p.face + p.tiara + '</svg>';
}

/* ---- Einhorn (Original, schaut nach links) ---- */
const UNICORN_INNER =
  '<g class="uni-tail"><circle cx="100" cy="52" r="7" fill="#ff9fcd" stroke="#e0609d" stroke-width="2"/><circle cx="106" cy="62" r="6.5" fill="#bb96ff" stroke="#7c5ce0" stroke-width="2"/><circle cx="103" cy="73" r="6" fill="#6fe3dc" stroke="#14918f" stroke-width="2"/></g>' +
  '<g fill="#fff" stroke="#d6c4ef" stroke-width="2.2"><rect x="48" y="66" width="10" height="24" rx="5"/><rect x="62" y="68" width="10" height="22" rx="5"/><rect x="80" y="66" width="10" height="24" rx="5"/><rect x="92" y="64" width="9" height="24" rx="4.5"/></g>' +
  '<g fill="#ffd45a" stroke="#ad7706" stroke-width="1.6"><rect x="48" y="85" width="10" height="6" rx="2"/><rect x="62" y="85" width="10" height="6" rx="2"/><rect x="80" y="85" width="10" height="6" rx="2"/><rect x="92" y="83" width="9" height="6" rx="2"/></g>' +
  '<ellipse cx="74" cy="58" rx="30" ry="17" fill="#fff" stroke="#d6c4ef" stroke-width="2.4"/>' +
  '<path d="M44 52c-4-10-6-18-6-24l16 4c2 8 2 14 0 22z" fill="#fff" stroke="#d6c4ef" stroke-width="2.4" stroke-linejoin="round"/>' +
  '<ellipse cx="36" cy="30" rx="17" ry="14" fill="#fff" stroke="#d6c4ef" stroke-width="2.4"/>' +
  '<ellipse cx="24" cy="38" rx="10" ry="8" fill="#ffe6f1" stroke="#e8b6cf" stroke-width="2"/><circle cx="20" cy="38" r="1.4" fill="#c97a9c"/>' +
  '<path d="M38 18l5-10 4 12z" fill="#fff" stroke="#d6c4ef" stroke-width="2" stroke-linejoin="round"/>' +
  '<path d="M30 17l-4-16 9 13z" fill="url(#gGold)" stroke="#ad7706" stroke-width="1.8" stroke-linejoin="round"/><path d="M28 9l4 1M27 5l3 .8M29 13l4 1" stroke="#ad7706" stroke-width="1.2"/>' +
  '<path d="M30 28q3 3 6 0" fill="none" stroke="#3b3550" stroke-width="2.2" stroke-linecap="round"/><path d="M31 26l-1-2M34 25.5V23.5" stroke="#3b3550" stroke-width="1.4" stroke-linecap="round"/>' +
  '<circle cx="36" cy="36" r="3.4" fill="#ff9fcd" opacity=".55"/>' +
  '<g stroke-width="2"><circle cx="46" cy="20" r="6" fill="#ff9fcd" stroke="#e0609d"/><circle cx="51" cy="29" r="6" fill="#bb96ff" stroke="#7c5ce0"/><circle cx="54" cy="39" r="6" fill="#6fe3dc" stroke="#14918f"/><circle cx="55" cy="49" r="5.5" fill="#ff9fcd" stroke="#e0609d"/><circle cx="40" cy="14" r="5" fill="#ffe066" stroke="#d9a400"/></g>' +
  '<path d="' + sparklePath(66, 52, 4) + sparklePath(84, 60, 3) + '" fill="#ffd45a"/>';
const unicornSVG = (size, cls) => '<svg class="unicorn' + (cls ? ' ' + cls : '') + '" viewBox="4 0 112 94" width="' + size + '" height="' + f1(size * 94 / 112) + '" aria-hidden="true" focusable="false">' + UNICORN_INNER + '</svg>';

/* ---- Schatztruhe: füllt sich mit Diamanten (level 0 bis 1) und glitzert immer mehr ---- */
const PILE = [   // [x, y, Farbe, Größe, ab Füllstand]; erst unten am Rand, dann immer höher
  [46, 52, 'weiss', 18, 0.02], [70, 50, 'rosa', 18, 0.06], [94, 52, 'tuerkis', 18, 0.1], [58, 46, 'topas', 16, 0.15], [82, 45, 'weiss', 17, 0.2],
  [34, 50, 'rosa', 15, 0.26], [106, 50, 'weiss', 15, 0.32], [70, 40, 'saphir', 17, 0.38], [48, 38, 'weiss', 15, 0.45], [92, 37, 'rosa', 16, 0.52],
  [62, 31, 'tuerkis', 16, 0.6], [80, 29, 'smaragd', 15, 0.68], [40, 30, 'amethyst', 14, 0.75], [100, 28, 'topas', 14, 0.82], [70, 20, 'weiss', 20, 0.9],
];
const COINS = [[40, 55], [58, 55], [84, 55], [100, 55], [52, 50], [90, 49], [66, 44], [76, 36]];
function chestSVG(level, size, opts) {
  const lv = Math.max(0, Math.min(1, level || 0)), o = opts || {};
  const glow = '<ellipse cx="70" cy="44" rx="' + f1(30 + lv * 34) + '" ry="' + f1(18 + lv * 26) + '" fill="url(#gGlow)" opacity="' + f1(.15 + lv * .85) + '"/>';
  const lid = '<path d="M16 58L24 20Q70 4 116 20L124 58z" fill="#7a3f12" stroke="#4e2608" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M26 22Q70 8 114 22L118 40Q70 26 22 40z" fill="#9b5520" stroke="#4e2608" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M44 14L40 52M96 14L100 52" stroke="url(#gGold)" stroke-width="6"/>';
  const coins = COINS.filter((c, i) => lv > i * .1).map(c => '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="7" ry="4.5" fill="#ffd45a" stroke="#ad7706" stroke-width="1.6"/>').join('');
  const gems = PILE.filter(p => lv >= p[4]).map(p => '<g transform="translate(' + f1(p[0] - p[3] / 2) + ' ' + f1(p[1] - p[3] / 2) + ') scale(' + f1(p[3] / 100) + ')">' + gemInner(p[2]) + '</g>').join('');
  const front = '<path d="M12 58h116v46a10 10 0 0 1-10 10H22a10 10 0 0 1-10-10z" fill="url(#gWood)" stroke="#4e2608" stroke-width="2.8" stroke-linejoin="round"/>' +
    '<path d="M12 74h116M12 92h116" stroke="#6b3510" stroke-width="2" opacity=".55"/>' +
    '<path d="M10 56h120v8H10z" fill="url(#gGold)" stroke="#ad7706" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M38 64v50M102 64v50" stroke="url(#gGold)" stroke-width="7"/><path d="M38 64v50M102 64v50" stroke="#ad7706" stroke-width="1.2" opacity=".6"/>' +
    '<rect x="58" y="66" width="24" height="26" rx="5" fill="url(#gGold)" stroke="#ad7706" stroke-width="2.2"/><path d="M70 74v8" stroke="#6b3510" stroke-width="4" stroke-linecap="round"/><circle cx="70" cy="74" r="3.6" fill="#6b3510"/>';
  const n = Math.ceil(lv * 7), spots = [[22, 30], [118, 26], [70, 6], [34, 64], [108, 70], [52, 16], [92, 12]];
  const sparks = spots.slice(0, n).map((s, i) => '<path class="tw t' + (i % 4) + '" d="' + sparklePath(s[0], s[1], 4 + (i % 3) * 1.6) + '" fill="#fff"/>').join('');
  return '<svg class="chest' + (o.cls ? ' ' + o.cls : '') + '" viewBox="0 0 140 118" width="' + size + '" height="' + f1(size * 118 / 140) + '" aria-hidden="true" focusable="false">' + glow + lid + coins + gems + front + sparks + '</svg>';
}
/* Fortschritt in der Truhe: wächst am Anfang schnell, damit schon die ersten Diamanten sichtbar sind. */
const chestLevel = (n, top) => (top > 0 ? Math.min(1, Math.sqrt(Math.max(0, n) / top)) : 0);

/* ---- Symbole ---- */
const IC = {
  check: svgTag('0 0 24 24', '<path d="M4.5 12.5l5 5L19.5 7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  cross: svgTag('0 0 24 24', '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>'),
  minus: svgTag('0 0 24 24', '<path d="M5.5 12h13" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>'),
  plus: svgTag('0 0 24 24', '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>'),
  lock: svgTag('0 0 24 24', '<rect x="5" y="11" width="14" height="9.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8.2 11V8.2a3.8 3.8 0 0 1 7.6 0V11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
  unlock: svgTag('0 0 24 24', '<rect x="5" y="11" width="14" height="9.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8.2 11V8.2a3.8 3.8 0 0 1 7.2-1.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
  chevL: svgTag('0 0 24 24', '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'),
  chevR: svgTag('0 0 24 24', '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'),
  back: svgTag('0 0 24 24', '<path d="M10 6l-6 6 6 6M4.5 12H20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  star: svgTag('0 0 24 24', '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/>'),
  sparkle: svgTag('0 0 24 24', '<path d="' + sparklePath(10, 13, 8.5) + '" fill="currentColor"/><path d="' + sparklePath(19, 5, 4) + '" fill="currentColor"/>'),
  sound: svgTag('0 0 24 24', '<path d="M4 9.5h3.6L12.5 5v14l-4.9-4.5H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  mute: svgTag('0 0 24 24', '<path d="M4 9.5h3.6L12.5 5v14l-4.9-4.5H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  sun: svgTag('0 0 24 24', '<circle cx="12" cy="12" r="4.6" fill="currentColor"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  moon: svgTag('0 0 24 24', '<path d="M19.5 15.2A8 8 0 1 1 9 4.3a6.4 6.4 0 0 0 10.5 10.9z" fill="currentColor"/>'),
  shovel: svgTag('0 0 24 24', '<path d="M5 4l9.5 9.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M3.5 5.5l3-3" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M13 12l5-1.5 3.5 3.5-1.5 5c-2 1.5-5 1-6.5-.5S11.5 14 13 12z" fill="currentColor"/>'),
  gift: svgTag('0 0 24 24', '<rect x="3.5" y="9" width="17" height="11.5" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M3.5 13h17M12 9v11.5" stroke="currentColor" stroke-width="2.2"/><path d="M12 9c-1.5-4-6-4.5-6-2s4 2 6 2c2 0 6 .5 6-2s-4.5-2-6 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  heart: svgTag('0 0 24 24', '<path d="M12 20.5S3.5 15 3.5 9.2A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.5 2.6C20.5 15 12 20.5 12 20.5z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/>'),
  coin: svgTag('0 0 24 24', '<circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.4 8.9c-.6-.9-1.7-1.4-3-1.4-1.9 0-3.2 1.4-3.2 4.5s1.3 4.5 3.2 4.5c1.3 0 2.4-.5 3-1.4M7.6 10.8h5.6M7.6 13.2h5.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  hand: svgTag('0 0 24 24', '<path d="M8 12V5.5a1.6 1.6 0 0 1 3.2 0V11M11.2 10V4a1.6 1.6 0 0 1 3.2 0v6M14.4 10.5V5.8a1.6 1.6 0 0 1 3.2 0V14c0 4-2.6 7-6.2 7-2.6 0-4.2-1.2-5.6-3.4L3.6 13.5a1.6 1.6 0 0 1 2.7-1.7L8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
};
const TAB_IC = {
  today: svgTag('0 0 24 24', '<path d="M7.5 4h9l4.5 5.5L12 21 3 9.5z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M3 9.5h18M9.5 4 8 9.5 12 21l4-11.5L14.5 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'),
  week: svgTag('0 0 24 24', '<path d="M2.5 18.5a9.5 9.5 0 0 1 19 0M6 18.5a6 6 0 0 1 12 0M9.5 18.5a2.5 2.5 0 0 1 5 0" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>'),
  achieve: svgTag('0 0 24 24', '<path d="M3.5 11h17v8a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M3.5 11 5 5.5Q12 3 19 5.5l1.5 5.5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><rect x="10" y="11.5" width="4" height="5" rx="1" fill="currentColor"/>'),
  konto: IC.coin,
  coach: IC.heart,
};

/* ---- Goldmünze für das Konto ---- */
const coinSVG = size => '<svg class="coin-svg" viewBox="0 0 64 64" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">' +
  '<circle cx="32" cy="35" r="26" fill="#ad7706"/><circle cx="32" cy="31" r="26" fill="url(#gGold)"/>' +
  '<circle cx="32" cy="31" r="20.5" fill="none" stroke="#ad7706" stroke-opacity=".5" stroke-width="2.4"/>' +
  '<path d="M39.8 23.4c-1.6-2.4-4.2-3.7-7.4-3.7-4.9 0-8 3.6-8 11.3s3.1 11.3 8 11.3c3.2 0 5.8-1.3 7.4-3.7M20.6 28.2h15.8M20.6 33.8h15.8" fill="none" stroke="#8a5a06" stroke-width="3.8" stroke-linecap="round"/>' +
  '<path d="M15.5 23A20 20 0 0 1 30 11" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/></svg>';

/* ---- gemeinsame Definitionen (Verläufe) – einmal im Dokument ---- */
const SVG_DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
  '<linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#ffcf3d"/><stop offset="1" stop-color="#e8a10f"/></linearGradient>' +
  '<linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c97a36"/><stop offset="1" stop-color="#93501d"/></linearGradient>' +
  '<radialGradient id="gGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#ffe27a" stop-opacity=".6"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="gPouch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c3a2ff"/><stop offset=".6" stop-color="#8a5ce6"/><stop offset="1" stop-color="#6a3fc8"/></linearGradient>' +
  '<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe8f0"/><stop offset=".7" stop-color="#d6fbf6"/><stop offset="1" stop-color="#fff6dc"/></linearGradient>' +
  '<linearGradient id="gSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d79a"/><stop offset="1" stop-color="#d9ac62"/></linearGradient>' +
  '</defs></svg>';
