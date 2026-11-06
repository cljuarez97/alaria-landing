import { describe, expect, it, vi } from 'vitest';
import { eventForHref, track } from './analytics';

describe('track', () => {
  it('envía el evento si Umami cargó', () => {
    const umami = { track: vi.fn() };
    track('hora-elegida', { umami });
    expect(umami.track).toHaveBeenCalledWith('hora-elegida');
  });
  it('no falla sin Umami', () => {
    expect(() => track('hora-elegida', {})).not.toThrow();
  });
});

describe('eventForHref', () => {
  it('reconoce los caminos hacia una cita', () => {
    expect(eventForHref('https://wa.me/50231045178?text=Hola')).toBe('whatsapp');
    expect(eventForHref('/alaria-landing/agendar/')).toBe('clic-solicitar');
    expect(eventForHref('/alaria-landing/agendar/?tratamiento=x')).toBe('clic-solicitar');
  });
  it('ignora el resto', () => {
    expect(eventForHref('/alaria-landing/tratamientos/')).toBeNull();
  });
});
