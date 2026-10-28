# alaria-landing

Landing page de Alaria Medicina Estética (Dra. Katherine González V.). Sitio estático de una sola página.

## Estructura

- `index.html`: todo el sitio. Secciones: `#inicio`, `#doctora`, `#tratamientos`, `#faq`, `#agendar`.
- `bichitech-logo.jpeg`: logo del desarrollador en el footer.
- Sin build, sin `package.json`, sin tests.

## Stack

- Tailwind CSS por Play CDN (`cdn.tailwindcss.com`) con config inline. Paleta en `tailwind.config.theme.extend.colors.alaria` (`bg`, `card`, `accent`, `goldDark`, `dark`, `wine`, `muted`). Usa siempre esos tokens, no colores sueltos.
- Tipografías: Playfair Display (`font-serif`) y Plus Jakarta Sans (`font-sans`) desde Google Fonts.
- Iconos: Lucide desde unpkg.
- Formulario de citas: Web3Forms (`#appointment-form`).
- CTA y botón flotante a WhatsApp (`wa.me`).
- Estilo visual: "vintage" — doble borde dorado (`.border-vintage-double`), sombras vino (`.vintage-shadow`).

## Desarrollo local

Herd sirve la carpeta en http://alaria-landing.test. También sirve abrir `index.html` directo.

## Despliegue

GitHub Pages desde `main` (raíz): https://cljuarez97.github.io/alaria-landing/
Cada push a `main` publica en producción. Revisa en local antes de hacer push.

## Pendientes conocidos

- El número de WhatsApp `50212345678` parece de prueba; confirmar el real antes de lanzar.
- Las imágenes de hero y doctora son de Unsplash; reemplazar por fotos reales de la clínica.
- Tailwind Play CDN no está pensado para producción (más peso y parpadeo de estilos); migrar a Tailwind compilado si el sitio crece.
- Lucide se carga como `@latest`; fijar una versión para evitar cambios inesperados.
- `bichitech-logo.jpeg` pesa ~240 KB para mostrarse a 40 px de alto; convertir a WebP/SVG optimizado.
