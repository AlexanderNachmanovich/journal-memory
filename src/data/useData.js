import { useEffect, useState } from "react";

export function useData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // загрузка данных из базы
  const loadData = async () => {
    try {
      if (window.api) {
        // получаем всех людей
        const persons = await window.api.getPersons();

        // для каждого человека подтягиваем его дополнительные фото
        const withPhotos = await Promise.all(
            persons.map(async (p) => {
              try {
                const extra = await window.api.getPersonPhotos(p.id);
                return { ...p, extraPhotos: extra }; // extra = [{id, personId, filePath}]
              } catch (e) {
                console.warn("Не удалось загрузить фото для", p.id, e);
                return { ...p, extraPhotos: [] };
              }
            })
        );

        setData(withPhotos);
      } else {
        console.warn("⚠️ window.api не доступен — preload.js не подхватился");
      }
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    setData,
    loading,
    reload: loadData, // можно вызвать из App.jsx после добавления/удаления
  };
}

// ====================
// ⚡ новые функции для конфликтов
// ====================

export async function getConflictText(region) {
  try {
    return window.api ? await window.api.getConflictText(region) : "";
  } catch (err) {
    console.error("Ошибка getConflictText:", err);
    return "";
  }
}

export async function saveConflictText(region, text) {
  try {
    if (window.api) await window.api.saveConflictText(region, text);
  } catch (err) {
    console.error("Ошибка saveConflictText:", err);
  }
}
