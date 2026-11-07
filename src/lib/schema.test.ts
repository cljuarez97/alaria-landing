import { describe, expect, it } from 'vitest';
import { treatments, visit } from '../data/content';
import { breadcrumbNode, clinicNode, faqNode, procedureNode, treatmentListNode, webPageNode, websiteNode } from './schema';

const root = 'https://x.test/alaria-landing/';
const image = `${root}og.jpg`;

describe('clinicNode', () => {
  const clinic = clinicNode(root, image) as Record<string, any>;

  it('incluye lo que Google exige y recomienda para un negocio local', () => {
    expect(clinic['@type']).toBe('MedicalClinic');
    expect(clinic.name).toBeTruthy();
    expect(clinic.address.streetAddress).toContain('2a Calle 6-24');
    expect(clinic.address.addressCountry).toBe('GT');
    expect(clinic.telephone).toBe('+50231045178');
    expect(clinic.openingHoursSpecification).toHaveLength(visit.hours.length);
    expect(String(clinic.geo.latitude).split('.')[1]!.length).toBeGreaterThanOrEqual(5);
    expect(String(clinic.geo.longitude).split('.')[1]!.length).toBeGreaterThanOrEqual(5);
  });

  it('no marca reseñas propias ni el nombre de la médica', () => {
    expect(clinic.aggregateRating).toBeUndefined();
    expect(clinic.review).toBeUndefined();
    expect(JSON.stringify(clinic)).not.toMatch(/Katherine|Gonz[aá]lez/i);
  });

  it('enlaza un servicio por tratamiento', () => {
    expect(clinic.availableService).toHaveLength(treatments.length);
  });
});

describe('páginas', () => {
  const url = `${root}tratamientos/toxina-botulinica/`;

  it('relaciona página, sitio y clínica por @id', () => {
    const page = webPageNode(root, url, 'Título', 'Descripción') as Record<string, any>;
    expect(page.isPartOf['@id']).toBe((websiteNode(root) as Record<string, any>)['@id']);
    expect(page.about['@id']).toBe((clinicNode(root, image) as Record<string, any>)['@id']);
    expect(page.inLanguage).toBe('es-GT');
  });

  it('numera las migas con direcciones completas', () => {
    const node = breadcrumbNode(root, url, [
      { name: 'Inicio', path: '/' },
      { name: 'Tratamientos', path: '/tratamientos/' },
    ]) as Record<string, any>;
    expect(node.itemListElement[1].position).toBe(2);
    expect(node.itemListElement[1].item).toBe(`${root}tratamientos/`);
  });

  it('nunca publica datos pendientes en las preguntas', () => {
    const node = faqNode(url, [{ q: '¿Duele?', a: 'Varía. [dato médico pendiente: molestias]' }]) as Record<string, any>;
    expect(node.mainEntity[0].acceptedAnswer.text).toBe('Varía.');
  });

  it('describe el tratamiento y la lista', () => {
    const t = treatments[1]!;
    const node = procedureNode(url, t, image) as Record<string, any>;
    expect(node.name).toBe(t.name);
    expect(node.description).not.toContain('[');
    const list = treatmentListNode(root, `${root}tratamientos/`) as Record<string, any>;
    expect(list.itemListElement).toHaveLength(treatments.length);
  });
});
