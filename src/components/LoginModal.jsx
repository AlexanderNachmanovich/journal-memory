import React, { useEffect, useRef, useState } from "react";

/**
 * Модальное окно входа администратора.
 *
 * Props:
 *  - open: boolean               — показывать ли модалку
 *  - onClose: () => void         — закрыть (крестик / фон / Отмена)
 *  - onSubmit: (password) =>     — асинхронный вход, должен вернуть { ok: boolean }
 *              Promise<{ok:boolean}>
 *  - error?: string              — внешняя ошибка (неверный пароль и т.п.)
 */
export default function LoginModal({ open, onClose, onSubmit, error }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const inputRef = useRef(null);

  // Фокус на поле при открытии
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setLocalError("");
    } else {
      setPassword("");
      setSubmitting(false);
    }
  }, [open]);

  // Закрытие по ESC
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter") handleSubmit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, password]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!onSubmit || submitting) return;
    setSubmitting(true);
    setLocalError("");
    try {
      const res = await onSubmit(password);
      if (!res || res.ok !== true) {
        setLocalError("Неверный пароль");
        setSubmitting(false);
      }
      // при успехе модалка закрывается в App.jsx (мы там закрываем её)
    } catch (e) {
      setLocalError("Ошибка входа");
      setSubmitting(false);
    }
  };

  if (!open) return null;

  // Немного инлайновых стилей, чтобы работало сразу (даже без CSS-классов)
  const s = {
    backdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    },
    card: {
      width: "min(480px, 92vw)",
      background: "#f0e6d2", // «бумага»
      border: "2px solid #8b5e3c",
      borderRadius: 12,
      boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
      padding: 24,
      fontFamily: "var(--font-ui, IBMPlexMono, monospace)",
      color: "#2e1b0e",
    },
    title: { margin: "0 0 14px", fontWeight: 700, fontSize: 20 },
    label: { fontSize: 14, marginBottom: 6, display: "block" },
    row: { display: "flex", gap: 8, alignItems: "center" },
    input: {
      flex: 1,
      padding: "10px 12px",
      fontSize: 14,
      border: "1px solid #8b5e3c",
      borderRadius: 8,
      background: "#f5f0e6",
      outline: "none",
    },
    eyeBtn: {
      background: "#c19a6b",
      border: "2px solid #8b5e3c",
      borderRadius: 8,
      padding: "8px 10px",
      cursor: "pointer",
      fontWeight: 700,
      color: "#2e1b0e",
    },
    error: { color: "#7a1f1f", marginTop: 8, minHeight: 20 },
    actions: { display: "flex", gap: 12, marginTop: 18, justifyContent: "flex-end" },
    btn: {
      background: "#c19a6b",
      border: "2px solid #8b5e3c",
      borderRadius: 8,
      padding: "10px 18px",
      fontSize: 16,
      fontWeight: 700,
      color: "#2e1b0e",
      cursor: "pointer",
      boxShadow: "2px 2px 6px rgba(0,0,0,0.35)",
    },
    btnGhost: {
      background: "#e8dcc7",
    },
    btnDisabled: {
      opacity: 0.6,
      pointerEvents: "none",
    },
  };

  return (
      <div style={s.backdrop} onClick={onClose}>
        <div style={s.card} onClick={(e) => e.stopPropagation()}>
          <h3 style={s.title}>Вход администратора</h3>

          <label style={s.label} htmlFor="admin-pass">
            Пароль
          </label>

          <div style={s.row}>
            <input
                id="admin-pass"
                ref={inputRef}
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль…"
                style={s.input}
                autoComplete="current-password"
                disabled={submitting}
            />
            <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShow((x) => !x)}
                aria-label={show ? "Скрыть пароль" : "Показать пароль"}
            >
              {show ? "🙈" : "👁"}
            </button>
          </div>

          <div style={s.error}>{error || localError}</div>

          <div style={s.actions}>
            <button
                type="button"
                style={{ ...s.btn, ...s.btnGhost }}
                onClick={onClose}
                disabled={submitting}
            >
              ✖ Отмена
            </button>
            <button
                type="button"
                style={{ ...s.btn, ...(submitting ? s.btnDisabled : null) }}
                onClick={handleSubmit}
                disabled={submitting}
            >
              {submitting ? "Входим…" : "🔐 Войти"}
            </button>
          </div>
        </div>
      </div>
  );
}
