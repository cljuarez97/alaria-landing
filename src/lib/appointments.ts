// Cliente del backend de citas. Hay dos: Bichitech (la plataforma de gestión de la clínica) y el
// Apps Script anterior (apps-script/), que sigue activo mientras dura la migración. Todas las fechas y
// horas son las de la clínica: se muestran tal cual llegan, sin convertirlas a la zona del navegador.

export type Backend =
  | { kind: 'apps-script'; endpoint: string }
  | { kind: 'bichitech'; api: string; serviceId: number };

export type AvailableDay = { date: string; slots: string[] };
/** `starts`: instante exacto de cada hora, con clave `fecha hora` (`2026-11-09 09:00`). */
export type Availability = { days: AvailableDay[]; starts: Record<string, string> };
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
const KNOWN_ERRORS: RequestError[] = ['invalid', 'slot_taken', 'rate_limited', 'busy'];

/**
 * Backend según el entorno del build: con `PUBLIC_BOOKING_API` y `PUBLIC_BOOKING_SERVICE` se usa
 * Bichitech; sin ellas, el Apps Script de siempre.
 */
export function bookingBackend(env: { api?: string; serviceId?: string }, appsScriptEndpoint: string): Backend {
  const serviceId = Number(env.serviceId);
  return env.api && Number.isInteger(serviceId) && serviceId > 0
    ? { kind: 'bichitech', api: env.api.replace(/\/+$/, ''), serviceId }
    : { kind: 'apps-script', endpoint: appsScriptEndpoint };
}

/** Horas libres. Lanza un error si el servicio no responde, para que la página ofrezca reintentar. */
export async function fetchAvailability(backend: Backend, fetchImpl: typeof fetch = fetch): Promise<Availability> {
  if (backend.kind === 'bichitech') {
    const res = await fetchImpl(`${backend.api}/availability?service=${backend.serviceId}`, { headers: { Accept: 'application/json' } });
    const data = (await res.json()) as { ok?: boolean; days?: { date: string; slots: { time: string; start: string }[] }[] };
    if (!res.ok || !data.ok || !Array.isArray(data.days)) throw new Error('availability');
    const starts: Record<string, string> = {};
    const days = data.days.map((day) => ({
      date: day.date,
      slots: day.slots.map((slot) => {
        starts[`${day.date} ${slot.time}`] = slot.start;
        return slot.time;
      }),
    }));
    return { days, starts };
  }

  const res = await fetchImpl(`${backend.endpoint}?action=slots`);
  const data = (await res.json()) as { ok?: boolean; utcOffset?: string; days?: AvailableDay[] };
  if (!res.ok || !data.ok || !data.utcOffset || !Array.isArray(data.days)) throw new Error('availability');
  const offset = data.utcOffset;
  const starts = Object.fromEntries(
    data.days.flatMap((day) => day.slots.map((time) => [`${day.date} ${time}`, `${day.date}T${time}:00${offset}`])),
  );
  return { days: data.days, starts };
}

/** Envía la solicitud y traduce la respuesta de cualquiera de los dos backends al mismo resultado. */
export async function requestAppointment(
  backend: Backend,
  payload: AppointmentRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<RequestResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { ok: false, error: 'offline' };
  try {
    const res =
      backend.kind === 'bichitech'
        ? await fetchImpl(`${backend.api}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              service_id: backend.serviceId,
              start: payload.slotStart,
              name: payload.name,
              phone: payload.phone,
              email: payload.email || null,
              treatment: payload.treatment || null,
              message: payload.message || null,
              followup: payload.followup,
            }),
          })
        : // `text/plain` evita la petición previa de CORS, que Apps Script no responde; el cuerpo sigue siendo JSON.
          await fetchImpl(backend.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
          });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && data.ok) return { ok: true };
    const error = KNOWN_ERRORS.find((code) => code === data.error) ?? 'server';
    return { ok: false, error };
  } catch {
    return { ok: false, error: 'offline' };
  }
}

/** Instante exacto de la hora elegida, tal como lo dio el backend. */
export function slotStart(availability: Availability, date: string, time: string): string {
  return availability.starts[`${date} ${time}`] ?? '';
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
