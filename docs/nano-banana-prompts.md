# Imágenes de ambiente con Nano Banana (Gemini)

Genera cada imagen en la app de Gemini y guárdala en `src/assets/ambient/` con **el mismo nombre de archivo** del placeholder (`.jpg`, `.png` o `.webp`; si cambias la extensión, actualiza el `import` en `src/data/images.ts`). Astro la optimiza al compilar (AVIF/WebP en varios tamaños), así que puedes subirla en alta calidad: idealmente 1600 px en el lado largo.

Reglas para todo el set:
- Sin personas, manos, rostros, texto, logos, agujas ni resultados médicos.
- Misma luz y paleta en todas para que el sitio se vea coherente.
- Si Gemini no acepta una proporción, genera la más cercana y recórtala.

## Estilo común (pégalo al inicio de cada prompt)

```
Editorial still-life photograph, soft diffused late-afternoon window light from the left, warm cream plaster (#FAF4F0), deep burgundy wine (#7A3B4C) and muted antique gold (#D4AF37) accents, shallow depth of field, subtle 35mm film grain, low contrast, matte, no people, no hands, no faces, no text, no logos, no needles, no medical results.
```

## Imágenes

| # | Archivo | Dónde se usa | Proporción | Prompt (estilo común + …) |
|---|---|---|---|---|
| 1 | `hero-arch` | Portada de inicio | 4:5 | arched plaster doorway opening onto a calm treatment room, burgundy velvet armchair, brass floor lamp, linen curtain glowing |
| 2 | `armonizacion-facial` | Armonización facial | 2:3 (vertical) | **Ya hay foto** (`armonizacion-facial.webp`, 1023×1537): no generar. Se recorta a 4:5 en móvil y 1:1 desde 1024px con foco `55% 30%` (`src/data/focus.ts`); si la reemplazas, mantén el rostro entre el 12 % y el 64 % del alto o ajusta el foco. |
| 3 | `toxina-botulinica` | Toxina botulínica | 3:2 | unlabelled frosted glass vials on a brushed brass tray, crisp shadows, calm symmetry |
| 4 | `bioestimuladores` | Bioestimuladores | 3:2 | macro of burgundy silk folds under tension, light catching the ridges, abstract |
| 5 | `calidad-de-piel` | Calidad de piel | 3:2 | clear serum droplets on cream glass, golden backlight, dewy highlights |
| 6 | `contorno-corporal` | Contorno corporal | 3:2 | ivory linen draped over a smooth abstract plaster curve, soft sculptural shadows |
| 7 | `visitanos-entrada` | Visítanos | 16:9 | burgundy entrance door with brass handle, potted olive tree, leaf shadows on cream wall |
| 8 | `agendar-escritorio` | Reservar | 4:5 | writing desk with blank cream appointment card, gold fountain pen, dried roses |
| 9 | `resultados-cortina` | Cabecera de Resultados | 21:9 | burgundy velvet curtain slightly parted, warm light spilling across cream floor |
| 10 | `splash-ventana` | Imagen para compartir (OG) y estados vacíos | 1:1 | arched window shadow cast on cream plaster wall, a few flecks of gold leaf |

## Material real (no usar IA)

Estas imágenes deben ser fotos reales; mientras tanto el sitio muestra un placeholder marcado:
- Foto del equipo médico (sin nombres)
- Fotos de la clínica (recepción, consultorio).
- Antes y después: solo con consentimiento escrito de cada paciente.
- Testimonios: solo reseñas reales y autorizadas.
