import { useEffect, useRef, useState } from 'react';
import type { FullReportData } from '../lib/report';
import { Icon } from './Icon';
import {
  downloadShareImage,
  drawShareImage,
  SHARE_SIZE,
  type ShareData,
  type ShareOrientation,
} from '../lib/share-image';

interface Props {
  report: FullReportData;
}

function shareData(report: FullReportData): ShareData {
  return {
    seasonName: report.seasonName,
    subtypeName: report.subtype.name,
    undertoneLabel: report.undertoneLabel,
    tagline: report.tagline,
    confidencePct: report.confidencePct,
    axes: report.axes.map((axis) => ({
      label: axis.label,
      leftLabel: axis.leftLabel,
      rightLabel: axis.rightLabel,
      value: axis.value,
    })),
    wear: report.wear.map(({ name, hex }) => ({ name, hex })),
    neutrals: report.neutrals.map(({ name, hex }) => ({ name, hex })),
    avoid: report.avoid.map(({ name, hex }) => ({ name, hex })),
    site: 'getcolormatch.com',
  };
}

/**
 * The palette is most useful when it leaves this page: sent to a friend, kept
 * in a camera roll, or held up in a changing room. Both shapes are drawn from
 * the same data — tall for a phone, wide for a screen — and the preview is the
 * real thing at a smaller size, so nobody downloads a surprise.
 */
export function ShareExport({ report }: Props) {
  const [orientation, setOrientation] = useState<ShareOrientation>('portrait');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // A browser without a 2D context leaves the canvas blank rather than
    // breaking the page; the download button is checked separately.
    drawShareImage(canvas, shareData(report), orientation);
  }, [report, orientation]);

  const download = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await downloadShareImage(shareData(report), orientation);
    } catch {
      setProblem('The image could not be saved just now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const size = SHARE_SIZE[orientation];

  return (
    <section className="stack share">
      <h3>Save your palette as a picture</h3>
      <p>
        A single image with your season, your three measurements and every colour in the palette. Tall for a
        phone, wide for a screen.
      </p>

      <div className="tabs" role="group" aria-label="Picture shape">
        {(['portrait', 'landscape'] as const).map((option) => (
          <button
            key={option}
            type="button"
            className="tab"
            aria-pressed={orientation === option}
            aria-selected={orientation === option}
            onClick={() => setOrientation(option)}
          >
            {option === 'portrait' ? 'Tall' : 'Wide'}
          </button>
        ))}
      </div>

      <div className={`share__preview share__preview--${orientation}`}>
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          aria-label={`Preview of your ${report.seasonName} palette picture`}
          role="img"
        />
      </div>

      <div className="cluster">
        <button type="button" className="btn btn--primary" onClick={() => void download()} disabled={busy}>
          <Icon name="download" size={20} />
          {busy ? 'Making the picture…' : 'Download PNG'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => window.print()}>
          <Icon name="print" size={20} />
          Print the report
        </button>
      </div>

      <p className="note" aria-live="polite">
        {problem ?? `${size.width} × ${size.height} pixels — large enough to post or to print small.`}
      </p>
    </section>
  );
}
