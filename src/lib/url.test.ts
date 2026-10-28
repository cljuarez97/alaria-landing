import { describe, expect, it } from 'vitest';
import { isActive, routeOf, whatsappUrl } from './url';

describe('routeOf', () => {
  it('quita la base y normaliza la barra final', () => {
    expect(routeOf('/alaria-landing/tratamientos/x', '/alaria-landing')).toBe('/tratamientos/x/');
    expect(routeOf('/alaria-landing/', '/alaria-landing')).toBe('/');
    expect(routeOf('/alaria-landing', '/alaria-landing')).toBe('/');
  });
});

describe('isActive', () => {
  it('inicio solo coincide exacto', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/', '/tratamientos/')).toBe(false);
  });
  it('las secciones coinciden con sus subrutas', () => {
    expect(isActive('/tratamientos/', '/tratamientos/bioestimuladores/')).toBe(true);
    expect(isActive('/agendar/', '/resultados/')).toBe(false);
  });
});

describe('whatsappUrl', () => {
  it('codifica el mensaje', () => {
    expect(whatsappUrl('50236038581', 'Hola, ¿qué tal?')).toBe(
      'https://wa.me/50236038581?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F',
    );
  });
});
