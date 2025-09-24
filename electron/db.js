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

// 1) Базовая схема persons
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

// 2) Миграция: birthDate
const columns = db.prepare(`PRAGMA table_info(persons)`).all();
const hasBirthDate = columns.some(c => c.name === "birthDate");
const hasBirthYear = columns.some(c => c.name === "birthYear");

if (!hasBirthDate) {
  db.prepare(`ALTER TABLE persons ADD COLUMN birthDate TEXT`).run();
}

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
}

// 3) Новая таблица conflicts
db.prepare(`
  CREATE TABLE IF NOT EXISTS conflicts (
    region TEXT PRIMARY KEY,
    text   TEXT
  )
`).run();

// Методы для работы с текстами конфликтов
function getConflictText(region) {
  const row = db.prepare(
      `SELECT text FROM conflicts WHERE region = ?`
  ).get(region);
  return row ? row.text : "";
}

function saveConflictText(region, text) {
  db.prepare(
      `INSERT INTO conflicts (region, text)
     VALUES (?, ?)
     ON CONFLICT(region) DO UPDATE SET text = excluded.text`
  ).run(region, text);
}

module.exports = {
  db,
  getConflictText,
  saveConflictText,
};
