import React from 'react';
import { Link } from 'react-router-dom';
import './pages/PageStyles.css';

const AdminPage: React.FC = () => {
  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1>Welcome to the Backend</h1>
        <p>Use the navigation bar above to manage tours, users, and other site content.</p>
      </div>
      <div className="admin-content">
        <h2>Dashboard</h2>
        <p>This is your main dashboard. More features will be added here soon.</p>
        <Link to="/admin/tour-creator" className="admin-button">
          Create New Tour
        </Link>
        <Link to="/admin/city-management" className="admin-button">
          Manage Cities
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;
