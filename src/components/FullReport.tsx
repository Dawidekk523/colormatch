import type { FullReportData, MeasuredSwatch } from '../lib/report';
import { ShareExport } from './ShareExport';

interface Props {
  report: FullReportData;
}

/** A meter for one axis: where the reading sits between the two ends. */
function AxisMeter({
  label,
  leftLabel,
  rightLabel,
  value,
  verdict,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  verdict: string;
}) {
  const position = (value + 100) / 2;
  const side = value < 0 ? leftLabel : rightLabel;
  return (
    <div className="meter">
      <div className="meter__head">
        <h3 className="meter__label">{label}</h3>
        <p className="meter__value">
          {side} <span>{Math.abs(value)}</span>
        </p>
      </div>
      <div className="meter__track" role="img" aria-label={`${label}: ${Math.abs(value)} out of 100 towards ${side}`}>
        <span className="meter__middle" aria-hidden="true" />
        <span className="meter__marker" style={{ left: `${position}%` }} aria-hidden="true" />
      </div>
      <div className="meter__ends" aria-hidden="true">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <p className="meter__verdict">{verdict}</p>
    </div>
  );
}

/** Colour names and their measurements, because the card is meant to be used. */
function SwatchTable({ title, note, swatches }: { title: string; note: string; swatches: MeasuredSwatch[] }) {
  return (
    <section className="stack">
      <h3>{title}</h3>
      <p className="note">{note}</p>
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Colour</th>
            <th scope="col">Hex</th>
            <th scope="col">RGB</th>
            <th scope="col">Lightness</th>
            <th scope="col">Intensity</th>
          </tr>
        </thead>
        <tbody>
          {swatches.map((swatch) => (
            <tr key={swatch.hex}>
              <th scope="row">
                <span className="data-table__swatch">
                  <span className="data-table__chip" style={{ background: swatch.hex }} aria-hidden="true" />
                  {swatch.name}
                </span>
              </th>
              <td className="num">{swatch.hex.toUpperCase()}</td>
              <td className="num">
                {swatch.rgb.r}, {swatch.rgb.g}, {swatch.rgb.b}
              </td>
              <td className="num">{swatch.lightness}</td>
              <td className="num">{swatch.chroma}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/**
 * Every colour in the palette placed by how light it is and how intense, with
 * the colours to avoid drawn as hollow rings on the same field. Seeing the two
 * groups sit in different parts of the chart is the clearest evidence that a
 * palette is a shape rather than a list of favourites.
 */
function PaletteMap({ report }: { report: FullReportData }) {
  const width = 100;
  const height = 64;
  const left = 13;
  const bottom = height - 9;
  const top = 5;
  const right = width - 4;
  const x = (chroma: number) => left + (Math.min(chroma, 110) / 110) * (right - left);
  const y = (lightness: number) => bottom - (Math.min(lightness, 100) / 100) * (bottom - top);

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Your palette plotted by lightness and intensity">
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={`l-${tick}`}>
            <line x1={left} x2={right} y1={y(tick)} y2={y(tick)} stroke="rgba(21,22,26,0.1)" strokeWidth={0.25} />
            <text x={left - 2} y={y(tick) + 1.2} textAnchor="end" fontSize={3} fill="#54585f">
              {tick}
            </text>
          </g>
        ))}
        {[0, 55, 110].map((tick, index) => (
          <text
            key={`c-${tick}`}
            x={x(tick)}
            y={height - 4}
            textAnchor={index === 0 ? 'start' : index === 2 ? 'end' : 'middle'}
            fontSize={3}
            fill="#54585f"
          >
            {tick}
          </text>
        ))}
        {report.avoid.map((swatch) => (
          <circle
            key={`avoid-${swatch.hex}`}
            cx={x(swatch.chroma)}
            cy={y(swatch.lightness)}
            r={1.9}
            fill="none"
            stroke={swatch.hex}
            strokeWidth={0.7}
            strokeDasharray="1.1 1.1"
          />
        ))}
        {[...report.neutrals, ...report.wear].map((swatch) => (
          <circle
            key={`wear-${swatch.hex}`}
            cx={x(swatch.chroma)}
            cy={y(swatch.lightness)}
            r={2.3}
            fill={swatch.hex}
            stroke="rgba(21,22,26,0.15)"
            strokeWidth={0.3}
          />
        ))}
      </svg>
      <figcaption className="chart__caption">
        Filled dots are your colours, dashed rings the ones to be careful with. Left to right is intensity,
        0 to 110; bottom to top is lightness, 0 to 100. Yours average {report.stats.lightness} lightness and{' '}
        {report.stats.chroma} intensity; the ones to avoid average {report.avoidStats.lightness} and{' '}
        {report.avoidStats.chroma}.
      </figcaption>
    </figure>
  );
}

/** How near each of the four seasons came, as bars in the order they scored. */
function SeasonFit({ report }: { report: FullReportData }) {
  const top = report.matches[0]?.percent ?? 1;
  return (
    <figure className="chart">
      <ul className="bars">
        {report.matches.map((match) => (
          <li key={match.season} className={match.season === report.season ? 'bars__row bars__row--on' : 'bars__row'}>
            <span className="bars__name">{match.name}</span>
            <span className="bars__track">
              <span
                className="bars__fill"
                style={{ width: `${(match.percent / top) * 100}%`, background: match.accent }}
              />
            </span>
            <span className="bars__value num">{match.percent}%</span>
          </li>
        ))}
      </ul>
      <figcaption className="chart__caption">
        Share of the total match across the four seasons. A second season within a few points of the first is
        worth trying in a shop — the two palettes overlap more than their names suggest.
      </figcaption>
    </figure>
  );
}

/**
 * The bought report: the same result the free page shows, taken as far as the
 * reading honestly allows — the numbers behind it, where the reading sits
 * between the seasons, the palette with its measurements, and the shopping
 * rules that follow from all of it.
 */
export function FullReport({ report }: Props) {
  const { metrics } = report;

  return (
    <article className="report stack-lg" data-season={report.season}>
      <header className="report__head" style={{ borderColor: report.accent }}>
        <h2 className="report__season">{report.seasonName}</h2>
        <p className="lede">
          {report.subtype.name} — {report.tagline.toLowerCase()}. {report.description}
        </p>
        <dl className="report__facts">
          <div>
            <dt>Subtype</dt>
            <dd>{report.subtype.name}</dd>
          </div>
          <div>
            <dt>Undertone</dt>
            <dd>{report.undertoneLabel}</dd>
          </div>
          <div>
            <dt>Read from</dt>
            <dd>{report.source === 'photo' ? 'Your photo' : 'Your quiz answers'}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd className="num">{report.confidencePct}%</dd>
          </div>
        </dl>
      </header>

      <section className="stack">
        <h3>Your three measurements</h3>
        <p>
          A season is three decisions, not one. These are the three the reading made, and how far from the
          middle each one landed.
        </p>
        <div className="meters">
          {report.axes.map((axis) => (
            <AxisMeter
              key={axis.id}
              label={axis.label}
              leftLabel={axis.leftLabel}
              rightLabel={axis.rightLabel}
              value={axis.value}
              verdict={axis.verdict}
            />
          ))}
        </div>
      </section>

      <section className="stack">
        <h3>How close the other seasons came</h3>
        <SeasonFit report={report} />
      </section>

      <section className="stack">
        <h3>What the reading was based on</h3>
        {report.measured && report.source === 'photo' ? (
          <dl className="report__facts report__facts--numbers">
            <div>
              <dt>Skin hue angle</dt>
              <dd className="num">{metrics.hueAngle}°</dd>
            </div>
            <div>
              <dt>Typology angle</dt>
              <dd className="num">{metrics.ita}°</dd>
            </div>
            <div>
              <dt>Face contrast</dt>
              <dd className="num">{metrics.contrast}</dd>
            </div>
            <div>
              <dt>Skin found in the photo</dt>
              <dd className="num">{Math.round((metrics.coverage ?? 0) * 100)}%</dd>
            </div>
          </dl>
        ) : null}
        {report.measured && report.source === 'quiz' && metrics.points ? (
          <dl className="report__facts report__facts--numbers">
            <div>
              <dt>Warm points</dt>
              <dd className="num">{metrics.points.warm > 0 ? `+${metrics.points.warm}` : metrics.points.warm}</dd>
            </div>
            <div>
              <dt>Light points</dt>
              <dd className="num">{metrics.points.light > 0 ? `+${metrics.points.light}` : metrics.points.light}</dd>
            </div>
            <div>
              <dt>Clarity points</dt>
              <dd className="num">{metrics.points.clear > 0 ? `+${metrics.points.clear}` : metrics.points.clear}</dd>
            </div>
          </dl>
        ) : null}
        <p className="note">
          {report.source === 'photo'
            ? 'Hue angle places your skin between blue-based and golden; the typology angle is the standard measure of how light skin is; face contrast is the lightness gap between your skin and the darkest part of the photo. Bands: cool below 52°, warm above 58°, light above 28° typology, clear above 45 contrast.'
            : 'Each answer moves one or more of the three axes. Two points in one direction is enough to settle an axis, which is why a mixed answer is worth as much as a decisive one that cancels out.'}
        </p>
      </section>

      <section className="stack">
        <h3>Your palette, measured</h3>
        <PaletteMap report={report} />
      </section>

      <SwatchTable
        title="Colours to wear near your face"
        note="Tops, scarves, glasses, lipstick. Lightness runs 0–100 and intensity 0–110, so you can match a shade in a shop app without carrying a card."
        swatches={report.wear}
      />

      <section className="stack">
        <h3>
          {report.subtype.name}: the {report.subtypeWear.length} shades closest to you
        </h3>
        <p>
          The twelve-season palettes are not twelve unrelated sets of colours. Yours is {report.seasonName} at
          its {report.subtype.lean === 'true' ? 'most typical' : `${report.subtype.lean}est`}
          {report.neighbour ? `, with three shades borrowed from ${report.neighbour.name}` : ''} — the shades
          below are the ones your reading leans hardest towards, and the place to start if you only buy one
          thing.
        </p>
        <ul className="subtype-swatches">
          {report.subtypeWear.map((swatch) => (
            <li key={swatch.hex}>
              <span className="subtype-swatches__chip" style={{ background: swatch.hex }} aria-hidden="true" />
              <span className="subtype-swatches__name">{swatch.name}</span>
              <span className="subtype-swatches__hex num">{swatch.hex.toUpperCase()}</span>
              {swatch.borrowed && report.neighbour ? (
                <span className="subtype-swatches__from">from {report.neighbour.name}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <SwatchTable
        title="Your neutrals"
        note="Coats, trousers, bags. These carry the colours above without fighting them."
        swatches={report.neutrals}
      />

      <SwatchTable title="Colours to be careful with" note={report.avoidReason} swatches={report.avoid} />

      <section className="stack">
        <h3>How to shop your palette</h3>
        <dl className="rules">
          <div>
            <dt>Metals</dt>
            <dd>{report.wardrobe.metals}</dd>
          </div>
          <div>
            <dt>Whites</dt>
            <dd>{report.wardrobe.whites}</dd>
          </div>
          <div>
            <dt>Denim</dt>
            <dd>{report.wardrobe.denim}</dd>
          </div>
          <div>
            <dt>Lip colour</dt>
            <dd>{report.wardrobe.lipstick}</dd>
          </div>
          <div>
            <dt>Prints</dt>
            <dd>{report.wardrobe.prints}</dd>
          </div>
          <div>
            <dt>Hair colour</dt>
            <dd>{report.wardrobe.hair}</dd>
          </div>
        </dl>
      </section>

      <section className="stack">
        <h3>What to check on the rail</h3>
        <ul className="tips">
          {report.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="stack">
        <h3>Three things to try this week</h3>
        <ul className="tips">
          {report.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      {report.neighbour ? (
        <section className="stack">
          <h3>If something still looks off</h3>
          <p>
            {report.subtype.name} leans towards {report.neighbour.name}. If a colour from the list above feels
            too much, take the same colour one step towards {report.neighbour.name.toLowerCase()} — that is the
            edge your colouring sits on, and it is the first place to look before doubting the season.
          </p>
        </section>
      ) : null}

      <ShareExport report={report} />

      <p className="note">
        This is a guide for choosing clothes, not a measurement of you. Screens, lighting and make-up all
        change how a colour looks, and none of this is a health or medical assessment.
      </p>
    </article>
  );
}
