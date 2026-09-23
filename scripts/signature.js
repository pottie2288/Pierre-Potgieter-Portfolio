// Signature = Allura (OFL) filled outlines, revealed by thick "pen" strokes that follow
// EMS Allure's single-line centrelines (traced from Allura), fitted per glyph by bbox.
const fs = require('fs'); const fk = require('fontkit');
const font = fk.openSync('Allura.ttf');
const ems = fs.readFileSync('node_modules/hersheytext/svg_fonts/EMSAllure.svg', 'utf8');
const TEXT = 'Pierre', SIZE = 300, BASE = 300, PEN = +(process.argv[2] || 34);
const k = SIZE / font.unitsPerEm; const f = n => +n.toFixed(1);
const emsGlyph = c => ems.match(new RegExp(`<glyph unicode="${c}"[^>]*d="([^"]+)"`))[1];
function chaikin(pts, n) { for (let r = 0; r < n; r++) { const o = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const [p, q] = [pts[i], pts[i + 1]]; o.push([.75*p[0]+.25*q[0], .75*p[1]+.25*q[1]], [.25*p[0]+.75*q[0], .25*p[1]+.75*q[1]]); } o.push(pts[pts.length - 1]); pts = o; } return pts; }
const run = font.layout(TEXT); let x = 20; const fills = [], pens = [];
run.glyphs.forEach((g, i) => {
  const path = g.path.scale(k, -k).translate(x, BASE);
  fills.push(path.toSVG());
  const bb = path.bbox; // target box in page units
  const subs = emsGlyph(TEXT[i]).trim().split(/(?=M)/).map(s => { const n = s.replace(/[ML]/g, ' ').trim().split(/\s+/).map(Number); const p = []; for (let j = 0; j < n.length; j += 2) p.push([n[j], -n[j + 1]]); return p; });
  const all = subs.flat(); const mnx = Math.min(...all.map(p => p[0])), mxx = Math.max(...all.map(p => p[0])), mny = Math.min(...all.map(p => p[1])), mxy = Math.max(...all.map(p => p[1]));
  // centrelines sit inside the outline: inset target box by ~half a stroke
  const ins = PEN * 0.25;
  const sx = (bb.maxX - bb.minX - 2 * ins) / (mxx - mnx), sy = (bb.maxY - bb.minY - 2 * ins) / (mxy - mny);
  const letter = subs.map(p => 'M' + chaikin(p.map(q => [bb.minX + ins + (q[0] - mnx) * sx, bb.minY + ins + (q[1] - mny) * sy]), 3).map(q => `${f(q[0])} ${f(q[1])}`).join('L')).join('');
  pens.push(letter);
  x += run.positions[i].xAdvance * k;
});
// Tapered underline swash (thin → thick → thin), revealed left to right by its own pen stroke
const x0 = 40, x1 = x + 40, yb = BASE + 42;
const P = t => { const u = 1 - t; const c = [[x0, yb], [x0 + (x1 - x0) * .45, yb + 6], [x1 - 60, yb - 4], [x1, yb - 46]]; return [u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0], u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]]; };
const N = 80, top = [], bot = [], mid = [];
for (let i = 0; i <= N; i++) { const t = i / N, p = P(t), q = P(Math.min(1, t + 0.001)), a = Math.atan2(q[1] - p[1], q[0] - p[0]) || 0; const w = 5.5 * Math.pow(Math.sin(Math.PI * Math.min(t * 1.15, 1)), 0.7) + 0.6; top.push([p[0] - Math.sin(a) * w, p[1] + Math.cos(a) * w]); bot.push([p[0] + Math.sin(a) * w, p[1] - Math.cos(a) * w]); mid.push(p); }
fills.push('M' + [...top, ...bot.reverse()].map(q => `${f(q[0])} ${f(q[1])}`).join('L') + 'Z');
pens.push('M' + mid.map(q => `${f(q[0])} ${f(q[1])}`).join('L'));
const vb = `0 60 ${Math.ceil(x1 + 30)} 340`;
fs.writeFileSync('sig3.json', JSON.stringify({ viewBox: vb, pen: PEN, fills, pens }));
const fillD = fills.map(d => `<path d="${d}" fill="currentColor"/>`).join('');
const penD = pens.map(d => `<path d="${d}" stroke="#ff3b3b" stroke-width="2" fill="none"/>`).join('');
const penW = pens.map(d => `<path d="${d}" stroke="#fff" stroke-width="${PEN}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`).join('');
fs.writeFileSync('sig3-overlay.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="1100" style="color:#e2e1e1">${fillD}${penD}</svg>`);
fs.writeFileSync('sig3-coverage.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="1100"><g opacity=".35">${penW}</g><g style="color:#1d1">${fillD}</g></svg>`);
console.log(vb, JSON.stringify({ fills, pens }).length);
