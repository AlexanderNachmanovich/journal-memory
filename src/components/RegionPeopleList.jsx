import React, { useMemo, useEffect } from "react";
import bg2 from "../assets/images/bg2.png";   // фон книги

/** Безопасно достаём год из YYYY-MM-DD */
function birthYear(dateStr) {
  if (!dateStr) return "";
  const m = /^(\d{4})/.exec(String(dateStr));
  return m ? m[1] : "";
}

export default function RegionPeopleList({
                                           region,
                                           people,
                                           onSelect,
                                           onBackToMap,
                                           onShowAll,
                                           onAdd,
                                           isAdmin = false,
                                           onAdminLogout,
                                         }) {
  const regionPeople = useMemo(
      () => (people || []).filter((p) => p.region === region),
      [people, region]
  );

  // Подставляем фон книги через CSS-переменную
  useEffect(() => {
    document.documentElement.style.setProperty("--book-bg", `url(${bg2})`);
  }, []);

  return (
      <div className="book-container">
        <div className="book-wrapper">
          {/* Левая страница */}
          <div className="book-page left-page">
            <h1>КНИГА ПАМЯТИ</h1>

            <button className="back-button" onClick={onBackToMap}>
              ← Выход на карту мира
            </button>
            <button className="back-button" onClick={onShowAll}>
              → Общий список
            </button>

            {isAdmin && (
                <>
                  {onAdd && (
                      <button
                          className="back-button"
                          style={{ marginTop: 16 }}
                          onClick={onAdd}
                      >
                        ➕ Добавить человека
                      </button>
                  )}
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
          <div className="book-page right-page">
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Регион: {region}</h2>

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
                      <td colSpan={3} style={{ textAlign: "center", padding: "16px" }}>
                        В этом регионе пока нет записей.
                      </td>
                    </tr>
                ) : (
                    regionPeople.map((p) => (
                        <tr key={p.id} onClick={() => onSelect && onSelect(p)}>
                          <td>{p.name}</td>
                          <td>{birthYear(p.birthDate)}</td>
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
