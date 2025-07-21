// src/pages/UserManagementPage.tsx
import React from 'react';
import UserManagement from '../components/UserManagement';
import './PageStyles.css';

const UserManagementPage: React.FC = () => {
  return (
    <div className="page-container">
      <h2>User Management</h2>
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;
