import React, { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
import bg from "../assets/images/bg.png";

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
        {/* контейнер с фиксированным соотношением 16:9 */}
        <div className="map-container">
          <img className="map-image" src={bg} alt="map" draggable={false} />

          {/* кнопки — теперь абсолютные, с top/left в % */}
          <button className="region-button btn-angola" onClick={() => onSelect("Ангола")}>Ангола</button>
          <button className="region-button btn-afghanistan" onClick={() => onSelect("Афганистан")}>Афганистан</button>
          <button className="region-button btn-karabakh" onClick={() => onSelect("Нагорный Карабах")}>Нагорный Карабах</button>
          <button className="region-button btn-syria" onClick={() => onSelect("Сирия")}>Сирия</button>
          <button className="region-button btn-tajikistan" onClick={() => onSelect("Таджикистан")}>Таджикистан</button>
          <button className="region-button btn-chechnya" onClick={() => onSelect("Чечня")}>Чечня</button>
          <button className="region-button btn-ethiopia" onClick={() => onSelect("Эфиопия")}>Эфиопия</button>
          <button className="region-button btn-svo" onClick={() => onSelect("Зона СВО")}>Зона СВО</button>
        </div>

        {/* админ FAB */}
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
              opacity: 0,
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
