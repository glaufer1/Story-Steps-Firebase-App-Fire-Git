import React, { useState } from 'react';
import type { AppUser } from '../interfaces';
import './Header.css';
import { Link } from 'react-router-dom';

interface HeaderProps {
  user: AppUser | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const isPrivilegedUser = user?.role === 'Admin' || user?.role === 'Creator';

  return (
    <header className="app-header">
      <div className="logo">Story Steps</div>
      <nav>
        <button className="menu-toggle" onClick={toggleMenu}>
          &#9776; {/* Hamburger Icon */}
        </button>
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/cities">Cities</Link></li>
          <li><Link to="/tours">Tours</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/blog">Blog</Link></li>
          {isPrivilegedUser && (
            <li><Link to="/admin" className="admin-link">Admin</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
