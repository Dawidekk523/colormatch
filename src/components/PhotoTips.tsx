import { useCallback, useEffect, useRef, useState } from 'react';

interface Tip {
  title: string;
  detail: string;
  /** A crop of one of the sample photographs, showing the detail in question. */
  photo: string;
  position: string;
  /** Used only for the one tip that is easier to show by counter-example. */
  filter?: string;
  caption?: string;
}

const TIPS: Tip[] = [
  {
    title: 'Daylight, not a lamp',
    detail:
      'Stand near a window in the middle of the day. A bulb adds its own colour to your skin, and that is exactly what the reading measures.',
    photo: '/samples/light-warm.jpg',
    position: '50% 30%',
  },
  {
    title: 'What a warm bulb does',
    detail:
      'The same face under an indoor bulb. Everything shifts golden, so a cool colouring reads as warm. If the photo looks like this, take another by a window.',
    photo: '/samples/light-warm.jpg',
    position: '50% 30%',
    filter: 'sepia(0.5) saturate(1.35) brightness(0.94)',
    caption: 'Not this',
  },
  {
    title: 'A plain wall behind you',
    detail: 'A bare wall in white, grey or any single colour. A busy room bounces colour back onto your skin.',
    photo: '/samples/light-cool.jpg',
    position: '50% 40%',
  },
  {
    title: 'Face filling the frame',
    detail: 'Head and shoulders, close enough that your face takes up most of the picture. A full-length shot gives too few pixels of skin.',
    photo: '/samples/golden-warm.jpg',
    position: '50% 35%',
  },
  {
    title: 'Eyes and hairline visible',
    detail: 'No sunglasses, no hat, hair off your face. Your eyes and hair carry the contrast half of the reading.',
    photo: '/samples/deep-cool.jpg',
    position: '50% 28%',
  },
  {
    title: 'No filters, light make-up',
    detail: 'Beauty filters and heavy foundation replace the very thing being measured. A plain camera photo, bare face if you can.',
    photo: '/samples/light-cool.jpg',
    position: '50% 30%',
  },
];

/**
 * The rules that actually change the answer, shown rather than listed: every
 * tip carries a crop of a real photograph so the detail can be recognised at a
 * glance. It opens in a dialog because it is reference, not a step — the upload
 * button stays the one thing to do on the page.
 */
export function PhotoTips() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button type="button" className="btn btn--quiet btn--small" onClick={() => setOpen(true)}>
        What makes a good photo?
      </button>

      <dialog ref={ref} className="sheet" onClose={close} aria-labelledby="photo-tips-heading">
        <div className="sheet__body stack">
          <h2 id="photo-tips-heading">What makes a good photo</h2>
          <p className="note">
            Any file works — the reading is what changes. These six things move the result more than anything
            else you can do.
          </p>

          <ul className="tip-list">
            {TIPS.map((tip) => (
              <li key={tip.title}>
                <span className="tip-list__shot">
                  <img
                    src={tip.photo}
                    alt=""
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: tip.position, filter: tip.filter }}
                  />
                  {tip.caption ? <span className="tip-list__flag">{tip.caption}</span> : null}
                </span>
                <span className="tip-list__words">
                  <strong>{tip.title}</strong>
                  <span>{tip.detail}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="cluster">
            <button type="button" className="btn btn--primary" onClick={close}>
              Got it
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
