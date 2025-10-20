# LANE Rideshare Platform - React Frontend

This is the React-based frontend for the LANE Rideshare Platform, built with Vite for optimal development experience and production performance.

## 🚀 Tech Stack

- **React** 18.2.0 - UI library
- **React Router** 6.x - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication
- **Vite** - Build tool and dev server

## 📁 Project Structure

```
client/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # Common UI components
│   │   └── layout/      # Layout components
│   ├── pages/           # Page-level components
│   │   ├── auth/        # Login, Register, ForgotPassword
│   │   ├── rides/       # Ride search, post, details
│   │   ├── bookings/    # Booking management
│   │   ├── admin/       # Admin dashboard
│   │   └── user/        # User dashboard, profile
│   ├── contexts/        # React Context providers
│   ├── services/        # API service layer
│   ├── utils/           # Utility functions
│   │   ├── constants.js # Application constants
│   │   ├── helpers.js   # Helper functions
│   │   └── validation.js# Form validation utilities
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🛠️ Development

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

```bash
cd client
npm install
```

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🔌 API Integration

The frontend communicates with the backend API running on `http://localhost:5000`. The API proxy is configured in `vite.config.js`:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

## 🔐 Authentication

Authentication is handled using JWT tokens stored in localStorage. The `AuthContext` provides:

- User authentication state
- Login/logout methods
- Protected route handling
- Token management

## 📦 Key Features

### Implemented
- ✅ Project structure and configuration
- ✅ Routing setup with React Router
- ✅ API service layer with organized methods
- ✅ Authentication pages (Login, Register, ForgotPassword)
- ✅ Validation utilities
- ✅ Helper functions (storage, formatting, etc.)
- ✅ Constants and API endpoints

### In Progress
- 🔄 Dashboard components
- 🔄 Ride search and posting
- 🔄 Booking management
- 🔄 Real-time tracking
- 🔄 Chat functionality
- 🔄 SOS emergency features

## 🎨 Styling

Currently using plain CSS with a gradient-based design system:
- Primary color: `#667eea` (Purple)
- Secondary color: `#764ba2` (Darker purple)
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

Future plans: Consider migrating to Tailwind CSS or styled-components for better maintainability.

## 🧪 Testing

Testing setup coming soon with:
- Vitest for unit tests
- React Testing Library for component tests

## 📝 Code Quality

- ESLint for code linting
- Prettier for code formatting (to be added)

## 🤝 Contributing

This is a team project with the following contributors:
- **Mohan** - Team Lead, API integration, utilities
- **Dinesh** - Authentication pages and flows
- **Karthik** - Dashboard and ride components
- **Sujal** - Search and matching features
- **Akshaya** - Booking flow

## 📄 License

This project is part of an academic submission.

---

Built with ❤️ by Team LANE
