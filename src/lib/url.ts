// Enlaces internos que respetan `base` (GitHub Pages sirve el sitio en /alaria-landing/).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** `href('/tratamientos/')` → `/alaria-landing/tratamientos/`. */
export function href(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Ruta sin `base`, con barra final: `/alaria-landing/tratamientos/x/` → `/tratamientos/x/`. */
export function routeOf(pathname: string, base: string = BASE): string {
  let p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  if (!p.startsWith('/')) p = `/${p}`;
  return p.endsWith('/') ? p : `${p}/`;
}

/** ¿El destino de navegación `navHref` corresponde a la ruta actual? Inicio solo coincide exacto. */
export function isActive(navHref: string, route: string): boolean {
  if (navHref === '/') return route === '/';
  return route === navHref || route.startsWith(navHref);
}

export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
