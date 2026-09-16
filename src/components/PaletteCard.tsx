import type { CardPayload } from '../lib/card';

interface Props {
  card: CardPayload;
}

/**
 * The thing that was actually bought: one sheet, sized to be printed and folded
 * into a handbag. It repeats the colours rather than linking to them, because
 * the whole point is that it works with no phone, no signal and no account —
 * standing in a shop, holding a jumper up to the light.
 */
export function PaletteCard({ card }: Props) {
  return (
    <article className="card-sheet" aria-label={`Your ${card.seasonName} palette card`}>
      <header className="card-sheet__head">
        <h2>{card.seasonName}</h2>
        <p>{card.undertoneLabel}</p>
      </header>

      <section className="card-sheet__block">
        <h3>Wear these near your face</h3>
        <ul className="card-sheet__colours">
          {card.wear.map((swatch) => (
            <li key={swatch.hex}>
              <span className="card-sheet__chip" style={{ background: swatch.hex }} aria-hidden="true" />
              <span className="card-sheet__name">{swatch.name}</span>
              <span className="card-sheet__hex">{swatch.hex.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-sheet__block">
        <h3>Everyday neutrals</h3>
        <ul className="card-sheet__colours">
          {card.neutrals.map((swatch) => (
            <li key={swatch.hex}>
              <span className="card-sheet__chip" style={{ background: swatch.hex }} aria-hidden="true" />
              <span className="card-sheet__name">{swatch.name}</span>
              <span className="card-sheet__hex">{swatch.hex.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-sheet__block">
        <h3>Be careful with</h3>
        <ul className="card-sheet__colours">
          {card.avoid.map((swatch) => (
            <li key={swatch.hex}>
              <span className="card-sheet__chip card-sheet__chip--outlined" style={{ background: swatch.hex }} aria-hidden="true" />
              <span className="card-sheet__name">{swatch.name}</span>
              <span className="card-sheet__hex">{swatch.hex.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-sheet__block">
        <h3>What to look for when you shop</h3>
        <ul className="card-sheet__checklist">
          {card.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <footer className="card-sheet__foot">
        <p>colormatch — getcolormatch.com</p>
      </footer>
    </article>
  );
}
