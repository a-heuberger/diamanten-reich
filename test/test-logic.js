// Regeln des Diamanten-Reichs, rein (ohne Browser): Aufgaben c/y/n, Graben (dg, wartend), Funkel-Tage, Wolken, Schätze, Sticker, Einstellungen.
const L = require('../src/logic.js');
let bad = 0, n = 0;
const ok = (name, cond, info) => { n++; if (!cond) bad++; console.log((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined && !cond ? ' | ' + info : '')); };
const eq = (name, a, b) => ok(name, JSON.stringify(a) === JSON.stringify(b), JSON.stringify(a) + ' statt ' + JSON.stringify(b));
const mk = (days, cfg, prog) => { const S = { cfg: L.migrateCfg(cfg || {}), prog: L.normProg(prog), days: days || {} }; L.touch(S); return S; };
const ALL = ['t_zaehne_m', 't_anziehen', 't_bett', 't_aufraeumen', 't_tisch', 't_zaehne_a', 't_schlafanzug'];
const marks = (ids, v) => Object.fromEntries(ids.map(id => [id, v]));
const T = '2026-11-13';   // Freitag

// ---- Voreinstellungen ----
const d = L.defaultCfg();
eq('Vorgabe: Name ist der Platzhalter Lia', d.name, 'Lia');
eq('Vorgabe: 3 Tipps je Diamant, Graben an, Spaß-Funde an', [d.digTaps, d.digMode, d.digFun], [3, true, true]);
eq('Vorgabe: Schätze 10 bis 500', d.goals.map(g => g.at), [10, 25, 50, 75, 100, 150, 200, 300, 500]);
ok('Vorgabe: alle Schätze mit Beispiel-Belohnung', d.goals.every(g => g.reward.length > 3));
eq('Vorgabe: drei Schätze bringen Geld aufs Konto', d.goals.filter(g => L.rewardMoney(g.reward) > 0).map(g => [g.at, L.rewardMoney(g.reward)]), [[25, 200], [100, 500], [300, 1000]]);
const m0 = L.migrateCfg({ v: 1, goals: [{ id: 'g10', at: 10, reward: '' }, { id: 'g25', at: 25, reward: 'Eis' }, { id: 'g40', at: 40, reward: '' }] });
eq('migrate v1: leere Vorgabe-Schätze bekommen Beispiele, eigene bleiben', m0.goals.map(g => g.reward), ['Glitzer-Tattoo aussuchen', 'Eis', '']);
eq('migrate v2: leere Belohnung bleibt leer (Überraschung)', L.migrateCfg({ v: 2, goals: [{ id: 'g10', at: 10, reward: '' }] }).goals[0].reward, '');
ok('Vorgabe: Spielwiese an', d.games === true && L.migrateCfg({ games: false }).games === false);
eq('Vorgabe: Wolken 1 und 3, Zauberbeutel alle 5', [d.yellowPts, d.redPts, d.packEvery], [1, 3, 5]);
eq('Vorgabe: 3 Aufgaben morgens, 4 abends', [d.tasks.filter(t => t.slot === 'morgens').length, d.tasks.filter(t => t.slot === 'abends').length], [3, 4]);
ok('Vorgabe: Aufgaben-IDs eindeutig', new Set(d.tasks.map(t => t.id)).size === d.tasks.length);
ok('Vorgabe: kein Fußball, kein Konto', !/Tor|Gegner|Konto|Note/.test(JSON.stringify(d)));

// ---- migrateCfg ----
const m1 = L.migrateCfg({ name: 'Lia', digTaps: 9, yellowPts: -2, look: { hair: 'grün', dress: 'rosa' }, tasks: [{ id: 'x', title: 'A', slot: 'mittags', pts: 7, days: [] }] });
eq('migrate: Tipps auf 1 bis 5 begrenzt', m1.digTaps, 5);
eq('migrate: Abzug nicht negativ', m1.yellowPts, 0);
eq('migrate: unbekannte Haarfarbe → Vorgabe, Kleid bleibt', [m1.look.hair, m1.look.dress, m1.look.style], ['braun', 'rosa', 'zoepfe']);
eq('migrate: unbekannte Tageszeit → morgens, Diamanten 1 bis 3, leere Tage → täglich', [m1.tasks[0].slot, m1.tasks[0].pts, m1.tasks[0].days.length], ['morgens', 3, 7]);
eq('migrate: Version gesetzt', m1.v, L.CFG_V);
eq('migrate: Ziele sortiert und eindeutig', L.migrateCfg({ goals: [{ at: 20 }, { at: 10 }, { at: 10 }] }).goals.map(g => g.at), [10, 11, 20]);
ok('migrate: kaputte Ziele → Vorgaben', L.migrateCfg({ goals: [{ at: 'x' }] }).goals.length === 9);
eq('migrate: Graben aus bleibt aus', L.migrateCfg({ digMode: false }).digMode, false);

