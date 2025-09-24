import React, { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
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
  const [clickCount, setClickCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

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

  // 👉 обработка невидимой кнопки выхода
  const handleSecretClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      setShowHint(true);

      if (newCount >= 7) {
        setClickCount(0);
        setShowHint(false);
        window.api.appQuit(); // выходим
      }

      return newCount;
    });
  };

  // 👉 сброс счётчика, если пауза дольше 4 сек
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
        setShowHint(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

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

        {/* 🔴 Невидимая зона выхода */}
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
            onClick={handleSecretClick}
        />

        {/* 🔵 Индикатор количества кликов */}
        {showHint && (
            <div
                style={{
                  position: "fixed",
                  bottom: 80,
                  right: 10,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  zIndex: 100000,
                }}
            >
              🔑 {clickCount}/7
            </div>
        )}
      </div>
  );
}
