// Operaciones contra la base de datos.
import { supabase } from './supabaseClient.js';
import { startOfTodayParisISO } from './utils.js';

// ¿Hay ya un check-in reciente del mismo paciente?
// Buscamos una fila EN ESPERA (waiting) con el mismo apellido + año
// registrada en los últimos 5 minutos.
export async function recentDuplicateExists(lastName, birthYear) {
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
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

// ---- Operaciones de la pantalla del médico ----

// Cola de pacientes en espera, el que llegó antes primero.
export async function fetchWaiting() {
  const { data, error } = await supabase
    .from('patient_visits')
    .select('*')
    .eq('status', 'waiting')
    .order('arrived_at', { ascending: true });
  if (error) throw error;
  return data;
}

// Historial del día: llamados y finalizados de hoy (hora de Ychoux),
// el llamado más reciente primero.
export async function fetchHistory() {
  const { data, error } = await supabase
    .from('patient_visits')
    .select('*')
    .in('status', ['called', 'done'])
    .gte('called_at', startOfTodayParisISO())
    .order('called_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Llama a un paciente a una sala (o lo re-llama a otra sala).
// Marca status = 'called', guarda sala, texto público y la hora del llamado.
export async function callPatient(id, room, displayText) {
  const { error } = await supabase
    .from('patient_visits')
    .update({
      status: 'called',
      assigned_room: room,
      display_text: displayText,
      called_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

// Cambia solo el texto público (sin volver a llamar).
export async function updateDisplayText(id, displayText) {
  const { error } = await supabase
    .from('patient_visits')
    .update({ display_text: displayText })
    .eq('id', id);
  if (error) throw error;
}

// Finaliza la consulta de un paciente.
export async function finishPatient(id) {
  const { error } = await supabase
    .from('patient_visits')
    .update({ status: 'done', done_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// Anula un registro (llegada errónea, paciente que se fue). No se borra.
export async function cancelPatient(id) {
  const { error } = await supabase
    .from('patient_visits')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}
