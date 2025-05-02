import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const pieData = [
  { name: "North America", value: 350, color: "#2563EB" },
  { name: "Europe", value: 300, color: "#10B981" },
  { name: "Asia", value: 450, color: "#F59E0B" },
  { name: "Africa", value: 200, color: "#EF4444" },
];

const lineData = [
  { name: "Jan", Deposits: 24000, Withdrawals: 14000 },
  { name: "Feb", Deposits: 28000, Withdrawals: 16000 },
  { name: "Mar", Deposits: 32000, Withdrawals: 18000 },
  { name: "Apr", Deposits: 29000, Withdrawals: 17000 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow p-4 fixed w-full z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">BankX Dashboard</h1>
          <ul className="flex space-x-6 text-gray-700 text-sm font-medium">
            <li><a href="/accounts" className="hover:text-blue-600">Accounts</a></li>
            <li><a href="/transactions" className="hover:text-blue-600">Transactions</a></li>
            <li><a href="/approvals" className="hover:text-blue-600">Approvals</a></li>
            <li><a href="/support" className="hover:text-blue-600">Support</a></li>
          </ul>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="pt-24 px-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Welcome back, Bank Manager</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Deposits" value="$1.25M" icon="💰" color="bg-green-100" />
          <StatCard title="Pending Transfers" value="43" icon="⏳" color="bg-yellow-100" />
          <StatCard title="New Accounts" value="312" icon="👤" color="bg-blue-100" />
          <StatCard title="Fraud Alerts" value="5" icon="⚠️" color="bg-red-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Monthly Transactions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Deposits" stroke="#2563EB" strokeWidth={2} />
                <Line type="monotone" dataKey="Withdrawals" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Customer Regions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
