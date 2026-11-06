// Lógica pura de las citas: sin servicios de Google, para poder probarla con Vitest
// (src/lib/appointments-backend.test.ts). Los servicios viven en Code.gs.
// Se usa `var` y `function` porque Apps Script comparte un único ámbito global entre archivos.

var CONFIG = {
  CLINIC_NAME: 'Alaria Clínica Estética',
  CLINIC_EMAIL: 'alariaclinicaestetica@gmail.com',
  CLINIC_PHONE: '+502 3104 5178',
  CLINIC_ADDRESS: '2a Calle 6-24, Zona 10, Edificio Renovati, Torre 2, 5.º nivel, clínica 508, Ciudad de Guatemala',
  CALENDAR_NAME: 'Citas Alaria',
  APPOINTMENT_TITLE: 'Valoración',
  // Guatemala no tiene horario de verano: el desfase es fijo.
  UTC_OFFSET: '-06:00',
  SLOT_MINUTES: 30,
  MIN_NOTICE_HOURS: 24,
  HORIZON_DAYS: 60,
  // Clave: día de la semana (0 = domingo). Mismo horario que la página Visítanos.
  HOURS: {
    1: { open: '09:00', close: '17:00' },
    2: { open: '09:00', close: '17:00' },
    3: { open: '09:00', close: '17:00' },
    4: { open: '09:00', close: '17:00' },
    5: { open: '09:00', close: '17:00' },
    6: { open: '09:00', close: '13:00' },
  },
  ALLOWED_ORIGINS: ['https://cljuarez97.github.io', 'http://localhost:4321'],
  RATE_LIMIT_GLOBAL_PER_HOUR: 30,
  RATE_LIMIT_PHONE_PER_6H: 3,
};

var MINUTE_MS = 60 * 1000;
var DAY_MS = 24 * 60 * MINUTE_MS;

function pad2(n) {
  return (n < 10 ? '0' : '') + n;
}

/** Instante de una fecha y hora de la clínica (`2026-11-09`, `09:30`). */
function clinicInstant(date, time, cfg) {
  return Date.parse(date + 'T' + time + ':00' + cfg.UTC_OFFSET);
}

/** Fecha (`YYYY-MM-DD`) en la clínica de un instante. */
function clinicDate(ms, cfg) {
  return slotIso(ms, cfg).slice(0, 10);
}

/** ISO con el desfase de la clínica: el cliente muestra la hora tal cual, sin convertir zonas. */
function slotIso(ms, cfg) {
  var sign = cfg.UTC_OFFSET.charAt(0) === '-' ? -1 : 1;
  var offset = cfg.UTC_OFFSET.slice(1).split(':');
  var offsetMs = sign * (Number(offset[0]) * 60 + Number(offset[1])) * MINUTE_MS;
  var d = new Date(ms + offsetMs);
  return (
    d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()) +
    'T' + pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':00' + cfg.UTC_OFFSET
  );
}

function overlapsBusy(start, end, busy) {
  for (var i = 0; i < busy.length; i++) {
    if (start < busy[i].end && end > busy[i].start) return true;
  }
  return false;
}

/** Horas libres de un día. `busy`: lista de `{ start, end }` en milisegundos. */
function slotsForDate(date, busy, now, cfg) {
  var weekday = new Date(date + 'T12:00:00Z').getUTCDay();
  var hours = cfg.HOURS[weekday];
  if (!hours) return [];
  var step = cfg.SLOT_MINUTES * MINUTE_MS;
  var earliest = now + cfg.MIN_NOTICE_HOURS * 60 * MINUTE_MS;
  var close = clinicInstant(date, hours.close, cfg);
  var slots = [];
  for (var start = clinicInstant(date, hours.open, cfg); start + step <= close; start += step) {
    if (start >= earliest && !overlapsBusy(start, start + step, busy)) slots.push(start);
  }
  return slots;
}

