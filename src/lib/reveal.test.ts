import { describe, expect, it } from 'vitest';
import { initReveal, REVEAL_SELECTOR } from './reveal';

function fakeEl() {
  const classes = new Set<string>();
  return {
    dataset: {} as Record<string, string>,
    classList: { add: (c: string) => classes.add(c), has: (c: string) => classes.has(c) },
    classes,
  };
}

function fakeRoot(els: ReturnType<typeof fakeEl>[]) {
  return {
    querySelectorAll: (sel: string) => {
      expect(sel).toBe(REVEAL_SELECTOR);
      return els;
    },
  } as unknown as ParentNode;
}

function fakeObserver() {
  const observed: unknown[] = [];
  const unobserved: unknown[] = [];
  let cb: IntersectionObserverCallback = () => {};
  const factory = (callback: IntersectionObserverCallback) => {
    cb = callback;
    return { observe: (el: Element) => observed.push(el), unobserve: (el: Element) => unobserved.push(el) };
  };
  const fire = (target: unknown, isIntersecting: boolean) =>
    cb([{ target, isIntersecting } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
  return { factory, observed, unobserved, fire };
}

describe('initReveal', () => {
  it('observa los elementos y los revela al entrar en vista', () => {
    const a = fakeEl();
    const b = fakeEl();
    const obs = fakeObserver();
    expect(initReveal({ root: fakeRoot([a, b]), createObserver: obs.factory })).toBe(2);
    expect(obs.observed).toEqual([a, b]);

    obs.fire(a, false);
    expect(a.classes.has('is-in')).toBe(false);
    obs.fire(a, true);
    expect(a.classes.has('is-in')).toBe(true);
    expect(obs.unobserved).toEqual([a]);
    expect(b.classes.has('is-in')).toBe(false);
  });

  it('es idempotente: no vuelve a armar elementos ya preparados', () => {
    const a = fakeEl();
    const obs = fakeObserver();
    const root = fakeRoot([a]);
    initReveal({ root, createObserver: obs.factory });
    expect(initReveal({ root, createObserver: obs.factory })).toBe(0);
    expect(obs.observed).toHaveLength(1);
  });

  it('con movimiento reducido revela todo sin observar', () => {
    const a = fakeEl();
    const obs = fakeObserver();
    initReveal({ root: fakeRoot([a]), createObserver: obs.factory, reduceMotion: true });
    expect(a.classes.has('is-in')).toBe(true);
    expect(obs.observed).toHaveLength(0);
  });

  it('sin IntersectionObserver revela todo de inmediato', () => {
    const a = fakeEl();
    initReveal({ root: fakeRoot([a]) });
    expect(a.classes.has('is-in')).toBe(true);
  });
});
