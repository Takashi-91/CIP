import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiArrowUpRight, FiArrowDownLeft, FiCreditCard, FiPieChart, 
  FiDollarSign, FiShield, FiGlobe, FiRefreshCw 
} from 'react-icons/fi';
import Sidebar from '../layout/Sidebar';
import UserManagement from './UserManagement';

export default function Dashboard({ isAdmin }) {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    totalTransactions: 0,
    monthlyVolume: 0,
    pendingTransfers: 0,
    savedRecipients: 0,
  });
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        setUser({
          name: 'BHekile Mngwenya',
          email: 'alex@example.com',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        });

        if (isAdmin) {
          setStats({
            totalTransactions: 100,
            monthlyVolume: 50000,
            pendingTransfers: 5,
            savedRecipients: 20,
          });
          setTransactions([]);
        } else {
          const response = await axios.get('http://localhost:9000/api/transactions/history', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTransactions(response.data);
          const totalTransactions = response.data.length;
          const monthlyVolume = response.data.reduce((sum, tx) => sum + tx.amount, 0);
          const pendingTransfers = response.data.filter(tx => tx.status === 'pending').length;
          setStats({
            totalTransactions,
            monthlyVolume,
            pendingTransfers,
            savedRecipients: 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data or transactions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, isAdmin]);

  const handleNewPayment = () => {
    navigate('/payments');
  };

  if (isAdmin) {
    return (
      <div className="flex bg-transparent min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <header className="bg-transparent px-8 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-pink-400">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleNewPayment}
                className="bg-pink-400 hover:bg-white rounded-3xl shadow-lg bg-gradient-to-br from-pink-800 via-white to-pink-200 text-gray-500 py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <FiCreditCard className="mr-2" />
                <span>New Payment</span>
              </button>
              <div className="flex items-center">
                <img 
                  src={user.avatar || 'https://via.placeholder.com/40'} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-indigo-200"
                />
                <span className="ml-3 font-medium text-gray-700">{user.name || 'Admin'}</span>
              </div>
            </div>
          </header>
          <main className="px-8 py-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">User Management</h2>
            <UserManagement />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-transparent min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="bg-transparent px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-pink-400">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleNewPayment}
              className="bg-pink-400 hover:bg-white rounded-3xl shadow-lg bg-gradient-to-br from-pink-800 via-white to-pink-200 text-gray-500 py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <FiCreditCard className="mr-2" />
              <span>New Payment</span>
            </button>
            <div className="flex items-center">
              <img 
                src={user.avatar || 'https://via.placeholder.com/40'} 
                alt="User" 
                className="w-10 h-10 rounded-full border-2 border-indigo-200"
              />
              <span className="ml-3 font-medium text-gray-700">{user.name || 'User'}</span>
            </div>
          </div>
        </header>
        <main className="px-8 py-6">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={handleNewPayment}
                className="flex items-center justify-center bg-white hover:bg-blue-50 border border-gray-200 p-4 rounded-lg text-blue-600 transition-colors"
              >
                <FiCreditCard className="mr-2" size={18} />
                <span>New Payment</span>
              </button>
              <button className="flex items-center justify-center bg-white hover:bg-blue-50 border border-gray-200 p-4 rounded-lg text-blue-600 transition-colors">
                <FiPieChart className="mr-2" size={18} />
                <span>View Reports</span>
              </button>
              <button className="flex items-center justify-center bg-white hover:bg-blue-50 border border-gray-200 p-4 rounded-lg text-blue-600 transition-colors">
                <FiShield className="mr-2" size={18} />
                <span>Security Settings</span>
              </button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Recent Transactions</h2>
              <button 
                onClick={() => navigate('/payments')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                View All
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        {transaction.recipient ? transaction.recipient.name || transaction.recipient.email : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
