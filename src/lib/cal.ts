// Integración con Cal.com: la disponibilidad, los SMS, los correos y el .ics los gestiona Cal.com.
// Aquí solo se normaliza el enlace, se traducen los tokens del sitio a variables del embed y se carga embed.js.

export const CAL_ORIGIN = 'https://cal.com';
export const CAL_APP_ORIGIN = 'https://app.cal.com';
export const CAL_EMBED_SRC = `${CAL_APP_ORIGIN}/embed/embed.js`;

const SEGMENT = /^[a-z0-9][a-z0-9._-]*$/i;

/**
 * Acepta `usuario/evento` o la URL pública (`https://cal.com/usuario/evento`) y devuelve `usuario/evento`.
 * Devuelve null si está vacío o no tiene esa forma, para que la página use el formulario de respaldo.
 */
export function parseCalLink(raw: string): string | null {
  let path = raw.trim();
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    let url: URL;
    try {
      url = new URL(path);
    } catch {
      return null;
    }
    if (url.hostname !== 'cal.com' && url.hostname !== 'app.cal.com') return null;
    path = url.pathname;
  }
  const segments = path.replace(/^\/+|\/+$/g, '').split('/');
  if (segments.length !== 2 || !segments.every((s) => SEGMENT.test(s))) return null;
  return segments.join('/');
}

export function calPublicUrl(link: string): string {
  return `${CAL_ORIGIN}/${link}`;
}

/** Token del sitio (sin `--color-`) que alimenta cada variable del embed de Cal.com. */
export const CAL_TOKEN_MAP = {
  'cal-brand': 'wine',
  'cal-brand-emphasis': 'wine-deep',
  'cal-brand-text': 'paper',
  'cal-brand-accent': 'paper',
  'cal-brand-subtle': 'card',
  'cal-text': 'charcoal',
  'cal-text-emphasis': 'charcoal',
  'cal-text-subtle': 'muted',
  'cal-text-muted': 'field',
  'cal-text-error': 'danger',
  'cal-text-success': 'success',
  'cal-bg': 'paper',
  'cal-bg-muted': 'cream',
  'cal-bg-subtle': 'card',
  'cal-bg-emphasis': 'card',
  'cal-border': 'line',
  'cal-border-subtle': 'line',
  'cal-border-muted': 'line',
  'cal-border-emphasis': 'field',
  'cal-border-error': 'danger',
  'cal-border-booker': 'line',
} as const;

/**
 * Variables CSS para `Cal('ui', { cssVarsPerTheme: { light } })`.
 * `readToken` recibe el nombre del token (p. ej. `wine`) y devuelve su valor; los vacíos se omiten
 * para que Cal.com use su valor por defecto en lugar de un color roto.
 */
export function calCssVars(readToken: (token: string) => string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [calVar, token] of Object.entries(CAL_TOKEN_MAP)) {
    const value = readToken(token).trim();
    if (value) vars[calVar] = value;
  }
  vars['cal-border-booker-width'] = '1px';
  vars.radius = '2px';
  return vars;
}

type CalQueue = { q: unknown[] };
type CalApi = ((...args: unknown[]) => void) & CalQueue;
export type CalGlobal = CalApi & { loaded?: boolean; ns: Record<string, CalApi> };

/**
 * Crea la cola `window.Cal` que embed.js procesa al cargar (mismo protocolo que el snippet oficial)
 * e inyecta el script una sola vez. Llamarla de nuevo tras navegar con el ClientRouter es inocuo.
 */
export function ensureCal(win: Window & { Cal?: CalGlobal }, src: string = CAL_EMBED_SRC): CalGlobal {
  if (win.Cal) return win.Cal;
  const push = (api: CalQueue, args: unknown) => api.q.push(args);
  const cal = function (...args: unknown[]) {
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      const script = win.document.createElement('script');
      script.src = src;
      script.async = true;
      win.document.head.appendChild(script);
      cal.loaded = true;
    }
    if (args[0] === 'init') {
      const namespace = args[1];
      if (typeof namespace === 'string') {
        const api = function (...nsArgs: unknown[]) {
          push(api, nsArgs);
        } as CalApi;
        api.q = [];
        cal.ns[namespace] = cal.ns[namespace] || api;
        push(cal.ns[namespace], args);
        push(cal, ['initNamespace', namespace]);
      } else {
        push(cal, args);
      }
      return;
    }
    push(cal, args);
  } as CalGlobal;
  cal.q = [];
  cal.ns = {};
  win.Cal = cal;
  return cal;
}
