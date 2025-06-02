import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../style/App.css'
import Payments from '../components/payments/TransactionHistory.jsx'
import AuthForm from '../components/auth/AuthForm.jsx'
import Dashboard from '../components/employee dashboard/Dashboard.jsx'
import Home from '../pages/Index.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState(null)

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')
    setIsAuthenticated(!!token)
    setRole(storedRole)
  }, [])

  // Function to update auth state after login/logout
  const updateAuth = () => {
    const token = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')
    setIsAuthenticated(!!token)
    setRole(storedRole)
  }

  // PrivateRoute component for authenticated routes
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" />
  }

  // Role-based dashboard redirection
  const DashboardRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/" />
    if (role === 'employee') return <Navigate to="/admin-dashboard" />
    if (role === 'customer') return <Navigate to="/customer-dashboard" />
    return <Navigate to="/" />
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
          element={<DashboardRedirect />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <PrivateRoute>
              <Dashboard isAdmin={true} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/customer-dashboard" 
          element={
            <PrivateRoute>
              <Dashboard isAdmin={false} />
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
        <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
