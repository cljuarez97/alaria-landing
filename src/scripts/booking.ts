export type BookingFields = {
  name: string;
  phone: string;
  email: string;
  treatment: string;
  slot: string;
  message?: string;
  botcheck?: string;
};

export type FieldError = { field: keyof BookingFields; code: 'required' | 'email' | 'phone' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Guatemala: 8 dígitos, con o sin +502, espacios o guiones. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('502') && digits.length === 11 ? digits.slice(3) : digits;
}

export function validateBooking(fields: BookingFields): FieldError[] {
  const errors: FieldError[] = [];
  // Correo y tratamiento son opcionales: menos fricción para reservar.
  const required: (keyof BookingFields)[] = ['slot', 'name', 'phone'];
  for (const field of required) {
    if (!fields[field]?.trim()) errors.push({ field, code: 'required' });
  }
  if (fields.email.trim() && !EMAIL_RE.test(fields.email.trim())) {
    errors.push({ field: 'email', code: 'email' });
  }
  if (fields.phone.trim() && normalizePhone(fields.phone).length !== 8) {
    errors.push({ field: 'phone', code: 'phone' });
  }
  return errors;
}

/** Un bot que rellena el honeypot recibe "éxito" sin que se envíe nada. */
export function isBot(fields: BookingFields): boolean {
  return Boolean(fields.botcheck);
}
