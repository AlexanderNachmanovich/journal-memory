import React, { useState, useEffect } from 'react';

const REGIONS = [
  'Север', 'Юг', 'Запад', 'Восток', 'Центр',
  'Северо-Запад', 'Северо-Восток', 'Юго-Запад', 'Юго-Восток'
];

export default function PersonForm({ initialData = {}, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    region: '',
    photo: '',
    bio: '',
    conflict: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (initialData.photoURL) {
        setPreviewURL(initialData.photoURL);
      } else if (initialData.photo) {
        setPreviewURL(`/assets/images/${initialData.photo}`);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewURL(url);
      setFormData((prev) => ({
        ...prev,
        photo: file.name
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData
    };

    if (photoFile) {
      updatedData.photoURL = previewURL;
    }

    onSave(updatedData);
  };

  return (
      <form className="person-form" onSubmit={handleSubmit}>
        <h2>{initialData.id ? 'Редактировать' : 'Добавить'} человека</h2>

        <input
            type="text"
            name="lastName"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={handleChange}
            required
        />

        <input
            type="text"
            name="firstName"
            placeholder="Имя"
            value={formData.firstName}
            onChange={handleChange}
            required
        />

        <input
            type="text"
            name="middleName"
            placeholder="Отчество"
            value={formData.middleName}
            onChange={handleChange}
        />

        <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            required
        >
          <option value="">Выберите регион</option>
          {REGIONS.map((region) => (
              <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
        />

        {previewURL && (
            <img
                src={previewURL}
                alt="Предпросмотр"
                style={{ maxWidth: '200px', marginTop: '10px' }}
            />
        )}

        <textarea
            name="bio"
            placeholder="Биография"
            value={formData.bio}
            onChange={handleChange}
        />

        <input
            type="text"
            name="conflict"
            placeholder="Участие в конфликте"
            value={formData.conflict}
            onChange={handleChange}
        />

        <div className="form-buttons">
          <button type="submit">Сохранить</button>
          <button type="button" onClick={onCancel}>Отмена</button>
        </div>
      </form>
  );
}
