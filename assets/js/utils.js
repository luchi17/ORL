// Funciones de apoyo: validación y limpieza de datos.

// Año actual, para validar el año de nacimiento.
export function currentYear() {
  return new Date().getFullYear();
}

// Limpia el apellido: quita espacios al principio/final y los dobles espacios.
export function cleanLastName(value) {
  return (value || '').trim().replace(/\s+/g, ' ');
}

// Valida el año de nacimiento: exactamente 4 cifras, entre 1900 y el año actual.
export function isValidBirthYear(value) {
  const v = String(value).trim();
  if (!/^\d{4}$/.test(v)) return false;
  const y = parseInt(v, 10);
  return y >= 1900 && y <= currentYear();
}

// Formatea una hora ISO como HH:MM en hora local de Ychoux (Europe/Paris).
export function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es-ES', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Escapa texto para poder insertarlo en HTML sin riesgo (apellidos, textos).
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Devuelve el inicio del día de HOY en Ychoux (Europe/Paris) como ISO en UTC.
// Sirve para filtrar el historial "del día" sin depender de la zona del dispositivo.
export function startOfTodayParisISO() {
  const now = new Date();
  const parisNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const offsetMs = parisNow.getTime() - now.getTime();
  const parisMidnight = new Date(
    parisNow.getFullYear(),
    parisNow.getMonth(),
    parisNow.getDate(),
    0, 0, 0, 0,
  );
  return new Date(parisMidnight.getTime() - offsetMs).toISOString();
}
