interface Props {
  /** Path to the portrait in public/photos. */
  photo: string;
  /** Where the clothing starts in the photo, 0–1 from the top. */
  clothTop: number;
  /** The colour draped over the clothing. */
  shirt: string;
  /** Describes the person and the colour they are draped in. */
  label: string;
  className?: string;
  eager?: boolean;
  /** For a second copy of the same photo, which adds nothing when read aloud. */
  decorative?: boolean;
}

/**
 * A photograph with a colour laid over the clothing, the way a stylist holds a
 * length of fabric under someone's chin. The scooped top edge keeps the neck
 * and jaw visible, because that is where a colour either lifts the skin or
 * drains it — covering the face would hide the only thing worth looking at.
 */
export function Drape({
  photo,
  clothTop,
  shirt,
  label,
  className,
  eager = false,
  decorative = false,
}: Props) {
  return (
    <span className={className ? `drape ${className}` : 'drape'}>
      <img
        className="drape__photo"
        src={photo}
        alt={decorative ? '' : label}
        width={640}
        height={800}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      <svg
        className="drape__cloth"
        style={{ top: `${clothTop * 100}%` }}
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0C24 17 76 17 100 0v60H0z" fill={shirt} />
      </svg>
    </span>
  );
}

export interface Archetype {
  photo: string;
  clothTop: number;
  /** Describes the colouring, never the person. */
  description: string;
}

export const SEASON_ARCHETYPE: Record<string, Archetype> = {
  spring: {
    photo: '/photos/spring.jpg',
    clothTop: 0.74,
    description: 'Person with light warm skin and dark hair',
  },
  summer: {
    photo: '/photos/summer.jpg',
    clothTop: 0.5,
    description: 'Person with light cool skin and blonde hair',
  },
  autumn: {
    photo: '/photos/autumn.jpg',
    clothTop: 0.68,
    description: 'Person with deep warm skin and black hair',
  },
  winter: {
    photo: '/photos/winter.jpg',
    clothTop: 0.6,
    description: 'Person with cool skin and black hair',
  },
};
