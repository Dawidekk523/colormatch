import { useId, useState } from 'react';
import { SEASONS, type SeasonId } from '../lib/seasons-data';
import { Drape, SEASON_ARCHETYPE } from './Drape';

interface Props {
  season?: SeasonId;
}

/**
 * Side-by-side comparison on one colour study: drag the handle, or use the arrow
 * keys, to swap between a colour that suits the season and one that fights it.
 * The two colours are also named in words underneath, so the slider is never
 * the only way to understand the point.
 */
export function ColourCompare({ season = 'summer' }: Props) {
  const [position, setPosition] = useState(50);
  const id = useId();
  const data = SEASONS[season];
  const archetype = SEASON_ARCHETYPE[season]!;
  const good = data.wear[0]!;
  const poor = data.avoid[0]!;

  return (
    <figure className="compare">
      <div className="compare__stage">
        <Drape
          className="compare__layer"
          skin={archetype.skin}
          hair={archetype.hair}
          background="#ffffff"
          shirt={poor.hex}
          label={`${archetype.label}, worn with ${poor.name}`}
        />
        <div className="compare__layer compare__layer--top" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <Drape
            className="compare__svg"
            skin={archetype.skin}
            hair={archetype.hair}
            background="#ffffff"
            shirt={good.hex}
            label={`${archetype.label}, worn with ${good.name}`}
          />
        </div>
        <div className="compare__divider" style={{ left: `${position}%` }} aria-hidden="true">
          <span className="compare__handle">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9.5 6 5 12l4.5 6M14.5 6l4.5 6-4.5 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <input
          id={id}
          className="compare__range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label={`Slide to compare ${poor.name} on the left with ${good.name} on the right`}
        />
      </div>
      <figcaption className="compare__caption">
        <span className="compare__side">
          <span className="compare__chip" style={{ background: poor.hex }} aria-hidden="true" />
          Left: {poor.name} — fights a {data.name} colouring
        </span>
        <span className="compare__side">
          <span className="compare__chip" style={{ background: good.hex }} aria-hidden="true" />
          Right: {good.name} — a {data.name} colour
        </span>
      </figcaption>
    </figure>
  );
}
