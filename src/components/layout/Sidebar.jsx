// components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCreditCard, FiPieChart, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

export default function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="h-screen bg-pink-400 text-white w-64 py-8 px-4 fixed left-0 top-0 shadow-lg flex flex-col">
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-1">SecurePay</h1>
        <p className="text-xs text-white">International Payments Portal</p>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/dashboard" 
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-pink-white text-white' 
                  : 'text-black hover:bg-white hover:text-black'
              }`}
            >
              <FiHome className="mr-3" size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
         </ul>
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white">
        <button 
          onClick={handleLogout}
          className="flex items-center p-3 rounded-lg w-full text-black hover:bg-red-600 hover:text-white transition-colors"
        >
          <FiLogOut className="mr-3" size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
