import { useId, useState } from 'react';
import { SEASONS, type SeasonId } from '../lib/seasons-data';
import { Portrait, SEASON_ARCHETYPE } from './Portrait';

interface Props {
  season?: SeasonId;
}

/**
 * Side-by-side comparison on one drawing: drag the handle, or use the arrow
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
        <Portrait
          className="compare__layer"
          skin={archetype.skin}
          hair={archetype.hair}
          background="#ffffff"
          shirt={poor.hex}
          label={`${archetype.label}, wearing ${poor.name}`}
        />
        <div className="compare__layer compare__layer--top" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <Portrait
            className="compare__svg"
            skin={archetype.skin}
            hair={archetype.hair}
            background="#ffffff"
            shirt={good.hex}
            label={`${archetype.label}, wearing ${good.name}`}
          />
        </div>
        <div className="compare__divider" style={{ left: `${position}%` }} aria-hidden="true" />
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
