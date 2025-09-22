import React, { useState, useRef } from "react";
import LoginModal from "./LoginModal";

// ✅ импортируем картинку через Vite
import bg from "../assets/images/bg.png";

const REGIONS = [
  "Ангола",
  "Афганистан",
  "Нагорный Карабах",
  "Сирия",
  "Таджикистан",
  "Чечня",
  "Эфиопия",
  "Зона СВО",
];

export default function Map({ onSelect, isAdmin, onAdminLogin, onAdminLogout }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const doLogin = async (pwd) => {
    const res = await onAdminLogin?.(pwd);
    if (res?.ok) setLoginOpen(false);
    return res;
  };

  const openLogin = (e) => {
    e.stopPropagation();
    setLoginOpen(true);
  };

  const logout = (e) => {
    e.stopPropagation();
    onAdminLogout?.();
  };

  // 👉 скрытая кнопка выхода
  const handleExitDown = () => {
    setProgress(0);
    const duration = 7000; // 7 секунд
    const start = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(intervalRef.current);
        window.api.appQuit();
      }
    }, 100);

    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      window.api.appQuit();
    }, duration);
  };

  const handleExitUp = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    setProgress(0);
  };

  return (
      <div className="map">
        {/* ✅ фон */}
        <img className="map-image" src={bg} alt="map" draggable={false} />

        <div className="region-buttons">
          {REGIONS.map((r) => (
              <button
                  key={r}
                  className="region-button"
                  onClick={() => onSelect(r)}
                  type="button"
              >
                {r}
              </button>
          ))}
        </div>

        {!isAdmin ? (
            <button
                type="button"
                className="admin-fab"
                title="Режим администратора"
                onClick={openLogin}
                onMouseDown={openLogin}
                style={{
                  zIndex: 2147483647,
                  pointerEvents: "auto",
                }}
            >
              🔐
            </button>
        ) : (
            <button
                type="button"
                className="admin-fab"
                title="Выйти из админ-режима"
                onClick={logout}
                onMouseDown={logout}
                style={{
                  zIndex: 2147483647,
                  pointerEvents: "auto",
                }}
            >
              🚪
            </button>
        )}

        {loginOpen && (
            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onSubmit={doLogin}
            />
        )}

        {/* 🔴 Скрытая кнопка выхода */}
        <div
            style={{
              position: "fixed",
              bottom: 10,
              right: 10,
              width: 60,
              height: 60,
              opacity: 0, // невидимая зона клика
              zIndex: 99999,
              cursor: "pointer",
            }}
            onMouseDown={handleExitDown}
            onMouseUp={handleExitUp}
            onMouseLeave={handleExitUp}
        />

        {/* 🔵 Индикатор круга */}
        {progress > 0 && (
            <svg
                style={{
                  position: "fixed",
                  bottom: 10,
                  right: 10,
                  width: 60,
                  height: 60,
                  zIndex: 100000,
                  pointerEvents: "none",
                }}
            >
              <circle
                  cx="30"
                  cy="30"
                  r="28"
                  stroke="red"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - progress)}
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
        )}
      </div>
  );
}
