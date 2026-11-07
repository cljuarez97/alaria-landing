# Contenido que debe entregar la clínica

El sitio no muestra estos datos mientras falten. Al completarlos en `src/data/content.ts` (quitando los
`[pendiente…]`) aparecen solos. En desarrollo (`pnpm dev`) se ven marcados.

## Antes de promocionar

- [ ] **La doctora debe revisar y aprobar** la sección "Qué es" de cada tratamiento y sus fuentes (`about` en `content.ts`). Es información general; la revisión sobre bioestimuladores declara que sus autoras asesoran a un fabricante, y conviene sumar otra fuente.
- [ ] Colegiado del médico responsable y licencia sanitaria MSPAS (pie de página)
- [ ] Costo de la valoración o si es gratuita (preguntas frecuentes)
- [ ] Tiempo de respuesta que la clínica puede prometer
- [ ] Revisión del aviso de privacidad por un abogado y plazo de conservación de datos
- [ ] Plazos de citas: confirmar 4 h de recordatorio, 48 h de vencimiento y 7 días de control (`CONFIG` en `apps-script/Logic.gs`)
- [ ] Revisar el horario de la cuenta en Google Calendar: los eventos personales bloquean horas

## Para generar confianza

- [ ] Foto real del equipo y trayectoria, títulos y certificaciones
- [ ] Casos de antes y después con consentimiento firmado (al tenerlos, `/resultados/` vuelve al menú)
- [ ] Enlace al perfil de Google Business y testimonios autorizados
- [ ] Parqueo y cómo llegar al edificio (Visítanos)
- [ ] Texto principal: confirmar si se prueba un título orientado a beneficio

## Datos médicos de cada tratamiento

Técnica y productos, duración, sesiones, recuperación y cuidados, tiempo de efecto, manejo de molestias
y fechas de control. Los debe escribir o aprobar la doctora.

- [ ] Armonización facial
- [ ] Toxina botulínica
- [ ] Bioestimuladores de colágeno (confirmar también si la foto representa el tratamiento: parece de hilos)
- [ ] Calidad de piel

## Cuentas

- [ ] Umami: crear la cuenta y pegar `src` y `websiteId` en `site.analytics`
- [ ] Organización gratuita de GitHub para quitar `/alaria-landing` de la dirección
- [ ] Google Business y Search Console
