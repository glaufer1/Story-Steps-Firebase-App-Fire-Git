import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = async () => {
    const auth = getAuth();
    const db = getFirestore();
    setError('');

    try {
      if (isRegistering) {
        // Register a new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Assign 'Customer' role to the new user
        await setDoc(doc(db, "users", user.uid), {
          role: 'Customer',
          email: user.email
        });
      } else {
        // Log in an existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      setError(`Failed to ${isRegistering ? 'register' : 'login'}. ${error.message}`);
    }
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth);
  };

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
