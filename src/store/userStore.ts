// src/store/userStore.ts
import { User } from '../types/index';

class UserStore {
  private currentUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Try to load user from localStorage on initialization
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const token = localStorage.getItem('access_token');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        this.currentUser = user;
        console.log('✅ User loaded from localStorage:', user);
      }
    } catch (error) {
      console.error('❌ Error loading user from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Notify listeners
    this.notifyListeners();
    console.log('✅ User set in store:', user);
  }

  clearUser() {
    this.currentUser = null;
    
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('employee_data');
    localStorage.setItem('logout_requested', 'true');
    
    // Notify listeners
    this.notifyListeners();
    console.log('✅ User cleared from store');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    const logoutRequested = localStorage.getItem('logout_requested');
    
    return !!(this.currentUser && token && !logoutRequested);
  }

  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('❌ Error in user store listener:', error);
      }
    });
  }
}

// Create a singleton instance
export const userStore = new UserStore();

// Helper functions for backward compatibility
export const getCurrentUserEmail = (): string | null => {
  const user = userStore.getCurrentUser();
  return user?.email || null;
};

export const getCurrentUserName = (): string => {
  const user = userStore.getCurrentUser();
  return user?.name || '';
};

export const getCurrentUserDepartment = (): string => {
  const user = userStore.getCurrentUser();
  return user?.department || '';
};