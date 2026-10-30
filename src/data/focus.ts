// Punto focal (`object-position`) de las imágenes que se recortan. Sin entrada: centrado.
// Separado de images.ts para poder probarlo sin importar los archivos de imagen.
export const imageFocus: Partial<Record<string, string>> = {
  // Foto vertical 1023×1537: el rostro va del ~12 % al ~64 % del alto. 30 % lo deja entero en 4:5 y 1:1
  // (rango válido calculado en src/lib/crop.test.ts).
  'armonizacion-facial': '55% 30%',
  // 1024×1365: rostro del ~17 % al ~62 % del alto.
  'toxina-botulinica': '55% 30%',
  // 1023×1537: del pelo a las manos bajo el mentón, ~9 % a ~70 % del alto.
  'calidad-de-piel': '50% 18%',
};

export function focusOf(slug: string): string | undefined {
  return imageFocus[slug];
}
