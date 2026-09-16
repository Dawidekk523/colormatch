/**
 * Anything the browser calls an image is accepted. There is no size limit and
 * no format list: the analysis only ever looks at a 200px copy, so a 60 MP
 * photo straight off a phone costs nothing extra, and a visitor who has to go
 * and convert a file first usually just leaves. A file the browser cannot
 * decode is caught later, where the message can say what to do about it.
 */
export const ACCEPT_ATTRIBUTE = 'image/*';

export type FileProblem = 'empty' | 'type';

export const FILE_PROBLEM_MESSAGE: Record<FileProblem, string> = {
  empty: 'Please choose a photo first.',
  type: 'That file is not an image. Please choose a photo — any format your phone or camera makes is fine.',
};

/** Returns null when the file is usable, otherwise the reason it is not. */
export function checkFile(file: File | null | undefined): FileProblem | null {
  if (!file || file.size === 0) return 'empty';
  // Some phones hand over an empty type for formats the browser has no name
  // for. Those are worth trying rather than refusing on a missing label.
  if (file.type && !file.type.startsWith('image/')) return 'type';
  return null;
}

/** Longest edge of the thumbnail shown next to the result. */
export const PREVIEW_SIZE = 192;
