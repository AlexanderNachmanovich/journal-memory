const path = require("path");
const fs = require("fs");
const os = require("os");
const Database = require("better-sqlite3");

// 📌 Путь к рабочему столу
const desktopPath = path.join(os.homedir(), "Desktop");

// 📌 Пути к базе и папке с фотографиями
const targetDb = path.join(desktopPath, "journal-memory.db");
const photosDir = path.join(desktopPath, "journal-photos");

// 📌 Создаём папку для фотографий, если её нет
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
  console.log("Папка для фото создана:", photosDir);
}

// 📌 Если базы ещё нет — создаём пустую
if (!fs.existsSync(targetDb)) {
  try {
    const db = new Database(targetDb);
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

    db.prepare(`
      CREATE TABLE IF NOT EXISTS conflicts (
        region TEXT PRIMARY KEY,
        text   TEXT
      )
    `).run();

    db.close();
    console.log("Новая база создана на рабочем столе:", targetDb);
  } catch (e) {
    console.error("Не удалось создать базу:", e);
  }
}

// 📌 Подключаемся к базе на рабочем столе
const db = new Database(targetDb);

// 1) Проверка схемы persons
db.prepare(`
  CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    birthDate TEXT,
    region TEXT,
    biography TEXT,
    photoPath TEXT
  )
`).run();

// 2) Миграция birthDate (если вдруг остался старый birthYear)
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

// 3) Таблица conflicts
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
  photosDir, // экспортируем папку для фото, чтобы использовать в preload.js
};
