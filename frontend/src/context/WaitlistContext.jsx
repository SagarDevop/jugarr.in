import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getApiBaseUrl } from "@/lib/api.js";

const STORAGE_KEY = "jugarr_waitlist_user";

const WaitlistContext = createContext({
  user: null,
  isJoined: false,
  loading: true,
  saveUser: () => {},
  verifyUserWithBackend: async () => {},
  logout: () => {},
});

export function WaitlistProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Failed to parse cached waitlist user:", e);
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  const saveUser = useCallback((userData) => {
    if (!userData || !userData.email) return;
    setUser((prev) => {
      const merged = { ...(prev || {}), ...userData };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn("Failed to save waitlist user to localStorage:", e);
      }
      return merged;
    });
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to remove waitlist user from localStorage:", e);
    }
    setUser(null);
  }, []);

  // Primary verification against backend database
  const verifyUserWithBackend = useCallback(async (email) => {
    if (!email) return null;
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/waitlist/status?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
      if (res.ok) {
        const data = await res.json();
        saveUser(data);
        return data;
      } else if (res.status === 404) {
        // Record no longer exists in database
        logout();
        return null;
      }
    } catch (err) {
      console.error("Waitlist verification failed (network/server):", err);
      // Keep cached state during temporary offline or server issues
    }
    return null;
  }, [saveUser, logout]);

  // Initial background verification on startup if cached user exists
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) {
            await verifyUserWithBackend(parsed.email);
          }
        }
      } catch (e) {
        console.warn("Initial waitlist sync error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [verifyUserWithBackend]);

  const isJoined = Boolean(user && user.email);

  return (
    <WaitlistContext.Provider
      value={{
        user,
        isJoined,
        loading,
        saveUser,
        verifyUserWithBackend,
        logout,
      }}
    >
      {children}
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const context = useContext(WaitlistContext);
  if (!context) {
    throw new Error("useWaitlist must be used within a WaitlistProvider");
  }
  return context;
}
