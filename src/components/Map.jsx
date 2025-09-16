import React, { useState } from "react";
import LoginModal from "./LoginModal";

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

  return (
      <div className="map">
        <img
            className="map-image"
            src="./images/background.png"  // ← напрямую из public/
            alt="map"
            draggable={false}
        />

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
      </div>
  );
}
