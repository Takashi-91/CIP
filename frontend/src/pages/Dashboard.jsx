import StatCard from "../components/StatCard";
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
  { name: "America", value: 400, color: "#0088FE" },
  { name: "Asia", value: 500, color: "#00C49F" },
  { name: "Europe", value: 300, color: "#FFBB28" },
  { name: "Africa", value: 200, color: "#FF8042" },
];

const lineData = [
  { name: "Jan", TeamA: 30, TeamB: 20, TeamC: 40 },
  { name: "Feb", TeamA: 45, TeamB: 25, TeamC: 55 },
  { name: "Mar", TeamA: 32, TeamB: 40, TeamC: 60 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md p-4 fixed w-full z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">My Dashboard</h1>
          <ul className="flex space-x-4">
            <li><a href="#" className="text-blue-600 hover:underline">Home</a></li>
            <li><a href="#" className="text-blue-600 hover:underline">Reports</a></li>
            <li><a href="#" className="text-blue-600 hover:underline">Settings</a></li>
          </ul>
        </div>
      </nav>

      <div className="ml-64 p-10 pt-24">
        <h1 className="text-2xl font-semibold mb-6">Hi, Welcome back</h1>

        <div className="grid grid-cols-4 gap-6 mb-10">
          <StatCard title="Weekly Sales" value="714k" icon="🤖" color="bg-blue-100" />
          <StatCard title="New Users" value="1.35m" icon="🍎" color="bg-sky-100" />
          <StatCard title="Item Orders" value="1.72m" icon="🪟" color="bg-yellow-100" />
          <StatCard title="Bug Reports" value="234" icon="🐞" color="bg-rose-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md p-4">
            <h2 className="text-lg font-medium mb-2">Website Visits</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="TeamA" stroke="#8884d8" />
                <Line type="monotone" dataKey="TeamB" stroke="#82ca9d" />
                <Line type="monotone" dataKey="TeamC" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow-md p-4">
            <h2 className="text-lg font-medium mb-2">Current Visits</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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
