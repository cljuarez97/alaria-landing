// Datos estructurados (schema.org). Solo datos que también se ven en la página: es lo que Google pide
// y lo que usan los buscadores con IA para citar a la clínica.
import { faq, site, treatments, visit, type Treatment } from '../data/content';
import { stripPending } from './pending';

type Node = Record<string, unknown>;
export type Crumb = { name: string; path: string };

/** Fecha de la última revisión del contenido. Actualízala al cambiar textos. */
export const CONTENT_UPDATED = '2026-11-06';

const LANGUAGE = 'es-GT';
const id = (root: string, name: string) => `${root}#${name}`;
const absolute = (root: string, path: string) => new URL(path.replace(/^\//, ''), root).href;

export function clinicNode(root: string, image: string): Node {
  return {
    '@type': 'MedicalClinic',
    '@id': id(root, 'clinica'),
    name: site.name,
    alternateName: site.shortName,
    description: site.description,
    url: root,
    logo: absolute(root, 'icon-512.png'),
    image,
    telephone: visit.phone.replace(/\s/g, ''),
    email: visit.email,
    sameAs: [site.instagram],
    address: {
      '@type': 'PostalAddress',
      streetAddress: visit.address.slice(0, 3).join(', '),
      addressLocality: 'Ciudad de Guatemala',
      addressRegion: 'Guatemala',
      postalCode: visit.postalCode,
      addressCountry: 'GT',
    },
    geo: { '@type': 'GeoCoordinates', latitude: visit.geo.latitude, longitude: visit.geo.longitude },
    openingHoursSpecification: visit.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: { '@type': 'City', name: 'Ciudad de Guatemala' },
    availableService: treatments.map((t) => ({ '@id': id(absolute(root, `tratamientos/${t.slug}/`), 'tratamiento') })),
  };
}

export function websiteNode(root: string): Node {
  return {
    '@type': 'WebSite',
    '@id': id(root, 'sitio'),
    url: root,
    name: site.name,
    inLanguage: LANGUAGE,
    publisher: { '@id': id(root, 'clinica') },
  };
}

export function webPageNode(root: string, url: string, name: string, description: string, type = 'WebPage'): Node {
  return {
    '@type': type,
    '@id': id(url, 'pagina'),
    url,
    name,
    description,
    inLanguage: LANGUAGE,
    dateModified: CONTENT_UPDATED,
    isPartOf: { '@id': id(root, 'sitio') },
    about: { '@id': id(root, 'clinica') },
  };
}

export function breadcrumbNode(root: string, url: string, crumbs: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': id(url, 'migas'),
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absolute(root, crumb.path),
    })),
  };
}

export function faqNode(url: string, items: { q: string; a: string }[] = faq): Node {
  return {
    '@type': 'FAQPage',
    '@id': id(url, 'preguntas'),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: stripPending(item.a) },
    })),
  };
}

export function procedureNode(url: string, t: Treatment, image: string): Node {
  return {
    '@type': 'MedicalProcedure',
    '@id': id(url, 'tratamiento'),
    name: t.name,
    description: stripPending(t.intro),
    url,
    image,
    mainEntityOfPage: { '@id': id(url, 'pagina') },
  };
}

export function treatmentListNode(root: string, url: string): Node {
  return {
    '@type': 'ItemList',
    '@id': id(url, 'lista'),
    itemListElement: treatments.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: absolute(root, `tratamientos/${t.slug}/`),
    })),
  };
}
