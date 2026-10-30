// Recorte de imágenes enmarcadas. Las fotos verticales (p. ej. 2:3) a su proporción natural
// ocuparían más de una pantalla en el destacado y en la cabecera del tratamiento: se recortan
// a 4:5 en móvil y 1:1 desde 1024px (clase .frame-tall), con un punto focal para no cortar el rostro.

export interface Size {
  width: number;
  height: number;
}

/** Clase de recorte del marco: `frame-tall` si la imagen es claramente vertical. */
export function frameCropClass({ width, height }: Size): 'frame-tall' | undefined {
  return height / width > 1.3 ? 'frame-tall' : undefined;
}

/**
 * Punto focal en `object-position`. Con 1:1, una imagen 2:3 muestra 2/3 de su alto: para que una
 * franja [top, bottom] (fracciones del alto) quepa entera, la posición vertical debe estar entre
 * los límites que devuelve esta función. Sirve para elegir y comprobar el valor de `imageFocus`.
 */
export function verticalFocusRange({ width, height }: Size, visibleRatio: number, top: number, bottom: number) {
  const visible = Math.min(1, width / visibleRatio / height); // fracción del alto que se ve
  const hidden = 1 - visible;
  if (hidden <= 0) return { min: 0, max: 1 };
  if (bottom - top > visible) return null; // la franja no cabe con ese recorte
  // desplazamiento = p · hidden; se necesita desplazamiento ≤ top y desplazamiento + visible ≥ bottom
  return { min: Math.max(0, (bottom - visible) / hidden), max: Math.min(1, top / hidden) };
}
