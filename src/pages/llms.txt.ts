// Resumen del sitio para asistentes de IA (propuesta llmstxt.org). Google no lo necesita; otros lo pueden leer.
import type { APIRoute } from 'astro';
import { faq, site, treatments, visit } from '../data/content';
import { stripPending } from '../lib/pending';

export const GET: APIRoute = ({ site: origin }) => {
  const root = new URL(import.meta.env.BASE_URL, origin).href;
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `Dirección: ${visit.address.join(', ')}.`,
    `Horario: ${visit.hours.map((h) => `${h.day}, ${h.time}`).join('; ')}. Atención con cita previa.`,
    `Teléfono y WhatsApp: ${visit.phone}. Correo: ${visit.email}. Instagram: ${site.instagram}`,
    '',
    '## Tratamientos',
    '',
    ...treatments.map((t) => `- [${t.name}](${root}tratamientos/${t.slug}/): ${t.about.paragraphs[0]}`),
    '',
    '## Citas y contacto',
    '',
    `- [Solicitar cita](${root}agendar/): elige día y hora; la clínica revisa la solicitud y la confirma.`,
    `- [Dirección y horario](${root}visitanos/)`,
    '',
    '## Preguntas frecuentes',
    '',
    ...faq.flatMap((item) => [`### ${item.q}`, '', stripPending(item.a), '']),
    '## Optional',
    '',
    `- [Aviso de privacidad](${root}privacidad/)`,
  ];
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
