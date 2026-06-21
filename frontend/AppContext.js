import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API = 'http://localhost:5000/api';

export function AppProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    const savedProfiles = localStorage.getItem('scheme_hub_profiles');
    if (savedProfiles) return JSON.parse(savedProfiles);

    // Backward compatibility for single-profile storage
    const legacyUser = localStorage.getItem('scheme_hub_user');
    if (!legacyUser) return [];
    const parsed = JSON.parse(legacyUser);
    if (!parsed?.user_id) return [];
    return [parsed];
  });
  const [activeUserId, setActiveUserId] = useState(() => {
    const savedActive = localStorage.getItem('scheme_hub_active_user_id');
    if (savedActive) return savedActive;

    const legacyUser = localStorage.getItem('scheme_hub_user');
    if (!legacyUser) return null;
    const parsed = JSON.parse(legacyUser);
    return parsed?.user_id || null;
  });
  const user = profiles.find((p) => p.user_id === activeUserId) || null;
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      if (!user?.user_id) {
        setNotifications([]);
        setNotificationCount(0);
        return;
      }

      // Fetch newly added schemes from notifications endpoint
      const params = new URLSearchParams({
        userId: user.user_id,
        age: user.age,
        gender: user.gender,
        category: user.category || 'General',
        occupation: user.occupation,
        annual_income: user.annual_income || 0,
        education: user.education,
        state: user.state
      });
      const res = await axios.get(`${API}/schemes/notifications?${params.toString()}`);
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setNotificationCount(res.data.count);
      }
    } catch (e) {
      // Silently handle errors
    }
  }, [user]);

  const loadSavedSchemes = useCallback(async () => {
    if (!user?.user_id) return;
    try {
      const res = await axios.get(`${API}/saved/${user.user_id}`);
      if (res.data.success) setSavedSchemes(res.data.saved_schemes);
    } catch (e) {}
  }, [user?.user_id]);

  useEffect(() => {
    localStorage.setItem('scheme_hub_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeUserId) {
      localStorage.setItem('scheme_hub_active_user_id', activeUserId);
    } else {
      localStorage.removeItem('scheme_hub_active_user_id');
    }
  }, [activeUserId]);

  useEffect(() => {
    // Remove legacy key after migrating to multi-profile storage
    localStorage.removeItem('scheme_hub_user');
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (user?.user_id) loadSavedSchemes();
  }, [user?.user_id, loadSavedSchemes]);

  const createUser = async (profileData) => {
    const res = await axios.post(`${API}/users`, profileData);
    if (res.data.success) {
      const userData = { ...profileData, user_id: res.data.user_id };
      setProfiles((prev) => [userData, ...prev]);
      setActiveUserId(userData.user_id);
      return userData;
    }
    throw new Error(res.data.message);
  };

  const selectUserProfile = (userId) => {
    const found = profiles.some((p) => p.user_id === userId);
    if (found) setActiveUserId(userId);
  };

  const deleteUserProfile = async (userId) => {
    await axios.delete(`${API}/users/${userId}`);
    setProfiles((prev) => {
      const next = prev.filter((p) => p.user_id !== userId);
      if (activeUserId === userId) {
        setActiveUserId(next[0]?.user_id || null);
      }
      return next;
    });
  };

  const saveScheme = async (schemeId) => {
    if (!user?.user_id) { showToast('Please create a profile first', 'error'); return; }
    try {
      const res = await axios.post(`${API}/saved`, { user_id: user.user_id, scheme_id: schemeId });
      if (res.data.success) {
        showToast('Scheme saved! ✓', 'success');
        loadSavedSchemes();
      } else {
        showToast(res.data.message, 'info');
      }
    } catch (e) {
      showToast('Failed to save scheme', 'error');
    }
  };

  const removeSavedScheme = async (schemeId) => {
    if (!user?.user_id) return;
    try {
      await axios.delete(`${API}/saved/${user.user_id}/${schemeId}`);
      showToast('Removed from saved schemes', 'info');
      loadSavedSchemes();
    } catch (e) {
      showToast('Failed to remove scheme', 'error');
    }
  };

  const isSaved = (schemeId) => savedSchemes.some(s => s.id === schemeId);

  const logout = () => {
    setActiveUserId(null);
    setSavedSchemes([]);
    localStorage.removeItem('scheme_hub_active_user_id');
  };

  const markNotificationsAsViewed = async () => {
    if (!user?.user_id) return;
    try {
      const res = await axios.post(`${API}/schemes/notifications/read`, { userId: user.user_id });
      if (res.data.success) {
        setNotificationCount(0);
        // Reload notifications to clear the list
        loadNotifications();
      }
    } catch (e) {}
  };

  const clearAllProfiles = () => {
    setProfiles([]);
    setActiveUserId(null);
    setSavedSchemes([]);
    localStorage.removeItem('scheme_hub_profiles');
    localStorage.removeItem('scheme_hub_active_user_id');
  };

  return (
    <AppContext.Provider value={{
      user, profiles, activeUserId,
      createUser, selectUserProfile, deleteUserProfile, logout, clearAllProfiles,
      notifications, notificationCount, loadNotifications, markNotificationsAsViewed,
      savedSchemes, saveScheme, removeSavedScheme, isSaved, loadSavedSchemes,
      toasts, showToast,
      API
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
