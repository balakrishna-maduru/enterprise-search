// src/services/user_service.ts
import { userStore } from '../store/userStore';
import { User } from '../types/index';

export class UserService {
  // Login with user data and token
  static login(user: User, token: string): void {
    localStorage.setItem('access_token', token);
    userStore.setCurrentUser(user);
  }

  // Logout and clear all user data
  static logout(): void {
    localStorage.setItem('logout_requested', 'true');
    userStore.clearUser();
  }

  // Get current user information
  static getCurrentUser(): User | null {
    return userStore.getCurrentUser();
  }

  // Get current user email (most commonly used)
  static getCurrentUserEmail(): string | null {
    return userStore.getCurrentUserEmail();
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return userStore.isLoggedIn();
  }

  // Update current user information
  static updateUser(user: User): void {
    userStore.setCurrentUser(user);
  }

  // Get user display information
  static getUserDisplayInfo() {
    const user = userStore.getCurrentUser();
    if (!user) return null;

    return {
      name: user.name,
      email: user.email,
      initials: this.getInitials(user.name),
      department: user.department,
      position: user.position,
      role: user.role,
      company: user.company,
      avatar: user.avatar || this.getInitials(user.name),
      color: user.color || this.getDefaultColor(user.name)
    };
  }

  // Generate initials from name
  private static getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  // Generate a consistent color based on name
  private static getDefaultColor(name: string): string {
    const colors = [
      'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600',
      'bg-orange-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600'
    ];
    
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  // Subscribe to user changes
  static subscribe(listener: (user: User | null) => void): () => void {
    return userStore.subscribe(listener);
  }
}

// Export convenience functions
export const {
  login,
  logout,
  getCurrentUser,
  getCurrentUserEmail,
  isAuthenticated,
  updateUser,
  getUserDisplayInfo,
  subscribe
} = UserService;
