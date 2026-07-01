// Lógica de la pantalla del médico: login, panel y tiempo real.
import { supabase } from './supabaseClient.js';
import {
  fetchWaiting,
  fetchHistory,
  callPatient,
  updateDisplayText,
  finishPatient,
  cancelPatient,
} from './api.js';
import { formatTime, formatDuration, escapeHtml } from './utils.js';

// ---- Referencias al DOM ----
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const loginInfo = document.getElementById('login-info');
const forgotBtn = document.getElementById('forgot-btn');
const recoveryView = document.getElementById('recovery-view');
const recoveryForm = document.getElementById('recovery-form');
const newPasswordInput = document.getElementById('new-password');
const recoveryError = document.getElementById('recovery-error');
const recoveryBtn = document.getElementById('recovery-btn');
const logoutBtn = document.getElementById('logout-btn');
const appError = document.getElementById('app-error');
const waitingList = document.getElementById('waiting-list');
const waitingEmpty = document.getElementById('waiting-empty');
const attendingList = document.getElementById('attending-list');
const attendingEmpty = document.getElementById('attending-empty');
const finishedList = document.getElementById('finished-list');
const finishedEmpty = document.getElementById('finished-empty');

let channel = null;
let busy = false;
let recovering = false;

// ---- Texto público por defecto: apellido en mayúsculas ----
function defaultText(p) {
  const custom = (p.display_text || '').trim();
  return custom || (p.last_name || '').toUpperCase();
}

// ================= AUTENTICACIÓN =================

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Entrando…';

  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value,
  });

  if (error) {
    loginError.textContent = 'Correo o contraseña incorrectos.';
    loginError.hidden = false;
    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar';
  }
  // Si va bien, onAuthStateChange se encarga de mostrar el panel.
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
});

// Enviar enlace de recuperación al correo del usuario.
forgotBtn.addEventListener('click', async () => {
  loginError.hidden = true;
  loginInfo.hidden = true;
  const email = emailInput.value.trim();
  if (!email) {
    loginError.textContent = 'Escribe tu correo y vuelve a pulsar “¿Olvidaste la contraseña?”.';
    loginError.hidden = false;
    return;
  }
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname,
  });
  loginInfo.textContent = 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.';
  loginInfo.hidden = false;
});

// Guardar la nueva contraseña (tras abrir el enlace del correo).
recoveryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  recoveryError.hidden = true;
  const pw = newPasswordInput.value;
  if (pw.length < 6) {
    recoveryError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    recoveryError.hidden = false;
    return;
  }
  recoveryBtn.disabled = true;
  recoveryBtn.textContent = 'Guardando…';
  const { error } = await supabase.auth.updateUser({ password: pw });
  recoveryBtn.disabled = false;
  recoveryBtn.textContent = 'Guardar contraseña';
  if (error) {
    recoveryError.textContent = 'No se pudo cambiar la contraseña. Abre de nuevo el enlace del correo.';
    recoveryError.hidden = false;
    return;
  }
  recovering = false;
  history.replaceState(null, '', window.location.pathname);
  showApp();
});

function showLogin() {
  unsubscribe();
  recoveryView.hidden = true;
  appView.hidden = true;
  loginView.hidden = false;
  waitingList.innerHTML = '';
  attendingList.innerHTML = '';
  finishedList.innerHTML = '';
}

function showApp() {
  recoveryView.hidden = true;
  loginView.hidden = true;
  appView.hidden = false;
  loginBtn.disabled = false;
  loginBtn.textContent = 'Entrar';
  loginForm.reset();
  loadData();
  subscribe();
}

function showRecovery() {
  loginView.hidden = true;
  appView.hidden = true;
  recoveryView.hidden = false;
  recoveryError.hidden = true;
  newPasswordInput.value = '';
}

function route(session) {
  if (session) showApp();
  else showLogin();
}

// ================= DATOS =================

async function loadData() {
  try {
    const [waiting, history] = await Promise.all([fetchWaiting(), fetchHistory()]);
    const attending = history
      .filter((p) => p.status === 'called')
      .sort((a, b) => new Date(b.called_at) - new Date(a.called_at));
    const finished = history
      .filter((p) => p.status === 'done')
      .sort((a, b) => new Date(b.done_at) - new Date(a.done_at));
    renderWaiting(waiting);
    renderAttending(attending);
    renderFinished(finished);
    appError.hidden = true;
  } catch (err) {
    console.error('Error al cargar pacientes:', err);
    appError.textContent = 'No se pudieron cargar los pacientes.';
    appError.hidden = false;
  }
}

// ---- Tiempo real: cualquier cambio recarga las listas ----
function subscribe() {
  if (channel) return;
  channel = supabase
    .channel('patient_visits_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'patient_visits' },
      () => loadData(),
    )
    .subscribe();
}

function unsubscribe() {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
}

// ================= RENDER =================

