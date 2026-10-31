// The WinApps ribbon: a raw-WebGL port of the design export's ribbon
// (design-export/Main.dc.html, Component.initGL() + frame()). The maths,
// constants and shaders are the design's; the plumbing around them is new:
// pooled buffers (no per-frame allocations in the hot path), only the drawn
// part of the vertex grid is built and uploaded, viewport-normalised pointer,
// pause when hidden, context-loss recovery, reduced-motion, and a calmer
// "inner" variant. It is decoration only: every failure is silent.

export type RibbonVariant = "home" | "inner";

export interface RibbonSegments {
  /** Samples along the ribbon (design MAXN). maxSamples × across must stay < 65536 (Uint16 indices). */
  maxSamples: number;
  /** Vertices across the ribbon width (design M). */
  across: number;
}

export interface RibbonInnerConfig {
  /** Time multiplier on inner pages (the idle waves move at 70 %). */
  speed: number;
  /** Breeze (scroll/pointer gust) multiplier on inner pages. */
  breeze: number;
  /** Width multiplier for the wide descent sweeps on inner pages. */
  descentWidth: number;
  /** W centre height: halfH + wAbove × Lh + wAboveOffset (puts the W above the viewport). */
  wAbove: number;
  wAboveOffset: number;
}

export interface RibbonConfig {
  /** Intro speed (design prop "speed"). */
  speed: number;
  /** Gust strength (design prop "breeze"). */
  breeze: number;
  /** Satin highlight strength (design prop "gloss"). */
  gloss: number;
  /** Fade in the WINAPPS wordmark under the W (design prop "showWordmark"; home only). */
  showWordmark: boolean;
  /** WINAPPS wordmark size, × the design's (1). */
  wordmarkScale: number;
  /** W ribbon width, × Lh (design: 0.22). */
  wWidth: number;
  /** Fold radius at each W point, × Lh (design: 0.075). */
  foldRadius: number;
  /** Height of the W's middle top, × Lh above the W centre (design: 0.16; the outer tops are 0.42 and 0.5). */
  wMiddle: number;
  /** How far below its end the left wave starts, × Lh, easing up into the W (design: 0, a level wave). */
  waveRise: number;
  /** Left-wave undulation, × the design's amplitude (design: 1). */
  waveAmp: number;
  /** Max control points for the descent rows (design: 60; V2 pages are far taller). */
  descentCap: number;
  /**
   * Share of the sample budget kept for the left wave, the W and the flick on
   * long pages, so the folds stay as finely sampled as in the design. A page
   * as short as the design's preview never reaches it (identical sampling).
   */
  headShare: number;
  /**
   * Most device pixels the canvas may have. The DPR cap of 2 alone gives a
   * 4K-sized buffer on large high-DPI screens, which stalls integrated GPUs;
   * above this budget the DPR is lowered to fit (1440×900 at 2× still fits).
   */
  maxPixels: number;
  segments: { desktop: RibbonSegments; mobile: RibbonSegments };
  inner: RibbonInnerConfig;
}

export const RIBBON_CONFIG: RibbonConfig = {
  speed: 1,
  breeze: 1,
  gloss: 1,
  showWordmark: true,
  wordmarkScale: 2,
  wWidth: 0.22,
  foldRadius: 0.075,
  wMiddle: 0.4,
  waveRise: 0.24,
  waveAmp: 0.6,
  descentCap: 200,
  headShare: 0.25,
  maxPixels: 5_300_000,
  segments: {
    desktop: { maxSamples: 2400, across: 14 },
    mobile: { maxSamples: 1200, across: 10 },
  },
  inner: {
    speed: 0.7,
    breeze: 0.6,
    descentWidth: 0.8,
    wAbove: 0.6,
    wAboveOffset: 0.5,
  },
};

export interface RibbonHandle {
  destroy(): void;
}

export interface RibbonOptions {
  variant: RibbonVariant;
  /** The #ribbon-word element (home hero only). */
  wordmark?: HTMLElement | null;
  /** The home hero backdrop (#hero-depth): receives the W's page position, size and formed state as CSS custom properties, so its glow and shadow follow the W. */
  depth?: HTMLElement | null;
  config?: Partial<RibbonConfig>;
}

// ---- Shaders (verbatim from the design) -------------------------------------

const VS = [
  "attribute vec3 aP; attribute vec3 aN; attribute vec3 aT; attribute vec3 aC;",
  "uniform mat4 uPV; varying vec3 vP; varying vec3 vN; varying vec3 vT; varying vec3 vC;",
  "void main(){ vP=aP; vN=aN; vT=aT; vC=aC; gl_Position=uPV*vec4(aP,1.0); }",
].join("\n");

