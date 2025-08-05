// src/components/Auth/index.ts
export { default as LoginPage } from './LoginPage';
export { default as LogoutButton } from './LogoutButton';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as UserProfile } from './UserProfile';
// Note: AuthProvider and useAuth have been replaced with centralized user management
// Use useUser from '../../hooks/useUser' and userStore from '../../store/userStore' instead