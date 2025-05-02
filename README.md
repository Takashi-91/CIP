# Secure International Payments Application

A modern, secure payments platform for international transactions built with React, Node.js/Express, and MongoDB.

## 🚀 Features

### Dashboard & Navigation
- Modern dashboard with statistics cards, quick actions, and transaction history
- Sleek, intuitive sidebar navigation with modern iconography
- Responsive design for all screen sizes

### Payments Functionality
- Create and send international payments
- View transaction history with filtering options
- Tabbed interface for easy navigation between new payments and history

### Authentication
- Secure login and registration system
- Interactive modern authentication forms
- Show/hide password functionality
- Form validation with meaningful error messages
- Success confirmation with smooth redirects
- Forgot password functionality

## 🛡️ Security Enhancements

### Input Validation & Sanitization
- Custom MongoDB sanitization middleware to prevent NoSQL injection attacks
- XSS protection with comprehensive input sanitization
- Strong regex patterns for validation:
  - Email: `^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`
  - Password: Minimum 10 characters with uppercase, lowercase, number, and special character
  - Name: Letters and spaces only (2-40 characters)

### HTTP Security
- Helmet configuration optimized for security headers
- HTTPS redirection for production environments
- CORS configured properly for API security

### Authentication & Authorization
- JWT-based authentication with proper secret management
- Protected routes with middleware verification
- Secure password hashing with bcrypt

### Error Handling
- Comprehensive try/catch blocks throughout the application
- Structured error responses to prevent information leakage
- Client-side validation complementing server-side validation

## ✅ Security Requirements Implementation

### 1. Password Security
- Implemented bcrypt for secure password hashing and automatic salting
- Enforced strong password policies (10+ characters with mixed case, numbers, special chars)
- Secure storage with no plain-text passwords ever stored or transmitted
- Password reset flows with secure token-based verification

### 2. Input Validation with RegEx Whitelisting
- All user inputs are strictly validated using RegEx patterns:
  - Implemented whitelist approach rather than blacklist for maximum security
  - Server-side validation prevents bypass of client-side checks
  - Custom sanitization removes potentially dangerous characters
  - Validation implemented at both API and database layers

### 3. SSL/HTTPS Traffic
- All traffic served over SSL in production environments
- Forced HTTPS redirection with appropriate headers
- Secure cookie configuration with httpOnly and secure flags
- TLS protocol enforcement with modern cipher suites

### 4. Protection Against Common Attacks
- **NoSQL Injection**: Custom MongoDB sanitization middleware
- **XSS (Cross-Site Scripting)**: Input sanitization and CSP headers
- **CSRF (Cross-Site Request Forgery)**: Proper token validation
- **Brute Force**: Rate limiting on authentication endpoints
- **Information Disclosure**: Structured error responses
- **Session Hijacking**: Short-lived JWTs and secure cookies
- **MITM Attacks**: HTTPS and HSTS headers

## 🐞 Bug Fixes

- Email validation regex corrected to properly validate all valid email formats
- Server port changed from 8000 to 9000 to prevent conflicts with other services
- API endpoint URLs updated to match the new port configuration
- Resolved dependency issues with problematic packages
- Authentication route protection properly implemented

## 🏗️ Architecture

### Frontend (React)
- Modern component architecture
- React Router for navigation
- Axios for API communication
- Tailwind CSS for responsive styling
- Form state management with React hooks

### Backend (Node.js/Express)
- RESTful API design
- MongoDB for data storage
- Express.js middleware architecture
- JWT for authentication
- Custom middleware for security features

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd secure-international-payments
```

2. Install dependencies for backend
```bash
cd server
npm install
```

3. Install dependencies for frontend
```bash
cd client
npm install
```

4. Setup environment variables
   - Create `.env` in server root with:
```
PORT=9000
MONGO_URI=mongodb+srv://chuenemadimetja911:zKHy768ak8oUlWYk@cluster0.elbmauq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173/
```

### Running the Application

1. Start the backend server
```bash
cd server
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

2. Start the frontend application
```bash
cd client
npm run dev
```

3. Access the application at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:9000/api

## 📱 API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Authenticate a user

### Payments
- POST `/api/payments/create` - Create a new payment (protected)
- GET `/api/payments/history` - Get payment history (protected)
- GET `/api/payments/stats` - Get payment statistics (protected)

## 🎨 UI Improvements

- Gradient backgrounds with modern color schemes
- Animated transitions for improved user experience
- Interactive form elements with proper feedback
- Consistent color palette throughout the application
- Responsive components that work on all device sizes

## 🔒 Security Best Practices

- No sensitive data stored in local storage (only JWTs)
- Regular dependency updates to patch vulnerabilities
- Input validation on both client and server
- Proper error handling to prevent information leakage
- Rate limiting to prevent brute force attacks