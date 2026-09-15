import { analyseSkinReading, type AnalysisResult } from './season';
import { readSkin, sampleDimensions } from './skin';

export type AnalysisFailure = 'decode' | 'canvas' | 'no-face';

export class AnalysisError extends Error {
  constructor(readonly kind: AnalysisFailure) {
    super(kind);
    this.name = 'AnalysisError';
  }
}

export const ANALYSIS_FAILURE_MESSAGE: Record<AnalysisFailure, string> = {
  decode:
    'We could not open that photo. Please try a different JPG or PNG photo. Photos straight from an iPhone are often HEIC, which browsers cannot open.',
  canvas: 'Your browser would not let us read the photo. Please try another browser or use the quiz instead.',
  'no-face':
    'We could not find enough skin in that photo. Try a photo of your face in daylight, filling most of the picture, without sunglasses or a strong filter.',
};

/** Loads an image from a blob URL. Kept separate so it can be swapped in tests. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new AnalysisError('decode'));
    img.src = src;
  });
}

/**
 * Everything happens in the page: the photo is drawn to a small off-screen
 * canvas and only the resulting numbers ever leave this function.
 */
export async function analyzeImageSource(src: string): Promise<AnalysisResult> {
  const img = await loadImage(src);
  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;
  if (!naturalWidth || !naturalHeight) throw new AnalysisError('decode');

  const { width, height } = sampleDimensions(naturalWidth, naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new AnalysisError('canvas');

  ctx.drawImage(img, 0, 0, width, height);

  let frame: ImageData;
  try {
    frame = ctx.getImageData(0, 0, width, height);
  } catch {
    throw new AnalysisError('canvas');
  }

  const result = analyseSkinReading(readSkin(frame.data, width, height));
  if (!result) throw new AnalysisError('no-face');
  return result;
}
