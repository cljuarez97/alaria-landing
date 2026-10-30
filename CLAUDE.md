# alaria-landing

Sitio de Alaria Clínica Estética. El nombre de la médica no debe aparecer en el sitio (decisión de la clínica). Astro estático multipágina con experiencia tipo app (ClientRouter + barra inferior en móvil) y PWA.

## Stack

- Astro 7 (`output` estático), `base: '/alaria-landing'`, `trailingSlash: 'always'`, `@astrojs/sitemap` (excluye `offline` y `404`).
- Tailwind CSS 4 vía `@tailwindcss/vite`. Tokens en `src/styles/global.css` (`@theme`): `wine`, `wine-deep`, `gold` (solo líneas/numerales grandes), `gold-ink` (texto dorado pequeño), `cream`, `card`, `paper`, `charcoal`, `muted`, `field`, `mist`, `line`, `danger`, `success`. Los colores por defecto de Tailwind están desactivados: usa solo tokens. Los contrastes calculados están documentados en la cabecera del CSS.
- Tipografía self-hosted (fontsource, subset latin, `@font-face` generado en `BaseLayout`): Playfair Display (solo ≥24px, itálica como acento; precargada) + Plus Jakarta Sans. Clases: `.t-display`, `.t-h2`, `.t-h3`, `.t-lead`, `.t-body`, `.t-eyebrow` (máx. 1 por sección), `.numeral`.
- Iconos: `lucide-static` importados con `?raw` en `src/components/icons/icons.ts` y pintados por `Icon.astro` (trazo 1.5, 20px). Para añadir uno, impórtalo en ese mapa. Sin JS de iconos.
- Imágenes: `<Picture>` de `astro:assets` (AVIF/WebP). Todas salen de `src/data/images.ts`.
- Tests: Vitest (`src/**/*.test.ts`). Type-check: `@astrojs/check` + TypeScript 6 (astro check no soporta TS 7).

## Estructura

- `src/data/content.ts`: TODO el texto del sitio. Los `[pendiente…]` se muestran como `<mark class="pending">` vía `Rich.astro`.
- `src/data/ui.ts`: microcopy de interfaz (aria-labels, 404, offline, etiquetas de secciones).
- `src/data/images.ts`: mapa de imágenes de ambiente (`src/assets/ambient/`). Para reemplazar una, sobrescribe el archivo con el mismo nombre. Prompts en `docs/nano-banana-prompts.md`.
- `src/layouts/BaseLayout.astro`: head (SEO, canonical, OG, PWA, fuentes), skip link, `ClientRouter`, header, footer, barra inferior, botón de WhatsApp, foco al h1 tras navegar.
- `src/components/`: `SiteHeader` (nav ≥1024px), `BottomNav` (<1024px, `transition:persist`), `WhatsAppFab` (solo ≥1024px), `SiteFooter`, `TreatmentShowcase` (destacado + lista numerada con `transition:name`), `FramedPicture` (marco firma), `PhotoPending` (fotos reales pendientes), `FaqList` (`<details>` animado), `BeforeAfter` (comparador con `input range`), `CtaBand`, `Rich`, `Icon`, `PwaHead`.
- `src/pages/`: `/`, `/tratamientos/`, `/tratamientos/[slug]/`, `/resultados/`, `/visitanos/`, `/agendar/` (formulario Web3Forms con `src/scripts/booking.ts`), `/offline/` (lo precachea `public/sw.js`), `404`.
- `src/lib/`: `url.ts` (`href()` respeta `BASE_URL`; úsalo en todo enlace interno), `pending.ts`, `transitions.ts` (animación de página).
- `public/`: favicons, manifest, `sw.js` (sube `VERSION` si cambias el precache), `bichitech-logo.webp`.

## Reglas

- Enlaces internos siempre con `href('/ruta/')`.
- Scripts de cliente se inicializan en `astro:page-load` (el ClientRouter no recarga la página) y deben ser idempotentes (`dataset.ready`).
- Animaciones solo con transform/opacity (excepción: `grid-template-rows` del FAQ y `clip-path` del comparador). Todo queda sin animación con `prefers-reduced-motion: reduce`.
- Sin doble borde, sin glassmorphism, sin franjas laterales `border-l`, sin emojis.

## Comandos

- `pnpm dev` — servidor de desarrollo (http://localhost:4321/alaria-landing/).
- `pnpm build` — build a `dist/`.
- `pnpm preview` — sirve `dist/` (Astro 7 lo deja en segundo plano; detenlo con `pnpm astro preview stop`).
- `pnpm test` — Vitest.
- `pnpm check` — `astro check` (debe quedar en 0 errores/warnings).

## Despliegue

GitHub Actions (`.github/workflows/deploy.yml`, `withastro/action`) publica en GitHub Pages en cada push a `main`: https://cljuarez97.github.io/alaria-landing/
Revisa `pnpm build`, `pnpm check` y `pnpm test` antes de hacer push.

## Pendientes conocidos

- Imágenes de ambiente son placeholders; faltan fotos reales del equipo y del consultorio (`PhotoPending`).
- Datos `[pendiente…]` en `content.ts` (dirección, horario, datos médicos, enlace a Google, aviso legal).
- El comparador de `/resultados/` usa dos imágenes de ejemplo hasta tener casos con consentimiento.
