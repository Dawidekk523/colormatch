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

const HIDDEN = '••';

/**
 * The free result is the first part of one report, so this block shows the rest
 * of it rather than describing it: three cards drawn from the reader's own
 * reading, covered. On a phone they are a rail you swipe, because a stack of
 * three full-width cards is a screen and a half of scrolling before the price.
 * The figures are replaced before anything is drawn, so what is being sold is
 * never sitting in the page.
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

      <div className="peek" role="group" aria-label={`A preview of the paid ${report.seasonName} report`}>
        <article className="peek__card">
          <h3>Your measurements</h3>
          <div className="peek__body" aria-hidden="true">
            {report.axes.map((axis) => (
              <div key={axis.id} className="peek__meter">
                <span className="peek__line">
                  <strong>{axis.label}</strong>
                  <span>
                    {axis.value < 0 ? axis.leftLabel : axis.rightLabel} {HIDDEN}
                  </span>
                </span>
                <span className="peek__track">
                  <span className="peek__marker" />
                </span>
              </div>
            ))}
          </div>
          <p className="peek__lock">
            <Icon name="locked" size={18} />
            Locked
          </p>
        </article>

        <article className="peek__card">
          <h3>All four scored</h3>
          <ul className="peek__body peek__bars" aria-hidden="true">
            {report.matches.map((match, index) => (
              <li key={match.season}>
                <span>{match.name}</span>
                <span className="peek__bar">
                  <span style={{ width: `${72 - index * 16}%`, background: match.accent }} />
                </span>
                <span>{HIDDEN}%</span>
              </li>
            ))}
          </ul>
          <p className="peek__lock">
            <Icon name="locked" size={18} />
            Locked
          </p>
        </article>

        <article className="peek__card">
          <h3>Every colour</h3>
          <ul className="peek__body peek__swatches" aria-hidden="true">
            {report.wear.slice(0, 4).map((swatch) => (
              <li key={swatch.hex}>
                <span className="peek__chip" style={{ background: swatch.hex }} />
                <span>{swatch.name}</span>
                <span>{HIDDEN}</span>
              </li>
            ))}
          </ul>
          <p className="peek__lock">
            <Icon name="locked" size={18} />
            Locked
          </p>
        </article>
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
