// Analítica opcional (Umami): sin `site.analytics` configurado, `track` no hace nada.
type Umami = { track: (event: string) => void };

export function track(event: string, win: { umami?: Umami } = window as unknown as { umami?: Umami }): void {
  win.umami?.track(event);
}

/** Evento de un enlace: los dos caminos hacia una cita. */
export function eventForHref(href: string): string | null {
  if (href.includes('wa.me/')) return 'whatsapp';
  if (/\/agendar\/(\?|$)/.test(href)) return 'clic-solicitar';
  return null;
}
