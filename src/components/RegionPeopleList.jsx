import React, { useMemo, useEffect, useState } from "react";
import bg2 from "../assets/images/bg2.png";

export default function RegionPeopleList({
                                           region,
                                           people,
                                           onSelect,
                                           onBackToMap,
                                           onShowAll,
                                           onAdd,
                                           isAdmin,
                                           onAdminLogout,
                                         }) {
  const regionPeople = useMemo(
      () =>
          (people || [])
              .filter((p) => p.region === region)
              .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ru")),
      [people, region]
  );

  const [conflictText, setConflictText] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    document.documentElement.style.setProperty("--book-bg", `url(${bg2})`);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const text = await window.api.getConflictText(region);
        if (mounted) setConflictText(text || "");
      } catch (e) {
        console.error("Ошибка загрузки описания конфликта:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [region]);

  const handleSave = async () => {
    try {
      await window.api.saveConflictText(region, conflictText);
      setSavedMessage("✔ Описание сохранено!");
      setTimeout(() => setSavedMessage(""), 2000);
    } catch (e) {
      console.error("Ошибка сохранения описания:", e);
      setSavedMessage("❌ Ошибка сохранения");
    }
  };

  return (
      <div className="book-container">
        <div className="book-wrapper">
          {/* Левая страница */}
          <div className="book-page left-page scrollable">
            <h1>{region}</h1>

            {loading ? (
                <p>Загрузка…</p>
            ) : !isAdmin ? (
                <div className="conflict-text centered">
                  {conflictText || "Описание пока не добавлено."}
                </div>
            ) : (
                <textarea
                    className="conflict-editor"
                    value={conflictText}
                    onChange={(e) => setConflictText(e.target.value)}
                    rows={10}
                />
            )}

            {/* Сообщение о сохранении */}
            {savedMessage && <div className="save-message">{savedMessage}</div>}

            {/* Кнопки */}
            <div className="left-actions">
              {isAdmin && (
                  <button className="back-button" onClick={handleSave}>
                    💾 Сохранить описание
                  </button>
              )}
              <button className="back-button" onClick={onBackToMap}>
                ← Выход на карту мира
              </button>
              <button className="back-button" onClick={onShowAll}>
                → Общий список
              </button>
              {isAdmin && (
                  <>
                    {onAdd && (
                        <button className="back-button" onClick={onAdd}>
                          ➕ Добавить человека
                        </button>
                    )}
                    <button
                        className="back-button"
                        onClick={() => onAdminLogout?.()}
                    >
                      ⇦ Выйти из админ-режима
                    </button>
                  </>
              )}
            </div>
          </div>

          {/* Правая страница */}
          <div className="book-page right-page">
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>
              Книга памяти. Регион: {region}
            </h2>

            <div className="people-scroll">
              <table className="people-table">
                <thead>
                <tr>
                  <th>ФИО</th>
                  <th>Год рождения</th>
                </tr>
                </thead>
                <tbody>
                {regionPeople.length === 0 ? (
                    <tr>
                      <td
                          colSpan={3}
                          style={{ textAlign: "center", padding: "16px" }}
                      >
                        В этом регионе пока нет записей.
                      </td>
                    </tr>
                ) : (
                    regionPeople.map((p) => (
                        <tr key={p.id} onClick={() => onSelect && onSelect(p)}>
                          <td>{p.name}</td>
                          <td>
                            {p.birthDate ? String(p.birthDate).slice(0, 4) : ""}
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
