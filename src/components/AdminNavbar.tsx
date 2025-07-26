// src/components/AdminNavbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AppUser } from '../interfaces';
import './AdminNavbar.css';

interface AdminNavbarProps {
  user: AppUser;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ user }) => {
  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        Story Steps Admin
      </div>
      <ul className="admin-nav-links">
        {/* All authenticated users can see these */}
        <li>
          <Link to="/home">Home</Link>
        </li>
        
        {/* Admin and Creator links */}
        {(user.role === 'Admin' || user.role === 'Creator') && (
          <>
            <li>
              <Link to="/admin/tour-creator">Tour Creator</Link>
            </li>
            <li>
              <Link to="/admin/edit-tour">Edit Tours</Link>
            </li>
          </>
        )}

        {/* Admin-only links */}
        {user.role === 'Admin' && (
          <>
            <li>
              <Link to="/admin/user-management">User Management</Link>
            </li>
            <li>
              <Link to="/admin/city-management">City Management</Link>
            </li>
          </>
        )}

        {/* Customer-specific links */}
        {user.role === 'Customer' && (
          <>
            <li>
              <Link to="/my-tours">My Tours</Link>
            </li>
            <li>
              <Link to="/my-profile">My Profile</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default AdminNavbar;
