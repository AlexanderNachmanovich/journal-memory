import { useEffect, useState } from "react";

export function useData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // загрузка данных из базы
  const loadData = async () => {
    try {
      if (window.api) {
        const persons = await window.api.getPersons();
        setData(persons);
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
