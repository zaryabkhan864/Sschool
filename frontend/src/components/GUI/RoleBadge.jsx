// src/components/GUI/RoleBadge.jsx
import React from 'react';

const RoleBadge = ({ role }) => {
  // Define colors for different roles
  const getRoleColor = (role) => {
    const roleLower = role?.toLowerCase() || '';
    switch (roleLower) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'finance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'counsellor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`capitalize px-2 py-1 rounded text-xs font-medium border inline-block ${getRoleColor(role)}`}>
      {role || 'N/A'}
    </span>
  );
};

export default RoleBadge;