// Botones de sala. Si se pasa selectedRoom, la sala asignada se marca
// y las demás se muestran atenuadas.
function roomButtons(id, selectedRoom = null) {
  return [1, 2, 3]
    .map((n) => {
      const cls = ['room-btn', `room-${n}`];
      if (selectedRoom != null) cls.push(n === selectedRoom ? 'selected' : 'dim');
      return `<button class="${cls.join(' ')}" data-action="call" data-id="${id}" data-room="${n}">Sala ${n}</button>`;
    })
    .join('');
}

function patientName(p) {
  return `${escapeHtml((p.last_name || '').toUpperCase())}, ${p.birth_year}`;
}

function renderWaiting(list) {
  waitingEmpty.hidden = list.length > 0;
  waitingList.innerHTML = list
    .map((p) => {
      const dflt = escapeHtml(defaultText(p));
      return `
      <article class="card patient waiting">
        <div class="patient-head">
          <span class="patient-name">${patientName(p)}</span>
          <span class="status waiting">En espera</span>
        </div>
        <span class="patient-meta">Llegada ${formatTime(p.arrived_at)}</span>
        <label class="text-field">
          <span>Texto en la TV</span>
          <input id="txt-${p.id}" type="text" value="${dflt}" data-fallback="${dflt}" />
        </label>
        <div class="rooms">${roomButtons(p.id)}</div>
      </article>`;
    })
    .join('');
}

function renderAttending(list) {
  attendingEmpty.hidden = list.length > 0;
  attendingList.innerHTML = list
    .map((p) => {
      const dflt = escapeHtml(defaultText(p));
      const roomCls = p.assigned_room ? ` room-${p.assigned_room}` : '';
      const meta = `Llegada ${formatTime(p.arrived_at)} · Llamado ${formatTime(p.called_at)}`;
      return `
      <article class="card patient attending${roomCls}">
        <div class="patient-head">
          <span class="patient-name">${patientName(p)}</span>
          <span class="status attending">Atendiendo</span>
        </div>
        <span class="patient-meta">${meta}</span>
        <label class="text-field">
          <span>Texto en la TV</span>
          <input id="txt-${p.id}" type="text" value="${dflt}" data-fallback="${dflt}"
                 data-action="text" data-id="${p.id}" />
        </label>
        <div class="rooms">${roomButtons(p.id, p.assigned_room)}</div>
        <div class="row-actions">
          <button class="finish-btn" data-action="finish" data-id="${p.id}">Finalizar</button>
          <button class="cancel-btn" data-action="cancel" data-id="${p.id}">Anular</button>
        </div>
      </article>`;
    })
    .join('');
}

function renderFinished(list) {
  finishedEmpty.hidden = list.length > 0;
  finishedList.innerHTML = list
    .map((p) => {
      const meta = `Llegada ${formatTime(p.arrived_at)} · Llamado ${formatTime(p.called_at)}`;
      const chip = p.assigned_room
        ? `<span class="room-chip room-${p.assigned_room}">Sala ${p.assigned_room}</span>`
        : '';
      const dur = formatDuration(p.called_at, p.done_at);
      return `
      <article class="card patient done">
        <div class="patient-head">
          <span class="patient-name">${patientName(p)}</span>
          <span class="status done">Finalizada</span>
        </div>
        <span class="patient-meta">${meta}</span>
        <div class="done-info">
          ${chip}
          <span class="duration">Duración: ${dur}</span>
        </div>
      </article>`;
    })
    .join('');
}

// ================= ACCIONES =================

// Un clic en cualquier botón del panel.
appView.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn || busy) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;
  busy = true;

  try {
    if (action === 'call') {
      const room = parseInt(btn.dataset.room, 10);
      const input = document.getElementById('txt-' + id);
      const text = input ? input.value.trim() || input.dataset.fallback : '';
      await callPatient(id, room, text);
    } else if (action === 'finish') {
      await finishPatient(id);
    } else if (action === 'cancel') {
      await cancelPatient(id);
    }
  } catch (err) {
    console.error('Error en la acción:', err);
    appError.textContent = 'No se pudo completar la acción.';
    appError.hidden = false;
  } finally {
    busy = false;
  }
  // El tiempo real recargará las listas; recargamos también por si acaso.
  loadData();
});

// Editar el texto público de un paciente ya llamado.
appView.addEventListener('change', async (e) => {
  const input = e.target.closest('input[data-action="text"]');
  if (!input) return;
  try {
    await updateDisplayText(input.dataset.id, input.value.trim() || input.dataset.fallback);
  } catch (err) {
    console.error('Error al guardar el texto:', err);
  }
});

// ================= ARRANQUE =================

// Si llegamos desde el enlace de recuperación, mostramos el formulario
// de nueva contraseña en vez del panel.
if (window.location.hash.includes('type=recovery')) {
  recovering = true;
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    recovering = true;
    showRecovery();
    return;
  }
  if (recovering) return; // esperamos a que guarde la nueva contraseña
  route(session);
});

(async () => {
  if (recovering) {
    showRecovery();
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  route(session);
})();
