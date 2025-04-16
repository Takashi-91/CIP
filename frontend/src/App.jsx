import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Payments from './components/Payments.jsx'
import AuthForm from './components/AuthForm.jsx'
import Home from './pages/Home.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/authform" element={<AuthForm/>} />
        <Route path="/payments" element={<Payments />} />
      </Routes>
    </Router>
  )
}

export default App
