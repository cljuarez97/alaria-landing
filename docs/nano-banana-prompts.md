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
| 1 | `hero-arch` | Portada de inicio | 4:5 | **Excepción a la regla de sin personas** (decisión de la clínica, como las fotos de tratamientos). Usa el prompt de la sección «Portada con procedimiento» en lugar del estilo común. |
| 2 | `armonizacion-facial` | Armonización facial | 2:3 (vertical) | **Ya hay foto** (`armonizacion-facial.webp`, 1023×1537): no generar. Se recorta a 4:5 en móvil y 1:1 desde 1024px con foco `55% 30%` (`src/data/focus.ts`); si la reemplazas, mantén el rostro entre el 12 % y el 64 % del alto o ajusta el foco. |
| 3 | `toxina-botulinica` | Toxina botulínica | 3:4 (vertical) | **Ya hay foto** (`toxina-botulinica.webp`, 1024×1365): no generar. Foco `55% 30%`; rostro entre el 17 % y el 62 % del alto. |
| 4 | `bioestimuladores` | Bioestimuladores | 4:5 (vertical) | **Ya hay foto** (`bioestimuladores.webp`, 1031×1280): no generar. Foco `50% 35%`; rostro entre el 15 % y el 75 % del alto. |
| 5 | `calidad-de-piel` | Calidad de piel | 2:3 (vertical) | **Ya hay foto** (`calidad-de-piel.webp`, 1023×1537): no generar. Foco `50% 18%`; rostro y manos entre el 9 % y el 70 % del alto. |
| 7 | `visitanos-entrada` | Visítanos | 16:9 | burgundy entrance door with brass handle, potted olive tree, leaf shadows on cream wall |
| 8 | `agendar-escritorio` | Reservar | 4:5 | writing desk with blank cream appointment card, gold fountain pen, dried roses |
| 9 | `resultados-cortina` | Cabecera de Resultados | 21:9 | burgundy velvet curtain slightly parted, warm light spilling across cream floor |
| 10 | `splash-ventana` | Imagen para compartir (OG) y estados vacíos | 1:1 | arched window shadow cast on cream plaster wall, a few flecks of gold leaf |

## Portada con procedimiento (`hero-arch`)

Sin el estilo común (ese prohíbe personas). Sin agujas ni resultados visibles.

```
Realistic editorial photograph, vertical 4:5. Close-up of the gloved hands of a female aesthetic doctor, white nitrile gloves, gently assessing the cheekbone and jawline of a relaxed Latina woman in her early thirties lying on a white treatment chair, eyes closed, calm expression, natural skin with visible pores and fine texture, minimal makeup, dark hair pulled back with a white headband. The doctor is out of frame except for her hands and a hint of a white coat sleeve. Soft diffused window light from the left, warm cream background with a blurred burgundy wine (#7A3B4C) accent and a touch of antique gold, shallow depth of field, 85mm lens, subtle film grain, low contrast, matte. Face and hands centered in the upper half of the frame. No needles, no syringes, no marker lines, no text, no logos, not airbrushed, no plastic skin.
```

## Material real (no usar IA)

Estas imágenes deben ser fotos reales; mientras tanto el sitio muestra un placeholder marcado:
- Foto del equipo médico (sin nombres)
- Fotos de la clínica (recepción, consultorio).
- Antes y después: solo con consentimiento escrito de cada paciente.
- Testimonios: solo reseñas reales y autorizadas.
