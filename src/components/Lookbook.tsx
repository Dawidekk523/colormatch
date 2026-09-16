import { useCallback, useEffect, useState } from 'react';
import { ACCEPT_ATTRIBUTE, checkFile, FILE_PROBLEM_MESSAGE } from '../lib/image-input';
import { Icon } from './Icon';

/** Must match CONSENT_WORDING in functions/api/lookbook/index.ts. */
const CONSENT = 'lookbook-2026-09-a';

interface Made {
  id: string;
  label: string;
  hex: string;
  src: string;
}

interface Catalogue {
  id: string;
  label: string;
}

interface Props {
  token: string;
}

type State =
  | { kind: 'checking' }
  | { kind: 'off' }
  | { kind: 'ready'; catalogue: Catalogue[]; made: Made[] };

/**
 * The one part of the site that sends a photograph anywhere, and it says so
 * before it does. The photo is not the one used for the reading — that one was
 * never kept — so it is chosen again here, deliberately, after the sentence
 * explaining where it goes and what comes back.
 */
export function Lookbook({ token }: Props) {
  const [state, setState] = useState<State>({ kind: 'checking' });
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/lookbook?token=${token}`);
      const body = (await response.json()) as {
        available?: boolean;
        catalogue?: Catalogue[];
        looks?: Made[];
      };
      if (!body.available) {
        setState({ kind: 'off' });
        return;
      }
      setState({ kind: 'ready', catalogue: body.catalogue ?? [], made: body.looks ?? [] });
      if ((body.looks ?? []).length > 0) setAgreed(true);
    } catch {
      setState({ kind: 'off' });
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const make = useCallback(
    async (lookId: string, file: File) => {
      const trouble = checkFile(file);
      if (trouble) {
        setProblem(FILE_PROBLEM_MESSAGE[trouble]);
        return;
      }
      setBusy(lookId);
      setProblem(null);
      try {
        const form = new FormData();
        form.append('token', token);
        form.append('look', lookId);
        form.append('consent', CONSENT);
        form.append('photo', file);
        const response = await fetch('/api/lookbook', { method: 'POST', body: form });
        const body = (await response.json()) as { look?: Made; error?: string };
        if (!response.ok || !body.look) {
          setProblem(body.error ?? 'That picture could not be made. Please try again.');
          return;
        }
        const made = body.look;
        setState((current) =>
          current.kind === 'ready'
            ? { ...current, made: [...current.made.filter((item) => item.id !== made.id), made] }
            : current,
        );
      } catch {
        setProblem('That picture could not be made. Please try again.');
      } finally {
        setBusy(null);
      }
    },
    [token],
  );

  const forget = useCallback(async () => {
    setProblem(null);
    try {
      await fetch(`/api/lookbook?token=${token}`, { method: 'DELETE' });
      setState((current) => (current.kind === 'ready' ? { ...current, made: [] } : current));
    } catch {
      setProblem('They could not be deleted just now. Please try again.');
    }
  }, [token]);

  if (state.kind !== 'ready') return null;

  const { catalogue, made } = state;

  return (
    <section className="stack lookbook">
      <h3>Your lookbook</h3>
      <p>
        Four pictures of you wearing your own colours, made from a photo you choose here. Unlike the reading,
        this one does leave your device: the photo is sent to an image service, used once, and not stored by
        us. The pictures that come back are kept with this report and you can delete them at any time.
      </p>

      <label className="lookbook__consent">
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
        <span>
          I agree to my photo being sent to the image service to make these pictures, and I am the person in
          it.
        </span>
      </label>

      <ul className="lookbook__grid">
        {catalogue.map((look) => {
          const picture = made.find((item) => item.id === look.id);
          const working = busy === look.id;
          return (
            <li key={look.id} className="lookbook__item">
              {picture ? (
                <img src={picture.src} alt={`You wearing ${picture.label.toLowerCase()}`} loading="lazy" />
              ) : (
                <span className="lookbook__empty" aria-hidden="true">
                  <Icon name="picture" size={24} />
                </span>
              )}
              <span className="lookbook__label">
                {picture ? (
                  <span className="lookbook__chip" style={{ background: picture.hex }} aria-hidden="true" />
                ) : null}
                {look.label}
              </span>
              <label className={agreed && !busy ? 'btn btn--quiet btn--small' : 'btn btn--quiet btn--small btn--off'}>
                {working ? 'Making it…' : picture ? 'Try another photo' : 'Make this one'}
                <input
                  className="visually-hidden"
                  type="file"
                  accept={ACCEPT_ATTRIBUTE}
                  disabled={!agreed || busy !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) void make(look.id, file);
                  }}
                />
              </label>
            </li>
          );
        })}
      </ul>

      <p className="note" aria-live="polite">
        {problem ??
          (busy
            ? 'Making your picture. This takes up to a minute.'
            : 'A clear, front-facing photo works best — the same kind that reads well for the analysis.')}
      </p>

      {made.length > 0 ? (
        <div className="cluster">
          <button type="button" className="btn btn--quiet btn--small" onClick={() => void forget()}>
            Delete my pictures
          </button>
        </div>
      ) : null}
    </section>
  );
}
