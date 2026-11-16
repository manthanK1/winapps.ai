// The home hero's animated 3D grid: a canvas-2D renderer, painted under the
// ribbon (inside PageDepth). A grid of 3D points on a surface (the "studio
// curve" by default: a floor that bends up far behind the W like a photo
// backdrop, with a slight sideways bowl) is projected with simple perspective
// around the W, drifts toward the viewer in a seamless two-cell loop, tilts
// with the mouse, and lights up gold under the cursor. "+" markers sit on
// every second intersection. The W (position and size, written by the ribbon
// onto #hero-depth) is the vanishing point; its light is the CSS glow under
// this canvas (PageDepth: --depth-hero-glow-*).
// Decoration only: every failure is silent and leaves the static CSS grid.

export type GridShape = "studio" | "flat" | "globe";

export interface HeroGridConfig {
  shape: GridShape;
  /** Line colour (RGB) and alpha at full strength. */
  lineRgb: [number, number, number];
  lineAlpha: number;
  /** Marker and spotlight gold (RGB). */
  goldRgb: [number, number, number];
  markerAlpha: number;
  /** Markers on every Nth intersection (both directions). Even numbers keep the drift loop seamless. */
  markerEvery: number;
  /** Marker arm length in px at depth 6 (scaled by depth, clamped 1.5–5). */
  markerSize: number;
  /** Camera height above the floor and the grid's extent, in cells. */
  eyeHeight: number;
  halfCols: number;
  far: number;
  /** Studio curve: where the floor starts bending up, how fast, and the sideways bowl. */
  curveStart: number;
  curveRise: number;
  bowl: number;
  /** Globe: radius of the sphere, in cells. */
  globeRadius: number;
  /** Drift toward the viewer, in cells per second. */
  drift: number;
  /** Mouse tilt in radians at the hero edge, and its smoothing (0–1 per frame). */
  tiltYaw: number;
  tiltPitch: number;
  tiltEase: number;
  /** Spotlight radius in px and its peak alpha. */
  spotRadius: number;
  spotAlpha: number;
  /** How much the grid dims behind the hero text (0–1). */
  textDim: number;
  /** Phones, tablets and touch screens. */
  mobile: { halfCols: number; far: number; drift: number };
}

export const HERO_GRID_CONFIG: HeroGridConfig = {
  shape: "studio",
  lineRgb: [42, 138, 143],
  lineAlpha: 0.22,
  goldRgb: [242, 193, 78],
  markerAlpha: 0.5,
  markerEvery: 2,
  markerSize: 3.4,
  eyeHeight: 1.6,
  halfCols: 22,
  far: 34,
  curveStart: 11,
  curveRise: 0.03,
  bowl: 0.0035,
  globeRadius: 40,
  drift: 0.14,
  tiltYaw: 0.07,
  tiltPitch: 0.035,
  tiltEase: 0.05,
  spotRadius: 140,
  spotAlpha: 0.85,
  textDim: 0.72,
  mobile: { halfCols: 12, far: 26, drift: 0.07 },
};

