# SEO y GEO

Según Google, para sus funciones de IA no hacen falta archivos ni marcado especial: basta estar indexado y
tener contenido útil. Por eso GEO aquí es SEO sólido más datos claros que se puedan citar.

## Qué está hecho

- Título y descripción únicos en cada página (`seoTitle`, `metaDescription`; límites probados en `src/data/seo.test.ts`).
- Datos estructurados enlazados en todas las páginas indexables (`src/lib/schema.ts`): clínica, sitio, página,
  migas, tratamientos y preguntas. Coinciden con el texto visible y no incluyen reseñas propias.
- Dirección, horario y teléfono visibles en todas las páginas (mismos datos en todas partes).
- Sección "Qué es" con fuentes en cada tratamiento y preguntas sobre ubicación y horario.
- `llms.txt` generado desde `content.ts`. Es opcional y no afecta a Google; puede servir a otros asistentes.
- Search Console verificado por etiqueta meta en `BaseLayout.astro`: **no la quites**.
- Sitemap enviado: `sitemap-index.xml`.

## Al cambiar contenido

Actualiza `CONTENT_UPDATED` en `src/lib/schema.ts` y `lastmod` en `astro.config.mjs`.

## Limitaciones de la dirección actual

- `robots.txt` solo funciona en la raíz del dominio. En `github.io/alaria-landing/` no se lee; sin él, todo se
  puede rastrear, incluidos ChatGPT y otros rastreadores. `public/robots.txt` queda listo para una dirección propia.
- Una dirección propia da más confianza y conserva el posicionamiento si luego cambias de hosting. Al mudarla:
  cambia `site` y `base`, redirige lo antiguo y crea una propiedad nueva en Search Console.

## Lo que el código no puede resolver

El posicionamiento local depende sobre todo de:

1. **Perfil de Empresa de Google**: creado el 7 de noviembre de 2026 en la cuenta de la clínica, **sin verificar**
   y por eso aún no es público. Datos: categoría principal "Spa médico" (Google no tiene "medicina estética") y
   secundaria "Clínica del cuidado de la piel"; la misma dirección, horario, teléfono y web del sitio; WhatsApp;
   los cuatro tratamientos como servicios, y la foto del consultorio. Falta:
   - **Verificarlo con un video** grabado en la clínica: la placa o el rótulo, el interior y una prueba de que la
     administran (por ejemplo, la llave o el sistema de citas). Se hace desde business.google.com, en "Verificar".
   - Subir una foto del exterior o de la entrada del edificio, y el logo.
   - Al verificarlo, añadir el enlace del perfil a `sameAs` en `src/lib/schema.ts`.
2. **Reseñas reales en Google**: pídelas a pacientes, sin pagar ni incentivar.
3. **Enlaces y menciones externas**: Instagram, directorios locales, prensa, el edificio Renovati.
4. **Autoría médica visible**: colegiado y credenciales. Google exige más confianza en temas de salud.

Revisa cada mes Search Console: páginas indexadas, consultas y errores.
