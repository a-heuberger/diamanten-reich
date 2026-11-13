// Zeichnet die App-Symbole (funkelnder Diamant vor einer kleinen Schatztruhe auf Türkis) nach assets/. Aufruf: node tools/icons.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const root = path.resolve(__dirname, '..');
  const src = ['logic.js', 'svg.js'].map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('\n');
  // name, Kantenlänge, Anteil der Fläche, den das Motiv nutzt (maskable: kleiner, damit nichts abgeschnitten wird)
  const targets = [['icon-512', 512, 1], ['icon-192', 192, 1], ['icon-180', 180, 1], ['icon-maskable-512', 512, 0.76]];
  const b = await chromium.launch();
  for (const [name, S, k] of targets) {
    const page = await b.newPage({ viewport: { width: S, height: S }, deviceScaleFactor: 1 });
    const html = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:' + S + 'px;height:' + S + 'px;overflow:hidden}' +
      'body{position:relative;background:radial-gradient(90% 80% at 50% 30%,#3fe0d8 0%,#13a3a6 45%,#0b5563 100%)}' +
      '.sp{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 0 ' + S * .006 + 'px,transparent ' + S * .008 + 'px);background-size:' + S / 5 + 'px ' + S / 5 + 'px;opacity:.5}' +
      '.m{position:absolute;left:50%;top:50%;width:' + S * k + 'px;height:' + S * k + 'px;transform:translate(-50%,-50%)}' +
      '.c{position:absolute;left:18%;bottom:6%;width:64%;opacity:.95}.c svg,.g svg{width:100%;height:auto;display:block}' +
      '.g{position:absolute;left:17%;top:8%;width:66%;filter:drop-shadow(0 ' + S * .02 + 'px ' + S * .03 + 'px rgba(7,61,72,.5)) drop-shadow(0 0 ' + S * .04 + 'px rgba(255,255,255,.6))}</style></head><body>' +
      '<div class="sp"></div><div class="m"><div class="c" id="c"></div><div class="g" id="g"></div></div>' +
      '<script>\n' + src + '\ndocument.body.insertAdjacentHTML("afterbegin", SVG_DEFS);document.getElementById("c").innerHTML=chestSVG(.5,100);document.getElementById("g").innerHTML=gemSVG("weiss",100);<\/script></body></html>';
    await page.setContent(html); await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(root, 'assets', name + '.png'), omitBackground: false });
    await page.close();
  }
  await b.close();
  console.log('Symbole geschrieben:', targets.map(t => t[0]).join(', '));
})();
