import json, re, math, sys
import numpy as np
from PIL import Image
s = json.load(open('sig3.json')); SC = 2.0; OY = 60  # raster = 2x viewBox, origin y 60
fill = np.array(Image.open('cov-fill.png').convert('L')) > 128
H, W = fill.shape
R = s['pen'] / 2 * SC
yy, xx = np.mgrid[-int(R)-1:int(R)+2, -int(R)-1:int(R)+2]; disk = (xx**2 + yy**2) <= R*R
revealed = np.zeros_like(fill)
def parse(d):
    subs = []
    for sub in re.split(r'(?=M)', d):
        if not sub.strip(): continue
        nums = list(map(float, re.findall(r'-?\d+\.?\d*', sub)))
        subs.append([(nums[i], nums[i+1]) for i in range(0, len(nums), 2)])
    return subs
def stamp(x, y):
    cx, cy = int(round(x*SC)), int(round((y-OY)*SC)); r = disk.shape[0]//2
    y0, y1, x0, x1 = max(cy-r,0), min(cy+r+1,H), max(cx-r,0), min(cx+r+1,W)
    if y0>=y1 or x0>=x1: return 0
    d = disk[y0-(cy-r):y1-(cy-r), x0-(cx-r):x1-(cx-r)]
    new = fill[y0:y1, x0:x1] & d & ~revealed[y0:y1, x0:x1]
    revealed[y0:y1, x0:x1] |= (fill[y0:y1, x0:x1] & d)
    return int(new.sum())
report, newpens = [], []
STEP, DEAD_MIN = 1.0, 8.0   # sample every 1 unit; drop dead runs longer than 8 units
for li, d in enumerate(s['pens']):
    kept_subs = []; dead_total = 0; total = 0
    for pts in parse(d):
        samples = []
        for (x0,y0),(x1,y1) in zip(pts, pts[1:]):
            L = math.hypot(x1-x0, y1-y0); n = max(1, int(L/STEP))
            for k in range(n): t=k/n; samples.append((x0+(x1-x0)*t, y0+(y1-y0)*t))
        samples.append(pts[-1])
        live = [stamp(x,y) > 2 for x,y in samples]
        # group into runs; short dead runs stay (keeps the stroke continuous)
        runs, cur = [], [samples[0]]; curlive = live[0]
        for p, l in zip(samples[1:], live[1:]):
            if l == curlive: cur.append(p)
            else: runs.append((curlive, cur)); cur = [cur[-1], p]; curlive = l
        runs.append((curlive, cur))
        seg = []
        for isLive, run in runs:
            length = sum(math.hypot(b[0]-a[0], b[1]-a[1]) for a,b in zip(run, run[1:])); total += length
            if not isLive and length > DEAD_MIN:
                dead_total += length
                if len(seg) > 1: kept_subs.append(seg)
                seg = []
            else: seg = seg + run if not seg else seg + run[1:]
        if len(seg) > 1: kept_subs.append(seg)
    report.append(f"pen {li}: length {total:.0f}, dead {dead_total:.0f} ({100*dead_total/max(total,1):.0f}%)")
    f = lambda v: f"{v:.1f}".rstrip('0').rstrip('.')
    newpens.append(''.join('M' + 'L'.join(f"{f(x)} {f(y)}" for x,y in seg[::2] + ([seg[-1]] if len(seg)%2==0 else [])) for seg in kept_subs))
print('\n'.join(report)); print('uncovered after trim', int((fill & ~revealed).sum()))
s['pens'] = newpens; json.dump(s, open('sig4.json','w'))
