// Operaciones contra la base de datos para la pantalla de check-in.
import { supabase } from './supabaseClient.js';

// ¿Hay ya un check-in reciente del mismo paciente?
// Buscamos una fila EN ESPERA (waiting) con el mismo apellido + año
// registrada en los últimos 2 minutos. Sirve para no duplicar cuando
// el paciente pulsa dos veces o vuelve a intentarlo.
// Dos pacientes homónimos que llegan separados SÍ pueden registrarse.
export async function recentDuplicateExists(lastName, birthYear) {
  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('patient_visits')
    .select('id')
    .eq('status', 'waiting')
    .eq('last_name', lastName)
    .eq('birth_year', birthYear)
    .gt('arrived_at', since)
    .limit(1);
  if (error) throw error;
  return data.length > 0;
}

// Registra la llegada de un paciente.
// status y arrived_at los pone la base de datos por defecto
// (status = 'waiting', arrived_at = now()).
export async function checkIn(lastName, birthYear) {
  const { error } = await supabase
    .from('patient_visits')
    .insert({ last_name: lastName, birth_year: birthYear });
  if (error) throw error;
}
