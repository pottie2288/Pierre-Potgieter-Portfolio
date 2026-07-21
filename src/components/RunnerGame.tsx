"use client";

import { useEffect, useRef, useCallback } from "react";

// ── tunables ──────────────────────────────────────────────────────────────────
const GRAVITY        = 0.32;
const JUMP_FORCE     = -11.0;
const SPEED_START    = 3.0;
const SPEED_MAX      = 11.0;
const SPEED_INC      = 0.00055;
const FOX_W          = 48;
const FOX_H          = 56;
const FOX_X          = 110;
const GROUND_OFFSET  = 66;
const COYOTE_FRAMES  = 7;
const JUMP_BUFFER    = 6;
const HIT_MARGIN     = 10;

// ── Mario world colours ───────────────────────────────────────────────────────
const M_RED    = "#E52222";
const M_BLUE   = "#0044AA";
const M_SKIN   = "#FFD5A8";
const M_BROWN  = "#5B3300";
const M_SHOE   = "#4A2800";
const M_YEL    = "#FFD700";
const M_WHT    = "#FFFFFF";
const M_HILL   = "#00A800";
const M_HILL2  = "#007000";
const M_PIPE   = "#00A800";
const M_PIPE2  = "#006800";
const M_GND2   = "#943200";
const M_COIN   = "#FFB800";

// ── sprite images ─────────────────────────────────────────────────────────────
// Loaded as plain HTMLImageElement — no canvas processing, no CORS risk,
// guaranteed visible regardless of background colour.
const IMGS: {
  mario:   HTMLImageElement | null;
  goomba:  HTMLImageElement | null;
  koopa:   HTMLImageElement | null;
  koopa2:  HTMLImageElement | null;
  piranha: HTMLImageElement | null;
} = { mario: null, goomba: null, koopa: null, koopa2: null, piranha: null };

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(new Image());   // empty — falls back to placeholder
    img.src = src;
  });
}

// Draw the full image scaled into the destination rect, with optional flip.
function drawImg(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  dx: number, dy: number, dw: number, dh: number,
  flipX = false,
): boolean {
  if (!img || !img.naturalWidth) return false;
  ctx.save();
  if (flipX) {
    ctx.translate(dx + dw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, dy, dw, dh);
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.restore();
  return true;
}

// ── types ─────────────────────────────────────────────────────────────────────
type State = "idle" | "playing" | "dying" | "dead";
type Kind  = "goomba" | "koopa" | "koopa2" | "piranha";

interface Obs   { x: number; w: number; h: number; kind: Kind; }
interface Part  { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; r: number; gravity?: number; }
interface Toast { text: string; life: number; color: string; }

interface G {
  state: State; vy: number; foxY: number; onGround: boolean;
  coyote: number; jumpBuffer: number; jumpCount: number;
  squashX: number; squashY: number;
  obstacles: Obs[]; particles: Part[];
  score: number; hi: number; speed: number; frame: number;
  nextObs: number; animId: number; legPhase: number;
  shake: number; shakeX: number; shakeY: number;
  deathTick: number; toast: Toast | null; lastToast: number;
  flashAlpha: number; nightT: number; hiNew: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b-a)*t; }
function rnd(min: number, max: number)          { return min + Math.random()*(max-min); }

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fill?: string, stroke?: string, lw = 1,
) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
  ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
  ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
  if (fill)   { ctx.fillStyle=fill;     ctx.fill(); }
  if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=lw; ctx.stroke(); }
}

// ── particles ─────────────────────────────────────────────────────────────────
function spawnDust(ps: Part[], x: number, y: number, count = 3) {
  for (let i = 0; i < count; i++)
    ps.push({ x:x+rnd(-6,6), y, vx:rnd(-1.5,-0.3), vy:rnd(-1.5,0.5),
      life:1, maxLife:1, color:M_GND2, r:rnd(2,4), gravity:0.06 });
}
function spawnJumpBurst(ps: Part[], x: number, y: number) {
  for (let i = 0; i < 8; i++) {
    const a = Math.PI+rnd(-0.6,0.6), s = rnd(1.5,4);
    ps.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:1, maxLife:1,
      color: i%3===0?M_COIN:i%3===1?M_YEL:M_WHT, r:rnd(2,4.5), gravity:0.1 });
  }
}
function spawnDeathBurst(ps: Part[], x: number, y: number) {
  const cols = [M_RED,M_YEL,M_COIN,"#FF6060",M_WHT,M_BLUE,"#FF9999"];
  for (let i = 0; i < 28; i++) {
    const a = rnd(0,Math.PI*2), s = rnd(2,9);
    ps.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s-3, life:1, maxLife:1,
      color:cols[Math.floor(Math.random()*cols.length)], r:rnd(2,6), gravity:0.18 });
  }
}

