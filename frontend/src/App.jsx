import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Payments from './components/Payments.jsx'
import AuthForm from './components/AuthForm.jsx'
import Home from './pages/Home.jsx'
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import User from "./pages/User";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/authform" element={<AuthForm/>} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/user" element={<User />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
