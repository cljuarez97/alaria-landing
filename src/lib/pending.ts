// Los datos pendientes van entre [corchetes] en content.ts.
export type Segment = { text: string; pending: boolean };

const PENDING_RE = /\[([^\]]+)\]/g;

/** Divide un texto en tramos normales y tramos `[pendientes]`. Quita espacios sobrantes en los bordes. */
export function splitPending(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(PENDING_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ text: text.slice(last, idx), pending: false });
    out.push({ text: m[1] ?? '', pending: true });
    last = idx + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), pending: false });
  return out.filter((s) => s.text.length > 0);
}

/** ¿El valor completo es un marcador pendiente (no hay dato real)? */
export function isPending(text: string): boolean {
  return /^\s*\[[^\]]+\]\s*$/.test(text);
}

/** Texto sin los tramos pendientes (para atributos, meta y JSON-LD). */
export function stripPending(text: string): string {
  return text.replace(PENDING_RE, '').replace(/\s{2,}/g, ' ').trim();
}

/** ¿Contiene algún dato sin confirmar? Sirve para frases que no se sostienen sin ese dato. */
export function hasPending(text: string): boolean {
  return splitPending(text).some((segment) => segment.pending);
}

/**
 * ¿Se muestra este texto? En desarrollo sí, para ver lo que falta. En producción, solo si queda algo
 * que leer sin los tramos pendientes o, con `whole`, si no le falta ningún dato.
 */
export function isPublishable(text: string, isProd: boolean, whole = false): boolean {
  if (!isProd) return true;
  return whole ? !hasPending(text) : stripPending(text).length > 0;
}
