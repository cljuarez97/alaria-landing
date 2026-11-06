// Prueba la lógica pura del backend (apps-script/Logic.gs). No es un módulo: Apps Script comparte un
// ámbito global, así que se evalúa en un contexto aislado y se leen sus funciones de ahí.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

type Busy = { start: number; end: number };
type Backend = {
  CONFIG: { HORIZON_DAYS: number; [key: string]: unknown };
  slotsForDate(date: string, busy: Busy[], now: number, cfg: unknown): number[];
  availableDays(busy: Busy[], now: number, cfg: unknown): { date: string; slots: string[] }[];
  isSlotAvailable(start: number, busy: Busy[], now: number, cfg: unknown): boolean;
  slotIso(ms: number, cfg: unknown): string;
  validateRequest(body: Record<string, unknown>, cfg: unknown): { errors: string[]; data: Record<string, unknown> };
  isLocalOrigin(origin: string): boolean;
  escapeHtml(value: string): string;
  oneLine(value: string): string;
  constantTimeEquals(a: string, b: string): boolean;
  formatSlot(ms: number, cfg: unknown): string;
  buildIcs(uid: string, start: number, end: number, now: number, cfg: unknown): string;
  whatsappNotice(phone: string, text: string): string;
};

const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('../../apps-script/Logic.gs', import.meta.url), 'utf8'), context);
const gs = context as unknown as Backend;
const cfg = gs.CONFIG;

const at = (iso: string) => Date.parse(iso);
const NOW = at('2026-11-06T12:00:00-06:00'); // viernes
const MONDAY = '2026-11-09';
const valid = {
  name: 'Ana López',
  phone: '+502 5555-1234',
  email: 'ana@correo.com',
  treatment: 'Armonización facial',
  message: 'Hola',
  slotStart: `${MONDAY}T10:00:00-06:00`,
  origin: 'https://cljuarez97.github.io',
};

describe('slotsForDate', () => {
  it('cubre el horario de lunes a viernes cada 30 minutos', () => {
    const slots = gs.slotsForDate(MONDAY, [], NOW, cfg);
    expect(slots).toHaveLength(16);
    expect(gs.slotIso(slots[0]!, cfg)).toBe(`${MONDAY}T09:00:00-06:00`);
    expect(gs.slotIso(slots.at(-1)!, cfg)).toBe(`${MONDAY}T16:30:00-06:00`);
  });

  it('cierra el sábado a la 1:00 p. m. y no atiende el domingo', () => {
    const saturday = gs.slotsForDate('2026-11-14', [], NOW, cfg);
    expect(saturday).toHaveLength(8);
    expect(gs.slotIso(saturday.at(-1)!, cfg)).toBe('2026-11-14T12:30:00-06:00');
    expect(gs.slotsForDate('2026-11-15', [], NOW, cfg)).toEqual([]);
  });

  it('respeta las 24 horas de anticipación', () => {
    const slots = gs.slotsForDate('2026-11-07', [], NOW, cfg);
    expect(gs.slotIso(slots[0]!, cfg)).toBe('2026-11-07T12:00:00-06:00');
    expect(gs.slotsForDate('2026-11-06', [], NOW, cfg)).toEqual([]);
  });

  it('descarta las horas que se cruzan con un evento, aunque sea en parte', () => {
    const busy = [{ start: at(`${MONDAY}T09:15:00-06:00`), end: at(`${MONDAY}T10:00:00-06:00`) }];
    const hours = gs.slotsForDate(MONDAY, busy, NOW, cfg).map((ms) => gs.slotIso(ms, cfg).slice(11, 16));
    expect(hours).not.toContain('09:00');
    expect(hours).not.toContain('09:30');
    expect(hours[0]).toBe('10:00');
  });
});

describe('availableDays', () => {
  it('omite los días sin horas y no pasa del horizonte', () => {
    const days = gs.availableDays([], NOW, cfg);
    expect(days[0]!.date).toBe('2026-11-07');
    expect(days.some((d) => d.date === '2026-11-08')).toBe(false);
    const last = Date.parse(`${days.at(-1)!.date}T12:00:00Z`);
    expect(last - NOW).toBeLessThanOrEqual((cfg.HORIZON_DAYS + 1) * 86_400_000);
  });
});

