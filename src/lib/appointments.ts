// Cliente del backend de citas (apps-script/). Todas las fechas y horas son las de la clínica:
// se muestran tal cual llegan, sin convertirlas a la zona horaria del navegador.

export type AvailableDay = { date: string; slots: string[] };
export type Availability = { utcOffset: string; days: AvailableDay[] };
export type RequestError = 'invalid' | 'slot_taken' | 'rate_limited' | 'busy' | 'server' | 'offline';
export type RequestResult = { ok: true } | { ok: false; error: RequestError };

export type AppointmentRequest = {
  name: string;
  phone: string;
  email: string;
  treatment: string;
  message: string;
  followup: boolean;
  slotStart: string;
  origin: string;
};

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Horas libres. Lanza un error si el servicio no responde, para que la página ofrezca reintentar. */
export async function fetchAvailability(endpoint: string, fetchImpl: typeof fetch = fetch): Promise<Availability> {
  const res = await fetchImpl(`${endpoint}?action=slots`);
  const data = (await res.json()) as { ok?: boolean; utcOffset?: string; days?: AvailableDay[] };
  if (!res.ok || !data.ok || !data.utcOffset || !Array.isArray(data.days)) throw new Error('availability');
  return { utcOffset: data.utcOffset, days: data.days };
}

/**
 * Envía la solicitud. `text/plain` evita la petición previa de CORS, que Apps Script no responde;
 * el cuerpo sigue siendo JSON.
 */
export async function requestAppointment(
  endpoint: string,
  payload: AppointmentRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<RequestResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { ok: false, error: 'offline' };
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: RequestError };
    if (res.ok && data.ok) return { ok: true };
    return { ok: false, error: data.error ?? 'server' };
  } catch {
    return { ok: false, error: 'offline' };
  }
}

export function slotStart(date: string, time: string, utcOffset: string): string {
  return `${date}T${time}:00${utcOffset}`;
}

/** Celdas de un mes con la semana empezando en domingo. `null` = hueco antes del día 1. */
export function monthCells(year: number, month: number): (string | null)[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  const lead = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= total; day++) cells.push(`${year}-${pad(month + 1)}-${pad(day)}`);
  return cells;
}

/** Rellena hasta `min` celdas: los meses cortos miden lo mismo que el calendario de carga y la página no salta. */
export function padCells(cells: (string | null)[], min = 35): (string | null)[] {
  return cells.length >= min ? cells : [...cells, ...Array.from({ length: min - cells.length }, () => null)];
}

/** Meses con horas libres, en orden: `[{ year, month }]` (mes desde 0). */
export function monthsWithSlots(days: AvailableDay[]): { year: number; month: number }[] {
  const keys = [...new Set(days.map((d) => d.date.slice(0, 7)))].sort();
  return keys.map((key) => ({ year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1 }));
}

export function formatMonth(year: number, month: number): string {
  return `${MONTHS[month]} de ${year}`;
}

/** `2026-11-09` → `lunes 9 de noviembre`. */
export function formatDate(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

/** `13:30` → `1:30 p. m.` */
export function formatTime(time: string): string {
  const [hour = 0, minutes = 0] = time.split(':').map(Number);
  // Espacios duros: "a. m." nunca queda partido en dos líneas.
  return `${hour % 12 || 12}:${String(minutes).padStart(2, '0')}\u00a0${hour < 12 ? 'a.\u00a0m.' : 'p.\u00a0m.'}`;
}
