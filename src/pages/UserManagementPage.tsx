// src/pages/UserManagementPage.tsx
import React from 'react';
import UserManagement from '../components/UserManagement';
import GlobalHeader from '../components/GlobalHeader';
import { AppUser } from '../interfaces';
import './PageStyles.css';

interface UserManagementPageProps {
  user: AppUser;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ user }) => {
  return (
    <div className="back-office-page">
      <GlobalHeader user={user} />
      <div className="back-office-content">
        <UserManagement currentUser={user} />
      </div>
    </div>
  );
};

export default UserManagementPage;