// ── background ────────────────────────────────────────────────────────────────

// Cloud drawn as a single unified 2-D shape.
// Three heavily-overlapping bumps (centre tallest) + a flat base, rendered as
// one solid fill so there are no visible seam lines between the bubbles.
function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, sc: number) {
  const r = 22 * sc;

  const render = (color: string, pad: number) => {
    ctx.fillStyle = color;
    // Centre bump — largest & highest; dominates the silhouette
    ctx.beginPath(); ctx.arc(cx,           cy - r*0.28, r        + pad, 0, Math.PI*2); ctx.fill();
    // Left bump — overlaps centre by ~80 % of r so no gap shows
    ctx.beginPath(); ctx.arc(cx - r*0.70,  cy + r*0.08, r*0.68   + pad, 0, Math.PI*2); ctx.fill();
    // Right bump — mirror of left
    ctx.beginPath(); ctx.arc(cx + r*0.70,  cy + r*0.08, r*0.68   + pad, 0, Math.PI*2); ctx.fill();
    // Solid base rect — wide enough to cover the outer edge of every bump
    ctx.fillRect(
      Math.round(cx - r*1.46 - pad), Math.round(cy + r*0.36),
      Math.round(r*2.92 + pad*2),    Math.round(r*0.48 + pad),
    );
  };

  render("#111111", 3);   // black outline (drawn slightly larger)
  render(M_WHT,     0);   // white body on top

  // Tiny highlight oval — gives the cloud a subtle 3-D feel
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.ellipse(cx - r*0.14, cy - r*0.66, r*0.28, r*0.13, -0.3, 0, Math.PI*2);
  ctx.fill();
}

// Single Mario-style hill with highlight stripe and decorative dots.
function drawHill(ctx: CanvasRenderingContext2D, cx: number, groundY: number, r: number, main: string, hi: string) {
  ctx.fillStyle = main;
  ctx.beginPath(); ctx.arc(cx, groundY, r, Math.PI, 0); ctx.fill();

  // Lighter top highlight arc
  ctx.fillStyle = hi;
  ctx.beginPath();
  ctx.arc(cx - r*0.08, groundY - r*0.45, r*0.42, Math.PI*1.15, Math.PI*1.85);
  ctx.fill();

  // Three decorative dots on the hill face (classic SMB touch)
  ctx.fillStyle = hi;
  [[-r*0.42, -r*0.18], [0, -r*0.28], [r*0.42, -r*0.18]].forEach(([dx, dy]) => {
    ctx.beginPath(); ctx.arc(cx + dx, groundY + dy, r*0.07, 0, Math.PI*2); ctx.fill();
  });
}

