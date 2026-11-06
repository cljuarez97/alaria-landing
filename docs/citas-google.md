# Citas con Google Calendar

Sin servidores propios: un backend de Google Apps Script corre con la cuenta de la clínica
(`alariaclinicaestetica@gmail.com`). El sitio no guarda claves ni pide inicio de sesión a las pacientes.
Funciona igual desde GitHub Pages y desde local; lo enviado desde `localhost:4321` queda marcado `[PRUEBA]`.

## Flujo

1. `/agendar/` pide las horas libres (`GET ?action=slots`): horario de `CONFIG.HOURS` menos los eventos de
   "Citas Alaria" y del calendario principal. Los eventos marcados como "Libre" no bloquean.
2. La paciente envía la solicitud (`POST`): se crea un evento amarillo "Por confirmar" que aparta la hora y
   la clínica recibe un correo.
3. La clínica abre el enlace del correo, o el que está en la descripción del evento, y decide:
   - **Aceptar**: el evento pasa a verde "Cita" y la paciente recibe la confirmación con un `.ics`.
   - **Rechazar**: se borra el evento, la hora queda libre y se avisa a la paciente.
   - Si la paciente no dejó correo, la página ofrece un mensaje listo para WhatsApp.
4. Cada hora:
   - recuerda a la clínica una solicitud sin responder a las 4 h, o de inmediato si la cita es dentro de 24 h;
   - a las 48 h, o si la hora ya pasó, libera la hora y avisa a la clínica y a la paciente;
   - envía el recordatorio 24 h antes de la cita;
   - una semana después envía el recordatorio de control, solo a quien lo autorizó.
5. La paciente puede cancelar desde su correo; la clínica recibe el aviso.

Borrar un evento directamente en Google Calendar libera la hora, pero no avisa a la paciente: para eso usa
"Cancelar esta cita" en la página de la solicitud.

## Seguridad

- Los enlaces de la clínica y de la paciente llevan una firma HMAC con un secreto en Script Properties.
  **Quien tenga un enlace puede usarlo**: no los reenvíes.
- Los correos no ejecutan la decisión al abrirse (los antivirus de correo abren enlaces): hay que pulsar el botón.
- Antiabuso: honeypot, 30 solicitudes por hora en total y 3 cada 6 horas por teléfono.
- La paciente no recibe correo hasta que la clínica decide: así nadie puede usar el formulario para enviar
  correos a terceros.
- Límite de Google para cuentas gratuitas: unos 100 destinatarios de correo al día.

## Cambiar la configuración

Horario, duración, anticipación y dominios permitidos están en `CONFIG` (`apps-script/Logic.gs`).
Si cambias el horario, actualiza también `visit.hours` en `src/data/content.ts`.

## Publicar cambios del backend

El código de `apps-script/` no se publica con el sitio.

1. Copia los archivos en el proyecto "Alaria Citas" de [script.google.com](https://script.google.com).
2. Implementar > Gestionar implementaciones > editar > Versión nueva. Así la URL no cambia.

## Instalación desde cero

1. Crea el proyecto con `appsscript.json`, `Logic.gs` y `Code.gs`.
2. Ejecuta `setup` una vez y autoriza los permisos: calendario, enviar correos y tareas programadas.
3. Implementar > Nueva implementación > Aplicación web: ejecutar como "Yo", acceso "Cualquier usuario".
4. Pega la URL `/exec` en `booking.endpoint` (`src/data/content.ts`).
