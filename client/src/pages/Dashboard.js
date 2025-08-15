import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome, {user?.name}!
        </h1>
        <div className="card">
          <p className="text-gray-600 mb-4">Role: {user?.role}</p>
          <p className="text-gray-600">Dashboard functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;