// ---- Ein Tag: Kind tippt (c), Eltern geben frei (y), heute nicht (n) ----
let S = mk({ [T]: { m: { t_zaehne_m: 'c', t_anziehen: 'y', t_bett: 'n' } } });
let e = L.evalDay(S, T);
eq('Tag: c zählt als offen und getippt', [e.open, e.claimed], [5, 1]);
eq('Tag: ein Diamant, nichts gegraben → wartet', [e.gain, e.dug, e.waiting], [1, 0, 1]);
eq('Tag: Ergebnis win, nicht perfekt', [e.result, e.perfect], ['win', false]);
S = mk({ [T]: { m: marks(ALL, 'y'), dg: 4 } });
e = L.evalDay(S, T);
eq('Tag: alle frei → 7 Diamanten, 4 gegraben, 3 warten, perfekt', [e.gain, e.dug, e.waiting, e.perfect, e.complete], [7, 4, 3, true, true]);
S = mk({ [T]: { m: { t_zaehne_m: 'y' }, dg: 5 } });
eq('Tag: dg größer als Diamanten (Eltern nahmen zurück) → gegraben höchstens gain', [L.evalDay(S, T).dug, L.evalDay(S, T).waiting], [1, 0]);
S = mk({ [T]: { m: marks(ALL, 'n') } });
eq('Tag: alles „heute nicht“ → loss ohne Abzug', [L.evalDay(S, T).result, L.evalDay(S, T).minus, L.evalDay(S, T).gain], ['loss', 0, 0]);
S = mk({ [T]: { m: { t_zaehne_m: 'n' } } });
eq('Tag: teilweise „heute nicht“, Rest offen → none', L.evalDay(S, T).result, 'none');
S = mk({ [T]: { m: marks(ALL, 'y') } }, { digMode: false });
eq('Tag: Graben aus → alles gilt als gegraben', [L.evalDay(S, T).dug, L.evalDay(S, T).waiting], [7, 0]);
S = mk({ [T]: { m: { t_zaehne_m: 'y' } } }, { tasks: [{ id: 't_zaehne_m', title: 'Zähne', pts: 3 }] });
eq('Tag: Aufgabe mit 3 Diamanten', L.evalDay(S, T).gain, 3);

// ---- Aufgaben je Tag ----
S = mk({}, { tasks: [{ id: 'a', title: 'A', days: [1] }, { id: 'b', title: 'B', from: '2026-11-14' }, { id: 'c', title: 'C', until: '2026-11-13' }] });
eq('Aufgaben: nur Montag, ab, bis', L.tasksOn(S, T).map(t => t.id), []);
eq('Aufgaben: am Montag nur a', L.tasksOn(S, '2026-11-09').map(t => t.id), ['a', 'c']);
S.days['2026-11-13'] = { m: { a: 'y' } }; L.touch(S);
eq('Aufgaben: bereits eingetragen bleibt sichtbar', L.tasksOn(S, T).map(t => t.id), ['a']);

// ---- Gesamtstand: total, Truhe, wartend, ältester Tag zuerst ----
S = mk({ '2026-11-11': { m: { t_zaehne_m: 'y', t_anziehen: 'y' }, dg: 1 }, '2026-11-12': { m: { t_bett: 'y' } }, [T]: { m: { t_tisch: 'y' }, dg: 1 } });
let st = L.computeStats(S, T);
eq('Stand: 4 Diamanten, 2 in der Truhe, 2 warten', [st.total, st.chest, st.waiting], [4, 2, 2]);
eq('Stand: ältester wartender Tag zuerst', st.firstWaiting, '2026-11-11');
eq('Stand: Schätze zählen alle freigegebenen', st.score, 4);
eq('Stand: Zukunft zählt nicht', L.computeStats(mk({ '2026-11-20': { m: { t_bett: 'y' } } }), T).total, 0);

