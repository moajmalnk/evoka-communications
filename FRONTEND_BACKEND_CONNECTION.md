# Frontend-Backend Connection Setup

This document explains how the frontend is connected to the Django backend API for testing your existing APIs like settings, categories, etc.

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd evoka_communication_backend
python manage.py runserver
```
Backend runs on: `http://localhost:8000`

### 2. Frontend Setup
```bash
cd evoka-communications
npm run dev
```
Frontend runs on: `http://localhost:3000`

### 3. Login (Demo Mode)
- Use the demo login with any of the provided accounts
- Password: `demo123`
- This keeps the original mock authentication while allowing API testing

## 📁 Key Files Created/Modified

### Frontend Files
- `.env` - Environment configuration
- `src/lib/config.ts` - API configuration constants
- `src/lib/api.ts` - Axios instance with interceptors and token management
- `src/lib/auth.ts` - Updated to use real backend APIs
- `src/components/auth/LoginForm.tsx` - Updated to use username instead of email
- `src/components/ApiTest.tsx` - Component to test API connections

### Backend Files
- `evoka_communication_backend/evoka_communication/urls.py` - Added accounts API URLs

## 🔧 Configuration

### Environment Variables (.env)
```env
VITE_APP_BASE_URL=http://localhost:8000/api/v1/
VITE_APP_MEDIA_URL=http://localhost:8000/media/
VITE_APP_DEBUG=true
```

### API Configuration
- **Base URL**: `http://localhost:8000/api/v1/`
- **Authentication**: JWT Bearer tokens
- **Token Refresh**: Automatic with 5-minute threshold
- **CORS**: Configured for localhost:3000

## 🔐 Authentication Flow

**Note**: Login remains as demo/mock authentication. The API connection is set up for testing your existing backend APIs.

1. **Demo Login**: Uses mock users with email/password (demo123)
2. **API Testing**: You can test your backend APIs directly using the API service
3. **No Real Authentication**: The login system is kept as before for demo purposes
4. **API Access**: All API calls are available through the `api` service and `CategoryService`

## 📡 Available API Endpoints

### Category Endpoints (Ready to Test)
- `GET /api/v1/configurations/project-categories/` - Get project categories
- `POST /api/v1/configurations/project-categories/` - Create project category
- `GET /api/v1/configurations/task-categories/` - Get task categories
- `POST /api/v1/configurations/task-categories/` - Create task category
- `GET /api/v1/configurations/department-categories/` - Get department categories
- `POST /api/v1/configurations/department-categories/` - Create department category
- `GET /api/v1/configurations/leave-categories/` - Get leave categories
- `GET /api/v1/configurations/payment-categories/` - Get payment categories
- `GET /api/v1/configurations/finance-categories/` - Get finance categories
- `GET /api/v1/configurations/jobrole-categories/` - Get job role categories

### Authentication Endpoints (Available but not used in demo)
- `GET /api/v1/accounts/roles/` - Get available roles (public)
- `POST /api/v1/accounts/login/` - User login
- `POST /api/v1/accounts/refresh/` - Refresh access token

## 🛠 Usage Examples

### Testing Category APIs

```typescript
import { CategoryService } from '@/lib/categoryService';
import { api } from '@/lib/api';

// Get project categories
const projectCategories = await CategoryService.getProjectCategories();

// Create a new project category
const newCategory = await CategoryService.createProjectCategory({
  name: 'New Project Type',
  description: 'Description here'
});

// Direct API calls
const taskCategories = await api.get('configurations/task-categories/');
const departmentCategories = await api.get('configurations/department-categories/');
```

### Using in React Components

```typescript
import { useEffect, useState } from 'react';
import { CategoryService } from '@/lib/categoryService';

function MyComponent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await CategoryService.getProjectCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      {loading ? 'Loading...' : (
        categories.map(category => (
          <div key={category.id}>{category.name}</div>
        ))
      )}
    </div>
  );
}
```

## 🔄 Token Management

The system automatically handles JWT tokens:

1. **Storage**: Tokens stored in localStorage
2. **Refresh**: Automatic refresh 5 minutes before expiry
3. **Proactive Refresh**: Every 4 minutes
4. **Error Handling**: Redirects to login on token failure
5. **Request Interceptors**: Automatically add auth headers
6. **Response Interceptors**: Handle 401 errors and refresh tokens

## 🧪 Testing the Connection

Use the `ApiTest` component to test the connection:

1. Navigate to the component in your app
2. Click "Test Public API" to test unauthenticated endpoints
3. Click "Test Authenticated API" to test authenticated endpoints
4. Check the response data and error messages

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure backend CORS is configured for localhost:3000
2. **404 Errors**: Check that backend is running and URLs are correct
3. **401 Errors**: Verify login credentials and token refresh logic
4. **Network Errors**: Ensure both frontend and backend are running

### Debug Steps

1. Check browser console for errors
2. Verify .env file configuration
3. Test API endpoints directly (e.g., with Postman)
4. Check backend logs for errors
5. Verify token format in localStorage

## 📝 Next Steps

1. **Create Users**: Set up users in Django admin or create registration endpoint
2. **User Profile**: Implement user profile fetching from backend
3. **Role Management**: Connect frontend roles with backend roles
4. **Error Handling**: Implement user-friendly error messages
5. **Loading States**: Add loading indicators for API calls

## 🔗 Dependencies Added

- `axios` - HTTP client
- `jwt-decode` - JWT token decoding

## 📚 Additional Resources

- [Django REST Framework](https://www.django-rest-framework.org/)
- [JWT Authentication](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Axios Documentation](https://axios-http.com/)
- [React Router](https://reactrouter.com/)
