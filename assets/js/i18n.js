// Textos de la pantalla de check-in en español, francés e inglés.
// El idioma elegido se recuerda en el navegador (localStorage).

const STRINGS = {
  es: {
    welcome: 'BIENVENIDO',
    instruction: 'Por favor, indique sus datos:',
    lastName: 'APELLIDO',
    birthYear: 'AÑO DE NACIMIENTO',
    arrive: 'HE LLEGADO',
    sending: 'Un momento…',
    errLastName: 'Por favor, escriba su apellido.',
    errYear: 'Escriba su año de nacimiento (4 cifras).',
    errNetwork: 'No se ha podido registrar. Inténtelo de nuevo.',
    confirmTitle: 'Gracias',
    confirmText: 'Le llamaremos en breve. Tome asiento en la sala de espera.',
    again: 'Nuevo paciente',
    dupTitle: '¿Registrarte de nuevo?',
    dupText: 'Ya hay un registro reciente con estos datos.',
    dupAlready: 'No, ya estoy registrado',
    dupAgain: 'Sí, registrarme de nuevo',
  },
  fr: {
    welcome: 'BIENVENUE',
    instruction: 'Veuillez saisir vos informations :',
    lastName: 'NOM DE FAMILLE',
    birthYear: 'ANNÉE DE NAISSANCE',
    arrive: 'SIGNALER MON ARRIVÉE',
    sending: 'Un instant…',
    errLastName: 'Veuillez saisir votre nom de famille.',
    errYear: 'Saisissez votre année de naissance (4 chiffres).',
    errNetwork: "L'enregistrement a échoué. Veuillez réessayer.",
    confirmTitle: 'Merci',
    confirmText: 'Nous vous appellerons prochainement. Veuillez patienter dans la salle d’attente.',
    again: 'Nouveau patient',
    dupTitle: 'Vous enregistrer à nouveau ?',
    dupText: 'Un enregistrement récent existe déjà avec ces données.',
    dupAlready: 'Non, je suis déjà enregistré',
    dupAgain: 'Oui, m’enregistrer à nouveau',
  },
  en: {
    welcome: 'WELCOME',
    instruction: 'Please enter your details:',
    lastName: 'SURNAME',
    birthYear: 'YEAR OF BIRTH',
    arrive: 'I HAVE ARRIVED',
    sending: 'One moment…',
    errLastName: 'Please enter your surname.',
    errYear: 'Enter your year of birth (4 digits).',
    errNetwork: 'Could not register. Please try again.',
    confirmTitle: 'Thank you',
    confirmText: 'We will call you shortly. Please take a seat in the waiting room.',
    again: 'New patient',
    dupTitle: 'Register again?',
    dupText: 'There is already a recent registration with these details.',
    dupAlready: 'No, I am already registered',
    dupAgain: 'Yes, register me again',
  },
};

export const LANGS = ['es', 'fr', 'en'];
const STORAGE_KEY = 'checkin_lang';

export function getLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return LANGS.includes(saved) ? saved : 'es';
}

export function setLang(lang) {
  if (LANGS.includes(lang)) localStorage.setItem(STORAGE_KEY, lang);
}

// Devuelve el texto de una clave en el idioma indicado (o el actual).
export function t(key, lang = getLang()) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key] || key;
}