const FS = [
  "precision highp float;",
  "uniform vec3 uCam; uniform float uGloss;",
  "varying vec3 vP; varying vec3 vN; varying vec3 vT; varying vec3 vC;",
  "vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }",
  "void main(){",
  "  vec3 N = normalize(vN); vec3 V = normalize(uCam - vP);",
  "  float side = dot(N, V);",
  "  bool front = side > 0.0;",
  "  if(!front) N = -N;",
  "  vec3 teal = lin(vec3(0.153,0.537,0.565));",
  "  vec3 orng = lin(mix(vec3(0.929,0.616,0.224), vec3(0.961,0.757,0.125), clamp(vC.x,0.0,1.0)));",
  "  float warm = clamp(mix(front ? 0.0 : 1.0, vC.y, vC.z), 0.0, 1.0);",
  "  vec3 base = mix(teal, orng, warm);",
  "  vec3 shade = mix(lin(vec3(0.024,0.361,0.420)), lin(vec3(0.780,0.478,0.133)), warm);",
  "  vec3 glow = mix(lin(vec3(0.384,0.678,0.706)), lin(vec3(0.984,0.871,0.471)), warm);",
  "  vec3 L1 = normalize(vec3(-0.45, 0.85, 0.75));",
  "  vec3 L2 = normalize(vec3(0.8, -0.25, 0.55));",
  "  float w1 = clamp((dot(N,L1) + 0.35) / 1.35, 0.0, 1.0);",
  "  float w2 = clamp(dot(N,L2), 0.0, 1.0);",
  "  float lit = w1 * 0.85 + w2 * 0.25;",
  "  vec3 col = mix(shade, base, smoothstep(0.05, 0.75, lit));",
  "  vec3 T = normalize(vT);",
  "  vec3 H1 = normalize(L1 + V); vec3 H2 = normalize(L2 + V);",
  "  float t1 = dot(T, H1); float s1 = sqrt(max(0.0, 1.0 - t1*t1));",
  "  float t2 = dot(T, H2); float s2 = sqrt(max(0.0, 1.0 - t2*t2));",
  "  float satin = pow(s1, 90.0) * 0.55 + pow(s1, 14.0) * 0.10 + pow(s2, 60.0) * 0.18;",
  "  satin *= smoothstep(-0.1, 0.4, dot(N, L1)) * 0.7 + 0.3;",
  "  col = mix(col, glow, clamp(satin * uGloss, 0.0, 0.85));",
  "  float fres = pow(1.0 - abs(side), 4.0);",
  "  col = mix(col, glow, fres * 0.25);",
  "  gl_FragColor = vec4(pow(col, vec3(1.0/2.2)), 1.0);",
  "}",
].join("\n");

// ---- Design constants ----------------------------------------------------------

const PI = Math.PI;
const FOV = (35 * PI) / 180;
const CAM_Z = 6.2;
const CAM_Y_BASE = 0.1;
const NL = 7; // left-wave control points
const W_START = NL;
const N_WP = 11; // W = start + 3 folds × 3 points + end
const D_START = W_START + N_WP - 1; // first point after the W
const HEAD_END = D_START + 2; // segments before the descent rows (wave, W, flick)
// The W's five points in Lh units around (cxW, cyW). The middle top's height
// (0.16 here, the design's) is replaced by RIBBON_CONFIG.wMiddle.
const WP_UNIT = [-0.78, 0.42, -0.3, -0.48, 0.02, 0.16, 0.28, -0.48, 0.8, 0.5];
// "the W as one object (rotation helpers kept at 0)"
const ROT_Z = 0;
const ROT_Y = 0;
const MAX_FAILS = 5;

