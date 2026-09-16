import { PREVIEW_SIZE } from './image-input';
import { analyseSkinReading, type AnalysisResult } from './season';
import { readSkin, SAMPLE_SIZE, sampleDimensions } from './skin';

export type AnalysisFailure = 'decode' | 'canvas' | 'no-face';

export class AnalysisError extends Error {
  constructor(readonly kind: AnalysisFailure) {
    super(kind);
    this.name = 'AnalysisError';
  }
}

export const ANALYSIS_FAILURE_MESSAGE: Record<AnalysisFailure, string> = {
  decode:
    'This browser could not open that photo. Most files work; the usual exception is an iPhone HEIC opened on a browser that cannot read it. Sending the photo to yourself, or taking a screenshot of it, converts it.',
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

/**
 * Draws any source into a canvas of the given size. Kept apart from the
 * analysis because the same shrinking serves the thumbnail on screen: a photo
 * is never held at full size anywhere, which is what keeps a 60 MP file from
 * costing anything.
 */
function drawScaled(
  source: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  cap: number,
): HTMLCanvasElement {
  const { width, height } = sampleDimensions(naturalWidth, naturalHeight, cap);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new AnalysisError('canvas');
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

interface Decoded {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

/**
 * `createImageBitmap` can decode a file straight to the size we need, so a huge
 * photo never has to exist at full resolution in memory. Browsers without it,
 * or without the resize options, fall back to an object URL and an `<img>`.
 */
async function decodeFile(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      /* fall through to the <img> path, which reports its own failure */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return {
      source: img,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

export interface FileAnalysis {
  result: AnalysisResult;
  /** A small JPEG of the photo, safe to keep on screen and to hold in memory. */
  preview: string;
}

/**
 * The path a chosen file takes: decoded once, read for the analysis, and shrunk
 * to a thumbnail — all in the page. The photo itself is released immediately
 * afterwards and never leaves the device.
 */
export async function analyzeImageFile(file: File): Promise<FileAnalysis> {
  const decoded = await decodeFile(file);
  try {
    if (!decoded.width || !decoded.height) throw new AnalysisError('decode');

    const canvas = drawScaled(decoded.source, decoded.width, decoded.height, SAMPLE_SIZE);
    let frame: ImageData;
    try {
      frame = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    } catch {
      throw new AnalysisError('canvas');
    }

    const result = analyseSkinReading(readSkin(frame.data, canvas.width, canvas.height));
    if (!result) throw new AnalysisError('no-face');

    const thumb = drawScaled(decoded.source, decoded.width, decoded.height, PREVIEW_SIZE);
    return { result, preview: thumb.toDataURL('image/jpeg', 0.82) };
  } finally {
    decoded.release();
  }
}
