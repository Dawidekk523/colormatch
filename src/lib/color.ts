export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Lab {
  l: number;
  a: number;
  b: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function hexToRgb(hex: string): Rgb {
  const clean = hex.trim().replace(/^#/, '');
  const full = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Not a valid hex colour: ${hex}`);
  }
  const value = Number.parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const part = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** YCbCr, used for the skin-pixel filter. */
export function rgbToYCbCr({ r, g, b }: Rgb) {
  return {
    y: 0.299 * r + 0.587 * g + 0.114 * b,
    cb: 128 - 0.168736 * r - 0.331264 * g + 0.5 * b,
    cr: 128 + 0.5 * r - 0.418688 * g - 0.081312 * b,
  };
}

const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Relative luminance per WCAG 2.1. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG contrast ratio between two colours, 1–21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la >= lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

/** Black or white body text, whichever reads better on the given background. */
export function readableTextColor(background: Rgb): '#000000' | '#ffffff' {
  const onBlack = contrastRatio(background, { r: 0, g: 0, b: 0 });
  const onWhite = contrastRatio(background, { r: 255, g: 255, b: 255 });
  return onBlack >= onWhite ? '#000000' : '#ffffff';
}

/** sRGB → CIELAB (D65). */
export function rgbToLab(rgb: Rgb): Lab {
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);

  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;

  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** CIELAB hue angle in degrees (0–360). Higher values lean yellow, lower lean red/pink. */
export function labHueAngle({ a, b }: Lab): number {
  const degrees = (Math.atan2(b, a) * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
}

/** CIELAB chroma — how saturated a colour is, regardless of lightness. */
export function labChroma({ a, b }: Lab): number {
  return Math.sqrt(a * a + b * b);
}

/**
 * Individual Typology Angle: the standard way to put a skin tone on a
 * light→deep scale. Large positive values are light, negative values are deep.
 */
export function individualTypologyAngle(lab: Lab): number {
  if (lab.b === 0) return lab.l >= 50 ? 90 : -90;
  return (Math.atan((lab.l - 50) / lab.b) * 180) / Math.PI;
}
