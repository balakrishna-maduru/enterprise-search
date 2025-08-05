# Email-Based Login with Direct Elasticsearch Connection

## Overview

The application now supports email-only login that validates users directly against the Elasticsearch employee directory. This eliminates the need for the backend authentication API and provides a streamlined login experience.

## How It Works

1. **Frontend Direct Connection**: The React app connects directly to Elasticsearch using the `@elastic/elasticsearch` JavaScript client
2. **Email Validation**: When a user enters their email, the app searches the `employees` index for an exact match
3. **User Data Loading**: If found, all employee data is loaded and converted to user format
4. **Local Storage**: User data and a simple token are stored in localStorage for session management

## Setup

### Environment Variables
Add to your `.env` file:
```bash
REACT_APP_ELASTICSEARCH_URL=http://localhost:9200
```

### Available Test Emails
Based on the current employee data in Elasticsearch, you can test with these emails:

- `james.wilson@company.com` - CEO
- `sarah.chen@company.com` - CTO  
- `michael.davis@company.com` - CFO
- `jennifer.martinez@company.com` - VP HR
- `robert.brown@company.com` - VP Sales

## Features

### Login Page
- Clean, simple email input field
- Real-time validation against Elasticsearch
- Error handling for invalid emails
- Loading states during validation

### User Data
When logged in, the following employee data is available:
- Basic info: name, email, title, department
- Extended info: location, level, skills, manager, reports
- All data is stored in localStorage as `user` and `employee_data`

### Development Testing
In development mode, test functions are available in browser console:
```javascript
// Test connection and email validation
window.testElasticsearch.testConnection()

// Test employee search functionality  
window.testElasticsearch.testSearch()
```

## Security Considerations

⚠️ **Important**: This direct frontend connection to Elasticsearch should only be used in development or trusted network environments. For production, consider:

1. **Network Security**: Ensure Elasticsearch is only accessible from trusted sources
2. **Authentication**: Add Elasticsearch authentication if needed
3. **CORS Configuration**: Configure Elasticsearch CORS settings appropriately
4. **Data Sensitivity**: Be mindful of what employee data is exposed

## File Structure

```
src/
├── services/
│   ├── elasticsearch_client.ts    # Direct ES client and user validation
├── components/
│   └── Auth/
│       └── LoginPage.tsx          # Updated email-only login form
├── utils/
│   └── testElasticsearch.ts       # Development testing utilities
└── App.tsx                        # Updated with dev test imports
```

## Usage

1. Start Elasticsearch: `http://localhost:9200`
2. Ensure employee data is indexed
3. Start the React app: `npm start`
4. Navigate to `/login`
5. Enter any valid employee email
6. Access granted with full employee profile loaded

## Benefits

- ✅ Simplified login (email only)
- ✅ No backend dependency for authentication
- ✅ Direct access to rich employee data
- ✅ Fast validation against Elasticsearch
- ✅ Full employee profile available in app
- ✅ Easy development and testing
