// src/components/AdminNavbar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminNavbar.css';

const AdminNavbar: React.FC = () => {
  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">Tour Creator Backend</div>
      <ul className="admin-navbar-links">
        <li><NavLink to="/admin/tour-creator" className={({ isActive }) => isActive ? 'active' : ''}>Create Tour</NavLink></li>
        <li><NavLink to="/admin/edit-tour" className={({ isActive }) => isActive ? 'active' : ''}>Edit Tour</NavLink></li>
        <li><NavLink to="/cities" className={({ isActive }) => isActive ? 'active' : ''}>Cities</NavLink></li>
        <li><NavLink to="/tours" className={({ isActive }) => isActive ? 'active' : ''}>Pre-Purchase</NavLink></li>
        <li><NavLink to="/tours" className={({ isActive }) => isActive ? 'active' : ''}>Post-Purchase</NavLink></li>
        <li><NavLink to="/collections" className={({ isActive }) => isActive ? 'active' : ''}>Stop Collections</NavLink></li>
        <li><NavLink to="/stops" className={({ isActive }) => isActive ? 'active' : ''}>Stop Details</NavLink></li>
        <li><NavLink to="/admin/user-management" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink></li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
