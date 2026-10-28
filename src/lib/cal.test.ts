import { describe, expect, it } from 'vitest';
import { CAL_EMBED_SRC, CAL_TOKEN_MAP, calCssVars, calPublicUrl, ensureCal, parseCalLink, type CalGlobal } from './cal';

describe('parseCalLink', () => {
  it('acepta usuario/evento', () => {
    expect(parseCalLink('alaria/valoracion')).toBe('alaria/valoracion');
    expect(parseCalLink('  /alaria/valoracion/ ')).toBe('alaria/valoracion');
  });

  it('acepta la URL pública de cal.com y app.cal.com', () => {
    expect(parseCalLink('https://cal.com/alaria/valoracion')).toBe('alaria/valoracion');
    expect(parseCalLink('https://app.cal.com/alaria/valoracion-30')).toBe('alaria/valoracion-30');
  });

  it('rechaza vacíos, otros dominios y formas inválidas', () => {
    expect(parseCalLink('')).toBeNull();
    expect(parseCalLink('alaria')).toBeNull();
    expect(parseCalLink('alaria/valoracion/extra')).toBeNull();
    expect(parseCalLink('https://evil.com/alaria/valoracion')).toBeNull();
    expect(parseCalLink('alaria/<script>')).toBeNull();
    expect(parseCalLink('https://')).toBeNull();
  });
});

describe('calPublicUrl', () => {
  it('construye la URL pública con el teléfono en Guatemala', () => {
    expect(calPublicUrl('alaria/valoracion')).toBe('https://cal.com/alaria/valoracion?attendeePhoneNumber=%2B502');
  });
});

describe('calCssVars', () => {
  it('traduce cada token del sitio a su variable del embed', () => {
    const vars = calCssVars((token) => `#${token}`);
    expect(vars['cal-brand']).toBe('#wine');
    expect(vars['cal-brand-text']).toBe('#paper');
    expect(vars['cal-bg']).toBe('#paper');
    expect(vars['cal-text-error']).toBe('#danger');
    expect(Object.keys(vars)).toHaveLength(Object.keys(CAL_TOKEN_MAP).length + 2);
  });

  it('omite tokens vacíos para no romper el color por defecto', () => {
    const vars = calCssVars((token) => (token === 'wine' ? '  ' : ' #fff '));
    expect(vars).not.toHaveProperty('cal-brand');
    expect(vars['cal-bg']).toBe('#fff');
  });
});

describe('ensureCal', () => {
  // Ventana mínima: el proyecto no usa entorno DOM en Vitest.
  const freshWindow = () => {
    const head: { src: string }[] = [];
    const win = {
      document: {
        createElement: () => ({ src: '', async: false }),
        head: { appendChild: (el: { src: string }) => head.push(el) },
      },
    } as unknown as Window & { Cal?: CalGlobal };
    return { win, head };
  };

  it('inyecta embed.js una sola vez y encola las llamadas', () => {
    const { win, head } = freshWindow();
    const cal = ensureCal(win);
    cal('init', 'alaria', { origin: 'https://app.cal.com' });
    cal.ns.alaria('inline', { calLink: 'alaria/valoracion' });
    ensureCal(win)('ui', {});

    expect(head).toHaveLength(1);
    expect(head[0].src).toBe(CAL_EMBED_SRC);
    expect(cal.q).toEqual([['initNamespace', 'alaria'], ['ui', {}]]);
    expect(cal.ns.alaria.q).toEqual([
      ['init', 'alaria', { origin: 'https://app.cal.com' }],
      ['inline', { calLink: 'alaria/valoracion' }],
    ]);
  });

  it('reutiliza window.Cal si ya existe', () => {
    const { win } = freshWindow();
    const first = ensureCal(win);
    expect(ensureCal(win)).toBe(first);
  });
});
