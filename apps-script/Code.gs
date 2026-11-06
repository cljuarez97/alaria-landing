// Backend de citas de Alaria (Google Apps Script). Corre con la cuenta de la clínica, sin claves en el sitio.
//
// Flujo: el sitio pide horas libres (GET) y envía una solicitud (POST) -> se crea un evento "Por confirmar"
// en el calendario "Citas Alaria", que aparta la hora -> la clínica recibe un correo con un enlace para
// aceptar o rechazar -> la paciente recibe la respuesta por correo o la clínica le avisa por WhatsApp.
//
// OJO: cualquier función global sin "_" final se puede invocar desde una página con google.script.run.
// Por eso todo lo interno termina en "_", y lo público valida una firma o es inofensivo si se repite.

var STATUS_PENDING = 'pending';
var STATUS_CONFIRMED = 'confirmed';
var SLOTS_CACHE_KEY = 'slots';
var SLOTS_CACHE_SECONDS = 60;
var RATE_LIMIT_SECONDS = 21600; // máximo que admite CacheService: 6 horas

/* ---------- Puesta en marcha (ejecutar una vez desde el editor) ---------- */

/** Crea el calendario, el secreto de las firmas y el trigger. Repetirla no duplica nada. */
function setup() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('CALENDAR_ID')) {
    var calendar = CalendarApp.createCalendar(CONFIG.CALENDAR_NAME, {
      timeZone: 'America/Guatemala',
      color: CalendarApp.Color.PLUM,
    });
    props.setProperty('CALENDAR_ID', calendar.getId());
  }
  if (!props.getProperty('SIGNING_SECRET')) {
    props.setProperty('SIGNING_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }
  var hasTrigger = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'hourlyJob';
  });
  if (!hasTrigger) ScriptApp.newTrigger('hourlyJob').timeBased().everyHours(1).create();
}

/* ---------- Entradas web ---------- */

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'slots') return json_(slotsResponse_());
    if (p.action === 'review') return reviewPage_(p.id, p.sig);
    if (p.action === 'cancel') return cancelPage_(p.id, p.sig);
    if (p.action === 'panel') return panelPage_(p.sig);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return p.action === 'slots' ? json_({ ok: false, error: 'server' }) : page_('Algo salió mal', '<p>Inténtalo de nuevo en un momento.</p>');
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    // Un bot que rellena el honeypot recibe "éxito" sin que se cree nada.
    if (body.botcheck) return json_({ ok: true });
    return json_(createRequest_(body));
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

/* ---------- Disponibilidad ---------- */

function slotsResponse_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(SLOTS_CACHE_KEY);
  if (cached) return JSON.parse(cached);
  var now = Date.now();
  var response = {
    ok: true,
    utcOffset: CONFIG.UTC_OFFSET,
    days: availableDays(busyRanges_(now, now + (CONFIG.HORIZON_DAYS + 1) * DAY_MS), now, CONFIG),
  };
  cache.put(SLOTS_CACHE_KEY, JSON.stringify(response), SLOTS_CACHE_SECONDS);
  return response;
}

/** Ocupado = cualquier evento de "Citas Alaria" o del calendario principal, salvo los marcados como "Libre". */
function busyRanges_(fromMs, toMs) {
  var from = new Date(fromMs);
  var to = new Date(toMs);
  var busy = [];
  [appointmentsCalendar_(), CalendarApp.getDefaultCalendar()].forEach(function (calendar) {
    calendar.getEvents(from, to).forEach(function (event) {
      if (event.getTransparency() === CalendarApp.EventTransparency.TRANSPARENT) return;
      busy.push({ start: event.getStartTime().getTime(), end: event.getEndTime().getTime() });
    });
  });
  return busy;
}

/* ---------- Solicitud de la paciente ---------- */