/** Días con al menos una hora libre, desde hoy hasta el horizonte de reservas. */
function availableDays(busy, now, cfg) {
  var days = [];
  for (var i = 0; i <= cfg.HORIZON_DAYS; i++) {
    var date = clinicDate(now + i * DAY_MS, cfg);
    var slots = slotsForDate(date, busy, now, cfg);
    if (slots.length) {
      days.push({
        date: date,
        slots: slots.map(function (ms) {
          return slotIso(ms, cfg).slice(11, 16);
        }),
      });
    }
  }
  return days;
}

/** ¿La hora pedida sigue libre? Protege de peticiones hechas a mano y de dos reservas simultáneas. */
function isSlotAvailable(startMs, busy, now, cfg) {
  if (!isFinite(startMs)) return false;
  return slotsForDate(clinicDate(startMs, cfg), busy, now, cfg).indexOf(startMs) !== -1;
}

function normalizePhone(raw) {
  var digits = String(raw || '').replace(/\D/g, '');
  return digits.length === 11 && digits.indexOf('502') === 0 ? digits.slice(3) : digits;
}

/** Quita saltos de línea: evita inyectar cabeceras en el asunto y líneas en el .ics. */
function oneLine(value) {
  return String(value == null ? '' : value).replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Valida y limpia una solicitud. El origen lo envía el cliente y se puede falsificar: filtra usos
 * accidentales y marca las pruebas locales, pero la defensa real contra abusos es el límite por hora.
 */
function validateRequest(body, cfg) {
  var errors = [];
  var name = oneLine(body.name);
  var phone = normalizePhone(body.phone);
  var email = oneLine(body.email);
  var slotStart = oneLine(body.slotStart);
  var origin = oneLine(body.origin);
  if (name.length < 2 || name.length > 100) errors.push('name');
  if (phone.length !== 8) errors.push('phone');
  if (email && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) errors.push('email');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00[+-]\d{2}:\d{2}$/.test(slotStart)) errors.push('slotStart');
  if (cfg.ALLOWED_ORIGINS.indexOf(origin) === -1) errors.push('origin');
  return {
    errors: errors,
    data: {
      name: name,
      phone: phone,
      email: email,
      treatment: oneLine(body.treatment).slice(0, 100),
      message: String(body.message == null ? '' : body.message).trim().slice(0, 1000),
      startMs: Date.parse(slotStart),
      origin: origin,
    },
  };
}

function isLocalOrigin(origin) {
  return /^http:\/\/localhost(:\d+)?$/.test(origin);
}

function constantTimeEquals(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Fecha y hora legibles para correos y páginas, sin depender de la zona horaria del servidor. */
function formatSlot(ms, cfg) {
  var iso = slotIso(ms, cfg);
  var weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var d = new Date(iso.slice(0, 10) + 'T12:00:00Z');
  var hour = Number(iso.slice(11, 13));
  var period = hour < 12 ? 'a. m.' : 'p. m.';
  return (
    weekdays[d.getUTCDay()] + ' ' + d.getUTCDate() + ' de ' + months[d.getUTCMonth()] +
    ' a las ' + (hour % 12 || 12) + ':' + iso.slice(14, 16) + ' ' + period
  );
}

function icsDate(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsEscape(value) {
  return oneLine(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

/** Archivo .ics adjunto a la confirmación, para agregar la cita a cualquier calendario. */
function buildIcs(uid, startMs, endMs, nowMs, cfg) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alaria Clinica Estetica//Citas//ES',
    'BEGIN:VEVENT',
    'UID:' + icsEscape(uid),
    'DTSTAMP:' + icsDate(nowMs),
    'DTSTART:' + icsDate(startMs),
    'DTEND:' + icsDate(endMs),
    'SUMMARY:' + icsEscape(cfg.APPOINTMENT_TITLE + ' en ' + cfg.CLINIC_NAME),
    'LOCATION:' + icsEscape(cfg.CLINIC_ADDRESS),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Enlace para avisar a la paciente por WhatsApp cuando no dejó correo. */
function whatsappNotice(phone, text) {
  return 'https://wa.me/502' + phone + '?text=' + encodeURIComponent(text);
}
