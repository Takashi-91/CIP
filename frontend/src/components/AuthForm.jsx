import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setMessage('');
    setError('');
    setIsLogin(!isLogin);
  };

 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:8000/api/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', response.data.token);
        setMessage('Login successful!');
        navigate('/payments');
      } else {
        const response = await axios.post('http://localhost:8000/api/auth/register', formData);
        setMessage(response.data.msg || 'Registration successful! You can now log in.');
        setFormData({ name: '', email: '', password: '' });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.msg || (isLogin ? 'Login failed.' : 'Registration failed.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 ">
      <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-lg bg-gradient-to-br from-pink-100 via-white to-pink-200 overflow-hidden relative">

        {/* Animated Sliding Right Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-1/2 bg-pink-400 text-white flex flex-col items-center justify-center p-10 rounded-l-[80px] z-10 transition-all duration-500 transform ${
            isLogin ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">
            {isLogin ? 'Welcome Back!' : ''}
          </h2>
          <p className="text-white text-sm mb-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={toggleForm}
            className="px-6 py-2 border border-white text-white rounded-md hover:bg-white hover:text-pink-400 transition font-semibold"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>


        </div>

        {/* Left Side Form */}
        <div className="w-1/2 p-10 flex flex-col justify-center z-0">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {isLogin ? 'Login' : 'Registration'}
          </h2>

          {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}
          {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-200 rounded-md placeholder-gray-500 text-gray-800 focus:outline-none"
                />
                <FiUser className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            )}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-200 rounded-md placeholder-gray-500 text-gray-800 focus:outline-none"
              />
              <FiMail className="absolute left-3 top-3.5 text-gray-500" />
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-200 rounded-md placeholder-gray-500 text-gray-800 focus:outline-none"
              />
              <FiLock className="absolute left-3 top-3.5 text-gray-500" />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-400 hover:bg-pink-500 text-white py-3 rounded-md font-semibold transition"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="text-sm text-center text-gray-600 mt-4">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={toggleForm}
              className="text-pink-500 font-semibold hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