const NEAR = 0.9; // first row's depth at phase 0, in cells
const CLIP = 0.35; // rows closer than this are not drawn
const PIVOT_Z = 8; // the tilt turns around this depth

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function mountHeroGrid(canvas: HTMLCanvasElement, wSource: HTMLElement, hero: HTMLElement | null, config: Partial<HeroGridConfig> = {}): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const base = { ...HERO_GRID_CONFIG, ...config };
  const media = (q: string) => (typeof matchMedia === "function" ? matchMedia(q) : null);
  const coarse = !!(media("(max-width: 768px)")?.matches || media("(pointer: coarse)")?.matches);
  const cfg = coarse ? { ...base, ...base.mobile } : base;
  const reducedMq = media("(prefers-reduced-motion: reduce)");
  let reduced = !!reducedMq?.matches;

  const rows = Math.ceil(cfg.far - NEAR) + 3;
  const cols = cfg.halfCols * 2 + 1;
  const SX = new Float32Array(rows * cols);
  const SY = new Float32Array(rows * cols);
  const OK = new Uint8Array(rows * cols);
  const RZ = new Float32Array(rows);
  const lineA = new Float32Array(rows);
  const farFade = NEAR + rows - 3; // rows reach zero alpha here, before new ones appear

  let w = 0, h = 0, dpr = 1;
  let phase = 0;
  let last = 0;
  let raf = 0;
  let visible = true;
  let mx = 0, my = 0, smx = 0, smy = 0; // tilt target and smoothed, -1..1
  let cx = -9999, cy = -9999, spot = 0, spotT = 0; // cursor in canvas px, spotlight strength
  let texts: { x: number; y: number; rx: number; ry: number }[] = [];
  const [lr, lg, lb] = cfg.lineRgb;
  const [gr, gg, gb] = cfg.goldRgb;
  // Marker colours from teal to gold, precomputed (no per-marker strings).
  const TINTS = Array.from({ length: 9 }, (_, n) => {
    const t = n / 8;
    return `rgb(${Math.round(lr + (gr - lr) * t)},${Math.round(lg + (gg - lg) * t)},${Math.round(lb + (gb - lb) * t)})`;
  });

  const shapeY = (x: number, z: number): number => {
    const floor = -cfg.eyeHeight;
    if (cfg.shape === "flat") return floor;
    if (cfg.shape === "globe") {
      const d2 = x * x + (z - NEAR) * (z - NEAR) * 0.6;
      const R = cfg.globeRadius;
      return floor + Math.sqrt(Math.max(0, R * R - d2)) - R;
    }
    const up = z > cfg.curveStart ? cfg.curveRise * (z - cfg.curveStart) ** 2 : 0;
    return floor + up + cfg.bowl * x * x;
  };

  // The W, written by the ribbon each frame; until then, the layout defaults.
  const readW = () => {
    const s = wSource.style;
    const px = (name: string) => {
      const v = s.getPropertyValue(name);
      return v.endsWith("px") ? parseFloat(v) : NaN;
    };
    const portrait = h > w;
    const x = px("--w-x"), y = px("--w-y"), size = px("--w-size");
    return {
      x: Number.isFinite(x) ? x : w * (portrait ? 0.5 : 0.59),
      y: Number.isFinite(y) ? y : h * (portrait ? 0.41 : 0.45),
      size: Number.isFinite(size) ? size : portrait ? w * 0.3 : h * 0.345,
    };
  };

  const measure = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    texts = [];
    for (const el of hero?.querySelectorAll<HTMLElement>(".hero__text > *") ?? []) {
      const t = el.getBoundingClientRect();
      if (!t.width || !t.height) continue;
      texts.push({ x: t.left - r.left + t.width / 2, y: t.top - r.top + t.height / 2, rx: t.width / 2 + 70, ry: t.height / 2 + 50 });
    }
  };

  const draw = () => {
    const W = readW();
    const f = h * 0.95; // focal length, px
    const yaw = smx * cfg.tiltYaw, pitch = -smy * cfg.tiltPitch;
    const cyaw = Math.cos(yaw), syaw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    // Project the surface. Row i sits at depth NEAR + i - phase (phase loops over two cells).
    for (let i = 0; i < rows; i++) {
      const z0 = NEAR + i - phase;
      RZ[i] = z0;
      lineA[i] = z0 < CLIP ? 0 : cfg.lineAlpha * smooth(CLIP, CLIP + 1.6, z0) * (1 - smooth(farFade - 9, farFade, z0)) * (1 - 0.35 * smooth(NEAR, farFade, z0));
      for (let j = 0; j < cols; j++) {
        const k = i * cols + j;
        const x0 = j - cfg.halfCols;
        const y0 = shapeY(x0, z0);
        // tilt: yaw about the vertical axis, then pitch, both around (0, 0, PIVOT_Z)
        const dz = z0 - PIVOT_Z;
        const x1 = x0 * cyaw - dz * syaw;
        const z1 = x0 * syaw + dz * cyaw;
        const y2 = y0 * cp - z1 * sp;
        const z2 = y0 * sp + z1 * cp + PIVOT_Z;
        if (z2 < CLIP) {
          OK[k] = 0;
          continue;
        }
        OK[k] = 1;
        SX[k] = W.x + (f * x1) / z2;
        SY[k] = W.y - (f * y2) / z2;
      }
    }

    // Lines: each row is one path at its depth's alpha; the cross lines in bands between rows.
    const all = new Path2D();
    ctx.lineWidth = 1;
    for (let i = 0; i < rows; i++) {
      if (lineA[i] < 0.004) continue;
      const p = new Path2D();
      let open = false;
      for (let j = 0; j < cols; j++) {
        const k = i * cols + j;
        if (!OK[k]) { open = false; continue; }
        if (open) { p.lineTo(SX[k], SY[k]); all.lineTo(SX[k], SY[k]); }
        else { p.moveTo(SX[k], SY[k]); all.moveTo(SX[k], SY[k]); open = true; }
      }
      ctx.strokeStyle = `rgba(${lr},${lg},${lb},${lineA[i].toFixed(3)})`;
      ctx.stroke(p);
      if (i + 1 < rows) {
        const a = (lineA[i] + lineA[i + 1]) / 2;
        if (a < 0.004) continue;
        const b = new Path2D();
        for (let j = 0; j < cols; j++) {
          const k = i * cols + j, k2 = k + cols;
          if (!OK[k] || !OK[k2]) continue;
          b.moveTo(SX[k], SY[k]); b.lineTo(SX[k2], SY[k2]);
          all.moveTo(SX[k], SY[k]); all.lineTo(SX[k2], SY[k2]);
        }
        ctx.strokeStyle = `rgba(${lr},${lg},${lb},${a.toFixed(3)})`;
        ctx.stroke(b);
      }
    }

    // "+" markers on every Nth intersection, sized by depth, gold near the W's gold end.
    // Markers under the cursor are kept for the spotlight pass.
    const R = cfg.spotRadius;
    const lit: number[] = [];
    const plus = (x: number, y: number, s: number) => {
      ctx.fillRect(x - s, y - 0.6, s * 2, 1.2);
      ctx.fillRect(x - 0.6, y - s, 1.2, s * 2);
    };
    const goldX = W.x + W.size * 0.75, goldY = W.y - W.size * 0.35, goldR = W.size * 1.3;
    const every = Math.max(1, Math.round(cfg.markerEvery));
    for (let i = 0; i < rows; i++) {
      if (i % every || lineA[i] < 0.004) continue;
      const z = RZ[i];
      const s = Math.min(5, Math.max(1.5, cfg.markerSize * (6 / z)));
      const a = Math.min(1, (cfg.markerAlpha * lineA[i]) / cfg.lineAlpha);
      for (let j = 0; j < cols; j += every) {
        const k = i * cols + j;
        if (!OK[k]) continue;
        const x = SX[k], y = SY[k];
        if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue;
        const t = Math.max(0, 1 - Math.hypot(x - goldX, y - goldY) / goldR) ** 1.5;
        ctx.fillStyle = TINTS[Math.round(t * (TINTS.length - 1))];
        ctx.globalAlpha = a;
        plus(x, y, s);
        if (spot > 0.01) {
          const ks = Math.max(0, 1 - Math.hypot(x - cx, y - cy) / R) * spot;
          if (ks > 0.02) lit.push(x, y, s, ks * Math.min(1, a / cfg.markerAlpha + 0.35));
        }
      }
    }
    ctx.globalAlpha = 1;

    // Masks (cached; rebuilt only when the W moves or the canvas resizes):
    // fade out toward the edges around the W...
    const masks = getMasks(W);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(masks.edge, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ...then the spotlight, after the edge mask so it works anywhere in the hero:
    // the same lines again in gold, fading out from the cursor, its markers brighter...
    if (spot > 0.01) {
      ctx.globalCompositeOperation = "source-over";
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, `rgba(${gr},${gg},${gb},${(cfg.spotAlpha * spot).toFixed(3)})`);
      g.addColorStop(0.6, `rgba(${gr},${gg},${gb},${(cfg.spotAlpha * spot * 0.35).toFixed(3)})`);
      g.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.3;
      ctx.stroke(all);
      ctx.lineWidth = 1;
      ctx.fillStyle = TINTS[TINTS.length - 1];
      for (let n = 0; n < lit.length; n += 4) {
        ctx.globalAlpha = Math.min(1, lit[n + 3] * 0.95);
        plus(lit[n], lit[n + 1], lit[n + 2] * 1.25);
      }
      ctx.globalAlpha = 1;
    }

    // ...and dim everything behind the hero text.
    if (masks.text) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(masks.text, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // A faint warm glow follows the cursor, behind the lines. (The W's own
    // light is the CSS glow under this canvas: same look, no per-frame cost.)
    if (spot > 0.01) {
      ctx.globalCompositeOperation = "destination-over";
      const rad = R * 1.3;
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      gl.addColorStop(0, `rgba(${gr},${gg},${gb},${(0.16 * spot).toFixed(3)})`);
      gl.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
      ctx.fillStyle = gl;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    }
    ctx.globalCompositeOperation = "source-over";
  };

  // Edge mask and text mask, drawn once into offscreen canvases (device px).
  let maskKey = "";
  let masks: { edge: HTMLCanvasElement; text: HTMLCanvasElement | null } = { edge: document.createElement("canvas"), text: null };
  const getMasks = (W: { x: number; y: number; size: number }) => {
    const key = `${Math.round(W.x / 4)}|${Math.round(W.y / 4)}|${Math.round(W.size / 4)}|${canvas.width}|${canvas.height}|${texts.length}`;
    if (key === maskKey) return masks;
    maskKey = key;
    const make = () => {
      const c = document.createElement("canvas");
      c.width = canvas.width;
      c.height = canvas.height;
      const m = c.getContext("2d")!;
      m.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { c, m };
    };
    const ellipse = (m: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, stops: [number, number][]) => {
      m.save();
      m.translate(x, y);
      m.scale(1, ry / rx);
      const g = m.createRadialGradient(0, 0, 0, 0, 0, rx);
      for (const [at, a] of stops) g.addColorStop(at, `rgba(0,0,0,${a})`);
      m.fillStyle = g;
      m.fillRect(-rx, -rx, rx * 2, rx * 2);
      m.restore();
    };
    const edge = make();
    ellipse(edge.m, W.x, W.y + W.size * 0.3, Math.max(w * 0.62, W.size * 2.6), h * 0.78, [[0, 1], [0.55, 0.85], [1, 0]]);
    let text: HTMLCanvasElement | null = null;
    if (texts.length) {
      const t = make();
      t.m.fillStyle = "#000";
      t.m.fillRect(0, 0, w, h);
      t.m.globalCompositeOperation = "destination-out";
      for (const r of texts) ellipse(t.m, r.x, r.y, r.rx, r.ry, [[0, cfg.textDim], [0.65, +(cfg.textDim * 0.8).toFixed(3)], [1, 0]]);
      text = t.c;
    }
    masks = { edge: edge.c, text };
    return masks;
  };

  const tick = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    phase = (phase + cfg.drift * dt) % 2;
    smx += (mx - smx) * cfg.tiltEase;
    smy += (my - smy) * cfg.tiltEase;
    spot += (spotT - spot) * 0.12;
    draw();
    schedule();
  };
  const schedule = () => {
    if (!raf && visible && !reduced && !document.hidden) raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  };
  // Reduced motion: one still frame, redrawn only when the layout or the W changes.
  let still = 0;
  const redrawStill = () => {
    if (!still) still = requestAnimationFrame(() => ((still = 0), draw()));
  };

  try {
    measure();
    new ResizeObserver(() => {
      measure();
      if (reduced || !raf) redrawStill();
    }).observe(canvas);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) schedule();
      else stop();
    }).observe(canvas);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : schedule()));
    new MutationObserver(() => reduced && redrawStill()).observe(wSource, { attributes: true, attributeFilter: ["style"] });
    reducedMq?.addEventListener?.("change", (e) => {
      reduced = e.matches;
      if (reduced) {
        stop();
        mx = my = smx = smy = 0;
        spot = spotT = 0;
        redrawStill();
      } else schedule();
    });
    if (hero && !coarse) {
      hero.addEventListener(
        "pointermove",
        (e) => {
          if (reduced) return;
          const r = canvas.getBoundingClientRect();
          cx = e.clientX - r.left;
          cy = e.clientY - r.top;
          mx = (cx / (w || 1)) * 2 - 1;
          my = (cy / (h || 1)) * 2 - 1;
          spotT = 1;
        },
        { passive: true },
      );
      hero.addEventListener("pointerleave", () => {
        mx = my = 0;
        spotT = 0;
      });
    }
    draw();
    schedule();
    return true;
  } catch {
    return false;
  }
}
