// electron/main.js
const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { db, getConflictText, saveConflictText } = require('./db');


const isDev = !app.isPackaged;

// ----------------- CONFIG -----------------
const configPath = path.join(app.getPath('userData'), 'config.json');

function readConfig() {
  if (!fs.existsSync(configPath)) return null;
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Не удалось прочитать config.json, создаём заново', e);
    return null;
  }
}

function writeConfig(cfg) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (e) {
    console.warn('Не удалось записать config.json', e);
  }
}

function ensureConfig() {
  let cfg = readConfig();
  if (!cfg) cfg = {};
  if (!cfg.adminPassword) {
    cfg.adminPassword = '23103';
  }
  writeConfig(cfg);
  return cfg;
}

let CONFIG = null;
let mainWindow = null;
const adminSessions = new Set();

function isAdminEvent(event) {
  return adminSessions.has(event.sender.id);
}

// ----------------------------------------------------------
// Создание окна
function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      enableBlinkFeatures: "HTMLSelectPopover",
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 📂 папка для фото
const photosDir = path.join(app.getPath('userData'), 'photos');
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

// =======================
// IPC handlers
// =======================
ipcMain.handle('ping', () => 'pong');
ipcMain.handle('getUserDataPath', () => app.getPath('userData'));

// ---------- AUTH ----------
ipcMain.handle('auth-get-status', (event) => {
  return { isAdmin: isAdminEvent(event) };
});

ipcMain.handle('auth-login', (event, { password }) => {
  if (!password || typeof password !== 'string') {
    return { ok: false, error: 'EMPTY_PASSWORD' };
  }
  const ok = password === CONFIG.adminPassword;
  if (ok) {
    adminSessions.add(event.sender.id);

    if (mainWindow) {
      mainWindow.setKiosk(false);
      mainWindow.setFullScreen(false);
      mainWindow.setResizable(true);
      mainWindow.setMinimizable(true);
      mainWindow.setMaximizable(true);
    }

    return { ok: true, isAdmin: true };
  }
  return { ok: false, error: 'BAD_PASSWORD' };
});

ipcMain.handle('auth-logout', (event) => {
  adminSessions.delete(event.sender.id);

  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
    mainWindow.setResizable(false);
    mainWindow.setMinimizable(false);
    mainWindow.setMaximizable(false);
  }

  return { ok: true, isAdmin: false };
});

ipcMain.handle('auth-change-password', (event, { oldPassword, newPassword }) => {
  if (!isAdminEvent(event)) throw new Error('Not authorized');
  if (!oldPassword || !newPassword) {
    return { ok: false, error: 'EMPTY_FIELDS' };
  }
  if (oldPassword !== CONFIG.adminPassword) {
    return { ok: false, error: 'BAD_OLD_PASSWORD' };
  }
  CONFIG.adminPassword = String(newPassword);
  writeConfig(CONFIG);
  return { ok: true };
});

// ---------- READ ----------
ipcMain.handle('get-persons', () => {
  return db.prepare('SELECT * FROM persons').all();
});

// ---------- WRITE ----------
ipcMain.handle('add-person', (event, person) => {
  if (!isAdminEvent(event)) throw new Error('Not authorized');
  const stmt = db.prepare(`
    INSERT INTO persons (name, birthDate, region, biography, photoPath)
    VALUES (@name, @birthDate, @region, @biography, @photoPath)
  `);
  const info = stmt.run(person);
  return info.lastInsertRowid;
});

ipcMain.handle('update-person', (event, person) => {
  if (!isAdminEvent(event)) throw new Error('Not authorized');
  const stmt = db.prepare(`
    UPDATE persons
    SET name = @name,
        birthDate = @birthDate,
        region = @region,
        biography = @biography,
        photoPath = @photoPath
    WHERE id = @id
  `);
  return stmt.run(person);
});

ipcMain.handle('delete-person', (event, id) => {
  if (!isAdminEvent(event)) throw new Error('Not authorized');
  const person = db.prepare('SELECT * FROM persons WHERE id = ?').get(id);
  if (person && person.photoPath) {
    const photoFile = path.join(photosDir, person.photoPath);
    if (fs.existsSync(photoFile)) {
      try { fs.unlinkSync(photoFile); } catch (err) { console.warn("Не удалось удалить фото:", err); }
    }
  }
  return db.prepare('DELETE FROM persons WHERE id = ?').run(id);
});

// ---------- SAVE/REPLACE PHOTO ----------
ipcMain.handle('save-photo', (event, { tempPath, fileName }) => {
  if (!isAdminEvent(event)) throw new Error('Not authorized');
  const destPath = path.join(photosDir, fileName);
  fs.copyFileSync(tempPath, destPath);
  return fileName;
});

ipcMain.handle('replace-photo', (event, { tempPath, fileName, oldFileName }) => {
  if (!isAdminEvent(event)) throw new Error('Not authorized');
  const destPath = path.join(photosDir, fileName);
  fs.copyFileSync(tempPath, destPath);

  if (oldFileName) {
    const oldPath = path.join(photosDir, oldFileName);
    if (fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath); } catch (err) { console.warn("Не удалось удалить старое фото:", err); }
    }
  }
  return fileName;
});

ipcMain.handle('app-quit', () => {
  app.quit();
});

// ---------- CONFLICTS ----------
ipcMain.handle('get-conflict-text', (event, region) => {
  return getConflictText(region);
});

ipcMain.handle('save-conflict-text', (event, { region, text }) => {
  if (!isAdminEvent(event)) throw new Error('Not authorized');
  saveConflictText(region, text);
  return true;
});


// =======================
// App lifecycle
// =======================
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    CONFIG = ensureConfig();

    protocol.registerFileProtocol('photos', (request, callback) => {
      const url = request.url.replace('photos://', '');
      const filePath = path.join(photosDir, decodeURIComponent(url));
      callback({ path: filePath });
    });

    createWindow(); // по умолчанию kiosk
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
