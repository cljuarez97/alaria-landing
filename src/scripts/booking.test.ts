import { describe, expect, it, vi } from 'vitest';
import { isBot, normalizePhone, submitBooking, validateBooking, type BookingFields } from './booking';

const valid: BookingFields = {
  name: 'Ana López',
  phone: '5555 1234',
  email: 'ana@correo.com',
  treatment: 'Armonización facial',
};

describe('normalizePhone', () => {
  it('quita espacios, guiones y el prefijo +502', () => {
    expect(normalizePhone('+502 5555-1234')).toBe('55551234');
    expect(normalizePhone('5555 1234')).toBe('55551234');
  });
});

describe('validateBooking', () => {
  it('acepta un formulario completo', () => {
    expect(validateBooking(valid)).toEqual([]);
  });

  it('marca los campos obligatorios vacíos', () => {
    const errors = validateBooking({ ...valid, name: ' ', phone: '' });
    expect(errors).toEqual([
      { field: 'name', code: 'required' },
      { field: 'phone', code: 'required' },
    ]);
  });

  it('permite omitir correo y tratamiento', () => {
    expect(validateBooking({ ...valid, email: '', treatment: '' })).toEqual([]);
  });

  it('rechaza correo y teléfono mal formados', () => {
    const errors = validateBooking({ ...valid, email: 'ana@', phone: '1234' });
    expect(errors).toEqual([
      { field: 'email', code: 'email' },
      { field: 'phone', code: 'phone' },
    ]);
  });
});

describe('isBot', () => {
  it('detecta el honeypot relleno', () => {
    expect(isBot({ ...valid, botcheck: 'x' })).toBe(true);
    expect(isBot(valid)).toBe(false);
  });
});

describe('submitBooking', () => {
  const json = (body: unknown, ok = true) =>
    vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) }) as unknown as typeof fetch;

  it('devuelve success cuando Web3Forms confirma', async () => {
    expect(await submitBooking('https://x', {}, json({ success: true }))).toBe('success');
  });

  it('devuelve error en respuestas 4xx/5xx o success=false', async () => {
    expect(await submitBooking('https://x', {}, json({}, false))).toBe('error');
    expect(await submitBooking('https://x', {}, json({ success: false }))).toBe('error');
  });

  it('devuelve offline si la red falla', async () => {
    const failing = vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;
    expect(await submitBooking('https://x', {}, failing)).toBe('offline');
  });
});
