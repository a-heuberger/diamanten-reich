// Gibt die Firestore-Regeln für einen oder mehrere Familiencodes aus. Ein Firebase-Projekt kann mehrere Familien tragen, jede hat ihren eigenen geheimen Pfad.
// Aufruf: node tools/rules.js CODE1 [CODE2 …] [--out Zieldatei]
// Die Zieldatei muss mit --out genannt werden: Ein vertippter Code würde sonst stillschweigend als Dateiname gelten.
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const outFile = oi >= 0 ? args.splice(oi, 2)[1] : null;
const codes = args;
const fail = msg => { console.error(msg); process.exit(1); };
if (!codes.length) fail('Aufruf: node tools/rules.js CODE1 [CODE2 …] [--out Zieldatei]');
codes.forEach(c => { if (!/^[A-Z2-9]{16}$/.test(c)) fail('Familiencode: 16 Zeichen aus A-Z und 2-9 (falsch: „' + c.slice(0, 4) + '…“, ' + c.length + ' Zeichen)'); });
if (new Set(codes).size !== codes.length) fail('Ein Code kommt doppelt vor');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules.template'), 'utf8');
const block = /    match \/families\/FAMILIENCODE\/\{document=\*\*\} \{\n[\s\S]*?\n    \}\n/.exec(tpl);
if (!block) fail('Die Vorlage hat keinen Familienblock (match /families/FAMILIENCODE/…)');
const out = tpl.replace(block[0], codes.map(c => block[0].replace('FAMILIENCODE', c)).join(''));
if (outFile) fs.writeFileSync(outFile, out); else process.stdout.write(out);
