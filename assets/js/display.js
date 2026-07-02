// Pantalla de sala de espera (TV): muestra el llamado actual, los últimos
// llamados y reproduce un sonido cuando hay un llamado nuevo.
import { supabase } from './supabaseClient.js';
import { fetchRecentCalls } from './api.js';
import { escapeHtml } from './utils.js';

const clockEl = document.getElementById('clock');
const currentBlock = document.getElementById('current-block');
const currentName = document.getElementById('current-name');
const currentSalle = document.getElementById('current-salle');
const lastSection = document.getElementById('last-section');
const lastList = document.getElementById('last-list');
const overlay = document.getElementById('overlay');
const chime = document.getElementById('chime');

let lastCallKey = null; // id + hora del llamado actual, para detectar novedades
let unlocked = false;
let channel = null;

// Texto público: el editado por el médico o, si no, el apellido en mayúsculas.
function displayName(p) {
  const custom = (p.display_text || '').trim();
  return custom || (p.last_name || '').toUpperCase();
}

// ---- Reloj (hora local de Ychoux) ----
function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ---- Sonido ----
function playChime() {
  if (!unlocked) return;
  try {
    chime.currentTime = 0;
    chime.play();
  } catch (e) {
    /* ignorar */
  }
}

// Desbloqueo único: activa el audio y entra en pantalla completa.
function unlock() {
  if (unlocked) return;
  unlocked = true;
  chime.play().then(() => { chime.pause(); chime.currentTime = 0; }).catch(() => {});
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  overlay.hidden = true;
}
overlay.addEventListener('click', unlock);
document.addEventListener('keydown', unlock);

// ---- Render ----
function render(calls) {
  if (!calls.length) {
    currentBlock.hidden = true;
    lastSection.hidden = true;
    lastCallKey = null;
    return;
  }

  const current = calls[0];
  const key = `${current.id}|${current.called_at}`;
  const isNew = lastCallKey !== null && key !== lastCallKey;

  currentBlock.hidden = false;
  currentName.textContent = displayName(current);
  currentSalle.textContent = current.assigned_room ? `SALLE ${current.assigned_room}` : '';
  currentSalle.className = `salle room-${current.assigned_room}`;

  const rest = calls.slice(1, 4);
  lastSection.hidden = rest.length === 0;
  lastList.innerHTML = rest
    .map(
      (p) => `
      <li class="last-item">
        <span class="last-name">${escapeHtml(displayName(p))}</span>
        <span class="last-salle room-${p.assigned_room}">Salle ${p.assigned_room}</span>
      </li>`,
    )
    .join('');

  if (isNew) {
    playChime();
    currentBlock.classList.remove('flash');
    void currentBlock.offsetWidth; // reinicia la animación
    currentBlock.classList.add('flash');
  }
  lastCallKey = key;
}

async function load() {
  try {
    render(await fetchRecentCalls(4));
  } catch (err) {
    console.error('Error al cargar los llamados:', err);
  }
}

// ---- Tiempo real ----
function subscribe() {
  channel = supabase
    .channel('display_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'patient_visits' },
      () => load(),
    )
    .subscribe();
}

// ---- Arranque ----
updateClock();
setInterval(updateClock, 1000);
load();
subscribe();
