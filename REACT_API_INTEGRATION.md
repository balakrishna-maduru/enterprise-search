# React Frontend Integration with Python API

This document explains how the React frontend has been updated to work with the new Python API layer.

## 🔄 **Dual Mode Operation**

The React app now supports two modes:

### **API Mode (Recommended)**
- Uses Python API backend for all Elasticsearch and LLM calls
- Requires user authentication with JWT tokens
- Provides enhanced security and user context
- Enables role-based search boosting

### **Legacy Mode (Fallback)**
- Direct frontend calls to Elasticsearch and OpenAI
- No authentication required
- Uses the original implementation

## ⚙️ **Configuration**

Set in your `.env` file:

```bash
# Use new Python API (recommended)
REACT_APP_USE_API_LAYER=true
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1

# Legacy mode (fallback)
REACT_APP_USE_API_LAYER=false
# Plus all the original Elasticsearch/OpenAI config variables
```

## 🔧 **Key Changes Made**

### **1. Unified User Context**
- Created `useUnifiedUser` hook that works with both API and legacy modes
- Automatically switches between contexts based on configuration
- All components now use this unified approach

### **2. Enhanced Search Context**
- `SearchContext` now chooses between API and legacy hooks
- Provides `generateChatResponse`, `generateSummary`, `generateComprehensiveSummary`
- **All LLM functions automatically route through API when enabled**
- Maintains same interface for backward compatibility

### **3. LLM Integration (API Mode)**
- ✅ **All summarization features now use Python API**
- ✅ **Chat functionality routes through API with user context**
- ✅ **Components no longer make direct OpenAI calls**
- ✅ **User identity automatically included in all LLM requests**
- ✅ **Fallback responses when API unavailable**

### **4. Authentication Integration**
- New `AuthStatus` component shows login/logout in API mode
- JWT token management with automatic refresh
- User selection with role-based permissions

### **5. Error Handling & Fallbacks**
- Graceful fallback to demo mode when API unavailable
- Clear error messages and fallback responses  
- Maintains functionality even when services are down

## 🚀 **Usage**

### **Starting in API Mode**

1. **Start the Python API**:
   ```bash
   cd api
   python run.py
   ```

2. **Configure React for API mode**:
   ```bash
   # In your .env file
   REACT_APP_USE_API_LAYER=true
   REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. **Start React app**:
   ```bash
   npm start
   ```

4. **Authenticate**: Click the "Login" button and select a user

### **Starting in Legacy Mode**

1. **Configure React for legacy mode**:
   ```bash
   # In your .env file
   REACT_APP_USE_API_LAYER=false
   # Plus your Elasticsearch and OpenAI credentials
   ```

2. **Start React app**:
   ```bash
   npm start
   ```

## 🔐 **Authentication Flow (API Mode)**

1. **User Selection**: Choose from available demo users
2. **JWT Token**: Receive secure JWT token from API
3. **Authenticated Requests**: All API calls include user context
4. **Role-based Features**: Search results boosted based on user role
5. **Session Management**: Automatic token refresh and logout

## 🧩 **Component Updates**

### **Components Updated**
- ✅ `SearchContext.js` - Uses unified hooks
- ✅ `UserSelector.js` - Uses `useUnifiedUser`
- ✅ `ChatSidebar.js` - Uses search context methods
- ✅ `AuthStatus.js` - Shows authentication status
- ✅ All result and summary components

### **Hooks Updated**
- ✅ `useUnifiedUser.js` - Handles both user contexts
- ✅ `useApiSearch.js` - API-based search functionality
- ✅ `useApiLLM.js` - API-based LLM functionality
- ✅ `useAuth.js` - JWT authentication management

## 🎯 **Benefits of API Mode**

1. **Security**: Credentials never exposed to frontend
2. **User Context**: All operations include user identity
3. **Role-based Access**: Executives get enhanced search results
4. **Centralized Logic**: Business logic in secure backend
5. **Audit Trail**: All requests logged with user context
6. **Rate Limiting**: Can implement API quotas and throttling

## 🔍 **Testing & Troubleshooting**

### **Check Configuration**
```bash
# Test API connectivity
curl http://localhost:8000/api/v1/health

# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/users
```

### **Common Issues**

1. **"useUser must be used within a UserProvider"**
   - Fixed by implementing `useUnifiedUser` hook
   - Automatically handles context switching

2. **API Connection Errors**
   - App falls back to demo mode automatically
   - Check API server is running on correct port

3. **Authentication Issues**
   - Clear browser localStorage
   - Restart both API and React app
   - Check API logs for errors

### **Debug Mode**
Set `REACT_APP_DEBUG=true` for detailed console logging.

## 📊 **Performance Considerations**

- **API Mode**: Slightly higher latency due to extra HTTP layer
- **Legacy Mode**: Direct connections, faster response times
- **Caching**: API can implement response caching
- **Batching**: API can batch multiple operations

## 🔮 **Future Enhancements**

- [ ] Response caching in API layer
- [ ] WebSocket support for real-time updates
- [ ] Advanced role-based permissions
- [ ] API rate limiting per user
- [ ] Enhanced audit logging
- [ ] Multi-tenant support

The React app now provides a seamless experience with enhanced security and user awareness while maintaining full backward compatibility!