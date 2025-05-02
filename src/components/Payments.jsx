import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiSend, FiAlertCircle, FiCheckCircle, FiDollarSign, 
  FiGlobe, FiUser, FiClock, FiCalendar
} from 'react-icons/fi'
import Sidebar from './Sidebar'

function Payments() {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    recipient: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('new')
  
  const navigate = useNavigate()

  // Currency options with symbols
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ]

  // Validation patterns - matching backend patterns
  const patterns = {
    amount: /^(?!0+\.?0*$)(\d{1,10}(\.\d{1,2})?)$/,
    currency: /^[A-Z]{3}$/,
    recipient: /^[A-Za-z0-9\s,.'\-]{2,50}$/
  }

  const token = localStorage.getItem('token')

  // Basic sanitization function
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    // Remove HTML tags and trim
    return input.replace(/<[^>]*>?/gm, '').trim();
  }

  useEffect(() => {
    // Check if user is logged in
    if (!token) {
      navigate('/')
      return
    }
    
    fetchHistory()
  }, [navigate, token])

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Sanitize text inputs
    if (e.target.name !== 'amount') {
      value = sanitizeInput(value);
    }
    
    // For amount, only allow numeric inputs with decimals
    if (e.target.name === 'amount' && value !== '') {
      if (!/^\d*\.?\d{0,2}$/.test(value)) {
        return; // Reject invalid inputs
      }
    }
    
    setFormData({ ...formData, [e.target.name]: value })
  }

  const validateInputs = () => {
    const errors = {}

    // Amount validation
    if (!formData.amount) {
      errors.amount = 'Amount is required'
    } else if (!patterns.amount.test(formData.amount)) {
      errors.amount = 'Enter a valid amount (greater than 0 with max 2 decimal places)'
    } else if (parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0'
    } else if (parseFloat(formData.amount) > 1000000) {
      errors.amount = 'Amount exceeds maximum limit'
    }

    // Recipient validation
    if (!formData.recipient) {
      errors.recipient = 'Recipient name is required'
    } else if (!patterns.recipient.test(formData.recipient)) {
      errors.recipient = 'Enter a valid recipient name (2-50 characters, alphanumeric and basic punctuation only)'
    }

    // Currency validation
    if (!formData.currency) {
      errors.currency = 'Currency is required'
    } else if (!patterns.currency.test(formData.currency)) {
      errors.currency = 'Invalid currency format'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const fetchHistory = async () => {
    if (!token) {
      setError('You must be logged in to view payment history.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:9000/api/payments/history', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache' 
        },
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          setError('Session expired. Please login again.')
          return
        }
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setHistory(data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Error connecting to server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setFieldErrors({})

    if (!token) {
      setError('You must be logged in to create a payment.')
      return
    }

    if (!validateInputs()) {
      return
    }

    try {
      // Create sanitized payload
      const payload = {
        amount: parseFloat(formData.amount),
        currency: sanitizeInput(formData.currency),
        recipient: sanitizeInput(formData.recipient)
      }
      
      const response = await fetch('http://localhost:9000/api/payments/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage(data.msg || 'Payment successful.')
        setFormData({ amount: '', currency: 'USD', recipient: '' })
        fetchHistory()
        // Switch to history tab to show the new payment
        setActiveTab('history')
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token')
          setError('Session expired. Please login again.')
        } else {
          setError(data.msg || 'Payment failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('Error connecting to server. Please try again later.')
    }
  }

  const getStatusBadge = (status = 'completed') => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCheckCircle className="mr-1" />
          Completed
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FiClock className="mr-1" />
          Pending
        </span>
      )
    }
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">International Payments</h1>
        </header>
        
        <main className="px-8 py-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab('new')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'new'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiSend className="mr-2" />
                New Payment
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiClock className="mr-2" />
                Payment History
              </button>
            </nav>
          </div>
          
          {activeTab === 'new' ? (
            <div className="bg-white shadow-sm rounded-xl p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Create New Payment</h2>
              
              {message && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 flex items-start">
                  <FiCheckCircle className="mr-3 mt-0.5" size={18} />
                  <span>{message}</span>
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-start">
                  <FiAlertCircle className="mr-3 mt-0.5" size={18} />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Amount and Currency Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiDollarSign className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="amount"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                          placeholder="0.00"
                          inputMode="decimal"
                          min="0.01"
                          step="0.01"
                          maxLength={13}
                          className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                            fieldErrors.amount ? 'border-red-300' : ''
                          }`}
                        />
                      </div>
                      {fieldErrors.amount && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.amount}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiGlobe className="text-gray-400" />
                        </div>
                        <select
                          id="currency"
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          required
                          className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                            fieldErrors.currency ? 'border-red-300' : ''
                          }`}
                        >
                          {currencies.map(currency => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name} ({currency.symbol})
                            </option>
                          ))}
                        </select>
                      </div>
                      {fieldErrors.currency && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.currency}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Recipient Input */}
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="recipient"
                        name="recipient"
                        value={formData.recipient}
                        onChange={handleChange}
                        required
                        pattern="^[A-Za-z0-9\s,.'\-]{2,50}$"
                        title="Enter a valid recipient name (2-50 characters, alphanumeric and basic punctuation only)"
                        maxLength={50}
                        placeholder="Recipient's full name"
                        className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                          fieldErrors.recipient ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {fieldErrors.recipient && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.recipient}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FiSend className="mr-2" />
                      Send Payment
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading payment history...</p>
                </div>
              ) : error ? (
                <div className="p-8">
                  <div className="flex items-center justify-center p-4 rounded-lg bg-red-50 text-red-700">
                    <FiAlertCircle className="mr-3" size={18} />
                    <span>{error}</span>
                  </div>
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No payment history found.</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <FiSend className="mr-2" />
                    Make your first payment
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recipient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiCalendar className="mr-2 text-gray-400" />
                              {payment.date ? new Date(payment.date).toLocaleDateString() : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                                {payment.recipient.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {payment.recipient}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="font-medium">
                              {payment.amount.toFixed(2)} {payment.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getStatusBadge(payment.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Payments