// ---- Funkel-Tage in Folge ----
S = mk({ '2026-11-10': { m: { t_bett: 'y' } }, '2026-11-11': { m: { t_bett: 'y' } }, '2026-11-12': {}, [T]: { m: { t_bett: 'y' } } });
st = L.computeStats(S, T);
eq('Serie: leerer Tag unterbricht nicht', [st.cur, st.best], [3, 3]);
S = mk({ '2026-11-10': { m: { t_bett: 'y' } }, '2026-11-11': { m: marks(ALL, 'n') }, [T]: { m: { t_bett: 'y' } } });
st = L.computeStats(S, T);
eq('Serie: Tag ohne Diamant (alles „heute nicht“) unterbricht', [st.cur, st.best], [1, 1]);

// ---- Wolken ----
const Y = id => ({ k: 'y', id }), R = id => ({ k: 'r', id });
S = mk({ [T]: { m: marks(ALL, 'y'), ev: [Y('y1')] } });
e = L.evalDay(S, T); st = L.computeStats(S, T);
eq('Wolke gelb: −1 bei den Schätzen, Diamanten bleiben', [e.yellow, e.minus, e.gain, st.score, st.total, st.chest], [1, 1, 7, 6, 7, 0]);
eq('Wolke gelb: offen', st.clouds.count, 1);
ok('Wolke gelb: kein perfekter Tag', !e.perfect);
S = mk({ '2026-11-12': { ev: [Y('y1')] }, [T]: { ev: [Y('y2')] } });
e = L.evalDay(S, T); st = L.computeStats(S, T);
eq('Zwei gelbe (an zwei Tagen) → automatisch Gewitter, Gelbe weg', [e.yellow, e.red, st.clouds.count], [1, 1, 0]);
eq('Zwei gelbe: Minus 1 + 1 + 3', st.minus, 5);
ok('Automatisches Gewitter merkt sich die auslösende Wolke', e.entries.some(x => x.auto && x.src === 'y2'));
S = mk({ [T]: { ev: [R('r1'), R('r2')] } });
e = L.evalDay(S, T);
eq('Gewitter höchstens einmal pro Tag', [e.red, e.minus, e.entries[1].capped], [2, 3, true]);
S = mk({ '2026-11-01': { ev: [Y('y1')] } });
eq('Gelbe verfallen nie', L.computeStats(S, T).clouds.count, 1);
S = mk({ [T]: { ev: [{ k: '+', v: 2, t: 'Lieb geteilt' }, { k: '+', v: 3 }] } });
eq('Extra-Diamanten: höchstens 3 pro Tag', L.evalDay(S, T).plus, 3);
eq('Extra-Diamanten warten auch in der Erde', L.evalDay(S, T).waiting, 3);

// ---- Schätze ----
S = mk({ [T]: { m: marks(ALL, 'y') }, '2026-11-12': { m: marks(ALL.slice(0, 3), 'y') } });
st = L.computeStats(S, T);
let gl = L.goalList(S, st);
eq('Schätze: 10 erreicht, 25 noch nicht', [gl[0].reached, gl[1].reached, gl[1].need], [true, false, 15]);
eq('Schätze: nächster ist 25', L.nextGoal(S, st).at, 25);
ok('Schätze: Edelsteine je Stufe, letzter ist der große Schatz', gl.every(g => L.GOAL_GEMS.indexOf(g.gem) >= 0) && gl[gl.length - 1].last);
S.days[T].ev = [R('r1')]; L.touch(S);
st = L.computeStats(S, T);
ok('Schätze: Wolke kann einen Schatz wieder aus der Reichweite nehmen', !L.goalList(S, st)[0].reached, st.score);
S.prog.red = { g10: '2026-11-13' };
ok('Schätze: eingelöster Schatz bleibt erreicht', L.goalList(S, L.computeStats(S, T))[0].reached);

