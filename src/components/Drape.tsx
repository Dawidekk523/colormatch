interface Props {
  skin: string;
  hair: string;
  shirt: string;
  background: string;
  /** Read out instead of the drawing itself. */
  label: string;
  className?: string;
}

/**
 * A colour study, not a portrait: a band of hair tone above a field of skin
 * tone, with the garment colour worn under a neckline. It is deliberately
 * abstract — a face drawn flat looks like a cartoon, and the point here is the
 * colour meeting the skin. The same geometry is baked into the sample files in
 * public/samples, so what the analyser reads matches what people see.
 */
export function Drape({ skin, hair, shirt, background, label, className }: Props) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="400" fill={background} />
      <rect y="0" width="400" height="88" fill={hair} />
      <rect y="88" width="400" height="192" fill={skin} />
      <rect y="280" width="400" height="120" fill={shirt} />
      <path d="M150 280h100l-50 62z" fill={skin} />
    </svg>
  );
}

export interface Archetype {
  skin: string;
  hair: string;
  background: string;
  label: string;
}

export const SEASON_ARCHETYPE: Record<string, Archetype> = {
  spring: {
    skin: '#f0d2a8',
    hair: '#8a5a2b',
    background: '#f7f4ef',
    label: 'Colour study: light warm skin with light brown hair',
  },
  summer: {
    skin: '#efc9bb',
    hair: '#a9967a',
    background: '#f1f2f4',
    label: 'Colour study: light cool skin with ash blonde hair',
  },
  autumn: {
    skin: '#a5683c',
    hair: '#3a2416',
    background: '#f7f4ef',
    label: 'Colour study: deep warm skin with dark brown hair',
  },
  winter: {
    skin: '#6b4442',
    hair: '#17141c',
    background: '#f1f2f4',
    label: 'Colour study: deep cool skin with black hair',
  },
};
