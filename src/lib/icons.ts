import {
  ChartHistogramIcon,
  CheckmarkCircle02Icon,
  ColorPickerIcon,
  ColorsIcon,
  Download04Icon,
  Image02Icon,
  SquareLock02Icon,
  PrinterIcon,
  RulerIcon,
  SearchVisualIcon,
  TShirtIcon,
} from '@hugeicons/core-free-icons';

/**
 * Icons come from Hugeicons (free set, MIT) as plain data, and are drawn by our
 * own tiny components rather than the vendor's React one: the pages that need
 * them are Astro as well as React, and a picture that is only decoration should
 * not ship a component library to the browser.
 */
export type IconNode = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export const ICONS = {
  measurements: RulerIcon as IconNode,
  subtype: ColorsIcon as IconNode,
  seasonFit: ChartHistogramIcon as IconNode,
  reading: SearchVisualIcon as IconNode,
  colours: ColorPickerIcon as IconNode,
  wardrobe: TShirtIcon as IconNode,
  picture: Image02Icon as IconNode,
  download: Download04Icon as IconNode,
  print: PrinterIcon as IconNode,
  included: CheckmarkCircle02Icon as IconNode,
  locked: SquareLock02Icon as IconNode,
} satisfies Record<string, IconNode>;

export type IconName = keyof typeof ICONS;

const KEBAB = /[A-Z]/g;

/**
 * The icon data is written for React, so `strokeWidth` has to become
 * `stroke-width` before it means anything in plain HTML.
 */
export function htmlAttributes(attrs: { readonly [key: string]: string | number }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'key') continue;
    out[key.replace(KEBAB, (letter) => `-${letter.toLowerCase()}`)] = String(value);
  }
  return out;
}
