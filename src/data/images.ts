// Imágenes de ambiente. Para reemplazar una, sobrescribe el archivo en `src/assets/ambient/`
// con el mismo nombre (o cambia aquí el import si cambia la extensión). Prompts en docs/nano-banana-prompts.md.
import type { ImageMetadata } from 'astro';
import heroArch from '../assets/ambient/hero-arch.jpg';
import armonizacionFacial from '../assets/ambient/armonizacion-facial.webp';
import toxinaBotulinica from '../assets/ambient/toxina-botulinica.jpg';
import bioestimuladores from '../assets/ambient/bioestimuladores.jpg';
import calidadDePiel from '../assets/ambient/calidad-de-piel.jpg';
import contornoCorporal from '../assets/ambient/contorno-corporal.jpg';
import visitanosEntrada from '../assets/ambient/visitanos-entrada.jpg';
import agendarEscritorio from '../assets/ambient/agendar-escritorio.jpg';
import resultadosCortina from '../assets/ambient/resultados-cortina.jpg';
import splashVentana from '../assets/ambient/splash-ventana.jpg';

export const images = {
  'hero-arch': heroArch,
  'armonizacion-facial': armonizacionFacial,
  'toxina-botulinica': toxinaBotulinica,
  bioestimuladores,
  'calidad-de-piel': calidadDePiel,
  'contorno-corporal': contornoCorporal,
  'visitanos-entrada': visitanosEntrada,
  'agendar-escritorio': agendarEscritorio,
  'resultados-cortina': resultadosCortina,
  'splash-ventana': splashVentana,
} satisfies Record<string, ImageMetadata>;

export type ImageSlug = keyof typeof images;

/** Imagen de un tratamiento por su `slug` (coincide con el nombre del archivo). */
export function treatmentImage(slug: string): ImageMetadata {
  const img = (images as Record<string, ImageMetadata>)[slug];
  if (!img) throw new Error(`Falta la imagen del tratamiento "${slug}" en src/data/images.ts`);
  return img;
}