function createRequest_(body) {
  var checked = validateRequest(body, CONFIG);
  if (checked.errors.length) return { ok: false, error: 'invalid', fields: checked.errors };
  var data = checked.data;

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, error: 'busy' };
  try {
    if (isRateLimited_(data.phone)) return { ok: false, error: 'rate_limited' };
    var now = Date.now();
    var startMs = data.startMs;
    var endMs = startMs + CONFIG.SLOT_MINUTES * MINUTE_MS;
    // Se compara el día completo, no solo la hora: isSlotAvailable también valida horario y alineación.
    if (!isSlotAvailable(startMs, busyRanges_(startMs - DAY_MS, endMs + DAY_MS), now, CONFIG)) {
      return { ok: false, error: 'slot_taken' };
    }
    var isTest = isLocalOrigin(data.origin);
    var event = appointmentsCalendar_().createEvent(eventTitle_('Por confirmar', data.name, isTest), new Date(startMs), new Date(endMs), {
      location: CONFIG.CLINIC_ADDRESS,
    });
    event.setColor(CalendarApp.EventColor.YELLOW);
    event.setTag('status', STATUS_PENDING);
    event.setTag('name', data.name);
    event.setTag('phone', data.phone);
    event.setTag('email', data.email);
    event.setTag('test', isTest ? '1' : '');
    var reviewUrl = signedUrl_('review', event.getId());
    event.setDescription(eventDescription_(data) + '\n\nAceptar o rechazar: ' + reviewUrl);
    CacheService.getScriptCache().remove(SLOTS_CACHE_KEY);
    notifyClinicOfRequest_(data, reviewUrl, isTest);
    return { ok: true, status: STATUS_PENDING };
  } finally {
    lock.releaseLock();
  }
}

function isRateLimited_(phone) {
  var cache = CacheService.getScriptCache();
  var hourKey = 'rl:global:' + Math.floor(Date.now() / (60 * MINUTE_MS));
  var phoneKey = 'rl:phone:' + phone;
  var globalCount = Number(cache.get(hourKey) || 0);
  var phoneCount = Number(cache.get(phoneKey) || 0);
  if (globalCount >= CONFIG.RATE_LIMIT_GLOBAL_PER_HOUR || phoneCount >= CONFIG.RATE_LIMIT_PHONE_PER_6H) return true;
  cache.put(hourKey, String(globalCount + 1), 3600);
  cache.put(phoneKey, String(phoneCount + 1), RATE_LIMIT_SECONDS);
  return false;
}

function eventTitle_(label, name, isTest) {
  return (isTest ? '[PRUEBA] ' : '') + label + ' · ' + name;
}

function eventDescription_(data) {
  return [
    'Teléfono: ' + data.phone,
    'Correo: ' + (data.email || 'no indicó'),
    'Tratamiento: ' + (data.treatment || 'no indicó'),
    'Comentario: ' + (data.message || 'sin comentario'),
  ].join('\n');
}

/* ---------- Decisión de la clínica (invocadas desde las páginas) ---------- */

/** decision: accept | reject | cancel. Requiere la firma del enlace que recibió la clínica. */
function decideRequest(id, decision, sig, note) {
  if (!verify_('review', id, sig)) return { ok: false, message: 'El enlace no es válido.' };
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, message: 'Inténtalo de nuevo en un momento.' };
  try {
    var event = appointmentsCalendar_().getEventById(id);
    if (!event) return { ok: false, message: 'Esta cita ya no existe en el calendario.' };
    var status = event.getTag('status');
    if (decision === 'accept' && status === STATUS_PENDING) return acceptRequest_(event);
    if (decision === 'reject' && status === STATUS_PENDING) return dropRequest_(event, note, 'reject');
    if (decision === 'cancel' && status === STATUS_CONFIRMED) return dropRequest_(event, note, 'cancel');
    return { ok: false, message: 'Esta solicitud ya se había atendido.' };
  } finally {
    lock.releaseLock();
  }
}

function acceptRequest_(event) {
  var info = eventInfo_(event);
  event.setTitle(eventTitle_('Cita', info.name, info.isTest));
  event.setColor(CalendarApp.EventColor.GREEN);
  event.setTag('status', STATUS_CONFIRMED);
  var when = formatSlot(info.startMs, CONFIG);
  if (info.email) sendConfirmation_(event, info, when);
  CacheService.getScriptCache().remove(SLOTS_CACHE_KEY);
  return {
    ok: true,
    message: info.email ? 'Cita aceptada. Le enviamos la confirmación por correo.' : 'Cita aceptada. No dejó correo: avísale por WhatsApp.',
    whatsapp: whatsappNotice(info.phone, 'Hola, ' + info.name + '. Confirmamos tu valoración en ' + CONFIG.CLINIC_NAME + ' el ' + when + ' Te esperamos en ' + CONFIG.CLINIC_ADDRESS + '.'),
  };
}

