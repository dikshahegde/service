import React from 'react';
import { useParams } from 'react-router-dom';

const CafeDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cafe Details</h1>
        <div className="text-center py-12">
          <p className="text-gray-600">Cafe detail page for ID: {id}</p>
          <p className="text-gray-600">Full functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default CafeDetail;