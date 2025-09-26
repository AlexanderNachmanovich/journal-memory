import React, { useEffect, useState } from "react";
import bg2 from "../assets/images/bg2.png";   // фон книги
import PhotoViewer from "./PhotoViewer";      // ✅ компонент попапа

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
  const [viewerIndex, setViewerIndex] = useState(null); // ✅ состояние для попапа

  // Подставляем фон книги
  useEffect(() => {
    document.documentElement.style.setProperty("--book-bg", `url(${bg2})`);
  }, []);

  return (
      <div className="book-container">
        <div className="book-wrapper">
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
            {photoSrc && (
                <img src={photoSrc} alt={person.name} className="person-photo" />
            )}
            <h2 style={{ marginBottom: 8 }}>{person.name}</h2>

            {person.birthDate && (
                <div style={{ marginBottom: 8 }}>
                  Дата рождения:{" "}
                  {person.birthDate.split("-").reverse().join(".")}
                </div>
            )}

            {person.region && (
                <div style={{ marginBottom: 8 }}>Регион: {person.region}</div>
            )}

            {/* Биография + миниатюры фото */}
            {(person.biography || person.extraPhotos?.length > 0) && (
                <div className="biography-box">
                  {person.biography && <div>{person.biography}</div>}

                  {person.extraPhotos?.length > 0 && (
                      <div className="extra-photos">
                        {person.extraPhotos.map((p, idx) => (
                            <img
                                key={p.id || idx}
                                src={`photos://${p.filePath}`}
                                alt={`${person.name} фото ${idx + 1}`}
                                className="extra-photo"
                                onClick={() => setViewerIndex(idx)} // ✅ открываем попап
                            />
                        ))}
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>

        {/* Попап просмотра фото */}
        {viewerIndex !== null && Array.isArray(person.extraPhotos) && (
            <PhotoViewer
                photos={person.extraPhotos}
                startIndex={viewerIndex}
                onClose={() => setViewerIndex(null)}
            />
        )}
      </div>
  );
}
