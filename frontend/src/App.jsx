import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Payments from './components/Payments.jsx'

function Home() {
  return (
    <div>
      <h1>Welcome to the Customer International Payments Portal</h1>
      <Link to="/register">
        <button>Create Free Account</button>
      </Link>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payments" element={<Payments />} />
      </Routes>
    </Router>
  )
}

export default App
