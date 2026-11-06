import { describe, expect, it } from 'vitest';
import { hasPending, isPending, isPublishable, splitPending, stripPending } from './pending';

describe('splitPending', () => {
  it('separa texto normal y tramos pendientes', () => {
    expect(splitPending('Hola. [pendiente: horario]')).toEqual([
      { text: 'Hola. ', pending: false },
      { text: 'pendiente: horario', pending: true },
    ]);
  });
  it('devuelve el texto tal cual si no hay pendientes', () => {
    expect(splitPending('Sin datos pendientes')).toEqual([{ text: 'Sin datos pendientes', pending: false }]);
  });
  it('maneja varios pendientes', () => {
    expect(splitPending('[a] y [b]').filter((s) => s.pending).map((s) => s.text)).toEqual(['a', 'b']);
  });
});

describe('isPending', () => {
  it('detecta valores que son solo un marcador', () => {
    expect(isPending('[pendiente: dirección]')).toBe(true);
    expect(isPending('Zona 10 [pendiente: número]')).toBe(false);
  });
});

describe('stripPending', () => {
  it('quita los marcadores y espacios sobrantes', () => {
    expect(stripPending('Ver reseñas en Google [pendiente: enlace]')).toBe('Ver reseñas en Google');
  });
});

describe('isPublishable', () => {
  const partial = 'Te llamamos. [pendiente: horario]';
  const pending = '[dato médico pendiente: duración]';

  it('en desarrollo muestra todo', () => {
    expect(isPublishable(pending, false)).toBe(true);
    expect(isPublishable(pending, false, true)).toBe(true);
  });

  it('en producción descarta lo que queda vacío y conserva el resto', () => {
    expect(isPublishable(pending, true)).toBe(false);
    expect(isPublishable(partial, true)).toBe(true);
    expect(isPublishable('Sin datos faltantes', true)).toBe(true);
  });

  it('con `whole` exige la frase completa', () => {
    expect(isPublishable(partial, true, true)).toBe(false);
    expect(isPublishable('Licencia 123', true, true)).toBe(true);
  });

  it('detecta datos pendientes', () => {
    expect(hasPending(partial)).toBe(true);
    expect(hasPending('Sin datos faltantes')).toBe(false);
  });
});
