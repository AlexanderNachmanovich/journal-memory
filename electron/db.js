const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const Database = require("better-sqlite3");

// 📌 Папка для пользовательских данных (в ней будем хранить базу)
const userDataPath = app.getPath("userData");
const targetDb = path.join(userDataPath, "journal-memory.db");

// 📌 Исходная база (лежит в resources при упаковке)
const sourceDb = path.join(process.resourcesPath, "journal-memory.db");

// Если базы ещё нет в userData → копируем из ресурсов
if (!fs.existsSync(targetDb)) {
  try {
    fs.copyFileSync(sourceDb, targetDb);
    console.log("База скопирована в:", targetDb);
  } catch (e) {
    console.error("Не удалось скопировать базу:", e);
  }
}

// Открываем базу в userData
const db = new Database(targetDb);

// 1) Базовая схема (с новой колонкой birthDate)
db.prepare(`
  CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    birthDate TEXT,      -- формат YYYY-MM-DD
    region TEXT,
    biography TEXT,
    photoPath TEXT
  )
`).run();

// 2) Миграция: если таблица существовала раньше без birthDate — добавим колонку
const columns = db.prepare(`PRAGMA table_info(persons)`).all();
const hasBirthDate = columns.some(c => c.name === "birthDate");
const hasBirthYear = columns.some(c => c.name === "birthYear");

if (!hasBirthDate) {
  db.prepare(`ALTER TABLE persons ADD COLUMN birthDate TEXT`).run();
}

// 3) Если есть legacy-колонка birthYear — сконвертируем её в YYYY-01-01
if (hasBirthYear) {
  db.prepare(`
    UPDATE persons
    SET birthDate = CASE
      WHEN birthYear IS NOT NULL AND TRIM(birthYear) <> ''
      THEN printf('%04d-01-01', CAST(birthYear AS INTEGER))
      ELSE birthDate
    END
    WHERE birthDate IS NULL OR TRIM(birthDate) = ''
  `).run();

  // Примечание: удаление столбца в SQLite = перестройка таблицы, это долго.
  // Мы оставляем birthYear как "мёртвую" колонку, но код её больше не использует.
}

module.exports = db;
