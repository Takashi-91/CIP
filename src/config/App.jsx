import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../style/App.css'
import Payments from '../components/payments/TransactionHistory.jsx'
import AuthForm from '../components/auth/AuthForm.jsx'
import Dashboard from '../components/employee dashboard/Dashboard.jsx'
import Home from '../pages/Index.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  // PrivateRoute component for authenticated routes
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" />
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home/>} />
        <Route path="/authform" element={<AuthForm/>} />
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <PrivateRoute>
              <Payments />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Fallback route - redirect to dashboard if authenticated, otherwise to login */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}

export default App
