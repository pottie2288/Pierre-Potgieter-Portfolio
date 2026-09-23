import numpy as np
from PIL import Image, ImageFilter
W, H = 2880, 2160
src = Image.open('/Users/pierrewerk/Desktop/Pierre Potgieter.co.za/public/portrait.png').convert('RGBA')
fig = src.crop((30, 473, 1182, 1800))           # tight bbox of the cut-out
top_frac = 0.33
s = (H - top_frac * H) / fig.height
fig = fig.resize((round(fig.width * s), round(fig.height * s)), Image.LANCZOS)
fig = fig.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))

# Studio backdrop: horizontal tone curve sampled from the reference, soft vertical falloff, film grain
xs = np.linspace(0, 1, W)
kx = [0, .3, .65, .85, 1]; kv = [214, 206, 222, 229, 228]
row = np.interp(xs, kx, kv)
ys = np.linspace(0, 1, H)[:, None]
bg = row[None, :] + (ys - 0.5) * 4 + (np.abs(ys - 0.55) ** 2) * -10
rng = np.random.default_rng(7)
bg = bg + rng.normal(0, 2.2, (H, W))
bg = Image.fromarray(np.clip(bg, 0, 255).astype('uint8')).convert('RGBA')

x0 = (W - fig.width) // 2
y0 = H - fig.height
# Soft contact shadow behind the figure (studio depth)
alpha = fig.getchannel('A')
sh = Image.new('L', (W, H), 0); sh.paste(alpha, (x0 + 40, y0 + 30))
sh = sh.filter(ImageFilter.GaussianBlur(60)).point(lambda v: int(v * 0.22))
dark = Image.new('RGBA', (W, H), (40, 40, 40, 255))
bg = Image.composite(dark, bg, sh)
# Grain on the figure too, so it sits in the same "photo"
fa = np.array(fig).astype(float)
fa[..., :3] += rng.normal(0, 3.0, fa[..., :3].shape)
fig = Image.fromarray(np.clip(fa, 0, 255).astype('uint8'), 'RGBA')
bg.alpha_composite(fig, (x0, y0))
out = bg.convert('L').convert('RGB')
out.save('hero-master.png')
print(fig.size, x0, y0, s)
