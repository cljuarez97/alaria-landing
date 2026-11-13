import { describe, expect, it, vi } from 'vitest';
import {
  bookingBackend,
  confirmCode,
  fetchAvailability,
  formatDate,
  formatMonth,
  formatTime,
  monthCells,
  monthsWithSlots,
  padCells,
  requestAppointment,
  requestCode,
  slotStart,
} from './appointments';

const json = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;
const payload = {
  name: 'Ana',
  phone: '55551234',
  email: '',
  treatment: '',
  message: '',
  followup: false,
  slotStart: '2026-11-09T09:00:00-06:00',
  origin: 'http://localhost:4321',
};

const appsScript = { kind: 'apps-script', endpoint: 'https://x.test/exec' } as const;
const bichitech = { kind: 'bichitech', api: 'https://app.test/api/public/alaria', serviceId: 7 } as const;

describe('bookingBackend', () => {
  it('usa Bichitech solo si el build trae la API y el servicio', () => {
    expect(bookingBackend({ api: 'https://app.test/api/public/alaria/', serviceId: '7' }, 'u')).toEqual(bichitech);
    expect(bookingBackend({ api: 'https://app.test/api', serviceId: 'x' }, 'u')).toEqual({ kind: 'apps-script', endpoint: 'u' });
    expect(bookingBackend({}, 'u')).toEqual({ kind: 'apps-script', endpoint: 'u' });
  });
});

describe('fetchAvailability', () => {
  it('Apps Script: devuelve los días y calcula cada instante con el desfase', async () => {
    const fetchImpl = vi.fn(async () => json({ ok: true, utcOffset: '-06:00', days: [{ date: '2026-11-09', slots: ['09:00'] }] }));
    const result = await fetchAvailability(appsScript, fetchImpl as unknown as typeof fetch);
    expect(result.days).toHaveLength(1);
    expect(slotStart(result, '2026-11-09', '09:00')).toBe('2026-11-09T09:00:00-06:00');
    expect(fetchImpl).toHaveBeenCalledWith('https://x.test/exec?action=slots');
  });

  it('Bichitech: usa el instante exacto que da el servidor', async () => {
    const fetchImpl = vi.fn(async () =>
      json({ ok: true, days: [{ date: '2026-11-09', slots: [{ time: '09:00', start: '2026-11-09T09:00:00-06:00' }] }] }),
    );
    const result = await fetchAvailability(bichitech, fetchImpl as unknown as typeof fetch);
    expect(result.days).toEqual([{ date: '2026-11-09', slots: ['09:00'] }]);
    expect(slotStart(result, '2026-11-09', '09:00')).toBe('2026-11-09T09:00:00-06:00');
    expect((fetchImpl.mock.calls[0] as unknown as [string])[0]).toBe('https://app.test/api/public/alaria/availability?service=7');
  });

  it('lanza un error si el servicio falla', async () => {
    const fetchImpl = (async () => json({ ok: false, error: 'server' })) as unknown as typeof fetch;
    await expect(fetchAvailability(appsScript, fetchImpl)).rejects.toThrow();
    await expect(fetchAvailability(bichitech, fetchImpl)).rejects.toThrow();
  });
});

describe('requestAppointment', () => {
  it('envía JSON como text/plain para evitar la petición previa de CORS', async () => {
    const fetchImpl = vi.fn(async () => json({ ok: true }));
    const result = await requestAppointment(appsScript, payload, fetchImpl as unknown as typeof fetch);
    expect(result).toEqual({ ok: true });
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.headers).toEqual({ 'Content-Type': 'text/plain;charset=utf-8' });
    expect(JSON.parse(String(init.body))).toEqual(payload);
  });

  it('propaga el motivo del rechazo', async () => {
    const fetchImpl = (async () => json({ ok: false, error: 'slot_taken' })) as unknown as typeof fetch;
    expect(await requestAppointment(appsScript, payload, fetchImpl)).toEqual({ ok: false, error: 'slot_taken' });
  });

  it('Bichitech: envía JSON con el servicio y el instante, y traduce sus errores', async () => {
    const fetchImpl = vi.fn(async () => json({ ok: true }));
    expect(await requestAppointment(bichitech, payload, fetchImpl as unknown as typeof fetch)).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://app.test/api/public/alaria/appointments');
    expect(JSON.parse(String(init.body))).toEqual({
      service_id: 7,
      start: '2026-11-09T09:00:00-06:00',
      name: 'Ana',
      phone: '55551234',
      email: null,
      treatment: null,
      message: null,
      followup: false,
      verification: null,
    });

    const rejected = (async () => json({ ok: false, error: 'rate_limited' }, false)) as unknown as typeof fetch;
    expect(await requestAppointment(bichitech, payload, rejected)).toEqual({ ok: false, error: 'rate_limited' });
    const unknown = (async () => json({ message: 'Server Error' }, false)) as unknown as typeof fetch;
    expect(await requestAppointment(bichitech, payload, unknown)).toEqual({ ok: false, error: 'server' });
  });

  it('trata los fallos de red como sin conexión', async () => {
    const fetchImpl = (async () => {
      throw new Error('red');
    }) as unknown as typeof fetch;
    expect(await requestAppointment(appsScript, payload, fetchImpl)).toEqual({ ok: false, error: 'offline' });
  });
});

