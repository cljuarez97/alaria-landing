import { describe, expect, it } from 'vitest';
import { frameCropClass, verticalFocusRange } from './crop';
import { imageFocus } from '../data/focus';

describe('frameCropClass', () => {
  it('recorta solo las imágenes claramente verticales', () => {
    expect(frameCropClass({ width: 1023, height: 1537 })).toBe('frame-tall');
    expect(frameCropClass({ width: 1600, height: 1067 })).toBeUndefined();
    expect(frameCropClass({ width: 1000, height: 1250 })).toBeUndefined(); // 4:5 se deja natural
  });
});

describe('verticalFocusRange', () => {
  const photo = { width: 1023, height: 1537 };
  it('calcula el rango de object-position que deja ver una franja completa', () => {
    const r = verticalFocusRange(photo, 1, 0.12, 0.64);
    expect(r).not.toBeNull();
    expect(r!.min).toBeLessThanOrEqual(r!.max);
  });
  it('devuelve null si la franja no cabe', () => {
    expect(verticalFocusRange(photo, 16 / 9, 0.1, 0.9)).toBeNull();
  });
  it('sin recorte vertical cualquier posición vale', () => {
    expect(verticalFocusRange({ width: 1600, height: 900 }, 1, 0.1, 0.9)).toEqual({ min: 0, max: 1 });
  });
  // El rostro de armonizacion-facial ocupa aprox. del 12 % al 64 % del alto.
  it('el foco de armonización facial no corta el rostro en 4:5 ni en 1:1', () => {
    const y = Number(imageFocus['armonizacion-facial']!.split(' ')[1]!.replace('%', '')) / 100;
    for (const ratio of [4 / 5, 1]) {
      const r = verticalFocusRange(photo, ratio, 0.12, 0.64)!;
      expect(y).toBeGreaterThanOrEqual(r.min);
      expect(y).toBeLessThanOrEqual(r.max);
    }
  });
});
