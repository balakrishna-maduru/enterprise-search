// src/store/userStore.ts
import { User } from '../types/index';

class UserStore {
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  // Set current user and notify all listeners
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    this.notifyListeners();
    
    // Update localStorage
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    if (!this.currentUser) {
      // Try to get from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          this.clearUser();
        }
      }
    }
    return this.currentUser;
  }

  // Clear user data
  clearUser(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    this.notifyListeners();
  }

  // Subscribe to user changes
  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of user changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // Get user email (most commonly used)
  getCurrentUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email || null;
  }

  // Get user name
  getCurrentUserName(): string {
    const user = this.getCurrentUser();
    return user?.name || 'Unknown User';
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser() && !!localStorage.getItem('access_token');
  }

  // Get user role
  getCurrentUserRole(): string {
    const user = this.getCurrentUser();
    return user?.role || 'employee';
  }

  // Get user department
  getCurrentUserDepartment(): string {
    const user = this.getCurrentUser();
    return user?.department || '';
  }

  // Get user position
  getCurrentUserPosition(): string {
    const user = this.getCurrentUser();
    return user?.position || '';
  }

  // Get user company
  getCurrentUserCompany(): string {
    const user = this.getCurrentUser();
    return user?.company || '';
  }
}

// Create singleton instance
export const userStore = new UserStore();

// Export helper functions for easy access
export const getCurrentUser = (): User | null => userStore.getCurrentUser();
export const getCurrentUserEmail = (): string | null => userStore.getCurrentUserEmail();
export const getCurrentUserName = (): string => userStore.getCurrentUserName();
export const setCurrentUser = (user: User | null): void => userStore.setCurrentUser(user);
export const clearCurrentUser = (): void => userStore.clearUser();
export const isUserLoggedIn = (): boolean => userStore.isLoggedIn();
export const getCurrentUserRole = (): string => userStore.getCurrentUserRole();
export const getCurrentUserDepartment = (): string => userStore.getCurrentUserDepartment();
export const getCurrentUserPosition = (): string => userStore.getCurrentUserPosition();
export const getCurrentUserCompany = (): string => userStore.getCurrentUserCompany();