const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const sstep = (a: number, b: number, x: number): number => {
  const k = clamp((x - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};
const easeIO = (k: number): number => 0.5 - 0.5 * Math.cos(PI * clamp(k, 0, 1));
// One Catmull-Rom coordinate, same expression as the design.
const cr = (p0: number, p1: number, p2: number, p3: number, u: number, u2: number, u3: number): number =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);

interface Sample {
  x: number;
  y: number;
  z: number;
  j: number;
  u: number;
  q: number;
  d: number;
  a: number;
  w: number;
  tone: number;
  cloth: number;
  fx: number;
}

interface GLState {
  gl: WebGLRenderingContext;
  prog: WebGLProgram;
  MAXN: number;
  M: number;
  pos: Float32Array;
  nor: Float32Array;
  tan: Float32Array;
  tone: Float32Array;
  uPV: WebGLUniformLocation | null;
  uCam: WebGLUniformLocation | null;
  uGloss: WebGLUniformLocation | null;
  bufP: WebGLBuffer;
  bufN: WebGLBuffer;
  bufT: WebGLBuffer;
  bufC: WebGLBuffer;
  ib: WebGLBuffer;
}

function initGL(canvas: HTMLCanvasElement, MAXN: number, M: number): GLState | null {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
  if (!gl) return null;
  const sh = (type: number, src: string): WebGLShader => {
    const s = gl.createShader(type);
    if (!s) throw new Error("shader");
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "compile");
    return s;
  };
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
  gl.useProgram(prog);

  const nv = MAXN * M;
  const mk = (name: string, bytes: number, size: number): WebGLBuffer => {
    const b = gl.createBuffer();
    if (!b) throw new Error("buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, bytes, gl.DYNAMIC_DRAW);
    const loc = gl.getAttribLocation(prog, name);
    if (loc >= 0) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
    return b;
  };
  const pos = new Float32Array(nv * 3);
  const nor = new Float32Array(nv * 3);
  const tan = new Float32Array(nv * 3);
  const tone = new Float32Array(nv * 3);
  const bufP = mk("aP", pos.byteLength, 3);
  const bufN = mk("aN", nor.byteLength, 3);
  const bufT = mk("aT", tan.byteLength, 3);
  const bufC = mk("aC", tone.byteLength, 3);

  const idx = new Uint16Array((MAXN - 1) * (M - 1) * 6);
  let k = 0;
  for (let i = 0; i < MAXN - 1; i++)
    for (let j = 0; j < M - 1; j++) {
      const a = i * M + j, b = a + 1, c = a + M, d = c + 1;
      idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
  const ib = gl.createBuffer();
  if (!ib) throw new Error("buffer");
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  return {
    gl, prog, MAXN, M, pos, nor, tan, tone,
    uPV: gl.getUniformLocation(prog, "uPV"),
    uCam: gl.getUniformLocation(prog, "uCam"),
    uGloss: gl.getUniformLocation(prog, "uGloss"),
    bufP, bufN, bufT, bufC, ib,
  };
}

function mergeConfig(c: Partial<RibbonConfig> | undefined): RibbonConfig {
  const base = RIBBON_CONFIG;
  if (!c) return base;
  return {
    ...base,
    ...c,
    segments: {
      desktop: { ...base.segments.desktop, ...c.segments?.desktop },
      mobile: { ...base.segments.mobile, ...c.segments?.mobile },
    },
    inner: { ...base.inner, ...c.inner },
  };
}

function media(q: string): MediaQueryList | null {
  return typeof window.matchMedia === "function" ? window.matchMedia(q) : null;
}

class Ribbon {
  private readonly canvas: HTMLCanvasElement;
  private readonly variant: RibbonVariant;
  private readonly wordmark: HTMLElement | null;
  private readonly depth: HTMLElement | null;
  private depthKey = "";
  private readonly cfg: RibbonConfig;
  private readonly MAXN: number;
  private readonly M: number;
  private readonly reducedMq: MediaQueryList | null;
  private reduced: boolean;
  private g: GLState | null = null;
  private ro: ResizeObserver | null = null;

  // loop
  private rafId = 0;
  private stopped = false;
  private fails = 0;
  private t0 = performance.now();
  private hiddenAt: number | null = null;
  private sizeDirty = true;
  private cw = 0;
  private ch = 0;

  // motion state (design names)
  private gust = 0;
  private gustT = 0;
  private lastX: number | null = null;
  private lastScroll: number | null = null;
  private mx = 0;
  private my = 0;
  private smx = 0;
  private smy = 0;
  private headQ: number | null = null;
  private formedAt: number | null = null;

  // per-frame inputs of the wave helpers
  private tw = 0;
  private cyW = 0;
  private waveA = 0;
  private waveDrop = 0;
  private waveX0 = 0;
  private waveX1 = 1;

  // pools
  private readonly P: Float64Array; // control points, xyz
  private pLen = 0;
  private readonly segLen: Float64Array;
  private readonly WT = new Float64Array(N_WP * 3);
  private wtLen = 0;
  private readonly WP = new Float64Array(10);
  private readonly rv = new Float64Array(3); // rotW output
  private readonly S: Sample[] = [];
  private readonly V = new Float64Array(16);
  private readonly Pm = new Float64Array(16);
  private readonly PV = new Float64Array(16);
  private readonly PV32 = new Float32Array(16);

  // wordmark style cache (write only on change)
  private wFont = -1;
  private wOpacity = -1;
  private wX = NaN;
  private wY = NaN;

  constructor(canvas: HTMLCanvasElement, variant: RibbonVariant, wordmark: HTMLElement | null, depth: HTMLElement | null, cfg: RibbonConfig) {
    this.canvas = canvas;
    this.variant = variant;
    this.wordmark = wordmark;
    this.depth = depth;
    this.cfg = cfg;
    const mobile = !!(media("(max-width: 768px)")?.matches || media("(pointer: coarse)")?.matches);
    const seg = mobile ? cfg.segments.mobile : cfg.segments.desktop;
    this.M = Math.max(2, Math.floor(seg.across));
    // Uint16 indices: keep MAXN × M below 65536.
    this.MAXN = Math.max(64, Math.min(Math.floor(seg.maxSamples), Math.floor(65535 / this.M)));
    this.reducedMq = media("(prefers-reduced-motion: reduce)");
    this.reduced = !!this.reducedMq?.matches;
    const cap = Math.max(NL + N_WP + 2, Math.floor(cfg.descentCap)) + 2;
    this.P = new Float64Array(cap * 3);
    this.segLen = new Float64Array(cap);
    for (let i = 0; i < this.MAXN; i++)
      this.S.push({ x: 0, y: 0, z: 0, j: 0, u: 0, q: 0, d: 0, a: 0, w: 0, tone: 0, cloth: 0, fx: 0 });
  }

  init(): boolean {
    this.g = initGL(this.canvas, this.MAXN, this.M);
    if (!this.g) return false;
    if (this.variant === "inner" && this.wordmark) this.wordmark.style.opacity = "0";
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    this.canvas.addEventListener("webglcontextlost", this.onLost);
    this.canvas.addEventListener("webglcontextrestored", this.onRestored);
    this.reducedMq?.addEventListener("change", this.onReducedChange);
    if (typeof ResizeObserver === "function") {
      this.ro = new ResizeObserver(this.onResize);
      this.ro.observe(this.canvas);
    }
    this.start();
    return true;
  }

  destroy(): void {
    this.stopped = true;
    this.cancel();
    window.removeEventListener("pointermove", this.onPointer);
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.reducedMq?.removeEventListener("change", this.onReducedChange);
    this.ro?.disconnect();
    this.ro = null;
    const g = this.g;
    this.g = null;
    if (g && !g.gl.isContextLost()) {
      try {
        const gl = g.gl;
        gl.deleteBuffer(g.bufP); gl.deleteBuffer(g.bufN); gl.deleteBuffer(g.bufT); gl.deleteBuffer(g.bufC); gl.deleteBuffer(g.ib);
        gl.deleteProgram(g.prog);
      } catch {
        // already gone
      }
    }
  }

  // ---- loop ---------------------------------------------------------------------

  private start(): void {
    if (this.stopped || !this.g || document.hidden || this.rafId) return;
    this.rafId = requestAnimationFrame(this.loop);
  }

  private cancel(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private readonly loop = (now: number): void => {
    this.rafId = 0;
    if (this.stopped || !this.g) return;
    try {
      this.frame(now);
      this.fails = 0;
    } catch {
      if (++this.fails >= MAX_FAILS) {
        this.fail();
        return;
      }
    }
    // Reduced motion: render on demand only (scroll/resize call start()).
    if (!this.reduced) this.start();
  };

  private fail(): void {
    this.destroy();
    this.canvas.style.display = "none";
  }

  // ---- events -------------------------------------------------------------------

  private readonly onPointer = (e: PointerEvent): void => {
    if (this.reduced) return; // no parallax and no gust under reduced motion
    // Normalised to the viewport (the design divided by the full page height).
    this.mx = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
    this.my = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
    if (this.lastX !== null) this.gustT = Math.min(1.6, this.gustT + Math.abs(e.clientX - this.lastX) / 120);
    this.lastX = e.clientX;
  };

  private readonly onScroll = (): void => {
    if (this.reduced) this.start();
  };

  private readonly onResize = (): void => {
    this.sizeDirty = true;
    if (this.reduced) this.start();
  };

  private readonly onVisibility = (): void => {
    if (document.hidden) {
      this.hiddenAt = performance.now();
      this.cancel();
    } else {
      // Resume the clock where it stopped so a hidden intro still plays.
      if (this.hiddenAt !== null) this.t0 += performance.now() - this.hiddenAt;
      this.hiddenAt = null;
      this.start();
    }
  };

  private readonly onReducedChange = (): void => {
    this.reduced = !!this.reducedMq?.matches;
    this.start();
  };

  private readonly onLost = (e: Event): void => {
    e.preventDefault(); // allows webglcontextrestored
    this.cancel();
    this.g = null;
  };

  private readonly onRestored = (): void => {
    if (this.stopped) return;
    try {
      this.g = initGL(this.canvas, this.MAXN, this.M);
    } catch {
      this.g = null;
    }
    if (!this.g) this.fail();
    else this.start();
  };

  // ---- design helpers -----------------------------------------------------------

  private waveY(x: number): number {
    const A = this.waveA, tw = this.tw;
    // Rise: the wave starts waveDrop below and eases up into the W's left top.
    const s = Math.min(1, Math.max(0, (x - this.waveX0) / (this.waveX1 - this.waveX0 || 1)));
    const rise = -this.waveDrop * Math.pow(1 - s, 1.5);
    return this.cyW + 0.05 + rise + A * Math.sin(x * 1.5 - tw * 1.4) + A * 0.35 * Math.sin(x * 3.1 + tw * 0.9);
  }

  private waveZ(x: number): number {
    return 0.55 * Math.sin(x * 1.15 - this.tw * 1.05 + 1.0);
  }

  private waveTw(x: number): number {
    return 0.95 * Math.sin(x * 1.9 - this.tw * 1.6);
  }

  /** rotW() of the design, written into this.rv. */
  private rotW(px: number, py: number, pz: number, cxW: number, cyW: number): void {
    const x = px - cxW, y = py - cyW, z = pz;
    const x1 = x * Math.cos(ROT_Z) - y * Math.sin(ROT_Z), y1 = x * Math.sin(ROT_Z) + y * Math.cos(ROT_Z);
    const x2 = x1 * Math.cos(ROT_Y) + z * Math.sin(ROT_Y), z2 = -x1 * Math.sin(ROT_Y) + z * Math.cos(ROT_Y);
    this.rv[0] = x2 + cxW;
    this.rv[1] = y1 + cyW;
    this.rv[2] = z2;
  }

  private pushP(x: number, y: number, z: number): void {
    const o = this.pLen * 3;
    this.P[o] = x;
    this.P[o + 1] = y;
    this.P[o + 2] = z;
    this.pLen++;
  }

  private pushWT(x: number, y: number, z: number): void {
    const o = this.wtLen * 3;
    this.WT[o] = x;
    this.WT[o + 1] = y;
    this.WT[o + 2] = z;
    this.wtLen++;
  }

  /** dir -1: bottom (fold away), +1: top (fold back). */
  private fold(vx: number, vy: number, zIn: number, dir: number, fdx: number, fRad: number, layer: number): void {
    const zOut = zIn + (dir < 0 ? -layer : layer);
    this.pushWT(vx - fdx, vy - dir * fRad, zIn);
    this.pushWT(vx, vy, (zIn + zOut) / 2);
    this.pushWT(vx + fdx, vy - dir * fRad, zOut);
  }

  // ---- frame (design frame()) -----------------------------------------------------

  private frame(now: number): void {
    const g = this.g;
    if (!g) return;
    const el = this.canvas;
    if (this.sizeDirty) {
      const rect = el.getBoundingClientRect();
      this.cw = rect.width;
      this.ch = rect.height;
      this.sizeDirty = false;
    }
    const cw = this.cw, ch = this.ch;
    if (cw < 20 || ch < 20) return;
    const gl = g.gl, M = g.M, MAXN = g.MAXN;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(this.cfg.maxPixels / Math.max(1, cw * ch)));
    const W = Math.round(cw * dpr), H = Math.round(ch * dpr);
    if (el.width !== W || el.height !== H) {
      el.width = W;
      el.height = H;
    }
    gl.viewport(0, 0, W, H);

    const cfg = this.cfg;
    const inner = this.variant === "inner";
    const reduced = this.reduced;
    const pace = inner ? cfg.inner.speed : 1;
    const breeze = cfg.breeze * (inner ? cfg.inner.breeze : 1);
    const gloss = cfg.gloss;
    const showWord = cfg.showWordmark;
    const secs = (now - this.t0) / 1000;
    let t = secs * cfg.speed * pace;
    let tw = secs * pace;
    if (reduced) {
      t = 99;
      tw = 0; // frozen: no idle motion at all
    }

    // page scroll (the canvas is fixed to the viewport; the page moves under it)
    const scrolled = Math.max(0, window.scrollY);
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (reduced) {
      this.gust = this.gustT = 0;
      this.smx = this.smy = 0;
      this.lastX = null;
    } else {
      if (this.lastScroll !== null) {
        const dv = Math.abs(scrolled - this.lastScroll);
        this.gustT = Math.min(1.0, this.gustT + dv / 400);
      }
      this.gustT *= 0.97;
      this.gust += (this.gustT - this.gust) * 0.02;
      this.smx += (this.mx - this.smx) * 0.04;
      this.smy += (this.my - this.smy) * 0.04;
    }
    this.lastScroll = scrolled;
    const gust = this.gust * breeze;

    // camera / world scale
    const aspect = cw / ch;
    const halfH = CAM_Z * Math.tan(FOV / 2), halfW = halfH * aspect;
    const pxToWorld = (2 * halfH) / ch;
    const scrollW = scrolled * pxToWorld;
    const pageBottomW = -(maxScroll * pxToWorld) - halfH;
    const narrow = aspect < 1;
    const Lh = Math.min(1.35, halfW * (narrow ? 0.62 : 0.5));
    const cxW = narrow ? 0 : halfW * 0.26;
    // Inner pages: the W sits above the top edge, only the flick and descent show.
    const cyW = inner ? halfH + cfg.inner.wAbove * Lh + cfg.inner.wAboveOffset : narrow ? 0.55 : 0.32;
    const xStart = -halfW * 1.35;

    const WP = this.WP;
    for (let i = 0; i < 10; i += 2) {
      WP[i] = cxW + WP_UNIT[i] * Lh;
      WP[i + 1] = cyW + WP_UNIT[i + 1] * Lh;
    }
    WP[5] = cyW + cfg.wMiddle * Lh; // middle top of the W
    const botY = cyW - 0.48 * Lh;
    this.tw = tw;
    this.cyW = cyW;
    this.waveA = 0.22 * Lh * cfg.waveAmp;
    this.waveDrop = cfg.waveRise * Lh;
    this.waveX0 = xStart;
    this.waveX1 = cxW + (WP_UNIT[0] - 0.4) * Lh; // where the wave hands over to the W

    // intro head (in control-point units), then scroll takes over
    let introQ = (D_START + 1.6) * easeIO(t / 6.5);
    let m = easeIO(sstep(W_START - 0.4, W_START + N_WP - 0.6, introQ));
    if (inner) {
      introQ = D_START + 1.6;
      m = 1;
    }
    if (m > 0.995 && this.formedAt === null) this.formedAt = t;
    if (m < 0.5) this.formedAt = null;

    const rv = this.rv;
    this.rotW(cxW + 0.99, cyW + 0.15, 0, cxW, cyW);
    const wAx0 = rv[0] - cxW, wAx1 = rv[1] - cyW, wAx2 = rv[2];
    this.rotW(WP[0], WP[1], 0, cxW, cyW);
    const W0r0 = rv[0], W0r1 = rv[1], W0r2 = rv[2];
    this.rotW(WP[8], WP[9], -0.15 * Lh, cxW, cyW);
    const W4r0 = rv[0], W4r1 = rv[1], W4r2 = rv[2];

    // control points: left wave · W · falling zig-zag down the page
    this.pLen = 0;
    for (let i = 0; i < NL; i++) {
      const c = i / (NL - 1), x = lerp(xStart, W0r0 - 0.4 * Lh, c), k = m * c * c;
      this.pushP(x, lerp(this.waveY(x), W0r1 - 0.06 * Lh, k), lerp(this.waveZ(x), W0r2, k));
    }
    // the W as a paper-fold accordion: bottoms fold INTO the screen (yellow side comes up),
    // the middle top folds back OUT toward you (teal goes down). Width stays horizontal.
    const fRad = cfg.foldRadius * Lh, fdx = 0.05 * Lh, layer = 2 * fRad;
    this.wtLen = 0;
    this.pushWT(WP[0], WP[1], 0);
    this.fold(WP[2], WP[3], 0, -1, fdx, fRad, layer);
    this.fold(WP[4], WP[5], -layer, 1, fdx, fRad, layer);
    this.fold(WP[6], WP[7], 0, -1, fdx, fRad, layer);
    this.pushWT(WP[8], WP[9], -layer);
    const WT = this.WT;
    for (let i = 0; i < this.wtLen; i++) {
      this.rotW(WT[i * 3], WT[i * 3 + 1], WT[i * 3 + 2], cxW, cyW);
      const p0 = rv[0], p1 = rv[1], p2 = rv[2];
      this.pushP(
        p0,
        lerp(this.waveY(p0), p1 + 0.018 * Lh * Math.sin(tw * 0.7 + p0 * 2.3), m),
        lerp(this.waveZ(p0), p2 + 0.03 * Math.sin(tw * 0.6 + p0 * 2), m),
      );
    }

    // descent: curl out of the W to the right, then sweep back and forth to the page bottom
    this.pushP(W4r0 + 0.32 * Lh, W4r1 + 0.1 * Lh, W4r2 - 0.08);
    this.pushP(Math.max(halfW * 0.86, W4r0 + 1.05 * Lh), W4r1 - 0.75 * Lh, -0.45);
    const rowGap = 1.6 * halfH;
    const cap = cfg.descentCap;
    let y = W4r1 - 0.75 * Lh, side = -1, r = 0;
    while (y > pageBottomW - 2 * halfH && this.pLen < cap) {
      r++;
      const yMid = y - rowGap * 0.5;
      this.pushP(side * halfW * 0.04 + 0.06 * Math.sin(tw * 0.35 + r * 1.3) * halfW, yMid, 0.22 * Math.sin(r * 1.3 + tw * 0.25));
      y -= rowGap;
      this.pushP(side * halfW * 0.82, y + 0.06 * Math.sin(tw * 0.35 + (r + 0.5) * 1.3), 0.25 * Math.sin(r * 1.7 + tw * 0.3) - 0.3);
      side = -side;
    }
    const P = this.P, nP = this.pLen;
    const lastQ = nP - 1;

    // where the ribbon tip should be: just below the middle of the screen
    const viewY = CAM_Y_BASE - scrollW;
    let targetQ = D_START + 1.6;
    if (scrolled > 2) {
      const want = viewY - halfH * 0.25;
      for (let k = D_START; k < nP; k++) {
        if (P[k * 3 + 1] <= want) {
          const y0 = P[(k - 1) * 3 + 1], y1 = P[k * 3 + 1];
          targetQ = k - 1 + clamp((y0 - want) / Math.max(1e-4, y0 - y1), 0, 1);
          break;
        }
        targetQ = k;
      }
      if (scrolled >= maxScroll - 2) targetQ = lastQ;
    }
    targetQ = Math.max(targetQ, D_START + 1.6);
    const desired = Math.max(introQ, Math.min(targetQ, introQ >= D_START + 1.55 ? targetQ : introQ));
    // Inner pages have no intro: start with the tip already in place.
    if (this.headQ === null) this.headQ = inner ? desired : 0;
    this.headQ += (desired - this.headQ) * (desired > this.headQ ? 0.07 : 0.05);
    // Reduced motion: the tip sits exactly where the animation would come to
    // rest (the finished W at the top, then wherever the scroll puts it), with
    // no easing. The design drew the whole ribbon (lastQ) instead, which sends
    // the descent's first sweep through the hero and over the wordmark.
    const headQ = reduced ? desired : this.headQ;

    // sample Catmull-Rom
    const seg = this.segLen;
    let total = 0, headLen = 0;
    for (let j = 0; j < nP - 1; j++) {
      const o = j * 3;
      const l = Math.hypot(P[o + 3] - P[o], P[o + 4] - P[o + 1], P[o + 5] - P[o + 2]);
      seg[j] = l;
      total += l;
      if (j < HEAD_END) headLen += l;
    }
    const budget = MAXN - 60;
    const step = Math.max(0.008, total / budget);
    let stepHead = step, stepTail = step;
    // Long pages: keep the W as finely sampled as on the design's short page and
    // give the descent rows what is left, so nothing is cut off at the bottom.
    const headRef = Math.max(0.008, headLen / (cfg.headShare * budget));
    let count = 0;
    for (let j = 0; j < nP - 1; j++) count += Math.max(4, Math.ceil(seg[j] / step));
    if (headRef < step || count > MAXN - 1) {
      stepHead = Math.min(step, headRef);
      let headCount = 0;
      const hn = Math.min(HEAD_END, nP - 1);
      for (let j = 0; j < hn; j++) headCount += Math.max(4, Math.ceil(seg[j] / stepHead));
      const room = MAXN - 1 - headCount - Math.max(0, nP - 1 - HEAD_END);
      stepTail = Math.max(step, (total - headLen) / Math.max(1, room));
    }
    const S = this.S;
    let sLen = 0;
    for (let j = 0; j < nP - 1 && sLen < MAXN - 1; j++) {
      const i0 = (j > 0 ? j - 1 : j) * 3, i1 = j * 3, i2 = (j + 1) * 3, i3 = (j + 2 < nP ? j + 2 : j + 1) * 3;
      const n = Math.max(4, Math.ceil(seg[j] / (j < HEAD_END ? stepHead : stepTail)));
      for (let s = 0; s < n && sLen < MAXN - 1; s++) {
        const u = s / n, u2 = u * u, u3 = u2 * u;
        const smp = S[sLen++];
        smp.x = cr(P[i0], P[i1], P[i2], P[i3], u, u2, u3);
        smp.y = cr(P[i0 + 1], P[i1 + 1], P[i2 + 1], P[i3 + 1], u, u2, u3);
        smp.z = cr(P[i0 + 2], P[i1 + 2], P[i2 + 2], P[i3 + 2], u, u2, u3);
        smp.j = j;
        smp.u = u;
        smp.q = j + u;
      }
    }
    {
      const smp = S[sLen++], o = (nP - 1) * 3;
      smp.x = P[o];
      smp.y = P[o + 1];
      smp.z = P[o + 2];
      smp.j = nP - 2;
      smp.u = 1;
      smp.q = nP - 1;
    }
    const N = Math.min(sLen, MAXN);

    // last drawn sample, found first so only the drawn part is built
    let end = 0;
    while (end < N - 1 && S[end + 1].q <= headQ + 0.001) end++;
    const lim = Math.min(N - 1, end + 1);

    // twist, width, tone, cloth amount
    const bw = 0.11 * Lh;
    const WW = cfg.wWidth * Lh; // one constant width through the whole W
    const dWidth = inner ? cfg.inner.descentWidth : 1;
    let along = 0, dW = 0, haveDW = false;
    for (let i = 0; i <= lim; i++) {
      const s = S[i];
      if (i > 0) {
        const p = S[i - 1];
        along += Math.hypot(s.x - p.x, s.y - p.y, s.z - p.z);
      }
      s.d = along;
      const wt = this.waveTw(s.x);
      s.cloth = 0;
      s.fx = 0;
      if (s.j < W_START) {
        const wl = sstep(W0r0 - 1.4 * Lh, W0r0, s.x);
        s.a = wt * (1 - m * wl);
        s.w = lerp(bw, WW, m * wl);
        s.tone = 0.1;
      } else if (s.j < D_START) {
        s.a = wt * (1 - m);
        s.fx = m; // width locked horizontal → the folds flip the ribbon over
        s.cloth = 0.32 * m; // a very light breeze through the W
        s.w = lerp(bw, WW, m);
        s.tone = clamp((s.x - cxW + 0.1 * Lh) / (0.7 * Lh), 0, 1);
      } else {
        const qq = s.q - D_START;
        const ramp = sstep(0.8, 3.0, qq);
        if (!haveDW) {
          dW = s.d;
          haveDW = true;
        }
        const run = Math.max(0, s.d - dW - 0.8 * Lh);
        s.fx = 1 - sstep(0, 1.2, qq);
        s.a = 3 * PI + (PI * run) / 4.5 + 0.22 * Math.sin(s.d * 0.2 - tw * 0.35) * sstep(1, 2.5, qq);
        s.w = lerp(WW, Lh * (0.95 + 0.06 * Math.sin(qq * 0.6 + tw * 0.25)) * dWidth, ramp);
        s.tone = 0.5 + 0.5 * Math.sin(s.d * 0.22 + tw * 0.15);
        s.cloth = sstep(0.9, 2.6, qq);
      }
      s.w *= sstep(0, 1, (headQ - s.q) / 0.55);
    }

    // centre frames + vertex grid
    const pos = g.pos;
    const amp = 0.085 * Lh * (1 + gust * 0.5);
    for (let i = 0; i <= lim; i++) {
      const s = S[i], a = S[Math.max(0, i - 1)], b = S[Math.min(N - 1, i + 1)];
      let tx = b.x - a.x, ty = b.y - a.y, tz = b.z - a.z;
      const tl = Math.hypot(tx, ty, tz) || 1;
      tx /= tl; ty /= tl; tz /= tl;
      let nx = -ty, ny = tx;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl; ny /= nl;
      const ca = Math.cos(s.a), sa = Math.sin(s.a);
      let sx = ca * nx, sy = ca * ny, sz = sa;
      if (s.fx > 0) {
        sx = lerp(sx, wAx0, s.fx);
        sy = lerp(sy, wAx1, s.fx);
        sz = lerp(sz, wAx2, s.fx);
      }
      const dt = sx * tx + sy * ty + sz * tz;
      sx -= tx * dt; sy -= ty * dt; sz -= tz * dt;
      const sl = Math.hypot(sx, sy, sz) || 1;
      sx /= sl; sy /= sl; sz /= sl;
      const ox = ty * sz - tz * sy, oy = tz * sx - tx * sz, oz = tx * sy - ty * sx;
      for (let j = 0; j < M; j++) {
        const v = -1 + (2 * j) / (M - 1);
        const half = s.w * 0.5 * v;
        let off = 0;
        if (s.cloth > 0) {
          const edge = 0.45 + 0.55 * (0.5 + 0.5 * v);
          off += s.cloth * edge * (amp * Math.sin(s.d * 1.35 - tw * 1.05 + v * 1.1) + amp * 0.35 * Math.sin(s.d * 2.2 - tw * 0.7 - v * 1.4));
        }
        const o = (i * M + j) * 3;
        pos[o] = s.x + sx * half + ox * off;
        pos[o + 1] = s.y + sy * half + oy * off;
        pos[o + 2] = s.z + sz * half + oz * off;
      }
    }
    const nor = g.nor, tan = g.tan, tone = g.tone;
    for (let i = 0; i <= lim; i++) {
      // Rows ≤ end (all drawn rows) see exactly the design's neighbours.
      const i0 = Math.max(0, i - 1), i1 = Math.min(lim, i + 1);
      const st = S[i].tone;
      for (let j = 0; j < M; j++) {
        const j0 = Math.max(0, j - 1), j1 = Math.min(M - 1, j + 1);
        const a = (i0 * M + j) * 3, b = (i1 * M + j) * 3, c = (i * M + j0) * 3, d = (i * M + j1) * 3;
        const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
        const vx = pos[d] - pos[c], vy = pos[d + 1] - pos[c + 1], vz = pos[d + 2] - pos[c + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const nl = Math.hypot(nx, ny, nz) || 1;
        const ul = Math.hypot(ux, uy, uz) || 1;
        const o = (i * M + j) * 3;
        nor[o] = nx / nl; nor[o + 1] = ny / nl; nor[o + 2] = nz / nl;
        tan[o] = ux / ul; tan[o + 1] = uy / ul; tan[o + 2] = uz / ul;
        // tone, paint, pmix (paint and pmix are always 0 in the design)
        tone[o] = st; tone[o + 1] = 0; tone[o + 2] = 0;
      }
    }

    const count3 = (lim + 1) * M * 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, g.bufP);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos.subarray(0, count3));
    gl.bindBuffer(gl.ARRAY_BUFFER, g.bufN);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, nor.subarray(0, count3));
    gl.bindBuffer(gl.ARRAY_BUFFER, g.bufT);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, tan.subarray(0, count3));
    gl.bindBuffer(gl.ARRAY_BUFFER, g.bufC);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, tone.subarray(0, count3));

    // camera follows the page scroll 1:1, plus a little mouse parallax
    const camX = this.smx * 0.35, camY = CAM_Y_BASE - this.smy * 0.2 - scrollW, camZ = CAM_Z;
    // Home: the hero tilt toward the W, fading over the first screen. Inner: none.
    const tilt = 1 - sstep(0, ch, scrolled);
    const tgX = inner ? 0 : cxW * 0.25 * tilt;
    const tgY = (inner ? 0 : cyW * 0.35 * tilt) - scrollW;
    const tgZ = 0;
    let zx = camX - tgX, zy = camY - tgY, zz = camZ - tgZ;
    let l = Math.hypot(zx, zy, zz) || 1;
    zx /= l; zy /= l; zz /= l;
    // xA = norm(cross([0, 1, 0], zA))
    let xx = 1 * zz - 0 * zy, xy = 0 * zx - 0 * zz, xz = 0 * zy - 1 * zx;
    l = Math.hypot(xx, xy, xz) || 1;
    xx /= l; xy /= l; xz /= l;
    // yA = cross(zA, xA)
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    const V = this.V;
    V[0] = xx; V[1] = yx; V[2] = zx; V[3] = 0;
    V[4] = xy; V[5] = yy; V[6] = zy; V[7] = 0;
    V[8] = xz; V[9] = yz; V[10] = zz; V[11] = 0;
    V[12] = -(xx * camX + xy * camY + xz * camZ);
    V[13] = -(yx * camX + yy * camY + yz * camZ);
    V[14] = -(zx * camX + zy * camY + zz * camZ);
    V[15] = 1;
    const f = 1 / Math.tan(FOV / 2), nr = 0.1, fr = 50;
    const Pm = this.Pm;
    Pm.fill(0);
    Pm[0] = f / aspect;
    Pm[5] = f;
    Pm[10] = (fr + nr) / (nr - fr);
    Pm[11] = -1;
    Pm[14] = (2 * fr * nr) / (nr - fr);
    const PV = this.PV;
    for (let c = 0; c < 4; c++)
      for (let rr = 0; rr < 4; rr++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) sum += Pm[k * 4 + rr] * V[c * 4 + k];
        PV[c * 4 + rr] = sum;
      }
    this.PV32.set(PV);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(g.uPV, false, this.PV32);
    gl.uniform3f(g.uCam, camX, camY, camZ);
    gl.uniform1f(g.uGloss, gloss);
    if (end > 0) gl.drawElements(gl.TRIANGLES, end * (M - 1) * 6, gl.UNSIGNED_SHORT, 0);

    // wordmark under the W (projected; it lives in the hero, so add the scroll offset back)
    const wd = this.wordmark;
    if (wd && !inner) {
      const px = cxW, py = botY - 0.36 * Lh;
      const cx4 = PV[0] * px + PV[4] * py + PV[12], cy4 = PV[1] * px + PV[5] * py + PV[13], cw4 = PV[3] * px + PV[7] * py + PV[15];
      const sxp = ((cx4 / cw4) * 0.5 + 0.5) * cw, syp = (1 - ((cy4 / cw4) * 0.5 + 0.5)) * ch + scrolled;
      let a = showWord && this.formedAt !== null ? sstep(0, 1, (t - this.formedAt) / 1.1) : 0;
      if (reduced) a = showWord ? 1 : 0; // shown at once, no fade
      const fpx = Math.max(14, (Lh / (2 * halfH)) * ch * 0.15) * cfg.wordmarkScale;
      this.writeWord(wd, Math.round(fpx * 10) / 10, Math.round(a * 1000) / 1000, Math.round(sxp * 10) / 10, Math.round((syp + (1 - a) * 12) * 10) / 10);
    }

    // W centre, size and formed state for the hero backdrop (glow, shadow), in page px
    const dp = this.depth;
    if (dp && !inner) {
      const cx4 = PV[0] * cxW + PV[4] * this.cyW + PV[12], cy4 = PV[1] * cxW + PV[5] * this.cyW + PV[13], cw4 = PV[3] * cxW + PV[7] * this.cyW + PV[15];
      const x = ((cx4 / cw4) * 0.5 + 0.5) * cw, y = (1 - ((cy4 / cw4) * 0.5 + 0.5)) * ch + scrolled;
      const formed = reduced ? 1 : this.formedAt !== null ? sstep(0, 1, (t - this.formedAt) / 1.1) : 0;
      this.writeDepth(dp, x, y, (Lh / (2 * halfH)) * ch, formed);
    }
  }

  /** Only touches the DOM when a rounded value changed. */
  private writeDepth(dp: HTMLElement, x: number, y: number, size: number, formed: number): void {
    const key = `${x.toFixed(1)}|${y.toFixed(1)}|${size.toFixed(1)}|${formed.toFixed(2)}`;
    if (key === this.depthKey) return;
    this.depthKey = key;
    dp.style.setProperty("--w-x", x.toFixed(1) + "px");
    dp.style.setProperty("--w-y", y.toFixed(1) + "px");
    dp.style.setProperty("--w-size", size.toFixed(1) + "px");
    dp.style.setProperty("--w-formed", formed.toFixed(2));
  }

  /** Same strings as the design; only touches the DOM when a value changed. */
  private writeWord(wd: HTMLElement, font: number, opacity: number, x: number, y: number): void {
    if (font !== this.wFont) {
      this.wFont = font;
      wd.style.fontSize = font.toFixed(1) + "px";
    }
    if (opacity !== this.wOpacity) {
      this.wOpacity = opacity;
      wd.style.opacity = opacity.toFixed(3);
    }
    if (x !== this.wX || y !== this.wY) {
      this.wX = x;
      this.wY = y;
      wd.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%)";
    }
  }
}

/**
 * Starts the ribbon on `canvas`. Returns null (never throws) when WebGL is
 * unavailable or set-up fails, so the caller can drop the canvas.
 */
export function mountRibbon(canvas: HTMLCanvasElement, opts: RibbonOptions): RibbonHandle | null {
  try {
    const ribbon = new Ribbon(canvas, opts.variant, opts.wordmark ?? null, opts.depth ?? null, mergeConfig(opts.config));
    if (!ribbon.init()) return null;
    return { destroy: () => ribbon.destroy() };
  } catch {
    return null;
  }
}
