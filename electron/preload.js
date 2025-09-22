// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
  getUserDataPath: () => ipcRenderer.invoke('getUserDataPath'),

  // DATA
  getPersons: () => ipcRenderer.invoke('get-persons'),
  addPerson: (person) => ipcRenderer.invoke('add-person', person),
  updatePerson: (person) => ipcRenderer.invoke('update-person', person),
  deletePerson: (id) => ipcRenderer.invoke('delete-person', id),

  savePhoto: (file) => ipcRenderer.invoke('save-photo', file),
  replacePhoto: (file) => ipcRenderer.invoke('replace-photo', file),

  // AUTH
  getAuthStatus: () => ipcRenderer.invoke('auth-get-status'),
  login: (password) => ipcRenderer.invoke('auth-login', { password }),
  logout: () => ipcRenderer.invoke('auth-logout'),
  changeAdminPassword: (oldPassword, newPassword) =>
      ipcRenderer.invoke('auth-change-password', { oldPassword, newPassword }),

  // APP
  appQuit: () => ipcRenderer.invoke('app-quit'),
});
