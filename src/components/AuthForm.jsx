import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validation patterns - matching backend patterns
  const patterns = {
    email: /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/\\])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/\\]{10,}$/,
    name: /^[A-Za-z\s]{2,40}$/
  };

  const toggleForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setMessage('');
    setError('');
    setFieldErrors({});
    setIsLogin(!isLogin);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Basic sanitization function
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    // Remove HTML tags and trim
    return input.replace(/<[^>]*>?/gm, '').trim();
  };

  const handleChange = (e) => {
    // Sanitize the input value before setting state
    const sanitizedValue = sanitizeInput(e.target.value);
    setFormData({ ...formData, [e.target.name]: sanitizedValue });
  };

  const validateInputs = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!patterns.email.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isLogin && !patterns.password.test(formData.password)) {
      errors.password = 'Password must be at least 10 characters with uppercase, lowercase, number, and special character';
    } else if (isLogin && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Name validation (only for registration)
    if (!isLogin) {
      if (!formData.name) {
        errors.name = 'Name is required';
      } else if (!patterns.name.test(formData.name)) {
        errors.name = 'Name must contain only letters and spaces (2-40 characters)';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validateInputs()) return;

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:9000/api/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', response.data.token);
        setMessage('Login successful! Redirecting to dashboard...');
        
        // Add a small delay before redirecting to show the success message
        setTimeout(() => {
          navigate('/payments');
        }, 700);
      } else {
        const response = await axios.post('http://localhost:9000/api/auth/register', formData);
        setMessage(response.data.msg || 'Registration successful! You can now log in.');
        setFormData({ name: '', email: '', password: '' });
        setIsLogin(true);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data.msg || 'Invalid input.');
        } else if (err.response.status === 401) {
          setError(err.response.data.msg || 'Unauthorized access.');
        } else if (err.response.status === 429) {
          setError('Too many attempts. Please try again later.');
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('An unexpected error occurred.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-transparent">
      <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden bg-white rounded-3xl shadow-lg bg-gradient-to-br from-pink-100 via-white to-pink-200 relative">
        
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Login' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mb-6">
            {isLogin 
              ? 'Sign in to access your account' 
              : 'Register to start making secure international payments'}
          </p>

          {message && <div className="mb-4 p-3 rounded-md bg-green-50 text-green-700 text-sm">{message}</div>}
          {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={40}
                  required
                  pattern="^[A-Za-z\s]{2,40}$"
                  title="Name must contain only letters and spaces (2-40 characters)"
                  className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 text-gray-800  focus:border-indigo-500 py-3 ${
                    fieldErrors.name ? 'border-red-300' : ''
                  }`}
                />
                <FiUser className="absolute left-3 top-3.5 text-gray-500" />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                )}
              </div>
            )}
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                maxLength={100}
                required
                pattern="^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                title="Enter a valid email address"
                className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 text-gray-800 focus:border-indigo-500 py-3 ${
                  fieldErrors.email ? 'border-red-300' : ''
                }`}
              />
              <FiMail className="absolute left-3 top-3.5 text-gray-500" />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                maxLength={100}
                required
                title={!isLogin ? "Password must be at least 10 characters with uppercase, lowercase, number, and special character" : "Enter your password"}
                className={`pl-10 pr-10 block w-full rounded-md text-gray-800 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 ${
                  fieldErrors.password ? 'border-red-300' : ''
                }`}
              />
              <FiLock className="absolute left-3 top-3.5 text-gray-500" />
              <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
              {!isLogin && !fieldErrors.password && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 10 characters with uppercase, lowercase, number, and special character.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-pink-400 text-white py-3 rounded-md font-semibold transition shadow-md"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {isLogin && (
            <div className="text-center mt-4">
              <a href="#" className="text-sm text-pink-400 hover:text-indigo-800">
                Forgot your password?
              </a>
            </div>
          )}

          <div className="text-sm text-center text-gray-600 mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={toggleForm}
              className="text-pink-400 font-semibold hover:underline"
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