/** Rechazar o cancelar quita el evento: la hora vuelve a quedar libre en el sitio. */
function dropRequest_(event, note, kind) {
  var info = eventInfo_(event);
  var when = formatSlot(info.startMs, CONFIG);
  var reason = oneLine(note).slice(0, 300);
  var lead = kind === 'reject' ? 'No podemos atender tu solicitud' : 'Tuvimos que cancelar tu cita';
  var text = lead + ' del ' + when;
  if (reason) text += ' ' + reason;
  if (info.email) {
    sendMail_(info.email, 'Sobre tu valoración en ' + CONFIG.CLINIC_NAME, [
      'Hola, ' + info.name + '.',
      text,
      'Escríbenos al ' + CONFIG.CLINIC_PHONE + ' para buscar otra fecha, o elige una nueva en nuestro sitio.',
    ]);
  }
  event.deleteEvent();
  CacheService.getScriptCache().remove(SLOTS_CACHE_KEY);
  return {
    ok: true,
    message: kind === 'reject' ? 'Solicitud rechazada. La hora quedó libre.' : 'Cita cancelada. La hora quedó libre.',
    whatsapp: info.email ? '' : whatsappNotice(info.phone, 'Hola, ' + info.name + '. ' + text),
  };
}

/** Cancelación desde el enlace que recibió la paciente. Avisa a la clínica. */
function cancelByPatient(id, sig) {
  if (!verify_('cancel', id, sig)) return { ok: false, message: 'El enlace no es válido.' };
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, message: 'Inténtalo de nuevo en un momento.' };
  try {
    var event = appointmentsCalendar_().getEventById(id);
    if (!event) return { ok: false, message: 'Esta cita ya no está activa.' };
    var info = eventInfo_(event);
    sendMail_(CONFIG.CLINIC_EMAIL, (info.isTest ? '[PRUEBA] ' : '') + 'Cita cancelada: ' + info.name, [
      info.name + ' canceló su cita del ' + formatSlot(info.startMs, CONFIG),
      'Teléfono: ' + info.phone,
      'La hora quedó libre en el sitio.',
    ]);
    event.deleteEvent();
    CacheService.getScriptCache().remove(SLOTS_CACHE_KEY);
    return { ok: true, message: 'Tu cita quedó cancelada. Si quieres otra fecha, escríbenos al ' + CONFIG.CLINIC_PHONE + '.' };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Tarea programada ---------- */

/** Cada hora: libera solicitudes sin atender cuya hora ya pasó y envía recordatorios 24 h antes. */
function hourlyJob() {
  var calendar = appointmentsCalendar_();
  var now = Date.now();
  calendar.getEvents(new Date(now - 7 * DAY_MS), new Date(now)).forEach(function (event) {
    if (event.getTag('status') === STATUS_PENDING) event.deleteEvent();
  });
  calendar.getEvents(new Date(now + 23 * 60 * MINUTE_MS), new Date(now + 25 * 60 * MINUTE_MS)).forEach(function (event) {
    var info = eventInfo_(event);
    if (event.getTag('status') !== STATUS_CONFIRMED || !info.email || event.getTag('reminded')) return;
    sendMail_(info.email, 'Recordatorio: tu valoración en ' + CONFIG.CLINIC_NAME, [
      'Hola, ' + info.name + '.',
      'Te esperamos el ' + formatSlot(info.startMs, CONFIG),
      'Dirección: ' + CONFIG.CLINIC_ADDRESS,
      'Si no puedes venir, cancela aquí: ' + signedUrl_('cancel', event.getId()),
    ]);
    event.setTag('reminded', '1');
  });
}

/* ---------- Correos ---------- */

function notifyClinicOfRequest_(data, reviewUrl, isTest) {
  sendMail_(CONFIG.CLINIC_EMAIL, (isTest ? '[PRUEBA] ' : '') + 'Nueva solicitud de cita: ' + data.name, [
    'Fecha solicitada: ' + formatSlot(data.startMs, CONFIG),
    'Nombre: ' + data.name,
    eventDescription_(data),
    'Aceptar o rechazar: ' + reviewUrl,
    'Todas las citas: ' + signedUrl_('panel', ''),
  ], data.email);
}

function sendConfirmation_(event, info, when) {
  var ics = buildIcs(event.getId(), info.startMs, event.getEndTime().getTime(), Date.now(), CONFIG);
  var lines = [
    'Hola, ' + info.name + '.',
    'Confirmamos tu valoración el ' + when,
    'Dirección: ' + CONFIG.CLINIC_ADDRESS,
    'Adjuntamos un archivo para agregar la cita a tu calendario.',
    'Si no puedes venir, cancela aquí: ' + signedUrl_('cancel', event.getId()),
    'Dudas: ' + CONFIG.CLINIC_PHONE,
  ];
  MailApp.sendEmail({
    to: info.email,
    subject: 'Tu valoración en ' + CONFIG.CLINIC_NAME + ' está confirmada',
    name: CONFIG.CLINIC_NAME,
    replyTo: CONFIG.CLINIC_EMAIL,
    body: lines.join('\n\n'),
    htmlBody: linesToHtml(lines),
    attachments: [Utilities.newBlob(ics, 'text/calendar', 'cita-alaria.ics')],
  });
}

function sendMail_(to, subject, lines, replyTo) {
  MailApp.sendEmail({
    to: to,
    subject: oneLine(subject),
    name: CONFIG.CLINIC_NAME,
    replyTo: replyTo || CONFIG.CLINIC_EMAIL,
    body: lines.join('\n\n'),
    htmlBody: linesToHtml(lines),
  });
}

/* ---------- Páginas ---------- */

function reviewPage_(id, sig) {
  if (!verify_('review', id, sig)) return page_('Enlace no válido', '<p>Abre el enlace completo que llegó por correo.</p>');
  var event = appointmentsCalendar_().getEventById(id);
  if (!event) return page_('Cita no disponible', '<p>Esta cita ya no existe en el calendario.</p>');
  var info = eventInfo_(event);
  var status = event.getTag('status');
  var isPending = status === STATUS_PENDING;
  var buttons = isPending
    ? '<button class="primary" data-decision="accept">Aceptar cita</button><button data-decision="reject">Rechazar</button>'
    : '<button data-decision="cancel">Cancelar esta cita</button>';
  var html =
    '<p class="tag">' + (isPending ? 'Por confirmar' : 'Confirmada') + '</p>' +
    '<p class="when">' + escapeHtml(formatSlot(info.startMs, CONFIG)) + '</p>' +
    '<pre>' + escapeHtml('Nombre: ' + info.name + '\n' + (event.getDescription() || '').split('\n\nAceptar')[0]) + '</pre>' +
    '<label for="note">Motivo (opcional, se envía a la paciente si rechazas o cancelas)</label>' +
    '<textarea id="note" rows="2" maxlength="300"></textarea>' +
    '<div class="actions">' + buttons + '</div><p id="result" role="status"></p>' +
    '<script>' +
    'var id=' + scriptValue_(id) + ',sig=' + scriptValue_(sig) + ';' +
    'function done(r){document.getElementById("result").textContent=r.message;' +
    'if(r.whatsapp){var a=document.createElement("a");a.href=r.whatsapp;a.target="_blank";a.rel="noopener";a.textContent="Avisar por WhatsApp";document.getElementById("result").append(" ",a);}' +
    'if(r.ok){document.querySelector(".actions").remove();document.querySelector("label[for=note]").remove();document.getElementById("note").remove();document.querySelector(".tag").textContent="Atendida";}}' +
    'document.querySelectorAll("[data-decision]").forEach(function(b){b.addEventListener("click",function(){' +
    'document.querySelectorAll("[data-decision]").forEach(function(x){x.disabled=true;});document.getElementById("result").textContent="Procesando…";' +
    'google.script.run.withSuccessHandler(done).withFailureHandler(function(){done({ok:false,message:"No se pudo completar. Recarga la página e inténtalo de nuevo."});})' +
    '.decideRequest(id,b.dataset.decision,sig,document.getElementById("note").value);});});' +
    '</script>';
  return page_('Solicitud de cita', html);
}

function cancelPage_(id, sig) {
  if (!verify_('cancel', id, sig)) return page_('Enlace no válido', '<p>Abre el enlace completo que llegó por correo.</p>');
  var event = appointmentsCalendar_().getEventById(id);
  if (!event) return page_('Cita no activa', '<p>Esta cita ya no está activa.</p>');
  var html =
    '<p class="when">' + escapeHtml(formatSlot(event.getStartTime().getTime(), CONFIG)) + '</p>' +
    '<div class="actions"><button class="primary" id="go">Cancelar mi cita</button></div><p id="result" role="status"></p>' +
    '<script>document.getElementById("go").addEventListener("click",function(){this.disabled=true;document.getElementById("result").textContent="Procesando…";' +
    'google.script.run.withSuccessHandler(function(r){document.getElementById("result").textContent=r.message;if(r.ok){document.querySelector(".actions").remove();}})' +
    '.cancelByPatient(' + scriptValue_(id) + ',' + scriptValue_(sig) + ');});</script>';
  return page_('Cancelar cita', html);
}

function panelPage_(sig) {
  if (!verify_('panel', '', sig)) return page_('Enlace no válido', '<p>Abre el enlace completo que llegó por correo.</p>');
  var now = Date.now();
  var rows = appointmentsCalendar_().getEvents(new Date(now), new Date(now + (CONFIG.HORIZON_DAYS + 1) * DAY_MS)).map(function (event) {
    var info = eventInfo_(event);
    var isPending = event.getTag('status') === STATUS_PENDING;
    return (
      '<li><a target="_blank" rel="noopener" href="' + escapeHtml(signedUrl_('review', event.getId())) + '">' +
      escapeHtml(formatSlot(info.startMs, CONFIG)) + '</a> · ' + escapeHtml(info.name) +
      ' <span class="tag">' + (isPending ? 'Por confirmar' : 'Confirmada') + '</span></li>'
    );
  });
  return page_('Citas', rows.length ? '<ul>' + rows.join('') + '</ul>' : '<p>No hay citas próximas.</p>');
}

function page_(title, content) {
  var css =
    'body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#f9f4f1;color:#2a2725}' +
    'main{max-width:34rem;margin:0 auto;padding:2rem 1.25rem}h1{font:600 1.75rem Georgia,serif;margin:0 0 1rem;color:#5e2a39}' +
    '.tag{font-size:.8125rem;font-weight:600;color:#7a3b4c}.when{font-size:1.25rem;font-weight:600;margin:.25rem 0 1rem}' +
    'pre{white-space:pre-wrap;font:inherit;background:#fff;padding:1rem;border-radius:2px}' +
    'label{display:block;margin:1rem 0 .25rem;font-size:.9375rem}textarea{width:100%;box-sizing:border-box;font:inherit;padding:.5rem}' +
    '.actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1rem}' +
    'button{min-height:44px;padding:0 1.25rem;font:inherit;font-weight:600;background:#fff;border:1px solid #7a3b4c;color:#7a3b4c;border-radius:2px;cursor:pointer}' +
    'button.primary{background:#7a3b4c;color:#fff}button:disabled{opacity:.5}li{margin-bottom:.75rem}a{color:#7a3b4c}';
  return HtmlService.createHtmlOutput('<style>' + css + '</style><main><h1>' + escapeHtml(title) + '</h1>' + content + '</main>')
    .setTitle(title + ' · ' + CONFIG.CLINIC_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Valor para incrustar en un <script>: JSON.stringify no escapa "<", y "</script>" cerraría el bloque. */
function scriptValue_(value) {
  return JSON.stringify(String(value)).replace(/</g, '\\u003c');
}

/* ---------- Utilidades ---------- */

function appointmentsCalendar_() {
  var id = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
  var calendar = id && CalendarApp.getCalendarById(id);
  if (!calendar) throw new Error('Falta ejecutar setup()');
  return calendar;
}

function eventInfo_(event) {
  return {
    name: event.getTag('name') || event.getTitle(),
    phone: event.getTag('phone') || '',
    email: event.getTag('email') || '',
    isTest: event.getTag('test') === '1',
    startMs: event.getStartTime().getTime(),
  };
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function signature_(scope, id) {
  var secret = PropertiesService.getScriptProperties().getProperty('SIGNING_SECRET');
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(scope + '|' + id, secret));
}

function verify_(scope, id, sig) {
  return constantTimeEquals(String(sig || ''), signature_(scope, String(id || '')));
}

function signedUrl_(scope, id) {
  return ScriptApp.getService().getUrl() + '?action=' + scope +
    (id ? '&id=' + encodeURIComponent(id) : '') +
    '&sig=' + encodeURIComponent(signature_(scope, id));
}
