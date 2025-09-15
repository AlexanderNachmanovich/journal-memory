// src/data/useAuth.js
import { useEffect, useState, useCallback } from "react";

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const s = await window.api.getAuthStatus();
      setIsAdmin(!!s?.isAdmin);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (password) => {
    const res = await window.api.login(password);
    if (res?.ok) setIsAdmin(true);
    return res;
  };

  const logout = async () => {
    await window.api.logout();
    setIsAdmin(false);
  };

  const changePassword = async (oldPassword, newPassword) => {
    return window.api.changeAdminPassword(oldPassword, newPassword);
  };

  return { isAdmin, login, logout, changePassword, refresh };
}
