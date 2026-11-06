import { describe, expect, it } from 'vitest';
import { isBot, normalizePhone, validateBooking, type BookingFields } from './booking';

const valid: BookingFields = {
  name: 'Ana López',
  phone: '5555 1234',
  email: 'ana@correo.com',
  treatment: 'Armonización facial',
  slot: '09:00',
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
    const errors = validateBooking({ ...valid, slot: '', name: ' ', phone: '' });
    expect(errors).toEqual([
      { field: 'slot', code: 'required' },
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
