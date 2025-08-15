import React from 'react';
import { useParams } from 'react-router-dom';

const EditCafe = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Cafe</h1>
        <div className="card">
          <p className="text-gray-600">Editing cafe with ID: {id}</p>
          <p className="text-gray-600">Cafe editing form coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default EditCafe;