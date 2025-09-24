// src/data/useAuth.js
import { useEffect, useState, useCallback } from "react";

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Получаем текущий статус (при запуске приложения)
  const refresh = useCallback(async () => {
    try {
      const status = await window.api.getAuthStatus();
      setIsAdmin(!!status?.isAdmin);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Логин: сервер (main.js) возвращает { ok, isAdmin }
  const login = async (password) => {
    try {
      const res = await window.api.login(password);
      setIsAdmin(!!res?.isAdmin);
      return res;
    } catch {
      setIsAdmin(false);
      return { ok: false, error: "LOGIN_FAILED" };
    }
  };

  // Логаут: сервер возвращает { ok, isAdmin }
  const logout = async () => {
    try {
      const res = await window.api.logout();
      setIsAdmin(!!res?.isAdmin);
      return res;
    } catch {
      setIsAdmin(false);
      return { ok: false, error: "LOGOUT_FAILED" };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    return window.api.changeAdminPassword(oldPassword, newPassword);
  };

  return { isAdmin, login, logout, changePassword, refresh };
}
