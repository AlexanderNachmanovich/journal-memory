// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // SYSTEM
  ping: () => ipcRenderer.invoke("ping"),
  getUserDataPath: () => ipcRenderer.invoke("getUserDataPath"),
  appQuit: () => ipcRenderer.invoke("app-quit"),

  // PERSONS
  getPersons: () => ipcRenderer.invoke("get-persons"),
  addPerson: (person) => ipcRenderer.invoke("add-person", person),
  updatePerson: (person) => ipcRenderer.invoke("update-person", person),
  deletePerson: (id) => ipcRenderer.invoke("delete-person", id),

  // MAIN PHOTO
  savePhoto: (file) => ipcRenderer.invoke("save-photo", file),
  replacePhoto: (file) => ipcRenderer.invoke("replace-photo", file),

  // EXTRA PHOTOS
  getPersonPhotos: (personId) => ipcRenderer.invoke("get-person-photos", personId),
  addPersonPhoto: (data) => ipcRenderer.invoke("add-person-photo", data),
  deletePersonPhoto: (photoId) => ipcRenderer.invoke("delete-person-photo", photoId),

  // CONFLICTS
  getConflictText: (region) => ipcRenderer.invoke("get-conflict-text", region),
  saveConflictText: (region, text) =>
      ipcRenderer.invoke("save-conflict-text", { region, text }),

  // AUTH
  getAuthStatus: () => ipcRenderer.invoke("auth-get-status"),
  login: (password) => ipcRenderer.invoke("auth-login", { password }),
  logout: () => ipcRenderer.invoke("auth-logout"),
  changeAdminPassword: (oldPassword, newPassword) =>
      ipcRenderer.invoke("auth-change-password", { oldPassword, newPassword }),
});