describe('confirmación del teléfono por WhatsApp', () => {
  const bichitech = { kind: 'bichitech', api: 'https://app.test/api/public/alaria', serviceId: 1 } as const;

  it('pide el código a Bichitech', async () => {
    const fetchImpl = vi.fn(async () => json({ ok: true, expires_in: 600 }));
    expect(await requestCode(bichitech, '55551234', fetchImpl)).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://app.test/api/public/alaria/verifications');
    expect(JSON.parse(String(init.body))).toEqual({ phone: '55551234' });
  });

  it('cambia el código por el comprobante y lo manda con la solicitud', async () => {
    const confirm = vi.fn(async () => json({ ok: true, token: 'comprobante' }));
    const result = await confirmCode(bichitech, '55551234', ' 123456 ', confirm);
    expect(result).toEqual({ ok: true, token: 'comprobante' });
    expect(JSON.parse(String((confirm.mock.calls[0] as unknown as [string, RequestInit])[1].body))).toEqual({ phone: '55551234', code: '123456' });

    const send = vi.fn(async () => json({ ok: true }));
    await requestAppointment(bichitech, { ...payload, verification: 'comprobante' }, send);
    expect(JSON.parse(String((send.mock.calls[0] as unknown as [string, RequestInit])[1].body)).verification).toBe('comprobante');
  });

  it('reconoce cuándo la clínica pide código y cuándo el código está mal', async () => {
    expect(await requestAppointment(bichitech, payload, async () => json({ ok: false, error: 'verification_required' }, false))).toEqual({
      ok: false,
      error: 'verification_required',
    });
    expect(await confirmCode(bichitech, '55551234', '000000', async () => json({ ok: false, error: 'invalid_code' }, false))).toEqual({
      ok: false,
      error: 'invalid_code',
    });
    expect(await requestCode(bichitech, '55551234', async () => json({ ok: false, error: 'send_failed' }, false))).toEqual({
      ok: false,
      error: 'send_failed',
    });
  });

  it('con Apps Script no hay códigos', async () => {
    const fetchImpl = vi.fn();
    expect(await requestCode({ kind: 'apps-script', endpoint: 'https://script.test' }, '55551234', fetchImpl)).toEqual({ ok: false, error: 'server' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('fechas', () => {
  it('sin dato de la hora elegida, el inicio queda vacío y el servidor lo rechaza', () => {
    expect(slotStart({ days: [], starts: {} }, '2026-11-09', '09:30')).toBe('');
  });

  it('empieza el mes en su día de la semana', () => {
    const cells = monthCells(2026, 10); // noviembre de 2026 empieza en domingo
    expect(cells[0]).toBe('2026-11-01');
    expect(cells).toHaveLength(30);
    const december = monthCells(2026, 11); // diciembre empieza en martes
    expect(december.slice(0, 3)).toEqual([null, null, '2026-12-01']);
  });

  it('rellena los meses cortos sin tocar los largos', () => {
    expect(padCells(monthCells(2026, 10))).toHaveLength(35);
    const long = monthCells(2026, 7); // agosto de 2026 ocupa 6 semanas
    expect(padCells(long)).toEqual(long);
  });

  it('lista los meses con horas sin repetirlos', () => {
    const days = [
      { date: '2026-12-01', slots: ['09:00'] },
      { date: '2026-11-30', slots: ['09:00'] },
      { date: '2026-11-09', slots: ['09:00'] },
    ];
    expect(monthsWithSlots(days)).toEqual([
      { year: 2026, month: 10 },
      { year: 2026, month: 11 },
    ]);
  });

  it('formatea en español', () => {
    expect(formatDate('2026-11-09')).toBe('lunes 9 de noviembre');
    expect(formatMonth(2026, 10)).toBe('noviembre de 2026');
    expect(formatTime('09:00')).toBe('9:00\u00a0a.\u00a0m.');
    expect(formatTime('12:30')).toBe('12:30\u00a0p.\u00a0m.');
    expect(formatTime('13:00')).toBe('1:00\u00a0p.\u00a0m.');
  });
});
