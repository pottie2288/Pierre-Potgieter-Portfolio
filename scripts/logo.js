const fk = require('fontkit'); const fs = require('fs');
const font = fk.openSync('Archivo.ttf').getVariation({ wght: +process.argv[3] || 300, wdth: 125 });
const CAP_TOP = 26, BASE = 138, H = 165;           // same vertical metrics as the reference wordmark
const k = (BASE - CAP_TOP) / font.capHeight;        // font units -> viewBox units
const track = 0.02 * font.unitsPerEm * k;
function word(text, x0) {
  const run = font.layout(text); let x = x0; const d = [];
  run.glyphs.forEach((g, i) => {
    const p = g.path.scale(k, -k).translate(x, BASE);
    d.push(p.toSVG()); x += run.positions[i].xAdvance * k + track;
  });
  return { d: d.join(''), x: x - track };
}
const f = n => +n.toFixed(2);
// Tall thin bracket like the reference: 0 -> 165, stem ~9, feet ~27 x 7
function bracket(x, left) {
  const stem = 9, foot = 27, t = 7;
  if (left) return `M${f(x)} 0H${f(x + foot)}V${t}H${f(x + stem)}V${H - t}H${f(x + foot)}V${H}H${f(x)}Z`;
  return `M${f(x + foot)} 0H${f(x)}V${t}H${f(x + foot - stem)}V${H - t}H${f(x)}V${H}H${f(x + foot)}Z`;
}
const mode = process.argv[2];
let paths = [], x = 0, gap = 0.28 * font.unitsPerEm * k;
if (mode === 'nav') {
  const a = word('PIERRE', 0); paths.push(a.d); x = a.x + gap;
  paths.push(bracket(x, true)); x += 27 + 12;
  const b = word('POTGIETER', x); paths.push(b.d); x = b.x + 12;
  paths.push(bracket(x, false)); x += 27;
} else {
  const a = word('PIERRE POTGIETER.', 0); paths.push(a.d); x = a.x;
}
const W = Math.ceil(x);
const vbTop = mode === 'nav' ? 0 : CAP_TOP - 2, vbH = mode === 'nav' ? H : BASE - CAP_TOP + 4;
const svgPaths = paths.map(p => `<path d="${p}" fill="currentColor"/>`).join('');
fs.writeFileSync(`logo-${mode}.json`, JSON.stringify({ viewBox: `0 ${vbTop} ${W} ${vbH}`, paths }));
fs.writeFileSync(`logo-${mode}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${vbTop} ${W} ${vbH}" width="1376">${svgPaths}</svg>`);
console.log(mode, W, vbH);
