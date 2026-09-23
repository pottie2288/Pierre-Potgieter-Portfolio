import { chromium } from 'playwright'; import path from 'path';
const b = await chromium.launch({ channel: 'chrome' });
for (const n of ['websites', 'google', 'social']) {
  const p = await b.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.resolve(`mock/${n}.html`), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.screenshot({ path: `mock/out-${n}.png` }); await p.close();
}
await b.close();
