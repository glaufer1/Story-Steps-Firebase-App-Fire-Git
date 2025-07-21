import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, type AuthError } from 'firebase/auth';
import './Login.css';
import { auth } from './firebaseConfig';
import type { AppUser } from './interfaces';

interface LoginProps {
  user: AppUser | null;
}

const Login: React.FC<LoginProps> = ({ user }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = async () => {
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
        const authError = err as AuthError;
        setError(`Failed to ${isRegistering ? 'register' : 'login'}. ${authError.message}`);
    }
  };

  if (user) {
    const targetPath = (user.role === 'Admin' || user.role === 'Creator') ? '/admin' : '/home';
    return <Navigate to={targetPath} replace />;
  }

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuthAction}>
        {isRegistering ? 'Register' : 'Login'}
      </button>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Have an account? Login' : 'Need an account? Register'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
