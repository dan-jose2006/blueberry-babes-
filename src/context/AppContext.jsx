import React, { createContext, useContext, useState, useCallback } from 'react';
import { deadlines as initialDeadlines, attendanceData as initialAttendance, notifications as initialNotifications } from '../data/mockData';
import { tasksAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deadlines, setDeadlines] = useState(initialDeadlines);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);

  // Fetch student's real tasks/deadlines from the Supabase backend on load
  React.useEffect(() => {
    async function fetchUserTasks() {
      try {
        const user = JSON.parse(localStorage.getItem('cf_user') || 'null');
        if (user && user.email) {
          const response = await tasksAPI.getAll(user.email);
          if (response && response.success && response.tasks && response.tasks.length > 0) {
            // Merge loaded tasks from DB with mock ones if they aren't duplicate
            setDeadlines(prev => {
              const existingIds = new Set(response.tasks.map(t => t.id));
              const filteredPrev = prev.filter(p => !existingIds.has(p.id));
              return [...response.tasks, ...filteredPrev];
            });
          }
        }
      } catch (err) {
        console.warn('[CampusFlow] Could not fetch real tasks from backend:', err.message);
      }
    }
    fetchUserTasks();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ id: Date.now(), ...notif, time: 'Just now', read: false }, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  /**
   * addDeadline — saves to Supabase via the Express backend, then updates
   * local React state with the response. If the API is unavailable, falls
   * back to local-only state so the UI never breaks.
   */
  const addDeadline = useCallback(async (deadline) => {
    // Optimistically add to local state immediately for snappy UI
    const localId = Date.now();
    const localDeadline = { id: localId, ...deadline };
    setDeadlines(prev => [localDeadline, ...prev]);
    addNotification({ type: 'success', title: 'Deadline Added', message: `${deadline.title} added for ${deadline.deadline}` });

    // Attempt to persist to backend
    try {
      const user = JSON.parse(localStorage.getItem('cf_user') || 'null');
      const response = await tasksAPI.create({
        title: deadline.title,
        subject: deadline.subject,
        description: deadline.notes || '',
        deadline: deadline.deadline,
        priority: deadline.priority || 'medium',
        difficulty: deadline.difficulty || 'medium',
        estimatedHours: deadline.estimatedHours || 4,
        completionPercent: deadline.completionPercent || 0,
        studyPlan: deadline.studyPlan || null,
        aiStats: deadline.aiStats || null,
        studentEmail: user?.email || null,
      });

      // Replace local temp entry with the real DB record (has proper UUID)
      if (response.success && response.task) {
        setDeadlines(prev =>
          prev.map(d => d.id === localId ? { ...d, ...response.task } : d)
        );

        // Notify about automation result
        if (response.automation) {
          addNotification({ type: 'calendar', title: 'Calendar Event Created', message: `${deadline.title} synced to Google Calendar` });
          addNotification({ type: 'whatsapp', title: 'WhatsApp Reminder Scheduled', message: `Reminder set for ${deadline.title}` });
        }
      }
    } catch (err) {
      // Backend unavailable — local state already has the deadline, so no disruption
      console.warn('[CampusFlow] Backend unavailable, task saved locally only:', err.message);
    }
  }, [addNotification]);

  const deleteDeadline = useCallback(async (id) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
    // Best-effort delete from backend
    tasksAPI.delete(id).catch(() => {});
  }, []);

  const updateDeadlineCompletion = useCallback(async (id, percent) => {
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, completionPercent: percent } : d));
    // Best-effort update in backend
    tasksAPI.update(id, { completionPercent: percent }).catch(() => {});
  }, []);

  return (
    <AppContext.Provider value={{
      activeView, setActiveView,
      darkMode, setDarkMode,
      sidebarOpen, setSidebarOpen,
      deadlines, setDeadlines, addDeadline, deleteDeadline, updateDeadlineCompletion,
      attendance, setAttendance,
      notifications, addNotification, markAllRead, unreadCount,
      showNotifications, setShowNotifications,
      showAIPanel, setShowAIPanel,
      selectedDeadline, setSelectedDeadline,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
