import { resetResultCache } from '../src/lib/result-storage';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  resetResultCache();
});
