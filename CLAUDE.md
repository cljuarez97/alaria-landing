# alaria-landing

Landing page de Alaria Medicina Estética (Dra. Katherine González V.). Sitio estático de una sola página.

## Estructura

- `index.html`: todo el sitio. Secciones: `#inicio`, `#doctora`, `#tratamientos`, `#faq`, `#agendar`.
- `bichitech-logo.webp`: logo del desarrollador en el footer (blanco con transparencia, 76×80 = 2x de 40 px).
- Sin build, sin `package.json`, sin tests.

## Stack

- Tailwind CSS por Play CDN (`cdn.tailwindcss.com`) con config inline. Paleta en `tailwind.config.theme.extend.colors.alaria` (`bg`, `card`, `accent`, `goldDark`, `dark`, `wine`, `muted`). Usa siempre esos tokens, no colores sueltos.
- Tipografías: Playfair Display (`font-serif`) y Plus Jakarta Sans (`font-sans`) desde Google Fonts.
- Iconos: Lucide `1.62.0` desde unpkg, con SRI. Para actualizar, cambia la versión y recalcula el hash `integrity`.
- Formulario de citas: Web3Forms (`#appointment-form`).
- CTA y botón flotante a WhatsApp: `wa.me/50236038581` (dos enlaces en `index.html`).
- Estilo visual: "vintage" — doble borde dorado (`.border-vintage-double`), sombras vino (`.vintage-shadow`).

## Desarrollo local

`python3 -m http.server 8765` y abre http://localhost:8765 (config en `.claude/launch.json`, no versionada). También sirve abrir `index.html` directo.

## Despliegue

GitHub Pages desde `main` (raíz): https://cljuarez97.github.io/alaria-landing/
Cada push a `main` publica en producción. Revisa en local antes de hacer push.

## Pendientes conocidos

- Las imágenes de hero y doctora son de Unsplash; reemplazar por fotos reales de la clínica.
- Tailwind Play CDN no está pensado para producción (más peso y parpadeo de estilos); migrar a Tailwind compilado si el sitio crece.
