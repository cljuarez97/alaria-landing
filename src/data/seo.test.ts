import { describe, expect, it } from 'vitest';
import { booking, home, site, treatments, visit } from './content';

const pages = [
  { title: site.seoTitle, description: site.description },
  { title: home.treatmentsTeaser.seoTitle, description: home.treatmentsTeaser.metaDescription },
  { title: visit.seoTitle, description: visit.metaDescription },
  { title: booking.seoTitle, description: booking.metaDescription },
  ...treatments.map((t) => ({ title: t.seoTitle, description: t.metaDescription })),
];

describe('metadatos de búsqueda', () => {
  it('caben en el resultado de Google', () => {
    for (const { title, description } of pages) {
      expect(`${title} · ${site.shortName}`.length, title).toBeLessThanOrEqual(60);
      expect(description.length, description).toBeGreaterThanOrEqual(70);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
  });

  it('no se repiten entre páginas', () => {
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
  });

  it('cada tratamiento describe su imagen', () => {
    for (const t of treatments) expect(t.imageAlt.length, t.slug).toBeGreaterThan(20);
  });
});
