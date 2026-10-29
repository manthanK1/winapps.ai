// PLACEHOLDER — replaced by the full raw-WebGL port of the design's ribbon.
// The API below is the contract BaseLayout relies on.

export type RibbonVariant = "home" | "inner";

export interface RibbonConfig {
  speed: number;
  breeze: number;
  gloss: number;
  showWordmark: boolean;
  /** W ribbon width, × Lh (design: 0.22). */
  wWidth: number;
  /** Fold radius at each W point, × Lh (design: 0.075). */
  foldRadius: number;
}

export const RIBBON_CONFIG: RibbonConfig = {
  speed: 1,
  breeze: 1,
  gloss: 1,
  showWordmark: true,
  wWidth: 0.22,
  foldRadius: 0.075,
};

export interface RibbonHandle {
  destroy(): void;
}

export function mountRibbon(
  _canvas: HTMLCanvasElement,
  _opts: { variant: RibbonVariant; wordmark?: HTMLElement | null; config?: Partial<RibbonConfig> }
): RibbonHandle | null {
  return null;
}