describe('isSlotAvailable', () => {
  const start = at(`${MONDAY}T10:00:00-06:00`);
  it('acepta una hora libre del horario', () => {
    expect(gs.isSlotAvailable(start, [], NOW, cfg)).toBe(true);
  });
  it('rechaza horas ocupadas, desalineadas, fuera de horario o inválidas', () => {
    expect(gs.isSlotAvailable(start, [{ start, end: start + 1_800_000 }], NOW, cfg)).toBe(false);
    expect(gs.isSlotAvailable(at(`${MONDAY}T10:10:00-06:00`), [], NOW, cfg)).toBe(false);
    expect(gs.isSlotAvailable(at(`${MONDAY}T20:00:00-06:00`), [], NOW, cfg)).toBe(false);
    expect(gs.isSlotAvailable(Number.NaN, [], NOW, cfg)).toBe(false);
  });
});

describe('validateRequest', () => {
  it('limpia una solicitud válida', () => {
    const { errors, data } = gs.validateRequest(valid, cfg);
    expect(errors).toEqual([]);
    expect(data.phone).toBe('55551234');
    expect(data.startMs).toBe(at(valid.slotStart));
  });

  it('permite omitir correo y tratamiento', () => {
    expect(gs.validateRequest({ ...valid, email: '', treatment: '' }, cfg).errors).toEqual([]);
  });

  it.each([
    ['name', { name: 'A' }],
    ['phone', { phone: '1234' }],
    ['email', { email: 'ana@' }],
    ['slotStart', { slotStart: 'mañana' }],
    ['origin', { origin: 'https://otro-sitio.com' }],
  ])('rechaza %s inválido', (field, change) => {
    expect(gs.validateRequest({ ...valid, ...change }, cfg).errors).toEqual([field]);
  });

  it('acepta los dos dominios y distingue el local', () => {
    expect(gs.validateRequest({ ...valid, origin: 'http://localhost:4321' }, cfg).errors).toEqual([]);
    expect(gs.isLocalOrigin('http://localhost:4321')).toBe(true);
    expect(gs.isLocalOrigin('https://cljuarez97.github.io')).toBe(false);
  });

  it('recorta los textos largos y quita saltos de línea del nombre', () => {
    const { data } = gs.validateRequest({ ...valid, name: 'Ana\r\nBcc: x@y.com', message: 'a'.repeat(2000) }, cfg);
    expect(data.name).toBe('Ana Bcc: x@y.com');
    expect(data.message).toHaveLength(1000);
  });
});

describe('utilidades', () => {
  it('escapa HTML', () => {
    expect(gs.escapeHtml(`<a href="x">'&`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
  });

  it('compara firmas', () => {
    expect(gs.constantTimeEquals('abc', 'abc')).toBe(true);
    expect(gs.constantTimeEquals('abc', 'abd')).toBe(false);
    expect(gs.constantTimeEquals('abc', 'abcd')).toBe(false);
  });

  it('formatea la fecha en hora de Guatemala', () => {
    expect(gs.formatSlot(at(`${MONDAY}T09:30:00-06:00`), cfg)).toBe('lunes 9 de noviembre a las 9:30 a. m.');
    expect(gs.formatSlot(at(`${MONDAY}T13:00:00-06:00`), cfg)).toBe('lunes 9 de noviembre a las 1:00 p. m.');
    expect(gs.formatSlot(at(`${MONDAY}T12:00:00-06:00`), cfg)).toBe('lunes 9 de noviembre a las 12:00 p. m.');
  });

  it('genera un .ics en UTC con el texto escapado', () => {
    const start = at(`${MONDAY}T09:00:00-06:00`);
    const ics = gs.buildIcs('abc@google.com', start, start + 1_800_000, NOW, cfg);
    expect(ics).toContain('DTSTART:20261109T150000Z');
    expect(ics).toContain('DTEND:20261109T153000Z');
    expect(ics).toContain('LOCATION:2a Calle 6-24\\, Zona 10');
    expect(ics.split('\r\n').at(-1)).toBe('END:VCALENDAR');
  });

  it('arma el aviso de WhatsApp con el prefijo de Guatemala', () => {
    expect(gs.whatsappNotice('55551234', 'Hola, Ana')).toBe('https://wa.me/50255551234?text=Hola%2C%20Ana');
  });
});
