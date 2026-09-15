import { contrastRatio, hexToRgb } from '../lib/color';
import type { Swatch } from '../lib/seasons-data';

interface Props {
  title: string;
  description?: string;
  swatches: Swatch[];
  /** Colours to steer away from are marked in words, never by colour alone. */
  tone?: 'wear' | 'avoid';
}

/**
 * The colour itself is decoration; the name and the hex code below it carry the
 * meaning, so nothing depends on being able to tell two swatches apart.
 */
export function Swatches({ title, description, swatches, tone = 'wear' }: Props) {
  return (
    <section className="swatch-block">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      <ul className="swatch-grid">
        {swatches.map((swatch) => {
          const light = contrastRatio(hexToRgb(swatch.hex), hexToRgb('#ffffff')) < 1.6;
          return (
            <li key={`${swatch.name}-${swatch.hex}`} className="swatch">
              <span
                className={light ? 'swatch__chip swatch__chip--outlined' : 'swatch__chip'}
                style={{ background: swatch.hex }}
                aria-hidden="true"
              />
              <span className="swatch__name">{swatch.name}</span>
              <span className="swatch__hex">{swatch.hex.toUpperCase()}</span>
              <span className="visually-hidden">
                {tone === 'wear' ? 'Good colour for you' : 'Colour to use carefully'}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
