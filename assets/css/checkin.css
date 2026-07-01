/* Pantalla de check-in: pensada para tablet en modo kiosko.
   Letras grandes, mucho aire, botón verde protagonista. */

.kiosk {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 4vw, 48px);
  position: relative;
}

/* ---- Reloj (arriba a la izquierda) ---- */
.clock {
  position: absolute;
  top: clamp(16px, 3vw, 32px);
  left: clamp(16px, 3vw, 32px);
  font-size: clamp(24px, 3.2vw, 36px);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

/* ---- Selector de idioma ---- */
.lang-switch {
  position: absolute;
  top: clamp(16px, 3vw, 32px);
  right: clamp(16px, 3vw, 32px);
  display: flex;
  gap: 8px;
}

.lang-btn {
  border: 1.5px solid var(--line);
  background: var(--surface);
  color: var(--muted);
  font-size: clamp(15px, 2.2vw, 20px);
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 10px 16px;
  border-radius: 999px;
  min-width: 56px;
  min-height: 48px;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.lang-btn.active {
  border-color: var(--brand);
  background: var(--brand);
  color: #fff;
}

/* ---- Tarjeta central ---- */
.card {
  background: var(--surface);
  width: 100%;
  max-width: 680px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: clamp(32px, 6vw, 72px);
  text-align: center;
}

.welcome {
  font-size: clamp(38px, 7vw, 64px);
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--ink);
}

.instruction {
  font-size: clamp(24px, 3.6vw, 36px);
  color: var(--muted);
  margin-top: 14px;
  margin-bottom: clamp(28px, 5vw, 48px);
}

/* ---- Campos del formulario ---- */
.field {
  display: block;
  text-align: left;
  margin-bottom: clamp(20px, 3.5vw, 32px);
}

.field-label {
  display: block;
  font-size: clamp(20px, 3vw, 30px);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin-bottom: 10px;
}

.field input {
  width: 100%;
  font-size: clamp(26px, 5vw, 40px);
  font-weight: 600;
  color: var(--ink);
  background: #f7fafb;
  border: 2px solid var(--line);
  border-radius: 14px;
  padding: clamp(16px, 3vw, 24px);
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.field input:focus {
  border-color: var(--brand);
  background: #fff;
}

/* ---- Mensaje de error ---- */
.error {
  color: var(--error);
  font-size: clamp(21px, 3.2vw, 30px);
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

/* ---- Botón grande verde ---- */
.arrive-btn {
  width: 100%;
  background: var(--action);
  color: var(--action-ink);
  border: none;
  border-radius: 16px;
  font-size: clamp(28px, 5.5vw, 46px);
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: clamp(22px, 4.5vw, 36px);
  margin-top: 8px;
  box-shadow: 0 8px 24px rgba(21, 128, 61, 0.28);
  transition: transform 0.08s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.arrive-btn:hover {
  background: var(--action-hover);
}

.arrive-btn:active {
  transform: translateY(2px);
}

.arrive-btn:disabled {
  background: #9bb8a6;
  box-shadow: none;
  cursor: default;
}

/* ---- Vista de confirmación ---- */
.confirm {
  animation: rise 0.4s ease both;
}

.confirm-title {
  font-size: clamp(40px, 8vw, 68px);
  font-weight: 800;
  margin-top: 8px;
}

.confirm-text {
  font-size: clamp(20px, 3.4vw, 30px);
  color: var(--muted);
  margin-top: 18px;
  line-height: 1.4;
  max-width: 30ch;
  margin-inline: auto;
}

.again-btn {
  margin-top: clamp(32px, 5vw, 48px);
  background: none;
  border: 2px solid var(--line);
  color: var(--muted);
  font-size: clamp(17px, 2.6vw, 22px);
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 999px;
  min-height: 56px;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.again-btn:hover {
  border-color: var(--brand);
  color: var(--brand);
}

/* ---- Check de confirmación ---- */
.check-mark {
  width: clamp(88px, 16vw, 120px);
  margin: 0 auto 8px;
}

.check-mark svg {
  width: 100%;
  height: 100%;
}

.check-mark circle {
  stroke: var(--action);
  stroke-width: 3;
  stroke-dasharray: 151;
  stroke-dashoffset: 151;
  animation: draw 0.5s ease forwards;
}

.check-mark path {
  stroke: var(--action);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: draw 0.4s 0.35s ease forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* En pantallas anchas (tablet horizontal) damos algo más de aire. */
@media (min-width: 900px) {
  .card {
    padding: 72px 88px;
  }
}

/* Respeta a quien prefiere menos movimiento. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
  .check-mark circle,
  .check-mark path {
    stroke-dashoffset: 0;
  }
}
