import { FREE_SECTION_COUNT, REPORT_EXTRAS, REPORT_SECTION_COUNT } from '../lib/report';
import { Icon } from './Icon';

const PRICE = import.meta.env.PUBLIC_CARD_PRICE ?? '$9.99';

/**
 * On a development machine the button opens the report itself, so the paid page
 * can be looked at while it is being built. Everywhere else it goes to checkout,
 * which is the only way to see it for real.
 */
const FULL_REPORT_HREF = import.meta.env.DEV ? '/result/?preview=1' : '/pricing/';

interface Props {
  seasonName: string;
}

/**
 * The free result is the first part of one report, not a different product.
 * This block says exactly where the free part stops and what the rest holds,
 * with the real counts — a reader who can check the claim is far likelier to
 * believe the rest of the page.
 */
export function ReportTeaser({ seasonName }: Props) {
  const remaining = REPORT_SECTION_COUNT - FREE_SECTION_COUNT;

  return (
    <section className="teaser stack" aria-labelledby="teaser-heading">
      <p className="teaser__progress">
        <span className="teaser__bar" aria-hidden="true">
          <span
            className="teaser__bar-fill"
            style={{ width: `${(FREE_SECTION_COUNT / REPORT_SECTION_COUNT) * 100}%` }}
          />
        </span>
        You have read {FREE_SECTION_COUNT} of the {REPORT_SECTION_COUNT} parts of your {seasonName} report.
      </p>

      <h2 id="teaser-heading">The other {remaining} parts</h2>
      <p>
        Everything above stays free. The full report takes the same reading further: the numbers behind your
        season, which of the twelve subtypes you are, and every colour measured so you can match it in a shop.
      </p>

      <ul className="teaser__list">
        {REPORT_EXTRAS.map((extra) => (
          <li key={extra.title}>
            <Icon name={extra.icon} />
            <strong>{extra.title}</strong>
            <span>{extra.detail}</span>
          </li>
        ))}
      </ul>

      <div className="cluster">
        <a className="btn btn--primary" href={FULL_REPORT_HREF}>
          See the full report — {import.meta.env.DEV ? 'preview' : PRICE}
        </a>
        <a className="btn btn--quiet" href="/color-seasons/">
          Compare all four seasons
        </a>
      </div>
      <p className="note">One payment, no subscription and no account. The link in your email reopens it anywhere.</p>
    </section>
  );
}
