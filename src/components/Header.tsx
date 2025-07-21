import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/story-steps-app-fire.appspot.com/o/Backend%20Logo.png?alt=media&token=df18ab90-e927-428f-90cd-9d0269f403c6';

  return (
    <header className="app-header">
      <img src={logoUrl} alt="Story Steps Logo" className="app-logo" />
    </header>
  );
};

export default Header;