function drawBg(ctx: CanvasRenderingContext2D, W: number, H: number, frame: number, nightT: number) {
  const groundY = H - GROUND_OFFSET;

  // ── Sky ──────────────────────────────────────────────────────────────────────
  // Day: classic Mario blue (#5C94FC → #90C0FF horizon)
  // Underground: near-black purple cave
  if (nightT < 0.5) {
    const t = nightT / 0.5;
    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0,   `rgb(${Math.round(lerp(72,20,t))},${Math.round(lerp(132,15,t))},${Math.round(lerp(238,50,t))})`);
    grad.addColorStop(0.6, `rgb(${Math.round(lerp(92,25,t))},${Math.round(lerp(160,20,t))},${Math.round(lerp(255,60,t))})`);
    grad.addColorStop(1,   `rgb(${Math.round(lerp(120,30,t))},${Math.round(lerp(185,25,t))},${Math.round(lerp(255,70,t))})`);
    ctx.fillStyle = grad;
  } else {
    // Underground cave
    const t = (nightT - 0.5) / 0.5;
    ctx.fillStyle = `rgb(${Math.round(lerp(20,8,t))},${Math.round(lerp(15,5,t))},${Math.round(lerp(50,20,t))})`;
  }
  ctx.fillRect(0, 0, W, H);

  // ── Underground: cave stalactites silhouette ──────────────────────────────
  if (nightT > 0.45) {
    const a = Math.min(1, (nightT - 0.45) / 0.3);
    ctx.globalAlpha = a;
    ctx.fillStyle = "#0A0518";
    for (let i = 0; i < 12; i++) {
      const sx = ((i * 173 - frame * 0.08) % (W + 120) + W + 120) % (W + 120) - 60;
      const sh = 28 + (i * 37) % 40;
      const sw = 18 + (i * 29) % 24;
      ctx.beginPath();
      ctx.moveTo(sx - sw/2, 0); ctx.lineTo(sx + sw/2, 0); ctx.lineTo(sx, sh);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ── Stars (underground + late-game) ─────────────────────────────────────────
  if (nightT > 0.2) {
    for (let i = 0; i < 28; i++) {
      const sx = (i*137*19) % W, sy = (i*71*13) % (groundY * 0.75);
      const tw = Math.sin(frame*0.04 + i*0.7)*0.4 + 0.6;
      ctx.globalAlpha = nightT * tw * 0.85;
      ctx.fillStyle = M_WHT;
      ctx.beginPath(); ctx.arc(sx, sy, 1.1, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ── Background mountain silhouettes (far layer, very faint blue-grey) ───────
  if (nightT < 0.7) {
    ctx.globalAlpha = (1 - nightT/0.7) * 0.55;
    ctx.fillStyle = "#6A90D8";
    for (let i = 0; i < 6; i++) {
      const mx = ((i * 190 - frame * 0.06) % (W + 220) + W + 220) % (W + 220) - 110;
      // Jagged mountain triangle
      ctx.beginPath();
      ctx.moveTo(mx - 90, groundY);
      ctx.lineTo(mx,       groundY - 90);
      ctx.lineTo(mx + 90,  groundY);
      ctx.closePath(); ctx.fill();
      // Snow cap
      ctx.fillStyle = "#C8DCF4";
      ctx.beginPath();
      ctx.moveTo(mx - 20, groundY - 68);
      ctx.lineTo(mx,       groundY - 90);
      ctx.lineTo(mx + 20,  groundY - 68);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#6A90D8";
    }
    ctx.globalAlpha = 1;
  }

  // ── Back hills (dark green, slow parallax) ───────────────────────────────────
  if (nightT < 0.85) {
    ctx.globalAlpha = 1 - nightT / 0.85;
    for (let i = 0; i < 5; i++) {
      const hx = ((i * 250 - frame * 0.10) % (W + 300) + W + 300) % (W + 300) - 150;
      drawHill(ctx, hx, groundY, 105, "#1C8A00", "#3DB800");
    }
    ctx.globalAlpha = 1;
  }

  // ── Front hills (bright green, faster parallax) ──────────────────────────────
  if (nightT < 0.75) {
    ctx.globalAlpha = 1 - nightT / 0.75;
    for (let i = 0; i < 5; i++) {
      const hx = ((i * 200 + 90 - frame * 0.20) % (W + 240) + W + 240) % (W + 240) - 120;
      drawHill(ctx, hx, groundY, 76, "#2CB800", "#5AE020");
    }
    ctx.globalAlpha = 1;
  }

  // ── Clouds — desktop only (canvas wider than 600 px) ────────────────────────
  if (nightT < 0.65 && W > 600) {
    ctx.globalAlpha = Math.min(1, 1 - nightT / 0.65);
    const cloudLayers = [
      { speed:0.08, yF:0.12, sc:1.6, gap:380, off:0 },
      { speed:0.14, yF:0.22, sc:1.1, gap:300, off:150 },
      { speed:0.22, yF:0.32, sc:0.70, gap:210, off:80 },
    ];
    for (const { speed, yF, sc, gap, off } of cloudLayers) {
      for (let i = 0; i < 5; i++) {
        const cx = ((i*gap + off - frame*speed) % (W+gap) + W+gap) % (W+gap) - gap/2;
        drawCloud(ctx, cx, H * yF, sc);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// ── ground ────────────────────────────────────────────────────────────────────
function drawGround(ctx: CanvasRenderingContext2D, W: number, groundY: number, frame: number, speed: number, nightT: number) {
  const gR=Math.round(lerp(200,55,nightT)), gG=Math.round(lerp(75,40,nightT)), gB=Math.round(lerp(0,20,nightT));
  const dR=Math.round(lerp(148,35,nightT)), dG=Math.round(lerp(50,25,nightT));
  ctx.fillStyle=`rgb(${gR},${gG},${gB})`; ctx.fillRect(0,groundY,W,GROUND_OFFSET);
  const dark=`rgb(${dR},${dG},0)`, bH=14, bW=32, m=2, scroll=(frame*speed*0.55)%bW;
  ctx.fillStyle=dark;
  for (let row=0;row<5;row++) ctx.fillRect(0,groundY+row*bH,W,m);
  for (let row=0;row<5;row++) {
    const rowOff=row%2===0?scroll:scroll+bW/2;
    for (let col=-2;col<W/bW+2;col++) { ctx.fillStyle=dark; ctx.fillRect(Math.round(col*bW-(rowOff%bW)),groundY+m+row*bH,m,bH-m); }
  }
}

// ── character (placeholder until sprite sheets provided) ──────────────────────
function drawMarioPlaceholder(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  legPhase: number, isAir: boolean,
) {
  const hat   = M_RED;
  const shirt = M_RED;
  const lbl   = "M";
  const lf    = Math.floor(legPhase) % 4;
  const pr = (rx:number,ry:number,rw:number,rh:number,c:string) => {
    ctx.fillStyle=c; ctx.fillRect(Math.round(x+rx*w),Math.round(y+ry*h),Math.max(1,Math.round(rw*w)),Math.max(1,Math.round(rh*h)));
  };
  // hat
  pr(0.22,0.00,0.56,0.14,hat); pr(0.10,0.13,0.80,0.09,hat);
  ctx.fillStyle=M_WHT; ctx.font=`bold ${Math.floor(w*0.28)}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(lbl,x+w*0.50,y+h*0.08);
  // face
  pr(0.06,0.20,0.14,0.07,M_BROWN); pr(0.80,0.20,0.14,0.07,M_BROWN);
  pr(0.20,0.20,0.60,0.22,M_SKIN); pr(0.26,0.22,0.12,0.09,M_BROWN); pr(0.62,0.22,0.12,0.09,M_BROWN);
  pr(0.40,0.27,0.20,0.09,"#E8A87C"); pr(0.15,0.33,0.30,0.09,M_BROWN); pr(0.55,0.31,0.30,0.09,M_BROWN);
  // body
  pr(0.04,0.40,0.18,0.30,shirt); pr(0.78,0.40,0.18,0.30,shirt);
  pr(0.22,0.40,0.56,0.33,M_BLUE); pr(0.28,0.42,0.10,0.07,M_YEL); pr(0.62,0.42,0.10,0.07,M_YEL);
  // arms
  if (isAir) { pr(0.00,0.22,0.14,0.20,M_SKIN); pr(0.86,0.22,0.14,0.20,M_SKIN); }
  else { const af=lf%2; if(af===0){pr(0.00,0.40,0.12,0.18,M_SKIN);pr(0.88,0.44,0.12,0.18,M_SKIN);}else{pr(0.00,0.44,0.12,0.18,M_SKIN);pr(0.88,0.40,0.12,0.18,M_SKIN);} }
  // legs
  if (isAir)       { pr(0.22,0.73,0.22,0.15,M_BLUE);pr(0.56,0.73,0.22,0.15,M_BLUE);pr(0.16,0.86,0.30,0.13,M_SHOE);pr(0.54,0.86,0.30,0.13,M_SHOE); }
  else if (lf===0) { pr(0.22,0.73,0.22,0.20,M_BLUE);pr(0.56,0.73,0.22,0.20,M_BLUE);pr(0.18,0.87,0.28,0.12,M_SHOE);pr(0.54,0.87,0.28,0.12,M_SHOE); }
  else if (lf===1) { pr(0.12,0.73,0.24,0.22,M_BLUE);pr(0.58,0.73,0.22,0.16,M_BLUE);pr(0.06,0.87,0.30,0.12,M_SHOE);pr(0.54,0.84,0.26,0.12,M_SHOE); }
  else if (lf===2) { pr(0.22,0.73,0.20,0.18,M_BLUE);pr(0.58,0.73,0.20,0.18,M_BLUE);pr(0.18,0.86,0.26,0.12,M_SHOE);pr(0.56,0.86,0.26,0.12,M_SHOE); }
  else             { pr(0.20,0.73,0.22,0.16,M_BLUE);pr(0.58,0.73,0.24,0.22,M_BLUE);pr(0.18,0.84,0.26,0.12,M_SHOE);pr(0.54,0.87,0.30,0.12,M_SHOE); }
  ctx.textBaseline="alphabetic";
}

function drawMario(
  ctx: CanvasRenderingContext2D,
  screenY: number, isAir: boolean,
  squashX: number, squashY: number,
  dead: boolean, deathTick: number,
  legPhase: number,
) {
  if (isAir && !dead) {
    const sc=Math.max(0.3,1-screenY/200);
    ctx.save(); ctx.translate(FOX_X+FOX_W/2,screenY+FOX_H+5); ctx.scale(sc,0.13);
    ctx.fillStyle="rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.arc(0,0,FOX_W*0.5,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  ctx.save();
  ctx.translate(FOX_X+FOX_W/2, screenY+FOX_H/2);
  if (dead) {
    ctx.rotate(Math.min(deathTick*0.12,Math.PI*1.5));
    const s=lerp(1,0.6,Math.min(deathTick/20,1)); ctx.scale(s,s);
  } else {
    ctx.scale(squashX,squashY);
  }
  ctx.translate(-FOX_W/2,-FOX_H/2);

  if (!drawImg(ctx, IMGS.mario, 0, 0, FOX_W, FOX_H))
    drawMarioPlaceholder(ctx, 0, 0, FOX_W, FOX_H, legPhase, isAir);

  ctx.restore();
}

// ── obstacles ─────────────────────────────────────────────────────────────────
// Sprites are drawn so their bottom sinks BELOW groundY — the transparent
// foot/stem padding at the bottom of the PNG hides behind the brick tiles,
// making the visible character appear to stand on the ground.

function drawGoomba(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, groundY: number) {
  // Sink 14 % of height into ground to hide any foot padding
  const sink = Math.round(h * 0.14);
  if (drawImg(ctx, IMGS.goomba, x, groundY - h + sink, w, h)) return;
  // placeholder
  const y = groundY - h;
  roundRect(ctx,x+w*0.1,y,w*0.8,h*0.45,4,"#7B3F00");
  roundRect(ctx,x+w*0.12,y+h*0.44,w*0.76,h*0.42,6,"#C57A2D");
  ctx.fillStyle=M_WHT;
  ctx.fillRect(Math.round(x+w*0.18),Math.round(y+h*0.42),Math.round(w*0.22),Math.round(h*0.16));
  ctx.fillRect(Math.round(x+w*0.60),Math.round(y+h*0.42),Math.round(w*0.22),Math.round(h*0.16));
  ctx.fillStyle="#000";
  ctx.fillRect(Math.round(x+w*0.24),Math.round(y+h*0.44),Math.round(w*0.10),Math.round(h*0.12));
  ctx.fillRect(Math.round(x+w*0.66),Math.round(y+h*0.44),Math.round(w*0.10),Math.round(h*0.12));
  roundRect(ctx,x+w*0.04,y+h*0.80,w*0.34,h*0.20,4,"#4A2800");
  roundRect(ctx,x+w*0.62,y+h*0.80,w*0.34,h*0.20,4,"#4A2800");
}

function drawKoopa(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, groundY: number) {
  const sink = Math.round(h * 0.14);
  if (drawImg(ctx, IMGS.koopa, x, groundY - h + sink, w, h)) return;
  // placeholder
  const y = groundY - h;
  roundRect(ctx,x+w*0.10,y+h*0.24,w*0.80,h*0.62,10,M_PIPE);
  roundRect(ctx,x+w*0.04,y+h*0.04,w*0.42,h*0.26,6,M_PIPE);
  ctx.fillStyle=M_WHT; ctx.beginPath(); ctx.ellipse(x+w*0.28,y+h*0.12,w*0.10,h*0.09,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#FFD080";
  roundRect(ctx,x+w*0.08,y+h*0.83,w*0.28,h*0.17,3,"#FFD080");
  roundRect(ctx,x+w*0.64,y+h*0.83,w*0.28,h*0.17,3,"#FFD080");
}

function drawKoopa2(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, groundY: number) {
  const sink = Math.round(h * 0.14);
  if (drawImg(ctx, IMGS.koopa2, x, groundY - h + sink, w, h)) return;
  // placeholder — slightly different colour so it's distinguishable from koopa
  const y = groundY - h;
  roundRect(ctx,x+w*0.10,y+h*0.24,w*0.80,h*0.62,10,"#CC4400");
  roundRect(ctx,x+w*0.04,y+h*0.04,w*0.42,h*0.26,6,"#CC4400");
  ctx.fillStyle=M_WHT; ctx.beginPath(); ctx.ellipse(x+w*0.28,y+h*0.12,w*0.10,h*0.09,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#FFD080";
  roundRect(ctx,x+w*0.08,y+h*0.83,w*0.28,h*0.17,3,"#FFD080");
  roundRect(ctx,x+w*0.64,y+h*0.83,w*0.28,h*0.17,3,"#FFD080");
}

// Piranha plant — standalone obstacle.
// Sunk 22 % into ground so the stem/pot base disappears behind the bricks.
function drawPiranha(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, groundY: number) {
  const sink = Math.round(h * 0.22);
  if (drawImg(ctx, IMGS.piranha, x, groundY - h + sink, w, h)) return;
  // placeholder
  const y = groundY - h, cx2 = x + w/2;
  ctx.fillStyle = "#007000";
  ctx.fillRect(Math.round(cx2-5), Math.round(y+h*0.52), 10, Math.round(h*0.48));
  ctx.fillStyle = "#CC0000";
  ctx.beginPath(); ctx.arc(cx2, y+h*0.34, w*0.42, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = M_WHT;
  ctx.beginPath(); ctx.arc(cx2, y+h*0.34, w*0.25, 0.05, Math.PI-0.05); ctx.fill();
}

function drawObs(ctx: CanvasRenderingContext2D, obs: Obs, groundY: number) {
  if      (obs.kind==="goomba")  drawGoomba (ctx,obs.x,obs.w,obs.h,groundY);
  else if (obs.kind==="koopa")   drawKoopa  (ctx,obs.x,obs.w,obs.h,groundY);
  else if (obs.kind==="koopa2")  drawKoopa2 (ctx,obs.x,obs.w,obs.h,groundY);
  else if (obs.kind==="piranha") drawPiranha(ctx,obs.x,obs.w,obs.h,groundY);
}

// ── particles ─────────────────────────────────────────────────────────────────
function tickParticles(ctx: CanvasRenderingContext2D, ps: Part[]): Part[] {
  const alive:Part[]=[];
  for (const p of ps) {
    p.vy+=p.gravity??0; p.x+=p.vx; p.y+=p.vy; p.life-=0.035;
    if (p.life<=0) continue;
    ctx.globalAlpha=Math.min(p.life,1)*0.9; ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill();
    alive.push(p);
  }
  ctx.globalAlpha=1; return alive;
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function drawHUD(ctx: CanvasRenderingContext2D, score:number, W:number, H:number) {
  // Score — top right, scales with canvas height for mobile readability
  const sz = Math.max(13, Math.round(H * 0.038));
  ctx.textAlign="right";
  ctx.font=`11px sans-serif`; ctx.fillStyle="#FF9999";
  ctx.fillText("MARIO", W-14, sz + 4);
  ctx.font=`bold ${sz}px sans-serif`; ctx.fillStyle=M_WHT;
  ctx.fillText(String(score).padStart(5,"0"), W-14, sz*2 + 4);
}
function drawToast(ctx:CanvasRenderingContext2D,toast:Toast,W:number,groundY:number) {
  const a=Math.min(toast.life,1-Math.max(0,1-toast.life*3))*1.2;
  ctx.globalAlpha=Math.min(a,1); ctx.font="bold 14px sans-serif"; ctx.textAlign="center";
  ctx.fillStyle=toast.color; ctx.fillText(toast.text,W/2,groundY*0.35-(1-toast.life)*20); ctx.globalAlpha=1;
}
function drawDeadOverlay(ctx:CanvasRenderingContext2D,score:number,hi:number,W:number,groundY:number,deathTick:number) {
  if (deathTick<28) return;
  const fi=Math.min((deathTick-28)/20,1), bw=320, bh=116, bx=W/2-bw/2, by=groundY/2-bh/2-8;
  ctx.globalAlpha=fi;
  roundRect(ctx,bx,by,bw,bh,6,"rgba(0,0,0,0.88)",M_RED,2.5);
  ctx.textAlign="center"; ctx.font="bold 17px sans-serif"; ctx.fillStyle=M_YEL; ctx.fillText("GAME  OVER",W/2,by+40);
  ctx.font="11px sans-serif"; ctx.fillStyle=M_WHT; ctx.fillText(`SCORE  ${String(score).padStart(5,"0")}    BEST  ${String(hi).padStart(5,"0")}`,W/2,by+64);
  ctx.fillStyle="rgba(255,255,255,0.40)"; ctx.fillText("TAP  OR  SPACE  TO  RETRY",W/2,by+90); ctx.globalAlpha=1;
}

// ── obstacle spawning ─────────────────────────────────────────────────────────
function spawnNextObstacle(r: G, canvasW: number) {
  // 4 obstacle types — perfectly even 25 % each for balanced, random feel.
  // Within each type, height is randomised so no two obstacles feel identical.
  const roll = Math.random();
  if (roll < 0.25) {
    r.obstacles.push({ x: canvasW + 20, w: 96,  h: rnd(115, 150), kind: "piranha" });
  } else if (roll < 0.50) {
    r.obstacles.push({ x: canvasW + 20, w: 68,  h: rnd(68,  90),  kind: "goomba" });
  } else if (roll < 0.75) {
    r.obstacles.push({ x: canvasW + 20, w: 76,  h: rnd(82,  106), kind: "koopa" });
  } else {
    r.obstacles.push({ x: canvasW + 20, w: 76,  h: rnd(82,  106), kind: "koopa2" });
  }
  // Gap shrinks as score rises so the game gets progressively harder
  const gap = Math.max(200, 440 - r.score * 0.20) + rnd(0, 130);
  r.nextObs = Math.round(gap / r.speed);
}

function hitTest(foxY:number,obs:Obs,groundY:number):boolean {
  const fl=FOX_X+HIT_MARGIN, fr=FOX_X+FOX_W-HIT_MARGIN;
  const ft=groundY-foxY-FOX_H+HIT_MARGIN, fb=groundY-foxY-HIT_MARGIN;
  // Shift the hitbox top to match the visual sprite position.
  // Sprites are drawn sunk into the ground (piranha 22%, others 14%),
  // so the visible top is higher than the raw bounding box top.
  const sinkFrac = obs.kind === "piranha" ? 0.22 : 0.14;
  const visTop = groundY - obs.h + Math.round(obs.h * sinkFrac) + 6;
  return fr>obs.x+6 && fl<obs.x+obs.w-6 && fb>visTop && ft<groundY-4;
}

// ── component ─────────────────────────────────────────────────────────────────
export default function RunnerGame() {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const W=useRef(900), H=useRef(220), GY=useRef(0), dpr=useRef(1);
  // Game loop keeps redrawing the canvas every frame even when the section
  // is scrolled out of view — this tracks visibility so the loop can stop
  // rescheduling itself instead of burning main-thread time site-wide.
  const isVisible=useRef(true);

  const g=useRef<G>({
    state:"idle",vy:0,foxY:0,onGround:true,coyote:0,jumpBuffer:0,jumpCount:0,
    squashX:1,squashY:1,obstacles:[],particles:[],
    score:0,hi:0,speed:SPEED_START,frame:0,nextObs:140,
    animId:0,legPhase:0,shake:0,shakeX:0,shakeY:0,
    deathTick:0,toast:null,lastToast:0,flashAlpha:0,nightT:0,hiNew:false,
  });

  const doJump=useCallback(()=>{
    const r=g.current;
    if (r.state==="idle")  { r.state="playing"; return; }
    if (r.state==="dead")  {
      Object.assign(r,{state:"playing",vy:0,foxY:0,onGround:true,coyote:0,jumpBuffer:0,jumpCount:0,squashX:1,squashY:1,
        obstacles:[],particles:[],score:0,speed:SPEED_START,frame:0,nextObs:140,
        shake:0,deathTick:0,toast:null,lastToast:0,flashAlpha:0,nightT:0,hiNew:false,legPhase:0}); return;
    }
    if (r.state==="dying") { r.jumpBuffer=JUMP_BUFFER; return; }
    if (r.onGround||r.coyote>0) {
      r.vy=JUMP_FORCE; r.jumpCount=1; r.coyote=0; r.squashX=0.8; r.squashY=1.25;
      spawnJumpBurst(r.particles,FOX_X+FOX_W/2,GY.current-r.foxY);
    } else { r.jumpBuffer=JUMP_BUFFER; }
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current; if (!canvas) return;
    const ctx=canvas.getContext("2d"); if (!ctx) return;
    const resize=()=>{ dpr.current=window.devicePixelRatio||1; W.current=canvas.offsetWidth; H.current=canvas.offsetHeight; GY.current=H.current-GROUND_OFFSET; canvas.width=W.current*dpr.current; canvas.height=H.current*dpr.current; };
    resize(); window.addEventListener("resize",resize);

    Promise.all([
      loadImg("/sprites/mario.png"),
      loadImg("/sprites/goomba.png"),
      loadImg("/sprites/koopa.png"),
      loadImg("/sprites/koopa2.png"),
      loadImg("/sprites/piranha.png"),
    ]).then(([mario,goomba,koopa,koopa2,piranha])=>{
      IMGS.mario=mario; IMGS.goomba=goomba; IMGS.koopa=koopa; IMGS.koopa2=koopa2; IMGS.piranha=piranha;
    });

    const loop=()=>{
      if (!isVisible.current) { g.current.animId=0; return; }
      const r=g.current, w=W.current, h=H.current, gy=GY.current;
      ctx.setTransform(dpr.current,0,0,dpr.current,0,0);
      if (r.shake>0){r.shakeX=rnd(-r.shake,r.shake);r.shakeY=rnd(-r.shake,r.shake);r.shake=Math.max(0,r.shake-0.8);}else{r.shakeX=0;r.shakeY=0;}
      ctx.save(); ctx.translate(r.shakeX,r.shakeY);
      drawBg(ctx,w,h,r.frame,r.nightT);

      if (r.state==="playing"||r.state==="dying") {
        r.frame++;
        if (r.state==="playing") {
          r.vy+=GRAVITY; r.foxY-=r.vy;
          const wasAir=!r.onGround;
          if (r.foxY<=0) {
            const wa=r.foxY<-2; r.foxY=0;r.vy=0;r.onGround=true;r.coyote=COYOTE_FRAMES;r.jumpCount=0;
            if(wa&&wasAir){r.squashX=1.25;r.squashY=0.72;spawnDust(r.particles,FOX_X+FOX_W/2,gy,5);}
            if(r.jumpBuffer>0){r.jumpBuffer=0;r.vy=JUMP_FORCE;r.jumpCount=1;r.squashX=0.8;r.squashY=1.25;spawnJumpBurst(r.particles,FOX_X+FOX_W/2,gy);}
          } else { r.onGround=false; if(wasAir)r.coyote=Math.max(0,r.coyote-1); }
          if(r.jumpBuffer>0)r.jumpBuffer--;
          r.squashX=lerp(r.squashX,1,0.18); r.squashY=lerp(r.squashY,1,0.18);
          r.speed=Math.min(SPEED_MAX,r.speed+SPEED_INC); r.nightT=Math.min(1,r.score/600);
          if(r.onGround)r.legPhase+=0.2+r.speed*0.04;

          r.obstacles=r.obstacles.map(o=>({...o,x:o.x-r.speed})).filter(o=>o.x+o.w>-120);
          r.nextObs--;
          if (r.nextObs<=0) spawnNextObstacle(r, w);

          const prev=r.score; r.score=Math.floor(r.frame/7);
          if(r.score>r.hi){r.hi=r.score;r.hiNew=true;}
          if(Math.floor(r.score/100)>Math.floor(prev/100)&&r.score>0)
            r.toast={text:r.score>=500?"★ SUPER STAR!":r.score>=300?"WAHOO! FASTER!":"★ SPEED UP!",life:1,color:M_YEL};

          for(const o of r.obstacles){
            if(hitTest(r.foxY,o,gy)){r.state="dying";r.deathTick=0;r.shake=10;r.flashAlpha=1;spawnDeathBurst(r.particles,FOX_X+FOX_W/2,gy-r.foxY-FOX_H/2);break;}
          }
          if(r.onGround&&r.frame%6===0)spawnDust(r.particles,FOX_X,gy,1);
        }
        if(r.state==="dying"){r.deathTick++;r.foxY-=r.vy;r.vy+=GRAVITY*0.5;r.flashAlpha=Math.max(0,r.flashAlpha-0.06);if(r.deathTick>55)r.state="dead";}
      }

      if(r.toast){r.toast.life-=0.018;if(r.toast.life<=0)r.toast=null;}
      drawGround(ctx,w,gy,r.frame,r.speed,r.nightT);
      r.obstacles.forEach(o=>drawObs(ctx,o,gy));
      r.particles=tickParticles(ctx,r.particles);
      drawMario(ctx,gy-r.foxY-FOX_H,!r.onGround,r.squashX,r.squashY,r.state==="dying",r.deathTick,r.legPhase);
      drawHUD(ctx,r.score,w,h);
      if(r.toast)drawToast(ctx,r.toast,w,gy);
      if(r.state==="dying"||r.state==="dead")drawDeadOverlay(ctx,r.score,r.hi,w,gy,r.deathTick);
      if(r.flashAlpha>0){ctx.fillStyle=`rgba(255,80,80,${r.flashAlpha*0.40})`;ctx.fillRect(0,0,w,h);}
      ctx.restore();
      r.animId=requestAnimationFrame(loop);
    };

    g.current.animId=requestAnimationFrame(loop);
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();doJump();}};
    window.addEventListener("keydown",onKey);

    const io=new IntersectionObserver((entries)=>{
      const wasVisible=isVisible.current;
      isVisible.current=entries[0].isIntersecting;
      if (isVisible.current && !wasVisible && g.current.animId===0) {
        g.current.animId=requestAnimationFrame(loop);
      }
    },{ rootMargin:"200px" });
    io.observe(canvas);

    return ()=>{cancelAnimationFrame(g.current.animId);window.removeEventListener("resize",resize);window.removeEventListener("keydown",onKey);io.disconnect();};
  },[doJump]);

  return (
    <section className="runner-section">
      <div className="runner-label">★ MARIO &amp; LUIGI ★</div>
      <canvas ref={canvasRef} className="runner-canvas" onClick={doJump} onTouchStart={e=>{e.preventDefault();doJump();}} />
      <p className="runner-hint">PRESS SPACE OR TAP TO JUMP</p>
      <div className="mario-bar">
        <div className="brick one" />
        <div className="tooltip-mario-container"><div className="box" /><div className="mush" /></div>
        <div className="brick two" />
      </div>
    </section>
  );
}
