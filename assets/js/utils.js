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
