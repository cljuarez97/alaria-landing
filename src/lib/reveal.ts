// Revelado al hacer scroll: añade `.is-in` a cada [data-reveal] cuando entra en vista.
// Idempotente: cada elemento se arma una sola vez (dataset.revealReady), aunque el ClientRouter
// dispare `astro:page-load` en cada navegación.

type Observer = Pick<IntersectionObserver, 'observe' | 'unobserve'>;
type ObserverFactory = (cb: IntersectionObserverCallback, opts: IntersectionObserverInit) => Observer;

export const REVEAL_SELECTOR = '[data-reveal]';
export const REVEAL_OPTIONS: IntersectionObserverInit = { rootMargin: '0px 0px -8% 0px', threshold: 0.12 };

export interface RevealEnv {
  root: ParentNode;
  createObserver?: ObserverFactory;
  reduceMotion?: boolean;
}

/** Devuelve cuántos elementos nuevos se armaron. */
export function initReveal({ root, createObserver, reduceMotion = false }: RevealEnv): number {
  const fresh = [...root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)].filter((el) => !el.dataset.revealReady);
  fresh.forEach((el) => {
    el.dataset.revealReady = 'true';
  });
  if (!fresh.length) return 0;

  // Sin IntersectionObserver o con movimiento reducido: visible de inmediato.
  if (reduceMotion || !createObserver) {
    fresh.forEach((el) => el.classList.add('is-in'));
    return fresh.length;
  }

  const io = createObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, REVEAL_OPTIONS);
  fresh.forEach((el) => io.observe(el));
  return fresh.length;
}
