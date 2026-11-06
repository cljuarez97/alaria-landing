// Página /agendar/: calendario de horas libres y formulario de solicitud.
import {
  fetchAvailability,
  formatDate,
  formatMonth,
  formatTime,
  monthCells,
  monthsWithSlots,
  requestAppointment,
  slotStart,
  type Availability,
} from '../lib/appointments';
import { isBot, normalizePhone, validateBooking, type BookingFields, type FieldError } from './booking';

type Messages = {
  endpoint: string;
  validation: Record<FieldError['code'] | 'slot', string>;
  submit: string;
  sending: string;
  success: string;
  error: string;
  slotTaken: string;
  rateLimited: string;
  offline: string;
  loading: string;
  loadError: string;
  empty: string;
};

const VALIDATED = ['name', 'phone', 'email'] as const;

function setup(form: HTMLFormElement) {
  if (form.dataset.ready) return;
  form.dataset.ready = 'true';

  const msg = JSON.parse(form.dataset.messages ?? '{}') as Messages;
  const q = <T extends HTMLElement>(selector: string) => form.querySelector<T>(selector)!;
  const picker = q('[data-picker]');
  const monthLabel = q('[data-month-label]');
  const prev = q<HTMLButtonElement>('[data-month-prev]');
  const next = q<HTMLButtonElement>('[data-month-next]');
  const daysBox = q('[data-days]');
  const timeSet = q<HTMLFieldSetElement>('[data-time-set]');
  const timesBox = q('[data-times]');
  const summary = q('[data-summary]');
  const slotError = q('#slot-error');
  const live = q('[data-picker-live]');
  const retry = q<HTMLButtonElement>('[data-retry]');
  const button = q<HTMLButtonElement>('button[type="submit"]');
  const label = q('[data-submit-label]');
  const status = q('[data-status]');
  const statusText = q('[data-status-text]');
  const touched = new Set<string>();

  let availability: Availability = { utcOffset: '', days: [] };
  let months: { year: number; month: number }[] = [];
  let monthIndex = 0;
  let selectedDate = '';
  let selectedTime = '';

  const setPickerState = (state: 'loading' | 'ready' | 'error' | 'empty') => {
    picker.dataset.state = state;
    live.textContent = { loading: msg.loading, ready: '', error: msg.loadError, empty: msg.empty }[state];
  };

  const slotsOf = (date: string) => availability.days.find((d) => d.date === date)?.slots ?? [];

  const renderSummary = () => {
    summary.hidden = !selectedTime;
    if (selectedTime) {
      q('[data-summary-text]').textContent = `${formatDate(selectedDate)}, ${formatTime(selectedTime)}`;
      slotError.hidden = true;
    }
  };

  const renderTimes = () => {
    timesBox.replaceChildren(
      ...slotsOf(selectedDate).map((time) => {
        const option = document.createElement('label');
        option.className = 'slot';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'time';
        input.value = time;
        input.checked = time === selectedTime;
        input.addEventListener('change', () => {
          selectedTime = time;
          renderSummary();
        });
        const text = document.createElement('span');
        text.textContent = formatTime(time);
        option.append(input, text);
        return option;
      }),
    );
    timeSet.hidden = !selectedDate;
    renderSummary();
  };

  const renderMonth = () => {
    const month = months[monthIndex];
    if (!month) return;
    monthLabel.textContent = formatMonth(month.year, month.month);
    const lastFocused = document.activeElement;
    const atStart = monthIndex === 0;
    const atEnd = monthIndex === months.length - 1;
    // Un botón deshabilitado pierde el foco: se pasa al otro antes de que caiga en <body>.
    // Ese otro aún puede estar deshabilitado, y entonces no aceptaría el foco.
    prev.disabled = atStart;
    next.disabled = atEnd;
    if (atStart && !atEnd && lastFocused === prev) next.focus();
    if (atEnd && !atStart && lastFocused === next) prev.focus();
    daysBox.replaceChildren(
      ...monthCells(month.year, month.month).map((date) => {
        if (!date) return document.createElement('span');
        const option = document.createElement('label');
        option.className = 'day';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'date';
        input.value = date;
        input.disabled = slotsOf(date).length === 0;
        input.checked = date === selectedDate;
        input.setAttribute('aria-label', formatDate(date));
        input.addEventListener('change', () => {
          selectedDate = date;
          selectedTime = '';
          renderTimes();
        });
        const text = document.createElement('span');
        text.textContent = String(Number(date.slice(8)));
        text.setAttribute('aria-hidden', 'true');
        option.append(input, text);
        return option;
      }),
    );
  };

  const load = async () => {
    setPickerState('loading');
    try {
      availability = await fetchAvailability(msg.endpoint);
    } catch {
      setPickerState('error');
      return;
    }
    if (!availability.days.length) {
      setPickerState('empty');
      return;
    }
    months = monthsWithSlots(availability.days);
    if (selectedDate && !slotsOf(selectedDate).length) selectedDate = '';
    if (!slotsOf(selectedDate).includes(selectedTime)) selectedTime = '';
    monthIndex = Math.max(0, Math.min(monthIndex, months.length - 1));
    setPickerState('ready');
    renderMonth();
    renderTimes();
  };

  prev.addEventListener('click', () => {
    monthIndex -= 1;
    renderMonth();
  });
  next.addEventListener('click', () => {
    monthIndex += 1;
    renderMonth();
  });
  retry.addEventListener('click', async () => {
    await load();
    if (picker.dataset.state === 'error') retry.focus();
    else form.querySelector<HTMLInputElement>('.day input:not(:disabled)')?.focus();
  });

  // Enter en un radio selecciona la opción en vez de enviar el formulario a medias.
  form.addEventListener('keydown', (event) => {
    const target = event.target;
    if (event.key === 'Enter' && target instanceof HTMLInputElement && target.type === 'radio') {
      event.preventDefault();
      target.click();
    }
  });

  // El error que muestra el blur desplaza el botón y el clic se perdería: se valida al enviar.
  button.addEventListener('mousedown', (event) => event.preventDefault());

  const read = (): BookingFields => {
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? '');
    return {
      name: get('name'),
      phone: get('phone'),
      email: get('email'),
      treatment: get('treatment'),
      slot: selectedTime,
      message: get('message'),
      botcheck: get('botcheck'),
    };
  };

  const showErrors = (errors: FieldError[], only?: Set<string>) => {
    for (const field of VALIDATED) {
      if (only && !only.has(field)) continue;
      const input = form.elements.namedItem(field) as HTMLInputElement | null;
      const box = form.querySelector<HTMLElement>(`#${field}-error`);
      if (!input || !box) continue;
      const err = errors.find((e) => e.field === field);
      input.setAttribute('aria-invalid', err ? 'true' : 'false');
      box.hidden = !err;
      box.querySelector<HTMLElement>('[data-error-text]')!.textContent = err ? msg.validation[err.code] : '';
    }
    if (!only) {
      slotError.querySelector<HTMLElement>('[data-error-text]')!.textContent = msg.validation.slot;
      slotError.hidden = !errors.some((e) => e.field === 'slot');
    }
  };

  const setStatus = (kind: 'none' | 'success' | 'error' | 'offline', text = '') => {
    status.dataset.kind = kind;
    statusText.textContent = text;
  };

  // Valida al salir de un campo ya tocado, no a cada tecla.
  for (const field of VALIDATED) {
    const input = form.elements.namedItem(field) as HTMLInputElement | null;
    input?.addEventListener('blur', () => {
      if (!input.value.trim() && !touched.has(field)) return;
      touched.add(field);
      showErrors(validateBooking(read()), new Set([field]));
    });
    input?.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') showErrors(validateBooking(read()), new Set([field]));
    });
  }

  const clearSelection = () => {
    selectedDate = '';
    selectedTime = '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.dataset.state === 'sending') return;
    setStatus('none');
    const fields = read();
    const when = selectedTime ? `${formatDate(selectedDate)} a las ${formatTime(selectedTime)}` : '';
    const successText = msg.success.replace('{when}', when);

    // Un bot recibe "éxito" y no se envía nada.
    if (isBot(fields)) {
      form.reset();
      setStatus('success', successText);
      return;
    }

    const errors = validateBooking(fields);
    VALIDATED.forEach((f) => touched.add(f));
    showErrors(errors);
    if (errors.length) {
      if (errors.some((e) => e.field === 'slot')) {
        const missing = selectedDate ? '.slot input' : '.day input:not(:disabled)';
        form.querySelector<HTMLInputElement>(missing)?.focus({ preventScroll: true });
        slotError.scrollIntoView({ block: 'start' });
        return;
      }
      const first = VALIDATED.find((f) => errors.some((e) => e.field === f));
      (form.elements.namedItem(first!) as HTMLInputElement).focus();
      return;
    }

    button.dataset.state = 'sending';
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    label.textContent = msg.sending;

    const result = await requestAppointment(msg.endpoint, {
      name: fields.name.trim(),
      phone: normalizePhone(fields.phone),
      email: fields.email.trim(),
      treatment: fields.treatment,
      message: (fields.message ?? '').trim(),
      slotStart: slotStart(selectedDate, selectedTime, availability.utcOffset),
      origin: location.origin,
    });

    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.dataset.state = 'idle';
    label.textContent = msg.submit;

    if (result.ok) {
      form.reset();
      touched.clear();
      clearSelection();
      showErrors([]);
      setStatus('success', successText);
      status.scrollIntoView({ block: 'center' });
      void load();
      return;
    }
    if (result.error === 'offline') setStatus('offline', msg.offline);
    else if (result.error === 'rate_limited') setStatus('error', msg.rateLimited);
    else if (result.error === 'slot_taken') {
      setStatus('error', msg.slotTaken);
      selectedTime = '';
      await load();
      timeSet.scrollIntoView({ block: 'center' });
    } else setStatus('error', msg.error);
  });

  void load();
}

document.addEventListener('astro:page-load', () => {
  document.querySelectorAll<HTMLFormElement>('form[data-booking]').forEach(setup);
});
