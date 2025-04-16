import { useState, useEffect } from 'react'

function Payments() {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    recipient: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const fetchHistory = async () => {
    if (!token) {
      setError('You must be logged in to view payment history.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:8000/api/payments/history', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      } else {
        setError('Failed to fetch payment history.')
      }
    } catch {
      setError('Error connecting to server.')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!token) {
      setError('You must be logged in to create a payment.')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/payments/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(data.msg || 'Payment successful.')
        setFormData({ amount: '', currency: 'USD', recipient: '' })
        fetchHistory()
      } else {
        setError(data.msg || 'Payment failed.')
      }
    } catch {
      setError('Error connecting to server.')
    }
  }

  return (
    <div>
      <h2>Create Payment</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount:</label><br />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label>Currency:</label><br />
          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            {/* Add more currencies as needed */}
          </select>
        </div>
        <div>
          <label>Recipient:</label><br />
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Send Payment</button>
      </form>

      <h2>Payment History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <p>No payment history found.</p>
      ) : (
        <ul>
          {history.map((payment) => (
            <li key={payment._id}>
              {payment.date ? new Date(payment.date).toLocaleString() : ''} - {payment.amount} {payment.currency} to {payment.recipient}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Payments
