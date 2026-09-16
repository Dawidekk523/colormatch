import { SEASONS, UNDERTONE_LABEL, type SeasonId, type Undertone } from '../lib/seasons-data';
import { ReportTeaser } from './ReportTeaser';
import { Swatches } from './Swatches';

interface Props {
  season: SeasonId;
  undertone: Undertone;
  source: 'photo' | 'quiz';
  confidence: number;
  onRestart?: () => void;
  restartLabel?: string;
  headingLevel?: 2 | 3;
  /** Off on the bought report, where the full thing is already on the page. */
  showTeaser?: boolean;
}

function confidenceWords(confidence: number): string {
  if (confidence >= 0.66) return 'The answers pointed clearly in one direction.';
  if (confidence >= 0.33) return 'The answers leaned one way, but not strongly.';
  return 'This was a close call — the other seasons next door are worth trying too.';
}

export function ResultView({
  season,
  undertone,
  source,
  confidence,
  onRestart,
  restartLabel = 'Start over',
  headingLevel = 2,
  showTeaser = true,
}: Props) {
  const data = SEASONS[season];
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <div className="result stack-lg" data-season={season}>
      {onRestart ? (
        <div className="result-bar">
          <p className="result-bar__label">
            <span className="result-bar__chip" style={{ background: data.accent }} aria-hidden="true" />
            {data.name} — {source === 'photo' ? 'read from your photo' : 'from your quiz answers'}
          </p>
          <button type="button" className="btn btn--secondary btn--small" onClick={onRestart}>
            {restartLabel}
          </button>
        </div>
      ) : null}

      <div className="result__head" style={{ borderColor: data.accent }}>
        <p className="result__kicker">Your result</p>
        <Heading className="result__season">{data.name}</Heading>
        <p className="lede">{data.tagline}. {data.description}</p>
        <dl className="result__facts">
          <div>
            <dt>Possible undertone</dt>
            <dd>{UNDERTONE_LABEL[undertone]}</dd>
          </div>
          <div>
            <dt>Based on</dt>
            <dd>{source === 'photo' ? 'The photo you chose' : 'Your quiz answers'}</dd>
          </div>
          <div>
            <dt>How sure is this</dt>
            <dd>{confidenceWords(confidence)}</dd>
          </div>
        </dl>
      </div>

      <Swatches
        title={`Colours to wear: ${data.name}`}
        description="These are the colours that usually work best near your face — tops, scarves, glasses and lipstick."
        swatches={data.wear}
      />

      <Swatches
        title="Your best neutrals"
        description="Everyday colours for coats, trousers and bags that go with everything above."
        swatches={data.neutrals}
      />

      <Swatches
        title="Colours to be careful with"
        description={data.avoidReason}
        swatches={data.avoid}
        tone="avoid"
      />

      <section className="stack">
        <h3>Three things to try this week</h3>
        <ul className="tips">
          {data.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      {showTeaser ? <ReportTeaser seasonName={data.name} /> : null}

      <p className="note">
        This is a guide for choosing clothes, not a measurement. Screens, lighting and make-up all change
        how colour looks, and it is not any kind of health or medical assessment. If a colour makes you
        feel good, wear it.
      </p>

      {onRestart ? (
        <div className="cluster">
          <a className="btn btn--quiet" href="/color-seasons/">
            Compare all four seasons
          </a>
        </div>
      ) : null}
    </div>
  );
}
