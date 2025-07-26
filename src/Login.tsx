import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, type AuthError } from 'firebase/auth';
import './Login.css';
import { auth } from './firebaseConfig';
import type { AppUser } from './interfaces';
import ErrorMessage from './components/ErrorMessage';
import * as yup from 'yup';

interface LoginProps {
  user: AppUser | null;
}

const loginSchema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login: React.FC<LoginProps> = ({ user }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleAuthAction = async () => {
    setError('');
    setValidationErrors([]);

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
    } catch (validationErr) {
      if (validationErr instanceof yup.ValidationError) {
        setValidationErrors(validationErr.errors);
        return;
      }
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
      <button onClick={() => { setIsRegistering(!isRegistering); setError(''); setValidationErrors([]); }}>
        {isRegistering ? 'Have an account? Login' : 'Need an account? Register'}
      </button>
      {validationErrors.map((msg, idx) => <ErrorMessage key={idx} message={msg} />)}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default Login;
