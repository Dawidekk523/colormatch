import { FREE_SECTION_COUNT, REPORT_EXTRAS, REPORT_SECTION_COUNT, type FullReportData } from '../lib/report';
import { Icon } from './Icon';

const PRICE = import.meta.env.PUBLIC_CARD_PRICE ?? '$9.99';

/**
 * On a development machine the button opens the report itself, so the paid page
 * can be looked at while it is being built. Everywhere else it goes to checkout,
 * which is the only way to see it for real.
 */
const FULL_REPORT_HREF = import.meta.env.DEV ? '/result/?preview=1' : '/pricing/';

interface Props {
  report: FullReportData;
}

/**
 * The free result is the first part of one report, not a different product, so
 * this block shows the rest of it rather than describing it: the real meters,
 * the real season scores and the real palette, drawn from this visitor's own
 * reading and then covered. The figures are replaced before they are drawn, so
 * what is being sold never sits in the page waiting to be read.
 */
export function ReportTeaser({ report }: Props) {
  const remaining = REPORT_SECTION_COUNT - FREE_SECTION_COUNT;
  const hidden = '••';

  return (
    <section className="teaser stack" aria-labelledby="teaser-heading">
      <p className="teaser__progress">
        <span className="teaser__bar" aria-hidden="true">
          <span
            className="teaser__bar-fill"
            style={{ width: `${(FREE_SECTION_COUNT / REPORT_SECTION_COUNT) * 100}%` }}
          />
        </span>
        You have read {FREE_SECTION_COUNT} of the {REPORT_SECTION_COUNT} parts of your {report.seasonName} report.
      </p>

      <h2 id="teaser-heading">The other {remaining} parts</h2>
      <p>
        Everything above stays free. The rest is the reading behind it — how warm, how light and how clear
        your colouring came out, which of the twelve subtypes that makes you, and every colour measured.
      </p>

      <div className="locked">
        <div className="locked__peek" aria-hidden="true">
          {report.axes.map((axis) => (
            <div key={axis.id} className="locked__meter">
              <span className="locked__line">
                <strong>{axis.label}</strong>
                <span>
                  {axis.value < 0 ? axis.leftLabel : axis.rightLabel} {hidden}
                </span>
              </span>
              <span className="locked__track">
                <span className="locked__marker" />
              </span>
            </div>
          ))}

          <ul className="locked__bars">
            {report.matches.map((match, index) => (
              <li key={match.season}>
                <span>{match.name}</span>
                <span className="locked__bar">
                  <span style={{ width: `${72 - index * 16}%`, background: match.accent }} />
                </span>
                <span>{hidden}%</span>
              </li>
            ))}
          </ul>

          <ul className="locked__swatches">
            {report.wear.slice(0, 4).map((swatch) => (
              <li key={swatch.hex}>
                <span className="locked__chip" style={{ background: swatch.hex }} />
                <span>{swatch.name}</span>
                <span>{hidden}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="locked__veil">
          <span className="locked__badge">
            <Icon name="locked" size={20} />
            Your figures are in here
          </span>
        </p>
      </div>

      <ul className="teaser__list">
        {REPORT_EXTRAS.map((extra) => (
          <li key={extra.title}>
            <Icon name={extra.icon} />
            <strong>{extra.title}</strong>
            <span>{extra.detail}</span>
          </li>
        ))}
      </ul>

      <a className="btn btn--primary btn--block" href={FULL_REPORT_HREF}>
        See the full report — {import.meta.env.DEV ? 'preview' : PRICE}
      </a>
      <p className="note">
        One payment, no subscription and no account. The link in your email reopens it anywhere.
      </p>
    </section>
  );
}
