import React, { useState, useEffect } from "react";
import { REGIONS } from "../data/regions";
import bg2 from "../assets/images/bg2.png";   // фон книги

// helpers
function splitFullName(full) {
  if (!full || typeof full !== "string") return { lastName: "", firstName: "", middleName: "" };
  const parts = full.replace(/\s+/g, " ").trim().split(" ");
  if (parts.length === 1) return { lastName: parts[0], firstName: "", middleName: "" };
  if (parts.length === 2) return { lastName: parts[0], firstName: parts[1], middleName: "" };
  return { lastName: parts[0], firstName: parts[1], middleName: parts.slice(2).join(" ") };
}

function normalizeDate(input) {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(input)) {
    const [d, m, y] = input.split(".");
    return `${y}-${m}-${d}`;
  }
  return input;
}

export default function PersonForm({
                                     initialData = {},
                                     onSave,
                                     onCancel,
                                     onBackToMap,
                                     isAdmin,
                                     onAdminLogout,
                                   }) {
  const [formData, setFormData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    middleName: "",
    birthDate: "",
    region: "",
    photoPath: "",
    biography: "",
  });
  const [previewURL, setPreviewURL] = useState(null);

  useEffect(() => {
    // фон книги через CSS-переменную
    document.documentElement.style.setProperty("--book-bg", `url(${bg2})`);
  }, []);

  useEffect(() => {
    if (!initialData) return;
    const patched = { ...initialData };

    // нормализуем регион (сравнение без регистра и лишних пробелов)
    if (patched.region) {
      const match = REGIONS.find(
          (r) => r.toLowerCase().trim() === patched.region.toLowerCase().trim()
      );
      patched.region = match || patched.region.trim();
    }

    if (!patched.birthDate && patched.birthYear) {
      const y = String(patched.birthYear).padStart(4, "0");
      patched.birthDate = `${y}-01-01`;
    }
    patched.birthDate = normalizeDate(patched.birthDate || "");

    if (patched.name && !patched.lastName && !patched.firstName && !patched.middleName) {
      const { lastName, firstName, middleName } = splitFullName(patched.name);
      patched.lastName = lastName;
      patched.firstName = firstName;
      patched.middleName = middleName;
    }

    setFormData((prev) => ({ ...prev, ...patched }));
    setPreviewURL(patched.photoPath ? `/photos/${patched.photoPath}` : null);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uniqueName = `${Date.now()}-${file.name}`;
    let savedFileName;

    if (formData.photoPath) {
      savedFileName = await window.api.replacePhoto({
        tempPath: file.path,
        fileName: uniqueName,
        oldFileName: formData.photoPath,
      });
    } else {
      savedFileName = await window.api.savePhoto({
        tempPath: file.path,
        fileName: uniqueName,
      });
    }

    setFormData((prev) => ({ ...prev, photoPath: savedFileName }));
    setPreviewURL(`photos://${savedFileName}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // нормализуем регион перед сохранением
    let region = formData.region?.trim() || "";
    const match = REGIONS.find((r) => r.toLowerCase() === region.toLowerCase());
    region = match || region;

    const personData = {
      id: formData.id,
      name: `${formData.lastName} ${formData.firstName} ${formData.middleName}`
          .replace(/\s+/g, " ")
          .trim(),
      birthDate: normalizeDate(formData.birthDate) || null,
      region,
      biography: formData.biography,
      photoPath: formData.photoPath,
    };

    try {
      if (formData.id) {
        await window.api.updatePerson(personData);
      } else {
        await window.api.addPerson(personData);
      }
      onSave && onSave();
    } catch (err) {
      console.error("Ошибка сохранения:", err);
    }
  };

  return (
      <div className="book-container">
        <div className="book-wrapper">
          {/* Левая страница */}
          <div className="book-page left-page">
            <h1>КНИГА ПАМЯТИ</h1>
            <button onClick={onCancel} className="back-button">
              ← Вернуться к списку
            </button>
            <button onClick={onBackToMap} className="back-button">
              ← Выход на карту мира
            </button>
            {isAdmin && (
                <button
                    className="back-button"
                    style={{ marginTop: 8 }}
                    onClick={() => onAdminLogout?.()}
                >
                  ⇦ Выйти из админ-режима
                </button>
            )}
          </div>

          {/* Правая страница */}
          <div className="book-page right-page">
            <form className="person-form" onSubmit={handleSubmit}>
              {previewURL && <img src={previewURL} alt="Фото" className="person-photo" />}
              <input type="file" accept="image/*" onChange={handlePhotoChange} />

              <input
                  type="text"
                  name="lastName"
                  placeholder="Фамилия"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  required
              />
              <input
                  type="text"
                  name="firstName"
                  placeholder="Имя"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  required
              />
              <input
                  type="text"
                  name="middleName"
                  placeholder="Отчество"
                  value={formData.middleName || ""}
                  onChange={handleChange}
              />

              <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate || ""}
                  onChange={handleChange}
              />

              <select
                  name="region"
                  value={formData.region || ""}
                  onChange={handleChange}
                  required
              >
                <option value="">Выберите регион</option>
                {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                ))}
              </select>

              <textarea
                  name="biography"
                  placeholder="Биография"
                  value={formData.biography || ""}
                  onChange={handleChange}
              />

              <div className="form-buttons">
                <button type="submit">💾 Сохранить</button>
                <button type="button" onClick={onCancel}>
                  ✖ Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}
