import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Analyzer } from '../src/components/Analyzer';
import { Quiz } from '../src/components/Quiz';
import { ResultView } from '../src/components/ResultView';
import { SeasonExplorer } from '../src/components/SeasonExplorer';
import { ColourCompare } from '../src/components/ColourCompare';
import { UpgradeButton } from '../src/components/UpgradeButton';
import { QUIZ_QUESTIONS } from '../src/lib/quiz';
import { SEASONS } from '../src/lib/seasons-data';

describe('ResultView', () => {
  it('names the season, the undertone and every colour in words', () => {
    render(<ResultView season="autumn" undertone="warm" source="quiz" confidence={0.8} />);
    expect(screen.getByRole('heading', { name: 'Autumn' })).toBeTruthy();
    expect(screen.getByText(/Warm \(golden\)/)).toBeTruthy();
    for (const swatch of SEASONS.autumn.wear) {
      expect(screen.getByText(swatch.name)).toBeTruthy();
      expect(screen.getByText(swatch.hex.toUpperCase())).toBeTruthy();
    }
    for (const swatch of SEASONS.autumn.avoid) {
      expect(screen.getByText(swatch.name)).toBeTruthy();
    }
  });

  it('says the result is a guide, not a diagnosis', () => {
    render(<ResultView season="winter" undertone="cool" source="photo" confidence={0.2} />);
    expect(screen.getByText(/not a measurement/i)).toBeTruthy();
    expect(screen.getByText(/close call/i)).toBeTruthy();
  });
});

describe('Quiz', () => {
  const answerCurrent = () => {
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]!);
  };

  it('asks for an answer before moving on', () => {
    render(<Quiz />);
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
    expect(screen.getByRole('alert').textContent).toMatch(/choose one answer/i);
    expect(screen.getByText(`Question 1 of ${QUIZ_QUESTIONS.length}`)).toBeTruthy();
  });

  it('clears the warning once an answer is chosen', () => {
    render(<Quiz />);
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
    expect(screen.queryByRole('alert')).toBeTruthy();
    answerCurrent();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('walks through every question and shows a season at the end', () => {
    render(<Quiz />);
    for (let i = 0; i < QUIZ_QUESTIONS.length - 1; i += 1) {
      answerCurrent();
      fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
    }
    answerCurrent();
    fireEvent.click(screen.getByRole('button', { name: 'Show my colours' }));
    expect(screen.getByText('Your result')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Take the quiz again' })).toBeTruthy();
  });

  it('can go back to a previous question and keeps the answer', () => {
    render(<Quiz />);
    answerCurrent();
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
    expect(screen.getByText(`Question 2 of ${QUIZ_QUESTIONS.length}`)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(screen.getByText(`Question 1 of ${QUIZ_QUESTIONS.length}`)).toBeTruthy();
    expect((screen.getAllByRole('radio')[0] as HTMLInputElement).checked).toBe(true);
  });

  it('starts over from the first question with nothing selected', () => {
    render(<Quiz />);
    answerCurrent();
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.getByText(`Question 1 of ${QUIZ_QUESTIONS.length}`)).toBeTruthy();
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });

  it('shows the stored result again after a refresh', () => {
    sessionStorage.setItem(
      'colormatch.result.v1',
      JSON.stringify({ season: 'spring', undertone: 'warm', source: 'quiz', confidence: 0.5 }),
    );
    render(<Quiz />);
    expect(screen.getByRole('heading', { name: 'Spring' })).toBeTruthy();
  });
});

describe('Analyzer', () => {
  it('offers a keyboard-reachable file input and sample drawings', () => {
    render(<Analyzer />);
    const input = document.getElementById('photo-input') as HTMLInputElement;
    expect(input.type).toBe('file');
    expect(input.accept).toContain('image/jpeg');
    expect(screen.getAllByRole('button', { name: /skin/i }).length).toBe(4);
  });

  it('explains what to do when the file is the wrong type', () => {
    render(<Analyzer />);
    const input = document.getElementById('photo-input') as HTMLInputElement;
    const file = new File(['x'], 'photo.heic', { type: 'image/heic' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('alert').textContent).toMatch(/JPG, PNG or WEBP/);
  });

  it('explains what to do when the file is too large', () => {
    render(<Analyzer />);
    const input = document.getElementById('photo-input') as HTMLInputElement;
    const file = new File([new Uint8Array(1)], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('alert').textContent).toMatch(/larger than 10 MB/);
  });

  it('asks for a photo when the picker was dismissed with nothing selected', () => {
    render(<Analyzer />);
    const input = document.getElementById('photo-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByRole('alert').textContent).toMatch(/choose a photo first/i);
  });

  it('says plainly when a photo cannot be opened, and stays usable', async () => {
    const createObjectURL = vi.fn(() => 'blob:fake');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    // jsdom has no image decoder, so stand in for the browser refusing a file
    // it cannot read — an HEIC from an iPhone behaves exactly like this.
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        decoding = 'async';
        set src(_value: string) {
          queueMicrotask(() => this.onerror?.());
        }
      },
    );

    render(<Analyzer />);
    const input = document.getElementById('photo-input') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(['x'], 'photo.jpg', { type: 'image/jpeg' })] },
    });

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toMatch(/could not open that photo/i);
    expect(document.getElementById('photo-input')).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it('shows a stored photo result again after a refresh and can be reset', () => {
    sessionStorage.setItem(
      'colormatch.result.v1',
      JSON.stringify({ season: 'winter', undertone: 'cool', source: 'photo', confidence: 0.7 }),
    );
    render(<Analyzer />);
    expect(screen.getByRole('heading', { name: 'Winter' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try another photo' }));
    expect(screen.queryByRole('heading', { name: 'Winter' })).toBeNull();
    expect(sessionStorage.getItem('colormatch.result.v1')).toBeNull();
  });

  it('ignores a quiz result stored by the other tool', () => {
    sessionStorage.setItem(
      'colormatch.result.v1',
      JSON.stringify({ season: 'winter', undertone: 'cool', source: 'quiz', confidence: 0.7 }),
    );
    render(<Analyzer />);
    expect(screen.queryByRole('heading', { name: 'Winter' })).toBeNull();
  });
});

describe('SeasonExplorer', () => {
  it('exposes the four seasons as tabs with one selected', () => {
    render(<SeasonExplorer />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['Spring', 'Summer', 'Autumn', 'Winter']);
    expect(tabs.filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);
  });

  it('switches the panel when another season is chosen', () => {
    render(<SeasonExplorer />);
    fireEvent.click(screen.getByRole('tab', { name: 'Winter' }));
    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText(/Winter: cool and clear/i)).toBeTruthy();
  });

  it('moves between tabs with the arrow keys', () => {
    render(<SeasonExplorer />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Summer' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Spring' }).getAttribute('aria-selected')).toBe('true');
  });

  it('wraps around at the ends', () => {
    render(<SeasonExplorer />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Winter' }).getAttribute('aria-selected')).toBe('true');
  });

  it('puts a chosen colour on the drawing and names it', () => {
    render(<SeasonExplorer />);
    const panel = screen.getByRole('tabpanel');
    const pick = within(panel).getByRole('button', { name: /Apple Green/ });
    fireEvent.click(pick);
    expect(pick.getAttribute('aria-pressed')).toBe('true');
    expect(panel.textContent).toContain('#84B23C');
  });
});

