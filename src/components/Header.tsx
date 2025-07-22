import React from 'react';
import './Header.css';
import logo from '../assets/logo.svg';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <img src={logo} alt="Story Steps Logo" className="app-logo" />
    </header>
  );
};

export default Header;
