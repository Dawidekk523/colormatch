import { useId, useRef, useState } from 'react';
import { SEASONS, SEASON_ORDER, UNDERTONE_LABEL, type SeasonId } from '../lib/seasons-data';
import { Portrait, SEASON_ARCHETYPE } from './Portrait';

interface Props {
  initial?: SeasonId;
  heading?: string;
}

/**
 * Tabbed gallery: pick a season, see a person drawn in that season's colours
 * next to the palette itself. Arrow keys move between tabs, as tabs should.
 */
export function SeasonExplorer({ initial = 'spring', heading }: Props) {
  const [active, setActive] = useState<SeasonId>(initial);
  const [shirt, setShirt] = useState<string | null>(null);
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const season = SEASONS[active];
  const archetype = SEASON_ARCHETYPE[active]!;
  const worn = shirt ?? season.accent;
  const wornName = season.wear.find((s) => s.hex === worn)?.name ?? season.wear[0]!.name;

  const move = (direction: -1 | 1) => {
    const index = SEASON_ORDER.indexOf(active);
    const nextId = SEASON_ORDER[(index + direction + SEASON_ORDER.length) % SEASON_ORDER.length]!;
    setActive(nextId);
    setShirt(null);
    tabRefs.current[nextId]?.focus();
  };

  return (
    <div className="explorer">
      {heading ? <h2>{heading}</h2> : null}
      <div
        className="tabs"
        role="tablist"
        aria-label="Colour seasons"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            move(1);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {SEASON_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${id}`}
            className="tab"
            aria-selected={active === id}
            aria-controls={`${baseId}-panel-${id}`}
            tabIndex={active === id ? 0 : -1}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            onClick={() => {
              setActive(id);
              setShirt(null);
            }}
          >
            {SEASONS[id].name}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
        className="explorer__panel"
      >
        <div className="explorer__figure">
          <Portrait
            className="portrait"
            skin={archetype.skin}
            hair={archetype.hair}
            background={archetype.background}
            shirt={worn}
            label={`${archetype.label}, wearing ${wornName}`}
          />
          <p className="explorer__caption">
            Wearing <strong>{wornName}</strong> ({worn.toUpperCase()})
          </p>
        </div>

        <div className="explorer__body stack">
          <h3>{season.name}: {season.tagline.toLowerCase()}</h3>
          <p>{season.description}</p>
          <p className="badge">{UNDERTONE_LABEL[season.undertone]}</p>

          <p className="explorer__prompt" id={`${baseId}-pick`}>
            Tap a colour to put it on the drawing:
          </p>
          <ul className="picker" aria-labelledby={`${baseId}-pick`}>
            {season.wear.map((swatch) => (
              <li key={swatch.hex}>
                <button
                  type="button"
                  className={worn === swatch.hex ? 'picker__item picker__item--on' : 'picker__item'}
                  aria-pressed={worn === swatch.hex}
                  onClick={() => setShirt(swatch.hex)}
                >
                  <span className="picker__chip" style={{ background: swatch.hex }} aria-hidden="true" />
                  <span>{swatch.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <a className="btn btn--secondary" href="/color-seasons/">
            Read more about {season.name}
          </a>
        </div>
      </div>
    </div>
  );
}
