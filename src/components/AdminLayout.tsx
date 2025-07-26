// src/components/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { AppUser } from '../interfaces';

interface AdminLayoutProps {
  user: AppUser;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user }) => {
  return (
    <div className="admin-layout">
      <AdminNavbar user={user} />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
