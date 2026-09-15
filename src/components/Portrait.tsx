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
 * A flat drawing, not a photograph. It is the same shape the sample files use,
 * so what people see in the examples matches what the analyser actually reads.
 */
export function Portrait({ skin, hair, shirt, background, label, className }: Props) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="400" fill={background} />
      <path d="M60 400c0-62 63-104 140-104s140 42 140 104z" fill={shirt} />
      <rect x="170" y="236" width="60" height="60" rx="26" fill={skin} />
      <path d="M200 44c-64 0-104 44-104 108 0 66 46 128 104 128s104-62 104-128c0-64-40-108-104-108z" fill={hair} />
      <ellipse cx="200" cy="188" rx="86" ry="104" fill={skin} />
      <path d="M200 52c-58 0-94 34-98 82 26-26 56-38 98-38s72 12 98 38c-4-48-40-82-98-82z" fill={hair} />
      <ellipse cx="170" cy="176" rx="9" ry="11" fill="#2b2b2b" />
      <ellipse cx="230" cy="176" rx="9" ry="11" fill="#2b2b2b" />
      <path d="M152 152c11-7 23-7 34-2" stroke={hair} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M214 150c11-5 23-5 34 2" stroke={hair} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M182 232c11 8 25 8 36 0" stroke="#8a4a46" strokeWidth="7" strokeLinecap="round" fill="none" />
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
  spring: { skin: '#f0d2a8', hair: '#8a5a2b', background: '#eef2f6', label: 'Drawing of a person with light warm skin and light brown hair' },
  summer: { skin: '#efc9bb', hair: '#a9967a', background: '#f1f0f5', label: 'Drawing of a person with light cool skin and ash blonde hair' },
  autumn: { skin: '#a5683c', hair: '#3a2416', background: '#f6f1e9', label: 'Drawing of a person with deep warm skin and dark brown hair' },
  winter: { skin: '#6b4442', hair: '#17141c', background: '#eef1f6', label: 'Drawing of a person with deep cool skin and black hair' },
};
