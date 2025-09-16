import React from "react";
import bg2 from "../assets/images/bg2.png";   // импортируем фон через Vite

export default function PersonCard({
                                     person,
                                     onBackToList,
                                     onBackToMap,
                                     onDelete,
                                     onEdit,
                                     isAdmin,
                                     onAdminLogout,
                                   }) {
  const photoSrc = person.photoPath ? `photos://${person.photoPath}` : null;

  return (
      <div
          className="book-container"
          style={{
            backgroundImage: `url(${bg2})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundColor: "#000",
          }}
      >
        {/* Левая страница */}
        <div className="book-page left-page">
          <h1>КНИГА ПАМЯТИ</h1>

          <button className="back-button" onClick={onBackToList}>
            ← Вернуться к списку
          </button>
          <button className="back-button" onClick={onBackToMap}>
            ← Выход на карту мира
          </button>

          {isAdmin && (
              <>
                <button className="edit-button" onClick={onEdit}>
                  ✏️ Редактировать
                </button>
                <button className="delete-button" onClick={onDelete}>
                  🗑 Удалить
                </button>
                <button
                    className="back-button"
                    style={{ marginTop: 8 }}
                    onClick={() => onAdminLogout?.()}
                >
                  ⇦ Выйти из админ-режима
                </button>
              </>
          )}
        </div>

        {/* Правая страница */}
        <div className="book-page right-page person-details">
          {photoSrc && <img src={photoSrc} alt={person.name} className="person-photo" />}
          <h2 style={{ marginBottom: 8 }}>{person.name}</h2>
          {person.birthDate && (
              <div style={{ marginBottom: 8 }}>
                Дата рождения: {person.birthDate.split("-").reverse().join(".")}
              </div>
          )}
          {person.region && <div style={{ marginBottom: 8 }}>Регион: {person.region}</div>}
          {person.biography && <div className="biography-box">{person.biography}</div>}
        </div>
      </div>
  );
}
