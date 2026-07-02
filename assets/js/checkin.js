// Lógica de la pantalla de check-in.
import { t, getLang, setLang, LANGS } from './i18n.js';
import { cleanLastName, isValidBirthYear } from './utils.js';
import { recentDuplicateExists, checkIn } from './api.js';

// ---- Referencias al DOM ----
const form = document.getElementById('checkin-form');
const lastNameInput = document.getElementById('last-name');
const birthYearInput = document.getElementById('birth-year');
const submitBtn = document.getElementById('submit-btn');
const errorBox = document.getElementById('error');
const formView = document.getElementById('form-view');
const confirmView = document.getElementById('confirm-view');
const againBtn = document.getElementById('again-btn');
const duplicateView = document.getElementById('duplicate-view');
const dupAlreadyBtn = document.getElementById('dup-already');
const dupAgainBtn = document.getElementById('dup-again');
const langButtons = document.querySelectorAll('.lang-btn');
const clockEl = document.getElementById('clock');

let autoResetTimer = null;
let sending = false;
let currentErrorKey = null; // qué error se está mostrando, para poder retraducirlo
let pending = null; // datos a la espera de confirmar un posible duplicado

// ---- Idioma ----
function applyLanguage(lang) {
  setLang(lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n, lang);
  });
  // Mientras se envía, el botón muestra "enviando"; si no, "he llegado".
  submitBtn.textContent = sending ? t('sending') : t('arrive');
  // Si hay un error visible, lo retraducimos al nuevo idioma.
  if (currentErrorKey && !errorBox.hidden) {
    errorBox.textContent = t(currentErrorKey, lang);
  }
  langButtons.forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

// ---- Errores ----
function showError(key) {
  currentErrorKey = key;
  errorBox.textContent = t(key);
  errorBox.hidden = false;
}
function clearError() {
  currentErrorKey = null;
  errorBox.hidden = true;
}

// ---- Botón en estado "enviando" (evita el doble toque) ----
function setSending(value) {
  sending = value;
  submitBtn.disabled = value;
  submitBtn.textContent = value ? t('sending') : t('arrive');
}

// El campo de año solo admite dígitos (máx. 4).
birthYearInput.addEventListener('input', () => {
  birthYearInput.value = birthYearInput.value.replace(/\D/g, '').slice(0, 4);
});

// ---- Envío del formulario ----
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const lastName = cleanLastName(lastNameInput.value);
  const birthYear = birthYearInput.value.trim();

  if (!lastName) {
    showError('errLastName');
    lastNameInput.focus();
    return;
  }
  if (!isValidBirthYear(birthYear)) {
    showError('errYear');
    birthYearInput.focus();
    return;
  }

  setSending(true);

  try {
    const dup = await recentDuplicateExists(lastName, parseInt(birthYear, 10));
    if (dup) {
      // Guardamos los datos y preguntamos antes de insertar.
      pending = { lastName, birthYear: parseInt(birthYear, 10) };
      showDuplicate();
      return;
    }
    await checkIn(lastName, parseInt(birthYear, 10));
    showConfirmation();
  } catch (err) {
    console.error('Error al registrar la llegada:', err);
    showError('errNetwork');
    setSending(false);
  }
});

// ---- Posible duplicado ----
function showDuplicate() {
  formView.hidden = true;
  duplicateView.hidden = false;
  dupAlreadyBtn.disabled = false;
  dupAgainBtn.disabled = false;
  // Si nadie decide, vuelve al formulario tras 30 s.
  clearTimeout(autoResetTimer);
  autoResetTimer = setTimeout(resetForm, 30000);
}

// "No, ya estoy registrado": no se inserta, solo se confirma.
dupAlreadyBtn.addEventListener('click', () => {
  pending = null;
  showConfirmation();
});

// "Sí, registrarme de nuevo": se inserta un nuevo registro.
dupAgainBtn.addEventListener('click', async () => {
  if (!pending) return;
  dupAlreadyBtn.disabled = true;
  dupAgainBtn.disabled = true;
  try {
    await checkIn(pending.lastName, pending.birthYear);
    pending = null;
    showConfirmation();
  } catch (err) {
    console.error('Error al registrar la llegada:', err);
    duplicateView.hidden = true;
    formView.hidden = false;
    showError('errNetwork');
    setSending(false);
  }
});

// ---- Confirmación ----
function showConfirmation() {
  clearTimeout(autoResetTimer);
  formView.hidden = true;
  duplicateView.hidden = true;
  confirmView.hidden = false;
  // Modo kiosko: vuelve solo al formulario tras 8 s para el siguiente paciente.
  autoResetTimer = setTimeout(resetForm, 8000);
}

function resetForm() {
  clearTimeout(autoResetTimer);
  pending = null;
  form.reset();
  clearError();
  setSending(false);
  confirmView.hidden = true;
  duplicateView.hidden = true;
  formView.hidden = false;
  lastNameInput.focus();
}

againBtn.addEventListener('click', resetForm);

// ---- Reloj (hora local de Ychoux, Francia) ----
function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString('es-ES', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ---- Arranque ----
applyLanguage(getLang());
setSending(false);
updateClock();
setInterval(updateClock, 1000);
