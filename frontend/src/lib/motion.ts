import type { Transition } from 'motion/react';

// Shared soft spring: calm, slightly bouncy. Used by the header nav pill and switches.
export const SOFT_SPRING: Transition = { type: 'spring', bounce: 0.3, duration: 0.8 };