describe('ColourCompare', () => {
  it('is a labelled slider that names both colours in text', () => {
    render(<ColourCompare season="summer" />);
    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-label')).toMatch(/Slide to compare/);
    expect(screen.getByText(/Left: Orange/)).toBeTruthy();
    expect(screen.getByText(/Right: Powder Blue/)).toBeTruthy();
  });

  it('moves when the slider value changes', () => {
    render(<ColourCompare season="summer" />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '80' } });
    expect(slider.value).toBe('80');
  });
});

describe('UpgradeButton', () => {
  it('says the plan is not open when no checkout link is configured', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ available: false, reason: 'checkout-not-configured' }), { status: 200 }),
    );
    render(<UpgradeButton />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Not open yet' })).toBeTruthy());
    expect(screen.getByText(/paid plan is not open yet/i)).toBeTruthy();
    vi.restoreAllMocks();
  });

  it('turns into a real checkout link once one is configured', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ available: true, url: 'https://polar.sh/checkout/abc' }), { status: 200 }),
    );
    render(<UpgradeButton />);
    const link = await screen.findByRole('link', { name: 'Continue to checkout' });
    expect(link.getAttribute('href')).toBe('https://polar.sh/checkout/abc');
    vi.restoreAllMocks();
  });

  it('offers a retry and keeps the free report usable when the check fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    render(<UpgradeButton />);
    await waitFor(() => expect(screen.getByText(/could not check the plan/i)).toBeTruthy());

    // Retrying actually re-checks, and succeeds once the link is configured.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ available: true, url: 'https://polar.sh/checkout/abc' }), { status: 200 }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('link', { name: 'Continue to checkout' })).toBeTruthy();
    vi.restoreAllMocks();
  });
});
