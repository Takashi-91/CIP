import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/employees/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const createUser = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/employees/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUser({ name: '', email: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const toggleFreezeUser = async (userId, freeze) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/employees/users/${userId}/freeze`, { freeze }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">User Management</h3>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="mb-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newUser.name}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        />
        <select
          name="role"
          value={newUser.role}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={createUser}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create User
        </button>
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
                <td className="border px-4 py-2">{user.isFrozen ? 'Frozen' : 'Active'}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => toggleFreezeUser(user._id, !user.isFrozen)}
                    className={`px-3 py-1 rounded text-white ${
                      user.isFrozen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {user.isFrozen ? 'Unfreeze' : 'Freeze'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
