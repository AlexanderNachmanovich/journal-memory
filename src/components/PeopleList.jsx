import React, { useMemo } from "react";

/** Достаём год из YYYY-MM-DD безопасно */
function birthYear(dateStr) {
  if (!dateStr) return "";
  const m = /^(\d{4})/.exec(String(dateStr));
  return m ? m[1] : "";
}

export default function PeopleList({
                                     people = [],
                                     onSelect,
                                     onBack,
                                     onAdd,            // () => void | undefined
                                     isAdmin = false,
                                     onAdminLogout,    // () => Promise<void>
                                   }) {
  const sorted = useMemo(
      () => [...people].sort((a, b) => (a.name || "").localeCompare(b.name || "", "ru")),
      [people]
  );

  return (
      <div className="book-container">
        {/* Левая страница */}
        <div className="book-page left-page">
          <h1>КНИГА ПАМЯТИ</h1>

          <button className="back-button" onClick={onBack}>
            ← Выход на карту мира
          </button>

          {isAdmin && (
              <>
                {onAdd && (
                    <button className="back-button" style={{ marginTop: 16 }} onClick={onAdd}>
                      ➕ Добавить человека
                    </button>
                )}
                <button className="back-button" style={{ marginTop: 8 }} onClick={() => onAdminLogout?.()}>
                  ⇦ Выйти из админ-режима
                </button>
              </>
          )}
        </div>

        {/* Правая страница */}
        <div className="book-page right-page">
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Общий список</h2>

          <div className="people-scroll">
            <table className="people-table">
              <thead>
              <tr>
                <th>ФИО</th>
                <th>Год рождения</th>
                {/*<th></th>*/}
              </tr>
              </thead>
              <tbody>
              {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: 16 }}>
                      Пока нет записей.
                    </td>
                  </tr>
              ) : (
                  sorted.map((p) => (
                      <tr key={p.id} onClick={() => onSelect && onSelect(p)}>
                        <td>{p.name}</td>
                        <td>{birthYear(p.birthDate)}</td>
                        {/*<td></td>*/}
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
