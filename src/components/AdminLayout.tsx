// src/components/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
