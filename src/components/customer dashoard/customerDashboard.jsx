import React, { useState, useEffect } from 'react';

const CustomerDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // TODO: Replace with real API calls
    setBalance(12500.75);
    setTransactions([
      { id: 1, description: 'Sent to Electric Co.', amount: 850, date: '2025-05-28' },
      { id: 2, description: 'Airtime Purchase', amount: 200, date: '2025-05-26' },
      { id: 3, description: 'Water Bill', amount: 300, date: '2025-05-20' }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white shadow rounded-lg p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, John Doe</h1>
            <p className="text-gray-600">Account: 123456789</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Available Balance</p>
            <h2 className="text-3xl font-semibold text-green-600">R {balance.toFixed(2)}</h2>
          </div>
          
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Make a Payment</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Recipient Account Number"
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Amount (ZAR)"
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Payment Reference"
                className="w-full border px-4 py-2 rounded"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send Payment
              </button>
            </form>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <ul className="divide-y divide-gray-200">
              {transactions.map(tx => (
                <li key={tx.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-gray-500 text-sm">{tx.date}</p>
                  </div>
                  <p className="text-right text-red-600 font-bold">- R{tx.amount.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;

