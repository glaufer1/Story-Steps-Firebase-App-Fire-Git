import React from 'react';
import CityManagement from '../components/CityManagement';
import './PageStyles.css';

const CityManagementPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1>City Management</h1>
      <CityManagement />
    </div>
  );
};

export default CityManagementPage;
