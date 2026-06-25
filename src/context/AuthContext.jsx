import { createContext, useContext, useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cf_user';

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const isAuthenticated = !!user;
  const hasOnboarded = !!user?.onboarded;

  // Sync user to localStorage whenever it changes
  useEffect(() => {
    saveUser(user);
  }, [user]);

  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 1200));

    let dbUser = null;
    try {
      const response = await studentsAPI.getByEmail(email);
      if (response && response.success && response.student) {
        const s = response.student;
        dbUser = {
          email: s.email,
          name: s.name,
          avatar: (s.name || 'U')[0].toUpperCase(),
          phone: s.phone,
          branch: s.branch,
          semester: s.semester,
          rollNo: s.roll_no,
          onboarded: true,
        };
      }
    } catch (err) {
      console.warn('Could not fetch student profile from Supabase on login:', err.message);
    }

    const existingUser = loadUser();
    // Fallback to local storage or create a basic user object with onboarded: false
    const restoredUser = dbUser || (existingUser?.email === email
      ? existingUser
      : { email, name: email.split('@')[0], avatar: email[0].toUpperCase(), onboarded: false });

    setUser(restoredUser);
    return { success: true };
  };

  const register = async (name, email, password) => {
    await new Promise(r => setTimeout(r, 1400));
    const newUser = { email, name, avatar: name[0].toUpperCase(), onboarded: false };
    setUser(newUser);
    return { success: true };
  };

  /**
   * Called when onboarding completes.
   * Saves student profile to Supabase and updates frontend state.
   */
  const completeOnboarding = async (data) => {
    const updated = {
      ...user,
      name: data.fullName || user?.name,
      avatar: (data.fullName || user?.name || 'U')[0].toUpperCase(),
      university: data.university || null,
      branch: data.branch || null,
      year: data.year || null,
      semester: data.semester ? `${data.semester}th Semester` : null,
      rollNo: data.rollNo || null,
      subjects: data.subjects || [],
      phone: data.phone ? `${data.countryCode || '+91'}${data.phone}` : null,
      whatsapp: data.whatsapp || null,
      contactEmail: data.contactEmail || user?.email,
      onboarded: true,
    };

    try {
      await studentsAPI.create({
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        branch: updated.branch,
        semester: updated.semester,
        rollNo: updated.rollNo,
      });
    } catch (err) {
      console.error('Failed to save student profile in Supabase during onboarding:', err);
    }

    setUser(updated);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated, hasOnboarded, user,
      login, register, completeOnboarding, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