// ---- Sticker und Zauberbeutel ----
eq('Sticker: 40 Stück', L.STICKERS.length, 40);
eq('Sticker: 10 je Kategorie', L.CATS.map(c => L.STICKERS.filter(s => s.cat === c).length), [10, 10, 10, 10]);
ok('Sticker: jeder hat einen Steckbrief zum Vorlesen', L.STICKERS.every(s => s.fact && s.fact.length > 10 && s.fact.length < 90));
ok('Sticker: Edelsteine gezeichnet (gem:…) gibt es', L.STICKERS.filter(s => /^gem:/.test(s.ico)).length >= 8);
eq('Sticker: Seltenheiten', ['n', 'r', 'u'].map(r => L.STICKERS.filter(s => s.rar === r).length), [24, 11, 5]);
S = mk({}, {}, { album: ['s01', 's02', 's10', 's07', 's08'] });
eq('Sticker-Punkte 1+1+5+2+2 = 11 → 1 Bonus-Diamant', [L.stickerPoints(S.prog), L.stickerBonus(S.prog)], [11, 1]);
st = L.computeStats(S, T);
eq('Bonus-Diamant zählt in Truhe und Schätzen', [st.total, st.chest, st.score], [1, 1, 1]);
S = mk({ [T]: { m: marks(ALL, 'y') } });
st = L.computeStats(S, T);
eq('Zauberbeutel: Willkommen + alle 5 Diamanten', [st.packs.earned, st.packs.left, st.packs.next], [2, 2, 3]);
ok('Zauberbeutel: Ziehung bevorzugt normale', (() => { let r = 0; for (let i = 0; i < 2000; i++) if (L.pickSticker(L.STICKERS).rar === 'n') r++; return r > 1300; })());
eq('Zauberbeutel: nach Album und Glanz ist Schluss', L.packsLeft(200, L.STICKERS.map(s => s.id), L.STICKERS.map(s => s.id)), 0);

// ---- Woche und Hinweise ----
S = mk({ '2026-11-09': { m: marks(ALL, 'y') }, [T]: { m: { t_bett: 'y' }, ev: [Y('y1')] } });
const w = L.evalWeek(S, '2026-11-09');
eq('Woche: Diamanten, Glitzer-Tage, Funkel-Tage, Wolken', [w.gems, w.perfect, w.sparkle, w.yellow], [8, 1, 2, 1]);
const adv = L.parentAdvice(mk({}), T).map(a => a.kind);
ok('Hinweis: Vorgaben haben Belohnungen, kein Hinweis', adv.indexOf('rewards') < 0);
const Sr = mk({}); Sr.cfg.goals[0].reward = '';
ok('Hinweis: leere Belohnung bei den ersten Schätzen', L.parentAdvice(Sr, T).some(a => a.kind === 'rewards'));

// ---- Konto ----
eq('Konto: Beträge lesen', ['2,5', '2.50', '€ 3', '0', '1001', 'abc', '12,345'].map(L.parseMoney), [250, 250, 300, null, null, null, null]);
eq('Konto: Anzeige', [L.fmtEUR(250), L.fmtEUR(-1005), L.fmtEUR(0), L.fmtPlain(705)], ['2,50 €', '−10,05 €', '0,00 €', '7,05']);
eq('Konto: Geld in Belohnungen erkennen', ['2 € aufs Guthabenkonto', '1,50 Euro aufs Konto', '5 € ins Konto', 'Eis für 2 €', ''].map(L.rewardMoney), [200, 150, 500, 0, 0]);
const Sk = { konto: { a: { ts: 1, c: 500, k: 'plus' }, b: { ts: 3, c: -150, k: 'minus' }, c: { ts: 2, c: -100, k: 'pay' } } };
eq('Konto: Guthaben und Reihenfolge (neueste zuerst)', [L.kontoBalance(Sk), L.kontoList(Sk).map(e => e.id)], [250, ['b', 'c', 'a']]);
eq('Konto: Genitiv', [L.genitive('Lia'), L.genitive('Max')], ['Lias', 'Max’']);
eq('Schätze: Geld je Schatz in goalList', L.goalList(mk({}), L.computeStats(mk({}), T)).filter(g => g.money).map(g => g.at), [25, 100, 300]);
eq('Funkel-Rufe', [L.ladderText(1), L.ladderText(2), L.ladderText(9)], ['Funkel!', 'Doppel-Funkel!', 'Mega-Funkel!']);

console.log('\n' + (n - bad) + ' von ' + n + ' Prüfungen bestanden' + (bad ? ', ' + bad + ' FEHLER' : ''));
process.exit(bad ? 1 : 0);
