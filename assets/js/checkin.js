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
const langButtons = document.querySelectorAll('.lang-btn');

let autoResetTimer = null;
let sending = false;

// ---- Idioma ----
function applyLanguage(lang) {
  setLang(lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n, lang);
  });
  // Mientras se envía, el botón muestra "enviando"; si no, "he llegado".
  submitBtn.textContent = sending ? t('sending') : t('arrive');
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
  errorBox.textContent = t(key);
  errorBox.hidden = false;
}
function clearError() {
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
    if (!dup) {
      await checkIn(lastName, parseInt(birthYear, 10));
    }
    // Tanto si era duplicado como si se insertó, el paciente ve confirmación.
    showConfirmation();
  } catch (err) {
    console.error('Error al registrar la llegada:', err);
    showError('errNetwork');
    setSending(false);
  }
});

// ---- Confirmación ----
function showConfirmation() {
  formView.hidden = true;
  confirmView.hidden = false;
  // Modo kiosko: vuelve solo al formulario tras 8 s para el siguiente paciente.
  autoResetTimer = setTimeout(resetForm, 8000);
}

function resetForm() {
  clearTimeout(autoResetTimer);
  form.reset();
  clearError();
  setSending(false);
  confirmView.hidden = true;
  formView.hidden = false;
  lastNameInput.focus();
}

againBtn.addEventListener('click', resetForm);

// ---- Arranque ----
applyLanguage(getLang());
setSending(false);
