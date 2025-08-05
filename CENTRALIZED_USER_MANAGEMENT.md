# Centralized User Management System

## Overview
This system eliminates hardcoded user emails and provides a centralized way to manage the current user across the entire application.

## Core Components

### 1. User Store (`src/store/userStore.ts`)
- **Purpose**: Centralized state management for user data
- **Features**: 
  - Reactive updates to all components
  - LocalStorage persistence
  - Type-safe user interface
  - Helper functions for common operations

### 2. User Hook (`src/hooks/useUser.ts`)
- **Purpose**: React hook for user state management
- **Features**:
  - Reactive user state updates
  - Login/logout functionality
  - Easy integration with React components

### 3. User Service (`src/services/user_service.ts`)
- **Purpose**: Service layer for user operations
- **Features**:
  - Business logic for user management
  - Display utilities (initials, colors)
  - Subscription management

## Usage Examples

### In React Components
```typescript
import { useUser } from '../hooks/useUser';

function MyComponent() {
  const { user, email, name, isLoggedIn, logout } = useUser();
  
  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Welcome, {name}!</p>
          <p>Email: {email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### In Services/Utils
```typescript
import { getCurrentUserEmail, getCurrentUserName } from '../store/userStore';

function apiCall() {
  const userEmail = getCurrentUserEmail();
  if (!userEmail) {
    throw new Error('User not logged in');
  }
  
  return fetch('/api/data', {
    headers: {
      'X-User-Email': userEmail
    }
  });
}
```

### Login Process
```typescript
import { UserService } from '../services/user_service';

async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  const { access_token, user } = await response.json();
  
  // This will update all components automatically
  UserService.login(user, access_token);
}
```

## Migration Notes

### Before (Hardcoded)
```typescript
// ❌ Don't do this anymore
const user = {
  email: 'admin@enterprise.com',
  name: 'Admin User'
};
```

### After (Centralized)
```typescript
// ✅ Do this instead
import { useUser } from '../hooks/useUser';

function Component() {
  const { user, email, name } = useUser();
  // User data automatically updates when user logs in/out
}
```

## Files Updated

### Frontend Files
- `src/store/userStore.ts` - New centralized user store
- `src/hooks/useUser.ts` - New React hook for user management
- `src/services/user_service.ts` - New user service layer
- `src/components/Auth/ProtectedRoute.tsx` - Updated to use centralized store
- `src/services/api_service.ts` - Updated to use dynamic user email
- `src/data/users.ts` - Updated with current user helper
- `src/contexts/SearchContext.tsx` - Updated to use current user data
- `src/hooks/useApiSearch.ts` - Updated to use current user email

### Backend Files (Notes Added)
- `api/middleware/auth.py` - Added comments about centralized management

## Benefits

1. **No More Hardcoded Emails**: All user references are now dynamic
2. **Reactive Updates**: When user logs in/out, all components update automatically
3. **Type Safety**: Strong TypeScript types for user data
4. **Centralized Storage**: Single source of truth for user information
5. **Easy Testing**: User data can be easily mocked for testing
6. **Better Maintainability**: Changes to user structure only need to be made in one place

## Testing

You can test the user store functionality by running in the browser console:
```javascript
// Test the user store
testUserStore();
```

## Future Enhancements

1. Add user preferences management
2. Implement user profile editing
3. Add user avatar upload functionality
4. Implement role-based access control
5. Add user activity tracking
