import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">
          <img src="/logo.png" alt="Story Steps Logo" />
          <span>Story Steps</span>
        </div>
        <nav>
          <Link to="/login" className="landing-login-button">Login</Link>
        </nav>
      </header>
      <main className="landing-main">
        <div className="landing-content">
          <h1>Welcome to Story Steps</h1>
          <p>Create and explore immersive, location-based audio tours.</p>
          <div className="cta-buttons">
            <Link to="/tours" className="cta-link">Get Started</Link>
            <Link to="/login" className="cta-link-secondary">Sign In</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
