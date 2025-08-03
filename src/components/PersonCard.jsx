import React from 'react';

export default function PersonCard({ person, onBackToList, onBackToMap, onDelete, onEdit }) {
  // Определяем источник фото: сначала photoURL (загруженное), потом photo (имя файла)
  const photoSrc = person.photoURL || (person.photo ? `/assets/images/${person.photo}` : null);

  return (
      <div className="person-card">
        <div
            className="button-group"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '20px'
            }}
        >
          <button className="back-button" onClick={onBackToList}>
            ← Вернуться к списку
          </button>
          <button className="back-button" onClick={onBackToMap}>
            ← Вернуться к карте
          </button>
          <button className="edit-button" onClick={onEdit}>
            ✏️ Редактировать
          </button>
          <button className="delete-button" onClick={onDelete}>
            🗑 Удалить
          </button>
        </div>

        <h2>{person.lastName} {person.firstName} {person.middleName}</h2>

        {photoSrc && (
            <img
                src={photoSrc}
                alt={`${person.lastName} ${person.firstName}`}
                className="person-photo"
            />
        )}

        <p>{person.bio}</p>

        {person.conflict && (
            <p><strong>Участие в конфликте:</strong> {person.conflict}</p>
        )}
      </div>
  );
}
