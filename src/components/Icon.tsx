import { createElement } from 'react';
import { ICONS, type IconName } from '../lib/icons';

interface Props {
  name: IconName;
  /** Icons sit next to text, so they are sized in the text's own units. */
  size?: number;
  className?: string;
}

/** Decorative by default: the label beside an icon is always the real label. */
export function Icon({ name, size = 22, className }: Props) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name].map(([tag, attrs], index) => createElement(tag, { ...attrs, key: index }))}
    </svg>
  );
}
