import type { TransitionDirectionalAnimations } from 'astro';

// Página nueva: sube 12px y aparece en 280ms. Página vieja: se desvanece en 180ms.
// Al volver atrás, la nueva entra desde arriba (dirección inversa).
const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';
const out = { name: 'alaria-page-out', duration: '180ms', easing: 'ease-in', fillMode: 'both' };

export const pageTransition: TransitionDirectionalAnimations = {
  forwards: {
    old: out,
    new: { name: 'alaria-page-in', duration: '280ms', delay: '60ms', easing: ease, fillMode: 'both' },
  },
  backwards: {
    old: out,
    new: { name: 'alaria-page-in-back', duration: '280ms', delay: '60ms', easing: ease, fillMode: 'both' },
  },
};
