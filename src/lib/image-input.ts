export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(',');
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export type FileProblem = 'empty' | 'type' | 'size';

export const FILE_PROBLEM_MESSAGE: Record<FileProblem, string> = {
  empty: 'Please choose a photo first.',
  type: 'That file type does not work here. Please use a JPG, PNG or WEBP photo. Photos from an iPhone are often HEIC — in Settings, Camera, Formats, choose “Most Compatible”, or send the photo to yourself first.',
  size: 'That photo is larger than 10 MB. Please use a smaller photo.',
};

/** Returns null when the file is usable, otherwise the reason it is not. */
export function checkFile(file: File | null | undefined): FileProblem | null {
  if (!file || file.size === 0) return 'empty';
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return 'type';
  if (file.size > MAX_FILE_BYTES) return 'size';
  return null;
}
