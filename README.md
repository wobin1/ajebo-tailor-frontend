# Ajebo Tailor Frontend

A modern e-commerce frontend built with Next.js 15, React 19, and TypeScript for the Ajebo Tailor custom tailoring platform.

## Features

- **Authentication**: JWT-based authentication with automatic token refresh
- **Product Catalog**: Browse and search products with advanced filtering
- **Shopping Cart**: Persistent cart with real-time updates
- **Order Management**: Complete order lifecycle and history
- **User Profiles**: Account management and settings
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **State Management**: React Context API
- **Authentication**: JWT tokens with automatic refresh
- **HTTP Client**: Custom API client with error handling
- **Type Safety**: TypeScript with strict mode

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Backend API running on port 8000 (see backend-api README)

### Installation

1. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Environment Configuration**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## API Integration

The frontend integrates with the FastAPI backend through:

### Authentication Service (`/src/services/authApi.ts`)
- JWT token management with automatic refresh
- Secure token storage in localStorage
- Authentication state management
- Error handling and retry logic

### API Client (`/src/services/api.ts`)
- Authenticated HTTP requests
- Automatic token refresh on 401 errors
- Standardized error handling
- Mock data fallback for development

### Authentication Context (`/src/context/AuthContext.tsx`)
- Global authentication state
- Login, register, logout functionality
- User profile management
- Error state handling

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

## Authentication Flow

1. **Login/Register**: User credentials sent to `/api/v1/auth/login` or `/api/v1/auth/register`
2. **Token Storage**: JWT tokens stored securely in localStorage
3. **Automatic Refresh**: Access tokens refreshed automatically when expired
4. **Protected Routes**: Authentication required for user-specific features
5. **Logout**: Tokens cleared and user session terminated

## API Endpoints Integration

The frontend connects to these backend endpoints:

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration  
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/change-password` - Change password

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/addresses` - Get user addresses
- `POST /api/v1/users/addresses` - Create address

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   └── ...                # Feature components
├── context/               # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   ├── CartContext.tsx    # Shopping cart state
│   └── AppProvider.tsx    # Combined providers
├── services/              # API services
│   ├── authApi.ts         # Authentication API
│   └── api.ts             # General API client
├── types/                 # TypeScript type definitions
├── lib/                   # Utility functions and mock data
└── hooks/                 # Custom React hooks
```

## Development

### Running Tests
```bash
npm run test
# or
yarn test
```

### Building for Production
```bash
npm run build
# or
yarn build
```

### Linting
```bash
npm run lint
# or
yarn lint
```

## Error Handling

The application includes comprehensive error handling:

- **API Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Automatic token refresh and re-authentication
- **Network Errors**: User-friendly error messages
- **Error Boundaries**: React error boundaries for component crashes

## Security Features

- **JWT Token Management**: Secure storage and automatic refresh
- **CORS Protection**: Configured for backend API
- **XSS Protection**: Content Security Policy headers
- **Input Validation**: Client-side validation with server-side verification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
