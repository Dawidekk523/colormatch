import { buildReport, FREE_SECTION_COUNT, REPORT_SECTION_COUNT, REPORT_EXTRAS, type FullReportData } from '../lib/report';
import { Icon } from './Icon';

const PRICE = import.meta.env.PUBLIC_CARD_PRICE ?? '$9.99';

/**
 * On a development machine the button opens the report itself, so the paid page
 * can be looked at while it is being built. Everywhere else it goes to checkout,
 * which is the only way to see it for real.
 */
const FULL_REPORT_HREF = import.meta.env.DEV ? '/result/?preview=1' : '/pricing/';

/**
 * A worked example, not this visitor's reading: a soft summer with a decisive
 * cool undertone. Showing real figures from a different person is the honest
 * way to show what the report looks like — covering up their own numbers only
 * proves that something is hidden, not that it is worth having.
 */
const EXAMPLE = buildReport({
  season: 'summer',
  undertone: 'cool',
  source: 'photo',
  confidence: 0.78,
  metrics: { warm: -62, light: 54, clear: -41, hueAngle: 45.7, ita: 41.5, contrast: 34.8, coverage: 0.42 },
});

interface Props {
  report: FullReportData;
}

function Meters() {
  return (
    <div className="peek__meters">
      {EXAMPLE.axes.map((axis) => {
        const side = axis.value < 0 ? axis.leftLabel : axis.rightLabel;
        return (
          <div key={axis.id}>
            <span className="peek__line">
              <strong>{axis.label}</strong>
              <span className="num">
                {side} {Math.abs(axis.value)}
              </span>
            </span>
            <span className="peek__track">
              <span className="peek__marker" style={{ left: `${(axis.value + 100) / 2}%` }} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Scores() {
  const top = EXAMPLE.matches[0]?.percent ?? 1;
  return (
    <ul className="peek__bars">
      {EXAMPLE.matches.map((match) => (
        <li key={match.season}>
          <span>{match.name}</span>
          <span className="peek__bar">
            <span style={{ width: `${(match.percent / top) * 100}%`, background: match.accent }} />
          </span>
          <span className="num">{match.percent}%</span>
        </li>
      ))}
    </ul>
  );
}

function Measured() {
  return (
    <ul className="peek__swatches">
      {EXAMPLE.wear.slice(0, 4).map((swatch) => (
        <li key={swatch.hex}>
          <span className="peek__chip" style={{ background: swatch.hex }} />
          <span>
            {swatch.name}
            <em>{swatch.hex.toUpperCase()}</em>
          </span>
          <span className="num">
            {swatch.lightness} / {swatch.chroma}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The palette against the shades to avoid, on lightness and intensity. */
function Map() {
  const x = (chroma: number) => 6 + (Math.min(chroma, 110) / 110) * 88;
  const y = (lightness: number) => 54 - (Math.min(lightness, 100) / 100) * 48;
  return (
    <svg className="peek__map" viewBox="0 0 100 60" role="img" aria-label="Example palette chart">
      {[0, 50, 100].map((tick) => (
        <line key={tick} x1={6} x2={94} y1={y(tick)} y2={y(tick)} stroke="rgba(21,22,26,0.1)" strokeWidth={0.3} />
      ))}
      {EXAMPLE.avoid.map((swatch) => (
        <circle
          key={swatch.hex}
          cx={x(swatch.chroma)}
          cy={y(swatch.lightness)}
          r={2}
          fill="none"
          stroke={swatch.hex}
          strokeWidth={0.8}
          strokeDasharray="1.2 1.2"
        />
      ))}
      {EXAMPLE.wear.map((swatch) => (
        <circle key={swatch.hex} cx={x(swatch.chroma)} cy={y(swatch.lightness)} r={2.6} fill={swatch.hex} />
      ))}
    </svg>
  );
}

const CARDS = [
  { title: 'Three measurements, scored', note: 'Where the reading landed on each axis.', body: <Meters /> },
  { title: 'All four seasons scored', note: 'How near the runners-up came.', body: <Scores /> },
  { title: 'Every colour measured', note: 'Name, code, lightness and intensity.', body: <Measured /> },
  { title: 'Your palette, charted', note: 'Your shades against the ones to avoid.', body: <Map /> },
];

/**
 * The free result is the first part of one report, so this block shows what the
 * rest looks like: four cards of real figures from a worked example, on a rail
 * you swipe on a phone and a grid on a wide screen.
 */
export function ReportTeaser({ report }: Props) {
  const remaining = REPORT_SECTION_COUNT - FREE_SECTION_COUNT;

  return (
    <section className="paywall" aria-labelledby="paywall-heading">
      <p className="paywall__step">
        <span className="paywall__bar" aria-hidden="true">
          <span
            className="paywall__bar-fill"
            style={{ width: `${(FREE_SECTION_COUNT / REPORT_SECTION_COUNT) * 100}%` }}
          />
        </span>
        Part {FREE_SECTION_COUNT} of {REPORT_SECTION_COUNT}
      </p>

      <h2 id="paywall-heading">The other {remaining} parts of your {report.seasonName} report</h2>
      <p className="paywall__lede">
        Here is what they look like, from a worked example — a cool, soft summer. Yours would carry your own
        figures.
      </p>

      <div className="peek" role="group" aria-label="Examples from the full report">
        {CARDS.map((card) => (
          <article key={card.title} className="peek__card">
            <p className="peek__tag">Example</p>
            <h3>{card.title}</h3>
            {card.body}
            <p className="peek__note">{card.note}</p>
          </article>
        ))}
      </div>

      <ul className="paywall__list">
        {REPORT_EXTRAS.map((extra) => (
          <li key={extra.title}>
            <Icon name={extra.icon} size={20} />
            <strong>{extra.title}</strong>
            <span>{extra.detail}</span>
          </li>
        ))}
      </ul>

      <a className="btn btn--primary btn--block" href={FULL_REPORT_HREF}>
        Unlock the full report — {import.meta.env.DEV ? 'preview' : PRICE}
      </a>
      <p className="note paywall__small">One payment. No subscription, no account.</p>
    </section>
  );
}
