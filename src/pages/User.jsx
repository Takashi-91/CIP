import React from 'react';

const User = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <p className="text-lg"><strong>Name:</strong> John Doe</p>
        <p className="text-lg"><strong>Email:</strong> johndoe@example.com</p>
        <p className="text-lg"><strong>Role:</strong> Admin</p>
      </div>
    </div>
  );
};

export default User;